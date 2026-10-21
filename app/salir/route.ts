/**
 * `/salir` — entregar el token. SOLO POR POST.
 *
 * Se cierra en Zaelyn Y se borra la cookie, en ese orden. Borrar solo la
 * cookie dejaría la sesión viva del lado del servidor: quien tuviera el token
 * seguiría entrando, y la persona creería que cerró.
 *
 * ── POR QUÉ NO HAY `GET`, Y CÓMO SE DESCUBRIÓ ──────────────────────────
 *
 * La primera versión aceptaba las dos, y «Salir» era un `<Link>`. Next
 * PREFETCHEA los enlaces: en cuanto la barra se pintaba, el navegador pedía
 * `/salir` por su cuenta y la sesión se cerraba sola. La primera pantalla
 * cargaba bien —la petición iba en paralelo— y la segunda decía «tu sesión no
 * está abierta». Se persiguió como un problema de cookies antes de ver que
 * era el prefetch.
 *
 * Pero el prefetch solo lo hizo evidente: cerrar sesión NUNCA debió ser un
 * GET. Cualquier cosa que siga enlaces —un antivirus, el previsualizador de
 * un chat, un rastreador— habría cerrado la sesión de la persona sin que
 * nadie tocara nada. Un GET no cambia estado.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { COOKIE, salir } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  await salir()
  const res = NextResponse.redirect(`${req.nextUrl.origin}/`, { status: 303 })
  res.cookies.set({ name: COOKIE, value: '', path: '/', maxAge: 0 })
  return res
}
