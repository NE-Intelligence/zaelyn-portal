/**
 * Entrar o darse de alta sin Telegram (Zaelyn DECISIONS #228). SOLO POST.
 *
 * Cuando el motor devuelve una sesión, ESTA ruta la convierte en la cookie
 * httpOnly y le contesta al navegador solo `{ ok, destino }`: el token nunca
 * pasa por el JavaScript de la página, igual que en el canje del pase.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { acceso, COOKIE, DIAS_SESION, esAccionAcceso } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, ctx: { params: Promise<{ accion: string }> }) {
  const { accion } = await ctx.params
  if (!esAccionAcceso(accion)) return NextResponse.json({ error: 'NO_EXISTE' }, { status: 404 })
  const cuerpo = await req.text()
  if (cuerpo.length > 20_000) return NextResponse.json({ error: 'DEMASIADO_GRANDE' }, { status: 413 })
  const ip = req.headers.get('x-real-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const r = await acceso(accion, cuerpo, ip)
  const token = typeof r.json['token'] === 'string' ? r.json['token'] : null
  if (r.status === 200 && token) {
    const res = NextResponse.json({ ok: true, estado: 'sesion', handle: r.json['handle'] ?? null })
    res.cookies.set({
      name: COOKIE, value: token, httpOnly: true,
      secure: req.nextUrl.protocol === 'https:', sameSite: 'lax', path: '/',
      maxAge: DIAS_SESION * 24 * 60 * 60,
    })
    return res
  }
  return NextResponse.json(r.json, { status: r.status })
}
