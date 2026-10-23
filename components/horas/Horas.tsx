'use client'
/**
 * Mis horas (Zaelyn #191): la semana o el mes, registrar, borrar y bajar el
 * Excel. Las reglas —el tope de 24 h, qué es sobrecarga— viven en el motor;
 * aquí se piden y se enseña lo que contesta.
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { escribir } from '@/components/editor/comun'
import {
  ESTADO_ENVIO, TIPO_DICE, diaCorto, enHoras, horasTexto, mesLargo, moverAncla,
  type Periodo, type TipoHora, type VistaHoras,
} from '@/lib/horas'

const NIVEL_DICE = { leve: 'más de 10 h', alta: 'más de 12 h', extrema: 'más de 14 h' } as const

/** «1.5», «1,5», «1:30», «90m» → minutos. */
function leerMinutos(x: string): number | null {
  const t = x.trim().toLowerCase().replace(',', '.')
  let m = /^(\d{1,2}):(\d{2})$/.exec(t)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  m = /^(\d+(?:\.\d+)?)\s*(m|min)$/.exec(t)
  if (m) return Math.round(Number(m[1]))
  m = /^(\d+(?:\.\d+)?)\s*h?$/.exec(t)
  if (m) return Math.round(Number(m[1]) * 60)
  return null
}

