'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8 bg-[#07070f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
          <span className="text-indigo-400 text-2xl">✦</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">Crystarium</h1>
          <p className="text-sm text-white/30 mt-1.5">Your knowledge, crystallized.</p>
        </div>
      </div>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="px-6 py-2.5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Redirecting…' : 'Sign in with Google'}
      </button>
    </div>
  )
}
