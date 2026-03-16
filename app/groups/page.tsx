'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Group, Platform } from '@/types'
import { Globe, Plus, Trash2, ToggleLeft, ToggleRight, Link2 } from 'lucide-react'
import { formatDate, platformConfig } from '@/lib/utils'
import toast from 'react-hot-toast'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'facebook', label: 'Facebook Group' },
  { value: 'linkedin', label: 'LinkedIn Jobs' },
  { value: 'useme', label: 'Useme' },
  { value: 'freelancer', label: 'Freelancer.com' },
  { value: 'upwork', label: 'Upwork' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'other', label: 'Other' },
]

const EXAMPLES = [
  { url: 'https://facebook.com/groups/zlecenia-web', name: 'Zlecenia Web PL', platform: 'facebook' as Platform },
  { url: 'https://useme.com/pl/jobs/', name: 'Useme Jobs', platform: 'useme' as Platform },
  { url: 'https://linkedin.com/jobs/', name: 'LinkedIn Jobs', platform: 'linkedin' as Platform },
]

export default function GroupsPage() {
  const supabase = createClient()
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ group_url: '', group_name: '', platform: 'facebook' as Platform })
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchGroups() }, [])

  async function fetchGroups() {
    const { data } = await supabase.from('groups').select('*').order('created_at', { ascending: false })
    setGroups(data || [])
    setLoading(false)
  }

  async function addGroup(e: React.FormEvent) {
    e.preventDefault()
    if (!form.group_url.trim() || !form.group_name.trim()) return
    setAdding(true)
    const { data, error } = await supabase.from('groups').insert(form).select().single()
    if (error) {
      toast.error('Failed to add group')
    } else {
      setGroups(prev => [data, ...prev])
      setForm({ group_url: '', group_name: '', platform: 'facebook' })
      toast.success('Group added!')
    }
    setAdding(false)
  }

  async function addExample(ex: typeof EXAMPLES[0]) {
    const { data, error } = await supabase.from('groups').insert(ex).select().single()
    if (error) { toast.error('Failed to add'); return }
    setGroups(prev => [data, ...prev])
    toast.success('Added!')
  }

  async function toggleGroup(id: string, current: boolean) {
    const { error } = await supabase.from('groups').update({ is_active: !current }).eq('id', id)
    if (!error) setGroups(prev => prev.map(g => g.id === id ? { ...g, is_active: !current } : g))
  }

  async function deleteGroup(id: string) {
    const { error } = await supabase.from('groups').delete().eq('id', id)
    if (!error) { setGroups(prev => prev.filter(g => g.id !== id)); toast.success('Deleted') }
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Groups & Sources</h1>
        <p className="text-gray-500 text-sm">{groups.filter(g => g.is_active).length} active sources monitored</p>
      </div>

      {/* Add form */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-5 mb-6">
        <h2 className="font-semibold text-white mb-4">Add New Source</h2>
        <form onSubmit={addGroup} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Group Name</label>
              <input
                value={form.group_name}
                onChange={e => setForm(p => ({ ...p, group_name: e.target.value }))}
                placeholder="e.g. Zlecenia Web"
                className="input-base text-sm"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Platform</label>
              <select
                value={form.platform}
                onChange={e => setForm(p => ({ ...p, platform: e.target.value as Platform }))}
                className="input-base text-sm"
              >
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">URL</label>
            <input
              value={form.group_url}
              onChange={e => setForm(p => ({ ...p, group_url: e.target.value }))}
              placeholder="https://facebook.com/groups/..."
              className="input-base text-sm"
              type="url"
              required
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary">
            {adding ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
            Add Source
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-border-default">
          <p className="text-xs text-gray-600 mb-2">Quick add popular sources:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map(ex => (
              <button
                key={ex.url}
                onClick={() => addExample(ex)}
                className="text-xs bg-bg-tertiary border border-border-default hover:border-accent-blue/30 text-gray-400 hover:text-accent-light px-3 py-1.5 rounded-lg transition-all"
              >
                + {ex.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Groups list */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-default">
          <h2 className="font-semibold text-white">Your Sources</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : groups.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No sources added</p>
            <p className="text-gray-600 text-sm mt-1">Add Facebook groups and job boards to monitor</p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {groups.map(group => {
              const cfg = platformConfig[group.platform] || platformConfig.other
              return (
                <div key={group.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-bg-tertiary/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold" style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{group.group_name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    </div>
                    <a href={group.group_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-accent-light transition-colors flex items-center gap-1 mt-0.5 truncate">
                      <Link2 size={10} /> {group.group_url}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleGroup(group.id, group.is_active)}>
                      {group.is_active ? <ToggleRight size={20} className="text-green-500" /> : <ToggleLeft size={20} className="text-gray-600" />}
                    </button>
                    <button onClick={() => deleteGroup(group.id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={15} />
                    </button>
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
