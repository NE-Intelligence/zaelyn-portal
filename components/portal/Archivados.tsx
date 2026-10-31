'use client'

/**
 * Los grupos archivados que todavía se recuperan (motor:
 * decisiones/2026-10-31-administrar-grupos). Solo los ve quien los creó.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GrupoArchivado } from '@/lib/api'
import { escribir, decirError } from '@/components/editor/comun'

export function Archivados({ lista, dias }: { lista: GrupoArchivado[]; dias: number }) {
  const router = useRouter()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [error, setError] = useState('')
  if (!lista.length) return null
  const recuperar = async (id: string) => {
    setOcupado(id); setError('')
    const r = await escribir('grupo-recuperar', { groupId: id })
    setOcupado(null)
    if (!r.ok) return setError(decirError(r))
    router.refresh()
  }
  return (
    <section className="pt-seccion-area">
      <h2 className="pt-overline">Archivados</h2>
      <p style={{ margin: 0, color: 'var(--ink-2)' }}>Se recuperan con todo lo que tenían durante {dias} días.</p>
      <ul className="ag-lista" style={{ maxWidth: 560 }}>
        {lista.map(g => (
          <li key={g.id}>
            <span>{g.nombre} <small style={{ color: 'var(--ink-3)' }}>· hasta el {new Date(g.hasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</small></span>
            <button className="ed-btn suave" disabled={ocupado === g.id} onClick={() => void recuperar(g.id)}>{ocupado === g.id ? 'Recuperando…' : 'Recuperar'}</button>
          </li>
        ))}
      </ul>
      {error && <div className="ed-error">{error}</div>}
    </section>
  )
}
