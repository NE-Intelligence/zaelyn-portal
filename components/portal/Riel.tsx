'use client'

/**
 * El riel: Zaelyn y las conversaciones al lado del portal, como un teléfono
 * (decisiones/2026-11-10-rediseno-del-portal). Reemplaza las ventanitas de
 * abajo (decisiones/2026-10-30-panel-y-ventanas).
 *
 * - Una tira vertical en el borde derecho: el orbe de Zaelyn fijo arriba y,
 *   debajo, apiladas, las conversaciones (primero las que tienen no leídos).
 * - Un toque abre la columna de ≈400 px con esa conversación; otro toque, o
 *   Esc, la cierra. Solo una a la vez: abrir una persona cierra a Zaelyn.
 * - Atajos: Alt+1 Zaelyn, Alt+2…9 las conversaciones en el orden del riel.
 *   (Ctrl+número cambia de pestaña en el navegador; por eso Alt.)
 * - En el teléfono no hay riel: la pestaña Mensajes y el botón de Zaelyn.
 *
 * CON LA APP EMBEBIDA (`ZAELYN_APP_URL`): la columna es app.zaelyn.ai en modo
 * `?embebido=1`, idéntica a la app porque es la app. La app avisa por
 * `postMessage` (origen verificado): `zaelyn:cambio` refresca la página,
 * `zaelyn:no-leidos` pinta el riel y `zaelyn:abrir` lleva a una pantalla del
 * portal. Sin esa variable, la columna usa el chat y la conversación propios.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ConversacionEnPortal } from '@/lib/api'
import { Conversacion, iniciales } from '@/components/portal/Conversacion'

type Item = { id: string; titulo: string; tipo?: string; sinLeer: number }
const ABIERTA = 'zaelyn-riel-v1'

export function Riel({ app }: { app: string | null }) {
  const router = useRouter()
  const [convs, setConvs] = useState<ConversacionEnPortal[]>([])
  const [deApp, setDeApp] = useState<Item[] | null>(null)
  const [abierta, setAbierta] = useState<string | null>(null) // id de conversación, o 'zaelyn' con la app
  const [zaelyn, setZaelyn] = useState(false) // panel propio de Zaelyn (sin app)
  const marco = useRef<HTMLIFrameElement>(null)

  // ── la lista ────────────────────────────────────────────────────────────
  const recargar = useCallback(async () => {
    try {
      const r = await fetch('/api/mensajes', { cache: 'no-store' })
      if (r.ok) setConvs(((await r.json()) as { conversaciones: ConversacionEnPortal[] }).conversaciones)
    } catch { /* sin red: se reintenta en el siguiente ciclo */ }
  }, [])
  useEffect(() => {
    document.documentElement.dataset.riel = '1'
    try { setAbierta(sessionStorage.getItem(ABIERTA) || null) } catch { /* sin almacenamiento */ }
    void recargar()
    const i = setInterval(() => { void recargar() }, 20_000)
    return () => { clearInterval(i); delete document.documentElement.dataset.riel }
  }, [recargar])
  useEffect(() => {
    try { if (abierta) sessionStorage.setItem(ABIERTA, abierta); else sessionStorage.removeItem(ABIERTA) } catch { /* nada */ }
    if (abierta) document.documentElement.dataset.zconv = 'abierta'
    else delete document.documentElement.dataset.zconv
  }, [abierta])

  // ── el panel propio de Zaelyn (Chat.tsx) avisa si está abierto ──────────
  useEffect(() => {
    const oir = (e: Event) => {
      const si = !!(e as CustomEvent<boolean>).detail
      setZaelyn(si)
      if (si) setAbierta(a => (a === 'zaelyn' ? a : null))
    }
    window.addEventListener('zaelyn:panel', oir)
    setZaelyn(document.documentElement.dataset.zpanel === 'abierto')
    return () => window.removeEventListener('zaelyn:panel', oir)
  }, [])

  // ── la app embebida habla por postMessage ───────────────────────────────
  useEffect(() => {
    if (!app) return
    const oir = (e: MessageEvent) => {
      if (e.origin !== app || typeof e.data !== 'object' || !e.data) return
      const m = e.data as { tipo?: string; url?: string; conversaciones?: Item[] }
      if (m.tipo === 'zaelyn:cambio') router.refresh()
      else if (m.tipo === 'zaelyn:no-leidos' && Array.isArray(m.conversaciones)) setDeApp(m.conversaciones.slice(0, 40))
      else if (m.tipo === 'zaelyn:abrir' && typeof m.url === 'string' && m.url.startsWith('/') && !m.url.startsWith('//')) router.push(m.url)
    }
    window.addEventListener('message', oir)
    return () => window.removeEventListener('message', oir)
  }, [app, router])
  const contexto = useCallback(() => {
    if (!app || !marco.current?.contentWindow) return
    const q = new URLSearchParams(window.location.search)
    const [, , , grupo, plan] = window.location.pathname.split('/')
    marco.current.contentWindow.postMessage(
      { tipo: 'portal:contexto', ruta: window.location.pathname, grupo: grupo ?? null, plan: plan ?? null, vista: q.get('v'), resaltar: q.get('a') },
      app,
    )
    apariencia()
  }, [app])
  // La app embebida se pinta como el portal: misma luz y misma paleta
  // (decisiones/2026-11-11-inicio-de-ejecucion). Se manda al cargar y cada vez
  // que la persona cambia algo en «Apariencia».
  const apariencia = useCallback(() => {
    if (!app || !marco.current?.contentWindow) return
    const h = document.documentElement
    const oscuro = h.dataset.tema === 'oscuro' || (h.dataset.tema !== 'claro' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    marco.current.contentWindow.postMessage({ tipo: 'portal:apariencia', tema: oscuro ? 'oscuro' : 'claro', paleta: h.dataset.paleta ?? 'lavanda' }, app)
  }, [app])
  useEffect(() => {
    if (!app) return
    const mo = new MutationObserver(() => apariencia())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-tema', 'data-paleta'] })
    return () => mo.disconnect()
  }, [app, apariencia])

  // ── abrir y cerrar ──────────────────────────────────────────────────────
  const alternarZaelyn = useCallback(() => {
    if (app) { setAbierta(a => (a === 'zaelyn' ? null : 'zaelyn')); return }
    setAbierta(null)
    window.dispatchEvent(new Event('zaelyn:alternar'))
  }, [app])
  // Con la app embebida, el botón «Zaelyn» de la barra (teléfono) abre la columna.
  useEffect(() => {
    if (!app) return
    const oir = () => setAbierta(a => (a === 'zaelyn' ? null : 'zaelyn'))
    const abrir = () => setAbierta('zaelyn')
    // Sin el panel propio, «Pregúntale a Zaelyn» va directo al motor y la
    // respuesta llega a la app embebida por su buzón.
    const preguntar = (e: Event) => {
      const { texto } = (e as CustomEvent<{ texto?: string }>).detail ?? {}
      if (!texto) return
      setAbierta('zaelyn')
      void fetch('/api/chat/mensaje', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: texto, id: crypto.randomUUID() }),
      }).catch(() => { /* la columna ya está abierta: se puede volver a escribir ahí */ })
    }
    window.addEventListener('zaelyn:preguntar', preguntar)
    window.addEventListener('zaelyn:alternar', oir)
    window.addEventListener('zaelyn:abrir-chat', abrir)
    return () => {
      window.removeEventListener('zaelyn:alternar', oir)
      window.removeEventListener('zaelyn:abrir-chat', abrir)
      window.removeEventListener('zaelyn:preguntar', preguntar)
    }
  }, [app])
  const abrirConv = useCallback((id: string) => {
    if (!app && zaelyn) window.dispatchEvent(new Event('zaelyn:cerrar-chat'))
    setAbierta(a => (a === id ? null : id))
  }, [app, zaelyn])

  const lista: Item[] = (deApp ?? convs.map(c => ({ id: c.id, titulo: c.titulo, tipo: c.tipo, sinLeer: c.sinLeer })))
    .slice()
    .sort((a, b) => (b.sinLeer > 0 ? 1 : 0) - (a.sinLeer > 0 ? 1 : 0))
  // Arriba del orbe solo lo que espera respuesta; todo lo demás, en Mensajes.
  const visibles = lista.filter(c => c.sinLeer > 0 || c.id === abierta).slice(0, 4)
  const resto = lista.length - visibles.length

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierta) { setAbierta(null); return }
      if (!e.altKey || e.ctrlKey || e.metaKey) return
      const n = Number(e.code.replace('Digit', ''))
      if (!Number.isInteger(n) || n < 1 || n > 9) return
      e.preventDefault()
      if (n === 1) alternarZaelyn()
      else if (visibles[n - 2]) abrirConv(visibles[n - 2]!.id)
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [abierta, alternarZaelyn, abrirConv, visibles])

  const conv = abierta && abierta !== 'zaelyn' ? convs.find(c => c.id === abierta) : undefined
  const titulo = abierta === 'zaelyn' ? 'Zaelyn' : (conv?.titulo ?? lista.find(x => x.id === abierta)?.titulo ?? '')
  const srcApp = app && abierta ? `${app}/${abierta === 'zaelyn' ? 'zaelyn' : `chats/${encodeURIComponent(abierta)}`}?embebido=1` : null

  return (
    <>
      <nav className="rl" aria-label="Zaelyn y tus conversaciones">
        <button
          type="button"
          className="rl-z"
          aria-pressed={abierta === 'zaelyn' || zaelyn}
          aria-controls={app ? 'rl-columna' : 'zaelyn-panel'}
          onClick={alternarZaelyn}
          title="Zaelyn (Alt+1)"
        >
          <span className="z-orbe" aria-hidden="true" />
          <span className="sr-only">Zaelyn</span>
        </button>
        <span className="rl-sep" aria-hidden="true" />
        <ul className="rl-lista">
          {visibles.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                className="rl-p"
                data-tipo={c.tipo}
                aria-pressed={abierta === c.id}
                onClick={() => abrirConv(c.id)}
                title={`${c.titulo}${c.sinLeer ? ` · ${c.sinLeer} sin leer` : ''}${i < 8 ? ` (Alt+${i + 2})` : ''}`}
              >
                <span aria-hidden="true">{iniciales(c.titulo)}</span>
                <span className="sr-only">{c.titulo}{c.sinLeer ? `, ${c.sinLeer} sin leer` : ''}</span>
                {c.sinLeer > 0 && <span className="rl-badge" aria-hidden="true">{c.sinLeer > 9 ? '9+' : c.sinLeer}</span>}
              </button>
            </li>
          ))}
        </ul>
        <a className="rl-mas" href="/app/mensajes" title="Todas las conversaciones">
          {resto > 0 ? `+${resto}` : '···'}
          <span className="sr-only">Todas las conversaciones</span>
        </a>
      </nav>

      {abierta && (srcApp || conv) && (
        <section id="rl-columna" className="rl-columna" aria-label={titulo}>
          <header className="rl-cab">
            {abierta === 'zaelyn'
              ? <span className="z-orbe rl-cab-orbe" aria-hidden="true" />
              : <span className="ms-avatar" data-tipo={conv?.tipo} aria-hidden="true">{iniciales(titulo)}</span>}
            <b className="rl-cab-t">{titulo}</b>
            {abierta !== 'zaelyn' && <a className="rl-acc" href={`/app/mensajes?c=${encodeURIComponent(abierta)}`} title="Abrir en grande" aria-label="Abrir en grande">⤢</a>}
            <button type="button" className="rl-acc" onClick={() => setAbierta(null)} aria-label="Cerrar">×</button>
          </header>
          {srcApp
            ? <div className="rl-marco-caja"><iframe ref={marco} className="rl-marco" src={srcApp} title={titulo} onLoad={contexto} allow="microphone; clipboard-write" /></div>
            : conv && <Conversacion key={conv.id} conv={conv} compacta cabecera={false} alActividad={() => void recargar()} />}
        </section>
      )}
    </>
  )
}
