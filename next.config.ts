import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // La tarjeta de Telegram (#200), los reportes y la tarjeta para redes (#202)
  // leen las fuentes y el logo de Zaelyn del disco al dibujar.
  outputFileTracingIncludes: { '/**': ['./lib/fuentes/*.woff', './public/logo/zaelyn-logo-320.png'] },
  serverExternalPackages: ['@react-pdf/renderer', 'pptxgenjs'],
}

export default nextConfig
