import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { Lienzo, esVista } from '@/components/portal/Plan'
import { SinSesion } from '@/components/portal/SinSesion'
import { Reabrir } from '@/components/editor/Reabrir'
import { elPlan } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** `/app/g/<grupo>/<plan>` — el plan, con la vista que diga `?v=`. */
export default async function Plan({
  params, searchParams,
}: {
  params: Promise<{ grupo: string; plan: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { grupo, plan } = await params
  const vista = esVista((await searchParams).v)
  const leido = new Date().toISOString()

  const r = await elPlan(grupo, plan)
  if (!r.ok) return <SinSesion fallo={r.fallo} />

  const e = r.dato.estado
  // Solo quien puede mover el plan de los demás lo reorganiza; el motor lo
  // vuelve a comprobar al abrir.
  const dirige = !!r.dato.rol && !['observador', 'miembro', 'integrante', 'a_cargo'].includes(r.dato.rol)
  return (
    <>
      <Barra area="proyectos"
        migas={[
          { texto: 'Mis grupos', href: '/app' },
          { texto: e.grupo.nombre, href: `/app/g/${grupo}` },
          { texto: e.plan?.nombre ?? 'Plan' },
        ]}
        sesion
      />
      <main className="pt-lienzo">
        {dirige && e.plan && <Reabrir grupo={grupo} plan={e.plan.id} />}
        <div className="hr-enlace">
          {dirige
            ? <Link className="ed-btn suave chico" href={`/app/g/${grupo}/horas`}>Horas del proyecto</Link>
            : <Link className="ed-btn suave chico" href="/app/horas">Registrar mis horas</Link>}
        </div>
        <Lienzo v={r.dato} vista={vista} base={`/app/g/${grupo}/${plan}`} leido={leido} />
      </main>
      <Pie />
    </>
  )
}
