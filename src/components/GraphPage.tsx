'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import type { Clip } from '@/lib/types'
import { domainHue } from '@/lib/utils'
import KnowledgeGraph from './KnowledgeGraph'
import ClipPanel from './ClipPanel'
import AddPanel from './AddPanel'
import ListView from './ListView'
import GridView from './GridView'
import DomainView from './DomainView'
import TimelineView from './TimelineView'

// ─── Icons ───────────────────────────────────────────────────────────────────

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

function IconGraph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
      <line x1="8.4" y1="13.4" x2="15.6" y2="17.6" /><line x1="15.6" y1="6.4" x2="8.4" y2="10.6" />
    </svg>
  )
}

function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconDomains() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 12l10 5 10-5" /><path d="M2 17l10 5 10-5" />
    </svg>
  )
}

function IconTimeline() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" />
      <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
      <line x1="8" y1="3" x2="8" y2="6" /><line x1="16" y1="18" x2="16" y2="21" />
    </svg>
  )
}

function GemIcon({ fill }: { fill: string }) {
  return (
    <svg width="10" height="14" viewBox="-5 -7 10 14" fill={fill} style={{ flexShrink: 0 }}>
      <polygon points="0,-6 2.8,-3.2 4.2,0 2.8,3.2 0,6 -2.8,3.2 -4.2,0 -2.8,-3.2" />
    </svg>
  )
}

// ─── Domain legend (graph view only) ─────────────────────────────────────────

