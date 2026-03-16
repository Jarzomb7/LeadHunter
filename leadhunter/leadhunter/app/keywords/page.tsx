'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Keyword } from '@/types'
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const EXAMPLE_KEYWORDS = ['szukam strony', 'web developer', 'seo freelancer', 'szukam grafika', 'szukam malarza', 'need website', 'looking for designer', 'hiring developer']

export default function KeywordsPage() {
  const supabase = createClient()
  const [keywords, setKeywords] = useState<Keyword[]>([])
  const [loading, setLoading] = useState(true)
  const [newKeyword, setNewKeyword] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchKeywords() }, [])

  async function fetchKeywords() {
    const { data } = await supabase.from('keywords').select('*').order('created_at', { ascending: false })
    setKeywords(data || [])
    setLoading(false)
  }

  async function addKeyword(kw?: string) {
    const keyword = (kw || newKeyword).trim()
    if (!keyword) return
    if (keywords.find(k => k.keyword.toLowerCase() === keyword.toLowerCase())) {
      toast.error('Keyword already exists')
      return
    }
    setAdding(true)
    const { data, error } = await supabase.from('keywords').insert({ keyword }).select().single()
    if (error) {
      toast.error('Failed to add keyword')
    } else {
      setKeywords(prev => [data, ...prev])
      setNewKeyword('')
      toast.success('Keyword added!')
    }
    setAdding(false)
  }

  async function toggleKeyword(id: string, current: boolean) {
    const { error } = await supabase.from('keywords').update({ is_active: !current }).eq('id', id)
    if (!error) setKeywords(prev => prev.map(k => k.id === id ? { ...k, is_active: !current } : k))
  }

  async function deleteKeyword(id: string) {
    const { error } = await supabase.from('keywords').delete().eq('id', id)
    if (!error) {
      setKeywords(prev => prev.filter(k => k.id !== id))
      toast.success('Keyword deleted')
    }
  }

  const activeCount = keywords.filter(k => k.is_active).length

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Keywords</h1>
        <p className="text-gray-500 text-sm">{activeCount} active · {keywords.length} total</p>
      </div>

      {/* Add keyword */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-white mb-4">Add New Keyword</h2>
        <div className="flex gap-3">
          <input
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addKeyword()}
            placeholder="e.g. szukam web developera"
            className="input-base flex-1"
          />
          <button onClick={() => addKeyword()} disabled={adding || !newKeyword.trim()} className="btn-primary px-5">
            {adding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={16} />}
            Add
          </button>
        </div>

        <div className="mt-4">
          <p className="text-xs text-gray-600 mb-2">Quick add examples:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_KEYWORDS.map(kw => (
              <button
                key={kw}
                onClick={() => addKeyword(kw)}
                disabled={!!keywords.find(k => k.keyword.toLowerCase() === kw.toLowerCase())}
                className="text-xs bg-bg-tertiary border border-border-default hover:border-accent-blue/30 text-gray-400 hover:text-accent-light px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + {kw}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords list */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-default">
          <h2 className="font-semibold text-white">Your Keywords</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No keywords yet</p>
            <p className="text-gray-600 text-sm mt-1">Add your first keyword to start monitoring</p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {keywords.map(kw => (
              <div key={kw.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-tertiary/50 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${kw.is_active ? 'bg-green-500' : 'bg-gray-700'}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white">{kw.keyword}</span>
                  <span className="text-xs text-gray-600 ml-3">{formatDate(kw.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleKeyword(kw.id, kw.is_active)} className="text-gray-600 hover:text-accent-light transition-colors">
                    {kw.is_active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => deleteKeyword(kw.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
