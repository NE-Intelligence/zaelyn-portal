/**
 * Las vistas del plan.
 *
 * Todas reciben el mismo `EstadoPlan` y ninguna abre una consulta ni vuelve a
 * medir. Son funciones de un objeto a una pantalla: por eso no pueden
 * discrepar del chat ni del Excel, que leen ese mismo objeto.
 */
import type { EstadoPlan } from '@/lib/plan'
import { ESTADO_NOMBRE, abiertas, cadenaCritica, enRiesgo, persona, porFase } from '@/lib/plan'
import { Avance, Avatar, Chispa, Distribucion, Kpi, Pill, Prio, dias, fecha } from './atomos'

const pct = (n: number) => `${Math.round(n)}%`

// ── Resumen ─────────────────────────────────────────────────────────────────

export function Resumen({ plan }: { plan: EstadoPlan }) {
  const { proyecto: p } = plan
  const abiertos = abiertas(plan)
  const riesgo = enRiesgo(plan)
  const hechas = plan.actividades.filter((a) => a.estado === 'hecha').length
  const detenidas = plan.actividades.filter((a) => a.estado === 'detenida').length
  const faltan = dias(p.hoy, p.fin)

  return (
    <>
      <div className="pt-rejilla">
        <Kpi
          etiqueta="Avance real"
          valor={pct(p.avance.real)}
          detalle={`Hoy tocaba ${pct(p.avance.esperado)}`}
          tono={p.avance.real < p.avance.esperado - 5 ? 'aviso' : undefined}
        />
        <Kpi etiqueta="Terminadas" valor={`${hechas} / ${plan.actividades.length}`} detalle={`${abiertos.length} siguen abiertas`} />
        <Kpi
          etiqueta="Requieren atención"
          valor={riesgo.length}
          detalle={riesgo.length ? 'Vencidas o detenidas' : 'Nada vencido hoy'}
          tono={riesgo.length ? 'alerta' : undefined}
        />
        <Kpi etiqueta="Detenidas" valor={detenidas} detalle={detenidas ? 'Esperan a alguien o a algo' : 'Ninguna bloqueada'} tono={detenidas ? 'alerta' : undefined} />
        <Kpi etiqueta="Días a la fecha final" valor={faltan} detalle={fecha(p.fin)} />
      </div>

      <ZaelynHoy plan={plan} />

      <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <section className="pt-tarjeta pt-curva">
          <header>
            <h2>Avance contra lo esperado</h2>
            <span className="pt-overline">por semana</span>
          </header>
          <CurvaS plan={plan} />
        </section>

        <section className="pt-tarjeta">
          <header>
            <h2>Avance por fase</h2>
          </header>
          <div style={{ display: 'grid', gap: 14 }}>
            {plan.fases.map((f) => {
              const act = porFase(plan, f.id)
              const real = Math.round(act.reduce((s, a) => s + a.avance, 0) / (act.length || 1))
              const esp = Math.round(act.reduce((s, a) => s + a.esperado, 0) / (act.length || 1))
              return (
                <div key={f.id} style={{ display: 'grid', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 3, height: 14, borderRadius: 2, background: `var(--grp-${f.color})` }} />
                    <b style={{ fontWeight: 600 }}>{f.nombre}</b>
                    <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12 }}>{act.length} actividades</span>
                  </div>
                  <Avance real={real} esperado={esp} />
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="pt-tarjeta">
        <header>
          <h2>Cómo está repartido el plan</h2>
          <span className="pt-overline">{plan.actividades.length} actividades</span>
        </header>
        <Distribucion actividades={plan.actividades} />
      </section>

      {riesgo.length > 0 && (
        <section className="pt-tarjeta">
          <header>
            <h2>Lo que requiere atención hoy</h2>
          </header>
          <div className="pt-cadena">
            {riesgo.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 13 }}>
                <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>
                  {a.clave}
                </span>
                <b style={{ fontWeight: 500 }}>{a.nombre}</b>
                <Pill estado={a.estado} />
                {a.atraso > 0 && <span style={{ color: 'var(--st-detenida-ink)', fontSize: 12 }}>{a.atraso} días tarde</span>}
                {a.bloqueo && <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>· {a.bloqueo}</span>}
                <span style={{ marginLeft: 'auto' }}>
                  <Avatar persona={persona(plan, a.responsable)} />
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  )
}

function ZaelynHoy({ plan }: { plan: EstadoPlan }) {
  return (
    <section className="pt-zaelyn">
      <header>
        <span className="chispa">
          <Chispa />
        </span>
        <h2>Lo que Zaelyn ve hoy</h2>
      </header>
      <p className="resumen">{plan.zaelyn.resumen}</p>
      <ul>
        {plan.zaelyn.puntos.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <p className="salida">
        Para cambiar algo, díselo a Zaelyn por Telegram. El portal solo muestra.
      </p>
    </section>
  )
}

function CurvaS({ plan }: { plan: EstadoPlan }) {
  const W = 560
  const H = 190
  const pad = { t: 12, r: 12, b: 26, l: 30 }
  const n = plan.curva.length - 1
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r)
  const y = (v: number) => H - pad.b - (v / 100) * (H - pad.t - pad.b)

  const linea = (sel: (p: EstadoPlan['curva'][number]) => number | undefined) =>
    plan.curva
      .map((p, i) => ({ i, v: sel(p) }))
      .filter((p): p is { i: number; v: number } => p.v != null)
      .map((p, k) => `${k ? 'L' : 'M'}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`)
      .join(' ')

  const iHoy = plan.curva.findIndex((p) => p.fecha > plan.proyecto.hoy)
  const hoyX = x(iHoy < 0 ? n : iHoy - 1)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva de avance esperado contra real, por semana">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.l - 6} y={y(v) + 3.5} textAnchor="end" fontSize="9.5" fill="var(--ink-3)">
              {v}
            </text>
          </g>
        ))}
        <line x1={hoyX} x2={hoyX} y1={pad.t} y2={H - pad.b} stroke="var(--zaelyn)" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={hoyX + 4} y={pad.t + 9} fontSize="9.5" fill="var(--zaelyn)" fontWeight="600">
          hoy
        </text>
        <path d={linea((p) => p.esperado)} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d={linea((p) => p.real)} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" />
        {plan.curva.map(
          (p, i) =>
            i % 4 === 0 && (
              <text key={p.fecha} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill="var(--ink-3)">
                {fecha(p.fecha)}
              </text>
            ),
        )}
      </svg>
      <div className="pt-leyenda">
        <span>
          <i style={{ background: 'var(--brand)' }} />
          Real
        </span>
        <span>
          <i style={{ background: 'var(--ink-2)' }} />
          Esperado
        </span>
      </div>
    </div>
  )
}

