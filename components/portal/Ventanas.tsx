'use client'

/**
 * Las conversaciones con personas, abajo y en ventanitas, como Messenger
 * (decisiones/2026-10-30-panel-y-ventanas). Solo en computadora y tablet:
 * en el teléfono la bandeja es como WhatsApp (`/app/mensajes`).
 *
 * - «Mensajes» a la derecha abre la lista y dice cuántos no leídos hay.
 * - Cada conversación abre una ventanita; caben 3 abiertas (1 en pantallas
 *   angostas) y las demás quedan minimizadas como pestañas con su nombre.
 * - Si alguien te escribe en una conversación que no tienes abierta, su
 *   pestaña aparece sola con el número de no leídos.
 *
 * Lo abierto vive en esta pestaña del navegador (sessionStorage), así que
 * sobrevive al cambiar de página dentro del portal.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConversacionEnPortal } from '@/lib/api'
import { Conversacion, iniciales } from '@/components/portal/Conversacion'
import { ListaConversaciones } from '@/components/portal/Mensajes'

type Abierta = { id: string; min: boolean }
const CLAVE = 'zaelyn-ventanas-v1'

const leer = (): Abierta[] => {
  try {
    const v = JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]') as unknown
    return Array.isArray(v) ? (v as Abierta[]).filter(x => typeof x?.id === 'string').slice(0, 8) : []
  } catch { return [] }
}

const caben = () => (typeof window !== 'undefined' && window.innerWidth < 1200 ? 1 : 3)

export function Ventanas({ yo }: { yo: string | null }) {
  const [convs, setConvs] = useState<ConversacionEnPortal[]>([])
  const [abiertas, setAbiertas] = useState<Abierta[]>([])
  const [lista, setLista] = useState(false)
  const listo = useRef(false)
  const vistos = useRef<Map<string, number>>(new Map())
  const cargada = useRef(false)

  const recargar = useCallback(async () => {
    try {
      const r = await fetch('/api/mensajes', { cache: 'no-store' })
      if (!r.ok) return
      const nuevas = ((await r.json()) as { conversaciones: ConversacionEnPortal[] }).conversaciones
      setConvs(nuevas)
      // Alguien escribió en una conversación que no está abierta: aparece su pestaña.
      // (La primera carga solo toma nota: no abre pestañas de lo que ya había.)
      const primera = !cargada.current
      cargada.current = true
      const llegaron: string[] = []
      for (const c of nuevas) {
        const antes = vistos.current.get(c.id) ?? 0
        vistos.current.set(c.id, c.sinLeer)
        if (!primera && c.sinLeer > antes) llegaron.push(c.id)
      }
      if (llegaron.length) {
        setAbiertas(as => [...as, ...llegaron.filter(id => !as.some(a => a.id === id)).map(id => ({ id, min: true }))])
      }
    } catch { /* sin red: se reintenta en el siguiente ciclo */ }
  }, [])

  useEffect(() => {
    setAbiertas(leer())
    listo.current = true
    void recargar()
    const i = setInterval(() => { void recargar() }, 20_000)
    return () => clearInterval(i)
  }, [recargar])

  useEffect(() => {
    if (!listo.current) return
    try { sessionStorage.setItem(CLAVE, JSON.stringify(abiertas)) } catch { /* sin almacenamiento */ }
  }, [abiertas])

  // Solo `n` ventanas abiertas a la vez: la más vieja se minimiza.
  const ajustar = (as: Abierta[]): Abierta[] => {
    const n = caben()
    const exp = as.filter(a => !a.min)
    if (exp.length <= n) return as
    const sobran = new Set(exp.slice(0, exp.length - n).map(a => a.id))
    return as.map(a => (sobran.has(a.id) ? { ...a, min: true } : a))
  }

  const abrir = (id: string) => {
    setLista(false)
    setAbiertas(as => ajustar([...as.filter(a => a.id !== id), { id, min: false }]))
  }
  const minimizar = (id: string) => setAbiertas(as => as.map(a => (a.id === id ? { ...a, min: true } : a)))
  const cerrar = (id: string) => setAbiertas(as => as.filter(a => a.id !== id))

  const total = convs.reduce((s, c) => s + c.sinLeer, 0)
  const de = (id: string) => convs.find(c => c.id === id)
  const visibles = abiertas.filter(a => de(a.id))
  const expandidas = visibles.filter(a => !a.min)
  const minimizadas = visibles.filter(a => a.min)

  return (
    <div className="vt" aria-label="Conversaciones">
      {expandidas.map(a => {
        const c = de(a.id)!
        return (
          <section key={a.id} className="vt-ventana" aria-label={c.titulo}>
            <header className="vt-cab">
              <span className="ms-avatar" data-tipo={c.tipo} aria-hidden="true">{iniciales(c.titulo)}</span>
              <button type="button" className="vt-titulo" onClick={() => minimizar(a.id)} title="Minimizar">{c.titulo}</button>
              <a className="vt-acc" href={`/app/mensajes?c=${a.id}`} title="Abrir en grande" aria-label="Abrir en grande">⤢</a>
              <button type="button" className="vt-acc" onClick={() => minimizar(a.id)} aria-label="Minimizar">–</button>
              <button type="button" className="vt-acc" onClick={() => cerrar(a.id)} aria-label="Cerrar">×</button>
            </header>
            <Conversacion conv={c} compacta cabecera={false} alActividad={() => void recargar()} />
          </section>
        )
      })}

      <div className="vt-barra">
        {minimizadas.map(a => {
          const c = de(a.id)!
          return (
            <span key={a.id} className={`vt-pestana${c.sinLeer ? ' nuevo' : ''}`}>
              <button type="button" className="vt-pestana-abrir" onClick={() => abrir(a.id)}>
                <span className="ms-avatar" data-tipo={c.tipo} aria-hidden="true">{iniciales(c.titulo)}</span>
                <span className="vt-pestana-txt">{c.titulo}</span>
                {c.sinLeer > 0 && <span className="ms-badge">{c.sinLeer}</span>}
              </button>
              <button type="button" className="vt-pestana-x" onClick={() => cerrar(a.id)} aria-label={`Cerrar ${c.titulo}`}>×</button>
            </span>
          )
        })}

        <div className="vt-lanzador-caja">
          {lista && (
            <div className="vt-lista" role="dialog" aria-label="Tus conversaciones">
              <header className="vt-lista-cab">
                <b>Mensajes</b>
                <a href="/app/mensajes">Ver todos</a>
              </header>
              <ListaConversaciones convs={convs} yo={yo} conZaelyn={false} alAbrir={c => abrir(c.id)} />
              {convs.length === 0 && <p className="nota ms-nota">Cuando estés en un grupo, aquí aparece su conversación.</p>}
            </div>
          )}
          <button type="button" className="vt-lanzador" aria-expanded={lista} onClick={() => setLista(v => !v)}>
            <span aria-hidden="true">💬</span> Mensajes
            {total > 0 && <span className="ms-badge">{total}</span>}
          </button>
        </div>
      </div>
    </div>
  )
}
