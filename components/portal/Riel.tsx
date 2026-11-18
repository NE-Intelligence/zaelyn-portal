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
import { AjustesPanel } from '@/components/portal/AjustesPanel'
import { ANCHOS, PANEL_FABRICA, guardarPanel, leerPanel, type PanelPrefs } from '@/lib/panel'

type Item = { id: string; titulo: string; tipo?: string; sinLeer: number }
const ABIERTA = 'zaelyn-riel-v1'

export function Riel({ app }: { app: string | null }) {
  const router = useRouter()
  const [convs, setConvs] = useState<ConversacionEnPortal[]>([])
  const [deApp, setDeApp] = useState<Item[] | null>(null)
  const [abierta, setAbierta] = useState<string | null>(null) // id de conversación, o 'zaelyn' con la app
  const [zaelyn, setZaelyn] = useState(false) // panel propio de Zaelyn (sin app)
  const marco = useRef<HTMLIFrameElement>(null)
  // Cómo se ve el panel, por dispositivo (decisiones/2026-11-18-panel-de-zaelyn).
  const [pp, setPp] = useState<PanelPrefs>(PANEL_FABRICA)
  const [ajustes, setAjustes] = useState(false)
  const ppRef = useRef(pp)
  ppRef.current = pp
  useEffect(() => { setPp(leerPanel()) }, [])
  const cambiarPanel = useCallback((x: Partial<PanelPrefs>) => {
    setPp(a => { const n = { ...a, ...x }; guardarPanel(n); return n })
  }, [])

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
  // En forma Columna la página se recorre para que nada quede tapado.
  useEffect(() => {
    const h = document.documentElement
    h.style.setProperty('--rl-w', `${ANCHOS[pp.ancho]}px`)
    if (abierta && pp.forma === 'columna') h.dataset.zcol = 'abierta'
    else delete h.dataset.zcol
    // Flotante o teléfono a la derecha sin arrastrar: el orbe se hace a un lado.
    if (abierta && pp.forma !== 'columna' && pp.lado === 'der' && !pp.pos) h.dataset.zflot = 'der'
    else delete h.dataset.zflot
    return () => { delete h.dataset.zcol; delete h.dataset.zflot }
  }, [abierta, pp.forma, pp.ancho, pp.lado, pp.pos])

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
    // La app lee `{ tipo, datos }` (specs/portal-con-app-embebida); se mandan
    // también sueltos por compatibilidad.
    const datos = { ruta: window.location.pathname, grupo: grupo ?? null, plan: plan ?? null, vista: q.get('v'), resaltar: q.get('a') }
    marco.current.contentWindow.postMessage({ tipo: 'portal:contexto', datos, ...datos }, app)
    apariencia()
  }, [app])
  // La app embebida se pinta como el portal: misma luz y misma paleta
  // (decisiones/2026-11-11-inicio-de-ejecucion). Se manda al cargar y cada vez
  // que la persona cambia algo en «Apariencia».
  const apariencia = useCallback(() => {
    if (!app || !marco.current?.contentWindow) return
    if (ppRef.current.apariencia === 'app') {
      // «Como mi app»: la app usa sus propios colores y luz.
      marco.current.contentWindow.postMessage({ tipo: 'portal:apariencia', datos: { heredar: false }, heredar: false }, app)
      return
    }
    const h = document.documentElement
    const oscuro = h.dataset.tema === 'oscuro' || (h.dataset.tema !== 'claro' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const datos = { heredar: true, tema: oscuro ? 'oscuro' : 'claro', paleta: h.dataset.paleta ?? 'lavanda' }
    marco.current.contentWindow.postMessage({ tipo: 'portal:apariencia', datos, ...datos }, app)
  }, [app])
  useEffect(() => { apariencia() }, [pp.apariencia, apariencia])
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

  // Arrastrar la ventana flotante o el teléfono desde su barra.
  const columna = useRef<HTMLElement>(null)
  const arrastrar = (e: React.PointerEvent) => {
    if (pp.forma === 'columna' || (e.target as HTMLElement).closest('button,a')) return
    const el = columna.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - r.left, dy = e.clientY - r.top
    const mover = (m: PointerEvent) => {
      const x = Math.max(8, Math.min(window.innerWidth - r.width - 8, m.clientX - dx))
      const y = Math.max(8, Math.min(window.innerHeight - 80, m.clientY - dy))
      el.style.left = `${x}px`; el.style.top = `${y}px`; el.style.right = 'auto'; el.style.bottom = 'auto'
    }
    const soltar = () => {
      window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', soltar)
      document.body.style.userSelect = ''
      const f = el.getBoundingClientRect()
      cambiarPanel({ pos: { x: Math.round(f.left), y: Math.round(f.top) } })
    }
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', mover); window.addEventListener('pointerup', soltar)
  }
  const estiloColumna = {
    '--rl-w': `${ANCHOS[pp.ancho]}px`,
    '--zy-esc': String(pp.letra),
    ...(pp.forma !== 'columna' && pp.pos ? { left: `${pp.pos.x}px`, top: `${pp.pos.y}px`, right: 'auto', bottom: 'auto' } : {}),
  } as React.CSSProperties

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
        <section id="rl-columna" ref={columna} className="rl-columna" aria-label={titulo}
          data-forma={pp.forma} data-lado={pp.lado} data-alto={pp.alto} data-equipo={pp.equipo} data-marco={pp.marco} style={estiloColumna}>
          <header className="rl-cab" onPointerDown={arrastrar} title={pp.forma !== 'columna' ? 'Arrástrame' : undefined}>
            {abierta === 'zaelyn'
              ? <span className="z-orbe rl-cab-orbe" aria-hidden="true" />
              : <span className="ms-avatar" data-tipo={conv?.tipo} aria-hidden="true">{iniciales(titulo)}</span>}
            <b className="rl-cab-t">{titulo}</b>
            {abierta !== 'zaelyn' && <a className="rl-acc" href={`/app/mensajes?c=${encodeURIComponent(abierta)}`} title="Abrir en grande" aria-label="Abrir en grande">⤢</a>}
            <button type="button" className="rl-acc" onClick={() => setAjustes(a => !a)} aria-label="Ajustes del panel" aria-expanded={ajustes} title="Forma, tamaño y letra del panel">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></svg>
            </button>
            <button type="button" className="rl-acc" onClick={() => setAbierta(null)} aria-label="Cerrar">×</button>
          </header>
          {ajustes && <AjustesPanel p={pp} cambiar={cambiarPanel} cerrar={() => setAjustes(false)} />}
          {srcApp
            ? <div className="rl-marco-caja">{pp.forma === 'telefono' && <span className="rl-isla" aria-hidden="true" />}<iframe ref={marco} className="rl-marco" src={srcApp} title={titulo} onLoad={contexto} allow="microphone; clipboard-write" /></div>
            : conv && <Conversacion key={conv.id} conv={conv} compacta cabecera={false} alActividad={() => void recargar()} />}
        </section>
      )}
    </>
  )
}
