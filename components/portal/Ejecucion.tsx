'use client'

/**
 * El dashboard integral de Inicio (decisiones/2026-11-11-inicio-de-ejecucion y
 * decisiones/2026-11-13-planes-por-ambito).
 *
 * Una sola foto de lo que la persona tiene contratado, con cuatro formas de
 * verla, que se recuerdan en el navegador:
 * - **Tableros** (de entrada): una tarjeta por ámbito y módulo.
 * - **Calendario**: semana y mes.
 * - **Lista**: agrupada por fecha.
 * - **Kanban**: por hacer, en curso y hecho, solo con lo propio.
 *
 * Los filtros son los mismos en las cuatro: espacio (cada uno con su nombre),
 * tipo, fecha y estado. Cada renglón dice de qué espacio es: lo de un ámbito
 * nunca se mezcla sin decir de cuál viene.
 *
 * El portal no cambia nada por su cuenta. Tocar una cosa la abre en la
 * conversación con Zaelyn (`POST /portal/chat/abrir`), y «+ Nuevo» pone la
 * frase en «Dile a Zaelyn»: el Core es quien escribe.
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
  /** evento con hora: va también en la agenda del día */
  esEvento: boolean
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
  /** Grupos de trabajo (Profesional): sin avance de los demás. */
  grupos?: Array<{ nombre: string; href: string }>
  apps: Array<{ clave: string; nombre: string; estado: 'encendido' | 'apagado' | 'pronto' }>
  /** Lo contratado: el plan y lo que está apagado con el plan que lo trae. */
  contratado?: { plan: string | null; apagado: Array<{ que: string; plan: string }> }
  hrefs: { personal: string; familia: string; proyectos: string; apps: string; calendario: string }
  ejemplo?: boolean
  /** Lo que el motor todavía no manda; se dice, no se inventa. */
  faltan?: string[]
}

const COLOR: Record<Espacio, string> = {
  personal: 'var(--z-personal)',
  familia: 'var(--z-familia)',
  grupo: '#2f9c95',
  proyecto: 'var(--z-proyectos)',
  app: '#b4690e',
}
const TIPOS: Array<[Tipo, string]> = [['recordatorio', 'Recordatorios'], ['evento', 'Eventos'], ['pendiente', 'Pendientes'], ['actividad', 'Actividades']]

type Vista = 'tableros' | 'calendario' | 'lista' | 'kanban'
type Fecha = 'todo' | 'hoy' | 'semana' | 'mes'
type Estado = 'todo' | 'pendiente' | 'hecho' | 'vencido'
const VISTAS: Array<[Vista, string]> = [['tableros', 'Tableros'], ['calendario', 'Calendario'], ['lista', 'Lista'], ['kanban', 'Kanban']]
const LLAVE_VISTA = 'zaelyn.inicio.vista'

// ── fechas, solo para acomodar ───────────────────────────────────────────────
const sumar = (iso: string, n: number) => {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}
const diaSemana = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay()
}
const DIA_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const diaCorto = (iso: string) => `${DIA_CORTO[diaSemana(iso)]} ${Number(iso.slice(8, 10))}`
const minutos = (h: string | null) => {
  if (!h) return 24 * 60
  const [hh, mm] = h.split(':').map(Number)
  return (hh ?? 0) * 60 + (mm ?? 0)
}
const porHora = (a: Cosa, b: Cosa) => Number(a.hecho) - Number(b.hecho) || (a.dia ?? '9').localeCompare(b.dia ?? '9') || minutos(a.hora) - minutos(b.hora)

type Grupo = { clave: string; titulo: string; cosas: Cosa[] }

