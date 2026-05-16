import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  // Keep native addons out of the server bundle. ws (via @supabase/realtime-js)
  // optionally requires these; bundling them breaks because they use __dirname.
  serverExternalPackages: ['bufferutil', 'utf-8-validate'],
}

export default config
