import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { MesaPersonal } from '@/components/editor/Mesa'
import { misProyectos } from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * `/app/editor` — mis proyectos: se arman sin grupo y el grupo se elige al
 * liberarlos (Zaelyn DECISIONS #177).
 */
export default async function MisProyectosPagina() {
  const r = await misProyectos()
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  return (
    <>
      <Barra area="proyectos" migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: 'Mis proyectos' }]} sesion modo="editor" />
      <main className="pt-lienzo">
        <MesaPersonal datos={r.dato} />
      </main>
      <Pie modo="editor" />
    </>
  )
}
