'use client'

/** Cargar una obra desde la plantilla de Excel (motor: decisiones/2026-10-31-obra-es-tipo-de-proyecto). */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { escribir, decirError } from '@/components/editor/comun'

type Problema = { hoja: string; renglon: number; dice: string }

export function ImportarObra({ grupo }: { grupo: string }) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [problemas, setProblemas] = useState<Problema[]>([])

  const cargar = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!archivo || !nombre.trim()) return
    if (archivo.size > 3_200_000) return setAviso('El archivo pesa de más (máximo 3 MB).')
    setOcupado(true); setAviso('Cargando… con miles de partidas puede tardar un minuto.'); setProblemas([])
    const buf = new Uint8Array(await archivo.arrayBuffer())
    let bin = ''
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000))
    const r = await escribir<{ planId: string; partidas: number; actividades: number; materiales: number; avisos: Problema[] }>(
      'obra-importar', { groupId: grupo, nombre: nombre.trim(), archivo: btoa(bin) })
    setOcupado(false)
    if (!r.ok) {
      const ps = (r.cuerpo['problemas'] ?? []) as Problema[]
      setProblemas(ps)
      const DICE: Record<string, string> = {
        ERRORES: 'No cargué nada: hay renglones que no se entienden.', SIN_PARTIDAS: 'La hoja Partidas viene vacía.',
        ILEGIBLE: 'No pude leer el archivo. ¿Es la plantilla en .xlsx?', MUY_GRANDE: 'Pasa del tope (20,000 partidas o 4 MB).', SIN_PERMISO: 'Cargar una obra lo hace quien dirige el proyecto.',
      }
      return setAviso(DICE[r.error] ?? decirError(r))
    }
    setAviso(`Listo: ${r.dato.partidas.toLocaleString('es-MX')} partidas en ${r.dato.actividades.toLocaleString('es-MX')} actividades, ${r.dato.materiales} materiales.`)
    setProblemas(r.dato.avisos ?? [])
    router.push(`/app/g/${grupo}/${r.dato.planId}/obra`)
  }

  return (
    <form className="ob-importar" onSubmit={ev => void cargar(ev)}>
      <p>1. Baja la <a href="/app/obra/plantilla">plantilla de Excel</a> y llénala (trae instrucciones y renglones de ejemplo).</p>
      <label>2. Nombre de la obra <input value={nombre} onChange={ev => setNombre(ev.target.value)} placeholder="Torre Norte" required maxLength={120} /></label>
      <label>3. El archivo <input type="file" accept=".xlsx" onChange={ev => setArchivo(ev.target.files?.[0] ?? null)} required /></label>
      <button type="submit" className="ed-btn primario" disabled={ocupado || !archivo || !nombre.trim()}>{ocupado ? 'Cargando…' : 'Cargar obra'}</button>
      {aviso && <p className="ob-aviso" role="status">{aviso}</p>}
      {problemas.length > 0 && (
        <ul className="ob-problemas">{problemas.map((p, i) => <li key={i}>{p.hoja}, renglón {p.renglon}: {p.dice}</li>)}</ul>
      )}
    </form>
  )
}