// ── Tablero ─────────────────────────────────────────────────────────────────

export function Tablero({ plan }: { plan: EstadoPlan }) {
  return (
    <div className="pt-tabla-caja">
      <div className="pt-scroll">
        <table className="pt-tabla">
          <thead>
            <tr>
              <th style={{ width: '34%' }}>Actividad</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th>Prio</th>
              <th>Inicia</th>
              <th>Vence</th>
              <th style={{ width: 150 }}>Avance</th>
            </tr>
          </thead>
          {plan.fases.map((f) => {
            const act = porFase(plan, f.id)
            if (!act.length) return null
            return (
              <tbody key={f.id}>
                <tr className="fase">
                  <td colSpan={7}>
                    <span className="tit">
                      <span className="franja" style={{ background: `var(--grp-${f.color})` }} />
                      {f.nombre}
                      <span style={{ color: 'var(--ink-3)', fontWeight: 400, marginLeft: 4 }}>· {act.length}</span>
                    </span>
                  </td>
                </tr>
                {act.map((a) => (
                  <tr key={a.id} className={a.critica ? 'critica' : undefined}>
                    <td>
                      <div className="nombre">
                        <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>
                          {a.clave}
                        </span>
                        <span className="txt">
                          {a.nombre}
                          {a.hito && <span className="pt-bandera" style={{ marginLeft: 6 }}>Hito</span>}
                          {a.critica && <span className="pt-bandera" style={{ marginLeft: 6 }}>Crítica</span>}
                        </span>
                      </div>
                      {a.bloqueo && (
                        <div style={{ fontSize: 11.5, color: 'var(--st-detenida-ink)', marginTop: 2 }}>
                          Detenida por {a.bloqueo}
                        </div>
                      )}
                    </td>
                    <td>
                      <Avatar persona={persona(plan, a.responsable)} />
                    </td>
                    <td>
                      <Pill estado={a.estado} />
                    </td>
                    <td>
                      <Prio prioridad={a.prioridad} />
                    </td>
                    <td className="pt-mono" style={{ color: 'var(--ink-3)' }}>
                      {fecha(a.inicio)}
                    </td>
                    <td className="pt-mono" style={{ color: a.atraso > 0 ? 'var(--st-detenida-ink)' : 'var(--ink-3)' }}>
                      {fecha(a.fin)}
                      {a.atraso > 0 && ` +${a.atraso}d`}
                    </td>
                    <td>
                      <Avance real={a.avance} esperado={a.estado === 'hecha' ? undefined : a.esperado} cifras={false} />
                      <div className="pt-mono" style={{ color: 'var(--ink-3)', marginTop: 3 }}>
                        {a.avance}% {a.estado !== 'hecha' && `· esp ${a.esperado}%`}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            )
          })}
        </table>
      </div>
    </div>
  )
}

// ── Gantt ───────────────────────────────────────────────────────────────────

export function Gantt({ plan }: { plan: EstadoPlan }) {
  const ini = plan.proyecto.inicio
  const total = dias(ini, plan.proyecto.fin) + 1
  const PX = 4.2
  const ancho = total * PX

  const meses: { etiqueta: string; d: number }[] = []
  let cursor = ini
  while (cursor <= plan.proyecto.fin) {
    const [a, m] = cursor.split('-').map(Number)
    const ultimo = new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10)
    const hasta = ultimo > plan.proyecto.fin ? plan.proyecto.fin : ultimo
    meses.push({ etiqueta: fecha(cursor).split(' ')[1], d: dias(cursor, hasta) + 1 })
    cursor = new Date(Date.parse(hasta + 'T00:00:00Z') + 86_400_000).toISOString().slice(0, 10)
  }

  const filas = plan.fases.flatMap((f) => [{ fase: f }, ...porFase(plan, f.id).map((a) => ({ act: a, fase: f }))])

  return (
    <div className="pt-gantt">
      <div className="lista">
        <div className="enc">Actividad</div>
        {filas.map((r, i) =>
          'act' in r && r.act ? (
            <div className="ren" key={r.act.id}>
              <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>
                {r.act.clave}
              </span>
              <span className="txt">{r.act.nombre}</span>
            </div>
          ) : (
            <div className="ren" key={`f${i}`} style={{ background: 'var(--surface-2)' }}>
              <span className="franja" style={{ width: 3, height: 14, borderRadius: 2, background: `var(--grp-${r.fase.color})` }} />
              <b style={{ fontSize: 12.5, fontWeight: 600 }}>{r.fase.nombre}</b>
            </div>
          ),
        )}
      </div>

      <div className="lienzo">
        <div style={{ width: ancho, minWidth: '100%' }}>
          <div className="meses">
            {meses.map((m, i) => (
              <div className="mes" key={i} style={{ width: m.d * PX }} title={m.etiqueta}>
                {m.d * PX > 30 ? m.etiqueta : ''}
              </div>
            ))}
          </div>
          <div className="pistas">
            <div className="hoy" style={{ left: dias(ini, plan.proyecto.hoy) * PX }} />
            {filas.map((r, i) => {
              if (!('act' in r) || !r.act) return <div className="pista" key={`f${i}`} style={{ background: 'var(--surface-2)' }} />
              const a = r.act
              const x = dias(ini, a.inicio) * PX
              const w = Math.max((dias(a.inicio, a.fin) + 1) * PX, 6)
              return (
                <div className="pista" key={a.id}>
                  {a.hito ? (
                    <div
                      className="hito"
                      style={{ left: x, background: `var(--grp-${r.fase.color})` }}
                      title={`${a.nombre} · ${fecha(a.fin)}`}
                    />
                  ) : (
                    <div
                      className={`barra${a.critica ? ' es-critica' : ''}`}
                      style={{ left: x, width: w, background: `var(--grp-${r.fase.color})` }}
                      title={`${a.nombre} · ${fecha(a.inicio)} → ${fecha(a.fin)} · ${a.avance}%`}
                    >
                      <div className="relleno" style={{ width: `${a.avance}%` }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Ruta crítica ────────────────────────────────────────────────────────────

export function Ruta({ plan }: { plan: EstadoPlan }) {
  const cadena = cadenaCritica(plan)
  const sinEstimar = cadena.filter((a) => a.minutos == null)
  const horas = sinEstimar.length ? null : Math.round(cadena.reduce((s, a) => s + (a.minutos ?? 0), 0) / 60)

  return (
    <>
      <section className="pt-zaelyn">
        <header>
          <span className="chispa">
            <Chispa />
          </span>
          <h2>La cadena que manda sobre la fecha final</h2>
        </header>
        <p className="resumen">
          {cadena.length} actividades encadenadas, de «{cadena[0]?.nombre}» a «{cadena[cadena.length - 1]?.nombre}».
          El último eslabón vence el {fecha(cadena[cadena.length - 1]?.fin ?? plan.proyecto.fin)}, que es la fecha final del plan.
        </p>
        {horas == null ? (
          <>
            <ul>
              <li>
                <b style={{ fontWeight: 600 }}>
                  No se da la duración total: {sinEstimar.length === 1 ? 'falta' : 'faltan'} las horas de{' '}
                  {sinEstimar.length} {sinEstimar.length === 1 ? 'renglón' : 'renglones'}
                </b>
                {' ('}
                {sinEstimar.map((a) => a.clave).join(', ')}
                {'). '}
                Rellenarlas con un promedio sería un número inventado con cara de cálculo.
              </li>
              <li>
                El camino más rápido: pídele a Zaelyn «mándame el estatus en excel», llena la columna Horas y súbelo con «importa el plan».
              </li>
            </ul>
            <p className="salida">
              Con un antecesor por renglón esto es la cadena más larga, no un CPM con holguras. Decirlo importa.
            </p>
          </>
        ) : (
          <ul>
            <li>Duración total de la cadena: {horas} horas de esfuerzo estimado.</li>
          </ul>
        )}
      </section>

      <section className="pt-tarjeta">
        <header>
          <h2>Los eslabones, en orden</h2>
          <span className="pt-overline">{cadena.length} de {plan.actividades.length}</span>
        </header>
        <div className="pt-cadena">
          {cadena.map((a, i) => (
            <div key={a.id}>
              <div className="pt-eslabon">
                <div className="orden">{String(i + 1).padStart(2, '0')}</div>
                <div className="caja">
                  <div className="fila1">
                    <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>
                      {a.clave}
                    </span>
                    <b style={{ fontWeight: 500 }}>{a.nombre}</b>
                    <Pill estado={a.estado} />
                    {a.minutos == null && <span className="pt-bandera">Sin horas</span>}
                  </div>
                  <div className="fila2">
                    <Avatar persona={persona(plan, a.responsable)} />
                    <span className="pt-mono">
                      {fecha(a.inicio)} → {fecha(a.fin)}
                    </span>
                    <span>
                      {a.avance}% de {a.esperado}% esperado
                    </span>
                    {a.bloqueo && <span style={{ color: 'var(--st-detenida-ink)' }}>Detenida por {a.bloqueo}</span>}
                  </div>
                </div>
              </div>
              {i < cadena.length - 1 && <div className="pt-flecha" />}
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

// ── Equipo ──────────────────────────────────────────────────────────────────

export function Equipo({ plan }: { plan: EstadoPlan }) {
  const sinDueno = plan.actividades.filter((a) => !a.responsable && a.estado !== 'hecha')
  return (
    <>
      <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))' }}>
        {plan.personas.map((p) => {
          const suyas = plan.actividades.filter((a) => a.responsable === p.id)
          const abiertas = suyas.filter((a) => a.estado !== 'hecha')
          const tarde = abiertas.filter((a) => a.atraso > 0 || a.estado === 'detenida')
          const sigue = abiertas.slice().sort((a, b) => a.fin.localeCompare(b.fin))[0]
          return (
            <article className="pt-persona" key={p.id}>
              <div className="top">
                <Avatar persona={p} nombre={false} />
                <div style={{ minWidth: 0 }}>
                  <b style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</b>
                  <div className="puesto">{p.puesto}</div>
                </div>
                <span style={{ marginLeft: 'auto' }}>
                  <span className="pt-rol">{p.rol}</span>
                </span>
              </div>
              <div className="nums">
                <div>
                  <b>{abiertas.length}</b>
                  abiertas
                </div>
                <div>
                  <b>{suyas.filter((a) => a.estado === 'hecha').length}</b>
                  hechas
                </div>
                <div>
                  <b style={{ color: tarde.length ? 'var(--st-detenida-ink)' : undefined }}>{tarde.length}</b>
                  en riesgo
                </div>
              </div>
              <div className="sigue">
                {sigue ? (
                  <>
                    Lo que sigue: <b style={{ fontWeight: 500 }}>{sigue.nombre}</b>, vence {fecha(sigue.fin)}.
                  </>
                ) : (
                  'Sin nada abierto.'
                )}
              </div>
            </article>
          )
        })}
      </div>

      {sinDueno.length > 0 && (
        <section className="pt-tarjeta">
          <header>
            <h2>Sin responsable</h2>
            <span className="pt-overline">{sinDueno.length}</span>
          </header>
          <div className="pt-cadena">
            {sinDueno.map((a) => (
              <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 13 }}>
                <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>
                  {a.clave}
                </span>
                <b style={{ fontWeight: 500 }}>{a.nombre}</b>
                <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>arranca {fecha(a.inicio)}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ink-3)' }}>
            Zaelyn no las reparte solo. Para asignarlas, díselo: «asigna el pendiente de las pruebas a @alguien».
          </p>
        </section>
      )}
    </>
  )
}

// ── Bitácora ────────────────────────────────────────────────────────────────

export function Bitacora({ plan }: { plan: EstadoPlan }) {
  return (
    <section className="pt-tarjeta">
      <header>
        <h2>Qué cambió, quién y por dónde</h2>
        <span className="pt-overline">últimos movimientos</span>
      </header>
      <div className="pt-bitacora">
        {plan.bitacora.map((b, i) => (
          <div className="ent" key={i}>
            <div className="cuando">
              {fecha(b.fecha)} {b.hora}
            </div>
            <div className="que">
              <b style={{ fontWeight: 600 }}>{b.autor}</b> {b.texto}
              <span className="canal">· {b.canal}</span>
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--ink-3)' }}>
        Cada renglón quedó registrado cuando alguien lo dijo en el chat. Nadie escribió en una celda.
      </p>
    </section>
  )
}

export const ESTADOS_TEXTO = ESTADO_NOMBRE
