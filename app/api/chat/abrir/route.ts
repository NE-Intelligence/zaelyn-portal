/**
 * Abrir en la conversación con Zaelyn una cosa del Inicio (pendiente,
 * recordatorio, evento o actividad): el motor la deja como foco y contesta con
 * su tarjeta de edición (Completada, Fechas, Posponer…), que llega por
 * `/portal/chat/recibir` a la columna de Zaelyn. SOLO POST.
 */
import { NextResponse, type NextRequest } from 'next/server'
import { reenviarChat } from '@/lib/api'

export const dynamic = 'force-dynamic'

const TIPOS = new Set(['pendiente', 'recordatorio', 'evento', 'actividad'])

export async function POST(req: NextRequest) {
  const j = (await req.json().catch(() => null)) as { tipo?: unknown; id?: unknown; etiqueta?: unknown } | null
  if (!j || typeof j.tipo !== 'string' || !TIPOS.has(j.tipo) || typeof j.id !== 'string' || j.id.length > 200) {
    return NextResponse.json({ error: 'PEDIDO_INVALIDO' }, { status: 400 })
  }
  const etiqueta = typeof j.etiqueta === 'string' ? j.etiqueta.slice(0, 120) : undefined
  const r = await reenviarChat('/portal/chat/abrir', {
    metodo: 'POST',
    cuerpo: JSON.stringify({ tipo: j.tipo, id: j.id, ...(etiqueta ? { etiqueta } : {}) }),
    tipo: 'application/json',
  })
  return new NextResponse(r.cuerpo, { status: r.status, headers: { 'content-type': 'application/json' } })
}
