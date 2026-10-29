import { NextResponse } from 'next/server'
import { COOKIE_IDIOMA, esIdioma } from '@/lib/preferencias'
import { rutaPropia } from '@/lib/ruta-propia'

/**
 * `POST /idioma` — cambia el idioma y regresa a la misma página (#186).
 *
 * POST y no un enlace: cambia estado, y en este producto lo que cambia estado
 * va por POST (ver `app/salir/route.ts`). Un enlace lo seguiría cualquier
 * robot de vista previa, y el prefetch de Next lo dispararía solo.
 *
 * `volver` solo acepta rutas propias: nada que empiece con `//` ni con un
 * esquema, para que nadie use esta ruta como trampolín a otro dominio.
 */
export async function POST(req: Request) {
  const f = await req.formData()
  const l = f.get('l')
  const v = String(f.get('volver') ?? '/')
  const r = NextResponse.redirect(rutaPropia(v, req.url), 303)
  if (esIdioma(l)) {
    r.cookies.set(COOKIE_IDIOMA, l, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  }
  return r
}
