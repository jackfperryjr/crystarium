import type { NextConfig } from 'next'

const basePath = process.env.BASE_PATH ?? ''

const config: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  basePath,
  assetPrefix: basePath,
}

export default config
