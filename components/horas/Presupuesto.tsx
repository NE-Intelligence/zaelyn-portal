'use client'
/**
 * El presupuesto de un proyecto (Zaelyn #195): tarifas por persona, monto
 * aprobado y valor ganado. Las cuentas las hace el motor; aquí se capturan
 * tarifas y monto, y se enseña lo que contesta.
 */
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { escribir } from '@/components/editor/comun'
import { dinero, dineroCorto, horas, type EstadoPresupuesto } from '@/lib/presupuesto'

const aCentavos = (s: string): number | null => {
  const t = s.trim().replace(/[$\s]/g, '')
  if (!t) return null
  const limpio = /^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(t) ? t.replace(/,/g, '') : t.replace(',', '.')
  const n = Number(limpio)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null
}

function Indice({ v, bueno, malo }: { v: number | null; bueno: string; malo: string }) {
  if (v === null) return <span className="gris">—</span>
  return <span className={v >= 1 ? 'pr-bien' : v >= 0.9 ? 'pr-ojo' : 'pr-mal'}>{v.toFixed(2)} <small>{v >= 1 ? bueno : malo}</small></span>
}

export function Presupuesto({ e, grupo }: { e: EstadoPresupuesto; grupo: string }) {
  const router = useRouter()
  const [tarifas, setTarifas] = useState<Record<string, string>>({})
  const [desde, setDesde] = useState<Record<string, string>>({})
  const [monto, setMonto] = useState(e.aprobado === null ? '' : String(e.aprobado / 100))
  const [msg, setMsg] = useState('')
  const [ocupado, setOcupado] = useState(false)

  async function guardarTarifa(personaId: string) {
    const c = aCentavos(tarifas[personaId] ?? '')
    if (c === null) { setMsg('Escribe la tarifa como 850 o 1,200.50.'); return }
    setOcupado(true)
    const r = await escribir('presupuesto-tarifa', { groupId: e.groupId, personaId, centavos: c, desde: desde[personaId] || null })
    setOcupado(false)
    if (!r.ok) { setMsg('No se pudo guardar la tarifa.'); return }
    setTarifas(t => ({ ...t, [personaId]: '' })); setMsg('Tarifa guardada.')
    router.refresh()
  }
  async function quitarTarifa(personaId: string, d: string) {
    const r = await escribir('presupuesto-tarifa', { groupId: e.groupId, personaId, desde: d, quitar: true })
    if (!r.ok) { setMsg('No se pudo quitar.'); return }
    router.refresh()
  }
  async function guardarMonto() {
    const c = monto.trim() ? aCentavos(monto) : null
    if (monto.trim() && c === null) { setMsg('Escribe el monto como 450000 o 450,000.'); return }
    setOcupado(true)
    const r = await escribir('presupuesto-monto', { groupId: e.groupId, centavos: c })
    setOcupado(false)
    if (!r.ok) { setMsg('No se pudo guardar el monto.'); return }
    setMsg(c === null ? 'Monto aprobado quitado.' : 'Monto aprobado guardado.')
    router.refresh()
  }

  const f = e.faltantes
  return (
    <>
      <div className="pt-cabeza">
        <div className="fila">
          <div>
            <h1>Presupuesto de {e.grupo}</h1>
            <div className="meta"><span>Corte al {e.hoy}</span><span>{e.moneda} sin IVA</span><span>Solo lo ve quien dirige</span></div>
          </div>
          <div className="hr-nav">
            <Link className="ed-btn suave" href={`/app/g/${grupo}/horas`}>Horas del proyecto</Link>
            <a className="ed-btn primario" href={`/app/g/${grupo}/presupuesto/excel`}>Excel</a>
          </div>
        </div>
      </div>

      {msg && <div className="hr-ok">{msg}</div>}
      {(f.actividadesSinTarifa > 0 || f.horasSinTarifaMin > 0) && (
        <div className="hr-carga n-leve" role="status">
          <b>Hay trabajo sin costear</b>
          <span>{f.actividadesSinTarifa} actividad{f.actividadesSinTarifa === 1 ? '' : 'es'} con horas estimadas y {horas(f.horasSinTarifaMin)} h registradas no tienen tarifa{f.personasSinTarifa.length ? ` (${f.personasSinTarifa.join(', ')})` : ''}. Captúrala abajo y se recalcula todo.</span>
        </div>
      )}

      <div className="pr-tiles">
        <div className="pr-tile">
          <span>Presupuesto aprobado</span>
          <div className="pr-monto">
            <input inputMode="decimal" placeholder="sin capturar" value={monto} onChange={ev => setMonto(ev.target.value)} />
            <button className="ed-btn suave chico" disabled={ocupado} onClick={guardarMonto}>Guardar</button>
          </div>
        </div>
        <div className="pr-tile"><span>Costo estimado del plan</span><b>{dineroCorto(e.bac)}</b><small>horas estimadas × tarifa</small></div>
        <div className="pr-tile"><span>Debía llevar a hoy (PV)</span><b>{dineroCorto(e.pv)}</b><small>según las fechas del plan</small></div>
        <div className="pr-tile"><span>Valor ganado (EV)</span><b>{dineroCorto(e.ev)}</b><small>costo estimado × avance</small></div>
        <div className="pr-tile"><span>Costo real (AC)</span><b>{dineroCorto(e.ac)}</b><small>horas registradas × tarifa</small></div>
        <div className="pr-tile"><span>Índice de costo (CPI)</span><b><Indice v={e.cpi} bueno="dentro de lo planeado" malo="cuesta más" /></b></div>
        <div className="pr-tile"><span>Índice de calendario (SPI)</span><b><Indice v={e.spi} bueno="al día" malo="atrasado" /></b></div>
        <div className="pr-tile"><span>Proyección al cierre</span><b>{dineroCorto(e.eac)}</b>
          {e.vac !== null && <small className={e.vac >= 0 ? 'pr-bien' : 'pr-mal'}>{e.vac >= 0 ? 'sobran' : 'faltan'} {dineroCorto(Math.abs(e.vac))} contra {e.aprobado !== null ? 'lo aprobado' : 'lo estimado'}</small>}
        </div>
      </div>

      <section className="pt-tarjeta hr-lista">
        <header><h2>Tarifas por hora</h2><span className="pt-overline">{e.moneda} sin IVA · la de cada día cuesta lo trabajado ese día</span></header>
        <table className="hr-tabla">
          <thead><tr><th>Persona</th><th>Vigente hoy</th><th>Historial</th><th>Nueva tarifa</th><th>Desde (opcional)</th><th /></tr></thead>
          <tbody>
            {e.personas.map(p => {
              const hist = e.tarifas.filter(t => t.personaId === p.personaId)
              return (
                <tr key={p.personaId}>
                  <td>{p.persona}</td>
                  <td className="mono">{p.tarifa === null ? <span className="pr-mal">sin tarifa</span> : dinero(p.tarifa)}</td>
                  <td>{hist.map(t => (
                    <span key={t.desde} className="pr-hist">{dinero(t.centavos)}{t.desde !== '2000-01-01' ? ` desde ${t.desde}` : ''}
                      <button className="ed-btn texto chico" onClick={() => quitarTarifa(p.personaId, t.desde)} aria-label="Quitar">×</button></span>
                  ))}</td>
                  <td><input className="pr-input" inputMode="decimal" placeholder="$ por hora" value={tarifas[p.personaId] ?? ''} onChange={ev => setTarifas(t => ({ ...t, [p.personaId]: ev.target.value }))} /></td>
                  <td><input className="pr-input" type="date" value={desde[p.personaId] ?? ''} onChange={ev => setDesde(d => ({ ...d, [p.personaId]: ev.target.value }))} /></td>
                  <td><button className="ed-btn suave chico" disabled={ocupado || !(tarifas[p.personaId] ?? '').trim()} onClick={() => guardarTarifa(p.personaId)}>Guardar</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p className="gris hr-chat">También por chat: «tarifa de @mateo en {e.grupo}: 850 la hora» · «presupuesto aprobado de {e.grupo}: 450,000» · «cómo va el presupuesto de {e.grupo}».</p>
      </section>

      <section className="pt-tarjeta hr-lista">
        <header><h2>Por persona</h2></header>
        <table className="hr-tabla">
          <thead><tr><th>Persona</th><th>Horas estimadas</th><th>Costo estimado</th><th>Horas reales</th><th>Costo real</th><th>Disponibilidad (h)</th></tr></thead>
          <tbody>{e.personas.map(p => (
            <tr key={p.personaId}><td>{p.persona}</td><td className="mono">{horas(p.estimadoMin)}</td><td className="mono">{dineroCorto(p.costoEstimado)}</td>
              <td className="mono">{horas(p.realMin)}</td><td className="mono">{dineroCorto(p.costoReal)}</td><td className="mono">{horas(p.disponibilidadMin)}</td></tr>
          ))}</tbody>
        </table>
        {e.disponibilidadMin > 0 && <p className="gris hr-chat">La disponibilidad o guardia no se costea aquí: se cobra aparte según el contrato.</p>}
      </section>

      <section className="pt-tarjeta hr-lista">
        <header><h2>Por actividad</h2><span className="pt-overline">{e.actividades.length} actividades</span></header>
        <table className="hr-tabla">
          <thead><tr><th>Actividad</th><th>Responsable</th><th>H. est.</th><th>Costo est.</th><th>Avance</th><th>Valor ganado</th><th>H. reales</th><th>Costo real</th></tr></thead>
          <tbody>{e.actividades.map(a => (
            <tr key={a.id}>
              <td>{a.actividad}{a.sinTarifa && <small className="pr-mal"> · sin tarifa</small>}</td>
              <td>{a.persona ?? <span className="gris">sin responsable</span>}</td>
              <td className="mono">{horas(a.estimadoMin)}</td><td className="mono">{dineroCorto(a.costoEstimado)}</td>
              <td className="mono">{a.avance}%</td><td className="mono">{dineroCorto(a.valorGanado)}</td>
              <td className="mono">{horas(a.realMin)}</td>
              <td className={`mono ${a.costoEstimado !== null && a.valorGanado !== null && a.costoReal > a.valorGanado ? 'pr-mal' : ''}`}>{dineroCorto(a.costoReal)}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </>
  )
}
