import { descargarHoras } from '@/lib/api'

/** `GET /app/horas/envio/<id>?formato=pdf|xlsx` — el documento de un envío de horas (#192). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const formato = new URL(req.url).searchParams.get('formato') === 'xlsx' ? 'xlsx' : 'pdf'
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response('Inválido', { status: 400 })
  return descargarHoras({ tipo: 'envio', id, formato })
}
