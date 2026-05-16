'use client'

import { useState } from 'react'
import type { Clip, Entities } from '@/lib/types'

const ENTITY_STYLES: Record<keyof Entities, string> = {
  keywords:     'bg-white/5 text-white/40 border border-white/10',
  technologies: 'bg-blue-500/10 text-blue-300/80 border border-blue-500/20',
  people:       'bg-purple-500/10 text-purple-300/80 border border-purple-500/20',
  places:       'bg-green-500/10 text-green-300/80 border border-green-500/20',
  topics:       'bg-orange-500/10 text-orange-300/80 border border-orange-500/20',
}

function EntityChips({ entities }: { entities: Entities }) {
  const all = (Object.entries(entities) as [keyof Entities, string[]][])
    .flatMap(([cat, tags]) => (tags ?? []).map(tag => ({ tag, cat })))
  if (!all.length) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map(({ tag, cat }, i) => (
        <span key={i} className={`text-[11px] px-2 py-0.5 rounded-full ${ENTITY_STYLES[cat]}`}>
          {tag}
        </span>
      ))}
    </div>
  )
}

interface Props {
  clip: Clip
  onClose: () => void
  onDelete: (clipId: string) => void
  isDark: boolean
}

export default function ClipPanel({ clip, onClose, onDelete, isDark }: Props) {
  const [confirming, setConfirming] = useState(false)

  const hostname = (() => {
    try { return new URL(clip.url).hostname.replace(/^www\./, '') }
    catch { return clip.domain ?? '' }
  })()

  const date = new Date(clip.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const panel   = isDark ? 'bg-black/70 border-white/5'   : 'bg-white/85 border-black/8'
  const divider = isDark ? 'border-white/5'                : 'border-black/6'
  const domain  = isDark ? 'text-white/30'                 : 'text-gray-400'
  const close   = isDark ? 'text-white/30 hover:text-white/70' : 'text-gray-300 hover:text-gray-600'
  const title   = isDark ? 'text-white hover:text-indigo-300'  : 'text-gray-900 hover:text-indigo-600'
  const summary = isDark ? 'text-white/40'                 : 'text-gray-500'
  const link    = isDark ? 'text-indigo-400/50 hover:text-indigo-400' : 'text-indigo-500/60 hover:text-indigo-600'
  const foot       = isDark ? 'text-white/20'                       : 'text-gray-300'
  const deleteBtn  = isDark ? 'text-white/35 hover:text-red-400/80' : 'text-gray-400 hover:text-red-500'
  const confirmBtn = isDark ? 'text-red-400/80 hover:text-red-300'  : 'text-red-500 hover:text-red-700'
  const cancelBtn  = isDark ? 'text-white/30 hover:text-white/60'   : 'text-gray-400 hover:text-gray-600'

  return (
    <div className={`absolute top-11 right-0 bottom-0 w-80 backdrop-blur-xl border-l flex flex-col z-20 overflow-hidden ${panel}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${divider}`}>
        <div className="flex items-center gap-2 min-w-0">
          {clip.favicon_url && (
            <img
              src={clip.favicon_url}
              alt=""
              className="w-4 h-4 rounded-sm flex-shrink-0"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          )}
          <span className={`text-xs truncate ${domain}`}>{hostname}</span>
        </div>
        <button
          onClick={onClose}
          className={`transition-colors text-xl leading-none flex-shrink-0 ml-2 ${close}`}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <a
          href={clip.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-sm font-medium leading-snug transition-colors ${title}`}
        >
          {clip.title ?? clip.url}
        </a>

        {clip.summary && (
          <p className={`text-xs leading-relaxed ${summary}`}>{clip.summary}</p>
        )}

        {clip.entities && <EntityChips entities={clip.entities} />}

        <a
          href={clip.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[11px] transition-colors ${link}`}
        >
          Open original ↗
        </a>
      </div>

      {/* Footer */}
      <div className={`px-4 py-2.5 border-t flex-shrink-0 flex items-center justify-between ${divider}`}>
        <p className={`text-[10px] ${foot}`}>{date}</p>

        {confirming ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setConfirming(false)} className={`text-[10px] transition-colors ${cancelBtn}`}>
              Cancel
            </button>
            <button
              onClick={() => onDelete(clip.id)}
              className={`text-[10px] font-medium transition-colors ${confirmBtn}`}
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className={`text-[10px] transition-colors ${deleteBtn}`}
          >
            Delete clip
          </button>
        )}
      </div>
    </div>
  )
}
