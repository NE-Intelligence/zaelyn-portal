import { descargarHoras } from '@/lib/api'

/** `GET /app/g/<grupo>/<plan>/obra/estimacion/<n>` — la estimación en Excel. */
export async function GET(_req: Request, { params }: { params: Promise<{ grupo: string; plan: string; numero: string }> }) {
  const { grupo, plan, numero } = await params
  if (!/^[0-9a-f-]{36}$/i.test(grupo) || !/^[0-9a-f-]{36}$/i.test(plan) || !/^\d{1,4}$/.test(numero)) return new Response('Inválido', { status: 400 })
  return descargarHoras({ tipo: 'obra-estimacion', groupId: grupo, planId: plan, numero: Number(numero) })
}
