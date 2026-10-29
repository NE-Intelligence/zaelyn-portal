/**
 * Recoger respuestas de Zaelyn, con espera larga (hasta 20 s en el motor).
 * Es lectura: GET, sin cambiar nada más que la marca de «entregado».
 */
import { NextResponse, type NextRequest } from 'next/server'
import { reenviarChat } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(req: NextRequest) {
  const desde = req.nextUrl.searchParams.get('desde')
  const espera = req.nextUrl.searchParams.get('espera')
  const q = new URLSearchParams()
  if (desde !== null && /^\d{1,18}$/.test(desde)) q.set('desde', desde)
  if (espera !== null && /^\d{1,2}$/.test(espera)) q.set('espera', espera)
  const r = await reenviarChat('/portal/chat/recibir', { metodo: 'GET', consulta: q.toString() })
  return new NextResponse(r.cuerpo, {
    status: r.status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  })
}
