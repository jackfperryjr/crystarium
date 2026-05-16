import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['react-force-graph-2d', 'three'],
}

export default config
