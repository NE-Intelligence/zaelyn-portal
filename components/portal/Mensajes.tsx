'use client'

/**
 * La bandeja de mensajes (Zaelyn DECISIONS #230; decisiones/2026-10-30-panel-y-ventanas).
 *
 * Lista de conversaciones a la izquierda y la abierta a la derecha; en el
 * teléfono, como WhatsApp: la lista a pantalla completa y cada conversación
 * encima. Zaelyn va fija hasta arriba como un chat más: tocarla abre su panel.
 */
import { useCallback, useEffect, useState } from 'react'
import type { ConversacionEnPortal } from '@/lib/api'
import { Conversacion, explicarError, iniciales, pedirJson, abrirChatDeZaelyn } from '@/components/portal/Conversacion'

export const cuando = (iso: string) => {
  const d = new Date(iso)
  const hoy = new Date()
  return d.toDateString() === hoy.toDateString()
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { day: 'numeric', month: 'short' })
}

/** «Tú: » si lo último lo escribí yo; «@ana: » en un grupo si fue alguien más. */
export function quienDice(c: ConversacionEnPortal, yo: string | null): string {
  const u = c.ultimo
  if (!u) return ''
  if (u.mio || (yo && u.autor === yo)) return 'Tú: '
  return c.tipo === 'grupo' && u.autor ? `@${u.autor}: ` : ''
}

export function ListaConversaciones({
  convs, actual, yo, alAbrir, conZaelyn = true,
}: {
  convs: ConversacionEnPortal[]
  actual?: string | null
  yo: string | null
  alAbrir: (c: ConversacionEnPortal) => void
  conZaelyn?: boolean
}) {
  return (
    <ul className="ms-ul">
      {conZaelyn && (
        <li>
          <button type="button" className="ms-item ms-item-z" onClick={abrirChatDeZaelyn}>
            <span className="ms-avatar ms-avatar-z" aria-hidden="true">✦</span>
            <span className="ms-titulo">Zaelyn</span>
            <span className="ms-hora">IA</span>
            <span className="ms-prev">Pídele lo que sea: recordatorios, tu día, tus proyectos</span>
          </button>
        </li>
      )}
      {convs.map(c => (
        <li key={c.id}>
          <button type="button" className={`ms-item${c.id === actual ? ' activo' : ''}${c.sinLeer ? ' nuevo' : ''}`} onClick={() => alAbrir(c)}>
            <span className="ms-avatar" data-tipo={c.tipo} aria-hidden="true">{iniciales(c.titulo)}</span>
            <span className="ms-titulo">{c.titulo}</span>
            <span className="ms-hora">{c.ultimo ? cuando(c.ultimo.en) : ''}</span>
            <span className="ms-prev">{c.ultimo ? `${quienDice(c, yo)}${c.ultimo.texto}` : 'Sin mensajes todavía'}</span>
            {c.sinLeer > 0 && <span className="ms-badge" aria-label={`${c.sinLeer} sin leer`}>{c.sinLeer}</span>}
          </button>
        </li>
      ))}
    </ul>
  )
}

export function Mensajes({ inicial, yo }: { inicial: ConversacionEnPortal[]; yo: string | null }) {
  const [convs, setConvs] = useState(inicial)
  const [actual, setActual] = useState<string | null>(null)
  const [nueva, setNueva] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)

  const recargarLista = useCallback(async () => {
    const r = await fetch('/api/mensajes', { cache: 'no-store' })
    if (r.ok) setConvs(((await r.json()) as { conversaciones: ConversacionEnPortal[] }).conversaciones)
  }, [])

  // La lista se refresca sola cada 20 s (no leídos, últimos mensajes).
  useEffect(() => {
    const i = setInterval(() => { void recargarLista() }, 20_000)
    return () => clearInterval(i)
  }, [recargarLista])

  // Una ventanita de abajo puede pedir «abrir en grande»: llega por la dirección.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('c')
    if (id) setActual(id)
  }, [])

  const abrirDirecta = async () => {
    const h = nueva.trim().replace(/^@/, '')
    if (!h) return
    setAviso(null)
    const r = await pedirJson('/api/mensajes/directa', { handle: h })
    if (!r.ok) return setAviso(explicarError(r.json['error']))
    setNueva(''); await recargarLista(); setActual(String(r.json['id']))
  }

  const conv = convs.find(c => c.id === actual) ?? null

  return (
    <div className={`ms${actual ? ' ms-abierta' : ''}`}>
      <aside className="ms-lista">
        <div className="ms-lista-cab">
          <b>Mensajes</b>
          <form className="ms-nueva" onSubmit={e => { e.preventDefault(); void abrirDirecta() }}>
            <input value={nueva} onChange={e => setNueva(e.target.value)} placeholder="Escribirle a @alguien" aria-label="Escribirle a una persona por su @" />
            <button type="submit" className="pt-boton pt-boton-chico" disabled={!nueva.trim()}>Abrir</button>
          </form>
          {aviso && <p className="ms-aviso" role="status">{aviso}</p>}
        </div>
        <ListaConversaciones convs={convs} actual={actual} yo={yo} alAbrir={c => setActual(c.id)} />
        {convs.length === 0 && <p className="nota ms-nota">Cuando estés en un grupo, aquí aparece su conversación.</p>}
      </aside>

      <section className="ms-conv" aria-label={conv?.titulo ?? 'Conversación'}>
        {!conv ? (
          <div className="ms-vacia">
            <span className="ms-vacia-ico" aria-hidden="true">💬</span>
            <p><b>Escoge una conversación</b></p>
            <p className="nota">Para pedirle algo a Zaelyn desde aquí, escribe <b>@zaelyn</b> en tu mensaje.</p>
          </div>
        ) : (
          <Conversacion key={conv.id} conv={conv} alVolver={() => setActual(null)} alActividad={() => void recargarLista()} />
        )}
      </section>
    </div>
  )
}