function agrupar(cosas: Cosa[], hoy: string): Grupo[] {
  const manana = sumar(hoy, 1)
  const fin = sumar(hoy, 7)
  const g: Record<string, Cosa[]> = { vencido: [], hoy: [], manana: [], semana: [], despues: [], sinFecha: [] }
  for (const c of cosas) {
    if (c.vencida && !c.hecho) g.vencido!.push(c)
    else if (!c.dia) g.sinFecha!.push(c)
    else if (c.dia <= hoy) g.hoy!.push(c)
    else if (c.dia === manana) g.manana!.push(c)
    else if (c.dia <= fin) g.semana!.push(c)
    else g.despues!.push(c)
  }
  return [
    { clave: 'vencido', titulo: 'Vencido', cosas: g.vencido!.sort(porHora) },
    { clave: 'hoy', titulo: 'Hoy', cosas: g.hoy!.sort(porHora) },
    { clave: 'manana', titulo: 'Mañana', cosas: g.manana!.sort(porHora) },
    { clave: 'semana', titulo: 'Esta semana', cosas: g.semana!.sort(porHora) },
    { clave: 'despues', titulo: 'Más adelante', cosas: g.despues!.sort(porHora) },
    { clave: 'sinFecha', titulo: 'Sin fecha', cosas: g.sinFecha! },
  ].filter(x => x.cosas.length > 0)
}

// ── piezas ───────────────────────────────────────────────────────────────────
function Punto({ espacio, grande }: { espacio: Espacio; grande?: boolean }) {
  const c = COLOR[espacio]
  return (
    <span
      className={`${grande ? 'size-2.5' : 'size-2'} flex-none rounded-full`}
      style={{ background: c, boxShadow: `0 0 0 4px color-mix(in srgb, ${c} 16%, transparent)` }}
      aria-hidden="true"
    />
  )
}

function Palomita({ hecho, alTocar, titulo }: { hecho: boolean; alTocar: () => void; titulo: string }) {
  return (
    <button
      type="button"
      onClick={e => { e.stopPropagation(); alTocar() }}
      className={`grid size-[22px] flex-none cursor-pointer place-items-center rounded-full border-[1.5px] transition-colors ${hecho
        ? 'border-tinta bg-tinta text-superficie'
        : 'border-[color-mix(in_srgb,var(--z-ink)_28%,transparent)] bg-transparent text-transparent hover:border-tinta hover:text-tinta-3'}`}
      aria-label={hecho ? `«${titulo}» está hecha` : `Marcar «${titulo}»`}
      title={hecho ? 'Hecha' : 'Marcar como hecha (Zaelyn te lo confirma)'}
    >
      <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true"><path d="M2.5 6.2 5 8.5l4.5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </button>
  )
}

function Etiqueta({ c }: { c: Cosa }) {
  return (
    <span className="flex flex-none items-center gap-2 text-[12.5px] text-tinta-2">
      <Punto espacio={c.espacio} />
      <span className="max-w-[160px] truncate">{c.lugar}</span>
    </span>
  )
}

function Renglon({ c, alAbrir, conDia, compacto }: { c: Cosa; alAbrir: (c: Cosa) => void; conDia?: boolean; compacto?: boolean }) {
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={() => alAbrir(c)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alAbrir(c) } }}
        className="group flex cursor-pointer items-center gap-4 rounded-[16px] px-3 py-3 transition-colors hover:bg-[color-mix(in_srgb,var(--z-ink)_4%,transparent)]"
      >
        <Palomita hecho={c.hecho} titulo={c.titulo} alTocar={() => alAbrir(c)} />
        <span className="w-[52px] flex-none text-[13px] text-tinta-3 tabular-nums">
          {c.vencida && !c.hecho && conDia ? 'Vencido' : conDia && c.dia ? diaCorto(c.dia) : c.hora ?? ''}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={`truncate text-[15.5px] ${c.hecho ? 'text-tinta-3 line-through decoration-[1px]' : ''}`}>{c.titulo}</span>
          {(c.quien || c.avance !== null || compacto) && (
            <span className="truncate text-[12.5px] text-tinta-3">
              {[compacto ? c.lugar : null, c.quien, c.avance !== null ? `${c.avance}%` : null].filter(Boolean).join(' · ')}
            </span>
          )}
        </span>
        {!compacto && <span className="hidden sm:flex"><Etiqueta c={c} /></span>}
        <span className="flex-none text-[13px] text-tinta-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true">›</span>
      </div>
    </li>
  )
}

function Caja({ titulo, children, href, mas }: { titulo: string; children: React.ReactNode; href?: string; mas?: string }) {
  return (
    <section className="cr-vidrio flex flex-col gap-3 rounded-[24px] px-5 py-5">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-[13px] font-semibold tracking-[0.04em] text-tinta-2 uppercase">{titulo}</h2>
        {href && <Link href={href} className="text-[12.5px] text-tinta-3 no-underline hover:text-tinta">{mas ?? 'Ver todo'} ›</Link>}
      </header>
      {children}
    </section>
  )
}

