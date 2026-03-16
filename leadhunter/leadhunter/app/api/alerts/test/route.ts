import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTelegramMessage } from '@/lib/notifications/telegram'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { chatId } = await request.json()
  if (!chatId) return NextResponse.json({ error: 'Chat ID required' }, { status: 400 })

  const success = await sendTelegramMessage(
    chatId,
    `✅ *LeadHunter connected!*\n\nYour Telegram alerts are now active\\. You'll receive notifications here whenever a new lead is found\\.\n\n🎯 _LeadHunter_`
  )

  return NextResponse.json({ success })
}
