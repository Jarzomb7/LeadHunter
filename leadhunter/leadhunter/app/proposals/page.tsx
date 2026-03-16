'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Plus, Wand2, Copy, Trash2, ChevronDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Proposal {
  id: string
  client_description: string
  project_scope: string
  timeline: string
  price: string
  content: string
  created_at: string
}

export default function ProposalsPage() {
  const supabase = createClient()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState<Proposal | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_description: '', project_scope: '', timeline: '', price: '' })

  useEffect(() => { fetchProposals() }, [])

  async function fetchProposals() {
    const { data } = await supabase.from('proposals').select('*').order('created_at', { ascending: false })
    setProposals(data || [])
    setLoading(false)
  }

  async function generateProposal(e: React.FormEvent) {
    e.preventDefault()
    setGenerating(true)
    try {
      const res = await fetch('/api/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Save to DB
      const { data: saved, error } = await supabase.from('proposals').insert({
        ...form,
        content: data.content,
      }).select().single()

      if (error) throw error
      setProposals(prev => [saved, ...prev])
      setSelected(saved)
      setShowForm(false)
      toast.success('Proposal generated!')
    } catch (err: any) {
      toast.error(err.message || 'Generation failed')
    }
    setGenerating(false)
  }

  async function deleteProposal(id: string) {
    await supabase.from('proposals').delete().eq('id', id)
    setProposals(prev => prev.filter(p => p.id !== id))
    if (selected?.id === id) setSelected(null)
    toast.success('Deleted')
  }

  // Simple markdown-to-html renderer
  function renderMarkdown(text: string) {
    return text
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-white mt-6 mb-2">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-gray-200 mt-4 mb-1">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
      .replace(/^- (.+)$/gm, '<li class="text-gray-400 text-sm ml-4 list-disc">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="text-gray-400 text-sm ml-4 list-decimal">$2</li>')
      .replace(/\n\n/g, '</p><p class="text-gray-400 text-sm leading-relaxed mt-2">')
      .replace(/^(?!<[h|l])(.+)$/gm, '<p class="text-gray-400 text-sm leading-relaxed">$1</p>')
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Proposals</h1>
          <p className="text-gray-500 text-sm">AI-generated project proposals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={15} />
          New Proposal
        </button>
      </div>

      {/* Generate form */}
      {showForm && (
        <div className="bg-bg-secondary border border-border-default rounded-2xl p-6 mb-6 animate-slide-up">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Wand2 size={16} className="text-accent-blue" />
            Generate Proposal with AI
          </h2>
          <form onSubmit={generateProposal} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Client Description</label>
              <textarea
                value={form.client_description}
                onChange={e => setForm(p => ({ ...p, client_description: e.target.value }))}
                placeholder="e.g. Small restaurant looking for a website with online ordering"
                className="input-base text-sm resize-none"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Project Scope</label>
              <textarea
                value={form.project_scope}
                onChange={e => setForm(p => ({ ...p, project_scope: e.target.value }))}
                placeholder="e.g. 5-page website, mobile responsive, contact form, SEO basics"
                className="input-base text-sm resize-none"
                rows={3}
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Timeline</label>
              <input
                value={form.timeline}
                onChange={e => setForm(p => ({ ...p, timeline: e.target.value }))}
                placeholder="e.g. 2-3 weeks"
                className="input-base text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Price / Budget</label>
              <input
                value={form.price}
                onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                placeholder="e.g. $1,500 or 2000 PLN"
                className="input-base text-sm"
                required
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={generating} className="btn-primary">
                {generating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Wand2 size={15} />}
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex gap-6">
        {/* Proposals list */}
        <div className="w-72 flex-shrink-0 space-y-2">
          {loading ? (
            <div className="text-center py-8"><div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : proposals.length === 0 ? (
            <div className="bg-bg-secondary border border-border-default rounded-2xl p-8 text-center">
              <FileText size={32} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No proposals yet</p>
            </div>
          ) : (
            proposals.map(p => (
              <div
                key={p.id}
                onClick={() => setSelected(p)}
                className={`bg-bg-secondary border rounded-xl p-4 cursor-pointer transition-all ${selected?.id === p.id ? 'border-accent-blue/40 bg-accent-blue/5' : 'border-border-default hover:border-gray-600'}`}
              >
                <p className="text-sm text-white font-medium truncate">{p.client_description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-600">{formatDate(p.created_at)}</span>
                  <span className="text-xs text-green-400 font-medium">{p.price}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Proposal detail */}
        {selected ? (
          <div className="flex-1 bg-bg-secondary border border-border-default rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
              <div>
                <h2 className="font-semibold text-white">{selected.client_description}</h2>
                <div className="flex gap-4 text-xs text-gray-500 mt-0.5">
                  <span>Timeline: {selected.timeline}</span>
                  <span>Price: <span className="text-green-400">{selected.price}</span></span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(selected.content); toast.success('Copied!') }}
                  className="btn-secondary text-sm py-2"
                >
                  <Copy size={14} /> Copy
                </button>
                <button onClick={() => deleteProposal(selected.id)} className="btn-ghost text-red-400 hover:text-red-300 text-sm py-2">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(selected.content) }} />
            </div>
          </div>
        ) : (
          <div className="flex-1 bg-bg-secondary border border-border-default rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <FileText size={40} className="text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">Select a proposal to view</p>
              <p className="text-gray-600 text-sm mt-1">or generate a new one with AI</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
