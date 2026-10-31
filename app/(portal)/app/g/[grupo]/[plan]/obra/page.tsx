import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { Obra } from '@/components/portal/Obra'
import { laObra } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** `/app/g/<grupo>/<plan>/obra` — la obra: presupuesto, materiales y estimaciones. */
export default async function PaginaObra({ params }: { params: Promise<{ grupo: string; plan: string }> }) {
  const { grupo, plan } = await params
  const r = await laObra(grupo, plan)
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  const e = r.dato
  return (
    <>
      <Barra area="proyectos" sesion migas={[
        { texto: 'Mis grupos', href: '/app' }, { texto: e.grupo, href: `/app/g/${grupo}` },
        { texto: e.plan, href: `/app/g/${grupo}/${plan}` }, { texto: 'Obra' },
      ]} />
      <main className="pt-lienzo">
        <div className="pt-cabeza"><div className="fila"><div>
          <h1>{e.plan}</h1>
          <div className="meta"><span>Obra · {e.partidas.length.toLocaleString('es-MX')} partidas</span><span>MXN sin IVA</span></div>
        </div>
        <Link className="ed-btn suave chico" href={`/app/g/${grupo}/${plan}?v=gantt`}>Ver el Gantt</Link></div></div>
        <Obra grupo={grupo} plan={plan} e={e} />
      </main>
      <Pie />
    </>
  )
}
