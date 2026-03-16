import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOutreachMessage } from '@/lib/ai'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { leadText, profession } = await request.json()
  if (!leadText) return NextResponse.json({ error: 'Lead text required' }, { status: 400 })

  try {
    const message = await generateOutreachMessage(leadText, profession)
    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
