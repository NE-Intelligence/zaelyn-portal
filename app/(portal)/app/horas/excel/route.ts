import { descargarHoras } from '@/lib/api'
import { esFecha } from '@/lib/horas'

/** `GET /app/horas/excel?desde&hasta[&groupId]` — mi reporte de horas (#191). */
export async function GET(req: Request) {
  const u = new URL(req.url)
  const desde = u.searchParams.get('desde'), hasta = u.searchParams.get('hasta')
  const groupId = u.searchParams.get('groupId')
  if (!esFecha(desde) || !esFecha(hasta)) return new Response('Periodo inválido', { status: 400 })
  return descargarHoras({ tipo: 'mias', desde, hasta, ...(groupId && /^[0-9a-f-]{36}$/i.test(groupId) ? { groupId } : {}) })
}
