'use client'

import { useState } from 'react'
import type { Clip } from '@/lib/types'
import { domainHue } from '@/lib/utils'

interface Props {
  clips: Clip[]
  selectedId: string | null
  isDark: boolean
  onClipClick: (clip: Clip) => void
}

export default function DomainView({ clips, selectedId, isDark, onClipClick }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const groups = [...clips
    .reduce((acc, clip) => {
      const key = clip.domain ?? '(unknown)'
      acc.set(key, [...(acc.get(key) ?? []), clip])
      return acc
    }, new Map<string, Clip[]>())
    .entries()]
    .sort((a, b) => b[1].length - a[1].length)

  const toggle = (d: string) =>
    setCollapsed(prev => { const s = new Set(prev); s.has(d) ? s.delete(d) : s.add(d); return s })

  const divider   = isDark ? 'border-white/6'          : 'border-gray-200'
  const groupBg   = isDark ? 'bg-white/[0.03]'         : 'bg-gray-50'
  const groupHdr  = isDark ? 'hover:bg-white/[0.06]'   : 'hover:bg-gray-100'
  const rowHover  = isDark ? 'hover:bg-white/[0.04]'   : 'hover:bg-gray-50'
  const rowSel    = isDark ? 'bg-white/[0.08]'         : 'bg-indigo-50/70'
  const titleText = isDark ? 'text-white/80'           : 'text-gray-900'
  const snippet   = isDark ? 'text-white/30'           : 'text-gray-500'
  const count     = isDark ? 'text-white/25'           : 'text-gray-400'
  const chevron   = isDark ? 'text-white/25'           : 'text-gray-400'

  if (!groups.length) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className={`text-sm ${isDark ? 'text-white/20' : 'text-gray-400'}`}>No clips match your filters.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-5 px-4 flex flex-col gap-3">
      {groups.map(([d, groupClips]) => {
        const hue  = domainHue(d === '(unknown)' ? null : d)
        const l    = isDark ? 65 : 43
        const color = `hsl(${hue}, 58%, ${l}%)`
        const open = !collapsed.has(d)

        return (
          <div key={d} className={`rounded-xl border overflow-hidden ${divider}`}>
            <button
              onClick={() => toggle(d)}
              className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors ${groupBg} ${groupHdr}`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-sm font-medium" style={{ color }}>{d}</span>
                <span className={`text-[11px] ${count}`}>{groupClips.length}</span>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                className={`transition-transform ${chevron} ${open ? '' : '-rotate-90'}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {open && groupClips.map((clip, i) => (
              <button
                key={clip.id}
                onClick={() => onClipClick(clip)}
                className={`w-full text-left px-4 py-3 border-t transition-colors ${divider} ${clip.id === selectedId ? rowSel : rowHover}`}
              >
                <p className={`text-sm font-medium line-clamp-1 ${titleText}`}>{clip.title ?? clip.url}</p>
                {clip.summary && (
                  <p className={`text-xs mt-0.5 line-clamp-1 ${snippet}`}>{clip.summary}</p>
                )}
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
