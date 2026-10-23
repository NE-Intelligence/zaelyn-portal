/**
 * El lienzo de una familia: encabezado, pestañas y la vista que toque.
 *
 * Lo usan dos, igual que el plan: `/app/f/…` con la familia real y
 * `/demo/familia` con los Ríos, que no existen. Ninguna vista suma ni mide:
 * cada número llega hecho de `estadoDeFamilia`.
 */
import Link from 'next/link'
import { Chispa, Kpi, fecha, plural } from '@/components/portal/atomos'
import {
  ICONO_LOGRO, VISTAS_FAMILIA, colorDePersona, cuandoEnPalabras,
  type AlertaDeFamilia, type EstadoDeFamilia, type EventoDelDia, type VistaFamilia,
} from '@/lib/familia'

const DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const DIA_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const dow = (f: string) => new Date(`${f}T12:00:00Z`).getUTCDay()
const hora = (h: string | null) => {
  if (!h) return ''
  const [a, b] = h.split(':').map(Number) as [number, number]
  const h12 = a === 0 ? 12 : a > 12 ? a - 12 : a
  return `${h12}:${String(b).padStart(2, '0')}${a < 12 ? ' am' : ' pm'}`
}
const diaEnPalabras = (f: string, hoy: string) => {
  if (f === hoy) return 'hoy'
  const n = Math.round((Date.parse(`${f}T12:00:00Z`) - Date.parse(`${hoy}T12:00:00Z`)) / 864e5)
  if (n === 1) return 'mañana'
  return `${DIA_LARGO[dow(f)]} ${fecha(f)}`
}

export function LienzoFamilia({
  e, vista, base, leido, enlaceVista,
}: {
  e: EstadoDeFamilia
  vista: VistaFamilia
  base: string
  leido: string
  /** Cómo se arma el enlace a otra vista desde esta ruta. */
  enlaceVista?: (v: VistaFamilia) => string
}) {
  const href = enlaceVista ?? ((v: VistaFamilia) => (v === 'hoy' ? base : `${base}?v=${v}`))
  const aCargo = e.personas.filter(p => p.aCargo).length
  return (
    <>
      <div className="pt-cabeza">
        <div className="fila">
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <h1>{e.grupo.nombre}</h1>
            <div className="meta">
              <span>{plural(e.personas.length, 'persona')} · {aCargo} a cargo</span>
              <span>{DIA_LARGO[dow(e.hoy)]} {fecha(e.hoy)}</span>
              <span>Tu papel aquí: {e.yo.rolDicho}</span>
              <span>Leído {frescura(leido)}</span>
            </div>
          </div>
          <div className="fa-quienes" aria-label="Quiénes son">
            {e.personas.map(p => (
              <span key={p.id} className="fa-quien" title={`${p.nombre} · ${p.rolDicho}`}>
                <i style={{ background: colorDePersona(e.personas, p.id) }}>{p.nombre.replace(/^@/, '').slice(0, 1).toUpperCase()}</i>
                <span>{p.nombre}</span>
              </span>
            ))}
          </div>
        </div>
        <nav className="pt-pestanas" aria-label="Vistas de la familia">
          {(Object.keys(VISTAS_FAMILIA) as VistaFamilia[]).map(x => (
            <Link key={x} href={href(x)} aria-current={x === vista ? 'page' : undefined}>{VISTAS_FAMILIA[x]}</Link>
          ))}
        </nav>
      </div>

      {vista === 'hoy' && <Hoy e={e} href={href} />}
      {vista === 'calendario' && <Calendario e={e} />}
      {vista === 'traslados' && <Traslados e={e} />}
      {vista === 'quehaceres' && <Quehaceres e={e} />}
      {vista === 'medallero' && <Medallero e={e} />}
      {vista === 'fechas' && <Fechas e={e} />}
    </>
  )
}

function frescura(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000))
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  return `hace ${Math.round(min / 60)} h`
}

// ─────────────────────────────────────────────────────── alertas

