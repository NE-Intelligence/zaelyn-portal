/**
 * La puerta de todo lo que cambia estado: mismo origen o nada.
 *
 * Ref: auditoría del 25 oct 2026 (motor, docs/BACKLOG.md «Primero»), DECISIONS #172
 *
 * ── LO QUE CIERRA ──────────────────────────────────────────────────────
 *
 * `/entrar/canjear` aceptaba un POST armado en OTRO sitio: una página ajena
 * podía canjear un pase suyo en tu navegador y dejarte con SU sesión puesta
 * (fijación de sesión). Lo que vieras o escribieras después quedaba en la
 * cuenta del atacante. Cada ruta comprobaba el origen a su manera —el
 * editor sí, el canje no—, y una regla que depende de que cada ruta se
 * acuerde es una regla que alguna ruta olvida.
 *
 * Aquí se comprueba UNA vez, para TODO método que no sea de lectura:
 *
 *  - Con `Origin`, tiene que ser este mismo sitio. `null` (lo que manda un
 *    iframe aislado o una redirección rara) no es este sitio.
 *  - Sin `Origin`, el navegador moderno igual dice de dónde viene en
 *    `Sec-Fetch-Site`; si dice `cross-site`, fuera.
 *  - Sin ninguna de las dos no hay navegador de por medio (curl, un script):
 *    ahí no hay cookie de otra persona que robar, así que se deja pasar.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { mismoOrigen, politicaDeContenido } from '@/lib/ruta-propia'

const LECTURA = new Set(['GET', 'HEAD', 'OPTIONS'])

export function proxy(req: NextRequest) {
  if (!LECTURA.has(req.method)
    && !mismoOrigen(req.headers.get('origin'), req.headers.get('sec-fetch-site'), req.nextUrl.origin)) {
    return NextResponse.json({ error: 'ORIGEN' }, { status: 403 })
  }

  // La política de contenido, con un nonce nuevo en cada petición. Todas las
  // páginas de este sitio ya son dinámicas, así que el nonce no cuesta nada.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = politicaDeContenido(nonce, process.env.NODE_ENV === 'development')
  const cabeceras = new Headers(req.headers)
  cabeceras.set('x-nonce', nonce)
  cabeceras.set('Content-Security-Policy', csp)
  const res = NextResponse.next({ request: { headers: cabeceras } })
  res.headers.set('Content-Security-Policy', csp)
  return res
}

export const config = {
  // Los archivos estáticos no cambian estado; no vale la pena pasarlos por aquí.
  matcher: ['/((?!_next/static|_next/image|favicon|logo/|fuentes/).*)'],
}
