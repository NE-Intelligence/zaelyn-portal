/**
 * Las vistas del plan.
 *
 * Todas reciben el mismo `VistaDePlan` —lo que Zaelyn devolvió, tal cual— y
 * ninguna abre una consulta ni vuelve a medir. Son funciones de un objeto a
 * una pantalla: por eso no pueden discrepar del chat ni del Excel, que leen
 * ese mismo objeto.
 *
 * Donde el dato falta, la pantalla lo DICE. No hay una versión aproximada de
 * un número que nadie puso: un hueco se llena, y un número inventado con cara
 * de cálculo se cree.
 */
import type { PuntoDeCurva, Renglon, VistaDePlan } from '@/lib/plan'
import { deFase, enRiesgo, persona } from '@/lib/plan'
import {
  Avance, Avatar, Chispa, Crit, Distribucion, Franja, Kpi, Margen, Pill, Senales,
  cuando, dias, fecha, plural, tarde,
} from './atomos'

const horas = (m: number | null | undefined) =>
  m === null || m === undefined ? null : Math.round((m / 60) * 10) / 10

// ── Resumen ─────────────────────────────────────────────────────────────────

export function Resumen({ v }: { v: VistaDePlan }) {
  const e = v.estado
  const p = e.punto
  // «Lo que requiere atención» son las que TRAEN SEÑALES, no todo lo abierto.
  // Con todo lo abierto la tarjeta decía «2 requieren atención» y debajo
  // listaba siete: el encabezado y la lista contaban cosas distintas, que es
  // exactamente la clase de incoherencia que hace que nadie lea ninguna.
  const riesgo = enRiesgo(v).filter(r => r.criticidad !== 'ninguna')
  const criticos = riesgo.filter(r => r.criticidad === 'critica')
  const detenidos = e.renglones.filter(r => r.estatus === 'bloqueado').length
  const finDelPlan = v.ruta.venceElPlan

  return (
    <>
      <div className="pt-rejilla">
        <Kpi
          etiqueta="Avance real"
          valor={`${p.declarado}%`}
          detalle={p.esperado === null
            ? 'Sin fechas no hay esperado'
            : `Hoy tocaba ${p.esperado}%`}
          tono={p.esperado !== null && p.declarado < p.esperado - 5 ? 'aviso' : undefined}
        />
        <Kpi
          etiqueta="Terminadas"
          valor={`${p.cerrados} / ${p.total}`}
          detalle={`${p.total - p.cerrados} siguen abiertas`}
        />
        <Kpi
          etiqueta="Requieren atención"
          valor={criticos.length}
          detalle={criticos.length ? 'Vencidas, detenidas o sin nadie encima' : 'Nada crítico hoy'}
          tono={criticos.length ? 'alerta' : undefined}
        />
        <Kpi
          etiqueta="Detenidas"
          valor={detenidos}
          detalle={detenidos ? 'Esperan a algo' : 'Ninguna esperando'}
          tono={detenidos ? 'alerta' : undefined}
        />
        {finDelPlan ? (
          <Kpi
            etiqueta="Días a la fecha final"
            valor={dias(e.hoy, finDelPlan)}
            detalle={fecha(finDelPlan)}
          />
        ) : (
          <Kpi etiqueta="Fecha final" valor="—" detalle="Nadie ha puesto fechas" />
        )}
      </div>

      <ZaelynHoy v={v} />

      <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <section className="pt-tarjeta pt-curva">
          <header>
            <h2>Avance contra lo esperado</h2>
            <span className="pt-overline">
              {v.curva.paso === 7 ? 'por semana' : `cada ${v.curva.paso} días`}
            </span>
          </header>
          <CurvaS v={v} />
        </section>

        <section className="pt-tarjeta">
          <header>
            <h2>Avance por fase</h2>
            <span className="pt-overline">
              {e.punto.base === 'minutos' ? 'ponderado por horas' : 'por número de actividades'}
            </span>
          </header>
          <div style={{ display: 'grid', gap: 14 }}>
            {v.fases.map(f => (
              <div key={f.nombre ?? 'sin'} style={{ display: 'grid', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <Franja orden={f.orden} />
                  <b style={{ fontWeight: 600 }}>{f.nombre ?? 'Sin fase'}</b>
                  {f.hitos > 0 && <span className="pt-bandera">{f.hitos} hito(s)</span>}
                  <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12 }}>
                    {f.total} actividades
                  </span>
                </div>
                {/* EL AVANCE DE LA FASE LO AGREGÓ EL CONTRATO (#169). El
                    promedio de los porcentajes no es el avance de la fase. */}
                <Avance real={f.punto.declarado} esperado={f.punto.esperado} />
                {/* Y SI ESTA FASE SE PESÓ DISTINTO QUE EL PLAN, SE DICE: el
                    número significa otra cosa, y leerlo igual sería leerlo mal. */}
                {f.punto.base !== e.punto.base && (
                  <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                    Esta fase se pesó por número de actividades: {f.punto.sinEstimacion} sin horas.
                  </span>
                )}
              </div>
            ))}
            {v.fases.length === 1 && v.fases[0]!.nombre === null && (
              <p style={{ fontSize: 12.5, color: 'var(--ink-3)', margin: 0 }}>
                Ninguna actividad trae fase. Si tu Excel tiene una columna
                «Etapa» o «Fase», súbelo otra vez y se agrupan solas.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="pt-tarjeta">
        <header>
          <h2>Cómo está repartido el plan</h2>
          <span className="pt-overline">{e.renglones.length} actividades</span>
        </header>
        <Distribucion renglones={e.renglones} />
      </section>

      {riesgo.length > 0 && (
        <section className="pt-tarjeta">
          <header>
            <h2>Lo que requiere atención hoy</h2>
            <span className="pt-overline">en orden de gravedad</span>
          </header>
          <div className="pt-cadena">
            {riesgo.slice(0, 12).map(r => {
              const d = tarde(r, e.hoy)
              return (
                <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 13 }}>
                  {r.clave && <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>{r.clave}</span>}
                  <b style={{ fontWeight: 500 }}>{r.texto}</b>
                  <Pill estatus={r.estatus} />
                  {d > 0 && <span style={{ color: 'var(--st-detenida-ink)', fontSize: 12 }}>{d} días tarde</span>}
                  {r.espera && <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>· espera «{r.espera}»</span>}
                  <Senales senales={r.senales} />
                  <span style={{ marginLeft: 'auto' }}>
                    <Avatar persona={persona(e, r.personaId)} />
                  </span>
                </div>
              )
            })}
          </div>
          {riesgo.length > 12 && (
            <p style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ink-3)' }}>
              Y {riesgo.length - 12} más. El Tablero las trae todas.
            </p>
          )}
        </section>
      )}
    </>
  )
}

