import { logoDelPlan } from '@/lib/api'

/** Un logo del proyecto (#202), con la sesión de quien lo pide. */
export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ grupo: string; plan: string; cual: string }> }) {
  const { grupo, plan, cual } = await params
  if (cual !== 'sponsor' && cual !== 'cliente') return new Response('No encontrado', { status: 404 })
  const l = await logoDelPlan(grupo, plan, cual)
  if (!l) return new Response('No encontrado', { status: 404 })
  return new Response(l.datos, { headers: { 'content-type': l.mime, 'cache-control': 'private, max-age=60' } })
}
