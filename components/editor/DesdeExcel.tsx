'use client'
/**
 * «Desde Excel»: el cuarto camino para empezar un proyecto (Zaelyn #188).
 *
 * El archivo se manda al motor, que lo lee con el mismo reconocimiento de
 * columnas que la importación del chat y lo guarda como BORRADOR. La página
 * abre ese borrador con la revisión a la vista: lo que el archivo traía mal
 * se corrige aquí, antes de liberar.
 */
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import type { LecturaExcel, PreguntaUnidad, Revision } from '@/lib/editor/tipos'
import { decirError, escribir } from './comun'

const TOPE_BYTES = 3 * 1024 * 1024

/** Lo que se leyó, para enseñarlo al abrir el borrador. Por pestaña y opcional. */
export const claveLectura = (id: string) => `zl-excel-${id}`

function aBase64(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000))
  return btoa(s)
}

type Respuesta = { tipo: 'duracion' | 'esfuerzo' | 'ninguna'; unidad: 'horas' | 'dias' | 'semanas' | 'meses' }
type Envio = { archivo: string; nombreArchivo: string }

const UNIDAD_DICE = { horas: 'Horas', dias: 'Días', semanas: 'Semanas', meses: 'Meses' } as const

export function DesdeExcel({ groupId, nombre }: { groupId: string | null; nombre: string }) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')
  // Si el archivo trae números sin unidad (#189), se pregunta antes de convertir.
  const [pregunta, setPregunta] = useState<{ envio: Envio; hoja: string; columnas: PreguntaUnidad[] } | null>(null)
  const [respuestas, setRespuestas] = useState<Record<number, Respuesta>>({})
  const [jornada, setJornada] = useState(8)

  async function mandar(envio: Envio, extra: { respuestas?: Record<number, Respuesta>; jornada?: number } = {}) {
    setSubiendo(true)
    const r = await escribir<{ id?: string; lectura?: LecturaExcel; revision?: Revision; pregunta?: { hoja: string; columnas: PreguntaUnidad[] } }>('excel', {
      groupId, nombre: nombre.trim(), ...envio, ...extra,
    })
    setSubiendo(false)
    if (!r.ok) { setError(decirError(r)); return }
    if (r.dato.pregunta) {
      setRespuestas(Object.fromEntries(r.dato.pregunta.columnas.map(c => [c.col, { tipo: c.tipo, unidad: c.tipo === 'esfuerzo' ? 'horas' : 'dias' }])))
      setPregunta({ envio, ...r.dato.pregunta })
      return
    }
    const id = r.dato.id!
    try { sessionStorage.setItem(claveLectura(id), JSON.stringify(r.dato.lectura)) } catch { /* sin almacenamiento: se abre igual */ }
    router.push(groupId ? `/app/g/${groupId}/editor/${id}?revisar=1` : `/app/editor/${id}?revisar=1`)
  }

  async function subir(f: File) {
    setError('')
    if (f.size > TOPE_BYTES) { setError('El archivo pesa más de 3 MB. Quita hojas que no sean el plan y vuelve a intentarlo.'); return }
    await mandar({ nombreArchivo: f.name, archivo: aBase64(await f.arrayBuffer()) })
  }

  return (
    <div className="ed-camino excel">
      <span className="ed-orbe gris">
        <svg viewBox="0 0 24 24"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 12l4 5 M13 12l-4 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <b>Desde Excel</b>
      <span>Sube el plan que ya tienes (.xlsx o .csv). Lo acomodas aquí y, antes de liberar, te digo qué fechas, dependencias y totales no cuadran.</span>
      <input ref={input} type="file" accept=".xlsx,.xlsm,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" hidden
        onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void subir(f) }} />
      <button className="ed-btn primario" disabled={subiendo} onClick={() => input.current?.click()}>
        {subiendo ? 'Leyendo el archivo…' : 'Subir archivo'}
      </button>
      {error && <em className="ed-camino-error">{error}</em>}

      {pregunta && createPortal(
        <div className="ed-velo" onClick={() => setPregunta(null)}>
          <div className="ed-dialogo ed-unidades" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
            <h3>¿En qué vienen los tiempos?</h3>
            <p>
              En la hoja «{pregunta.hoja}» hay {pregunta.columnas.length === 1 ? 'una columna' : 'columnas'} con números sin unidad.
              Antes de convertir nada, dime qué son: «5» pueden ser horas o días, y adivinar mal haría un plan cinco veces más corto.
            </p>
            {pregunta.columnas.map(c => {
              const r = respuestas[c.col]!
              const poner = (x: Partial<Respuesta>) => setRespuestas(v => ({ ...v, [c.col]: { ...r, ...x } }))
              return (
                <div key={c.col} className="ed-unidad-col">
                  <div className="fila">
                    <b>«{c.titulo}»</b>
                    <span className="mono">{c.ejemplos.join(' · ')}</span>
                  </div>
                  <div className="ed-unidad-opciones">
                    <label><span>Qué mide</span>
                      <select value={r.tipo} onChange={e => poner({ tipo: e.target.value as Respuesta['tipo'] })}>
                        <option value="duracion">Duración: cuánto dura en el calendario</option>
                        <option value="esfuerzo">Esfuerzo: tiempo de trabajo</option>
                        <option value="ninguna">No es tiempo: ignorarla</option>
                      </select>
                    </label>
                    {r.tipo !== 'ninguna' && (
                      <label><span>Unidad</span>
                        <select value={r.unidad} onChange={e => poner({ unidad: e.target.value as Respuesta['unidad'] })}>
                          {(Object.keys(UNIDAD_DICE) as Array<keyof typeof UNIDAD_DICE>).map(u => <option key={u} value={u}>{UNIDAD_DICE[u]}</option>)}
                        </select>
                      </label>
                    )}
                  </div>
                </div>
              )
            })}
            <label className="ed-unidad-jornada"><span>Una jornada de trabajo son</span>
              <input type="number" min={1} max={24} step={0.5} value={jornada} onChange={e => setJornada(Number(e.target.value) || 8)} /> horas
            </label>
            <p className="gris">Una semana son 5 días hábiles y un mes, 20 (7 y 30 si el plan trabaja fines de semana). Después puedes ver el esfuerzo en horas o en días desde el editor.</p>
            <div className="ed-dlg-acciones">
              <button className="ed-btn suave" onClick={() => setPregunta(null)}>Cancelar</button>
              <button className="ed-btn primario" disabled={subiendo}
                onClick={() => { const p = pregunta; setPregunta(null); void mandar(p.envio, { respuestas, jornada }) }}>
                {subiendo ? 'Convirtiendo…' : 'Convertir el plan'}
              </button>
            </div>
          </div>
        </div>,
        // Al cuerpo de la página: dentro de la tarjeta, su transform al pasar
        // el mouse volvía al diálogo hijo de la tarjeta y no recibía los clics.
        document.querySelector('.pt') ?? document.body,
      )}
    </div>
  )
}
