'use client'

/**
 * Inicio: el centro de comando del día (decisiones/2026-11-18-centro-de-comando).
 *
 * Todo lo que la persona tiene, venga del módulo que venga, en UNA sola
 * estructura y sin repetir:
 * - Arriba: el saludo, lo que Zaelyn ve del día en una frase y la barra para
 *   decirle algo, con las acciones que más se usan.
 * - Una barra de herramientas: el alcance (Hoy · Semana · Mes), la forma de
 *   verlo (Lista · Calendario · Tarjetas) y un solo botón de filtros.
 * - El contenido: cada cosa una sola vez, con su espacio, su tipo, quién y su
 *   avance. Lo que se repite (la clase de cada día) se junta en un renglón.
 * - A la derecha solo lo que no es una cosa por hacer: hábitos, fechas que
 *   vienen, proyectos y módulos.
 *
 * Un solo tipo de tarjeta (`cr-vidrio`) y un solo color por espacio, en el
 * punto. Lo elegido se marca con superficie y sombra, no con negro.
 *
 * El portal no cambia nada por su cuenta: tocar una cosa la abre con Zaelyn
 * (`POST /portal/chat/abrir`) y las acciones le mandan la frase.
 */
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export type Espacio = 'personal' | 'familia' | 'grupo' | 'proyecto' | 'app'
export type Tipo = 'recordatorio' | 'evento' | 'pendiente' | 'actividad'

export type Cosa = {
  clave: string
  abrir: { tipo: Tipo; id: string } | null
  tipo: Tipo
  titulo: string
  dia: string | null
  hora: string | null
  espacio: Espacio
  /** El nombre del espacio: «Personal», «Familia Ríos», «Subestación Andes»… */
  lugar: string
  quien: string | null
  vencida: boolean
  hecho: boolean
  avance: number | null
  /** evento con hora */
  esEvento: boolean
  /** Un dato más, p. ej. el traslado: «Lleva: Diego». */
  detalle?: string | null
}

export type DatosEjecucion = {
  hoy: string
  fecha: string
  saludo: string
  quien: string | null
  foco: { texto: string; porque: string | null } | null
  avisos: string[]
  cosas: Cosa[]
  casa: Array<{ familia: string; href: string; cosas: Array<{ hora: string | null; texto: string; quien: string | null; traslado: string | null }> }>
  fechas: Array<{ titulo: string; cuando: string; faltan: number }>
  habitos: Array<{ nombre: string; hoy: number; meta: number; unidad: string | null; racha: number }>
  proyectos: Array<{ nombre: string; grupo: string; href: string; abiertos: number; vencidos: number }>
  grupos?: Array<{ nombre: string; href: string }>
  apps: Array<{ clave: string; nombre: string; estado: 'encendido' | 'apagado' | 'pronto' }>
  contratado?: { plan: string | null; apagado: Array<{ que: string; plan: string }> }
  hrefs: { personal: string; familia: string; proyectos: string; apps: string; calendario: string }
  ejemplo?: boolean
  faltan?: string[]
}

const COLOR: Record<Espacio, string> = {
  personal: 'var(--z-personal)',
  familia: 'var(--z-familia)',
  grupo: '#2f9c95',
  proyecto: 'var(--z-proyectos)',
  app: '#b4690e',
}
const TIPO: Record<Tipo, string> = { recordatorio: 'Recordatorio', evento: 'Evento', pendiente: 'Actividad de proyecto', actividad: 'Actividad' }

type Vista = 'lista' | 'calendario' | 'tarjetas'
type Alcance = 'hoy' | 'semana' | 'mes'
type Estado = 'todo' | 'pendiente' | 'hecho' | 'vencido'
const LLAVE = 'zaelyn.inicio'

// ── fechas ───────────────────────────────────────────────────────────────────
const sumar = (iso: string, n: number) => {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}
const diaSemana = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay()
}
const DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const diaCorto = (iso: string) => `${DIA[diaSemana(iso)]!.slice(0, 3)} ${Number(iso.slice(8, 10))}`
const diaLargo = (iso: string, hoy: string) =>
  iso === hoy ? 'Hoy' : iso === sumar(hoy, 1) ? 'Mañana' : `${DIA[diaSemana(iso)]} ${Number(iso.slice(8, 10))} de ${MESES[Number(iso.slice(5, 7)) - 1]}`
