import type { NextConfig } from 'next'

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['bufferutil', 'utf-8-validate'],
  webpack: (config, { nextRuntime }) => {
    // Prevent webpack from injecting __dirname/__filename into Edge Runtime
    // bundles (e.g. __webpack_require__.ab = __dirname + "/"). Those globals
    // don't exist in V8 Isolates and cause MIDDLEWARE_INVOCATION_FAILED.
    if (nextRuntime === 'edge') {
      config.node = false
    }
    return config
  },
}

export default config
