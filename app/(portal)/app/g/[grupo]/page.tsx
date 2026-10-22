import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { elPlan } from '@/lib/api'
import { VISTA_NOMBRE } from '@/lib/plan'

export const dynamic = 'force-dynamic'

/**
 * `/app/g/<grupo>` — el grupo.
 *
 * Con UN plan no enseña una lista de uno: redirige. Es a lo que apunta el pase
 * cuando alguien dice «el portal de Andes», y hacer que esa persona dé un clic
 * más para elegir entre una sola opción es justo la fricción de la que se
 * quejó la primera versión.
 */
export default async function Grupo({ params, searchParams }: {
  params: Promise<{ grupo: string }>
  searchParams: Promise<{ quedarme?: string }>
}) {
  const { grupo } = await params
  const q = await searchParams
  const r = await elPlan(grupo)
  if (!r.ok) return <SinSesion fallo={r.fallo} />

  const e = r.dato.estado
  if (e.planes.length === 1 && !q.quedarme) redirect(`/app/g/${grupo}/${e.planes[0]!.id}`)

  return (
    <>
      <Barra migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: e.grupo.nombre }]} sesion />
      <main className="pt-lienzo">
        <div className="pt-cabeza">
          <div className="fila">
            <div>
              <h1>{e.grupo.nombre}</h1>
              <div className="meta">
                <span>{e.planes.length} planes</span>
                {r.dato.rol && <span>Tu rol aquí: {r.dato.rol}</span>}
              </div>
            </div>
            <Link href={`/app/g/${grupo}/editor`} className="ed-btn primario">Editor de proyectos</Link>
          </div>
        </div>

        {e.planes.length === 0 ? (
          <div className="pt-vacio" style={{ maxWidth: 560 }}>
            <b>Este grupo no tiene planes</b>
            <span>
              Ármalo en el <Link href={`/app/g/${grupo}/editor`}>editor de proyectos</Link>, o dile a
              Zaelyn «crea el plan Obra civil en {e.grupo.nombre}», o súbele un Excel.
            </span>
          </div>
        ) : (
          <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))' }}>
            {e.planes.map(p => (
              <article className="pt-grupo" key={p.id}>
                <header><h2>{p.nombre}</h2></header>
                <div className="pt-plan">
                  <Link href={`/app/g/${grupo}/${p.id}`} className="t" style={{ color: 'inherit' }}>
                    <span>Abrir el resumen</span>
                  </Link>
                  <div className="pt-atajos">
                    {(['tablero', 'gantt', 'ruta', 'equipo', 'bitacora'] as const).map(x => (
                      <Link key={x} href={`/app/g/${grupo}/${p.id}?v=${x}`}>{VISTA_NOMBRE[x]}</Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Pie />
    </>
  )
}
