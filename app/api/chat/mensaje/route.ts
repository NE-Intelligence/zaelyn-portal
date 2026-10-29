/**
 * Mandarle algo a Zaelyn desde el portal: texto o el toque de un botón.
 * SOLO POST; el mismo origen lo exige `proxy.ts`.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { reenviarChat } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const cuerpo = await req.text()
  if (cuerpo.length > 8_000) return NextResponse.json({ error: 'DEMASIADO_GRANDE' }, { status: 413 })
  const r = await reenviarChat('/portal/chat/mensaje', { metodo: 'POST', cuerpo, tipo: 'application/json' })
  return new NextResponse(r.cuerpo, { status: r.status, headers: { 'content-type': 'application/json' } })
}
