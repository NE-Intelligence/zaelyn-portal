'use client'

/**
 * Una conversación entre personas (Zaelyn DECISIONS #230), sola: la usan la
 * página de Mensajes y las ventanitas de abajo (decisiones/2026-10-30-panel-y-ventanas).
 *
 * Zaelyn NO lee nada de aquí, salvo el mensaje que se le muestra: «@zaelyn»
 * en el mensaje, o «Mostrar a Zaelyn» sobre uno ya enviado. Su respuesta
 * llega al panel de Zaelyn, que se abre solo.
 */
import { useEffect, useRef, useState } from 'react'
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
export const explicarError = (e: unknown) => ERR[String(e)] ?? 'No se pudo. Intenta en un momento.'

const hora = (iso: string) => new Date(iso).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
export const abrirChatDeZaelyn = () => window.dispatchEvent(new Event('zaelyn:abrir-chat'))

export async function pedirJson(url: string, cuerpo: unknown) {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) })
  return { ok: r.ok, json: (await r.json().catch(() => ({}))) as Record<string, unknown> }
}

/** Iniciales para el círculo de la conversación (como en WhatsApp). */
export function iniciales(titulo: string): string {
  const limpio = titulo.replace(/^@/, '').trim()
  const partes = limpio.split(/[\s_.-]+/).filter(Boolean)
  return ((partes[0]?.[0] ?? '?') + (partes[1]?.[0] ?? '')).toUpperCase()
}

