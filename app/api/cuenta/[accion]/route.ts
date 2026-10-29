/**
 * La cuenta web desde el portal: correo, passkeys, avisos al navegador y
 * vincular Telegram (Zaelyn DECISIONS #229). Lista cerrada de acciones, para
 * que esta ruta no sea un proxy abierto a la API.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { cuenta, esAccionCuenta, metodoDeCuenta } from '@/lib/api'

export const dynamic = 'force-dynamic'

async function atender(req: NextRequest, accion: string, metodo: 'GET' | 'POST') {
  if (!esAccionCuenta(accion) || metodoDeCuenta(accion) !== metodo) {
    return NextResponse.json({ error: 'NO_EXISTE' }, { status: 404 })
  }
  const cuerpo = metodo === 'POST' ? await req.text() : undefined
  if (cuerpo && cuerpo.length > 20_000) return NextResponse.json({ error: 'DEMASIADO_GRANDE' }, { status: 413 })
  const r = await cuenta(accion, cuerpo)
  return new NextResponse(r.cuerpo, { status: r.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ accion: string }> }) {
  return atender(req, (await ctx.params).accion, 'GET')
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ accion: string }> }) {
  return atender(req, (await ctx.params).accion, 'POST')
}
