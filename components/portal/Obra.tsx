'use client'

/**
 * La obra: presupuesto por partida, materiales y estimaciones
 * (motor: decisiones/2026-10-31-obra-es-tipo-de-proyecto).
 *
 * La pantalla no calcula nada: pinta lo que el motor manda y le pide cada
 * captura. Las formas son lo mismo que se puede decir en el chat.
 */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EstadoDeObra } from '@/lib/api'
import { escribir, decirError } from '@/components/editor/comun'

const $ = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
const q = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 2 })
const POR_PAGINA = 100
type Pestana = 'presupuesto' | 'materiales' | 'estimaciones'

export function Obra({ grupo, plan, e }: { grupo: string; plan: string; e: EstadoDeObra }) {
  const router = useRouter()
  const [pestana, setPestana] = useState<Pestana>('presupuesto')
  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(0)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const filtradas = useMemo(() => {
    const b = buscar.trim().toLowerCase()
    return b ? e.partidas.filter(p => p.clave.toLowerCase().includes(b) || p.concepto.toLowerCase().includes(b)) : e.partidas
  }, [buscar, e.partidas])
  const vista = filtradas.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA)
  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))

  const mandar = async (accion: 'obra-avance' | 'obra-movimiento' | 'obra-validar' | 'obra-estimacion', cuerpo: Record<string, unknown>, ok: string) => {
    setOcupado(true); setAviso(null)
    const r = await escribir<Record<string, unknown>>(accion, { groupId: grupo, planId: plan, ...cuerpo })
    setOcupado(false)
    if (!r.ok) {
      const DICE: Record<string, string> = { NO_EXISTE: 'No encuentro esa partida o ese material.', SIN_PERMISO: 'Tu rol no alcanza para esto.', INVALIDO: 'Revisa la cantidad o las fechas.' }
      return setAviso(DICE[r.error] ?? decirError(r))
    }
    setAviso(ok); router.refresh()
  }

  const form = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    ev.currentTarget.reset()
    return (k: string) => String(f.get(k) ?? '').trim()
  }

  const t = e.totales
  return (
    <div className="ob">
      <div className="ob-kpis">
        <div><span>Presupuesto</span><b>{$(t.importe)}</b></div>
        <div><span>Ejecutado</span><b>{$(t.ejecutado)}</b><i>{t.avance}%</i></div>
        <div><span>Validado</span><b>{$(t.validado)}</b></div>
        <div><span>Materiales comprados</span><b>{$(t.costoMateriales)}</b></div>
        <div><span>Por validar</span><b>{t.porValidar}</b>
          {e.puedeValidar && t.porValidar > 0 && <button type="button" className="ed-btn primario chico" disabled={ocupado}
            onClick={() => void mandar('obra-validar', {}, 'Listo: validado. Ya cuenta para la estimación.')}>Validar todo</button>}
        </div>
      </div>

      <nav className="ob-tabs" role="tablist">
        {(['presupuesto', 'materiales', 'estimaciones'] as const).map(k => (
          <button key={k} type="button" role="tab" aria-selected={pestana === k} className={pestana === k ? 'on' : ''} onClick={() => setPestana(k)}>
            {k === 'presupuesto' ? `Presupuesto (${e.partidas.length})` : k === 'materiales' ? `Materiales (${e.materiales.length})` : `Estimaciones (${e.estimaciones.length})`}
          </button>
        ))}
      </nav>
      {aviso && <p className="ob-aviso" role="status">{aviso}</p>}

      {pestana === 'presupuesto' && (
        <section>
          <form className="ob-forma" onSubmit={ev => { const v = form(ev); void mandar('obra-avance', { partida: v('partida'), cantidad: Number(v('cantidad')), fecha: v('fecha') || undefined }, 'Listo: avance registrado. Queda por validar.') }}>
            <b>Registrar avance</b>
            <input name="partida" placeholder="Partida (clave)" required />
            <input name="cantidad" type="number" step="any" placeholder="Cantidad ejecutada" required />
            <input name="fecha" type="date" aria-label="Fecha" />
            <button type="submit" className="ed-btn primario chico" disabled={ocupado}>Guardar</button>
          </form>
          <div className="ob-barra">
            <input value={buscar} onChange={ev => { setBuscar(ev.target.value); setPagina(0) }} placeholder="Buscar por clave o concepto" aria-label="Buscar partida" />
            <span className="nota">{filtradas.length} partidas</span>
          </div>
          <div className="ob-tabla-caja">
            <table className="ob-tabla">
              <thead><tr><th>Clave</th><th>Concepto</th><th>Unidad</th><th className="num">Cantidad</th><th className="num">P. U.</th><th className="num">Importe</th><th className="num">Ejecutado</th><th className="num">Validado</th><th className="num">Avance</th></tr></thead>
              <tbody>
                {vista.map(p => (
                  <tr key={p.id}>
                    <td className="mono">{p.clave}</td><td>{p.concepto}</td><td>{p.unidad}</td>
                    <td className="num">{q(p.cantidad)}</td><td className="num">{$(p.pu)}</td><td className="num">{$(p.importe)}</td>
                    <td className="num">{q(p.ejecutado)}</td><td className="num">{q(p.validado)}</td>
                    <td className="num"><span className="ob-pct" style={{ ['--p' as string]: `${Math.min(100, p.avance)}%` }}>{p.avance}%</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paginas > 1 && (
            <div className="ob-paginas">
              <button type="button" className="ed-btn suave chico" disabled={pagina === 0} onClick={() => setPagina(x => x - 1)}>Anterior</button>
              <span>{pagina + 1} de {paginas}</span>
              <button type="button" className="ed-btn suave chico" disabled={pagina + 1 >= paginas} onClick={() => setPagina(x => x + 1)}>Siguiente</button>
            </div>
          )}
        </section>
      )}

      {pestana === 'materiales' && (
        <section>
          <form className="ob-forma" onSubmit={ev => { const v = form(ev); void mandar('obra-movimiento', {
            tipo: v('tipo'), material: v('material'), cantidad: Number(v('cantidad')),
            ...(v('costo') ? { costo: Number(v('costo')) } : {}), ...(v('partida') ? { partida: v('partida') } : {}), fecha: v('fecha') || undefined,
          }, 'Listo: movimiento registrado.') }}>
            <b>Almacén</b>
            <select name="tipo" defaultValue="entrada" aria-label="Tipo"><option value="entrada">Entrada</option><option value="salida">Salida a partida</option><option value="ajuste">Ajuste</option></select>
            <select name="material" required aria-label="Material" defaultValue="">
              <option value="" disabled>Material</option>
              {e.materiales.map(m => <option key={m.id} value={m.clave}>{m.clave} · {m.nombre}</option>)}
            </select>
            <input name="cantidad" type="number" step="any" placeholder="Cantidad" required />
            <input name="costo" type="number" step="any" placeholder="Costo unitario (entrada)" />
            <input name="partida" placeholder="Partida (salida)" />
            <input name="fecha" type="date" aria-label="Fecha" />
            <button type="submit" className="ed-btn primario chico" disabled={ocupado}>Guardar</button>
          </form>
          <div className="ob-tabla-caja">
            <table className="ob-tabla">
              <thead><tr><th>Clave</th><th>Material</th><th>Unidad</th><th className="num">Entradas</th><th className="num">Salidas</th><th className="num">Existencia</th><th className="num">Teórico</th><th className="num">Desviación</th><th className="num">Comprado</th></tr></thead>
              <tbody>
                {e.materiales.map(m => (
                  <tr key={m.id}>
                    <td className="mono">{m.clave}</td><td>{m.nombre}</td><td>{m.unidad}</td>
                    <td className="num">{q(m.entradas)}</td><td className="num">{q(m.salidas)}</td>
                    <td className={`num${m.existencia < 0 ? ' ob-mal' : ''}`}>{q(m.existencia)}</td>
                    <td className="num">{q(m.teorico)}</td>
                    <td className={`num${m.desviacion !== null && Math.abs(m.desviacion) >= 10 ? ' ob-mal' : ''}`}>{m.desviacion === null ? '—' : `${m.desviacion > 0 ? '+' : ''}${m.desviacion}%`}</td>
                    <td className="num">{$(m.costoEntradas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="nota">Teórico = lo ejecutado por lo que lleva cada unidad de partida (hoja Insumos). La desviación se dice cuando ya hay salidas registradas.</p>
        </section>
      )}

      {pestana === 'estimaciones' && (
        <section>
          {e.puedeDirigir && (
            <form className="ob-forma" onSubmit={ev => { const v = form(ev); void mandar('obra-estimacion', { desde: v('desde'), hasta: v('hasta') }, 'Listo: estimación creada con lo validado del periodo.') }}>
              <b>Nueva estimación</b>
              <label>Del <input name="desde" type="date" required /></label>
              <label>al <input name="hasta" type="date" required /></label>
              <button type="submit" className="ed-btn primario chico" disabled={ocupado}>Crear</button>
            </form>
          )}
          {e.estimaciones.length === 0 ? <p className="nota">Todavía no hay estimaciones. Paga lo validado en el periodo que elijas.</p> : (
            <table className="ob-tabla">
              <thead><tr><th>No.</th><th>Periodo</th><th className="num">Capturas</th><th className="num">Importe (sin IVA)</th><th /></tr></thead>
              <tbody>
                {e.estimaciones.map(x => (
                  <tr key={x.id}>
                    <td>{x.numero}</td><td>{x.desde} al {x.hasta}</td><td className="num">{x.renglones}</td><td className="num">{$(x.importe)}</td>
                    <td><a className="ed-btn suave chico" href={`/app/g/${grupo}/${plan}/obra/estimacion/${x.numero}`}>Excel</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  )
}
