'use client'
/**
 * Zaelyn arma el plan. La voz del agente es coral, igual que en el resto del
 * portal.
 *
 * Lo que vuelve es una PROPUESTA: se pinta en el lienzo marcada como nueva y
 * se puede deshacer con un clic. Nada se guarda solo.
 */
import { useState } from 'react'
import type { Brief, Doc, Ficha, Metodologia, Propuesta } from '@/lib/editor/tipos'
import { METODOLOGIA_CORTA } from '@/lib/editor/tipos'
import { Chispa, decirError, escribir } from './comun'

const ESPERA = [
  'Leyendo el objetivo y el alcance…',
  'Eligiendo la metodología que mejor le queda…',
  'Partiendo el trabajo en fases y entregables…',
  'Definiendo para qué sirve cada actividad…',
  'Tendiendo dependencias y buscando qué puede ir en paralelo…',
  'Revisando que quepa en la fecha comprometida…',
]

export function Asistente({
  groupId, nombre, doc, metodologia, fichas, ia, puede, ultima, onPropuesta,
}: {
  groupId: string | null
  nombre: string
  doc: Doc
  metodologia: string
  fichas: Ficha[]
  ia: boolean
  puede: boolean
  ultima: Propuesta | null
  onPropuesta: (p: Propuesta, nombre: string) => void
}) {
  const [b, setB] = useState<Brief>({
    nombre,
    objetivo: doc.objetivo ?? '',
    alcance: doc.alcance ?? '',
    inicio: doc.inicio,
    golive: doc.golive ?? null,
    metodologia: doc.nodos.length && metodologia !== 'libre' ? (metodologia as Metodologia) : 'recomendar',
    detalle: 'normal',
    restricciones: '',
  })
  const [estado, setEstado] = useState<'listo' | 'pensando' | 'error'>('listo')
  const [error, setError] = useState('')
  const [frase, setFrase] = useState(0)
  const [abierta, setAbierta] = useState<string | null>(null)

  async function armar() {
    setEstado('pensando'); setError(''); setFrase(0)
    const reloj = setInterval(() => setFrase(f => (f + 1) % ESPERA.length), 4200)
    const r = await escribir<Propuesta>('proponer', { groupId, brief: { ...b, nombre: b.nombre || nombre } })
    clearInterval(reloj)
    if (!r.ok) { setEstado('error'); setError(decirError(r)); return }
    setEstado('listo')
    onPropuesta(r.dato, b.nombre.trim())
  }

  const set = <K extends keyof Brief>(k: K, v: Brief[K]) => setB(x => ({ ...x, [k]: v }))
  const dias = b.inicio && b.golive ? Math.round((Date.parse(b.golive) - Date.parse(b.inicio)) / 86_400_000) : null

  return (
    <div className="ed-asistente">
      <div className="ed-as-cab">
        <span className={`ed-orbe${estado === 'pensando' ? ' pensando' : ''}`}><Chispa /></span>
        <div>
          <b>Armar con Zaelyn</b>
          <span>Cuéntale el proyecto; te propone estructura, metodología, dependencias y para qué sirve cada cosa.</span>
        </div>
      </div>

      {!ia && <div className="ed-aviso">La ayuda de Zaelyn para armar no está conectada en este servidor. Puedes armar a mano o desde una plantilla.</div>}
      {!puede && <div className="ed-aviso">Tu rol en este grupo es de consulta: puedes ver el borrador, no cambiarlo.</div>}

      {estado === 'pensando' ? (
        <div className="ed-pensando">
          <div className="ed-ondas"><span /><span /><span /></div>
          <p>{ESPERA[frase]}</p>
          <small>Un plan completo tarda entre 30 segundos y un minuto y medio.</small>
        </div>
      ) : (
        <form className="ed-brief" onSubmit={e => { e.preventDefault(); if (ia && puede) armar() }}>
          <label><span>Proyecto</span><input value={b.nombre} onChange={e => set('nombre', e.target.value)} placeholder={nombre} /></label>
          <label><span>Objetivo <em>qué tiene que lograr</em></span>
            <textarea rows={3} required minLength={10} value={b.objetivo} onChange={e => set('objetivo', e.target.value)}
              placeholder="Ej.: Implementar S/4HANA Finanzas y Logística en la planta de Monterrey, con cierre contable en el sistema nuevo desde enero." />
          </label>
          <label><span>Alcance <em>qué entra y qué no</em></span>
            <textarea rows={3} value={b.alcance ?? ''} onChange={e => set('alcance', e.target.value)}
              placeholder="Módulos, sedes, integraciones, migración de datos, lo que queda fuera…" />
          </label>
          <div className="ed-dos">
            <label><span>Arranque</span><input type="date" value={b.inicio ?? ''} onChange={e => set('inicio', e.target.value || null)} /></label>
            <label><span>Fecha comprometida</span><input type="date" value={b.golive ?? ''} onChange={e => set('golive', e.target.value || null)} /></label>
          </div>
          {dias !== null && <small className="ed-nota">{dias > 0 ? `${dias} días naturales entre arranque y compromiso.` : 'La fecha comprometida es antes del arranque.'}</small>}
          <div className="ed-dos">
            <label><span>Metodología</span>
              <select value={b.metodologia} onChange={e => set('metodologia', e.target.value as Brief['metodologia'])}>
                <option value="recomendar">Que Zaelyn recomiende</option>
                {fichas.map(f => <option key={f.clave} value={f.clave}>{f.nombre}</option>)}
              </select>
            </label>
            <label><span>Detalle</span>
              <select value={b.detalle} onChange={e => set('detalle', e.target.value as Brief['detalle'])}>
                <option value="compacto">Compacto (15–30)</option>
                <option value="normal">Normal (30–60)</option>
                <option value="detallado">Detallado (60–110)</option>
              </select>
            </label>
          </div>
          <label><span>Contexto y restricciones</span>
            <textarea rows={2} value={b.restricciones ?? ''} onChange={e => set('restricciones', e.target.value)}
              placeholder="Equipo disponible, temporadas de cierre, dependencias externas, presupuesto…" />
          </label>
          {doc.nodos.length > 0 && <small className="ed-nota">La propuesta reemplaza lo que hay en el lienzo. Se puede deshacer.</small>}
          {estado === 'error' && <div className="ed-error">{error}</div>}
          <button type="submit" className="ed-btn zaelyn" disabled={!ia || !puede || b.objetivo.trim().length < 10}>
            <Chispa />{ultima ? 'Armar otra propuesta' : 'Armar el plan'}
          </button>
        </form>
      )}

      {ultima && estado !== 'pensando' && (
        <div className="ed-recomienda">
          <span className="ed-overline">Lo que Zaelyn propuso</span>
          <b>{METODOLOGIA_CORTA[ultima.metodologia] ?? ultima.metodologia}</b>
          {ultima.porque && <p>{ultima.porque}</p>}
          {ultima.alternativa && <p className="alt"><em>Alternativa:</em> {ultima.alternativa}</p>}
          {ultima.riesgos.length > 0 && (
            <>
              <span className="ed-overline">Riesgos que vio</span>
              <ul>{ultima.riesgos.map((r, i) => <li key={i}>{r}</li>)}</ul>
            </>
          )}
          {ultima.descartados > 0 && <p className="alt">Propuso {ultima.descartados} responsable{ultima.descartados === 1 ? '' : 's'} que no están en el grupo; los dejé sin asignar.</p>}
          <small className="mono">{ultima.doc.nodos.length} objetos · costo de IA US$ {ultima.costoUsd.toFixed(3)}</small>
        </div>
      )}

      <div className="ed-metodos">
        <span className="ed-overline">Las metodologías</span>
        {fichas.map(f => (
          <div key={f.clave} className={`ed-metodo${abierta === f.clave ? ' abierta' : ''}`}>
            <button onClick={() => setAbierta(a => (a === f.clave ? null : f.clave))}>
              <b>{f.nombre}</b><span>{f.resumen}</span>
            </button>
            {abierta === f.clave && (
              <div className="cuerpo">
                <p><em>Conviene cuando:</em> {f.cuando}</p>
                <p><em>Cómo se arma:</em> {f.forma}</p>
                {puede && <button className="ed-btn suave" onClick={() => set('metodologia', f.clave)}>Usar ésta en la propuesta</button>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
