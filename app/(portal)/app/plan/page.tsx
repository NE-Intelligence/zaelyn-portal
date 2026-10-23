import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { PlanYUso } from '@/components/plan/PlanYUso'
import { planYUso } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** `/app/plan` — plan y uso de la cuenta (Zaelyn DECISIONS #179). */
export default async function PlanPagina({
  searchParams,
}: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams
  const r = await planYUso()
  if (!r.ok) return <SinSesion fallo={r.fallo} inicio="planes" />
  return (
    <>
      <Barra area="cuenta" migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: 'Plan y uso' }]} sesion modo="cuenta" />
      <main className="pt-lienzo">
        <PlanYUso v={r.dato} pagado={q['pagado'] === '1'} inicial={q['plan'] === 'base' || q['plan'] === 'family' || q['plan'] === 'pro' ? q['plan'] : null} />
      </main>
      <Pie modo="cuenta" />
    </>
  )
}
