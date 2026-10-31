import { redirect } from 'next/navigation'

/**
 * `/app/plan/comprar/<clave>` — el destino del botón «Comprar …» que manda
 * Zaelyn cuando una cuenta topa (decisiones/2026-10-31-precios-pmo-por-asiento
 * del motor). El pase solo admite rutas sin parámetros, así que aquí se
 * traduce a «Plan y uso» con ese asiento en el carrito.
 */
export default async function Comprar({ params }: { params: Promise<{ clave: string }> }) {
  const { clave } = await params
  const c = /^[a-z]{4,12}$/.test(clave) ? clave : ''
  redirect(c ? `/app/plan?comprar=${c}` : '/app/plan')
}
