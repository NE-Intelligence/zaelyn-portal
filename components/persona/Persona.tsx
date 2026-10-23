/**
 * El lienzo de Zaelyn Personal: tú, a través de todos tus grupos.
 *
 * Lo usan dos, igual que el plan y la familia: `/app/personal` con la persona
 * real y `/demo/personal` con Sofía, que no existe. Ninguna vista suma ni
 * mide: el foco, los choques, las rachas y lo vencido llegan hechos de
 * `estadoDePersona`. Aquí solo se decide cómo se pinta.
 */
import Link from 'next/link'
import { Kpi, fecha, plural } from '@/components/portal/atomos'
import { PAGA } from '@/lib/plan-uso/tipos'
import {
  TIPO_ENTRADA, VISTAS_PERSONA, lugarDe,
  type AlertaPersonal, type EntradaDelDia, type EstadoDePersona, type VistaPersona,
} from '@/lib/persona'

const DIA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const DIA_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const dow = (f: string) => new Date(`${f}T12:00:00Z`).getUTCDay()
const hora = (h: string | null) => {
  if (!h) return ''
  const [a, b] = h.split(':').map(Number) as [number, number]
  const h12 = a === 0 ? 12 : a > 12 ? a - 12 : a
  return `${h12}:${String(b).padStart(2, '0')}${a < 12 ? ' am' : ' pm'}`
}
const hhmmDe = (e: EntradaDelDia) => (e.tipo === 'vence' ? null : e.hhmm)
/** El motor dice las fechas en ISO; aquí solo se dicen como se leen. */
const legible = (t: string) => t
  .replace(/\b(\d{4}-\d{2}-\d{2})\b/g, (_m, f: string) => fecha(f))
  .replace(/\b(\d{2}:\d{2})\b/g, (_m, h: string) => hora(h))

/** Un color estable por lugar: lo tuyo en coral, cada grupo en uno de los seis, la agenda de fuera en gris. */
function colores(e: EstadoDePersona): (lugar: string, tipo?: EntradaDelDia['tipo']) => string {
  const grupos = e.compromisos.participaciones.map(p => p.grupo)
  return (lugar, tipo) => {
    if (tipo === 'fuera') return 'var(--ink-3)'
    const i = grupos.indexOf(lugar)
    return i < 0 ? 'var(--zaelyn)' : `var(--grp-${(i % 6) + 1})`
  }
}

export function LienzoPersona({
  e, vista, base, leido, nombre,
}: {
  e: EstadoDePersona
  vista: VistaPersona
  base: string
  leido: string
  /** Cómo se llama quien mira; en el ejemplo, Sofía. */
  nombre?: string
}) {
  const href = (v: VistaPersona) => (v === 'hoy' ? base : `${base}?v=${v}`)
  const color = colores(e)
  const lugares = [...new Set(e.dias.flatMap(d => d.entradas.map(x => (x.tipo === 'fuera' ? 'fuera' : lugarDe(x)))))]
  return (
    <>
      <div className="pt-cabeza">
        <div className="fila">
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <h1>{nombre ? `${nombre}, dónde estás parado` : 'Dónde estás parado'}</h1>
            <div className="meta">
              <span>{DIA_LARGO[dow(e.hoy)]} {fecha(e.hoy)}</span>
              <span>{plural(e.compromisos.participaciones.length, 'grupo')}</span>
              {e.plan && <span>{e.plan.nombre}</span>}
              <span>Leído {frescura(leido)}</span>
            </div>
          </div>
          <div className="fa-quienes" aria-label="De dónde viene">
            {lugares.map(l => (
              <span key={l} className="fa-quien">
                <i style={{ background: l === 'fuera' ? 'var(--ink-3)' : color(l) }}>{l === 'fuera' ? '◷' : l.slice(0, 1).toUpperCase()}</i>
                <span>{l === 'fuera' ? 'Agenda de fuera' : l}</span>
              </span>
            ))}
          </div>
        </div>
        <nav className="pt-pestanas" aria-label="Vistas de Personal">
          {(Object.keys(VISTAS_PERSONA) as VistaPersona[]).map(x => (
            <Link key={x} href={href(x)} aria-current={x === vista ? 'page' : undefined}>{VISTAS_PERSONA[x]}</Link>
          ))}
          {base === '/app/personal' && <Link href="/app/horas">Horas</Link>}
        </nav>
      </div>

      {vista === 'hoy' && <Hoy e={e} color={color} href={href} />}
      {vista === 'compromisos' && <Compromisos e={e} />}
      {vista === 'calendario' && <Calendario e={e} color={color} />}
      {vista === 'habitos' && <Habitos e={e} />}
    </>
  )
}

