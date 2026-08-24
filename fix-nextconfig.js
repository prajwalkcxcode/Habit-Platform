const fs = require('fs');

// Remove next-pwa wrapper — Next.js 16 Turbopack is incompatible with next-pwa's webpack plugin.
// We still get PWA features via: manifest.json + OfflineBanner + IndexedDB (Dexie).
// A proper service worker can be added later when next-pwa supports Turbopack.
const content = `import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Explicitly opt into Turbopack (the Next.js 16 default) to avoid webpack plugin conflicts.
  // next-pwa v5 uses Webpack internals — use manifest.json + Dexie offline instead for now.
  turbopack: {},
}

export default nextConfig
`;

fs.writeFileSync('next.config.ts', content, 'utf8');
console.log('Simplified next.config.ts (removed next-pwa webpack wrapper for Turbopack compat)');
