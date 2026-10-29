/**
 * Una nota de voz desde el portal. El audio pasa por aquí y por memoria del
 * motor, se transcribe y se suelta: no se guarda (Zaelyn DECISIONS #63).
 */
import { NextResponse, type NextRequest } from 'next/server'
import { reenviarChat } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** Dos minutos de voz comprimida caben de sobra; Vercel corta en 4.5 MB. */
const TOPE_B = 4_000_000

export async function POST(req: NextRequest) {
  const tipo = (req.headers.get('content-type') ?? '').split(';')[0]!.trim()
  if (!/^audio\/(webm|ogg|mp4|mpeg|aac|x-m4a)$/.test(tipo)) {
    return NextResponse.json({ error: 'TIPO' }, { status: 415 })
  }
  const datos = await req.arrayBuffer()
  if (!datos.byteLength) return NextResponse.json({ error: 'FALTA_AUDIO' }, { status: 400 })
  if (datos.byteLength > TOPE_B) return NextResponse.json({ error: 'DEMASIADO_GRANDE' }, { status: 413 })
  const segundos = String(Math.max(0, Math.min(600, Number(req.headers.get('x-zaelyn-segundos')) || 0)))
  const r = await reenviarChat('/portal/chat/voz', {
    metodo: 'POST', cuerpo: datos, tipo, cabeceras: { 'x-zaelyn-segundos': segundos },
  })
  return new NextResponse(r.cuerpo, { status: r.status, headers: { 'content-type': 'application/json' } })
}
