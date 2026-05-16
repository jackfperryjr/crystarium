'use client'

import type { Clip } from '@/lib/types'

interface Props {
  clips: Clip[]
  selectedId: string | null
  isDark: boolean
  onClipClick: (clip: Clip) => void
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ListView({ clips, selectedId, isDark, onClipClick }: Props) {
  const divider  = isDark ? 'border-white/5'     : 'border-gray-100'
  const rowHover = isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-gray-50'
  const rowSel   = isDark ? 'bg-white/[0.08]'    : 'bg-indigo-50/70'
  const title    = isDark ? 'text-white/80'       : 'text-gray-900'
  const domain   = isDark ? 'text-white/30'       : 'text-gray-400'
  const snippet  = isDark ? 'text-white/28'       : 'text-gray-500'
  const date     = isDark ? 'text-white/20'       : 'text-gray-400'

  if (!clips.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-white/20' : 'text-gray-400'}`}>No clips match your filters.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {clips.map(clip => (
        <button
          key={clip.id}
          onClick={() => onClipClick(clip)}
          className={`w-full text-left px-6 py-3.5 border-b transition-colors ${divider} ${clip.id === selectedId ? rowSel : rowHover}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {clip.favicon_url
              ? <img src={clip.favicon_url} alt="" className="w-4 h-4 rounded-sm flex-shrink-0 opacity-60" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              : <div className="w-4 flex-shrink-0" />
            }
            <span className={`text-[11px] flex-shrink-0 w-28 truncate ${domain}`}>{clip.domain ?? '—'}</span>
            <span className={`text-sm font-medium truncate flex-1 ${title}`}>{clip.title ?? clip.url}</span>
            <span className={`text-[11px] flex-shrink-0 ${date}`}>{fmt(clip.created_at)}</span>
          </div>
          {clip.summary && (
            <p className={`text-xs mt-1 pl-7 line-clamp-1 ${snippet}`}>{clip.summary}</p>
          )}
        </button>
      ))}
    </div>
  )
}
