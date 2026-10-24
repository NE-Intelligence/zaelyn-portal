import { descargarHoras } from '@/lib/api'

/** `GET /app/g/<grupo>/presupuesto/excel` — el presupuesto en Excel (#195). Solo quien dirige. */
export async function GET(_req: Request, { params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params
  if (!/^[0-9a-f-]{36}$/i.test(grupo)) return new Response('Inválido', { status: 400 })
  return descargarHoras({ tipo: 'presupuesto', groupId: grupo })
}