const minutos = (h: string | null) => {
  if (!h) return 24 * 60
  const [hh, mm] = h.split(':').map(Number)
  return (hh ?? 0) * 60 + (mm ?? 0)
}
const porHora = (a: Cosa, b: Cosa) =>
  Number(a.hecho) - Number(b.hecho) || Number(b.vencida) - Number(a.vencida) || (a.dia ?? '9').localeCompare(b.dia ?? '9') || minutos(a.hora) - minutos(b.hora)

/** Junta lo que se repite (misma cosa, mismo espacio) en un renglón con «y N veces más». */
function juntar(cosas: Cosa[]): Array<Cosa & { mas: number }> {
  const vistas = new Map<string, Cosa & { mas: number }>()
  for (const c of [...cosas].sort(porHora)) {
    const k = `${c.lugar}|${c.titulo}|${c.quien ?? ''}`
    const ya = vistas.get(k)
    if (ya && !c.vencida) ya.mas++
    else if (!ya) vistas.set(k, { ...c, mas: 0 })
    else vistas.set(`${k}|${c.clave}`, { ...c, mas: 0 })
  }
  return [...vistas.values()]
}

// ── piezas ───────────────────────────────────────────────────────────────────
function Punto({ espacio }: { espacio: Espacio }) {
  return <span className="size-2 flex-none rounded-full" style={{ background: COLOR[espacio] }} aria-hidden="true" />
}

/** Selector segmentado sutil: lo elegido es superficie con sombra, no negro. */
function Segmento<T extends string>({ et, opciones, valor, alElegir }: { et: string; opciones: Array<[T, string]>; valor: T; alElegir: (x: T) => void }) {
  return (
    <div className="flex rounded-full bg-[color-mix(in_srgb,var(--z-ink)_5%,transparent)] p-1" role="group" aria-label={et}>
      {opciones.map(([k, t]) => (
        <button key={k} type="button" onClick={() => alElegir(k)} aria-pressed={valor === k}
          className={`h-8 cursor-pointer rounded-full border-0 px-3.5 text-[13.5px] transition-colors ${valor === k ? 'bg-superficie font-medium text-tinta shadow-z1' : 'bg-transparent text-tinta-2 hover:text-tinta'}`}>
          {t}
        </button>
      ))}
    </div>
  )
}

function Circulo({ hecho, alTocar, titulo }: { hecho: boolean; alTocar: () => void; titulo: string }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); alTocar() }}
      className={`grid size-[20px] flex-none cursor-pointer place-items-center rounded-full border-[1.5px] transition-colors ${hecho
        ? 'border-tinta-2 bg-tinta-2 text-superficie'
        : 'border-[color-mix(in_srgb,var(--z-ink)_25%,transparent)] bg-transparent text-transparent hover:border-tinta-2 hover:text-tinta-3'}`}
      aria-label={hecho ? `«${titulo}» está hecha` : `Marcar «${titulo}»`}
      title={hecho ? 'Hecha' : 'Marcar como hecha (Zaelyn te lo confirma)'}
    >
      <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true"><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  )
}

