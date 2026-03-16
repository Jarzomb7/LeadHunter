import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function generateOutreachMessage(leadText: string, userProfession?: string): Promise<string> {
  const profession = userProfession || 'freelancer'

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert at writing personalized, professional outreach messages for freelancers. 
Write concise, friendly, and compelling messages that:
- Address the specific need mentioned in the post
- Highlight relevant expertise
- Include a clear call to action
- Are NOT generic or salesy
- Are between 80-150 words
- Feel human and genuine
Respond only with the message text, no quotes or extra formatting.`,
      },
      {
        role: 'user',
        content: `Write a personalized outreach message for this lead. I am a ${profession}.

Lead post:
"${leadText}"

Write the outreach message:`,
      },
    ],
    max_tokens: 300,
    temperature: 0.7,
  })

  return completion.choices[0].message.content || ''
}

export async function generateProposal(params: {
  clientDescription: string
  projectScope: string
  timeline: string
  price: string
  freelancerName?: string
}): Promise<string> {
  const { clientDescription, projectScope, timeline, price, freelancerName } = params

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an expert business proposal writer for freelancers and agencies.
Create professional, structured proposals in Markdown format that include:
- Executive Summary
- Understanding of Client Needs
- Proposed Solution
- Scope of Work
- Timeline & Milestones
- Investment (pricing)
- Why Choose Us
- Next Steps
Make it compelling, specific, and professional. Use ## for section headers.`,
      },
      {
        role: 'user',
        content: `Create a project proposal with these details:

Client Description: ${clientDescription}
Project Scope: ${projectScope}
Timeline: ${timeline}
Price/Budget: ${price}
${freelancerName ? `Freelancer/Company Name: ${freelancerName}` : ''}

Generate the complete proposal:`,
      },
    ],
    max_tokens: 1500,
    temperature: 0.6,
  })

  return completion.choices[0].message.content || ''
}

export async function analyzeLeadScore(postText: string, keywords: string[]): Promise<number> {
  const keywordMatches = keywords.filter(kw =>
    postText.toLowerCase().includes(kw.toLowerCase())
  ).length

  const baseScore = Math.min(keywordMatches * 20, 60)

  // Check for buying intent signals
  const highIntent = ['szukam', 'potrzebuję', 'hiring', 'looking for', 'need', 'want to hire', 'budget', 'urgent', 'asap', 'immediately']
  const medIntent = ['interested', 'considering', 'planning', 'thinking about', 'anyone recommend']

  let intentScore = 0
  const textLower = postText.toLowerCase()

  highIntent.forEach(signal => { if (textLower.includes(signal)) intentScore += 8 })
  medIntent.forEach(signal => { if (textLower.includes(signal)) intentScore += 4 })

  const budgetMentioned = /\d+\s*(zł|pln|usd|eur|\$|€)/i.test(postText)
  if (budgetMentioned) intentScore += 15

  return Math.min(baseScore + intentScore, 100)
}

export async function generateWebsiteRecommendations(issues: string[]): Promise<string[]> {
  if (issues.length === 0) return []

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a web performance and SEO expert. Give concise, actionable recommendations. Return as JSON array of strings.',
      },
      {
        role: 'user',
        content: `Website has these issues: ${issues.join(', ')}. Give 3-5 specific actionable recommendations as a JSON array.`,
      },
    ],
    max_tokens: 400,
    temperature: 0.5,
  })

  try {
    const content = completion.choices[0].message.content || '[]'
    const clean = content.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return issues.map(issue => `Fix: ${issue}`)
  }
}