function textoAlerta(a: AlertaDeFamilia, hoy: string): { t: string; tono: 'mal' | 'aviso' | 'info' } {
  switch (a.tipo) {
    case 'choque':
      return { tono: 'mal', t: `${diaEnPalabras(a.fecha, hoy)}: ${a.quien} tiene que ${a.cosas.join(' y ')} casi a la misma hora (${hora(a.hora)}).` }
    case 'sin_responsable':
      return { tono: 'mal', t: `${diaEnPalabras(a.fecha, hoy)}: nadie ${a.accion === 'llevar' ? 'lleva' : 'recoge'} a ${a.de ?? 'todos'} ${a.accion === 'llevar' ? 'a' : 'de'} ${a.titulo}${a.hora ? ` (${hora(a.hora)})` : ''}.` }
    case 'por_confirmar':
      return { tono: 'aviso', t: `${diaEnPalabras(a.fecha, hoy)} es ${a.nombre}: falta confirmar si hay ${a.titulo}.` }
    case 'por_aprobar':
      return { tono: 'aviso', t: `${plural(a.cuantos, 'quehacer', 'quehaceres')} esperan aprobación (${a.puntos} puntos).` }
    case 'fecha_cerca':
      return { tono: 'info', t: `${a.titulo} ${a.faltan === 0 ? 'es hoy' : a.faltan === 1 ? 'es mañana' : `en ${a.faltan} días`}.` }
  }
}

// ─────────────────────────────────────────────────────── 1 · hoy en casa