/**
 * El párrafo de arriba viene ESCRITO desde Zaelyn (#169).
 *
 * Porque es una lectura, no una decoración: dice si el plan va bien y por qué.
 * Una pantalla que redacta su propio diagnóstico elige qué es «va atrasado», y
 * eso ya lo eligió el motor.
 */
function ZaelynHoy({ v }: { v: VistaDePlan }) {
  return (
    <section className="pt-zaelyn">
      <header>
        <span className="chispa"><Chispa /></span>
        <h2>Lo que Zaelyn ve hoy</h2>
      </header>
      <p className="resumen">{v.narrativa.resumen}</p>
      <ul>
        {v.narrativa.puntos.map(x => <li key={x}>{x}</li>)}
      </ul>
      <p className="salida">
        Para cambiar algo, díselo a Zaelyn por el chat. El portal solo muestra.
      </p>
    </section>
  )
}

function CurvaS({ v }: { v: VistaDePlan }) {
  const W = 560
  const H = 190
  const pad = { t: 12, r: 12, b: 26, l: 30 }
  const pts = v.curva.puntos
  const n = Math.max(pts.length - 1, 1)
  const x = (i: number) => pad.l + (i / n) * (W - pad.l - pad.r)
  const y = (val: number) => H - pad.b - (val / 100) * (H - pad.t - pad.b)

  const linea = (sel: (p: PuntoDeCurva) => number | null) =>
    pts
      .map((p, i) => ({ i, v: sel(p) }))
      .filter((p): p is { i: number; v: number } => p.v !== null)
      .map((p, k) => `${k ? 'L' : 'M'}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`)
      .join(' ')

  if (pts.length < 2) {
    return (
      <div className="pt-vacio">
        <b>Todavía no hay curva</b>
        <span>Hace falta que el plan tenga fechas para poder dibujar qué tocaba cada semana.</span>
      </div>
    )
  }

  const iFuturo = pts.findIndex(p => p.real === null)
  const hoyX = x(iFuturo < 0 ? n : Math.max(iFuturo - 1, 0))
  const cada = Math.max(1, Math.ceil(pts.length / 7))

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Curva de avance esperado contra real">
        {[0, 25, 50, 75, 100].map(val => (
          <g key={val}>
            <line x1={pad.l} x2={W - pad.r} y1={y(val)} y2={y(val)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.l - 6} y={y(val) + 3.5} textAnchor="end" fontSize="9.5" fill="var(--ink-3)">{val}</text>
          </g>
        ))}
        <line x1={hoyX} x2={hoyX} y1={pad.t} y2={H - pad.b} stroke="var(--zaelyn)" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={hoyX + 4} y={pad.t + 9} fontSize="9.5" fill="var(--zaelyn)" fontWeight="600">hoy</text>
        <path d={linea(p => p.esperado)} fill="none" stroke="var(--ink-2)" strokeWidth="1.5" strokeDasharray="4 3" />
        {/* LA LÍNEA REAL SE CORTA EN HOY porque el payload la trae en null de
            ahí en adelante. Una línea plana hacia el futuro se lee como una
            promesa de que nada va a cambiar. */}
        <path d={linea(p => p.real)} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" />
        {pts.map((p, i) => i % cada === 0 && (
          <text key={p.fecha} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill="var(--ink-3)">
            {fecha(p.fecha)}
          </text>
        ))}
      </svg>
      <div className="pt-leyenda">
        <span><i style={{ background: 'var(--brand)' }} />Real, hasta hoy</span>
        <span><i style={{ background: 'var(--ink-2)' }} />Esperado</span>
      </div>
      {v.curva.desde && (
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--ink-3)' }}>
          La línea real empieza el {fecha(v.curva.desde)}, que es la primera vez que
          alguien declaró algo. Antes de esa fecha el cero significa «nadie había
          dicho nada», no «no se había hecho nada».
        </p>
      )}
    </div>
  )
}

