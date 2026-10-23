import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { misGrupos, yoMismo } from '@/lib/api'
import { ROL_PUEDE, VISTA_NOMBRE } from '@/lib/plan'
import { nombreDeRol } from '@/lib/plan-uso/tipos'
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
  const [r, yo] = await Promise.all([misGrupos(), yoMismo(7)])
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
              <Link href="/app/personal" className="ed-btn suave">Dónde estoy parado</Link>
              <Link href="/app/participaciones" className="ed-btn suave">Mis participaciones</Link>
              <Link href="/app/plan" className="ed-btn suave">Plan y uso</Link>
              <Link href="/app/editor" className="ed-btn suave">Mis proyectos</Link>
              <Link href="/app/editor/nuevo" className="ed-btn primario">+ Nuevo proyecto</Link>
            </div>
          </div>
        </div>

        {/* PERSONAL VA PRIMERO (#184): es lo que cruza todo lo de abajo. */}
        <section className="pt-tarjeta pe-portada">
          <div className="fila">
            <h2>Mi día</h2>
            <span className="pt-overline">Tú, a través de todos tus grupos</span>
          </div>
          {yo.ok ? (
            <>
              <div className="cifras">
                <span>{yo.dato.dias[0]?.entradas.length ?? 0} cosas hoy</span>
                {yo.dato.alertas.filter(a => a.tipo === 'choque').length > 0 && (
                  <span className="mal">{yo.dato.alertas.filter(a => a.tipo === 'choque').length} choque(s)</span>
                )}
                {yo.dato.compromisos.pendientes.some(p => p.vencida) && (
                  <span className="mal">{yo.dato.compromisos.pendientes.filter(p => p.vencida).length} vencida(s)</span>
                )}
                {yo.dato.proximo && <span>Lo que sigue: {yo.dato.proximo.texto}</span>}
              </div>
              {yo.dato.foco.length > 0 && (
                <ol className="pe-foco-lista">
                  {yo.dato.foco.map((f, i) => (
                    <li key={i}><span className="n">{i + 1}</span><div><b>{f.texto}</b><span>{f.grupo ?? 'Tuyo'}</span></div></li>
                  ))}
                </ol>
              )}
              <div className="pt-atajos">
                <Link href="/app/personal">Dónde estoy parado</Link>
                <Link href="/app/personal?v=compromisos">Mis compromisos</Link>
                <Link href="/app/personal?v=calendario">Calendario</Link>
                <Link href="/app/personal?v=habitos">Hábitos</Link>
              </div>
            </>
          ) : yo.fallo === 'SIN_PLAN' ? (
            <div className="pt-vacio">
              <b>Tu portal Personal es de Sprint en adelante</b>
              <span>Con {'plan' in yo ? yo.plan.nombre : 'Kickoff'} todo lo tuyo funciona en el chat. <Link href="/app/personal" style={{ color: 'var(--brand)' }}>Ver qué ganas con Sprint</Link>.</span>
            </div>
          ) : (
            <div className="pt-vacio"><b>Tu día no cargó</b><span>Zaelyn no contestó a tiempo. Vuelve a intentarlo en un momento.</span></div>
          )}
        </section>

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
                        {nombreDeRol(g.rol)}
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
                    {g.rol && <span style={{ marginLeft: 'auto' }} className="pt-rol">{nombreDeRol(g.rol)}</span>}
                  </header>
                  {g.clase === 'family' ? (
                    <>
                      <Link href={`/app/f/${g.id}`} className="ed-entrada">
                        <span>Hoy en casa</span>
                        <small>La semana, quién lleva y quién recoge, y lo que nadie ha cubierto</small>
                      </Link>
                      <div className="pt-atajos">
                        {([['calendario', 'Calendario'], ['traslados', 'Traslados'], ['quehaceres', 'Quehaceres'],
                          ['medallero', 'Medallero'], ['fechas', 'Fechas']] as const).map(([v, t]) => (
                          <Link key={v} href={`/app/f/${g.id}?v=${v}`}>{t}</Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link href="/app/personal" className="ed-entrada">
                      <span>Lo de este grupo, en tu día</span>
                      <small>Sus recordatorios y encargos aparecen en «Mi día», junto con todo lo demás</small>
                    </Link>
                  )}
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
