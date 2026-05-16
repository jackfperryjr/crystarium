'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Clip } from '@/lib/types'
import KnowledgeGraph from './KnowledgeGraph'
import ClipPanel from './ClipPanel'

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function GemIcon({ fill }: { fill: string }) {
  // Same 8-point polygon as the canvas crystal, scaled to fit a small SVG
  return (
    <svg width="10" height="14" viewBox="-5 -7 10 14" fill={fill} style={{ flexShrink: 0 }}>
      <polygon points="0,-6 2.8,-3.2 4.2,0 2.8,3.2 0,6 -2.8,3.2 -4.2,0 -2.8,-3.2" />
    </svg>
  )
}

function Legend({ isDark }: { isDark: boolean }) {
  const text = isDark ? 'text-white/25' : 'text-gray-500'
  const line = isDark ? 'border-blue-400/30' : 'border-blue-600/50'
  const gemFill = isDark ? 'rgba(129,140,248,0.55)' : 'rgba(79,70,229,0.7)'
  return (
    <div className="absolute bottom-5 right-5 z-10 pointer-events-none flex flex-col gap-1.5 items-end">
      <div className={`flex items-center gap-2 ${text}`}>
        <span className="text-[10px]">clip — color indicates domain</span>
        <GemIcon fill={gemFill} />
      </div>
      <div className={`flex items-center gap-2 ${text}`}>
        <span className="text-[10px]">line — semantic similarity ≥ 70%</span>
        <span className={`w-4 border-t flex-shrink-0 ${line}`} />
      </div>
    </div>
  )
}

export default function GraphPage() {
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('crystarium-dark')
    if (stored !== null) setIsDark(stored !== 'false')

    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null)
    })
    supabase
      .from('clips')
      .select('id, url, title, domain, favicon_url, summary, entities, embedding, created_at')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setClips(data as Clip[])
        setLoading(false)
      })
  }, [])

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('crystarium-dark', String(next))
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const headerBg  = isDark ? 'bg-black/30 border-white/5'       : 'bg-white/85 border-gray-200'
  const logoText  = isDark ? 'text-white/40'                    : 'text-gray-500'
  const titleText = isDark ? 'text-white'                       : 'text-gray-900'
  const countText = isDark ? 'text-white/20'                    : 'text-gray-400'
  const btnText   = isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-500 hover:text-gray-800'
  const emailText = isDark ? 'text-white/20'                    : 'text-gray-400'
  const toggleColor = isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-500 hover:text-gray-800'

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-[#07070f]' : 'bg-[#f5f4fc]'}`}>
        <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Loading your Crystarium…</p>
      </div>
    )
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: isDark ? '#07070f' : '#f5f4fc' }}>
      <header className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3 backdrop-blur-md border-b ${headerBg}`}>
        <div className="flex items-center gap-2">
          <img src="/icons/android-chrome-128x128.png" alt="Magiloom" className="w-5 h-5" />
          <span className={`text-sm font-medium ${logoText}`}>Magiloom</span>
          <span className={`text-sm font-semibold tracking-tight ${titleText}`}>Crystarium</span>
          <span className={`text-xs ml-0.5 ${countText}`}>
            {clips.length} {clips.length === 1 ? 'clip' : 'clips'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className={`text-xs hidden sm:block ${emailText}`}>{userEmail}</span>
          )}
          <button onClick={toggleDark} className={`transition-colors ${toggleColor}`} aria-label="Toggle dark mode">
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={handleSignOut} className={`text-xs transition-colors ${btnText}`}>
            Sign out
          </button>
        </div>
      </header>

      <div className="absolute inset-0 pt-11">
        {clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <span className={`text-4xl ${isDark ? 'text-white/10' : 'text-gray-200'}`}>✦</span>
            <p className={`text-sm max-w-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
              No clips yet. Install the Aetherneedle extension and start clipping pages into your Crystarium.
            </p>
          </div>
        ) : (
          <KnowledgeGraph
            clips={clips}
            onNodeClick={setSelectedClip}
            selectedId={selectedClip?.id ?? null}
            isDark={isDark}
          />
        )}
      </div>

      <Legend isDark={isDark} />

      {selectedClip && (
        <ClipPanel clip={selectedClip} onClose={() => setSelectedClip(null)} isDark={isDark} />
      )}
    </div>
  )
}