export function Conversacion({
  conv, compacta = false, alVolver, alActividad, cabecera = true,
}: {
  conv: ConversacionEnPortal
  /** En una ventanita: sin cabecera propia ni botón de volver. */
  compacta?: boolean
  alVolver?: () => void
  /** Llegó o salió algo: quien la contiene refresca su lista. */
  alActividad?: () => void
  cabecera?: boolean
}) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [menu, setMenu] = useState<number | null>(null)
  const [grabando, setGrabando] = useState(false)
  const ultimo = useRef(0)
  const lista = useRef<HTMLDivElement>(null)
  const archivo = useRef<HTMLInputElement>(null)
  const grab = useRef<MediaRecorder | null>(null)
  const actividad = useRef(alActividad)
  actividad.current = alActividad

  // Abrir la conversación y quedarse escuchando (espera larga).
  useEffect(() => {
    ultimo.current = 0
    setMensajes([])
    let cancelado = false
    void (async () => {
      while (!cancelado) {
        try {
          const r = await fetch(`/api/mensajes/${conv.id}?desde=${ultimo.current}&espera=${ultimo.current ? 20 : 0}`, { cache: 'no-store' })
          if (!r.ok) { await new Promise(x => setTimeout(x, 4000)); continue }
          const j = (await r.json()) as { mensajes: Mensaje[] }
          if (j.mensajes.length && !cancelado) {
            ultimo.current = j.mensajes[j.mensajes.length - 1]!.n
            setMensajes(ms => [...ms.filter(m => !j.mensajes.some(x => x.n === m.n)), ...j.mensajes])
            actividad.current?.()
          }
        } catch { await new Promise(x => setTimeout(x, 4000)) }
      }
    })()
    return () => { cancelado = true }
  }, [conv.id])

  useEffect(() => { lista.current?.scrollTo({ top: lista.current.scrollHeight }) }, [mensajes])

  const mandar = async () => {
    const t = texto.trim()
    if (!t) return
    setTexto(''); setAviso(null)
    const r = await pedirJson(`/api/mensajes/${conv.id}`, { texto: t })
    if (!r.ok) return setAviso(explicarError(r.json['error']))
    if (r.json['aZaelyn']) abrirChatDeZaelyn()
  }

  const subir = async (f: Blob, nombre: string, pie = '') => {
    setAviso(null)
    const r = await fetch(`/api/mensajes/${conv.id}`, {
      method: 'POST', body: f,
      headers: { 'content-type': f.type || 'application/octet-stream', 'x-zaelyn-nombre': encodeURIComponent(nombre), 'x-zaelyn-texto': encodeURIComponent(pie) },
    })
    if (!r.ok) setAviso(explicarError(((await r.json().catch(() => ({}))) as { error?: string }).error))
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
      await pedirJson('/api/mensajes/accion/denunciar', { n, motivo })
      return setAviso('Gracias. Lo revisamos.')
    }
    if (a === 'borrar' && !confirm('¿Borrar este mensaje? Queda la marca de que se borró.')) return
    await pedirJson(`/api/mensajes/accion/${a}`, { n })
    if (a === 'mostrar') abrirChatDeZaelyn()
    setMensajes(ms => ms.map(m => m.n !== n ? m : a === 'mostrar' ? { ...m, aZaelyn: true } : { ...m, borrado: true, texto: '', adjunto: null }))
  }

  const bloquear = () => {
    if (!conv.con) return
    if (confirm(`¿Bloquear a @${conv.con}? Ya no podrá escribirte directo.`)) {
      void pedirJson('/api/mensajes/accion/bloquear', { handle: conv.con }).then(() => setAviso(`Bloqueaste a @${conv.con}.`))
    }
  }

  return (
    <div className={`ms-conv-in${compacta ? ' compacta' : ''}`}>
      {cabecera && (
        <header className="ms-cab">
          {alVolver && <button type="button" className="ms-atras" onClick={alVolver} aria-label="Volver a la lista">←</button>}
          <span className="ms-avatar" data-tipo={conv.tipo} aria-hidden="true">{iniciales(conv.titulo)}</span>
          <b>{conv.titulo}</b>
          {conv.tipo === 'directa' && conv.con && (
            <button type="button" className="ms-cab-acc" onClick={bloquear}>Bloquear</button>
          )}
        </header>
      )}
      <div className="ms-mensajes" ref={lista} aria-live="polite">
        {mensajes.length === 0 && <p className="ms-sin">Sin mensajes todavía. Escribe <b>@zaelyn</b> para pedirle algo a Zaelyn.</p>}
        {mensajes.map(m => (
          <div key={m.n} className={`ms-msg${m.mio ? ' mio' : ''}`}>
            {!m.mio && conv.tipo === 'grupo' && <span className="ms-autor">@{m.autor ?? 'alguien'}</span>}
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
      {aviso && <p className="ms-aviso" role="status">{aviso}</p>}
      <form className="ch-redactar ms-redactar" onSubmit={e => { e.preventDefault(); void mandar() }}>
        <button type="button" className="ch-micro" title="Mencionar a Zaelyn" aria-label="Mencionar a Zaelyn"
          onClick={() => setTexto(t => (t.includes('@zaelyn') ? t : `@zaelyn ${t}`))}>✦</button>
        <textarea className="ch-entrada" rows={1} value={texto} maxLength={4000} placeholder="Escribe un mensaje…" aria-label="Escribe un mensaje"
          onChange={e => setTexto(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void mandar() } }} />
        <input ref={archivo} type="file" hidden accept="image/*,audio/*,application/pdf,.docx,.xlsx,.pptx,.csv,.txt,.zip"
          onChange={e => { const f = e.target.files?.[0]; if (f) void subir(f, f.name); e.target.value = '' }} />
        <button type="button" className="ch-micro" aria-label="Adjuntar archivo o foto" onClick={() => archivo.current?.click()}>📎</button>
        {texto.trim()
          ? <button type="submit" className="ch-enviar" aria-label="Enviar">➤</button>
          : <button type="button" className={`ch-micro${grabando ? ' activo' : ''}`} aria-label={grabando ? 'Terminar audio' : 'Grabar audio'} onClick={() => void grabar()}>{grabando ? '■' : '🎤'}</button>}
      </form>
    </div>
  )
}
