import { Lead } from '@/types'

export async function sendEmailAlert(to: string, lead: Lead): Promise<boolean> {
  const platformColors: Record<string, string> = {
    facebook: '#1877f2',
    linkedin: '#0a66c2',
    useme: '#ff6b35',
    other: '#2e6cff',
  }

  const color = platformColors[lead.platform] || '#2e6cff'

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Lead Found - LeadHunter</title>
</head>
<body style="margin:0;padding:0;background:#0b0f1a;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="background:#141a2b;border:1px solid #1f2a44;border-radius:16px;overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1f2a44,#141a2b);padding:32px;border-bottom:1px solid #1f2a44;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;background:#2e6cff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;">🎯</div>
          <div>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">New Lead Found!</h1>
            <p style="margin:4px 0 0;color:#5aa2ff;font-size:13px;">LeadHunter Alert</p>
          </div>
        </div>
      </div>
      
      <!-- Content -->
      <div style="padding:32px;">
        <!-- Platform badge -->
        <div style="margin-bottom:20px;">
          <span style="background:${color}22;color:${color};padding:6px 14px;border-radius:100px;font-size:12px;font-weight:600;letter-spacing:0.05em;border:1px solid ${color}44;">
            ${lead.platform.toUpperCase()}
          </span>
        </div>

        <!-- Score -->
        <div style="background:#0b0f1a;border:1px solid #1f2a44;border-radius:12px;padding:16px;margin-bottom:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="color:#8892a4;font-size:13px;">Lead Score</span>
            <span style="color:#fff;font-weight:700;font-size:18px;">${lead.score}/100</span>
          </div>
          <div style="background:#1f2a44;border-radius:100px;height:8px;overflow:hidden;">
            <div style="background:linear-gradient(90deg,#2e6cff,#5aa2ff);width:${lead.score}%;height:100%;border-radius:100px;"></div>
          </div>
        </div>

        <!-- Group -->
        <div style="margin-bottom:16px;">
          <p style="margin:0 0 4px;color:#8892a4;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Group / Source</p>
          <p style="margin:0;color:#fff;font-size:15px;font-weight:500;">${lead.group_name}</p>
        </div>

        <!-- Post text -->
        <div style="background:#0b0f1a;border-left:3px solid #2e6cff;border-radius:0 8px 8px 0;padding:16px;margin-bottom:24px;">
          <p style="margin:0 0 8px;color:#8892a4;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;">Post Content</p>
          <p style="margin:0;color:#d1d9e6;font-size:14px;line-height:1.6;">${lead.post_text.slice(0, 400)}${lead.post_text.length > 400 ? '...' : ''}</p>
        </div>

        <!-- CTA -->
        <a href="${lead.post_link}" style="display:block;background:linear-gradient(135deg,#2e6cff,#5aa2ff);color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px;text-align:center;margin-bottom:20px;">
          View Lead & Respond →
        </a>

        <!-- Meta -->
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          ${lead.keyword_matched ? `<div style="color:#8892a4;font-size:12px;">🔍 Keyword: <span style="color:#5aa2ff;">${lead.keyword_matched}</span></div>` : ''}
          <div style="color:#8892a4;font-size:12px;">🕐 Found: <span style="color:#d1d9e6;">${new Date(lead.date_found).toLocaleString()}</span></div>
        </div>
      </div>

      <!-- Footer -->
      <div style="padding:20px 32px;border-top:1px solid #1f2a44;background:#0b0f1a;">
        <p style="margin:0;color:#4a5568;font-size:12px;text-align:center;">
          You received this because you have email alerts enabled in LeadHunter.<br>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#2e6cff;text-decoration:none;">Manage notifications</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'alerts@leadhunter.app',
      to,
      subject: `🎯 New Lead Found on ${lead.platform} — Score: ${lead.score}/100`,
      html,
    })

    return !error
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}
