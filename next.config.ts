import type { NextConfig } from 'next'

/**
 * Cabeceras de seguridad para todo el sitio (auditoría, 25 oct 2026). La
 * política de contenido (CSP) NO está aquí: lleva un nonce por petición y la
 * pone `proxy.ts`.
 */
/** La app de conversación embebida (Riel.tsx) también usa el micrófono. */
const APP = (() => {
  try {
    const u = new URL(process.env.ZAELYN_APP_URL ?? '')
    return u.protocol === 'https:' ? u.origin : null
  } catch { return null }
})()

const SEGURIDAD = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  // El micrófono es del propio sitio (la voz del chat, fase 1); nada más.
  { key: 'Permissions-Policy', value: `microphone=(self${APP ? ` "${APP}"` : ''}), camera=(), geolocation=(), payment=()` },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: SEGURIDAD }]
  },
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