function frescura(iso: string): string {
  const min = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000))
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  return `hace ${Math.round(min / 60)} h`
}

function textoAlerta(a: AlertaPersonal): { t: string; tono: 'mal' | 'aviso' | 'info' } {
  switch (a.tipo) {
    case 'choque': return { tono: 'mal', t: `A las ${hora(a.hhmm)} chocan: ${a.cosas.join(' · ')}.` }
    case 'hueco': return { tono: 'mal', t: `${a.texto}${a.hora ? ` (${a.hora})` : ''}.` }
    case 'vencida': return { tono: 'aviso', t: `«${a.texto}» venció el ${fecha(a.vence)} · ${a.grupo}.` }
    case 'por_aprobar': return { tono: 'aviso', t: `${a.grupo}: ${plural(a.cuantos, 'petición', 'peticiones')} esperan que las resuelvas.` }
    case 'agenda_parcial': return { tono: 'info', t: 'Tu agenda de fuera no contestó completa: puede faltar algo de ese calendario.' }
  }
}

// ─────────────────────────────────────────────── 1 · dónde estoy parado

function Hoy({ e, color, href }: {
  e: EstadoDePersona; color: ReturnType<typeof colores>; href: (v: VistaPersona) => string
}) {
  const hoy = e.dias[0]
  const vencidas = e.compromisos.pendientes.filter(p => p.vencida).length
  const choques = e.alertas.filter(a => a.tipo === 'choque').length
  const porResolver = e.alertas.reduce((n, a) => n + (a.tipo === 'por_aprobar' ? a.cuantos : 0), 0)
  const encargos = (hoy?.entradas ?? []).filter(x => x.tipo === 'encargo')
  return (
    <div className="fa-pila">
      <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
        <Kpi etiqueta="Hoy" valor={hoy?.entradas.length ?? 0} detalle="cosas en tu día" />
        <Kpi etiqueta="Encargos" valor={encargos.length} detalle={`${encargos.filter(x => x.tipo === 'encargo' && x.hecho).length} ya hechos`} />
        <Kpi etiqueta="Choques" valor={choques} detalle="entre tus grupos" tono={choques ? 'alerta' : undefined} />
        <Kpi etiqueta="Vencidas" valor={vencidas} detalle="pendientes de plan" tono={vencidas ? 'alerta' : undefined} />
        <Kpi etiqueta="Por resolver" valor={porResolver} detalle="prórrogas y cesiones" tono={porResolver ? 'aviso' : undefined} />
      </div>

      <section className="pt-tarjeta pe-foco">
        <header><h2>Lo que importa hoy</h2><span className="pt-overline">con su porqué</span></header>
        {e.foco.length ? (
          <ol className="pe-foco-lista">
            {e.foco.map((f, i) => (
              <li key={i}>
                <span className="n">{i + 1}</span>
                <div><b>{f.texto}</b><span>{legible(f.porque)}{f.grupo ? ` · ${f.grupo}` : ''}</span></div>
              </li>
            ))}
          </ol>
        ) : (
          <div className="pt-vacio"><b>Hoy no hay nada que apriete</b>
            <span>{e.proximo ? `Lo que sigue: ${e.proximo.texto}, ${fecha(e.proximo.cuando.slice(0, 10))}.` : 'Nada vence, nada choca y nadie espera algo de ti.'}</span></div>
        )}
      </section>

      <div className="fa-dos">
        <section className="pt-tarjeta">
          <header><h2>Tu día, {DIA_LARGO[dow(e.hoy)]} {fecha(e.hoy)}</h2></header>
          {hoy?.entradas.length ? (
            <ul className="pe-linea">
              {hoy.entradas.map((x, i) => (
                <li key={i} className={x.tipo === 'encargo' && x.hecho ? 'hecho' : ''} style={{ '--c': color(lugarDe(x), x.tipo) } as React.CSSProperties}>
                  <span className="h">{x.tipo === 'fuera' && x.diaCompleto ? 'todo el día' : hora(hhmmDe(x)) || '—'}</span>
                  <span className="t">{x.texto}</span>
                  <span className="l">{TIPO_ENTRADA[x.tipo]} · {lugarDe(x)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="pt-vacio"><b>Tu día está libre</b><span>Se llena desde el chat: «recuérdame a las 5 llamar al notario».</span></div>
          )}
          {!e.agendaConectada && <p className="fa-nota" style={{ marginTop: 10 }}>Tu calendario de Google todavía no está conectado: pídele a Zaelyn «conecta mi calendario».</p>}
        </section>

        <section className="pt-tarjeta">
          <header><h2>Avisos</h2><Link className="pt-overline" href={href('compromisos')}>ver compromisos</Link></header>
          {e.alertas.length ? (
            <ul className="fa-alertas">
              {e.alertas.map((a, i) => { const x = textoAlerta(a); return <li key={i} className={`fa-alerta ${x.tono}`}>{x.t}</li> })}
            </ul>
          ) : <div className="pt-vacio"><b>Sin avisos</b><span>Nada choca y nada está vencido.</span></div>}
          <div className="fa-semana" style={{ marginTop: 14 }}>
            {e.dias.slice(0, 7).map(d => (
              <div key={d.fecha} className={`fa-dia-mini${d.fecha === e.hoy ? ' hoy' : ''}`}>
                <b>{DIA[dow(d.fecha)]}</b><span>{Number(d.fecha.slice(8))}</span>
                <small>{d.entradas.length ? plural(d.entradas.length, 'cosa') : 'libre'}</small>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────── 2 · mis compromisos

const CAJON: Record<string, string> = { diriges: 'Diriges', ejecutas: 'Ejecutas', supervisas: 'Supervisas', sigues: 'Sigues' }
const ESTATUS: Record<string, string> = { abierto: 'abierto', en_curso: 'en curso', bloqueado: 'detenido', hecho: 'hecho', cancelado: 'cancelado' }

function Compromisos({ e }: { e: EstadoDePersona }) {
  const { participaciones, pendientes } = e.compromisos
  return (
    <div className="fa-pila">
      <section className="pt-tarjeta">
        <header><h2>Tus grupos</h2><span className="pt-overline">{plural(participaciones.length, 'grupo')}</span></header>
        {participaciones.length ? (
          <div className="pt-tabla-caja pt-scroll">
            <table className="pt-tabla">
              <thead><tr><th>Grupo</th><th>Tu papel</th><th>Abiertas</th><th>Vencidas</th><th>Quién paga</th></tr></thead>
              <tbody>
                {participaciones.map(p => (
                  <tr key={p.groupId}>
                    <td><b>{p.grupo}</b></td>
                    <td>{p.nombreRol} · {CAJON[p.cajon]}</td>
                    <td>{p.misAbiertas}</td>
                    <td className={p.misVencidas ? 'fa-celda nadie' : ''}>{p.misVencidas}</td>
                    <td>{PAGA(p.paga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="pt-vacio"><b>Todavía no estás en ningún grupo</b><span>Entras con el código que te pase quien lo creó.</span></div>}
      </section>

      <section className="pt-tarjeta">
        <header><h2>Lo que tienes a tu nombre</h2><span className="pt-overline">en todos los planes</span></header>
        {pendientes.length ? (
          <ul className="fa-lista">
            {pendientes.map(p => (
              <li key={p.pendienteId}>
                <span className={`fa-check${p.estatus === 'en_curso' ? ' espera' : ''}`} aria-hidden="true" />
                <span className="t">{p.texto}<span className="fa-de"> · {p.grupo}{p.plan ? ` / ${p.plan}` : ''}</span></span>
                <span className={p.vencida ? 'fa-sin' : 'fa-de'}>{p.vence ? (p.vencida ? `venció ${fecha(p.vence)}` : `vence ${fecha(p.vence)}`) : 'sin fecha'}</span>
                <span className="fa-de">{ESTATUS[p.estatus]}{p.avance ? ` · ${p.avance}%` : ''}</span>
              </li>
            ))}
          </ul>
        ) : <div className="pt-vacio"><b>Nada a tu nombre</b><span>Cuando alguien te asigne una actividad de un plan, aparece aquí.</span></div>}
      </section>
    </div>
  )
}

// ─────────────────────────────────────────────── 3 · calendario

function Calendario({ e, color }: { e: EstadoDePersona; color: ReturnType<typeof colores> }) {
  const semanas = [e.dias.slice(0, 7), e.dias.slice(7, 14)].filter(s => s.length)
  return (
    <div className="fa-pila">
      {semanas.map((s, i) => (
        <section key={i} className="pt-tarjeta">
          <header><h2>{i === 0 ? 'Esta semana' : 'La que sigue'}</h2><span className="pt-overline">{fecha(s[0]!.fecha)} – {fecha(s.at(-1)!.fecha)}</span></header>
          <div className="pt-scroll">
            <div className="fa-cal">
              {s.map(d => (
                <div key={d.fecha} className={`fa-cal-dia${d.fecha === e.hoy ? ' hoy' : ''}`}>
                  <div className="cab"><b>{DIA[dow(d.fecha)]}</b> {Number(d.fecha.slice(8))}</div>
                  {d.entradas.map((x, k) => (
                    <div key={k} className={`fa-ev${x.tipo === 'encargo' && x.hecho ? ' no_hay' : ''}`} style={{ '--c': color(lugarDe(x), x.tipo) } as React.CSSProperties}>
                      <span className="h">{x.tipo === 'vence' ? 'vence' : x.tipo === 'fuera' && x.diaCompleto ? 'todo el día' : hora(hhmmDe(x))}</span>
                      <span className="t">{x.texto}</span>
                      <span className="fa-de">{lugarDe(x)}</span>
                    </div>
                  ))}
                  {!d.entradas.length && <div className="fa-libre">libre</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────── 4 · hábitos

function Habitos({ e }: { e: EstadoDePersona }) {
  if (!e.habitos.length) {
    return (
      <section className="pt-tarjeta">
        <div className="pt-vacio"><b>Todavía no tienes hábitos con meta</b>
          <span>Se promete en el chat: «quiero tomar 2 litros de agua al día». Registrar algo sin meta no lo vuelve hábito: nadie te va a reclamar lo que no prometiste.</span></div>
      </section>
    )
  }
  return (
    <div className="fa-pila">
    <div className="fa-por-persona">
      {e.habitos.map(h => (
        <section key={h.nombre} className="pt-tarjeta">
          <header><h2 style={{ textTransform: 'capitalize' }}>{h.nombre}</h2>
            <span className="pt-overline">{h.meta}{h.unidad ? ` ${h.unidad}` : ''} {h.cadencia === 'diaria' ? 'al día' : 'a la semana'}</span></header>
          <div className="pe-habito">
            <div><b>{h.hoy}</b><small>hoy de {h.meta}</small></div>
            {h.cadencia === 'diaria' && <div><b>{h.racha}</b><small>{h.racha === 1 ? 'día seguido' : 'días seguidos'}</small></div>}
            <div><b>{h.dias.filter(d => d.cumplido).length}</b><small>de 28 días</small></div>
          </div>
          <div className="pe-calor" aria-label={`Los últimos 28 días de ${h.nombre}`}>
            {h.dias.map(d => (
              <i key={d.dia} title={`${fecha(d.dia)}: ${d.total}${h.unidad ? ` ${h.unidad}` : ''}`}
                className={d.cumplido ? 'si' : d.total > 0 ? 'medio' : ''} />
            ))}
          </div>
        </section>
      ))}
    </div>
      <p className="fa-nota">El ánimo no aparece aquí a propósito: lo que escribes de cómo te sientes se guarda con tus palabras y no se convierte en una gráfica.</p>
    </div>
  )
}
