'use client'

/**
 * El modo del PMO del proyecto, a la vista y a un clic
 * (motor: decisiones/2026-10-31-modos-pmo-escalamiento-roles).
 *
 * Todos los del proyecto ven en qué modo está Zaelyn; quien dirige lo cambia
 * aquí mismo. El portal no decide nada: manda el cambio al motor, que revisa
 * el permiso, lo guarda y lo deja en la auditoría.
 */
import { useEffect, useRef, useState } from 'react'
import type { ModoPmo as Modo, PmoEnPortal } from '@/lib/api'
import { escribir, decirError } from '@/components/editor/comun'

const MODOS: Array<{ k: Modo; t: string; d: string }> = [
  { k: 'discreto', t: 'Discreto', d: 'Te deja trabajar: un resumen al día y escala al tercer día sin respuesta.' },
  { k: 'atento', t: 'Atento', d: 'El día que vence avisa al mediodía y al cierre; si nadie responde, escala a la mañana siguiente y luego al Sponsor.' },
  { k: 'firme', t: 'Firme', d: 'Además pide avance a la mitad de cada actividad y escala esa misma noche.' },
]
const NOMBRE: Record<Modo, string> = { discreto: 'Discreto', atento: 'Atento', firme: 'Firme' }
const hora = (h: number) => `${h > 12 ? h - 12 : h}:00 pm`

export function ModoPmo({ grupo, inicial, personas }: {
  grupo: string
  inicial: PmoEnPortal
  personas: Array<{ id: string; nombre: string }>
}) {
  const [pmo, setPmo] = useState(inicial)
  const [abierto, setAbierto] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const caja = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => { if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierto(false) }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc) }
  }, [abierto])

  const cambiar = async (cuerpo: Record<string, unknown>) => {
    setOcupado(true); setAviso(null)
    const r = await escribir<PmoEnPortal>('pmo', { groupId: grupo, ...cuerpo })
    setOcupado(false)
    if (!r.ok) return setAviso(r.error === 'SIN_PERMISO' ? 'Solo quien dirige el proyecto cambia el modo.' : decirError(r))
    setPmo(r.dato)
  }

  const conModo = new Set(pmo.porPersona.map(p => p.personaId))
  const sinModo = personas.filter(p => !conModo.has(p.id))

  return (
    <div className="mp" ref={caja}>
      <button type="button" className="ed-btn suave chico mp-boton" aria-expanded={abierto} onClick={() => setAbierto(v => !v)}
        title="Qué tanto se mete Zaelyn en el seguimiento de este proyecto">
        <span className="mp-punto" data-modo={pmo.modo} aria-hidden="true" />
        Seguimiento: {NOMBRE[pmo.modo]}
      </button>
      {abierto && (
        <div className="mp-panel" role="dialog" aria-label="Modo del PMO">
          <b className="mp-titulo">¿Qué tanto se mete Zaelyn?</b>
          <div className="mp-modos" role="radiogroup" aria-label="Modo del proyecto">
            {MODOS.map(m => (
              <button key={m.k} type="button" role="radio" aria-checked={pmo.modo === m.k}
                className={`mp-modo${pmo.modo === m.k ? ' on' : ''}`} disabled={!pmo.puedeCambiar || ocupado}
                onClick={() => pmo.modo !== m.k && void cambiar({ modo: m.k })}>
                <span className="mp-modo-t"><span className="mp-punto" data-modo={m.k} aria-hidden="true" />{m.t}</span>
                <span className="mp-modo-d">{m.d}</span>
              </button>
            ))}
          </div>
          <label className="mp-fila">
            <span>La jornada termina a las</span>
            <select value={pmo.finJornada} disabled={!pmo.puedeCambiar || ocupado}
              onChange={e => void cambiar({ finJornada: Number(e.target.value) })}>
              {Array.from({ length: 9 }, (_, i) => 13 + i).map(h => <option key={h} value={h}>{hora(h)}</option>)}
            </select>
          </label>
          <div className="mp-personas">
            <span className="mp-sub">Con modo propio</span>
            {pmo.porPersona.length === 0 && <span className="nota">Nadie: todos van con el modo del proyecto.</span>}
            {pmo.porPersona.map(p => (
              <label key={p.personaId} className="mp-fila">
                <span>{p.nombre}</span>
                <select value={p.modo} disabled={!pmo.puedeCambiar || ocupado}
                  onChange={e => void cambiar({ personaId: p.personaId, modo: e.target.value })}>
                  <option value="proyecto">Como el proyecto</option>
                  {MODOS.map(m => <option key={m.k} value={m.k}>{m.t}</option>)}
                </select>
              </label>
            ))}
            {pmo.puedeCambiar && sinModo.length > 0 && (
              <label className="mp-fila">
                <span>Dar modo propio a…</span>
                <select value="" disabled={ocupado} onChange={e => e.target.value && void cambiar({ personaId: e.target.value, modo: 'firme' })}>
                  <option value="">Elegir persona</option>
                  {sinModo.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </label>
            )}
          </div>
          <p className="nota mp-nota">
            Si alguien se atrasa y no responde, su actividad sube de modo sola hasta que se ponga al día.
            {!pmo.puedeCambiar && ' Lo cambia quien dirige el proyecto.'}
          </p>
          {aviso && <p className="ms-aviso" role="status">{aviso}</p>}
        </div>
      )}
    </div>
  )
}