export function Horas({ v, periodo, ancla }: { v: VistaHoras; periodo: Periodo; ancla: string }) {
  const router = useRouter()
  const [fecha, setFecha] = useState(v.hoy >= v.desde && v.hoy <= v.hasta ? v.hoy : v.hasta < v.hoy ? v.hasta : v.hoy)
  const [cantidad, setCantidad] = useState('')
  const [tipo, setTipo] = useState<TipoHora>('trabajo')
  const [destino, setDestino] = useState<string>(v.opciones[0]?.groupId ?? (v.personal ? 'personal' : ''))
  const [actividad, setActividad] = useState('')
  const [etiqueta, setEtiqueta] = useState('')
  const [nota, setNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState('')
  const [porBorrar, setPorBorrar] = useState<string | null>(null)

  const grupo = v.opciones.find(o => o.groupId === destino)
  const maxDia = Math.max(8 * 60, ...v.porDia.map(d => d.trabajo + d.disponibilidad))
  const proyectosConHoras = useMemo(() => {
    const m = new Map<string, string>()
    for (const r of v.registros) if (r.groupId && r.grupo) m.set(r.groupId, r.grupo)
    return [...m.entries()]
  }, [v.registros])
  const porDia = useMemo(() => {
    const m = new Map<string, VistaHoras['registros']>()
    for (const r of [...v.registros].reverse()) m.set(r.fecha, [...(m.get(r.fecha) ?? []), r])
    return [...m.entries()].sort(([a], [b]) => b.localeCompare(a))
  }, [v.registros])

  const q = (a: string, p: Periodo = periodo) => `/app/horas?p=${p}&d=${a}`
  const titulo = periodo === 'semana' ? `Semana del ${diaCorto(v.desde)}` : `Mes de ${mesLargo(v.desde)}`

  async function guardar() {
    setError(''); setAviso('')
    const minutos = leerMinutos(cantidad)
    if (!minutos || minutos < 1 || minutos > 1440) { setError('Escribe las horas como 2, 1.5 o 1:30.'); return }
    if (!destino) { setError('Elige a qué van esas horas.'); return }
    if (destino === 'personal' && !etiqueta.trim()) { setError('Dime en qué fueron: «lectura», «curso de inglés»…'); return }
    setGuardando(true)
    const r = await escribir<{ carga: VistaHoras['carga']; totalDia: number }>('horas', {
      fecha, minutos, tipo,
      ...(destino === 'personal' ? { etiqueta } : { groupId: destino, pendienteId: actividad || null, etiqueta: actividad ? null : etiqueta || null }),
      nota: nota || null,
    })
    setGuardando(false)
    if (!r.ok) {
      const llevas = Number(r.cuerpo['llevas'] ?? 0)
      setError(r.error === 'TOPE_DIA'
        ? `Ese día ya llevas ${horasTexto(llevas)} de trabajo; con esto pasarías de 24 h. Si fue tiempo localizable para otro proyecto, márcalo como disponibilidad o guardia.`
        : r.error === 'PERIODO_CERRADO' ? `Ese día está en un envío a aprobación (${String(r.cuerpo['folio'] ?? '')}). Retíralo si necesitas corregir.`
        : r.error === 'FECHA' ? 'Las horas se registran de hoy hacia atrás.'
          : r.error === 'SIN_PLAN' ? 'Las horas personales son del plan con portal Personal. Las de tus proyectos sí puedes registrarlas.'
            : r.error === 'SIN_PERMISO' ? 'En ese proyecto tu rol no registra horas.'
              : 'No se pudo guardar. Vuelve a intentarlo.')
      return
    }
    setCantidad(''); setNota(''); setEtiqueta('')
    setAviso(tipo === 'trabajo' ? `Guardado. Trabajo del ${diaCorto(fecha)}: ${horasTexto(r.dato.totalDia)}.` : 'Guardado como disponibilidad: no cuenta para el tope ni para la sobrecarga.')
    router.refresh()
  }

  async function borrar(id: string) {
    const r = await escribir('horas-borrar', { id })
    setPorBorrar(null)
    if (!r.ok) { setError(r.error === 'PERIODO_CERRADO' ? `Ese registro está en un envío a aprobación (${String(r.cuerpo['folio'] ?? '')}): retíralo primero.` : 'No se pudo borrar.'); return }
    router.refresh()
  }

  // ── aprobación (#192)
  const [enviando, setEnviando] = useState<string | null>(null)
  const [msgEnvio, setMsgEnvio] = useState('')
  const hastaEnvio = v.hasta > v.hoy ? v.hoy : v.hasta
  const porMandar = proyectosConHoras.filter(([id]) => v.registros.some(r => r.groupId === id && r.fecha <= hastaEnvio && !v.cerrados[r.id]))
  async function mandar(groupId: string, nombre: string) {
    setEnviando(groupId); setMsgEnvio('')
    const r = await escribir<{ envio: { folio: string }; aprobadores: string[] }>('horas-enviar', { groupId, desde: v.desde, hasta: hastaEnvio })
    setEnviando(null)
    if (!r.ok) {
      const e = r.cuerpo['error']
      setMsgEnvio(e === 'ENCIMADO' ? `Parte de este periodo de ${nombre} ya está mandado${r.cuerpo['folio'] ? ` (${String(r.cuerpo['folio'])})` : ''}. Retíralo o elige otro periodo.`
        : e === 'SIN_APROBADOR' ? `En ${nombre} no hay quién apruebe además de ti: hace falta alguien que dirija el proyecto o un Stakeholder.`
          : e === 'VACIO' ? `No tienes horas de ${nombre} en este periodo.` : 'No se pudo mandar.')
      return
    }
    setMsgEnvio(`Mandado: folio ${r.dato.envio.folio}. Le avisé a ${r.dato.aprobadores.join(', ')}. Mientras tanto esas horas quedan cerradas.`)
    router.refresh()
  }
  async function retirarEnvio(id: string) {
    const r = await escribir('horas-retirar', { id })
    if (!r.ok) { setMsgEnvio('No se pudo retirar: quizá ya lo resolvieron.'); return }
    router.refresh()
  }

  return (
    <>
      <div className="pt-cabeza">
        <div className="fila">
          <div>
            <h1>Mis horas</h1>
            <div className="meta">
              <span>{titulo}</span>
              <span>Trabajo {horasTexto(v.totales.trabajo)}</span>
              {v.totales.disponibilidad > 0 && <span>Disponibilidad {horasTexto(v.totales.disponibilidad)}</span>}
              {v.cronometro && <span className="hr-crono">⏱ Cronómetro corriendo: {horasTexto(v.cronometro.minutos)}</span>}
            </div>
          </div>
          <div className="hr-nav">
            <Link className="ed-btn suave" href={q(moverAncla(periodo, ancla, -1))} aria-label="Anterior">←</Link>
            <Link className="ed-btn suave" href={q(v.hoy)}>Hoy</Link>
            <Link className="ed-btn suave" href={q(moverAncla(periodo, ancla, 1))} aria-label="Siguiente">→</Link>
            <span className="hr-seg">
              <Link href={q(ancla, 'semana')} aria-current={periodo === 'semana' ? 'page' : undefined}>Semana</Link>
              <Link href={q(ancla, 'mes')} aria-current={periodo === 'mes' ? 'page' : undefined}>Mes</Link>
            </span>
          </div>
        </div>
      </div>

      {v.carga.nivel && (
        <div className={`hr-carga n-${v.carga.nivel}`} role="status">
          <b>Llevas {v.carga.dias} días seguidos con {NIVEL_DICE[v.carga.nivel]} de trabajo</b>
          <span>({v.carga.promedio} h en promedio). Eso no se sostiene mucho tiempo. Si parte fue estar localizable,
            regístralo como disponibilidad o guardia: no cuenta para esto. Solo tú ves este aviso.</span>
        </div>
      )}

      <div className="hr-rejilla">
        <section className="pt-tarjeta">
          <header><h2>Día por día</h2><span className="pt-overline">tope 24 h · aviso desde 10 h</span></header>
          <ul className="hr-dias">
            {v.porDia.map(d => {
              const futuro = d.fecha > v.hoy
              return (
                <li key={d.fecha} className={futuro ? 'futuro' : d.fecha === v.hoy ? 'hoy' : undefined}>
                  <button className="hr-dia" disabled={futuro} onClick={() => setFecha(d.fecha)} title="Registrar en este día">{diaCorto(d.fecha)}</button>
                  <div className="hr-barra" aria-label={`${horasTexto(d.trabajo)} de trabajo`}>
                    <i className="t" style={{ width: `${(d.trabajo / maxDia) * 100}%` }} />
                    <i className="d" style={{ width: `${(d.disponibilidad / maxDia) * 100}%` }} />
                    {[8, 10, 12].map(h => h * 60 <= maxDia && <s key={h} style={{ left: `${(h * 60 / maxDia) * 100}%` }} />)}
                  </div>
                  <span className="hr-num mono">{d.trabajo ? enHoras(d.trabajo) : futuro ? '' : '—'}{d.disponibilidad ? <em> +{enHoras(d.disponibilidad)}</em> : null}</span>
                </li>
              )
            })}
          </ul>
          <p className="hr-ley"><i className="t" /> Trabajo <i className="d" /> Disponibilidad o guardia (no suma al tope)</p>
        </section>

        <section className="pt-tarjeta hr-alta">
          <header><h2>Registrar</h2></header>
          <div className="hr-campos">
            <label><span>Día</span><input type="date" value={fecha} max={v.hoy} onChange={e => setFecha(e.target.value)} /></label>
            <label><span>Horas</span><input inputMode="decimal" placeholder="2 · 1.5 · 1:30" value={cantidad} onChange={e => setCantidad(e.target.value)} /></label>
            <label className="ancho"><span>A qué</span>
              <select value={destino} onChange={e => { setDestino(e.target.value); setActividad('') }}>
                {v.opciones.map(o => <option key={o.groupId} value={o.groupId}>{o.grupo}</option>)}
                {v.personal && <option value="personal">Personal (no es de un proyecto)</option>}
              </select>
            </label>
            {grupo && (
              <label className="ancho"><span>Actividad</span>
                <select value={actividad} onChange={e => setActividad(e.target.value)}>
                  <option value="">Sin actividad (al proyecto en general)</option>
                  {grupo.actividades.filter(a => !a.cerrada).map(a => <option key={a.id} value={a.id}>{a.texto}</option>)}
                  {grupo.actividades.some(a => a.cerrada) && (
                    <optgroup label="Cerradas">
                      {grupo.actividades.filter(a => a.cerrada).map(a => <option key={a.id} value={a.id}>{a.texto}</option>)}
                    </optgroup>
                  )}
                </select>
              </label>
            )}
            {(destino === 'personal' || (grupo && !actividad)) && (
              <label className="ancho"><span>{destino === 'personal' ? 'En qué' : 'Concepto (opcional)'}</span>
                <input maxLength={160} placeholder={destino === 'personal' ? 'lectura, curso, gimnasio…' : 'junta de arranque, soporte…'} value={etiqueta} onChange={e => setEtiqueta(e.target.value)} />
              </label>
            )}
            <fieldset className="ancho hr-tipo">
              <label><input type="radio" checked={tipo === 'trabajo'} onChange={() => setTipo('trabajo')} /> Trabajo</label>
              <label><input type="radio" checked={tipo === 'disponibilidad'} onChange={() => setTipo('disponibilidad')} /> Disponibilidad o guardia</label>
            </fieldset>
            {tipo === 'disponibilidad' && <p className="ancho gris">Tiempo localizable que el proyecto cubre aunque estés en otra cosa. Sale en su reporte como disponibilidad, sin decir en qué más estabas, y no cuenta para el tope de 24 h.</p>}
            <label className="ancho"><span>Nota (opcional)</span><input maxLength={500} value={nota} onChange={e => setNota(e.target.value)} /></label>
          </div>
          {error && <div className="ed-error">{error}</div>}
          {aviso && <div className="hr-ok">{aviso}</div>}
          <button className="ed-btn primario ancho" disabled={guardando} onClick={guardar}>{guardando ? 'Guardando…' : 'Registrar horas'}</button>
          <p className="gris hr-chat">También desde el chat: «trabajé 3 horas en la migración», «ayer 2 h de guardia en Andes», «inicia el cronómetro de la cotización».</p>
        </section>
      </div>

      <section className="pt-tarjeta hr-lista">
        <header>
          <h2>Registros</h2>
          <div className="hr-excel">
            <a className="ed-btn suave chico" href={`/app/horas/excel?desde=${v.desde}&hasta=${v.hasta}`}>Excel: todo lo mío</a>
            {proyectosConHoras.map(([id, nombre]) => (
              <a key={id} className="ed-btn suave chico" href={`/app/horas/excel?desde=${v.desde}&hasta=${v.hasta}&groupId=${id}`} title="Solo tus horas en este proyecto, para mandárselas sin mezclar">Excel: solo {nombre}</a>
            ))}
          </div>
        </header>
        {!porDia.length && <div className="pt-vacio"><b>Sin registros en este periodo</b><span>Registra arriba o dile a Zaelyn cuánto trabajaste.</span></div>}
        {porDia.map(([f, regs]) => (
          <div key={f} className="hr-grupo">
            <h3>{diaCorto(f)} <span className="mono">{horasTexto(regs.filter(r => r.tipo === 'trabajo').reduce((s, r) => s + r.minutos, 0))}</span></h3>
            <ul>
              {regs.map(r => (
                <li key={r.id}>
                  <span className="mono hr-cant">{horasTexto(r.minutos)}</span>
                  <span className="hr-que">
                    <b>{r.grupo ?? 'Personal'}</b>{(r.actividad || r.etiqueta) && <> · {r.actividad ?? r.etiqueta}</>}
                    {r.nota && <small>{r.nota}</small>}
                  </span>
                  {r.tipo === 'disponibilidad' && <span className="ed-chip">{TIPO_DICE.disponibilidad}</span>}
                  {r.origen !== 'portal' && <span className="gris hr-origen">{r.origen === 'chat' ? 'chat' : 'cronómetro'}</span>}
                  {v.cerrados[r.id] ? (
                    <span className="gris hr-origen" title="Está en un envío a aprobación">🔒 {v.cerrados[r.id]}</span>
                  ) : porBorrar === r.id ? (
                    <span className="hr-borrar">
                      <button className="ed-btn suave chico" onClick={() => setPorBorrar(null)}>No</button>
                      <button className="ed-btn peligro chico" onClick={() => borrar(r.id)}>Borrar</button>
                    </span>
                  ) : (
                    <button className="ed-btn texto chico" onClick={() => setPorBorrar(r.id)} aria-label="Borrar registro">Borrar</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="pt-tarjeta hr-lista">
        <header><h2>Aprobación</h2><span className="pt-overline">un envío por proyecto · nunca se mezclan</span></header>
        {porMandar.length > 0 && (
          <div className="hr-mandar">
            <p className="gris">Manda tus horas de {diaCorto(v.desde)} a {diaCorto(hastaEnvio)} a quien dirige el proyecto. Quedan cerradas hasta que las aprueben o las rechacen.</p>
            <div className="hr-excel">
              {porMandar.map(([id, nombre]) => (
                <button key={id} className="ed-btn primario chico" disabled={enviando !== null} onClick={() => mandar(id, nombre)}>
                  {enviando === id ? 'Mandando…' : `Mandar ${nombre} a aprobación`}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgEnvio && <div className="hr-ok">{msgEnvio}</div>}
        {!v.envios.length ? (
          <p className="gris">Sin envíos en este periodo. También desde el chat: «manda mis horas de esta semana a aprobación».</p>
        ) : (
          <table className="hr-tabla">
            <thead><tr><th>Folio</th><th>Proyecto</th><th>Periodo</th><th>Horas</th><th>Estado</th><th /></tr></thead>
            <tbody>
              {v.envios.map(e => (
                <tr key={e.id}>
                  <td className="mono">{e.folio}</td>
                  <td>{e.grupo}</td>
                  <td>{diaCorto(e.desde)} – {diaCorto(e.hasta)}</td>
                  <td className="mono">{enHoras(e.trabajo)}{e.disponibilidad ? <em className="hr-disp"> +{enHoras(e.disponibilidad)}</em> : null}</td>
                  <td>
                    <span className={`hr-estado e-${e.estado}`}>{ESTADO_ENVIO[e.estado]}</span>
                    {e.resueltoPor && <small className="gris"> · {e.resueltoPor}</small>}
                    {e.motivo && <small className="hr-motivo">«{e.motivo}»</small>}
                  </td>
                  <td className="hr-acciones">
                    {e.estado === 'enviado' && <button className="ed-btn texto chico" onClick={() => retirarEnvio(e.id)}>Retirar</button>}
                    {(e.estado === 'aprobado' || e.estado === 'enviado') && <>
                      <a className="ed-btn suave chico" href={`/app/horas/envio/${e.id}?formato=pdf`}>PDF</a>
                      <a className="ed-btn suave chico" href={`/app/horas/envio/${e.id}?formato=xlsx`}>Excel</a>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
