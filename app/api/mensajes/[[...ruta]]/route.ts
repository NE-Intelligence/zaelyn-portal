/**
 * Mensajes entre personas desde el portal (Zaelyn DECISIONS #229).
 *
 * Lista cerrada de formas, para que esta ruta no sea un proxy abierto:
 *   GET  /api/mensajes                       → la lista
 *   GET  /api/mensajes/<id>?desde=&espera=   → los mensajes (espera larga)
 *   GET  /api/mensajes/adjunto/<id>          → un archivo
 *   POST /api/mensajes/<id>                  → escribir (JSON o archivo)
 *   POST /api/mensajes/directa               → abrir una directa por @
 *   POST /api/mensajes/accion/<accion>       → mostrar, borrar, bloquear, denunciar
 */
import { NextResponse, type NextRequest } from 'next/server'
import { reenviarMensajes } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const ID = /^[0-9a-f-]{36}$/
const ACCIONES = new Set(['mostrar', 'borrar', 'bloquear', 'denunciar'])
const TOPE_B = 4_400_000

type Ctx = { params: Promise<{ ruta?: string[] }> }

export async function GET(req: NextRequest, ctx: Ctx) {
  const r = (await ctx.params).ruta ?? []
  if (r.length === 0) return reenviarMensajes('/portal/mensajes', { metodo: 'GET' })
  if (r.length === 2 && r[0] === 'adjunto' && ID.test(r[1]!)) {
    return reenviarMensajes(`/portal/mensajes/adjunto/${r[1]}`, { metodo: 'GET' })
  }
  if (r.length === 1 && ID.test(r[0]!)) {
    const q = new URLSearchParams()
    const desde = req.nextUrl.searchParams.get('desde'); const espera = req.nextUrl.searchParams.get('espera')
    if (desde && /^\d{1,18}$/.test(desde)) q.set('desde', desde)
    if (espera && /^\d{1,2}$/.test(espera)) q.set('espera', espera)
    return reenviarMensajes(`/portal/mensajes/${r[0]}?${q}`, { metodo: 'GET' })
  }
  return NextResponse.json({ error: 'NO_EXISTE' }, { status: 404 })
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const r = (await ctx.params).ruta ?? []
  const tipo = (req.headers.get('content-type') ?? '').split(';')[0]!.trim()
  const cuerpo = await req.arrayBuffer()
  if (cuerpo.byteLength > TOPE_B) return NextResponse.json({ error: 'TAMANO' }, { status: 413 })
  if (r.length === 1 && r[0] === 'directa') {
    return reenviarMensajes('/portal/mensajes/directa', { metodo: 'POST', cuerpo, tipo: 'application/json' })
  }
  if (r.length === 2 && r[0] === 'accion' && ACCIONES.has(r[1]!)) {
    return reenviarMensajes(`/portal/mensajes/accion/${r[1]}`, { metodo: 'POST', cuerpo, tipo: 'application/json' })
  }
  if (r.length === 1 && ID.test(r[0]!)) {
    const cabeceras: Record<string, string> = {}
    for (const k of ['x-zaelyn-nombre', 'x-zaelyn-texto']) { const v = req.headers.get(k); if (v) cabeceras[k] = v.slice(0, 6000) }
    return reenviarMensajes(`/portal/mensajes/${r[0]}`, { metodo: 'POST', cuerpo, tipo: tipo || 'application/json', cabeceras })
  }
  return NextResponse.json({ error: 'NO_EXISTE' }, { status: 404 })
}
