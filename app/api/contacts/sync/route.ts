import { NextRequest, NextResponse } from 'next/server'
import { PlatformFactory } from '@/lib/platforms'
import { createClient } from '@/lib/supabase/server'
import { syncRequestSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = syncRequestSchema.safeParse(body)
    if (!validation.success) {
        return NextResponse.json({ error: 'Invalid request', details: validation.error.format() }, { status: 400 })
    }
    
    const { platform } = validation.data

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adapter = PlatformFactory.getAdapter(platform)
    const contacts = await adapter.fetchContacts(user.id)

    if (contacts.length > 0) {
        // Upsert using the unique constraint
        const { error } = await supabase.from('contacts').upsert(
            contacts.map(c => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, ...rest } = c
                return rest
            }),
            { onConflict: 'user_id, source_platform, source_id' }
        )
        
        if (error) {
            console.error('Upsert error', error)
            throw error
        }
    }

    await supabase.from('user_platform_connections')
        .update({ last_synced_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('platform', platform)

    return NextResponse.json({ success: true, count: contacts.length })
  } catch (error: unknown) {
    console.error('Sync error', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    // Provide more helpful error messages for common issues
    let status = 500
    if (message.includes('People API is not enabled')) {
      status = 400 // Bad Request - configuration issue
    } else if (message.includes('Not connected')) {
      status = 401 // Unauthorized - not connected
    } else if (message.includes('Insufficient permissions')) {
      status = 403 // Forbidden - permission issue
    }
    
    return NextResponse.json({ error: message }, { status })
  }
}
