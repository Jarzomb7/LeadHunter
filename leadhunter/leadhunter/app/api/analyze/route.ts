import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateWebsiteRecommendations } from '@/lib/ai'
import { WebsiteAnalysis } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  let normalizedUrl = url.trim()
  if (!normalizedUrl.startsWith('http')) normalizedUrl = `https://${normalizedUrl}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LeadHunterBot/1.0)' },
    })
    clearTimeout(timeout)

    const html = await response.text()
    const issues: string[] = []

    // Analyze HTML
    const hasTitle = /<title[^>]*>[^<]+<\/title>/i.test(html)
    const hasMetaDesc = /meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i.test(html)
    const hasViewport = /meta[^>]+name=["']viewport["']/i.test(html)
    const hasPrivacyLink = /privacy.policy|polityka.prywatno|datenschutz/i.test(html)
    const hasCookieBanner = /cookie|ciasteczk|gdpr|rodo/i.test(html)
    const hasOpenGraph = /property=["']og:/i.test(html)
    const hasSchema = /application\/ld\+json/i.test(html)
    const hasSSL = normalizedUrl.startsWith('https://')

    if (!hasTitle) issues.push('Missing page title tag')
    if (!hasMetaDesc) issues.push('Missing meta description')
    if (!hasViewport) issues.push('Missing viewport meta tag (not mobile-friendly)')
    if (!hasPrivacyLink) issues.push('No privacy policy link detected')
    if (!hasCookieBanner) issues.push('No cookie consent banner detected')
    if (!hasOpenGraph) issues.push('Missing Open Graph meta tags')
    if (!hasSchema) issues.push('No structured data (Schema.org)')
    if (!hasSSL) issues.push('Not using HTTPS')

    // Simple speed score estimate
    const sizeKB = html.length / 1024
    let speedScore = 100
    if (sizeKB > 500) speedScore -= 20
    if (sizeKB > 1000) speedScore -= 20
    if (!hasSchema) speedScore -= 5
    if (!hasOpenGraph) speedScore -= 5
    speedScore = Math.max(speedScore - issues.length * 3, 20)

    const overallScore = Math.max(100 - issues.length * 12, 10)

    const recommendations = await generateWebsiteRecommendations(issues)

    const analysis: WebsiteAnalysis = {
      url: normalizedUrl,
      mobile_responsive: hasViewport,
      has_meta_title: hasTitle,
      has_meta_description: hasMetaDesc,
      has_privacy_policy: hasPrivacyLink,
      has_cookie_banner: hasCookieBanner,
      page_speed_score: speedScore,
      issues,
      recommendations,
      score: overallScore,
    }

    return NextResponse.json(analysis)
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout — website took too long to respond' }, { status: 408 })
    }
    return NextResponse.json({ error: `Could not fetch website: ${error.message}` }, { status: 400 })
  }
}
