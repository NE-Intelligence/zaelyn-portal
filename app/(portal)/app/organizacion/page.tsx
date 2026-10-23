import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { Organizacion } from '@/components/plan/Organizacion'
import { organizacion, planYUso } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** `/app/organizacion` — varios Sponsors, una factura (Zaelyn DECISIONS #180). */
export default async function OrganizacionPagina({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams
  const [r, p] = await Promise.all([organizacion(), planYUso()])
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  if (!p.ok) return <SinSesion fallo={p.fallo} />
  return (
    <>
      <Barra area="cuenta" migas={[{ texto: 'Plan y uso', href: '/app/plan' }, { texto: 'Organización' }]} sesion modo="cuenta" />
      <main className="pt-lienzo">
        <Organizacion o={r.dato.organizacion} cobro={r.dato.cobro} plan={p.dato}
          pagado={q['pagado'] === '1'} codigo={typeof q['codigo'] === 'string' ? q['codigo'] : ''} />
      </main>
      <Pie modo="cuenta" />
    </>
  )
}
