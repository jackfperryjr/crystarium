'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

interface Announcement {
  id: string
  message: string
  type: 'info' | 'warning' | 'maintenance'
  dismissible: boolean
  active_until: string | null
}

const STORAGE_KEY = 'magiloom_dismissed_announcements'

function getDismissed(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}
function markDismissed(id: string) {
  const list = getDismissed()
  if (!list.includes(id)) localStorage.setItem(STORAGE_KEY, JSON.stringify([...list, id]))
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1"/>
      <rect x="6.25" y="6" width="1.5" height="4.5" rx="0.75" fill="currentColor"/>
      <circle cx="7" cy="3.75" r="0.875" fill="currentColor"/>
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1"/>
      <rect x="6.25" y="3.5" width="1.5" height="4.5" rx="0.75" fill="currentColor"/>
      <circle cx="7" cy="10.25" r="0.875" fill="currentColor"/>
    </svg>
  )
}

function MaintenanceIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeOpacity="0.7" strokeWidth="1"/>
      <path d="M9.5 5.5a2.5 2.5 0 0 1-3.5 3.5L4.5 10.5l-1-1 1.5-1.5A2.5 2.5 0 0 1 8.5 4l-1.25 1.25.5.5L9 5.5l.5.5z" fill="currentColor" fillOpacity="0.85"/>
    </svg>
  )
}

const ICONS = {
  info:        InfoIcon,
  warning:     WarningIcon,
  maintenance: MaintenanceIcon,
}

const STYLES = {
  info: {
    dark:  { bg: 'rgba(79,70,229,0.12)', border: 'rgba(99,102,241,0.25)', color: 'rgb(165,180,252)' },
    light: { bg: 'rgba(238,242,255,1)',   border: 'rgba(165,180,252,0.5)', color: 'rgb(79,70,229)'   },
  },
  warning: {
    dark:  { bg: 'rgba(180,130,0,0.12)', border: 'rgba(245,158,11,0.25)', color: 'rgb(252,211,77)'  },
    light: { bg: 'rgba(255,251,235,1)',   border: 'rgba(251,191,36,0.5)',  color: 'rgb(146,64,14)'   },
  },
  maintenance: {
    dark:  { bg: 'rgba(220,38,38,0.10)', border: 'rgba(248,113,113,0.22)', color: 'rgb(252,165,165)' },
    light: { bg: 'rgba(255,241,242,1)',   border: 'rgba(252,165,165,0.5)',  color: 'rgb(185,28,28)'   },
  },
}

interface Props { isDark: boolean }

export default function AnnouncementBanner({ isDark }: Props) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    const supabase = createClient()
    const now = new Date().toISOString()
    supabase
      .from('announcements')
      .select('id, message, type, dismissible, active_until')
      .lte('active_from', now)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) { console.error('[AnnouncementBanner]', error); return }
        if (!data?.length) return
        const dismissed = getDismissed()
        const active = data.find(
          a => (!a.active_until || a.active_until >= now) && !dismissed.includes(a.id)
        )
        if (active) setAnnouncement(active as Announcement)
      })
  }, [])

  if (!announcement) return null

  const s = STYLES[announcement.type][isDark ? 'dark' : 'light']
  const Icon = ICONS[announcement.type]

  return (
    <div
      className="relative flex items-center justify-center px-10 py-2 border-b text-xs"
      style={{ background: s.bg, borderColor: s.border, color: s.color }}
    >
      <span className="flex items-center gap-2">
        <Icon />
        {announcement.message}
      </span>
      {announcement.dismissible && (
        <button
          onClick={() => { markDismissed(announcement.id); setAnnouncement(null) }}
          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-90 transition-opacity text-base leading-none"
          style={{ color: s.color }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  )
}
