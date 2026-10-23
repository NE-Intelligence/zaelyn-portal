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
import { useRouter } from 'next/navigation'
import type { LecturaExcel, Revision } from '@/lib/editor/tipos'
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

export function DesdeExcel({ groupId, nombre }: { groupId: string | null; nombre: string }) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  async function subir(f: File) {
    setError('')
    if (f.size > TOPE_BYTES) { setError('El archivo pesa más de 3 MB. Quita hojas que no sean el plan y vuelve a intentarlo.'); return }
    setSubiendo(true)
    const r = await escribir<{ id: string; groupId: string | null; lectura: LecturaExcel; revision: Revision }>('excel', {
      groupId, nombre: nombre.trim(), nombreArchivo: f.name, archivo: aBase64(await f.arrayBuffer()),
    })
    setSubiendo(false)
    if (!r.ok) { setError(decirError(r)); return }
    try { sessionStorage.setItem(claveLectura(r.dato.id), JSON.stringify(r.dato.lectura)) } catch { /* sin almacenamiento: se abre igual */ }
    router.push(groupId ? `/app/g/${groupId}/editor/${r.dato.id}?revisar=1` : `/app/editor/${r.dato.id}?revisar=1`)
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
    </div>
  )
}
