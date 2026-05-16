'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface Props {
  onClose: () => void
  onClipAdded: () => void
  isDark: boolean
}

export default function AddPanel({ onClose, onClipAdded, isDark }: Props) {
  const [mounted, setMounted] = useState(false)
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
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
      onClipAdded()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const panel   = isDark ? 'bg-black/70 border-white/5'   : 'bg-white/90 border-black/8'
  const divider = isDark ? 'border-white/5'                : 'border-black/6'
  const close   = isDark ? 'text-white/30 hover:text-white/70' : 'text-gray-300 hover:text-gray-600'
  const heading = isDark ? 'text-white'                    : 'text-gray-900'
  const muted   = isDark ? 'text-white/35'                 : 'text-gray-500'
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-white/25 focus:border-indigo-400/60 focus:ring-indigo-400/20'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-400 focus:ring-indigo-400/20'

  return (
    <div
      className={`absolute top-11 right-0 bottom-0 w-80 backdrop-blur-xl border-l flex flex-col z-20 overflow-hidden transition-transform duration-300 ease-out ${mounted ? 'translate-x-0' : 'translate-x-full'} ${panel}`}
    >
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${divider}`}>
        <span className={`text-sm font-medium ${heading}`}>Add a clip</span>
        <button
          onClick={onClose}
          className={`transition-colors text-xl leading-none ${close}`}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
        <p className={`text-xs leading-relaxed ${muted}`}>
          Paste any URL and we'll fetch, summarize, and crystallize it into your graph.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            required
            autoFocus
            disabled={status === 'loading'}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-1 transition-colors disabled:opacity-50 ${inputCls}`}
          />

          {status === 'error' && (
            <p className="text-xs text-red-400">{errorMsg}</p>
          )}

          {status === 'success' && (
            <p className="text-xs text-emerald-400">
              Clip added — refreshing your graph now.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'loading' || !url.trim()}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 transition-colors"
          >
            {status === 'loading' ? 'Crystallizing…' : 'Crystallize'}
          </button>
        </form>
      </div>
    </div>
  )
}