function Hoy({ e, href }: { e: EstadoDeFamilia; href: (v: VistaFamilia) => string }) {
  const hoy = e.dias[0]
  const semana = e.dias.slice(0, 7)
  const traslados = (hoy?.eventos ?? []).flatMap(ev => ev.estado === 'ocurre' ? ev.traslados : [])
  const huecos = e.alertas.filter(a => a.tipo === 'sin_responsable' && semana.some(d => d.fecha === a.fecha)).length
  const choques = e.alertas.filter(a => a.tipo === 'choque').length
  const prox = e.fechas[0]
  const pend = e.porAprobar.length

  // Una columna por persona con algo hoy, y una para los adultos que mueven.
  const conAlgo = e.personas.filter(p => (hoy?.eventos ?? []).some(ev => ev.personaId === p.id))

  return (
    <div className="fa-pila">
      <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <Kpi etiqueta="Traslados hoy" valor={traslados.length} detalle={`${traslados.filter(t => t.hecho).length} ya hechos`} />
        <Kpi etiqueta="Sin responsable" valor={huecos} detalle="esta semana" tono={huecos ? 'alerta' : undefined} />
        <Kpi etiqueta="Choques" valor={choques} detalle="dos lugares a la vez" tono={choques ? 'alerta' : undefined} />
        <Kpi etiqueta="Por aprobar" valor={pend} detalle="quehaceres hechos" tono={pend ? 'aviso' : undefined} />
        <Kpi etiqueta="Próxima fecha" valor={prox ? (prox.faltan === 0 ? 'Hoy' : prox.faltan) : '—'}
          unidad={prox && prox.faltan > 0 ? (prox.faltan === 1 ? 'día' : 'días') : undefined}
          detalle={prox?.titulo ?? 'nada guardado'} />
      </div>

      <div className="fa-dos">
        <section className="pt-tarjeta">
          <header>
            <h2>Hoy, {DIA_LARGO[dow(e.hoy)]} {fecha(e.hoy)}</h2>
            {hoy?.festivo && <span className="fa-festivo">{hoy.festivo}</span>}
          </header>
          {!conAlgo.length && <div className="pt-vacio"><b>Hoy no hay actividades</b><span>Se agregan por el chat: «Mateo tiene futbol martes y jueves de 5 a 6:30».</span></div>}
          <div className="fa-columnas">
            {conAlgo.map(p => (
              <div key={p.id} className="fa-columna" style={{ '--c': colorDePersona(e.personas, p.id) } as React.CSSProperties}>
                <div className="fa-col-cab"><i />{p.nombre}</div>
                {(hoy?.eventos ?? []).filter(ev => ev.personaId === p.id).map(ev => <Bloque key={ev.actividadId} ev={ev} />)}
              </div>
            ))}
          </div>
        </section>

        <section className="pt-zaelyn">
          <header>
            <span className="chispa"><Chispa /></span>
            <h2>Lo que Zaelyn ve</h2>
          </header>
          {e.alertas.length === 0
            ? <p className="resumen">Todo cubierto: cada traslado de la semana tiene quién lo haga.</p>
            : (
              <ul className="fa-alertas">
                {e.alertas.slice(0, 7).map((a, i) => {
                  const x = textoAlerta(a, e.hoy)
                  return <li key={i} className={`fa-alerta ${x.tono}`}>{x.t}</li>
                })}
              </ul>
            )}
          <p className="salida">Para mover algo, díselo a Zaelyn: «hoy recojo yo a Mateo de futbol». El portal solo muestra.</p>
        </section>
      </div>

      <div className="fa-dos">
        <section className="pt-tarjeta">
          <header><h2>Quehaceres de hoy</h2><Link className="pt-overline" href={href('quehaceres')}>Ver todo</Link></header>
          {!(hoy?.quehaceres.length) && <div className="pt-vacio"><b>Nada para hoy</b><span>«quehacer para Mateo: tender su cama todos los días por 5 puntos»</span></div>}
          <ul className="fa-lista">
            {(hoy?.quehaceres ?? []).map(q => (
              <li key={q.tareaId + (q.de ?? '')} className={q.hecho ? 'hecho' : ''}>
                <span className="fa-check" aria-label={q.hecho ? 'hecho' : 'pendiente'}>{q.hecho ? '✓' : ''}</span>
                <span className="t">{q.titulo}</span>
                <span className="fa-de">{q.de ?? 'quien sea'}</span>
                <span className="fa-pts">+{q.puntos}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="pt-tarjeta">
          <header><h2>Esta semana</h2><Link className="pt-overline" href={href('calendario')}>Calendario</Link></header>
          <div className="fa-semana">
            {semana.map(d => {
              const n = d.eventos.filter(x => x.estado === 'ocurre').length
              const malo = e.alertas.some(a => 'fecha' in a && a.fecha === d.fecha && (a.tipo === 'sin_responsable' || a.tipo === 'choque'))
              return (
                <div key={d.fecha} className={`fa-dia-mini${d.fecha === e.hoy ? ' hoy' : ''}`}>
                  <b>{DIA[dow(d.fecha)]}</b>
                  <span>{Number(d.fecha.slice(8))}</span>
                  <small>{n} {n === 1 ? 'cosa' : 'cosas'}</small>
                  {malo && <em className="fa-punto mal" title="Hay algo sin cubrir">!</em>}
                  {d.fechas.length > 0 && <em className="fa-punto" title={d.fechas.join(', ')}>🎂</em>}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

function Bloque({ ev }: { ev: EventoDelDia }) {
  if (ev.estado !== 'ocurre') {
    return (
      <div className={`fa-bloque ${ev.estado}`}>
        <div className="h">{hora(ev.inicio)}</div>
        <div className="t">{ev.titulo}</div>
        <div className="m">{ev.estado === 'por_confirmar' ? `¿Hay? ${ev.motivo}` : `No hay${ev.motivo ? ` · ${ev.motivo}` : ''}`}</div>
      </div>
    )
  }
  return (
    <div className="fa-bloque">
      <div className="h">{hora(ev.inicio)}{ev.fin ? ` – ${hora(ev.fin)}` : ''}</div>
      <div className="t">{ev.titulo}</div>
      {ev.traslados.map(t => (
        <div key={t.accion} className={`fa-tras${t.quien ? '' : ' nadie'}${t.hecho ? ' hecho' : ''}`}>
          <span>{t.accion === 'llevar' ? 'Lleva' : 'Recoge'}</span>
          <b>{t.quien ?? 'nadie'}</b>
          {t.hecho && <span aria-label="hecho">✓</span>}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────── 2 · calendario

function Calendario({ e }: { e: EstadoDeFamilia }) {
  const semanas = [e.dias.slice(0, 7), e.dias.slice(7, 14)].filter(s => s.length)
  return (
    <div className="fa-pila">
      <div className="pt-leyenda">
        {e.personas.filter(p => e.dias.some(d => d.eventos.some(x => x.personaId === p.id))).map(p => (
          <span key={p.id}><i style={{ background: colorDePersona(e.personas, p.id) }} />{p.nombre}</span>
        ))}
        <span><i style={{ background: 'var(--st-curso)' }} />Festivo por confirmar</span>
      </div>
      {semanas.map((s, i) => (
        <section key={i} className="pt-tarjeta">
          <header><h2>{i === 0 ? 'Esta semana' : 'La que sigue'}</h2><span className="pt-overline">{fecha(s[0]!.fecha)} – {fecha(s.at(-1)!.fecha)}</span></header>
          <div className="pt-scroll">
            <div className="fa-cal">
              {s.map(d => (
                <div key={d.fecha} className={`fa-cal-dia${d.fecha === e.hoy ? ' hoy' : ''}${d.festivo ? ' festivo' : ''}`}>
                  <div className="cab"><b>{DIA[dow(d.fecha)]}</b> {Number(d.fecha.slice(8))}</div>
                  {d.festivo && <div className="fa-festivo">{d.festivo}</div>}
                  {d.fechas.map(f => <div key={f} className="fa-cumple">🎂 {f}</div>)}
                  {d.eventos.map(ev => (
                    <div key={ev.actividadId} className={`fa-ev ${ev.estado}`} style={{ '--c': colorDePersona(e.personas, ev.personaId) } as React.CSSProperties}>
                      <span className="h">{hora(ev.inicio)}</span>
                      <span className="t">{ev.de ? `${ev.de} · ` : ''}{ev.titulo}</span>
                      {ev.estado === 'ocurre' && ev.traslados.some(t => !t.quien) && <span className="fa-sin">sin quién</span>}
                      {ev.estado === 'no_hay' && <span className="fa-sin suave">no hay</span>}
                    </div>
                  ))}
                  {!d.eventos.length && !d.fechas.length && <div className="fa-libre">libre</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────── 3 · traslados

function Traslados({ e }: { e: EstadoDeFamilia }) {
  const semana = e.dias.slice(0, 7)
  // Una fila por actividad y acción que tenga encargo esta semana.
  const filas: Array<{ k: string; titulo: string; de: string | null; personaId: string | null; accion: 'llevar' | 'recoger' }> = []
  for (const d of semana) for (const ev of d.eventos) for (const t of ev.traslados) {
    const k = `${ev.actividadId}:${t.accion}`
    if (!filas.some(f => f.k === k)) filas.push({ k, titulo: ev.titulo, de: ev.de, personaId: ev.personaId, accion: t.accion })
  }
  const carga = new Map<string, number>()
  for (const d of semana) for (const ev of d.eventos) for (const t of ev.traslados) {
    if (ev.estado === 'ocurre' && t.quien) carga.set(t.quien, (carga.get(t.quien) ?? 0) + 1)
  }
  return (
    <div className="fa-pila">
      <section className="pt-tarjeta">
        <header><h2>Quién lleva y quién recoge</h2><span className="pt-overline">esta semana</span></header>
        {!filas.length && <div className="pt-vacio"><b>Sin traslados repartidos</b><span>Se reparten por el chat: «yo llevo a Mateo a futbol los martes», «la abuela recoge a Valeria los jueves».</span></div>}
        {filas.length > 0 && (
          <div className="pt-tabla-caja pt-scroll">
            <table className="pt-tabla fa-tabla">
              <thead>
                <tr><th>Actividad</th>{semana.map(d => <th key={d.fecha} className={d.fecha === e.hoy ? 'hoy' : ''}>{DIA[dow(d.fecha)]} {Number(d.fecha.slice(8))}</th>)}</tr>
              </thead>
              <tbody>
                {filas.map(f => (
                  <tr key={f.k}>
                    <td className="nombre">
                      <span className="fa-dot" style={{ background: colorDePersona(e.personas, f.personaId) }} />
                      <span className="txt">{f.accion === 'llevar' ? 'Llevar' : 'Recoger'} a {f.de ?? 'todos'} · {f.titulo}</span>
                    </td>
                    {semana.map(d => {
                      const ev = d.eventos.find(x => x.actividadId === f.k.split(':')[0])
                      if (!ev) return <td key={d.fecha} className="fa-celda vacia">·</td>
                      if (ev.estado !== 'ocurre') return <td key={d.fecha} className="fa-celda suave">{ev.estado === 'por_confirmar' ? '¿hay?' : 'no hay'}</td>
                      const t = ev.traslados.find(x => x.accion === f.accion)
                      if (!t) return <td key={d.fecha} className="fa-celda vacia">·</td>
                      return (
                        <td key={d.fecha} className={`fa-celda${t.quien ? '' : ' nadie'}${t.hecho ? ' hecho' : ''}`}>
                          {t.quien ?? 'Nadie'}{t.hecho ? ' ✓' : ''}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {carga.size > 0 && (
        <section className="pt-tarjeta">
          <header><h2>Cuántos traslados le tocan a cada quien</h2></header>
          <div className="fa-barras">
            {[...carga.entries()].sort((a, b) => b[1] - a[1]).map(([q, n]) => {
              const max = Math.max(...carga.values())
              return (
                <div key={q} className="fa-barra">
                  <span className="q">{q}</span>
                  <span className="pista"><span style={{ width: `${(n / max) * 100}%` }} /></span>
                  <b>{n}</b>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────── 4 · quehaceres y premios

function Quehaceres({ e }: { e: EstadoDeFamilia }) {
  const max = Math.max(1, ...e.tablero.map(t => t.saldo), ...e.premios.map(p => p.puntos))
  return (
    <div className="fa-pila">
      <div className="fa-dos">
        <section className="pt-tarjeta">
          <header><h2>⭐ Tablero de puntos</h2><span className="pt-overline">saldo para canjear</span></header>
          {!e.tablero.length && <div className="pt-vacio"><b>Nadie tiene puntos todavía</b><span>Empiezan con el primer quehacer aprobado.</span></div>}
          <div className="fa-podio">
            {e.tablero.map((t, i) => (
              <div key={t.personaId} className="fa-puesto" style={{ '--c': colorDePersona(e.personas, t.personaId) } as React.CSSProperties}>
                <span className="lugar">{i + 1}</span>
                <span className="q">{t.nombre}</span>
                <span className="pista"><span style={{ width: `${(t.saldo / max) * 100}%` }} /></span>
                <b>{t.saldo}</b>
                <small>+{t.semana} esta semana{t.porAprobar ? ` · ${t.porAprobar} por aprobar` : ''}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="pt-tarjeta">
          <header><h2>🎁 Premios</h2><span className="pt-overline">los pone un Guía</span></header>
          {!e.premios.length && <div className="pt-vacio"><b>Sin premios</b><span>«premio: elegir la película del viernes por 40 puntos»</span></div>}
          <ul className="fa-premios">
            {e.premios.map(p => (
              <li key={p.titulo}>
                <div className="fila"><span className="t">{p.titulo}</span><b>{p.puntos} pts</b></div>
                <div className="quien">
                  {e.tablero.map(t => {
                    const ya = t.saldo >= p.puntos
                    return (
                      <span key={t.personaId} className={ya ? 'ya' : ''}>
                        {t.nombre}: {ya ? 'le alcanza' : `le faltan ${p.puntos - t.saldo}`}
                      </span>
                    )
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {e.porAprobar.length > 0 && (
        <section className="pt-tarjeta">
          <header><h2>Esperan aprobación</h2><span className="pt-overline">«aprueba los puntos de …» o el botón del aviso</span></header>
          <ul className="fa-lista">
            {e.porAprobar.map((h, i) => (
              <li key={i}><span className="fa-check espera">…</span><span className="t">{h.titulo}</span><span className="fa-de">{h.de} · {fecha(h.fecha)}</span><span className="fa-pts">+{h.puntos}</span></li>
            ))}
          </ul>
        </section>
      )}

      <section className="pt-tarjeta">
        <header><h2>Todos los quehaceres</h2></header>
        {!e.quehaceres.length && <div className="pt-vacio"><b>Todavía no hay quehaceres</b><span>«quehacer para Mateo: tender su cama todos los días por 5 puntos»</span></div>}
        <div className="fa-por-persona">
          {[...new Set(e.quehaceres.map(q => q.de ?? 'Quien sea'))].map(de => (
            <div key={de} className="fa-grupo-q">
              <h3>{de}</h3>
              <ul className="fa-lista">
                {e.quehaceres.filter(q => (q.de ?? 'Quien sea') === de).map(q => (
                  <li key={q.id}><span className="t">{q.titulo}</span><span className="fa-de">{cuandoEnPalabras(q.cuando)}</span><span className="fa-pts">+{q.puntos}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────────────── 5 · medallero

function Medallero({ e }: { e: EstadoDeFamilia }) {
  return (
    <div className="fa-pila">
      {!e.medallero.length && (
        <div className="pt-vacio"><b>La vitrina está vacía</b><span>Se llena por el chat: «Mateo ganó medalla de oro en natación», «Valeria ganó 2 sets a 0 en voleibol».</span></div>
      )}
      <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
        {e.medallero.map(m => (
          <section key={m.personaId} className="pt-tarjeta fa-vitrina" style={{ '--c': colorDePersona(e.personas, m.personaId) } as React.CSSProperties}>
            <header><h2>{m.nombre}</h2><span className="pt-overline">{m.disciplinas.join(' · ')}</span></header>
            <div className="fa-trofeos">
              <div><span>🥇</span><b>{m.medallas}</b><small>medallas</small></div>
              <div><span>🏆</span><b>{m.trofeos}</b><small>trofeos</small></div>
              <div><span>🎖️</span><b>{m.reconocimientos}</b><small>reconoc.</small></div>
              <div><span>⚽</span><b>{m.partidos}</b><small>partidos</small></div>
            </div>
          </section>
        ))}
      </div>
      {e.logros.length > 0 && (
        <section className="pt-tarjeta">
          <header><h2>Lo más reciente</h2></header>
          <ol className="fa-linea">
            {e.logros.slice(0, 15).map((l, i) => (
              <li key={i}>
                <span className="ic" aria-hidden="true">{ICONO_LOGRO[l.tipo] ?? '·'}</span>
                <div><b>{l.de}</b> · {l.titulo}{l.disciplina ? <span className="fa-disc">{l.disciplina}</span> : null}</div>
                <time>{fecha(l.fecha)}</time>
              </li>
            ))}
          </ol>
        </section>
      )}
      <p className="fa-nota">Las fotos de cada logro llegan después: primero se decide quién puede verlas y dónde se guardan, porque son de menores.</p>
    </div>
  )
}

// ─────────────────────────────────────────────────────── 6 · fechas

function Fechas({ e }: { e: EstadoDeFamilia }) {
  const festivos = e.dias.filter(d => d.festivo)
  return (
    <div className="fa-pila">
      <div className="fa-dos">
        <section className="pt-tarjeta">
          <header><h2>🎂 Lo que viene</h2></header>
          {!e.fechas.length && <div className="pt-vacio"><b>Sin fechas guardadas</b><span>«Mateo cumple años el 14 de marzo», «aniversario de los abuelos: 3 de junio».</span></div>}
          <ul className="fa-fechas">
            {e.fechas.map(f => (
              <li key={f.titulo}>
                <div className="cuenta"><b>{f.faltan === 0 ? 'Hoy' : f.faltan}</b>{f.faltan > 0 && <small>{f.faltan === 1 ? 'día' : 'días'}</small>}</div>
                <div><span className="t">{f.titulo}</span><span className="m">{fecha(f.fecha)}{f.cumple ? ` · cumple ${f.cumple}` : ''}</span></div>
              </li>
            ))}
          </ul>
        </section>
        <section className="pt-tarjeta">
          <header><h2>Días sin clases y festivos</h2><span className="pt-overline">próximas dos semanas</span></header>
          {!festivos.length && <div className="pt-vacio"><b>Ninguno en estas dos semanas</b><span>Zaelyn usa el calendario oficial de la SEP y los descansos de ley, y pregunta antes de suponer.</span></div>}
          <ul className="fa-lista">
            {festivos.map(d => (
              <li key={d.fecha}><span className="t">{d.festivo}</span><span className="fa-de">{DIA_LARGO[dow(d.fecha)]} {fecha(d.fecha)}</span></li>
            ))}
          </ul>
          <p className="fa-nota">Un festivo no se supone: Zaelyn les pregunta a los Guías si hay clases, y la primera respuesta queda para todos.</p>
        </section>
      </div>
    </div>
  )
}
