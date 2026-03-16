'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lead, Platform, LeadStatus } from '@/types'
import { platformConfig, statusConfig, formatDate, truncateText, getScoreColor, cn } from '@/lib/utils'
import { Crosshair, Filter, ExternalLink, MessageSquare, ChevronDown, Search, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES: LeadStatus[] = ['new', 'contacted', 'negotiation', 'won', 'lost']
const PLATFORMS: Platform[] = ['facebook', 'linkedin', 'useme', 'freelancer', 'upwork', 'twitter', 'reddit', 'other']

export default function LeadsPage() {
  const supabase = createClient()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selected, setSelected] = useState<Lead | null>(null)
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => { fetchLeads() }, [])

  async function fetchLeads() {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  async function updateStatus(leadId: string, status: LeadStatus) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', leadId)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l))
      if (selected?.id === leadId) setSelected(prev => prev ? { ...prev, status } : null)
      toast.success('Status updated')
    }
  }

  async function saveNotes(leadId: string) {
    const { error } = await supabase.from('leads').update({ notes }).eq('id', leadId)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, notes } : l))
      toast.success('Notes saved')
    }
  }

  async function generateMessage() {
    if (!selected) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadText: selected.post_text }),
      })
      const data = await res.json()
      setAiMessage(data.message || '')
    } catch {
      toast.error('Failed to generate message')
    }
    setAiLoading(false)
  }

  const filtered = leads.filter(l => {
    const matchSearch = search === '' || l.post_text.toLowerCase().includes(search.toLowerCase()) || l.group_name.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = filterPlatform === 'all' || l.platform === filterPlatform
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    return matchSearch && matchPlatform && matchStatus
  })

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Leads</h1>
          <p className="text-gray-500 text-sm">{leads.length} total leads found</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="input-base pl-8 py-2 text-sm"
          />
        </div>
        <select
          value={filterPlatform}
          onChange={e => setFilterPlatform(e.target.value)}
          className="input-base w-auto py-2 text-sm"
        >
          <option value="all">All Platforms</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{platformConfig[p].label}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="input-base w-auto py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
        </select>
        <div className="flex items-center gap-2 text-sm text-gray-500 ml-auto">
          <Filter size={14} />
          {filtered.length} results
        </div>
      </div>

      <div className="flex gap-6">
        {/* Table */}
        <div className={cn('bg-bg-secondary border border-border-default rounded-2xl overflow-hidden flex-1', selected ? 'hidden lg:block' : '')}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Crosshair size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No leads found</p>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border-default">
                    {['Platform', 'Lead Text', 'Score', 'Status', 'Found', ''].map((h, i) => (
                      <th key={i} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filtered.map(lead => {
                    const pCfg = platformConfig[lead.platform] || platformConfig.other
                    const sCfg = statusConfig[lead.status] || statusConfig.new
                    return (
                      <tr
                        key={lead.id}
                        className={cn(
                          'hover:bg-bg-tertiary/50 cursor-pointer transition-colors',
                          selected?.id === lead.id && 'bg-accent-blue/5 border-l-2 border-l-accent-blue'
                        )}
                        onClick={() => { setSelected(lead); setNotes(lead.notes || ''); setAiMessage('') }}
                      >
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: pCfg.bg, color: pCfg.color }}>
                            {pCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          <p className="text-sm text-white truncate">{truncateText(lead.post_text, 60)}</p>
                          <p className="text-xs text-gray-600 mt-0.5">{lead.group_name}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-sm" style={{ color: getScoreColor(lead.score) }}>
                            {lead.score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: sCfg.bg, color: sCfg.color }}>
                            {sCfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(lead.date_found)}
                        </td>
                        <td className="px-4 py-3">
                          <a href={lead.post_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="text-gray-600 hover:text-accent-light transition-colors">
                            <ExternalLink size={14} />
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 bg-bg-secondary border border-border-default rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
              <h3 className="font-semibold text-white text-sm">Lead Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-600 hover:text-white text-xs">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Platform & Score */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: (platformConfig[selected.platform] || platformConfig.other).bg, color: (platformConfig[selected.platform] || platformConfig.other).color }}>
                  {(platformConfig[selected.platform] || platformConfig.other).label}
                </span>
                <span className="text-sm font-bold" style={{ color: getScoreColor(selected.score) }}>Score: {selected.score}/100</span>
              </div>

              {/* Post text */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Post Content</p>
                <div className="bg-bg-tertiary rounded-xl p-3 border-l-2 border-accent-blue">
                  <p className="text-sm text-gray-300 leading-relaxed">{selected.post_text}</p>
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Group</p>
                  <p className="text-gray-300 text-xs">{selected.group_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Found</p>
                  <p className="text-gray-300 text-xs">{formatDate(selected.date_found)}</p>
                </div>
                {selected.keyword_matched && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-600 mb-0.5">Matched Keyword</p>
                    <span className="text-xs bg-accent-blue/15 text-accent-light px-2 py-0.5 rounded">{selected.keyword_matched}</span>
                  </div>
                )}
              </div>

              {/* Status CRM */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Status</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {STATUSES.map(s => {
                    const cfg = statusConfig[s]
                    const active = selected.status === s
                    return (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className="py-1.5 rounded-lg text-xs font-medium transition-all border"
                        style={{
                          background: active ? cfg.bg : 'transparent',
                          color: active ? cfg.color : '#4a5568',
                          borderColor: active ? cfg.color + '44' : '#1f2a44',
                        }}
                      >
                        {cfg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Notes</p>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  rows={3}
                  className="input-base text-sm resize-none"
                />
                <button onClick={() => saveNotes(selected.id)} className="btn-secondary text-xs mt-2 py-1.5">
                  Save Notes
                </button>
              </div>

              {/* AI Message */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">AI Outreach Message</p>
                <button onClick={generateMessage} disabled={aiLoading} className="btn-primary w-full justify-center py-2 text-sm mb-3">
                  {aiLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MessageSquare size={14} />}
                  {aiLoading ? 'Generating...' : 'Generate Message'}
                </button>
                {aiMessage && (
                  <div className="bg-bg-tertiary rounded-xl p-3 border border-border-default">
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{aiMessage}</p>
                    <button onClick={() => { navigator.clipboard.writeText(aiMessage); toast.success('Copied!') }} className="text-xs text-accent-light hover:text-blue-300 mt-2 transition-colors">
                      Copy to clipboard
                    </button>
                  </div>
                )}
              </div>

              {/* Link */}
              <a href={selected.post_link} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center text-sm">
                <ExternalLink size={14} />
                Open Original Post
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
