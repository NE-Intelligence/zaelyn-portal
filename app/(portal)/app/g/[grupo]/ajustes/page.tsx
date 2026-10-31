import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { AjustesGrupo } from '@/components/portal/AjustesGrupo'
import { ajustesDelGrupo } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** `/app/g/<grupo>/ajustes` — renombrar, sacar a alguien, borrar planes, archivar. */
export default async function Ajustes({ params }: { params: Promise<{ grupo: string }> }) {
  const { grupo } = await params
  const r = await ajustesDelGrupo(grupo)
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  const a = r.dato
  return (
    <>
      <Barra area="proyectos" migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: a.grupo.nombre, href: `/app/g/${grupo}?quedarme=1` }, { texto: 'Ajustes' }]} sesion />
      <main className="pt-lienzo">
        <div className="pt-cabeza">
          <div className="fila">
            <div>
              <h1>Ajustes de {a.grupo.nombre}</h1>
              <div className="meta"><span>Tu rol aquí: {a.yo.rol}</span></div>
            </div>
          </div>
        </div>
        <AjustesGrupo a={a} />
      </main>
      <Pie />
    </>
  )
}
