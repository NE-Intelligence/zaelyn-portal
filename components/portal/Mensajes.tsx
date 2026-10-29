'use client'

/**
 * Mensajes entre personas, dentro de Zaelyn (Zaelyn DECISIONS #230).
 *
 * Lista de conversaciones a la izquierda (las de cada grupo y las directas)
 * y la conversación a la derecha; en el teléfono, una a la vez.
 *
 * Zaelyn NO lee nada de aquí, salvo el mensaje que se le muestra: escribir
 * «@zaelyn» en el mensaje, o «Mostrar a Zaelyn» sobre uno ya enviado. Lo
 * que Zaelyn conteste —una propuesta con botones, casi siempre— llega al
 * chat de Zaelyn, que se abre solo. Todos ven la marca ✦ de que ese mensaje
 * se le mostró.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ConversacionEnPortal } from '@/lib/api'

type Mensaje = {
  n: number
  autor: string | null
  mio: boolean
  tipo: 'texto' | 'foto' | 'archivo' | 'audio'
  texto: string
  adjunto: { id: string; nombre: string; mime: string; bytes: number } | null
  aZaelyn: boolean
  borrado: boolean
  en: string
}

const ERR: Record<string, string> = {
  NO_PUEDES: 'No puedes escribirle a esa persona: solo a quien comparte un grupo contigo.',
  TOPE_ARCHIVOS: 'Llegaste al tope de archivos del mes de tu plan.',
  TIPO: 'Ese tipo de archivo no se puede mandar.',
  TAMANO: 'El archivo pesa demasiado (máximo 4 MB desde el portal).',
  DEMASIADOS: 'Vas muy rápido. Espera unos segundos.',
}
const explicar = (e: unknown) => ERR[String(e)] ?? 'No se pudo. Intenta en un momento.'

const hora = (iso: string) => new Date(iso).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
const abrirChatDeZaelyn = () => window.dispatchEvent(new Event('zaelyn:abrir-chat'))

export function Mensajes({ inicial, yo }: { inicial: ConversacionEnPortal[]; yo: string | null }) {
  const [convs, setConvs] = useState(inicial)
  const [actual, setActual] = useState<string | null>(null)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [nueva, setNueva] = useState('')
  const [menu, setMenu] = useState<number | null>(null)
  const [grabando, setGrabando] = useState(false)
  const ultimo = useRef(0)
  const vivo = useRef<string | null>(null)
  const lista = useRef<HTMLDivElement>(null)
  const archivo = useRef<HTMLInputElement>(null)
  const grab = useRef<MediaRecorder | null>(null)

  const recargarLista = useCallback(async () => {
    const r = await fetch('/api/mensajes', { cache: 'no-store' })
    if (r.ok) setConvs(((await r.json()) as { conversaciones: ConversacionEnPortal[] }).conversaciones)
  }, [])

  // La lista se refresca sola cada 20 s (no leídos, últimos mensajes).
  useEffect(() => {
    const i = setInterval(() => { void recargarLista() }, 20_000)
    return () => clearInterval(i)
  }, [recargarLista])

  // Abrir una conversación y quedarse escuchando (espera larga).
  useEffect(() => {
    if (!actual) return
    vivo.current = actual
    ultimo.current = 0
    setMensajes([])
    let cancelado = false
    void (async () => {
      while (!cancelado && vivo.current === actual) {
        try {
          const r = await fetch(`/api/mensajes/${actual}?desde=${ultimo.current}&espera=${ultimo.current ? 20 : 0}`, { cache: 'no-store' })
          if (!r.ok) { await new Promise(x => setTimeout(x, 4000)); continue }
          const j = (await r.json()) as { mensajes: Mensaje[] }
          if (j.mensajes.length && !cancelado) {
            ultimo.current = j.mensajes[j.mensajes.length - 1]!.n
            setMensajes(ms => [...ms.filter(m => !j.mensajes.some(x => x.n === m.n)), ...j.mensajes])
            void recargarLista()
          }
        } catch { await new Promise(x => setTimeout(x, 4000)) }
      }
    })()
    return () => { cancelado = true; vivo.current = null }
  }, [actual, recargarLista])

  useEffect(() => { lista.current?.scrollTo({ top: lista.current.scrollHeight }) }, [mensajes])

  const pedir = async (url: string, cuerpo: unknown) => {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) })
    return { ok: r.ok, json: (await r.json().catch(() => ({}))) as Record<string, unknown> }
  }

  const mandar = async () => {
    const t = texto.trim()
    if (!t || !actual) return
    setTexto(''); setAviso(null)
    const r = await pedir(`/api/mensajes/${actual}`, { texto: t })
    if (!r.ok) return setAviso(explicar(r.json['error']))
    if (r.json['aZaelyn']) abrirChatDeZaelyn()
  }

  const subir = async (f: Blob, nombre: string, pie = '') => {
    if (!actual) return
    setAviso(null)
    const r = await fetch(`/api/mensajes/${actual}`, {
      method: 'POST', body: f,
      headers: { 'content-type': f.type || 'application/octet-stream', 'x-zaelyn-nombre': encodeURIComponent(nombre), 'x-zaelyn-texto': encodeURIComponent(pie) },
    })
    if (!r.ok) setAviso(explicar(((await r.json().catch(() => ({}))) as { error?: string }).error))
  }

  const grabar = async () => {
    if (grabando) { grab.current?.stop(); setGrabando(false); return }
    try {
      const flujo = await navigator.mediaDevices.getUserMedia({ audio: true })
      const tipo = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t)) ?? ''
      const rec = tipo ? new MediaRecorder(flujo, { mimeType: tipo }) : new MediaRecorder(flujo)
      const trozos: Blob[] = []
      rec.ondataavailable = e => { if (e.data.size) trozos.push(e.data) }
      rec.onstop = () => {
        flujo.getTracks().forEach(x => x.stop())
        const t = (rec.mimeType || 'audio/webm').split(';')[0]!
        void subir(new Blob(trozos, { type: t }), t.includes('mp4') ? 'audio.m4a' : 'audio.webm')
      }
      grab.current = rec; rec.start(); setGrabando(true)
    } catch { setAviso('Este navegador no deja usar el micrófono.') }
  }

  const accion = async (a: 'mostrar' | 'borrar' | 'denunciar', n: number) => {
    setMenu(null)
    if (a === 'denunciar') {
      const motivo = prompt('¿Qué tiene de malo este mensaje? Lo revisa una persona de Zaelyn.')
      if (!motivo) return
      await pedir('/api/mensajes/accion/denunciar', { n, motivo })
      return setAviso('Gracias. Lo revisamos.')
    }
    if (a === 'borrar' && !confirm('¿Borrar este mensaje? Queda la marca de que se borró.')) return
    await pedir(`/api/mensajes/accion/${a}`, { n })
    if (a === 'mostrar') abrirChatDeZaelyn()
    setMensajes(ms => ms.map(m => m.n !== n ? m : a === 'mostrar' ? { ...m, aZaelyn: true } : { ...m, borrado: true, texto: '', adjunto: null }))
  }

  const abrirDirecta = async () => {
    const h = nueva.trim().replace(/^@/, '')
    if (!h) return
    const r = await pedir('/api/mensajes/directa', { handle: h })
    if (!r.ok) return setAviso(explicar(r.json['error']))
    setNueva(''); await recargarLista(); setActual(String(r.json['id']))
  }

  const conv = convs.find(c => c.id === actual) ?? null

  return (
    <div className={`ms${actual ? ' ms-abierta' : ''}`}>
      <aside className="ms-lista">
        <form className="ms-nueva" onSubmit={e => { e.preventDefault(); void abrirDirecta() }}>
          <input value={nueva} onChange={e => setNueva(e.target.value)} placeholder="Escribirle a @alguien" aria-label="Escribirle a una persona por su @" />
          <button type="submit" className="pt-boton pt-boton-chico" disabled={!nueva.trim()}>Abrir</button>
        </form>
        {convs.length === 0 && <p className="nota">Cuando estés en un grupo, aquí aparece su conversación.</p>}
        <ul>
          {convs.map(c => (
            <li key={c.id}>
              <button type="button" className={`ms-item${c.id === actual ? ' activo' : ''}`} onClick={() => setActual(c.id)}>
                <span className="ms-titulo">{c.tipo === 'grupo' ? '👥 ' : ''}{c.titulo}</span>
                {c.sinLeer > 0 && <span className="ms-badge" aria-label={`${c.sinLeer} sin leer`}>{c.sinLeer}</span>}
                <span className="ms-prev">{c.ultimo ? `${c.ultimo.autor && c.ultimo.autor !== yo ? `@${c.ultimo.autor}: ` : ''}${c.ultimo.texto}` : 'Sin mensajes todavía'}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="ms-conv" aria-label={conv?.titulo ?? 'Conversación'}>
        {!conv ? (
          <div className="ms-vacia"><p>Escoge una conversación.</p><p className="nota">Para pedirle algo a Zaelyn desde aquí, escribe <b>@zaelyn</b> en tu mensaje.</p></div>
        ) : (
          <>
            <header className="ms-cab">
              <button type="button" className="ms-atras" onClick={() => setActual(null)} aria-label="Volver a la lista">←</button>
              <b>{conv.titulo}</b>
              {conv.tipo === 'directa' && conv.con && (
                <button type="button" className="ac-volver" onClick={() => {
                  if (confirm(`¿Bloquear a @${conv.con}? Ya no podrá escribirte directo.`)) {
                    void pedir('/api/mensajes/accion/bloquear', { handle: conv.con }).then(() => setAviso(`Bloqueaste a @${conv.con}.`))
                  }
                }}>Bloquear</button>
              )}
            </header>
            <div className="ms-mensajes" ref={lista} aria-live="polite">
              {mensajes.map(m => (
                <div key={m.n} className={`ms-msg${m.mio ? ' mio' : ''}`}>
                  {!m.mio && <span className="ms-autor">@{m.autor ?? 'alguien'}</span>}
                  {m.borrado ? <i className="nota">Mensaje borrado</i> : (
                    <>
                      {m.adjunto && (m.tipo === 'foto'
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img className="ms-foto" src={`/api/mensajes/adjunto/${m.adjunto.id}`} alt={m.adjunto.nombre} loading="lazy" />
                        : m.tipo === 'audio'
                          ? <audio controls src={`/api/mensajes/adjunto/${m.adjunto.id}`} />
                          : <a className="ch-archivo" href={`/api/mensajes/adjunto/${m.adjunto.id}`} target="_blank" rel="noopener">📎 {m.adjunto.nombre}</a>)}
                      {m.texto && <p>{m.texto}</p>}
                    </>
                  )}
                  <span className="ms-pie">
                    {m.aZaelyn && <span title="Este mensaje se le mostró a Zaelyn" className="ms-z">✦ Zaelyn</span>}
                    {hora(m.en)}
                    {!m.borrado && (
                      <button type="button" className="ms-mas" aria-label="Opciones del mensaje" onClick={() => setMenu(menu === m.n ? null : m.n)}>⋯</button>
                    )}
                  </span>
                  {menu === m.n && (
                    <div className="ms-menu" role="menu">
                      {m.mio && !m.aZaelyn && m.texto && <button type="button" role="menuitem" onClick={() => void accion('mostrar', m.n)}>Mostrar a Zaelyn</button>}
                      {m.mio && <button type="button" role="menuitem" onClick={() => void accion('borrar', m.n)}>Borrar</button>}
                      {!m.mio && <button type="button" role="menuitem" onClick={() => void accion('denunciar', m.n)}>Denunciar</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {aviso && <p className="ac-error" role="status">{aviso}</p>}
            <form className="ch-redactar" onSubmit={e => { e.preventDefault(); void mandar() }}>
              <button type="button" className="ch-micro" title="Mencionar a Zaelyn" aria-label="Mencionar a Zaelyn"
                onClick={() => setTexto(t => (t.includes('@zaelyn') ? t : `@zaelyn ${t}`))}>✦</button>
              <textarea className="ch-entrada" rows={1} value={texto} maxLength={4000} placeholder="Escribe un mensaje…" aria-label="Escribe un mensaje"
                onChange={e => setTexto(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void mandar() } }} />
              <input ref={archivo} type="file" hidden accept="image/*,audio/*,application/pdf,.docx,.xlsx,.pptx,.csv,.txt,.zip"
                onChange={e => { const f = e.target.files?.[0]; if (f) void subir(f, f.name); e.target.value = '' }} />
              <button type="button" className="ch-micro" aria-label="Adjuntar archivo o foto" onClick={() => archivo.current?.click()}>📎</button>
              <button type="button" className={`ch-micro${grabando ? ' activo' : ''}`} aria-label={grabando ? 'Terminar audio' : 'Grabar audio'} onClick={() => void grabar()}>{grabando ? '■' : '🎤'}</button>
              <button type="submit" className="ch-enviar" disabled={!texto.trim()} aria-label="Enviar">➤</button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
