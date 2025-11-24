import { NextRequest, NextResponse } from 'next/server'
import { PlatformFactory } from '@/lib/platforms'
import { createClient } from '@/lib/supabase/server'
import { disconnectRequestSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = disconnectRequestSchema.safeParse(body)
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
    await adapter.disconnect(user.id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