function Tablero({ titulo, espacio, cuenta, href, i, children }: { titulo: string; espacio: Espacio; cuenta?: number; href?: string; i: number; children: React.ReactNode }) {
  return (
    <section className="cr-tarjeta cr-flota flex flex-col gap-3 p-6" style={{ ['--cr-d' as string]: `${-i * 2.5}s` }}>
      <span className="cr-brillo" aria-hidden="true" />
      <header className="flex items-center gap-2.5">
        <Punto espacio={espacio} grande />
        <h2 className="cr-titulo min-w-0 flex-1 truncate text-[24px]">{titulo}</h2>
        {cuenta !== undefined && <span className="text-[13px] text-tinta-3 tabular-nums">{cuenta}</span>}
        {href && <Link href={href} className="text-[12.5px] text-tinta-3 no-underline hover:text-tinta">Abrir ›</Link>}
      </header>
      {children}
    </section>
  )
}

function Chip({ on, alTocar, children }: { on: boolean; alTocar: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={alTocar} aria-pressed={on} className={`cr-chip flex cursor-pointer items-center gap-2 ${on ? '!bg-tinta !text-superficie' : ''}`}>
      {children}
    </button>
  )
}

function Botones<T extends string>({ et, opciones, valor, alElegir, activo }: { et: string; opciones: Array<[T, string]>; valor?: T; alElegir: (x: T) => void; activo?: (x: T) => boolean }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5" role="group" aria-label={et}>
      {opciones.map(([k, t]) => {
        const on = activo ? activo(k) : valor === k
        return (
          <button key={k} type="button" onClick={() => alElegir(k)} aria-pressed={on}
            className={`h-8 cursor-pointer rounded-full border-0 px-3 ${on ? 'bg-tinta text-superficie' : 'bg-transparent text-tinta-2 hover:bg-sel'}`}>{t}</button>
        )
      })}
    </span>
  )
}

