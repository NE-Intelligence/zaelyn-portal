'use client'

/**
 * Hablarle a Zaelyn sin salir del portal: escrito o en voz.
 *
 * Ref: Zaelyn DECISIONS #227 (canal web), #63 y #98 (la voz es otra forma de
 * teclear), regla del portal (el token nunca llega al navegador).
 *
 * ── LO QUE HACE Y LO QUE NO ───────────────────────────────────────────
 *
 * El mensaje entra en Zaelyn por la MISMA escalera que uno de Telegram. Esta
 * pantalla no interpreta nada: manda lo que escribiste (o el audio, o el botón
 * que tocaste) y pinta lo que Zaelyn contesta. Cuando llega una respuesta, la
 * página se vuelve a pedir al servidor (`router.refresh()`): si lo que dijiste
 * movió una fecha o cerró una actividad, el tablero lo enseña sin recargar,
 * y lo enseña con las mismas cuentas del motor — el portal sigue sin
 * calcular nada (regla de `lib/plan.ts`).
 *
 * La conversación vive en esta pestaña (sessionStorage), no en el servidor:
 * el buzón del motor caduca en un día y no es un historial.
 */
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export type TextosChat = {
  abrir: string
  titulo: string
  sub: string
  cerrar: string
  placeholder: string
  enviar: string
  hablar: string
  detener: string
  escuchando: string
  pensando: string
  vacio: string
  sinMicro: string
  caido: string
  demasiados: string
  sesion: string
  verImagen: string
  descargar: string
}

type Boton = { label: string; data: string }
type CuerpoWeb = {
  text: string
  parseMode?: 'plain' | 'markdown'
  buttons?: Boton[]
  imagen?: { url: string; titulo: string }
  archivo?: { nombre: string; mime: string; base64: string }
}
type Mensaje =
  | { id: string; de: 'yo'; text: string; voz?: boolean }
  | { id: string; de: 'zaelyn'; cuerpo: CuerpoWeb }
  | { id: string; de: 'aviso'; text: string }

const CLAVE = 'zaelyn-chat-v1'
const MAX_GUARDADOS = 60
const MAX_VOZ_S = 120

