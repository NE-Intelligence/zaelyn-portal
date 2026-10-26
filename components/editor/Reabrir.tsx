'use client'
/**
 * «Editar en el editor»: el plan en seguimiento vuelve al editor para una
 * edición mayor (#178). Trae lo que el chat movió —avance, fechas, lo nuevo,
 * lo cancelado— sobre la estructura con la que se liberó. El plan no cambia
 * hasta que se liberen los cambios.
 */
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Reapertura } from '@/lib/editor/tipos'
import { decirError, escribir } from './comun'

export function Reabrir({ grupo, plan }: { grupo: string; plan: string }) {
  const router = useRouter()
  const [estado, setEstado] = useState<'listo' | 'abriendo'>('listo')
  const [error, setError] = useState('')

  async function abrir() {
    setEstado('abriendo'); setError('')
    const r = await escribir<Reapertura>('reabrir', { groupId: grupo, planId: plan })
    if (!r.ok) {
      setEstado('listo')
      setError(r.error === 'VACIO' ? 'Este plan no tiene actividades vivas que reorganizar.' : decirError(r))
      return
    }
    const q = new URLSearchParams({ reabierto: '1', a: String(r.dato.actualizados), n: String(r.dato.agregados), q: String(r.dato.quitados) })
    router.push(`/app/g/${grupo}/editor/${r.dato.id}?${q.toString()}`)
  }

  // Un botón más de la fila de acciones, no una franja (#201): el dueño del
  // producto lo pidió así —«que se llame solamente Edición»—. Lo que hace lo
  // dice el título al pasar el cursor.
  return (
    <>
      <button className="ed-btn suave chico" onClick={abrir} disabled={estado === 'abriendo'}
        title="Abre el plan en el editor para reorganizar fases, fechas y dependencias. Nada cambia aquí hasta que liberes.">
        {estado === 'abriendo' ? 'Abriendo…' : 'Edición'}
      </button>
      {error && <span className="ed-error" style={{ fontSize: 12 }}>{error}</span>}
    </>
  )
}
