import { Lead } from '@/types'

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegramAlert(chatId: string, lead: Lead): Promise<boolean> {
  const platformEmoji: Record<string, string> = {
    facebook: '📘',
    linkedin: '💼',
    useme: '🔧',
    freelancer: '🌐',
    upwork: '⬆️',
    twitter: '🐦',
    reddit: '🤖',
    other: '📌',
  }

  const emoji = platformEmoji[lead.platform] || '📌'
  const scoreBar = '█'.repeat(Math.floor(lead.score / 10)) + '░'.repeat(10 - Math.floor(lead.score / 10))

  const message = `🚨 *NEW LEAD FOUND*

${emoji} *Platform:* ${lead.platform.charAt(0).toUpperCase() + lead.platform.slice(1)}
📂 *Group:* ${lead.group_name}

💬 *Post:*
_${lead.post_text.slice(0, 280)}${lead.post_text.length > 280 ? '...' : ''}_

📊 *Score:* ${lead.score}/100
${scoreBar}

🔗 [View Post](${lead.post_link})

⚡ _Matched keyword: ${lead.keyword_matched || 'N/A'}_
🕐 _Found: ${new Date(lead.date_found).toLocaleString()}_`

  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    })

    const data = await response.json()
    return data.ok === true
  } catch (error) {
    console.error('Telegram send error:', error)
    return false
  }
}

export async function sendTelegramMessage(chatId: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    })
    const data = await response.json()
    return data.ok === true
  } catch {
    return false
  }
}

export async function getTelegramUpdates() {
  try {
    const response = await fetch(`${TELEGRAM_API}/getUpdates`)
    const data = await response.json()
    return data.result || []
  } catch {
    return []
  }
}
