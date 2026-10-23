import { descargarHoras } from '@/lib/api'
import { esFecha } from '@/lib/horas'

/** `GET /app/g/<grupo>/horas/aprobadas?desde&hasta&formato=pdf|xlsx` — lo aprobado del proyecto, junto (#192). */
export async function GET(req: Request, { params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params
  const u = new URL(req.url)
  const desde = u.searchParams.get('desde'), hasta = u.searchParams.get('hasta')
  const formato = u.searchParams.get('formato') === 'xlsx' ? 'xlsx' : 'pdf'
  if (!esFecha(desde) || !esFecha(hasta) || !/^[0-9a-f-]{36}$/i.test(grupo)) return new Response('Inválido', { status: 400 })
  return descargarHoras({ tipo: 'aprobadas', groupId: grupo, desde, hasta, formato })
}
