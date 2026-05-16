'use client'

import type { Clip } from '@/lib/types'

interface Props {
  clips: Clip[]
  selectedId: string | null
  isDark: boolean
  onClipClick: (clip: Clip) => void
}

const BUCKET_ORDER = ['Today', 'Yesterday', 'This week', 'Earlier this month']

function bucket(iso: string): string {
  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const d     = new Date(iso)
  const day   = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff  = Math.round((today.getTime() - day.getTime()) / 86400000)

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7)  return 'This week'
  if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) return 'Earlier this month'
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function TimelineView({ clips, selectedId, isDark, onClipClick }: Props) {
  const groups = clips.reduce((acc, clip) => {
    const b = bucket(clip.created_at)
    acc.set(b, [...(acc.get(b) ?? []), clip])
    return acc
  }, new Map<string, Clip[]>())

  const sortedBuckets = [...groups.keys()].sort((a, b) => {
    const ai = BUCKET_ORDER.indexOf(a)
    const bi = BUCKET_ORDER.indexOf(b)
    if (ai !== -1 && bi !== -1) return ai - bi
    if (ai !== -1) return -1
    if (bi !== -1) return 1
    return new Date(b + ' 1').getTime() - new Date(a + ' 1').getTime()
  })

  const divider   = isDark ? 'border-white/6'          : 'border-gray-100'
  const rowHover  = isDark ? 'hover:bg-white/[0.04]'   : 'hover:bg-gray-50'
  const rowSel    = isDark ? 'bg-white/[0.08]'         : 'bg-indigo-50/70'
  const titleText = isDark ? 'text-white/80'           : 'text-gray-900'
  const domainText = isDark ? 'text-white/28'          : 'text-gray-400'
  const snippet   = isDark ? 'text-white/28'           : 'text-gray-500'
  const dateText  = isDark ? 'text-white/20'           : 'text-gray-400'
  const label     = isDark ? 'text-white/22'           : 'text-gray-400'

  if (!clips.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-white/20' : 'text-gray-400'}`}>No clips match your filters.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 flex flex-col gap-7">
      {sortedBuckets.map(b => (
        <div key={b}>
          <p className={`text-[10px] font-semibold uppercase tracking-widest mb-2.5 px-1 ${label}`}>{b}</p>
          <div className={`rounded-xl border overflow-hidden ${divider}`}>
            {groups.get(b)!.map((clip, i) => (
              <button
                key={clip.id}
                onClick={() => onClipClick(clip)}
                className={`w-full text-left px-4 py-3.5 transition-colors ${i > 0 ? `border-t ${divider}` : ''} ${clip.id === selectedId ? rowSel : rowHover}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {clip.favicon_url
                    ? <img src={clip.favicon_url} alt="" className="w-4 h-4 rounded-sm flex-shrink-0 opacity-60" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    : <div className="w-4 flex-shrink-0" />
                  }
                  <span className={`text-[11px] flex-shrink-0 w-24 truncate ${domainText}`}>{clip.domain ?? '—'}</span>
                  <span className={`text-sm font-medium truncate flex-1 ${titleText}`}>{clip.title ?? clip.url}</span>
                  <span className={`text-[11px] flex-shrink-0 ${dateText}`}>{fmt(clip.created_at)}</span>
                </div>
                {clip.summary && (
                  <p className={`text-xs mt-1 pl-7 line-clamp-1 ${snippet}`}>{clip.summary}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