// ── Tablero ─────────────────────────────────────────────────────────────────

export function Tablero({ v }: { v: VistaDePlan }) {
  const e = v.estado
  return (
    <div className="pt-tabla-caja">
      <div className="pt-scroll">
        <table className="pt-tabla">
          <thead>
            <tr>
              <th style={{ width: '34%' }}>Actividad</th>
              <th>Responsable</th>
              <th>Estado</th>
              <th>Crit</th>
              <th>Inicia</th>
              <th>Vence</th>
              <th>Margen</th>
              <th style={{ width: 150 }}>Avance</th>
            </tr>
          </thead>
          {v.fases.map(f => {
            const rs = deFase(e, f.nombre)
            if (!rs.length) return null
            return (
              <tbody key={f.nombre ?? 'sin'}>
                <tr className="fase">
                  <td colSpan={8}>
                    <span className="tit">
                      <Franja orden={f.orden} />
                      {f.nombre ?? 'Sin fase'}
                      <span style={{ color: 'var(--ink-3)', fontWeight: 400, marginLeft: 4 }}>· {rs.length}</span>
                    </span>
                  </td>
                </tr>
                {rs.map(r => {
                  const d = tarde(r, e.hoy)
                  return (
                    <tr key={r.id} className={r.manda ? 'critica' : undefined}>
                      <td>
                        <div className="nombre">
                          {r.clave && <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>{r.clave}</span>}
                          <span className="txt">
                            {r.texto}
                            {r.hito && <span className="pt-bandera" style={{ marginLeft: 6 }}>Hito</span>}
                            {r.manda && <span className="pt-bandera" style={{ marginLeft: 6 }}>Sin margen</span>}
                          </span>
                        </div>
                        {r.espera && (
                          <div style={{ fontSize: 11.5, color: 'var(--st-detenida-ink)', marginTop: 2 }}>
                            Espera «{r.espera}»
                          </div>
                        )}
                        {r.notas > 0 && (
                          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                            {r.notas} nota(s) · en la Bitácora
                          </div>
                        )}
                      </td>
                      <td><Avatar persona={persona(e, r.personaId)} /></td>
                      <td><Pill estatus={r.estatus} /></td>
                      <td><Crit criticidad={r.criticidad} /></td>
                      <td className="pt-mono" style={{ color: 'var(--ink-3)' }}>{fecha(r.inicia)}</td>
                      <td className="pt-mono" style={{ color: d > 0 ? 'var(--st-detenida-ink)' : 'var(--ink-3)' }}>
                        {fecha(r.vence)}
                        {d > 0 && ` +${d}d`}
                      </td>
                      {/* UNA HOLGURA QUE NO SE SABE NO ES CERO, y se dice. Y
                          el margen de algo ya cerrado no le importa a nadie:
                          en blanco, no en «72d», que se lee como una holgura
                          que alguien podría aprovechar. */}
                      <td className="pt-mono" style={{ color: r.manda ? 'var(--st-detenida-ink)' : 'var(--ink-3)' }}
                          title={r.abierto && r.holgura === null ? 'Falta la fecha para poder medirlo' : undefined}>
                        {!r.abierto ? '' : r.holgura === null ? '—' : r.holgura <= 0 ? 'sin margen' : `${r.holgura}d`}
                      </td>
                      <td>
                        <Avance real={r.avance} esperado={r.abierto ? r.esperado : null} cifras={false} />
                        <div className="pt-mono" style={{ color: 'var(--ink-3)', marginTop: 3 }}>
                          {r.avance}%
                          {r.abierto && r.esperado !== null && ` · esp ${r.esperado}%`}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            )
          })}
        </table>
      </div>
    </div>
  )
}

// ── Gantt ───────────────────────────────────────────────────────────────────

export function Gantt({ v }: { v: VistaDePlan }) {
  const e = v.estado
  const conFecha = e.renglones.filter(r => r.inicia || r.vence)
  const ini = conFecha.map(r => r.inicia ?? r.vence!).sort()[0] ?? e.hoy
  const fin = conFecha.map(r => r.vence ?? r.inicia!).sort().at(-1) ?? e.hoy
  const total = Math.max(dias(ini, fin) + 1, 1)
  const PX = Math.min(Math.max(760 / total, 1.4), 14)
  const ancho = total * PX

  if (!conFecha.length) {
    return (
      <div className="pt-vacio" style={{ maxWidth: 560 }}>
        <b>No hay nada que dibujar todavía</b>
        <span>
          Ninguna actividad trae fechas. Un Gantt sin fechas no es un Gantt vacío:
          es una pantalla que no puede decir nada. Dile a Zaelyn cuándo van las
          cosas, o sube el Excel con las columnas «Inicio» y «Fecha compromiso».
        </span>
      </div>
    )
  }

  const meses: { etiqueta: string; d: number }[] = []
  let cursor = ini
  while (cursor <= fin) {
    const [a, m] = cursor.split('-').map(Number)
    const ultimo = new Date(Date.UTC(a!, m!, 0)).toISOString().slice(0, 10)
    const hasta = ultimo > fin ? fin : ultimo
    meses.push({ etiqueta: fecha(cursor).split(' ')[1] ?? '', d: dias(cursor, hasta) + 1 })
    cursor = new Date(Date.parse(`${hasta}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10)
  }

  const filas = v.fases.flatMap(f => [
    { fase: f, act: null as Renglon | null },
    ...deFase(e, f.nombre).map(r => ({ fase: f, act: r })),
  ])

  return (
    <div className="pt-gantt">
      <div className="lista">
        <div className="enc">Actividad</div>
        {filas.map((row, i) => row.act ? (
          <div className="ren" key={row.act.id}>
            {row.act.clave && <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>{row.act.clave}</span>}
            <span className="txt">{row.act.texto}</span>
          </div>
        ) : (
          <div className="ren" key={`f${i}`} style={{ background: 'var(--surface-2)' }}>
            <Franja orden={row.fase.orden} />
            <b style={{ fontSize: 12.5, fontWeight: 600 }}>{row.fase.nombre ?? 'Sin fase'}</b>
          </div>
        ))}
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
            <div className="hoy" style={{ left: dias(ini, e.hoy) * PX }} />
            {filas.map((row, i) => {
              const a = row.act
              if (!a) return <div className="pista" key={`f${i}`} style={{ background: 'var(--surface-2)' }} />
              // Sin fechas no se pinta una barra inventada: se deja la pista
              // vacía, que es exactamente lo que se sabe de esa actividad.
              if (!a.inicia && !a.vence) return <div className="pista" key={a.id} />
              const desde = a.inicia ?? a.vence!
              const hasta = a.vence ?? a.inicia!
              const x = dias(ini, desde) * PX
              const w = Math.max((dias(desde, hasta) + 1) * PX, 6)
              const color = `var(--grp-${row.fase.orden === null ? 6 : ((row.fase.orden - 1) % 5) + 1})`
              return (
                <div className="pista" key={a.id}>
                  {a.hito ? (
                    <div className="hito" style={{ left: x, background: color }}
                         title={`${a.texto} · ${fecha(hasta)}`} />
                  ) : (
                    <div
                      className={`barra${a.manda ? ' es-critica' : ''}`}
                      style={{ left: x, width: w, background: color }}
                      title={`${a.texto} · ${fecha(desde)} → ${fecha(hasta)} · ${a.avance}%`
                        + (a.holgura === null ? ' · margen desconocido'
                          : a.holgura === 0 ? ' · sin margen' : ` · ${a.holgura}d de margen`)}
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

export function Ruta({ v }: { v: VistaDePlan }) {
  const r = v.ruta
  const e = v.estado
  const porId = new Map(e.renglones.map(x => [x.id, x]))
  const total = horas(r.minutos)
  const resta = horas(r.minutosRestantes)
  const mandan = r.manda.filter(x => x.abierto)

  /**
   * UN CICLO SE DICE Y NO SE DIBUJA.
   *
   * Dos actividades que se esperan entre sí no tienen orden, así que no tienen
   * holgura — ninguna, en todo el plan. Dibujar una cadena sobre un grafo sin
   * orden sería inventar una secuencia.
   */
  if (r.ciclo) {
    return (
      <section className="pt-zaelyn">
        <header>
          <span className="chispa"><Chispa /></span>
          <h2>No puedo calcular la ruta</h2>
        </header>
        <p className="resumen">
          Hay dependencias en círculo, y mientras estén nada tiene holgura: una
          actividad espera a otra que, dando la vuelta, la espera a ella.
        </p>
        {r.enCiclo.length > 0 && (
          <ul>
            <li>Dan la vuelta: {r.enCiclo.slice(0, 8).map(t => `«${t}»`).join(' → ')}.</li>
          </ul>
        )}
        <p className="salida">
          Dile a Zaelyn cuál de esas dependencias sobra —«la cotización ya no
          depende del anexo»— y vuelvo a calcular.
        </p>
      </section>
    )
  }

  if (!r.cadena.length) {
    return (
      <div className="pt-vacio" style={{ maxWidth: 620 }}>
        <b>Este plan no tiene cadena de dependencias</b>
        <span>
          Sus {e.renglones.filter(x => x.abierto).length} actividades abiertas se
          ven independientes entre sí. Para que haya ruta crítica hace falta
          decir qué espera a qué: «el pendiente de la cotización depende de
          firmar el anexo y de la visita». Si el plan viene de Excel, la columna
          «Depende de» acepta varias claves separadas por coma.
        </span>
      </div>
    )
  }

  return (
    <>
      <section className="pt-zaelyn">
        <header>
          <span className="chispa"><Chispa /></span>
          <h2>Qué manda sobre la fecha final</h2>
        </header>
        <p className="resumen">
          {mandan.length
            ? `${plural(mandan.length, 'actividad', 'actividades')} no `
              + `${mandan.length === 1 ? 'tiene' : 'tienen'} margen: si se `
              + `${mandan.length === 1 ? 'mueve' : 'mueven'}, se mueve la fecha final del plan. `
              + `La cadena más larga tiene ${plural(r.cadena.length, 'eslabón', 'eslabones')}`
              + `${r.vence ? `, y el último vence el ${fecha(r.vence)}` : ''}.`
            : `La cadena más larga tiene ${plural(r.cadena.length, 'eslabón', 'eslabones')} `
              + 'y todos tienen margen o ya están cerrados.'}
        </p>
        <ul>
          {total !== null ? (
            <li>
              Duración de la cadena: {total} h de esfuerzo estimado
              {resta !== null && resta !== total ? `, de las que faltan ${resta} h.` : '.'}
            </li>
          ) : (
            <li>
              <b style={{ fontWeight: 600 }}>
                No doy la duración total: {r.faltanEstimacion === 1 ? 'falta' : 'faltan'}{' '}
                las horas de {plural(r.faltanEstimacion, 'eslabón', 'eslabones')}.
              </b>{' '}
              Rellenarlas con un promedio sería un número inventado con cara de cálculo.
              Pídele a Zaelyn «mándame el estatus en excel», llena la columna Horas y súbelo.
            </li>
          )}
          {r.base === 'eslabones' && (
            <li>
              Elegí esta cadena por número de eslabones y no por duración, porque
              no todas las actividades traen fechas: puede que la larga de verdad sea otra.
            </li>
          )}
          {r.holguraDesconocida > 0 && (
            <li>
              De {plural(r.holguraDesconocida, 'actividad', 'actividades')} no puedo decir
              cuánto margen {r.holguraDesconocida === 1 ? 'tiene' : 'tienen'}
              {': '}
              {[
                r.sinVence > 0 ? `${r.sinVence} sin fecha límite` : null,
                r.sinInicioDelSucesor > 0
                  ? `${r.sinInicioDelSucesor} ${r.sinInicioDelSucesor === 1 ? 'espera' : 'esperan'} `
                    + 'a algo que no dice cuándo arranca'
                  : null,
              ].filter(Boolean).join(' y ')}
              . Y no las cuento como críticas: una holgura que no se sabe no es cero.
            </li>
          )}
          {r.sueltos > 0 && (
            <li>
              {plural(r.sueltos, 'actividad abierta', 'actividades abiertas')} no{' '}
              {r.sueltos === 1 ? 'espera' : 'esperan'} a nada ni{' '}
              {r.sueltos === 1 ? 'la espera' : 'las espera'} nadie.
            </li>
          )}
        </ul>
        <p className="salida">
          El margen sale de las fechas que ustedes pusieron. Zaelyn no reacomoda
          el plan: te dice cuánto se puede recorrer cada cosa sin empujar lo que viene detrás.
        </p>
      </section>

      {mandan.length > 0 && (
        <section className="pt-tarjeta">
          <header>
            <h2>Sin margen</h2>
            <span className="pt-overline">holgura cero</span>
          </header>
          <div className="pt-cadena">
            {mandan.map(x => (
              <div key={x.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 13 }}>
                <b style={{ fontWeight: 500 }}>{x.texto}</b>
                <Pill estatus={x.estatus} />
                {x.quien && <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>{x.quien}</span>}
                <span className="pt-mono" style={{ marginLeft: 'auto', color: 'var(--ink-3)' }}>
                  vence {fecha(x.vence)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="pt-tarjeta">
        <header>
          <h2>La cadena, en orden</h2>
          <span className="pt-overline">{r.cadena.length} de {e.renglones.length}</span>
        </header>
        <div className="pt-cadena">
          {r.cadena.map((x, i) => {
            const full = porId.get(x.id)
            return (
              <div key={x.id}>
                <div className="pt-eslabon">
                  <div className="orden">{String(i + 1).padStart(2, '0')}</div>
                  <div className="caja">
                    <div className="fila1">
                      {full?.clave && <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>{full.clave}</span>}
                      <b style={{ fontWeight: 500 }}>{x.texto}</b>
                      <Pill estatus={x.estatus} />
                      {x.minutos === null && <span className="pt-bandera">sin horas</span>}
                      {/* El margen de algo ya cerrado no le importa a nadie. */}
                      {x.abierto && full && <Margen dias={full.holgura} />}
                    </div>
                    <div className="fila2">
                      <Avatar persona={persona(e, full?.personaId)} />
                      <span className="pt-mono">
                        {fecha(full?.inicia)} → {fecha(x.vence)}
                      </span>
                      {full && (full.avance > 0 || (full.esperado ?? 0) > 0
                        ? (
                          <span>
                            {full.avance}%
                            {full.abierto && full.esperado !== null && ` de ${full.esperado}% esperado`}
                          </span>
                        )
                        : <span>no ha arrancado</span>)}
                      {full?.espera && (
                        <span style={{ color: 'var(--st-detenida-ink)' }}>espera «{full.espera}»</span>
                      )}
                    </div>
                  </div>
                </div>
                {i < r.cadena.length - 1 && <div className="pt-flecha" />}
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}

// ── Equipo ──────────────────────────────────────────────────────────────────

export function Equipo({ v }: { v: VistaDePlan }) {
  const e = v.estado
  const sinDueno = e.renglones.filter(r => !r.personaId && r.abierto)
  return (
    <>
      <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))' }}>
        {e.personas.map(p => {
          const suyas = e.renglones.filter(r => r.personaId === p.id && r.abierto)
          const sigue = suyas.slice().sort((a, b) =>
            (a.vence ?? '9999').localeCompare(b.vence ?? '9999'))[0]
          return (
            <article className="pt-persona" key={p.id}>
              <div className="top">
                <Avatar persona={p} nombre={false} />
                <div style={{ minWidth: 0 }}>
                  <b style={{ fontWeight: 600, fontSize: 14 }}>{p.nombre}</b>
                  <div className="puesto">
                    {p.tieneCuenta ? 'Tiene cuenta de Zaelyn' : 'Sin cuenta: alguien reporta por ella'}
                  </div>
                </div>
                {p.rol && <span style={{ marginLeft: 'auto' }}><span className="pt-rol">{p.rol}</span></span>}
              </div>
              {/* LAS TRES CUENTAS LAS TRAE EL CONTRATO, por persona. */}
              <div className="nums">
                <div><b>{p.abiertos}</b>abiertas</div>
                <div><b>{p.cerrados}</b>hechas</div>
                <div>
                  <b style={{ color: p.atrasados ? 'var(--st-detenida-ink)' : undefined }}>{p.atrasados}</b>
                  vencidas
                </div>
              </div>
              <div className="sigue">
                {sigue
                  ? <>Lo que sigue: <b style={{ fontWeight: 500 }}>{sigue.texto}</b>
                      {sigue.vence ? `, vence ${fecha(sigue.vence)}.` : ', sin fecha.'}</>
                  : 'Sin nada abierto.'}
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
            {sinDueno.map(r => (
              <div key={r.id} style={{ display: 'flex', gap: 10, alignItems: 'baseline', flexWrap: 'wrap', fontSize: 13 }}>
                {r.clave && <span className="pt-mono" style={{ color: 'var(--ink-3)' }}>{r.clave}</span>}
                <b style={{ fontWeight: 500 }}>{r.texto}</b>
                <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                  {r.inicia ? `arranca ${fecha(r.inicia)}` : 'sin fecha de arranque'}
                </span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ink-3)' }}>
            Zaelyn no las reparte solo. Para asignarlas, díselo: «asigna el
            pendiente de las pruebas a @alguien».
          </p>
        </section>
      )}
    </>
  )
}

// ── Bitácora ────────────────────────────────────────────────────────────────

const EVENTO: Record<string, string> = {
  creado: 'anotó',
  asignado: 'reasignó',
  priorizado: 'cambió la prioridad de',
  movido: 'movió la fecha de',
  bloqueado: 'dejó esperando',
  destrabado: 'destrabó',
  hecho: 'cerró',
  cancelado: 'canceló',
  comentado: 'anotó en',
  importado: 'importó',
  avance: 'declaró el avance de',
  iniciado: 'arrancó',
  // Las prórrogas (#174). «aprobada» reemplaza al «movido» de ese mismo acto:
  // es la misma fecha movida, contada con el motivo.
  prorroga_pedida: 'pidió una prórroga para',
  prorroga_aprobada: 'aprobó la prórroga de',
  prorroga_negada: 'negó la prórroga de',
}

export function Bitacora({ v }: { v: VistaDePlan }) {
  if (!v.bitacora.length) {
    return (
      <div className="pt-vacio" style={{ maxWidth: 560 }}>
        <b>Todavía no hay movimientos</b>
        <span>Aquí van a quedar los cambios: quién dijo qué, cuándo y sobre qué actividad.</span>
      </div>
    )
  }
  return (
    <section className="pt-tarjeta">
      <header>
        <h2>Qué cambió, quién y cuándo</h2>
        <span className="pt-overline">últimos {v.bitacora.length}</span>
      </header>
      <div className="pt-bitacora">
        {v.bitacora.map((b, i) => (
          <div className="ent" key={`${b.pendienteId}-${b.en}-${i}`}>
            <div className="cuando">{fecha(b.en)} {cuando(b.en)}</div>
            <div className="que">
              <b style={{ fontWeight: 600 }}>{b.quien ?? 'Alguien'}</b>{' '}
              {EVENTO[b.evento] ?? b.evento} «{b.pendiente}»
              {b.avance !== null && ` al ${b.avance}%`}
              {b.hasta && ` al ${fecha(b.hasta)}`}
              {b.texto && <span style={{ color: 'var(--ink-2)' }}>: {b.texto}</span>}
            </div>
          </div>
        ))}
      </div>
      <p style={{ marginTop: 14, fontSize: 12.5, color: 'var(--ink-3)' }}>
        Cada renglón quedó registrado cuando alguien lo dijo. Esta bitácora no
        se edita ni se borra: el día que alguien diga «yo nunca tuve eso
        asignado», la respuesta es esto y no la fila de hoy.
      </p>
    </section>
  )
}
