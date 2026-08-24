import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Explicitly opt into Turbopack (the Next.js 16 default) to avoid webpack plugin conflicts.
  // next-pwa v5 uses Webpack internals — use manifest.json + Dexie offline instead for now.
  turbopack: {},
}

export default nextConfig
