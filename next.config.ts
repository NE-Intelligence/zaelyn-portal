import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // La tarjeta de avance (#200) lee las fuentes del disco al dibujar.
  outputFileTracingIncludes: { '/api/tarjeta/[token]': ['./lib/fuentes/*.woff'] },
}

export default nextConfig