const nuevoId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`

function leerGuardados(): Mensaje[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE)
    const v = crudo ? JSON.parse(crudo) as unknown : []
    return Array.isArray(v) ? (v as Mensaje[]).slice(-MAX_GUARDADOS) : []
  } catch { return [] }
}

function guardar(ms: Mensaje[]): void {
  try {
    // Los archivos no se guardan: pesan, y se piden otra vez si hacen falta.
    const ligeros = ms.slice(-MAX_GUARDADOS).map(m =>
      m.de === 'zaelyn' && m.cuerpo.archivo ? { ...m, cuerpo: { ...m.cuerpo, archivo: undefined } } : m)
    sessionStorage.setItem(CLAVE, JSON.stringify(ligeros))
  } catch { /* sin almacenamiento la conversación dura lo que la página */ }
}

/** El mejor formato que este navegador sabe grabar. Safari graba mp4. */
function formatoDeVoz(): string | null {
  if (typeof MediaRecorder === 'undefined') return null
  for (const t of ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus']) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return ''
}

export function Chat({ t }: { t: TextosChat }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')
  const [pensando, setPensando] = useState(false)
  const [grabando, setGrabando] = useState<null | { desde: number }>(null)
  const [segundos, setSegundos] = useState(0)
  const hasta = useRef<number | null>(null)
  const sondeoVivo = useRef(false)
  const lista = useRef<HTMLDivElement>(null)
  const entrada = useRef<HTMLTextAreaElement>(null)
  const grabadora = useRef<MediaRecorder | null>(null)
  const trozos = useRef<Blob[]>([])
  const refrescar = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pensandoHasta = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMensajes(leerGuardados()) }, [])
  // Desde los mensajes entre personas (#230): al mostrarle algo a Zaelyn, su
  // respuesta llega aquí, así que el panel se abre solo.
  useEffect(() => {
    const abrir = () => setAbierto(true)
    window.addEventListener('zaelyn:abrir-chat', abrir)
    return () => window.removeEventListener('zaelyn:abrir-chat', abrir)
  }, [])
  // El service worker de avisos (fase 2). Registrarlo no pide permiso de
  // nada: solo deja listo que el teléfono pueda instalar Zaelyn y, si la
  // persona lo activa en su cuenta, recibir avisos.
  useEffect(() => {
    if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  }, [])
  useEffect(() => { guardar(mensajes) }, [mensajes])
  useEffect(() => {
    lista.current?.scrollTo({ top: lista.current.scrollHeight, behavior: 'smooth' })
  }, [mensajes, pensando])

  const avisar = useCallback((text: string) => {
    setMensajes(ms => [...ms, { id: nuevoId(), de: 'aviso', text }])
  }, [])

  // ── recoger respuestas ──────────────────────────────────────────────
  const sondear = useCallback(async () => {
    if (sondeoVivo.current) return
    sondeoVivo.current = true
    try {
      if (hasta.current === null) {
        const r = await fetch('/api/chat/recibir', { cache: 'no-store' })
        if (r.status === 401) { avisar(t.sesion); return }
        if (!r.ok) return
        hasta.current = (await r.json() as { hasta: number }).hasta
      }
      while (sondeoVivo.current) {
        const r = await fetch(`/api/chat/recibir?desde=${hasta.current}&espera=20`, { cache: 'no-store' })
        if (r.status === 401) { avisar(t.sesion); break }
        if (!r.ok) { await new Promise(res => setTimeout(res, 4_000)); continue }
        const j = await r.json() as { hasta: number; mensajes: Array<{ n: number; cuerpo: CuerpoWeb }> }
        if (j.mensajes.length) {
          hasta.current = j.hasta
          setPensando(false)
          setMensajes(ms => [...ms, ...j.mensajes.map(m => ({ id: `z${m.n}`, de: 'zaelyn' as const, cuerpo: m.cuerpo }))])
          // Lo que se dijo pudo mover el plan: la página se pide otra vez al
          // servidor, con sus cuentas. Una sola vez aunque lleguen tres.
          if (refrescar.current) clearTimeout(refrescar.current)
          refrescar.current = setTimeout(() => router.refresh(), 400)
        }
      }
    } catch {
      // Sin red: se reintenta al volver a abrir o al mandar algo.
    } finally {
      sondeoVivo.current = false
    }
  }, [avisar, router, t.sesion])

  useEffect(() => {
    if (abierto) {
      void sondear()
      setTimeout(() => entrada.current?.focus(), 50)
    } else {
      sondeoVivo.current = false
    }
  }, [abierto, sondear])

  const esperarRespuesta = () => {
    setPensando(true)
    if (pensandoHasta.current) clearTimeout(pensandoHasta.current)
    pensandoHasta.current = setTimeout(() => setPensando(false), 30_000)
    void sondear()
  }

  // ── mandar ──────────────────────────────────────────────────────────
  const mandar = async (carga: { text?: string; boton?: string }, eco: string, voz = false) => {
    setMensajes(ms => [...ms, { id: nuevoId(), de: 'yo', text: eco, voz }])
    try {
      const r = await fetch('/api/chat/mensaje', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...carga, id: nuevoId() }),
      })
      if (r.status === 202) return esperarRespuesta()
      avisar(r.status === 429 ? t.demasiados : r.status === 401 ? t.sesion : t.caido)
    } catch { avisar(t.caido) }
  }

  const enviarTexto = () => {
    const limpio = texto.trim()
    if (!limpio) return
    setTexto('')
    void mandar({ text: limpio }, limpio)
  }

  const tocarBoton = (b: Boton) => { void mandar({ boton: b.data }, b.label) }

  // ── voz ─────────────────────────────────────────────────────────────
  const empezarVoz = async () => {
    const formato = formatoDeVoz()
    if (formato === null || !navigator.mediaDevices?.getUserMedia) return avisar(t.sinMicro)
    try {
      const flujo = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = formato ? new MediaRecorder(flujo, { mimeType: formato }) : new MediaRecorder(flujo)
      trozos.current = []
      rec.ondataavailable = e => { if (e.data.size) trozos.current.push(e.data) }
      const desde = Date.now()
      rec.onstop = () => {
        flujo.getTracks().forEach(x => x.stop())
        const dur = Math.round((Date.now() - desde) / 1000)
        const tipo = (rec.mimeType || formato || 'audio/webm').split(';')[0]!
        void subirVoz(new Blob(trozos.current, { type: tipo }), tipo, dur)
      }
      grabadora.current = rec
      rec.start()
      setGrabando({ desde })
    } catch { avisar(t.sinMicro) }
  }

  const detenerVoz = () => {
    grabadora.current?.stop()
    grabadora.current = null
    setGrabando(null)
  }

  useEffect(() => {
    if (!grabando) { setSegundos(0); return }
    const i = setInterval(() => {
      const s = Math.round((Date.now() - grabando.desde) / 1000)
      setSegundos(s)
      if (s >= MAX_VOZ_S) detenerVoz()
    }, 250)
    return () => clearInterval(i)
  }, [grabando])

  const subirVoz = async (audio: Blob, tipo: string, dur: number) => {
    if (dur < 1 || !audio.size) return
    setMensajes(ms => [...ms, { id: nuevoId(), de: 'yo', text: `🎤 ${dur} s`, voz: true }])
    try {
      const r = await fetch('/api/chat/voz', {
        method: 'POST', headers: { 'content-type': tipo, 'x-zaelyn-segundos': String(dur) }, body: audio,
      })
      if (r.status === 202) return esperarRespuesta()
      avisar(r.status === 429 ? t.demasiados : r.status === 401 ? t.sesion : t.caido)
    } catch { avisar(t.caido) }
  }

  // ── pintar ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!abierto) return
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && !grabando) setAbierto(false) }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [abierto, grabando])

  const ultimoConBotones = [...mensajes].reverse().find(m => m.de === 'zaelyn')

  if (!abierto) {
    return (
      <button type="button" className="ch-lanzador" onClick={() => setAbierto(true)} aria-label={t.abrir}>
        <span className="ch-chispa" aria-hidden="true">✦</span>
        <span className="ch-lanzador-txt">{t.abrir}</span>
      </button>
    )
  }

  return (
    <section className="ch-panel" role="dialog" aria-modal="false" aria-label={t.titulo}>
      <header className="ch-cab">
        <div>
          <p className="ch-titulo"><span className="ch-chispa" aria-hidden="true">✦</span> {t.titulo}</p>
          <p className="ch-sub">{t.sub}</p>
        </div>
        <button type="button" className="ch-cerrar" onClick={() => setAbierto(false)} aria-label={t.cerrar}>×</button>
      </header>

      <div className="ch-lista" ref={lista} aria-live="polite">
        {!mensajes.length && <p className="ch-vacio">{t.vacio}</p>}
        {mensajes.map(m => m.de === 'zaelyn'
          ? (
            <div key={m.id} className="ch-msg ch-zaelyn">
              <Texto cuerpo={m.cuerpo} />
              {m.cuerpo.imagen && (
                <a className="ch-liga" href={m.cuerpo.imagen.url} target="_blank" rel="noopener noreferrer">
                  {t.verImagen}: {m.cuerpo.imagen.titulo}
                </a>
              )}
              {m.cuerpo.archivo && <Archivo a={m.cuerpo.archivo} etiqueta={t.descargar} />}
              {m === ultimoConBotones && m.cuerpo.buttons?.length ? (
                <div className="ch-botones">
                  {m.cuerpo.buttons.map(b => (
                    <button key={b.data} type="button" className="ch-boton" onClick={() => tocarBoton(b)}>{b.label}</button>
                  ))}
                </div>
              ) : null}
            </div>
          )
          : m.de === 'yo'
            ? <div key={m.id} className="ch-msg ch-yo">{m.text}</div>
            : <div key={m.id} className="ch-msg ch-aviso" role="status">{m.text}</div>)}
        {pensando && <div className="ch-msg ch-zaelyn ch-pensando" aria-label={t.pensando}><span /><span /><span /></div>}
      </div>

      <form className="ch-redactar" onSubmit={e => { e.preventDefault(); enviarTexto() }}>
        {grabando ? (
          <div className="ch-grabando" role="status">
            <span className="ch-punto" aria-hidden="true" /> {t.escuchando} · {segundos} s
          </div>
        ) : (
          <textarea
            ref={entrada}
            className="ch-entrada"
            rows={1}
            value={texto}
            maxLength={4000}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            onChange={e => setTexto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarTexto() } }}
          />
        )}
        <button
          type="button"
          className={`ch-micro${grabando ? ' activo' : ''}`}
          onClick={() => (grabando ? detenerVoz() : void empezarVoz())}
          aria-label={grabando ? t.detener : t.hablar}
          aria-pressed={!!grabando}
        >
          {grabando ? '■' : <Micro />}
        </button>
        {!grabando && (
          <button type="submit" className="ch-enviar" disabled={!texto.trim()} aria-label={t.enviar}>➤</button>
        )}
      </form>
    </section>
  )
}

/**
 * El texto de Zaelyn. Telegram recibe MarkdownV2 en algunos mensajes: aquí
 * se le quitan los escapes y se respetan las negritas. Las direcciones se
 * vuelven enlaces (el pase del portal, por ejemplo). Nada de HTML crudo.
 */
function Texto({ cuerpo }: { cuerpo: CuerpoWeb }) {
  const limpio = cuerpo.parseMode === 'markdown' ? cuerpo.text.replace(/\\([_*\[\]()~`>#+\-=|{}.!\\])/g, '$1') : cuerpo.text
  if (!limpio) return null
  return (
    <p className="ch-texto">
      {limpio.split(/(https?:\/\/[^\s)]+|\*[^*\n]+\*)/g).map((trozo, i) => {
        if (/^https?:\/\//.test(trozo)) {
          return <a key={i} className="ch-liga" href={trozo} target="_blank" rel="noopener noreferrer">{trozo}</a>
        }
        if (/^\*[^*\n]+\*$/.test(trozo)) return <strong key={i}>{trozo.slice(1, -1)}</strong>
        return <span key={i}>{trozo}</span>
      })}
    </p>
  )
}

function Archivo({ a, etiqueta }: { a: { nombre: string; mime: string; base64: string }; etiqueta: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    const bin = atob(a.base64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    const u = URL.createObjectURL(new Blob([bytes], { type: a.mime }))
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [a])
  if (!url) return null
  return <a className="ch-archivo" href={url} download={a.nombre}>⬇ {etiqueta}: {a.nombre}</a>
}

function Micro() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  )
}