function Legend({ clips, isDark }: { clips: Clip[]; isDark: boolean }) {
  const text = isDark ? 'text-white/25' : 'text-gray-500'
  const line = isDark ? 'border-blue-400/30' : 'border-blue-600/50'
  const lightness = isDark ? 68 : 45

  const domains = [...clips
    .filter(c => c.domain)
    .reduce((acc, c) => { acc.set(c.domain!, (acc.get(c.domain!) ?? 0) + 1); return acc }, new Map<string, number>())
    .entries()]
    .sort((a, b) => b[1] - a[1]).slice(0, 8).map(([d]) => d)

  return (
    <div className="absolute bottom-5 right-5 z-10 pointer-events-none flex flex-col gap-1 items-end">
      {domains.map(d => (
        <div key={d} className={`flex items-center gap-2 ${text}`}>
          <span className="text-[10px]">{d}</span>
          <GemIcon fill={`hsl(${domainHue(d)}, 65%, ${lightness}%)`} />
        </div>
      ))}
      {domains.length > 0 && (
        <div className="h-px w-16 my-0.5" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)' }} />
      )}
      <div className={`flex items-center gap-2 ${text}`}>
        <span className="text-[10px]">similarity ≥ 70%</span>
        <span className={`w-4 border-t flex-shrink-0 ${line}`} />
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'graph' | 'list' | 'grid' | 'domains' | 'timeline'
type RecencyDays = null | 7 | 30

const VIEW_TABS: { id: View; Icon: () => JSX.Element; label: string }[] = [
  { id: 'graph',    Icon: IconGraph,    label: 'Graph'    },
  { id: 'list',     Icon: IconList,     label: 'List'     },
  { id: 'grid',     Icon: IconGrid,     label: 'Grid'     },
  { id: 'domains',  Icon: IconDomains,  label: 'Domains'  },
  { id: 'timeline', Icon: IconTimeline, label: 'Timeline' },
]

// ─── Component ───────────────────────────────────────────────────────────────

export default function GraphPage() {
  const [clips, setClips]             = useState<Clip[]>([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null)
  const [showAdd, setShowAdd]         = useState(false)
  const [userEmail, setUserEmail]     = useState<string | null>(null)
  const [isDark, setIsDark]           = useState(true)
  const [view, setView]               = useState<View>('graph')
  const [searchQuery, setSearchQuery] = useState('')
  const [alwaysShowLabels, setAlwaysShowLabels] = useState(false)
  const [recencyDays, setRecencyDays] = useState<RecencyDays>(null)

  const fetchClips = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clips')
      .select('id, url, title, domain, favicon_url, summary, entities, embedding, created_at')
      .order('created_at', { ascending: false })
    if (!error && data) setClips(data as Clip[])
  }

  useEffect(() => {
    const stored = localStorage.getItem('crystarium-dark')
    if (stored !== null) setIsDark(stored !== 'false')
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => setUserEmail(user?.email ?? null))
    fetchClips().finally(() => setLoading(false))
  }, [])

  // Clips filtered for non-graph views (search + recency applied as hard filters)
  const filteredClips = useMemo(() => {
    let result = clips
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(c =>
        (c.title ?? '').toLowerCase().includes(q) ||
        (c.domain ?? '').toLowerCase().includes(q) ||
        c.url.toLowerCase().includes(q) ||
        Object.values(c.entities ?? {}).flatMap(v => v ?? []).some(v => v.toLowerCase().includes(q))
      )
    }
    if (recencyDays) {
      const cutoff = Date.now() - recencyDays * 24 * 60 * 60 * 1000
      result = result.filter(c => new Date(c.created_at).getTime() >= cutoff)
    }
    return result
  }, [clips, searchQuery, recencyDays])

  const handleRefresh = async () => { setRefreshing(true); await fetchClips(); setRefreshing(false) }
  const handleNodeClick = (clip: Clip) => { setShowAdd(false); setSelectedClip(clip) }
  const openAdd = () => { setSelectedClip(null); setShowAdd(true) }
  const cycleRecency = () => setRecencyDays(prev => prev === null ? 7 : prev === 7 ? 30 : null)

  const handleDelete = async (clipId: string) => {
    setClips(prev => prev.filter(c => c.id !== clipId))
    setSelectedClip(null)
    const supabase = createClient()
    const { error } = await supabase.from('clips').delete().eq('id', clipId)
    if (error) fetchClips()
  }

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

  // ─── Style tokens ───────────────────────────────────────────────────────────

  const headerBg    = isDark ? 'bg-black/30 border-white/5'        : 'bg-white/85 border-gray-200'
  const logoText    = isDark ? 'text-white/40'                     : 'text-gray-500'
  const titleText   = isDark ? 'text-white'                        : 'text-gray-900'
  const countText   = isDark ? 'text-white/20'                     : 'text-gray-400'
  const btnText     = isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-500 hover:text-gray-800'
  const emailText   = isDark ? 'text-white/20'                     : 'text-gray-400'
  const toggleColor = isDark ? 'text-white/30 hover:text-white/60' : 'text-gray-500 hover:text-gray-800'

  const viewTabBase = 'p-1.5 rounded-md transition-colors'
  const viewTabOn   = isDark ? 'text-white/80 bg-white/10'         : 'text-gray-900 bg-gray-200/80'
  const viewTabOff  = isDark ? 'text-white/28 hover:text-white/60 hover:bg-white/6' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'

  const fabBase   = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md border transition-colors'
  const fabColor  = isDark ? 'bg-black/50 border-white/10 text-white/50 hover:text-white/90 hover:bg-black/70' : 'bg-white/80 border-black/10 text-gray-500 hover:text-gray-900 hover:bg-white'
  const fabActive = isDark ? 'bg-indigo-500/25 border-indigo-400/40 text-indigo-300 hover:bg-indigo-500/35'   : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/25'

  const searchBg  = isDark ? 'bg-black/50 border-white/10 text-white/70 placeholder-white/25' : 'bg-white/80 border-black/10 text-gray-700 placeholder-gray-400'
  const subBg     = isDark ? 'bg-black/20 border-white/5'           : 'bg-white/60 border-gray-100'
  const recencyLabel = recencyDays === 7 ? '7d' : recencyDays === 30 ? '30d' : 'All'

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center gap-5 h-screen ${isDark ? 'bg-[#07070f]' : 'bg-[#f5f4fc]'}`}>
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="absolute inset-0 w-14 h-14 animate-spin" viewBox="0 0 56 56" fill="none" style={{ animationDuration: '1.4s' }}>
            <circle cx="28" cy="28" r="24" stroke={isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.1)'} strokeWidth="1.5" />
            <path d="M28 4 A24 24 0 0 1 52 28" stroke="rgb(129,140,248)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <img src="/icons/android-chrome-128x128.png" alt="Magiloom" className="w-8 h-8" />
        </div>
        <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Loading your Crystarium…</p>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: isDark ? '#07070f' : '#f5f4fc' }}>

      {/* ── Header ── */}
      <header className={`absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-5 py-3 backdrop-blur-md border-b ${headerBg}`}>
        {/* Left: brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img src="/icons/android-chrome-128x128.png" alt="Magiloom" className="w-5 h-5" />
          <span className={`text-sm font-medium ${logoText}`}>Magiloom</span>
          <span className={`text-sm font-semibold tracking-tight ${titleText}`}>Crystarium</span>
          <span className={`text-xs ${countText}`}>{clips.length}</span>
        </div>

        {/* Center: view toggles */}
        <div className="flex items-center gap-0.5 mx-auto">
          {VIEW_TABS.map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              title={label}
              className={`${viewTabBase} ${view === id ? viewTabOn : viewTabOff}`}
            >
              <Icon />
            </button>
          ))}
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {userEmail && <span className={`text-xs hidden sm:block ${emailText}`}>{userEmail}</span>}
          <button onClick={toggleDark} className={`transition-colors ${toggleColor}`} aria-label="Toggle dark mode">
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={handleSignOut} className={`text-xs transition-colors ${btnText}`}>Sign out</button>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="absolute inset-0 pt-11">

        {/* Graph view */}
        {view === 'graph' && (
          clips.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
              <span className={`text-4xl ${isDark ? 'text-white/10' : 'text-gray-200'}`}>✦</span>
              <p className={`text-sm max-w-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                No clips yet. Install the Aetherneedle extension and start clipping pages — or add one manually.
              </p>
            </div>
          ) : (
            <KnowledgeGraph
              clips={clips}
              onNodeClick={handleNodeClick}
              onBackgroundClick={() => { setSelectedClip(null); setShowAdd(false) }}
              selectedId={selectedClip?.id ?? null}
              isDark={isDark}
              searchQuery={searchQuery}
              alwaysShowLabels={alwaysShowLabels}
              recencyDays={recencyDays}
            />
          )
        )}

        {/* List / grid / domain / timeline views */}
        {view !== 'graph' && (
          <div className="h-full flex flex-col">
            {/* Sticky controls bar */}
            <div className={`flex items-center gap-3 px-5 py-2 border-b backdrop-blur-md flex-shrink-0 ${subBg}`}>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs flex-1 max-w-sm ${searchBg}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-50">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search clips…"
                  className="bg-transparent outline-none flex-1 min-w-0"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="opacity-40 hover:opacity-80 transition-opacity leading-none text-base flex-shrink-0">×</button>
                )}
              </div>
              <button onClick={cycleRecency} className={`${fabBase} ${recencyDays ? fabActive : fabColor}`}>{recencyLabel}</button>
              <button onClick={handleRefresh} disabled={refreshing} className={`${fabBase} ${fabColor} disabled:opacity-40`}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'animate-spin' : ''} style={refreshing ? { animationDuration: '0.9s' } : {}}>
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" />
                </svg>
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
              <button onClick={openAdd} className={`${fabBase} ${fabColor}`}>
                <span className="text-[12px] leading-none">✦</span>Add
              </button>
            </div>

            {/* Scrollable view content */}
            <div className="flex-1 overflow-y-auto">
              {view === 'list'     && <ListView     clips={filteredClips} selectedId={selectedClip?.id ?? null} isDark={isDark} onClipClick={c => { setSelectedClip(c); setShowAdd(false) }} />}
              {view === 'grid'     && <GridView     clips={filteredClips} selectedId={selectedClip?.id ?? null} isDark={isDark} onClipClick={c => { setSelectedClip(c); setShowAdd(false) }} />}
              {view === 'domains'  && <DomainView   clips={filteredClips} selectedId={selectedClip?.id ?? null} isDark={isDark} onClipClick={c => { setSelectedClip(c); setShowAdd(false) }} />}
              {view === 'timeline' && <TimelineView clips={filteredClips} selectedId={selectedClip?.id ?? null} isDark={isDark} onClipClick={c => { setSelectedClip(c); setShowAdd(false) }} />}
            </div>
          </div>
        )}
      </div>

      {/* ── Graph-only floating elements ── */}
      {view === 'graph' && (
        <>
          {/* Search — top left */}
          <div className="absolute top-[60px] left-4 z-10">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md border text-xs ${searchBg}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0 opacity-50">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search clips…" className="bg-transparent outline-none w-36" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="opacity-40 hover:opacity-80 transition-opacity leading-none text-base">×</button>}
            </div>
          </div>

          {/* FABs — top right */}
          <div className="absolute top-[60px] right-4 z-10 flex flex-col gap-2 items-end">
            <button onClick={openAdd} className={`${fabBase} ${fabColor}`}>
              <span className="text-[13px] leading-none">✦</span>Add clip
            </button>
            <button onClick={handleRefresh} disabled={refreshing} className={`${fabBase} ${fabColor} disabled:opacity-40`} aria-label="Refresh">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'animate-spin' : ''} style={refreshing ? { animationDuration: '0.9s' } : {}}>
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21h5v-5" />
              </svg>
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
            <div className="flex gap-1.5 mt-0.5">
              <button onClick={() => setAlwaysShowLabels(v => !v)} className={`${fabBase} ${alwaysShowLabels ? fabActive : fabColor}`} title="Toggle always-on labels">Aa</button>
              <button onClick={cycleRecency} className={`${fabBase} ${recencyDays ? fabActive : fabColor}`} title="Filter by recency">{recencyLabel}</button>
            </div>
          </div>

          <Legend clips={clips} isDark={isDark} />
        </>
      )}

      {/* ── Support link (all views) ── */}
      <a
        href="https://buy.stripe.com/aFafZj7YI6n06d3fxG0Fi00"
        target="_blank"
        rel="noopener noreferrer"
        className={`absolute bottom-5 left-5 z-10 text-[10px] transition-colors ${isDark ? 'text-white/20 hover:text-white/50' : 'text-gray-400 hover:text-gray-600'}`}
      >
        ♥ Support
      </a>

      {/* ── Panels (all views) ── */}
      {selectedClip && (
        <ClipPanel
          key={selectedClip.id}
          clip={selectedClip}
          onClose={() => setSelectedClip(null)}
          onDelete={handleDelete}
          isDark={isDark}
        />
      )}
      {showAdd && (
        <AddPanel
          onClose={() => setShowAdd(false)}
          onClipAdded={handleRefresh}
          isDark={isDark}
        />
      )}
    </div>
  )
}
