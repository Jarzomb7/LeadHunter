'use client'

import { useState } from 'react'
import { Search, CheckCircle, XCircle, AlertCircle, Globe, Zap, Shield, Smartphone } from 'lucide-react'
import { WebsiteAnalysis } from '@/types'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function AnalyzerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WebsiteAnalysis | null>(null)

  async function analyze(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err: any) {
      toast.error(err.message || 'Analysis failed')
    }
    setLoading(false)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const Check = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={cn('flex items-center gap-3 p-3 rounded-xl border', ok ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20')}>
      {ok ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> : <XCircle size={16} className="text-red-500 flex-shrink-0" />}
      <span className={cn('text-sm', ok ? 'text-gray-300' : 'text-gray-400')}>{label}</span>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Website Analyzer</h1>
        <p className="text-gray-500 text-sm">Analyze any website for issues — use the report as a conversation opener</p>
      </div>

      {/* Search form */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-5 mb-6">
        <form onSubmit={analyze} className="flex gap-3">
          <div className="relative flex-1">
            <Globe size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://example.com"
              type="url"
              className="input-base pl-9"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary px-6">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={15} />}
            Analyze
          </button>
        </form>
        <p className="text-xs text-gray-600 mt-2">Checks: mobile responsiveness, meta tags, privacy policy, cookie banner, performance</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-bg-secondary border border-border-default rounded-2xl p-12 text-center">
          <div className="w-10 h-10 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Analyzing website...</p>
          <p className="text-gray-600 text-sm mt-1">Checking performance, SEO, and compliance</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-slide-up">
          {/* Score */}
          <div className="bg-bg-secondary border border-border-default rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-white">Overall Score</h2>
                <p className="text-gray-500 text-sm mt-0.5">{result.url}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold" style={{ color: getScoreColor(result.score) }}>{result.score}</div>
                <div className="text-gray-600 text-xs">/ 100</div>
              </div>
            </div>
            <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${result.score}%`, background: `linear-gradient(90deg, ${getScoreColor(result.score)}, ${getScoreColor(result.score)}88)` }} />
            </div>
          </div>

          {/* Checks grid */}
          <div className="bg-bg-secondary border border-border-default rounded-2xl p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Shield size={16} className="text-accent-blue" />
              Technical Checks
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Check ok={result.mobile_responsive} label="Mobile Responsive" />
              <Check ok={result.has_meta_title} label="Meta Title Present" />
              <Check ok={result.has_meta_description} label="Meta Description" />
              <Check ok={result.has_privacy_policy} label="Privacy Policy" />
              <Check ok={result.has_cookie_banner} label="Cookie Banner" />
              <Check ok={result.page_speed_score >= 60} label={`Page Speed (${result.page_speed_score}/100)`} />
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div className="bg-bg-secondary border border-border-default rounded-2xl p-5">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                Issues Found
              </h2>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                    {issue}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="bg-bg-secondary border border-border-default rounded-2xl p-5">
              <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={16} className="text-yellow-400" />
                Recommendations
              </h2>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 flex-shrink-0 mt-1.5" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA tip */}
          <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Smartphone size={18} className="text-accent-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">Use this as a lead opener!</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Send this report to the website owner as a free audit. Offer to fix the issues — it's a powerful way to start a conversation and get hired.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
