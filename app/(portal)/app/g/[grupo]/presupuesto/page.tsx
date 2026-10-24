import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { Presupuesto } from '@/components/horas/Presupuesto'
import { elPresupuesto } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Presupuesto' }

/** `/app/g/<grupo>/presupuesto` — tarifas, monto aprobado y valor ganado (#195). Solo quien dirige. */
export default async function PaginaPresupuesto({ params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params
  const r = await elPresupuesto(grupo)
  if (!r.ok && r.fallo === 'SIN_PERMISO') {
    return (
      <>
        <Barra area="proyectos" migas={[{ texto: 'Proyecto', href: `/app/g/${grupo}?quedarme=1` }, { texto: 'Presupuesto' }]} sesion />
        <main className="pt-lienzo">
          <div className="pt-vacio" style={{ maxWidth: 560 }}>
            <b>El presupuesto es de quien dirige el proyecto</b>
            <span>Las tarifas son información de cada persona: solo las ve y las captura quien dirige. Tus horas están en <Link href="/app/horas">Mis horas</Link>.</span>
          </div>
        </main>
        <Pie />
      </>
    )
  }
  if (!r.ok) return <SinSesion fallo={r.fallo === 'SIN_PERMISO' ? 'NO_LO_ENCUENTRO' : r.fallo} />
  return (
    <>
      <Barra area="proyectos" migas={[{ texto: r.dato.grupo, href: `/app/g/${grupo}?quedarme=1` }, { texto: 'Presupuesto' }]} sesion modo="horas" />
      <main className="pt-lienzo"><Presupuesto e={r.dato} grupo={grupo} /></main>
      <Pie />
    </>
  )
}
