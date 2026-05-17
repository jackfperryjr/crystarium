'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export interface UserPrefs {
  theme: 'dark' | 'light' | 'system'
  edge_threshold: number
  default_view: string
  always_show_labels: boolean
}

const DEFAULTS: UserPrefs = {
  theme: 'system',
  edge_threshold: 0.7,
  default_view: 'graph',
  always_show_labels: false,
}

export function useUserPrefs() {
  const [prefs, setPrefs] = useState<UserPrefs>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestPrefs = useRef<UserPrefs>(DEFAULTS)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      const { data } = await supabase
        .from('user_preferences')
        .select('prefs')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data?.prefs) {
        const merged = { ...DEFAULTS, ...data.prefs }
        setPrefs(merged)
        latestPrefs.current = merged
      }
      setLoading(false)
    })
  }, [])

  const updatePref = useCallback(<K extends keyof UserPrefs>(key: K, value: UserPrefs[K]) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: value }
      latestPrefs.current = next
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          prefs: latestPrefs.current,
          updated_at: new Date().toISOString(),
        })
      }, 800)
      return next
    })
  }, [])

  return { prefs, updatePref, loading }
}
