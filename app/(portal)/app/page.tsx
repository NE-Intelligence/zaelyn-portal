import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { misGrupos } from '@/lib/api'
import { ROL_PUEDE, VISTA_NOMBRE } from '@/lib/plan'
import { fecha } from '@/components/portal/atomos'

export const dynamic = 'force-dynamic'

/**
 * La portada del portal: los grupos de la persona y los planes de cada uno.
 *
 * En Zaelyn un proyecto ES un grupo, y la familia también. Por eso aquí
 * conviven: lo que cambia entre uno y otro no es el modelo, es qué vistas
 * tiene el lienzo. Familia y Personal aparecen con su lugar marcado.
 *
 * ── NINGUNA TARJETA DICE UN PORCENTAJE, Y ES A PROPÓSITO ───────────────
 *
 * Enseñarlo aquí obligaría a medir cada plan entero para pintar una lista, y
 * el atajo evidente —hechas sobre total— no es el avance: un plan con nueve de
 * diez cosas hechas puede ir al 20% si la décima es el ochenta por ciento del
 * esfuerzo. La tarjeta dice cuántas quedan y cuántas están vencidas, que son
 * hechos contables, y el porcentaje aparece al abrir el plan, medido una vez.
 */
export default async function Grupos() {
  const r = await misGrupos()
  if (!r.ok) return <SinSesion fallo={r.fallo} />

  const grupos = r.dato.grupos
  const proyectos = grupos.filter(g => g.clase === 'work' || g.clase === 'other')
  const otros = grupos.filter(g => !proyectos.includes(g))

  return (
    <>
      <Barra migas={[{ texto: 'Mis grupos' }]} sesion />

      <main className="pt-lienzo">
        <div className="pt-cabeza">
          <div className="fila">
            <div style={{ minWidth: 0 }}>
              <h1>Mis grupos</h1>
              <div className="meta">
                <span>{proyectos.length} de proyecto · {otros.length} más</span>
                <span>El rol se da por grupo, y quien lo cambia es quien administra</span>
              </div>
            </div>
            <div className="ed-cab-acciones">
              <Link href="/app/editor" className="ed-btn suave">Mis proyectos</Link>
              <Link href="/app/editor/nuevo" className="ed-btn primario">+ Nuevo proyecto</Link>
            </div>
          </div>
        </div>

        {grupos.length === 0 && (
          <div className="pt-vacio" style={{ maxWidth: 560 }}>
            <b>Todavía no estás en ningún grupo</b>
            <span>
              Arma tu primer proyecto con «Nuevo proyecto»: al liberarlo creas el grupo
              e invitas a tu equipo desde ahí. También puedes decirle por el chat «crea
              el grupo Obra Norte».
            </span>
          </div>
        )}

        {proyectos.length > 0 && (
          <section style={{ display: 'grid', gap: 16 }}>
            <h2 className="pt-overline">Proyectos</h2>
            <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))' }}>
              {proyectos.map(g => (
                <article className="pt-grupo" key={g.id}>
                  <header>
                    <h2>{g.nombre}</h2>
                    {g.rol && (
                      <span style={{ marginLeft: 'auto' }} className="pt-rol" title={ROL_PUEDE[g.rol] ?? undefined}>
                        {g.rol}
                      </span>
                    )}
                  </header>
                  <Link href={`/app/g/${g.id}/editor`} className="ed-entrada">
                    <span>Editor de proyectos</span>
                    <small>Armar, plantillas, borradores</small>
                  </Link>
                  {g.planes.length === 0 && (
                    <div className="pt-vacio">
                      <b>Sin planes todavía</b>
                      <span>Ármalo en el editor —a mano, desde una plantilla o con Zaelyn—, o dile «crea el plan Obra civil en {g.nombre}».</span>
                    </div>
                  )}
                  {g.planes.map(p => (
                    <div className="pt-plan" key={p.id}>
                      <Link href={`/app/g/${g.id}/${p.id}`} className="t" style={{ color: 'inherit' }}>
                        <span>{p.nombre}</span>
                        {p.vencidos > 0 && (
                          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--st-detenida-ink)' }}>
                            {p.vencidos} vencida{p.vencidos === 1 ? '' : 's'}
                          </span>
                        )}
                      </Link>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        {p.abiertos} abierta{p.abiertos === 1 ? '' : 's'}
                        {p.hasta && ` · hasta ${fecha(p.hasta)}`}
                      </div>
                      {/* PANTALLAS DIRECTAS. Llegar al Gantt costaba tres
                          clics y había que adivinar dónde estaba. */}
                      <div className="pt-atajos">
                        {(['tablero', 'gantt', 'ruta', 'equipo'] as const).map(x => (
                          <Link key={x} href={`/app/g/${g.id}/${p.id}?v=${x}`}>
                            {VISTA_NOMBRE[x]}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </section>
        )}

        {otros.length > 0 && (
          <section style={{ display: 'grid', gap: 16 }}>
            <h2 className="pt-overline">Lo demás que Zaelyn te lleva</h2>
            <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))' }}>
              {otros.map(g => (
                <article className="pt-grupo" key={g.id}>
                  <header>
                    <h2>{g.nombre}</h2>
                    {g.rol && <span style={{ marginLeft: 'auto' }} className="pt-rol">{g.rol}</span>}
                  </header>
                  <div className="pt-vacio">
                    <b>{g.clase === 'family' ? 'Familia' : 'Personal'}: todavía sin pantalla</b>
                    <span>
                      {g.clase === 'family'
                        ? 'Quién lleva, quién recoge y las actividades de los hijos ya funcionan en el chat. La vista de este grupo se diseña después del portal de proyectos.'
                        : 'Tus recordatorios, notas y hábitos ya funcionan en el chat. Aquí van a vivir tu día y tu semana.'}
                    </span>
                  </div>
                  {g.planes.length > 0 && (
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                      Mientras tanto, sus {g.planes.length} plan(es) se ven con las mismas
                      vistas de proyecto:{' '}
                      {g.planes.map((p, i) => (
                        <span key={p.id}>
                          {i > 0 && ', '}
                          <Link href={`/app/g/${g.id}/${p.id}`} style={{ color: 'var(--brand)' }}>
                            {p.nombre}
                          </Link>
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Pie />
    </>
  )
}
