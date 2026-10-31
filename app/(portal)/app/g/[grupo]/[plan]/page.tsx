import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { Lienzo, esVista } from '@/components/portal/Plan'
import { SinSesion } from '@/components/portal/SinSesion'
import { Reabrir } from '@/components/editor/Reabrir'
import { elPlan, fichaDelPlan, pmoDelGrupo, reportesDelPlan, sugerenciasDelGrupo } from '@/lib/api'
import { Sugerencias } from '@/components/portal/Sugerencias'
import { ModoPmo } from '@/components/portal/ModoPmo'
import { General } from '@/components/portal/General'
import { filasDelArbol } from '@/lib/arbol'

export const dynamic = 'force-dynamic'

/** `/app/g/<grupo>/<plan>` — el plan, con la vista que diga `?v=`. */
export default async function Plan({
  params, searchParams,
}: {
  params: Promise<{ grupo: string; plan: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { grupo, plan } = await params
  const sp = await searchParams
  const vista = esVista(sp.v)
  // El tramo del Tablero (#200): [fase, ...grupos], tal como lo arma el Resumen.
  let en: Array<string | null> | null = null
  if (typeof sp.en === 'string') {
    try {
      const x: unknown = JSON.parse(sp.en)
      if (Array.isArray(x) && x.length && x.length <= 12 && x.every(y => y === null || (typeof y === 'string' && y.length <= 200))) en = x as Array<string | null>
    } catch { /* una dirección rota es el plan entero */ }
  }
  const leido = new Date().toISOString()

  const [r, pmo, sug] = await Promise.all([elPlan(grupo, plan), pmoDelGrupo(grupo), sugerenciasDelGrupo(grupo)])
  if (!r.ok) return <SinSesion fallo={r.fallo} />

  const e = r.dato.estado
  // Solo quien puede mover el plan de los demás lo reorganiza; el motor lo
  // vuelve a comprobar al abrir.
  const dirige = !!r.dato.rol && !['observador', 'miembro', 'integrante', 'supervisor', 'a_cargo'].includes(r.dato.rol)
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
        <div className="hr-enlace">
          {/* Un motor viejo no tiene la ruta: entonces simplemente no se enseña. */}
          {pmo.ok && <ModoPmo grupo={grupo} inicial={pmo.dato} abrir={sp.seguimiento === '1'}
            personas={e.personas.filter(p => p.tieneCuenta).map(p => ({ id: p.id, nombre: p.nombre }))} />}
          {dirige && e.plan && <Reabrir grupo={grupo} plan={e.plan.id} />}
          {dirige
            ? <><Link className="ed-btn suave chico" href={`/app/g/${grupo}/horas`}>Horas del proyecto</Link>{r.dato.rol !== 'stakeholder' && <Link className="ed-btn suave chico" href={`/app/g/${grupo}/presupuesto`}>Presupuesto</Link>}</>
            : <Link className="ed-btn suave chico" href="/app/horas">Registrar mis horas</Link>}
        </div>
        {sug.ok && <Sugerencias grupo={grupo} inicial={sug.dato.sugerencias} />}
        <Lienzo v={r.dato} vista={vista} base={`/app/g/${grupo}/${plan}`} leido={leido} en={en}
          general={vista === 'general' && e.plan ? await seccionGeneral(grupo, e.plan.id, `/app/g/${grupo}/${plan}`, r.dato) : null} />
      </main>
      <Pie />
    </>
  )
}

/** La sección General (#202): la ficha, los reportes emitidos y el árbol para marcar facturación. */
async function seccionGeneral(grupo: string, planId: string, base: string, v: Parameters<typeof filasDelArbol>[0]) {
  const [f, rs] = await Promise.all([fichaDelPlan(grupo, planId), reportesDelPlan(grupo, planId)])
  if (!f.ok) return <div className="pt-vacio"><b>No pude leer la sección General</b><span>Vuelve a intentarlo en un momento.</span></div>
  return (
    <General grupo={grupo} plan={planId} base={base} inicial={f.dato} reportes={rs.ok ? rs.dato : []}
      filas={filasDelArbol(v, false)} fases={v.fases.map(x => x.nombre).filter((x): x is string => !!x)}
      hoy={v.estado.hoy} veredicto={v.estado.veredicto} />
  )
}