function Renglon({ c, alAbrir, cuando, hoy, compacto }: { c: Cosa & { mas?: number }; alAbrir: (c: Cosa) => void; cuando: 'hora' | 'dia'; hoy: string; compacto?: boolean }) {
  const izq = c.vencida && !c.hecho ? 'Vencido' : cuando === 'dia' && c.dia ? (c.dia === hoy ? 'Hoy' : diaCorto(c.dia)) : c.hora ?? ''
  const sub = [c.quien, c.detalle, compacto && c.avance !== null ? `${c.avance}%` : null, c.mas ? `y ${c.mas} ${c.mas === 1 ? 'vez' : 'veces'} más` : null].filter(Boolean).join(' · ')
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={() => alAbrir(c)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alAbrir(c) } }}
        className={`group grid cursor-pointer ${compacto ? 'grid-cols-[48px_20px_minmax(0,1fr)]' : 'grid-cols-[56px_20px_minmax(0,1fr)_auto]'} items-center gap-x-3.5 rounded-[14px] px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--z-ink)_4%,transparent)]`}
      >
        <span className={`text-[13px] tabular-nums ${c.vencida && !c.hecho ? 'text-det-tinta' : 'text-tinta-3'}`}>{izq}</span>
        <Circulo hecho={c.hecho} titulo={c.titulo} alTocar={() => alAbrir(c)} />
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className={`truncate text-[15px] ${c.hecho ? 'text-tinta-3 line-through decoration-[1px]' : 'text-tinta'}`}>{c.titulo}</span>
          {compacto
            ? sub && <span className="truncate text-[12.5px] text-tinta-3">{sub}</span>
            : (
              <span className="flex min-w-0 items-center gap-2 text-[12.5px] text-tinta-3">
                <Punto espacio={c.espacio} />
                <span className="truncate">{c.lugar}{sub && ` · ${sub}`}</span>
              </span>
            )}
        </span>
        <span className={`${compacto ? 'hidden' : 'hidden sm:flex'} flex-none items-center gap-3`}>
          {c.avance !== null && (
            <span className="flex items-center gap-2 text-[12px] text-tinta-3 tabular-nums" title={`${c.avance}% de avance`}>
              <span className="h-1 w-14 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--z-ink)_8%,transparent)]">
                <span className="block h-full rounded-full" style={{ width: `${c.avance}%`, background: COLOR[c.espacio] }} />
              </span>
              {c.avance}%
            </span>
          )}
          <span className="w-[86px] text-right text-[12px] text-tinta-3">{TIPO[c.tipo].replace(' de proyecto', '')}</span>
        </span>
      </div>
    </li>
  )
}

function Panel({ titulo, nota, children, href, mas }: { titulo: string; nota?: string; children: React.ReactNode; href?: string; mas?: string }) {
  return (
    <section className="cr-vidrio flex flex-col gap-2 rounded-[24px] px-3 pt-4 pb-3">
      <header className="flex items-baseline justify-between gap-3 px-3">
        <h2 className="flex items-baseline gap-2.5 text-[15px] font-semibold">{titulo}{nota && <span className="text-[13px] font-normal text-tinta-3">{nota}</span>}</h2>
        {href && <Link href={href} className="text-[12.5px] text-tinta-3 no-underline hover:text-tinta">{mas ?? 'Abrir'} ›</Link>}
      </header>
      {children}
    </section>
  )
}

