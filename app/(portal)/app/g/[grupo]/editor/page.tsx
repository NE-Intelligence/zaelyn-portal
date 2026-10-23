import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { Mesa } from '@/components/editor/Mesa'
import { mesaDelEditor } from '@/lib/api'

export const dynamic = 'force-dynamic'

/**
 * `/app/g/<grupo>/editor` — la mesa del editor de proyectos.
 *
 * Ref: Zaelyn DECISIONS #174
 */
export default async function MesaDelEditor({ params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params
  const r = await mesaDelEditor(grupo)
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  return (
    <>
      <Barra area="proyectos"
        migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: r.dato.grupo.nombre, href: `/app/g/${grupo}` }, { texto: 'Editor' }]}
        sesion modo="editor"
      />
      <main className="pt-lienzo">
        <Mesa mesa={r.dato} />
      </main>
      <Pie modo="editor" />
    </>
  )
}
