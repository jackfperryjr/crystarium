import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // bufferutil and utf-8-validate are optional native addons for 'ws'.
    // They use __dirname which breaks in ESM/Edge contexts when bundled.
    config.externals.push('bufferutil', 'utf-8-validate')
    return config
  },
}

export default config