// ── la pantalla ──────────────────────────────────────────────────────────────
export function Ejecucion({ d }: { d: DatosEjecucion }) {
  const [vista, setVista] = useState<Vista>('tableros')
  const [mes, setMes] = useState(false)
  const [fuera, setFuera] = useState<Set<string>>(new Set())
  const [tipos, setTipos] = useState<Set<Tipo>>(new Set())
  const [fecha, setFecha] = useState<Fecha>('todo')
  const [estado, setEstado] = useState<Estado>('todo')
  const [aviso, setAviso] = useState<string | null>(null)
  const [pregunta, setPregunta] = useState('')

  // La vista se recuerda por persona en este navegador.
  useEffect(() => {
    try {
      const v = window.localStorage.getItem(LLAVE_VISTA)
      if (v && VISTAS.some(([x]) => x === v)) setVista(v as Vista)
    } catch { /* sin almacenamiento: se queda en Tableros */ }
  }, [])
  const elegirVista = (v: Vista) => {
    setVista(v)
    try { window.localStorage.setItem(LLAVE_VISTA, v) } catch { /* nada */ }
  }

  // Los espacios con su nombre, para el filtro.
  const lugares = useMemo(() => {
    const m = new Map<string, Espacio>()
    for (const c of d.cosas) if (!m.has(c.lugar)) m.set(c.lugar, c.espacio)
    const orden: Espacio[] = ['personal', 'familia', 'grupo', 'proyecto', 'app']
    return [...m.entries()].sort((a, b) => orden.indexOf(a[1]) - orden.indexOf(b[1]) || a[0].localeCompare(b[0]))
  }, [d.cosas])

  const visibles = useMemo(() => {
    const finSemana = sumar(d.hoy, 6)
    const finMes = sumar(d.hoy, 30)
    return d.cosas.filter(c => {
      if (fuera.has(c.lugar)) return false
      if (tipos.size && !tipos.has(c.tipo)) return false
      if (estado === 'hecho' && !c.hecho) return false
      if (estado === 'pendiente' && (c.hecho || c.vencida)) return false
      if (estado === 'vencido' && !(c.vencida && !c.hecho)) return false
      if (fecha !== 'todo') {
        const dia = c.vencida && !c.hecho ? d.hoy : c.dia
        if (!dia) return false
        if (fecha === 'hoy' && dia > d.hoy) return false
        if (fecha === 'semana' && dia > finSemana) return false
        if (fecha === 'mes' && dia > finMes) return false
      }
      return true
    })
  }, [d.cosas, d.hoy, fuera, tipos, estado, fecha])

  const grupos = useMemo(() => agrupar(visibles, d.hoy), [visibles, d.hoy])
  const deHoy = d.cosas.filter(c => !c.hecho && (c.vencida || (c.dia !== null && c.dia <= d.hoy)))
  const vencidas = d.cosas.filter(c => c.vencida && !c.hecho).length
  const agendaHoy = d.cosas.filter(c => c.esEvento && c.dia === d.hoy).sort((a, b) => minutos(a.hora) - minutos(b.hora))

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

  /** «+ Nuevo»: pone la frase en «Dile a Zaelyn» para que la persona la termine. */
  const nuevo = (frase: string) => {
    setPregunta(frase)
    const caja = document.getElementById('dile-a-zaelyn') as HTMLInputElement | null
    caja?.focus()
    caja?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const preguntar = (e: React.FormEvent) => {
    e.preventDefault()
    const t = pregunta.trim()
    if (!t) return
    if (d.ejemplo) { decir('En tu cuenta, esto se lo dices a Zaelyn y la pantalla se mueve con la respuesta.'); return }
    window.dispatchEvent(new CustomEvent('zaelyn:preguntar', { detail: { texto: t, contexto: 'Inicio' } }))
    window.dispatchEvent(new Event('zaelyn:abrir-chat'))
    setPregunta('')
  }

  const alternar = <T,>(s: Set<T>, x: T) => { const n = new Set(s); if (n.has(x)) n.delete(x); else n.add(x); return n }
  const semana = Array.from({ length: 7 }, (_, i) => sumar(d.hoy, i))

  // Tableros: Hoy, una tarjeta por espacio con nombre y una por módulo.
  const tableros: Array<{ titulo: string; espacio: Espacio; cosas: Cosa[]; href?: string }> = [
    { titulo: 'Hoy', espacio: 'personal', cosas: visibles.filter(c => (c.vencida && !c.hecho) || c.dia === d.hoy) },
    ...lugares.filter(([lugar]) => !fuera.has(lugar)).map(([lugar, espacio]) => ({
      titulo: lugar === 'Personal' ? 'Personal y Metas' : lugar,
      espacio,
      cosas: visibles.filter(c => c.lugar === lugar),
      href: espacio === 'proyecto' ? d.proyectos.find(p => p.nombre === lugar)?.href
        : espacio === 'familia' ? d.casa.find(f => f.familia === lugar)?.href
          : espacio === 'grupo' ? d.grupos?.find(g => g.nombre === lugar)?.href
            : espacio === 'personal' ? d.hrefs.personal : undefined,
    })),
  ]
  const frases = ['Recuérdame ', 'Nueva actividad: ', 'Nuevo evento: ', 'Nueva meta: ', ...d.proyectos.slice(0, 1).map(p => `Nueva actividad en ${p.nombre}: `)]

  return (
    <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 pt-10 pb-28 text-tinta sm:px-10">
      {/* ── encabezado ── */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="flex flex-col gap-2">
            <span className="text-[12.5px] tracking-[0.06em] text-tinta-3 uppercase">{d.fecha}</span>
            <h1 className="!text-[38px] leading-[1.02] sm:!text-[52px]">
              {d.saludo}{d.quien && <>, <span className="cr-cursiva">{d.quien}</span></>}
            </h1>
          </div>
          <dl className="flex flex-wrap gap-x-7 gap-y-2 text-[13px] text-tinta-2">
            <div className="flex flex-col"><dt>Por hacer hoy</dt><dd className="cr-cifra text-[34px] leading-none text-tinta">{deHoy.length}</dd></div>
            <div className="flex flex-col"><dt>Vencido</dt><dd className={`cr-cifra text-[34px] leading-none ${vencidas ? 'text-det-tinta' : 'text-tinta'}`}>{vencidas}</dd></div>
            <div className="flex flex-col"><dt>Eventos hoy</dt><dd className="cr-cifra text-[34px] leading-none text-tinta">{agendaHoy.length}</dd></div>
          </dl>
        </div>

        {/* lo contratado */}
        {(d.contratado?.plan || d.apps.some(a => a.estado === 'encendido') || (d.contratado?.apagado.length ?? 0) > 0) && (
          <div className="flex flex-wrap items-center gap-2" aria-label="Lo que tienes contratado">
            {d.contratado?.plan && <span className="cr-chip !bg-tinta !text-superficie">{d.contratado.plan}</span>}
            {d.apps.filter(a => a.estado === 'encendido').map(a => <span key={a.clave} className="cr-chip">{a.nombre}</span>)}
            {d.contratado?.apagado.map(x => (
              <Link key={x.que} href={d.ejemplo ? '/precios' : '/app/plan'} className="cr-chip flex items-center gap-1.5 text-tinta-3 no-underline" title={`Lo trae ${x.plan}`}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
                {x.que} · Contratar
              </Link>
            ))}
          </div>
        )}

        {(d.foco || d.avisos.length > 0) && (
          <div className="flex max-w-[860px] items-start gap-4">
            <span className="z-orbe respira size-11 flex-none" aria-hidden="true" />
            <div className="cr-vidrio flex flex-col gap-1.5 rounded-[24px] rounded-tl-[10px] px-5 py-4 text-[15.5px] leading-[1.5]">
              {d.foco && <p className="m-0">{d.foco.texto}{d.foco.porque && <span className="text-tinta-2"> · {d.foco.porque}</span>}</p>}
              {d.avisos.map((a, i) => <p key={i} className="m-0 text-[14px] text-tinta-2">{a}</p>)}
            </div>
          </div>
        )}

        <form onSubmit={preguntar} className="cr-vidrio flex max-w-[860px] items-center gap-3 rounded-full py-1.5 pr-1.5 pl-5">
          <input
            id="dile-a-zaelyn"
            value={pregunta}
            onChange={e => setPregunta(e.target.value)}
            placeholder="Dile a Zaelyn: «muévelo al viernes», «¿qué tiene Paula esta semana?», «recuérdame…»"
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-[15px] text-tinta outline-none placeholder:text-tinta-3"
            aria-label="Dile a Zaelyn"
          />
          <button type="submit" className="h-10 flex-none cursor-pointer rounded-full border-0 bg-tinta px-5 text-[14px] font-medium text-superficie">Enviar</button>
        </form>
        <div className="flex flex-wrap gap-2">
          {frases.map(f => (
            <button key={f} type="button" onClick={() => nuevo(f)} className="cr-chip cursor-pointer">+ {f.replace(/[:\s]+$/, '')}</button>
          ))}
        </div>
      </header>

      {/* ── controles ── */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Espacios">
            <Chip on={fuera.size === 0} alTocar={() => setFuera(new Set())}>Todo</Chip>
            {lugares.map(([lugar, espacio]) => (
              <Chip key={lugar} on={!fuera.has(lugar)} alTocar={() => setFuera(s => alternar(s, lugar))}>
                <Punto espacio={espacio} />{lugar}
                <span className="tabular-nums opacity-60">{d.cosas.filter(c => c.lugar === lugar && !c.hecho).length}</span>
              </Chip>
            ))}
          </div>
          <div className="cr-vidrio flex rounded-full p-1" role="group" aria-label="Cómo verlo">
            {VISTAS.map(([v, t]) => (
              <button
                key={v}
                type="button"
                onClick={() => elegirVista(v)}
                aria-pressed={vista === v}
                className={`h-9 cursor-pointer rounded-full border-0 px-4 text-[13.5px] ${vista === v ? 'bg-tinta text-superficie' : 'bg-transparent text-tinta-2'}`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-tinta-2">
          <Botones et="Tipo" opciones={TIPOS} activo={k => tipos.has(k)} alElegir={k => setTipos(s => alternar(s, k))} />
          <Botones et="Fecha" opciones={[['todo', 'Cuando sea'], ['hoy', 'Hoy'], ['semana', 'Semana'], ['mes', 'Mes']]} valor={fecha} alElegir={setFecha} />
          <Botones et="Estado" opciones={[['todo', 'Todo'], ['pendiente', 'Pendiente'], ['hecho', 'Hecho'], ['vencido', 'Vencido']]} valor={estado} alElegir={setEstado} />
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {visibles.length === 0 && vista !== 'tableros' && (
            <section className="cr-vidrio rounded-[24px] px-6 py-10 text-center text-[15px] text-tinta-2">
              Nada aquí con estos filtros. Si se te ocurre algo, díselo a Zaelyn: «recuérdame…».
            </section>
          )}

          {/* ── Tableros ── */}
          {vista === 'tableros' && (
            <div className="grid gap-5 xl:grid-cols-2">
              {tableros.map((t, i) => (
                <Tablero key={t.titulo} titulo={t.titulo} espacio={t.espacio} cuenta={t.cosas.filter(c => !c.hecho).length} href={t.href} i={i}>
                  {t.cosas.length === 0
                    ? <p className="m-0 text-[14px] text-tinta-3">Nada pendiente aquí.</p>
                    : (
                      <ul className="m-0 -mx-3 flex list-none flex-col p-0">
                        {[...t.cosas].sort(porHora).slice(0, 6).map(c => <Renglon key={c.clave} c={c} alAbrir={abrir} conDia={t.titulo !== 'Hoy'} compacto />)}
                      </ul>
                    )}
                </Tablero>
              ))}
              {d.apps.map((a, i) => (
                <Tablero key={a.clave} titulo={a.nombre} espacio="app" href={d.hrefs.apps} i={tableros.length + i}>
                  <p className="m-0 text-[14px] text-tinta-2">
                    {a.estado === 'encendido' ? 'Conectado. Pregúntale a Zaelyn cómo vas o qué tienes pendiente aquí.' : a.estado === 'pronto' ? 'Próximamente.' : 'Gratis desde Personal. Enciéndelo en Módulos.'}
                  </p>
                  {a.estado === 'encendido' && (
                    <button type="button" onClick={() => nuevo(`¿Qué tengo en ${a.nombre}?`)} className="cr-chip cursor-pointer self-start">Abrir en el chat</button>
                  )}
                </Tablero>
              ))}
            </div>
          )}

          {/* ── Lista ── */}
          {vista === 'lista' && grupos.map(g => (
            <section key={g.clave} className="cr-vidrio rounded-[24px] px-3 py-3">
              <h2 className="flex items-baseline gap-3 px-3 pt-2 pb-1">
                <span className={`cr-titulo text-[24px] ${g.clave === 'vencido' ? 'text-det-tinta' : ''}`}>{g.titulo}</span>
                <span className="text-[13px] text-tinta-3 tabular-nums">{g.cosas.length}</span>
              </h2>
              <ul className="m-0 flex list-none flex-col p-0">
                {g.cosas.map(c => <Renglon key={c.clave} c={c} alAbrir={abrir} conDia={g.clave !== 'hoy' && g.clave !== 'manana'} />)}
              </ul>
            </section>
          ))}

          {/* ── Kanban: solo lo propio, sin eventos ── */}
          {vista === 'kanban' && (
            <div className="grid gap-4 md:grid-cols-3">
              {([
                ['Por hacer', (c: Cosa) => !c.hecho && !(c.avance && c.avance > 0)],
                ['En curso', (c: Cosa) => !c.hecho && !!c.avance && c.avance > 0],
                ['Hecho', (c: Cosa) => c.hecho],
              ] as Array<[string, (c: Cosa) => boolean]>).map(([t, f]) => {
                const suyas = visibles.filter(c => c.tipo !== 'evento' && f(c)).sort(porHora)
                return (
                  <section key={t} className="cr-vidrio flex min-h-[260px] flex-col gap-2 rounded-[24px] p-3">
                    <h2 className="flex items-baseline gap-2 px-2 pt-1"><span className="cr-titulo text-[22px]">{t}</span><span className="text-[13px] text-tinta-3">{suyas.length}</span></h2>
                    {suyas.map(c => (
                      <button key={c.clave} type="button" onClick={() => abrir(c)}
                        className="flex cursor-pointer flex-col items-start gap-1.5 rounded-[14px] border-0 bg-superficie px-3 py-2.5 text-left shadow-z1"
                        style={{ boxShadow: `inset 3px 0 0 ${COLOR[c.espacio]}` }}>
                        <span className={`text-[14px] leading-[1.3] text-tinta ${c.hecho ? 'line-through opacity-60' : ''}`}>{c.titulo}</span>
                        <span className="flex w-full items-center justify-between gap-2 text-[12px] text-tinta-3">
                          <span className="truncate">{c.lugar}</span>
                          <span className="flex-none tabular-nums">{c.vencida && !c.hecho ? 'Vencido' : c.dia ? diaCorto(c.dia) : ''}{c.avance ? ` · ${c.avance}%` : ''}</span>
                        </span>
                      </button>
                    ))}
                  </section>
                )
              })}
            </div>
          )}

          {/* ── Calendario ── */}
          {vista === 'calendario' && (
            <div className="flex flex-col gap-3">
              <div className="self-end text-[13px]">
                <Botones et="Calendario" opciones={[['semana', 'Semana'], ['mes', 'Mes']]} valor={mes ? 'mes' : 'semana'} alElegir={x => setMes(x === 'mes')} />
              </div>
              {!mes ? (
                <div className="cr-vidrio overflow-x-auto rounded-[24px] p-3">
                  <div className="grid min-w-[840px] grid-cols-7 gap-2">
                    {semana.map(dia => {
                      const suyas = visibles.filter(c => (c.dia === dia) || (dia === d.hoy && c.vencida && !c.hecho))
                        .sort((a, b) => Number(b.vencida && !b.hecho) - Number(a.vencida && !a.hecho) || minutos(a.hora) - minutos(b.hora))
                      return (
                        <section key={dia} className={`flex min-h-[320px] flex-col gap-2 rounded-[18px] p-2.5 ${dia === d.hoy ? 'bg-[color-mix(in_srgb,var(--cr-acento,#8b7fd6)_10%,transparent)]' : ''}`}>
                          <h2 className={`px-1 text-[13px] ${dia === d.hoy ? 'font-semibold text-tinta' : 'text-tinta-2'}`}>{dia === d.hoy ? 'Hoy' : diaCorto(dia)}</h2>
                          {suyas.map(c => (
                            <button key={c.clave} type="button" onClick={() => abrir(c)}
                              className="flex cursor-pointer flex-col items-start gap-1 rounded-[12px] border-0 bg-superficie px-2.5 py-2 text-left shadow-z1"
                              style={{ boxShadow: `inset 3px 0 0 ${COLOR[c.espacio]}` }}>
                              <span className="text-[11.5px] text-tinta-3 tabular-nums">{c.vencida && !c.hecho ? 'Vencido' : c.hora ?? 'Todo el día'}</span>
                              <span className={`line-clamp-3 text-[13px] leading-[1.3] text-tinta ${c.hecho ? 'line-through opacity-60' : ''}`}>{c.titulo}</span>
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
                    <h2 className="cr-titulo px-2 pb-2 text-[22px]">{MESES[Number(d.hoy.slice(5, 7)) - 1]}</h2>
                    <div className="grid min-w-[760px] grid-cols-7 gap-1.5">
                      {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(x => <span key={x} className="px-2 text-[12px] text-tinta-3">{x}</span>)}
                      {celdas.map(dia => {
                        const suyas = visibles.filter(c => c.dia === dia).sort(porHora)
                        const otroMes = dia.slice(0, 7) !== d.hoy.slice(0, 7)
                        return (
                          <div key={dia} className={`flex min-h-[96px] flex-col gap-1 rounded-[12px] p-1.5 ${dia === d.hoy ? 'bg-[color-mix(in_srgb,var(--cr-acento,#8b7fd6)_12%,transparent)]' : 'bg-[color-mix(in_srgb,var(--z-ink)_3%,transparent)]'} ${otroMes ? 'opacity-45' : ''}`}>
                            <span className="px-1 text-[12px] text-tinta-2 tabular-nums">{Number(dia.slice(8, 10))}</span>
                            {suyas.slice(0, 3).map(c => (
                              <button key={c.clave} type="button" onClick={() => abrir(c)} title={`${c.titulo} · ${c.lugar}`}
                                className="flex cursor-pointer items-center gap-1.5 truncate rounded-[8px] border-0 bg-superficie px-1.5 py-1 text-left text-[11.5px] text-tinta">
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
              })()}
            </div>
          )}
        </div>

        {/* ── el contexto del día ── */}
        <aside className="flex flex-col gap-5">
          <Caja titulo="Agenda de hoy" href={d.hrefs.calendario} mas="Calendario">
            {agendaHoy.length === 0
              ? <p className="m-0 text-[14px] text-tinta-3">Sin eventos con hora.</p>
              : (
                <ol className="m-0 flex list-none flex-col gap-0 p-0">
                  {agendaHoy.map(c => (
                    <li key={c.clave} className="relative flex gap-3 border-l border-[color-mix(in_srgb,var(--z-ink)_12%,transparent)] py-2 pl-4">
                      <span className="absolute top-[14px] -left-[4.5px] size-2 rounded-full" style={{ background: COLOR[c.espacio] }} aria-hidden="true" />
                      <span className="w-11 flex-none text-[13px] text-tinta-3 tabular-nums">{c.hora}</span>
                      <span className="min-w-0 text-[14px] leading-[1.35]">{c.titulo}</span>
                    </li>
                  ))}
                </ol>
              )}
          </Caja>

          {d.casa.map(f => (
            <Caja key={f.familia} titulo={f.familia} href={f.href} mas="La familia">
              {f.cosas.length === 0
                ? <p className="m-0 text-[14px] text-tinta-3">Hoy no hay actividades.</p>
                : (
                  <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                    {f.cosas.map((x, i) => (
                      <li key={i} className="flex gap-3 text-[14px]">
                        <span className="w-11 flex-none text-[13px] text-tinta-3 tabular-nums">{x.hora ?? ''}</span>
                        <span className="flex min-w-0 flex-col">
                          <span>{x.quien && <b className="font-semibold">{x.quien} · </b>}{x.texto}</span>
                          {x.traslado && <span className="text-[12.5px] text-tinta-3">{x.traslado}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
            </Caja>
          ))}

          {d.fechas.length > 0 && (
            <Caja titulo="Fechas que vienen">
              <ul className="m-0 flex list-none flex-col gap-2 p-0">
                {d.fechas.slice(0, 5).map((f, i) => (
                  <li key={i} className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="min-w-0 truncate">{f.titulo}</span>
                    <span className="flex-none text-[12.5px] text-tinta-3">{f.faltan === 0 ? 'Hoy' : f.faltan === 1 ? 'Mañana' : f.cuando}</span>
                  </li>
                ))}
              </ul>
            </Caja>
          )}

          {d.habitos.length > 0 && (
            <Caja titulo="Hábitos" href={`${d.hrefs.personal}?v=habitos`}>
              <ul className="m-0 flex list-none flex-col gap-3 p-0">
                {d.habitos.map(h => {
                  const pct = h.meta > 0 ? Math.min(100, Math.round((h.hoy / h.meta) * 100)) : 0
                  return (
                    <li key={h.nombre} className="flex flex-col gap-1.5">
                      <span className="flex items-baseline justify-between text-[14px]">
                        <span>{h.nombre}</span>
                        <span className="text-[12.5px] text-tinta-3 tabular-nums">{h.hoy}/{h.meta}{h.unidad ? ` ${h.unidad}` : ''}{h.racha > 1 ? ` · ${h.racha} días` : ''}</span>
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--z-ink)_8%,transparent)]">
                        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--z-personal)' }} />
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Caja>
          )}

          {d.proyectos.length > 0 && (
            <Caja titulo="Proyectos" href={d.hrefs.proyectos}>
              <ul className="m-0 flex list-none flex-col gap-1 p-0">
                {d.proyectos.slice(0, 5).map(p => (
                  <li key={p.href}>
                    <Link href={p.href} className="-mx-2 flex items-center gap-3 rounded-[12px] px-2 py-2 text-tinta no-underline hover:bg-[color-mix(in_srgb,var(--z-ink)_4%,transparent)]">
                      <Punto espacio="proyecto" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-[14px]">{p.nombre}</span>
                        <span className="truncate text-[12px] text-tinta-3">{p.grupo}</span>
                      </span>
                      <span className="flex-none text-right text-[12.5px] text-tinta-3 tabular-nums">
                        {p.abiertos} abiertas
                        {p.vencidos > 0 && <><br /><span className="text-det-tinta">{p.vencidos} vencidas</span></>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Caja>
          )}

          {d.faltan && d.faltan.length > 0 && (
            <p className="m-0 px-2 text-[12px] leading-[1.5] text-tinta-3">
              Aún no se ven aquí: {d.faltan.join(' · ')}.
            </p>
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