// ── la pantalla ──────────────────────────────────────────────────────────────
export function Ejecucion({ d }: { d: DatosEjecucion }) {
  const [vista, setVista] = useState<Vista>('lista')
  const [alcance, setAlcance] = useState<Alcance>('hoy')
  const [fuera, setFuera] = useState<Set<string>>(new Set())
  const [tipos, setTipos] = useState<Set<Tipo>>(new Set())
  const [estado, setEstado] = useState<Estado>('todo')
  const [aviso, setAviso] = useState<string | null>(null)
  const [frase, setFrase] = useState('')

  // La vista y el alcance se recuerdan en este navegador.
  useEffect(() => {
    try {
      const g = JSON.parse(window.localStorage.getItem(LLAVE) ?? '{}') as { vista?: Vista; alcance?: Alcance }
      if (g.vista && ['lista', 'calendario', 'tarjetas'].includes(g.vista)) setVista(g.vista)
      if (g.alcance && ['hoy', 'semana', 'mes'].includes(g.alcance)) setAlcance(g.alcance)
    } catch { /* sin almacenamiento */ }
  }, [])
  useEffect(() => {
    try { window.localStorage.setItem(LLAVE, JSON.stringify({ vista, alcance })) } catch { /* nada */ }
  }, [vista, alcance])

  const lugares = useMemo(() => {
    const m = new Map<string, Espacio>()
    for (const c of d.cosas) if (!m.has(c.lugar)) m.set(c.lugar, c.espacio)
    const orden: Espacio[] = ['personal', 'familia', 'grupo', 'proyecto', 'app']
    return [...m.entries()].sort((a, b) => orden.indexOf(a[1]) - orden.indexOf(b[1]) || a[0].localeCompare(b[0]))
  }, [d.cosas])

  const fin = alcance === 'hoy' ? d.hoy : sumar(d.hoy, alcance === 'semana' ? 6 : 30)
  const visibles = useMemo(() => d.cosas.filter(c => {
    if (fuera.has(c.lugar)) return false
    if (tipos.size && !tipos.has(c.tipo)) return false
    if (estado === 'hecho' && !c.hecho) return false
    if (estado === 'pendiente' && (c.hecho || c.vencida)) return false
    if (estado === 'vencido' && !(c.vencida && !c.hecho)) return false
    if (c.vencida && !c.hecho) return true
    if (!c.dia) return alcance !== 'hoy' || !c.hecho
    return c.dia <= fin
  }), [d.cosas, fuera, tipos, estado, fin, alcance])

  const deHoy = d.cosas.filter(c => !c.hecho && (c.vencida || (c.dia !== null && c.dia <= d.hoy)))
  const vencidas = d.cosas.filter(c => c.vencida && !c.hecho)
  const eventosHoy = d.cosas.filter(c => c.esEvento && c.dia === d.hoy && !c.hecho).sort((a, b) => minutos(a.hora) - minutos(b.hora))
  const filtros = fuera.size + tipos.size + (estado !== 'todo' ? 1 : 0)

  // Lo que Zaelyn ve del día, en una frase, con lo que el motor ya midió.
  const resumen = (() => {
    if (!deHoy.length && !eventosHoy.length) return 'Hoy no tienes nada pendiente. Buen día para adelantar algo.'
    const partes = [`${deHoy.length} ${deHoy.length === 1 ? 'cosa' : 'cosas'} por hacer`]
    if (vencidas.length) partes.push(`${vencidas.length} ${vencidas.length === 1 ? 'vencida' : 'vencidas'}`)
    if (eventosHoy.length) partes.push(`${eventosHoy.length} ${eventosHoy.length === 1 ? 'evento' : 'eventos'}, el primero a las ${eventosHoy[0]!.hora}`)
    const primero = vencidas[0] ?? [...deHoy].sort(porHora)[0]
    return `Hoy tienes ${partes.join(', ')}.${primero ? ` Lo primero: ${primero.titulo}.` : ''}`
  })()

  const decir = (t: string) => { setAviso(t); window.setTimeout(() => setAviso(null), 3200) }

  const abrir = async (c: Cosa) => {
    if (d.ejemplo) { decir(`En tu cuenta, «${c.titulo}» se abre con Zaelyn: Completada, Mover o Posponer.`); return }
    if (!c.abrir) { decir('Esto se cambia platicando con Zaelyn.'); window.dispatchEvent(new Event('zaelyn:abrir-chat')); return }
    try {
      const r = await fetch('/api/chat/abrir', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...c.abrir, etiqueta: c.titulo }),
      })
      if (!r.ok) throw new Error(String(r.status))
      window.dispatchEvent(new Event('zaelyn:abrir-chat'))
    } catch {
      decir('No pude abrirlo con Zaelyn. Intenta en un momento.')
    }
  }

  const mandar = (t: string) => {
    if (!t.trim()) return
    if (d.ejemplo) { decir('En tu cuenta, esto se lo dices a Zaelyn y te contesta en la columna de la derecha.'); return }
    window.dispatchEvent(new CustomEvent('zaelyn:preguntar', { detail: { texto: t.trim(), contexto: 'Inicio' } }))
    window.dispatchEvent(new Event('zaelyn:abrir-chat'))
    setFrase('')
  }
  const empezar = (t: string) => {
    setFrase(t)
    document.getElementById('dile-a-zaelyn')?.focus()
  }

  const alternar = <T,>(s: Set<T>, x: T) => { const n = new Set(s); if (n.has(x)) n.delete(x); else n.add(x); return n }

  // Lista: el día por momentos; la semana o el mes, por día.
  const secciones = useMemo(() => {
    const ord = [...visibles].sort(porHora)
    const venc = ord.filter(c => c.vencida && !c.hecho)
    const resto = ord.filter(c => !(c.vencida && !c.hecho))
    const out: Array<{ t: string; cosas: Cosa[]; cuando: 'hora' | 'dia' }> = []
    if (venc.length) out.push({ t: 'Vencido', cosas: venc, cuando: 'dia' })
    if (alcance === 'hoy') {
      const hoyC = resto.filter(c => c.dia === d.hoy || (c.dia !== null && c.dia < d.hoy))
      const m = (c: Cosa) => minutos(c.hora)
      out.push(
        { t: 'En la mañana', cosas: hoyC.filter(c => c.hora && m(c) < 12 * 60).sort((a, b) => m(a) - m(b)), cuando: 'hora' },
        { t: 'En la tarde', cosas: hoyC.filter(c => c.hora && m(c) >= 12 * 60 && m(c) < 19 * 60).sort((a, b) => m(a) - m(b)), cuando: 'hora' },
        { t: 'En la noche', cosas: hoyC.filter(c => c.hora && m(c) >= 19 * 60).sort((a, b) => m(a) - m(b)), cuando: 'hora' },
        { t: 'Cuando puedas hoy', cosas: hoyC.filter(c => !c.hora), cuando: 'hora' },
      )
    } else {
      const dias = [...new Set(resto.filter(c => c.dia).map(c => c.dia!))].sort()
      for (const dia of dias) out.push({ t: diaLargo(dia, d.hoy), cosas: resto.filter(c => c.dia === dia), cuando: 'hora' })
      const sin = resto.filter(c => !c.dia)
      if (sin.length) out.push({ t: 'Sin fecha', cosas: sin, cuando: 'hora' })
    }
    return out.filter(s => s.cosas.length > 0)
  }, [visibles, alcance, d.hoy])

  const acciones: Array<[string, () => void]> = [
    ['Organiza mi día', () => mandar('Organiza mi día')],
    ['¿Qué sigue?', () => mandar('¿Qué sigue?')],
    ['Recuérdame…', () => empezar('Recuérdame ')],
    ['Nueva actividad…', () => empezar('Nueva actividad: ')],
  ]

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-7 px-5 pt-10 pb-28 text-tinta sm:px-10">
      {/* ── 1 · el día en una frase ── */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] tracking-[0.08em] text-tinta-3 uppercase">{d.fecha}</span>
            <h1 className="!text-[36px] leading-[1.05] sm:!text-[46px]">
              {d.saludo}{d.quien && <>, <span className="cr-cursiva">{d.quien}</span></>}
            </h1>
          </div>
          <dl className="flex gap-7 text-[12.5px] text-tinta-3">
            <div className="flex flex-col items-end"><dt>Por hacer hoy</dt><dd className="cr-cifra text-[30px] leading-none text-tinta">{deHoy.length}</dd></div>
            <div className="flex flex-col items-end"><dt>Vencido</dt><dd className={`cr-cifra text-[30px] leading-none ${vencidas.length ? 'text-det-tinta' : 'text-tinta'}`}>{vencidas.length}</dd></div>
            <div className="flex flex-col items-end"><dt>Eventos hoy</dt><dd className="cr-cifra text-[30px] leading-none text-tinta">{eventosHoy.length}</dd></div>
          </dl>
        </div>

        <section className="cr-vidrio flex flex-col gap-3 rounded-[26px] p-4 sm:p-5" aria-label="Zaelyn">
          <div className="flex items-start gap-3.5">
            <span className="z-orbe respira mt-0.5 size-9 flex-none" aria-hidden="true" />
            <div className="flex min-w-0 flex-col gap-1 text-[15px] leading-[1.5]">
              <p className="m-0">{resumen}</p>
              {d.foco && <p className="m-0 text-tinta-2">{d.foco.texto}{d.foco.porque && ` · ${d.foco.porque}`}</p>}
              {d.avisos.map((a, i) => <p key={i} className="m-0 text-[14px] text-tinta-2">{a}</p>)}
            </div>
          </div>
          <form onSubmit={e => { e.preventDefault(); mandar(frase) }} className="flex items-center gap-2 rounded-full bg-superficie py-1 pr-1 pl-4 shadow-[inset_0_0_0_1px_var(--z-line)]">
            <input
              id="dile-a-zaelyn"
              value={frase}
              onChange={e => setFrase(e.target.value)}
              placeholder="Dile a Zaelyn qué necesitas…"
              className="min-w-0 flex-1 border-0 bg-transparent py-2 text-[15px] text-tinta outline-none placeholder:text-tinta-3"
              aria-label="Dile a Zaelyn"
            />
            <button type="submit" aria-label="Enviar" className="grid size-9 flex-none cursor-pointer place-items-center rounded-full border-0 bg-[color-mix(in_srgb,var(--z-ink)_7%,transparent)] text-tinta hover:bg-[color-mix(in_srgb,var(--z-ink)_12%,transparent)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </form>
          <div className="flex flex-wrap gap-x-1 gap-y-1">
            {acciones.map(([t, f]) => (
              <button key={t} type="button" onClick={f} className="h-8 cursor-pointer rounded-full border-0 bg-transparent px-3 text-[13.5px] text-tinta-2 hover:bg-[color-mix(in_srgb,var(--z-ink)_5%,transparent)] hover:text-tinta">{t}</button>
            ))}
          </div>
        </section>
      </header>

      {/* ── 2 · una sola barra ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmento et="Alcance" opciones={[['hoy', 'Hoy'], ['semana', 'Semana'], ['mes', 'Mes']]} valor={alcance} alElegir={setAlcance} />
        <div className="flex items-center gap-2">
          <details className="relative">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-full px-4 text-[13.5px] text-tinta-2 hover:bg-[color-mix(in_srgb,var(--z-ink)_5%,transparent)] [&::-webkit-details-marker]:hidden">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
              Filtrar{filtros > 0 && <span className="text-tinta">· {filtros}</span>}
            </summary>
            <div className="cr-vidrio cr-panel absolute right-0 z-40 mt-2 flex w-[300px] flex-col gap-4 rounded-[20px] p-4 text-[13.5px]" style={{ accentColor: 'var(--z-ink)' }}>
              <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
                <legend className="mb-1 p-0 text-[12px] font-semibold text-tinta-3">Espacios</legend>
                {lugares.map(([lugar, espacio]) => (
                  <label key={lugar} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-1.5 py-1 hover:bg-sel">
                    <input type="checkbox" checked={!fuera.has(lugar)} onChange={() => setFuera(s => alternar(s, lugar))} />
                    <Punto espacio={espacio} /><span className="truncate">{lugar}</span>
                  </label>
                ))}
              </fieldset>
              <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
                <legend className="mb-1 p-0 text-[12px] font-semibold text-tinta-3">Tipo</legend>
                {(Object.keys(TIPO) as Tipo[]).map(t => (
                  <label key={t} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-1.5 py-1 hover:bg-sel">
                    <input type="checkbox" checked={tipos.size === 0 || tipos.has(t)} onChange={() => setTipos(s => alternar(s.size ? s : new Set(), t))} />
                    {TIPO[t]}
                  </label>
                ))}
              </fieldset>
              <fieldset className="m-0 flex flex-col gap-1 border-0 p-0">
                <legend className="mb-1 p-0 text-[12px] font-semibold text-tinta-3">Estado</legend>
                {([['todo', 'Todo'], ['pendiente', 'Pendiente'], ['vencido', 'Vencido'], ['hecho', 'Hecho']] as Array<[Estado, string]>).map(([k, t]) => (
                  <label key={k} className="flex cursor-pointer items-center gap-2.5 rounded-[10px] px-1.5 py-1 hover:bg-sel">
                    <input type="radio" name="estado" checked={estado === k} onChange={() => setEstado(k)} />{t}
                  </label>
                ))}
              </fieldset>
              {filtros > 0 && (
                <button type="button" onClick={() => { setFuera(new Set()); setTipos(new Set()); setEstado('todo') }}
                  className="h-9 cursor-pointer rounded-full border-0 bg-[color-mix(in_srgb,var(--z-ink)_6%,transparent)] text-[13px] text-tinta">Quitar filtros</button>
              )}
            </div>
          </details>
          <Segmento et="Cómo verlo" opciones={[['lista', 'Lista'], ['calendario', 'Calendario'], ['tarjetas', 'Tarjetas']]} valor={vista} alElegir={setVista} />
        </div>
      </div>

      {/* ── 3 · todo, una sola vez ── */}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-5">
          {visibles.length === 0 && (
            <section className="cr-vidrio rounded-[24px] px-6 py-12 text-center text-[15px] text-tinta-2">
              Nada aquí{filtros ? ' con estos filtros' : ''}. Si se te ocurre algo, díselo a Zaelyn.
            </section>
          )}

          {vista === 'lista' && secciones.map(s => (
            <Panel key={s.t} titulo={s.t} nota={String(s.cosas.length)}>
              <ul className="m-0 flex list-none flex-col p-0">
                {(alcance === 'hoy' && s.t !== 'Vencido' ? s.cosas.map(c => ({ ...c, mas: 0 })) : juntar(s.cosas)).map(c => (
                  <Renglon key={c.clave} c={c} alAbrir={abrir} cuando={s.cuando} hoy={d.hoy} />
                ))}
              </ul>
            </Panel>
          ))}

          {vista === 'tarjetas' && (
            <div className="grid gap-5 xl:grid-cols-2">
              {lugares.filter(([l]) => !fuera.has(l)).map(([lugar, espacio]) => {
                const suyas = visibles.filter(c => c.lugar === lugar)
                if (!suyas.length) return null
                const p = espacio === 'proyecto' ? d.proyectos.find(x => x.nombre === lugar) : undefined
                const href = p?.href ?? (espacio === 'familia' ? d.casa.find(f => f.familia === lugar)?.href : espacio === 'grupo' ? d.grupos?.find(g => g.nombre === lugar)?.href : espacio === 'personal' ? d.hrefs.personal : undefined)
                return (
                  <Panel key={lugar} titulo={lugar} nota={p ? `${p.abiertos} abiertas${p.vencidos ? ` · ${p.vencidos} vencidas` : ''}` : `${suyas.filter(c => !c.hecho).length}`} href={href}>
                    <ul className="m-0 flex list-none flex-col p-0">
                      {juntar(suyas).slice(0, 7).map(c => <Renglon key={c.clave} c={c} alAbrir={abrir} cuando="dia" hoy={d.hoy} compacto />)}
                    </ul>
                  </Panel>
                )
              })}
            </div>
          )}

          {vista === 'calendario' && (alcance !== 'mes' ? (
            <div className="cr-vidrio overflow-x-auto rounded-[24px] p-3">
              <div className="grid min-w-[840px] grid-cols-7 gap-2">
                {Array.from({ length: 7 }, (_, i) => sumar(d.hoy, i)).map(dia => {
                  const suyas = visibles.filter(c => c.dia === dia || (dia === d.hoy && c.vencida && !c.hecho)).sort(porHora)
                  return (
                    <section key={dia} className={`flex min-h-[340px] flex-col gap-1.5 rounded-[18px] p-2 ${dia === d.hoy ? 'bg-[color-mix(in_srgb,var(--z-ink)_4%,transparent)]' : ''}`}>
                      <h2 className={`px-1.5 pb-1 text-[13px] ${dia === d.hoy ? 'font-semibold text-tinta' : 'text-tinta-2'}`}>{dia === d.hoy ? 'Hoy' : diaCorto(dia)}</h2>
                      {suyas.map(c => (
                        <button key={c.clave} type="button" onClick={() => abrir(c)}
                          className="flex cursor-pointer flex-col items-start gap-0.5 rounded-[12px] border-0 bg-superficie px-2.5 py-2 text-left shadow-z1">
                          <span className="flex items-center gap-1.5 text-[11.5px] text-tinta-3 tabular-nums"><Punto espacio={c.espacio} />{c.vencida && !c.hecho ? 'Vencido' : c.hora ?? 'Sin hora'}</span>
                          <span className={`line-clamp-2 text-[13px] leading-[1.3] text-tinta ${c.hecho ? 'line-through opacity-60' : ''}`}>{c.titulo}</span>
                        </button>
                      ))}
                    </section>
                  )
                })}
              </div>
            </div>
          ) : (() => {
            const primero = `${d.hoy.slice(0, 8)}01`
            const inicio = sumar(primero, -((diaSemana(primero) + 6) % 7))
            const celdas = Array.from({ length: 42 }, (_, i) => sumar(inicio, i))
            return (
              <div className="cr-vidrio overflow-x-auto rounded-[24px] p-3">
                <div className="grid min-w-[760px] grid-cols-7 gap-1.5">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(x => <span key={x} className="px-2 pb-1 text-[12px] text-tinta-3">{x}</span>)}
                  {celdas.map(dia => {
                    const suyas = visibles.filter(c => c.dia === dia).sort(porHora)
                    return (
                      <div key={dia} className={`flex min-h-[92px] flex-col gap-1 rounded-[12px] p-1.5 ${dia === d.hoy ? 'bg-[color-mix(in_srgb,var(--z-ink)_6%,transparent)]' : 'bg-[color-mix(in_srgb,var(--z-ink)_2.5%,transparent)]'} ${dia.slice(0, 7) !== d.hoy.slice(0, 7) ? 'opacity-40' : ''}`}>
                        <span className={`px-1 text-[12px] tabular-nums ${dia === d.hoy ? 'font-semibold text-tinta' : 'text-tinta-2'}`}>{Number(dia.slice(8, 10))}</span>
                        {suyas.slice(0, 3).map(c => (
                          <button key={c.clave} type="button" onClick={() => abrir(c)} title={`${c.titulo} · ${c.lugar}`}
                            className="flex cursor-pointer items-center gap-1.5 rounded-[8px] border-0 bg-superficie px-1.5 py-1 text-left text-[11.5px] text-tinta">
                            <Punto espacio={c.espacio} /><span className="truncate">{c.titulo}</span>
                          </button>
                        ))}
                        {suyas.length > 3 && <span className="px-1 text-[11px] text-tinta-3">+{suyas.length - 3} más</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })())}
        </div>

        {/* ── lo que no es una cosa por hacer ── */}
        <aside className="flex flex-col gap-5">
          {d.habitos.length > 0 && (
            <Panel titulo="Hábitos de hoy" href={`${d.hrefs.personal}?v=habitos`} mas="Ver">
              <ul className="m-0 flex list-none flex-col gap-3 px-3 pb-1">
                {d.habitos.map(h => {
                  const pct = h.meta > 0 ? Math.min(100, Math.round((h.hoy / h.meta) * 100)) : 0
                  return (
                    <li key={h.nombre} className="flex flex-col gap-1.5">
                      <span className="flex items-baseline justify-between gap-2 text-[14px]">
                        <span className="truncate first-letter:uppercase">{h.nombre}</span>
                        <span className="flex-none text-[12px] text-tinta-3 tabular-nums">{h.hoy}/{h.meta}{h.unidad ? ` ${h.unidad}` : ''}{h.racha > 1 ? ` · ${h.racha} días` : ''}</span>
                      </span>
                      <span className="h-1 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--z-ink)_8%,transparent)]">
                        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--z-personal)' }} />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Panel>
          )}

          {d.fechas.length > 0 && (
            <Panel titulo="Fechas que vienen">
              <ul className="m-0 flex list-none flex-col gap-2 px-3 pb-1">
                {d.fechas.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="min-w-0 truncate">{f.titulo}</span>
                    <span className="flex-none text-[12px] text-tinta-3">{f.faltan === 0 ? 'Hoy' : f.faltan === 1 ? 'Mañana' : f.cuando}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {d.proyectos.length > 0 && (
            <Panel titulo="Proyectos" href={d.hrefs.proyectos} mas="Todos">
              <ul className="m-0 flex list-none flex-col p-0">
                {d.proyectos.slice(0, 6).map(p => (
                  <li key={p.href}>
                    <Link href={p.href} className="flex items-center gap-3 rounded-[12px] px-3 py-2 text-tinta no-underline hover:bg-[color-mix(in_srgb,var(--z-ink)_4%,transparent)]">
                      <Punto espacio="proyecto" />
                      <span className="min-w-0 flex-1 truncate text-[14px]">{p.nombre}</span>
                      <span className="flex-none text-[12px] text-tinta-3 tabular-nums">
                        {p.abiertos}{p.vencidos > 0 && <span className="text-det-tinta"> · {p.vencidos} venc.</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          {d.apps.length > 0 && (
            <Panel titulo="Módulos" href={d.hrefs.apps} mas="Ver">
              <ul className="m-0 flex list-none flex-col p-0">
                {d.apps.map(a => (
                  <li key={a.clave}>
                    <button type="button" onClick={() => a.estado === 'encendido' ? mandar(`¿Qué tengo en ${a.nombre}?`) : undefined}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-[12px] border-0 bg-transparent px-3 py-2 text-left text-tinta hover:bg-[color-mix(in_srgb,var(--z-ink)_4%,transparent)]">
                      <Punto espacio="app" />
                      <span className="min-w-0 flex-1 truncate text-[14px]">{a.nombre}</span>
                      <span className="flex-none text-[12px] text-tinta-3">{a.estado === 'encendido' ? 'Preguntar ›' : a.estado === 'pronto' ? 'Pronto' : 'Encender'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </aside>
      </div>

      {aviso && (
        <div role="status" className="cr-vidrio cr-panel fixed bottom-24 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 rounded-full px-5 py-3 text-[14px] lg:bottom-8">
          {aviso}
        </div>
      )}
    </main>
  )
}
