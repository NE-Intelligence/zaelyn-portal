import { descargarHoras } from '@/lib/api'
import { esFecha } from '@/lib/horas'

/** `GET /app/g/<grupo>/horas/excel?desde&hasta` — el reporte de UN proyecto (#191). Solo quien lo dirige. */
export async function GET(req: Request, { params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params
  const u = new URL(req.url)
  const desde = u.searchParams.get('desde'), hasta = u.searchParams.get('hasta')
  if (!esFecha(desde) || !esFecha(hasta) || !/^[0-9a-f-]{36}$/i.test(grupo)) return new Response('Inválido', { status: 400 })
  return descargarHoras({ tipo: 'proyecto', groupId: grupo, desde, hasta })
}
