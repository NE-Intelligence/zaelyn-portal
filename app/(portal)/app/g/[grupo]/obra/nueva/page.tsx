import { Barra, Pie } from '@/components/portal/Marco'
import { ImportarObra } from '@/components/portal/ImportarObra'

export const dynamic = 'force-dynamic'

/** `/app/g/<grupo>/obra/nueva` — cargar una obra desde la plantilla. */
export default async function NuevaObra({ params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params
  return (
    <>
      <Barra area="proyectos" sesion migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: 'Grupo', href: `/app/g/${grupo}` }, { texto: 'Nueva obra' }]} />
      <main className="pt-lienzo" style={{ maxWidth: 720 }}>
        <div className="pt-cabeza"><h1>Cargar una obra</h1>
          <div className="meta"><span>Partidas, materiales e insumos desde Excel. Se crea el plan con sus actividades.</span></div></div>
        <ImportarObra grupo={grupo} />
      </main>
      <Pie />
    </>
  )
}
