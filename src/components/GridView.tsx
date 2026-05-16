'use client'

import type { Clip } from '@/lib/types'
import { domainHue } from '@/lib/utils'

interface Props {
  clips: Clip[]
  selectedId: string | null
  isDark: boolean
  onClipClick: (clip: Clip) => void
}

export default function GridView({ clips, selectedId, isDark, onClipClick }: Props) {
  const cardBase = 'text-left rounded-xl border p-4 transition-colors flex flex-col gap-2.5'
  const cardIdle = isDark
    ? 'bg-white/[0.04] border-white/8 hover:bg-white/[0.07]'
    : 'bg-white border-gray-200 hover:bg-gray-50'
  const cardSel  = isDark
    ? 'bg-indigo-500/15 border-indigo-400/30'
    : 'bg-indigo-50 border-indigo-200'
  const title    = isDark ? 'text-white/85' : 'text-gray-900'
  const domain   = isDark ? 'text-white/30' : 'text-gray-400'
  const snippet  = isDark ? 'text-white/32' : 'text-gray-500'

  if (!clips.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-white/20' : 'text-gray-400'}`}>No clips match your filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-6 py-6 max-w-6xl mx-auto">
      {clips.map(clip => {
        const hue = domainHue(clip.domain)
        const accentL = isDark ? 55 : 42
        return (
          <button
            key={clip.id}
            onClick={() => onClipClick(clip)}
            className={`${cardBase} ${clip.id === selectedId ? cardSel : cardIdle}`}
          >
            <div className="flex items-center gap-2">
              {clip.favicon_url
                ? <img src={clip.favicon_url} alt="" className="w-4 h-4 rounded-sm flex-shrink-0 opacity-70" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                : <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: `hsl(${hue}, 55%, ${accentL}%)`, opacity: 0.6 }} />
              }
              <span className={`text-[11px] truncate ${domain}`}>{clip.domain ?? '—'}</span>
            </div>
            <p className={`text-sm font-medium leading-snug line-clamp-2 ${title}`}>{clip.title ?? clip.url}</p>
            {clip.summary && (
              <p className={`text-xs leading-relaxed line-clamp-3 ${snippet}`}>{clip.summary}</p>
            )}
          </button>
        )
      })}
    </div>
  )
}
