import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // La tarjeta de Telegram (#200), los reportes y la tarjeta para redes (#202)
  // leen las fuentes y el logo de Zaelyn del disco al dibujar.
  outputFileTracingIncludes: { '/**': ['./lib/fuentes/*.woff', './public/logo/zaelyn-logo-320.png'] },
  // pptxgenjs NO va como externo: su paquete apunta a un .es.js sin
  // "type": "module", y en Vercel Node se niega a cargarlo («Cannot use import
  // statement outside a module»). Empaquetado por Next funciona igual en todos
  // lados. react-pdf sí es un módulo ES bien declarado.
  serverExternalPackages: ['@react-pdf/renderer'],
}

export default nextConfig
