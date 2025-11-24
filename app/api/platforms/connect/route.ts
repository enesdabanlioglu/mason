import { NextRequest, NextResponse } from 'next/server'
import { PlatformFactory } from '@/lib/platforms'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const platform = searchParams.get('platform')

  if (!platform) {
    return NextResponse.json({ error: 'Platform required' }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adapter = PlatformFactory.getAdapter(platform)
    const url = adapter.getAuthUrl()

    return NextResponse.redirect(url)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
