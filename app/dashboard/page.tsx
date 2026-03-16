import { createClient } from '@/lib/supabase/server'
import { Target, TrendingUp, Tag, Globe, ArrowUpRight, Zap } from 'lucide-react'
import { formatDate, platformConfig, statusConfig } from '@/lib/utils'
import Link from 'next/link'

async function getDashboardData(userId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const [leadsRes, keywordsRes, groupsRes, recentRes] = await Promise.all([
    supabase.from('leads').select('id, status, platform, date_found, created_at').eq('user_id', userId),
    supabase.from('keywords').select('id').eq('user_id', userId).eq('is_active', true),
    supabase.from('groups').select('id').eq('user_id', userId).eq('is_active', true),
    supabase.from('leads').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
  ])

  const leads = leadsRes.data || []
  const leadsToday = leads.filter(l => l.date_found?.startsWith(today)).length
  const wonLeads = leads.filter(l => l.status === 'won').length
  const conversionRate = leads.length > 0 ? Math.round((wonLeads / leads.length) * 100) : 0

  // Platform distribution
  const platformCounts: Record<string, number> = {}
  leads.forEach(l => {
    platformCounts[l.platform] = (platformCounts[l.platform] || 0) + 1
  })
  const topPlatforms = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([platform, count]) => ({ platform, count }))

  // Weekly leads (last 7 days)
  const weeklyLeads = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    return leads.filter(l => l.date_found?.startsWith(dateStr)).length
  })

  return {
    leadsToday,
    totalLeads: leads.length,
    activeKeywords: keywordsRes.data?.length || 0,
    groupsMonitored: groupsRes.data?.length || 0,
    conversionRate,
    topPlatforms,
    weeklyLeads,
    recentLeads: recentRes.data || [],
  }
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const stats = await getDashboardData(user.id)
  const maxWeekly = Math.max(...stats.weeklyLeads, 1)

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <Link href="/leads" className="btn-primary">
          <Zap size={15} />
          View All Leads
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Leads Today', value: stats.leadsToday, icon: Target, color: '#2e6cff', change: '+12%' },
          { label: 'Total Leads', value: stats.totalLeads, icon: TrendingUp, color: '#22c55e', change: '+8%' },
          { label: 'Active Keywords', value: stats.activeKeywords, icon: Tag, color: '#f59e0b', change: null },
          { label: 'Groups Monitored', value: stats.groupsMonitored, icon: Globe, color: '#a855f7', change: null },
        ].map((stat, i) => (
          <div key={i} className="bg-bg-secondary border border-border-default rounded-2xl p-5 card-hover">
            <div className="flex items-center justify-between mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.color + '22' }}>
                <stat.icon size={18} style={{ color: stat.color }} />
              </div>
              {stat.change && (
                <span className="text-xs text-green-400 flex items-center gap-0.5">
                  <ArrowUpRight size={12} /> {stat.change}
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-gray-500 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weekly chart */}
        <div className="lg:col-span-2 bg-bg-secondary border border-border-default rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-white">Leads This Week</h2>
              <p className="text-gray-500 text-sm mt-0.5">Daily lead discovery</p>
            </div>
            <span className="text-2xl font-bold text-white">{stats.weeklyLeads.reduce((a, b) => a + b, 0)}</span>
          </div>
          <div className="flex items-end gap-2 h-32">
            {stats.weeklyLeads.map((count, i) => {
              const height = maxWeekly > 0 ? (count / maxWeekly) * 100 : 0
              const isToday = i === 6
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-600">{count > 0 ? count : ''}</span>
                  <div className="w-full rounded-t-lg transition-all duration-500" style={{
                    height: `${Math.max(height, 4)}%`,
                    background: isToday ? 'linear-gradient(to top, #2e6cff, #5aa2ff)' : '#1f2a44',
                    minHeight: '4px',
                  }} />
                  <span className="text-xs text-gray-600">{days[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Platforms */}
        <div className="bg-bg-secondary border border-border-default rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-1">Top Platforms</h2>
          <p className="text-gray-500 text-sm mb-5">Lead distribution</p>
          {stats.topPlatforms.length === 0 ? (
            <div className="text-center py-8">
              <Globe size={32} className="text-gray-700 mx-auto mb-2" />
              <p className="text-gray-600 text-sm">No data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topPlatforms.map(({ platform, count }) => {
                const cfg = platformConfig[platform as keyof typeof platformConfig] || platformConfig.other
                const pct = stats.totalLeads > 0 ? Math.round((count / stats.totalLeads) * 100) : 0
                return (
                  <div key={platform}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
                      <span className="text-xs text-gray-500">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: cfg.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-5 pt-5 border-t border-border-default">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Conversion Rate</span>
              <span className="text-sm font-semibold text-green-400">{stats.conversionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h2 className="font-semibold text-white">Recent Leads</h2>
          <Link href="/leads" className="text-accent-light hover:text-blue-300 text-sm transition-colors">
            View all →
          </Link>
        </div>
        {stats.recentLeads.length === 0 ? (
          <div className="text-center py-16">
            <Target size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No leads yet</p>
            <p className="text-gray-600 text-sm mt-1">Add keywords and groups to start finding leads</p>
            <Link href="/keywords" className="btn-primary mt-4 inline-flex">Add Keywords</Link>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {stats.recentLeads.map((lead: any) => {
              const pCfg = platformConfig[lead.platform as keyof typeof platformConfig] || platformConfig.other
              const sCfg = statusConfig[lead.status as keyof typeof statusConfig] || statusConfig.new
              return (
                <div key={lead.id} className="px-6 py-4 flex items-center gap-4 hover:bg-bg-tertiary/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: pCfg.bg, color: pCfg.color }}>
                    {lead.platform.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{lead.post_text}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{lead.group_name} · {formatDate(lead.date_found)}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold" style={{ color: lead.score >= 70 ? '#22c55e' : lead.score >= 40 ? '#f59e0b' : '#8892a4' }}>
                      {lead.score}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: sCfg.bg, color: sCfg.color }}>
                      {sCfg.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
