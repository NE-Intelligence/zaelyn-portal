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

  return (
    <div className="ed-reabrir">
      <button className="ed-btn zaelyn" onClick={abrir} disabled={estado === 'abriendo'}>
        {estado === 'abriendo' ? 'Trayendo el plan…' : 'Edición mayor en el editor'}
      </button>
      <small>Reorganiza fases, fechas y dependencias con Zaelyn. Nada cambia aquí hasta que liberes.</small>
      {error && <div className="ed-error">{error}</div>}
    </div>
  )
}
