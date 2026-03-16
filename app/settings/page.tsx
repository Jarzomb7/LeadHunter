'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Mail, MessageCircle, User, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [alert, setAlert] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [telegramId, setTelegramId] = useState('')
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [testLoading, setTestLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)
      if (u) {
        const { data } = await supabase.from('alerts').select('*').eq('user_id', u.id).single()
        if (data) {
          setAlert(data)
          setTelegramId(data.telegram_chat_id || '')
          setEmailEnabled(data.email_enabled ?? true)
          setTelegramEnabled(data.telegram_enabled ?? false)
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  async function saveSettings() {
    setSaving(true)
    const payload = {
      user_id: user.id,
      telegram_chat_id: telegramId,
      email_enabled: emailEnabled,
      telegram_enabled: telegramEnabled,
    }

    let error
    if (alert) {
      ({ error } = await supabase.from('alerts').update(payload).eq('id', alert.id))
    } else {
      const { error: e, data } = await supabase.from('alerts').insert(payload).select().single()
      error = e
      if (data) setAlert(data)
    }

    if (error) toast.error('Failed to save settings')
    else toast.success('Settings saved!')
    setSaving(false)
  }

  async function sendTestTelegram() {
    if (!telegramId) { toast.error('Enter your Telegram Chat ID first'); return }
    setTestLoading(true)
    try {
      const res = await fetch('/api/test-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: telegramId }),
      })
      const data = await res.json()
      if (data.ok) toast.success('Test message sent!')
      else toast.error('Failed — check your Chat ID')
    } catch {
      toast.error('Failed to send test')
    }
    setTestLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and notification preferences</p>
      </div>

      {/* Account */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <User size={16} className="text-accent-blue" />
          Account
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Email</label>
            <input value={user?.email || ''} readOnly className="input-base text-sm bg-bg-tertiary cursor-not-allowed text-gray-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Plan</label>
            <div className="flex items-center gap-2">
              <span className="bg-accent-blue/15 text-accent-light border border-accent-blue/20 text-xs font-semibold px-3 py-1.5 rounded-lg">
                FREE PLAN
              </span>
              <span className="text-gray-600 text-sm">Upgrade to Pro for unlimited features</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-bg-secondary border border-border-default rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Bell size={16} className="text-accent-blue" />
          Notifications
        </h2>

        {/* Email toggle */}
        <div className="flex items-center justify-between py-3.5 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Mail size={15} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Email Alerts</p>
              <p className="text-xs text-gray-600">Get notified at {user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setEmailEnabled(!emailEnabled)}
            className={`w-11 h-6 rounded-full transition-all duration-200 relative ${emailEnabled ? 'bg-accent-blue' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${emailEnabled ? 'left-5.5' : 'left-0.5'}`} style={{ left: emailEnabled ? '22px' : '2px' }} />
          </button>
        </div>

        {/* Telegram */}
        <div className="py-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center">
                <MessageCircle size={15} className="text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Telegram Alerts</p>
                <p className="text-xs text-gray-600">Instant notifications via bot</p>
              </div>
            </div>
            <button
              onClick={() => setTelegramEnabled(!telegramEnabled)}
              className={`w-11 h-6 rounded-full transition-all duration-200 relative ${telegramEnabled ? 'bg-accent-blue' : 'bg-gray-700'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200`} style={{ left: telegramEnabled ? '22px' : '2px' }} />
            </button>
          </div>

          {telegramEnabled && (
            <div className="ml-11 space-y-3 animate-slide-up">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Telegram Chat ID</label>
                <div className="flex gap-2">
                  <input
                    value={telegramId}
                    onChange={e => setTelegramId(e.target.value)}
                    placeholder="e.g. 123456789"
                    className="input-base text-sm flex-1"
                  />
                  <button onClick={sendTestTelegram} disabled={testLoading} className="btn-secondary text-sm py-2 px-3 whitespace-nowrap">
                    {testLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Test'}
                  </button>
                </div>
              </div>
              <div className="bg-bg-tertiary rounded-xl p-3 border border-border-default">
                <p className="text-xs text-gray-400 leading-relaxed">
                  <strong className="text-white">How to get your Chat ID:</strong><br />
                  1. Open Telegram and search for <code className="text-accent-light">@userinfobot</code><br />
                  2. Send any message to get your Chat ID<br />
                  3. Paste it above and click Test
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-bg-secondary border border-red-500/20 rounded-2xl p-5 mb-5">
        <h2 className="font-semibold text-red-400 mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">Delete Account</p>
            <p className="text-xs text-gray-600 mt-0.5">Permanently delete your account and all data</p>
          </div>
          <button className="text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all">
            Delete Account
          </button>
        </div>
      </div>

      <button onClick={saveSettings} disabled={saving} className="btn-primary w-full justify-center py-3">
        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
