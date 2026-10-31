'use client'

/**
 * Lo que Zaelyn propone ajustar en el plan y espera respuesta
 * (motor: decisiones/2026-10-31-replaneacion-sugerida). Solo lo ve quien
 * dirige; aprobar aquí es lo mismo que el botón del chat: el motor aplica y
 * le avisa a cada responsable.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SugerenciaEnPortal } from '@/lib/api'
import { escribir, decirError } from '@/components/editor/comun'

function frase(s: SugerenciaEnPortal): string {
  const n = s.cuantas === 1 ? '1 actividad' : `${s.cuantas} actividades`
  if (s.tipo === 'responsable') return `Asignar ${n} «${s.actividad}» a ${s.aQuien ?? 'quien las ha terminado'}: las anteriores iguales terminaron con esa persona.`
  return s.tipo === 'mas_tiempo'
    ? `Darle ${s.dias ?? 'más'} días a ${n} «${s.actividad}» sin empezar: las anteriores iguales tomaron más de lo planeado.`
    : `Bajar a ${s.dias ?? 'menos'} días ${n} «${s.actividad}» sin empezar: las anteriores iguales terminaron antes.`
}

export function Sugerencias({ grupo, inicial }: { grupo: string; inicial: SugerenciaEnPortal[] }) {
  const [lista, setLista] = useState(inicial)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const router = useRouter()
  if (!lista.length) return null

  const decidir = async (s: SugerenciaEnPortal, a: 's' | 'n') => {
    setOcupado(s.id); setAviso(null)
    const r = await escribir<{ kind: string; aplicados?: number }>('sugerencia', { groupId: grupo, id: s.id, a })
    setOcupado(null)
    if (!r.ok && r.error !== 'YA_DECIDIDA') return setAviso(r.error === 'SIN_PERMISO' ? 'Esto lo decide quien dirige el proyecto.' : decirError(r))
    setLista(xs => xs.filter(x => x.id !== s.id))
    if (r.ok && a === 's') {
      setAviso(r.dato.aplicados ? `Listo: ajusté ${r.dato.aplicados} y le avisé a cada responsable.` : 'Ya no había nada que ajustar.')
      router.refresh()
    }
  }

  return (
    <section className="sg" aria-label="Sugerencias de Zaelyn">
      <header className="sg-cab"><span className="sg-chispa" aria-hidden="true">✦</span> Zaelyn sugiere</header>
      <ul className="sg-lista">
        {lista.map(s => (
          <li key={s.id} className="sg-item">
            <p>{frase(s)}</p>
            <div className="sg-acc">
              <button type="button" className="ed-btn primario chico" disabled={ocupado === s.id} onClick={() => void decidir(s, 's')}>
                {s.tipo === 'responsable' ? 'Sí, asígnalas' : 'Sí, ajústalas'}
              </button>
              <button type="button" className="ed-btn suave chico" disabled={ocupado === s.id} onClick={() => void decidir(s, 'n')}>Dejar así</button>
            </div>
          </li>
        ))}
      </ul>
      {aviso && <p className="nota sg-aviso" role="status">{aviso}</p>}
    </section>
  )
}
