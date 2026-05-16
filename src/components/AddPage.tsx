'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-browser'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function AddPage() {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('crystarium-dark')
    if (stored !== null) setIsDark(stored !== 'false')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated — please sign in again.')

      const res = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(body.error || `Error ${res.status}`)
      }

      setStatus('success')
      setUrl('')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const bg = isDark ? 'bg-[#07070f]' : 'bg-[#f5f4fc]'
  const headerBg = isDark ? 'bg-black/30 border-white/5' : 'bg-white/85 border-gray-200'
  const logoText = isDark ? 'text-white/40' : 'text-gray-500'
  const titleText = isDark ? 'text-white' : 'text-gray-900'
  const mutedText = isDark ? 'text-white/30' : 'text-gray-500'
  const cardBg = isDark ? 'bg-white/[0.04] border-white/8' : 'bg-white border-gray-200'
  const labelText = isDark ? 'text-white/50' : 'text-gray-600'
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-indigo-400/60 focus:ring-indigo-400/20'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400/20'

  return (
    <div className={`flex flex-col min-h-screen ${bg}`}>
      <header className={`flex items-center justify-between px-5 py-3 backdrop-blur-md border-b ${headerBg}`}>
        <div className="flex items-center gap-2">
          <img src="/icons/android-chrome-128x128.png" alt="Magiloom" className="w-5 h-5" />
          <span className={`text-sm font-medium ${logoText}`}>Magiloom</span>
          <span className={`text-sm font-semibold tracking-tight ${titleText}`}>Crystarium</span>
        </div>
        <Link href="/" className={`text-xs transition-colors ${mutedText} hover:text-current`}>
          ← Back to graph
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className={`w-full max-w-md rounded-2xl border p-8 ${cardBg}`}>
          <h1 className={`text-lg font-semibold mb-1 ${titleText}`}>Add a clip</h1>
          <p className={`text-sm mb-7 ${mutedText}`}>
            Paste any URL and we'll fetch, summarize, and crystallize it into your graph.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className={`text-xs font-medium ${labelText}`}>URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                required
                disabled={status === 'loading'}
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none focus:ring-1 transition-colors disabled:opacity-50 ${inputCls}`}
              />
            </div>

            {status === 'error' && (
              <p className="text-xs text-red-400">{errorMsg}</p>
            )}

            {status === 'success' && (
              <p className="text-xs text-emerald-400">
                Clip added — it may take a moment to appear in your graph.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !url.trim()}
              className="mt-1 w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition-colors"
            >
              {status === 'loading' ? 'Fetching & crystallizing…' : 'Crystallize'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
