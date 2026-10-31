'use client'

/**
 * Hablarle a Zaelyn sin salir del portal: escrito o en voz, en un panel
 * lateral que se abre desde la barra (decisiones/2026-10-30-panel-y-ventanas).
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
  /** Dónde se ve en grande (motor: decisiones/2026-10-31-portal-sigue-al-chat). */
  portal?: { ir: string; dice: string }
  /** La misma respuesta como tabla (motor: decisiones/2026-10-31-tablas-en-el-chat). */
  tabla?: { columnas: string[]; filas: string[][]; mas?: number }
}
/** Solo rutas del portal mismo: el motor no puede mandarnos a otro lado. */
const irValido = (ir: unknown): ir is string =>
  typeof ir === 'string' && /^\/app\/[A-Za-z0-9/_?=&.-]*$/.test(ir) && !ir.includes('..')
function enGrupoDeLaPagina(): { enGrupo?: string } {
  const m = /^\/app\/g\/([0-9a-f-]{36})(?:\/|$)/i.exec(window.location.pathname)
  return m ? { enGrupo: m[1]! } : {}
}
type Mensaje =
  | { id: string; de: 'yo'; text: string; voz?: boolean }
  | { id: string; de: 'zaelyn'; cuerpo: CuerpoWeb }
  | { id: string; de: 'aviso'; text: string }

const CLAVE = 'zaelyn-chat-v1'
const PANEL = 'zaelyn-panel'
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
  /**
   * Hay una respuesta MÍA en camino: si trae página, el portal va a ella
   * solo. Un aviso que llega sin que pregunte nada no me mueve de donde estoy.
   */
  const esperando = useRef(false)

  useEffect(() => {
    setMensajes(leerGuardados())
    // El panel lateral se queda como lo dejaste al cambiar de página.
    try { if (localStorage.getItem(PANEL) === '1') setAbierto(true) } catch { /* sin almacenamiento */ }
  }, [])
  // El botón «✦ Zaelyn» de la barra alterna el panel; los mensajes entre
  // personas (#230) lo abren solo cuando le muestras algo a Zaelyn.
  useEffect(() => {
    const abrir = () => setAbierto(true)
    const alternar = () => setAbierto(a => !a)
    window.addEventListener('zaelyn:abrir-chat', abrir)
    window.addEventListener('zaelyn:alternar', alternar)
    return () => {
      window.removeEventListener('zaelyn:abrir-chat', abrir)
      window.removeEventListener('zaelyn:alternar', alternar)
    }
  }, [])
  // El estado se anuncia a la página: el contenido se recorre para hacerle
  // lugar (CSS con `html[data-zpanel]`) y el botón de la barra se marca.
  useEffect(() => {
    try { localStorage.setItem(PANEL, abierto ? '1' : '0') } catch { /* sin almacenamiento */ }
    if (abierto) document.documentElement.dataset.zpanel = 'abierto'
    else delete document.documentElement.dataset.zpanel
    window.dispatchEvent(new CustomEvent('zaelyn:panel', { detail: abierto }))
  }, [abierto])
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
          // EL PORTAL SIGUE AL CHAT (portal-sigue-al-chat): si pregunté algo y
          // la respuesta se ve mejor en una página, la página se abre sola.
          const destino = [...j.mensajes].reverse().map(m => m.cuerpo.portal?.ir).find(irValido)
          const aqui = window.location.pathname + window.location.search
          if (esperando.current && destino && destino !== aqui) {
            esperando.current = false
            router.push(destino)
          } else {
            // Lo que se dijo pudo mover el plan: la página se pide otra vez
            // al servidor, con sus cuentas. Una sola vez aunque lleguen tres.
            if (refrescar.current) clearTimeout(refrescar.current)
            refrescar.current = setTimeout(() => router.refresh(), 400)
          }
          esperando.current = false
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
    esperando.current = true
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
        // El proyecto que tienes abierto va con el mensaje: «cómo va» en la
        // página de Cuprum es «cómo va Cuprum» (motor: portal-sigue-al-chat).
        body: JSON.stringify({ ...carga, id: nuevoId(), ...enGrupoDeLaPagina() }),
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

  if (!abierto) return null

  return (
    <aside className="ch-panel" id="zaelyn-panel" aria-label={t.titulo}>
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
              {m.cuerpo.tabla?.filas?.length ? <ConTabla cuerpo={m.cuerpo} /> : <Texto cuerpo={m.cuerpo} />}
              {m.cuerpo.imagen && (
                <a className="ch-liga" href={m.cuerpo.imagen.url} target="_blank" rel="noopener noreferrer">
                  {t.verImagen}: {m.cuerpo.imagen.titulo}
                </a>
              )}
              {m.cuerpo.archivo && <Archivo a={m.cuerpo.archivo} etiqueta={t.descargar} />}
              {irValido(m.cuerpo.portal?.ir) && (
                <button type="button" className="ch-ir" onClick={() => router.push(m.cuerpo.portal!.ir)}>
                  {m.cuerpo.portal!.dice} →
                </button>
              )}
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
    </aside>
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

/**
 * El encabezado del texto y la tabla debajo; el texto completo, a un clic
 * (es el mismo que llega por Telegram).
 */
function ConTabla({ cuerpo }: { cuerpo: CuerpoWeb }) {
  const [comoTexto, setComoTexto] = useState(false)
  const t = cuerpo.tabla!
  if (comoTexto) {
    return <><Texto cuerpo={cuerpo} /><button type="button" className="ch-vertabla" onClick={() => setComoTexto(false)}>Ver como tabla</button></>
  }
  const encabezado = cuerpo.text.split(/\n\s*\n/)[0] ?? ''
  return (
    <>
      <Texto cuerpo={{ ...cuerpo, text: encabezado }} />
      <div className="ch-tabla-caja">
        <table className="ch-tabla">
          <thead><tr>{t.columnas.map(c => <th key={c} scope="col">{c}</th>)}</tr></thead>
          <tbody>{t.filas.map((f, i) => <tr key={i}>{f.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      {t.mas ? <p className="ch-tabla-mas">y {t.mas} más</p> : null}
      <button type="button" className="ch-vertabla" onClick={() => setComoTexto(true)}>Ver como texto</button>
    </>
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
