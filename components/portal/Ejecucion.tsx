'use client'

/**
 * El Inicio como vista de ejecución (decisiones/2026-11-11-inicio-de-ejecucion).
 *
 * Una sola foto operativa: todo lo que la persona tiene que hacer, venga de
 * donde venga (Personal, Familia, Proyectos o una app), en una lista
 * priorizada, en tarjetas por espacio o en la semana. Al lado, lo que da
 * contexto al día: agenda, la casa, fechas, hábitos, proyectos y apps.
 *
 * El portal no cambia nada por su cuenta. Tocar una cosa la abre en la
 * conversación con Zaelyn (`POST /portal/chat/abrir`), que contesta con su
 * tarjeta: Completada, Fechas, Posponer… Así marcar, mover o cancelar es lo
 * mismo aquí, en la app y en Telegram.
 *
 * El orden lo da una regla explícita de presentación sobre lo que el motor ya
 * midió (vencido → hoy con hora → hoy sin hora → mañana → semana → sin fecha);
 * no se calcula ninguna cifra nueva.
 */
import Link from 'next/link'
import { useMemo, useState } from 'react'

export type Espacio = 'personal' | 'familia' | 'proyecto' | 'app'

export type Cosa = {
  clave: string
  abrir: { tipo: 'pendiente' | 'recordatorio' | 'evento' | 'actividad'; id: string } | null
  titulo: string
  dia: string | null
  hora: string | null
  espacio: Espacio
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
  apps: Array<{ clave: string; nombre: string; estado: 'encendido' | 'apagado' | 'pronto' }>
  hrefs: { personal: string; familia: string; proyectos: string; apps: string; calendario: string }
  ejemplo?: boolean
  /** Lo que el motor todavía no manda; se dice, no se inventa. */
  faltan?: string[]
}

const COLOR: Record<Espacio, string> = {
  personal: 'var(--z-personal)',
  familia: 'var(--z-familia)',
  proyecto: 'var(--z-proyectos)',
  app: '#2f9c95',
}
const NOMBRE: Record<Espacio, string> = { personal: 'Personal', familia: 'Familia', proyecto: 'Proyectos', app: 'Apps' }
const ESPACIOS: Espacio[] = ['personal', 'familia', 'proyecto', 'app']

type Vista = 'lista' | 'tarjetas' | 'semana'
type Filtro = 'todo' | Espacio

// ── fechas, solo para acomodar ───────────────────────────────────────────────
const sumar = (iso: string, n: number) => {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}
const DIA_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const diaCorto = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return `${DIA_CORTO[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${d}`
}
const minutos = (h: string | null) => {
  if (!h) return 24 * 60
  const [hh, mm] = h.split(':').map(Number)
  return (hh ?? 0) * 60 + (mm ?? 0)
}

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
  const porHora = (a: Cosa, b: Cosa) => Number(a.hecho) - Number(b.hecho) || (a.dia ?? '').localeCompare(b.dia ?? '') || minutos(a.hora) - minutos(b.hora)
  return [
    { clave: 'vencido', titulo: 'Se te pasó', cosas: g.vencido!.sort(porHora) },
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
          {conDia && c.dia ? diaCorto(c.dia) : c.hora ?? ''}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className={`truncate text-[15.5px] ${c.hecho ? 'text-tinta-3 line-through decoration-[1px]' : ''}`}>{c.titulo}</span>
          {(c.quien || c.avance !== null || compacto) && (
            <span className="truncate text-[12.5px] text-tinta-3">
              {[compacto ? c.lugar : null, c.quien, c.avance !== null ? `${c.avance}%` : null].filter(Boolean).join(' · ')}
            </span>
          )}
        </span>
        <span className={`${compacto ? 'hidden' : 'hidden sm:flex'} flex-none items-center gap-2 text-[12.5px] text-tinta-2`}>
          <Punto espacio={c.espacio} />
          <span className="max-w-[160px] truncate">{c.lugar}</span>
        </span>
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

// ── la pantalla ──────────────────────────────────────────────────────────────
export function Ejecucion({ d }: { d: DatosEjecucion }) {
  const [vista, setVista] = useState<Vista>('lista')
  const [filtro, setFiltro] = useState<Filtro>('todo')
  const [aviso, setAviso] = useState<string | null>(null)
  const [pregunta, setPregunta] = useState('')

  const visibles = useMemo(() => d.cosas.filter(c => filtro === 'todo' || c.espacio === filtro), [d.cosas, filtro])
  const grupos = useMemo(() => agrupar(visibles, d.hoy), [visibles, d.hoy])
  const deHoy = d.cosas.filter(c => !c.hecho && (c.vencida || (c.dia !== null && c.dia <= d.hoy)))
  const cuenta = (e: Espacio) => d.cosas.filter(c => c.espacio === e && !c.hecho).length
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

  const preguntar = (e: React.FormEvent) => {
    e.preventDefault()
    const t = pregunta.trim()
    if (!t) return
    if (d.ejemplo) { decir('En tu cuenta, esto se lo preguntas a Zaelyn y la pantalla se mueve con la respuesta.'); return }
    window.dispatchEvent(new CustomEvent('zaelyn:preguntar', { detail: { texto: t, contexto: 'Inicio' } }))
    window.dispatchEvent(new Event('zaelyn:abrir-chat'))
    setPregunta('')
  }

  const semana = Array.from({ length: 7 }, (_, i) => sumar(d.hoy, i))

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
            <div className="flex flex-col"><dt>Se te pasó</dt><dd className={`cr-cifra text-[34px] leading-none ${d.cosas.some(c => c.vencida && !c.hecho) ? 'text-det-tinta' : 'text-tinta'}`}>{d.cosas.filter(c => c.vencida && !c.hecho).length}</dd></div>
            <div className="flex flex-col"><dt>Eventos hoy</dt><dd className="cr-cifra text-[34px] leading-none text-tinta">{agendaHoy.length}</dd></div>
          </dl>
        </div>

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
            value={pregunta}
            onChange={e => setPregunta(e.target.value)}
            placeholder="Dile a Zaelyn: «muévelo al viernes», «¿qué tiene Paula esta semana?», «recuérdame…»"
            className="min-w-0 flex-1 border-0 bg-transparent py-2 text-[15px] text-tinta outline-none placeholder:text-tinta-3"
            aria-label="Dile a Zaelyn"
          />
          <button type="submit" className="h-10 flex-none cursor-pointer rounded-full border-0 bg-tinta px-5 text-[14px] font-medium text-superficie">Enviar</button>
        </form>
      </header>

      {/* ── controles ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por espacio">
          {(['todo', ...ESPACIOS] as Filtro[]).map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
              className={`cr-chip flex cursor-pointer items-center gap-2 ${filtro === f ? '!bg-tinta !text-superficie' : ''}`}
            >
              {f !== 'todo' && <Punto espacio={f} />}
              {f === 'todo' ? 'Todo' : NOMBRE[f]}
              <span className="tabular-nums opacity-60">{f === 'todo' ? d.cosas.filter(c => !c.hecho).length : cuenta(f)}</span>
            </button>
          ))}
        </div>
        <div className="cr-vidrio flex rounded-full p-1" role="group" aria-label="Cómo verlo">
          {([['lista', 'Lista'], ['tarjetas', 'Tarjetas'], ['semana', 'Semana']] as const).map(([v, t]) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              aria-pressed={vista === v}
              className={`h-9 cursor-pointer rounded-full border-0 px-4 text-[13.5px] ${vista === v ? 'bg-tinta text-superficie' : 'bg-transparent text-tinta-2'}`}
            >{t}</button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── lo que hay que hacer ── */}
        <div className="flex min-w-0 flex-col gap-6">
          {visibles.length === 0 && (
            <section className="cr-vidrio rounded-[24px] px-6 py-10 text-center text-[15px] text-tinta-2">
              Nada pendiente aquí. Si se te ocurre algo, díselo a Zaelyn: «recuérdame…».
            </section>
          )}

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

          {vista === 'tarjetas' && (
            <div className="grid gap-5 xl:grid-cols-2">
              {ESPACIOS.filter(e => filtro === 'todo' || filtro === e).map((e, i) => {
                const suyas = visibles.filter(c => c.espacio === e)
                if (suyas.length === 0) return null
                return (
                  <section key={e} className="cr-tarjeta cr-flota flex flex-col gap-3 p-6" style={{ ['--cr-d' as string]: `${-i * 2.5}s` }}>
                    <span className="cr-brillo" aria-hidden="true" />
                    <header className="flex items-center gap-2.5">
                      <Punto espacio={e} grande />
                      <h2 className="cr-titulo text-[26px]">{NOMBRE[e]}</h2>
                      <span className="ml-auto text-[13px] text-tinta-3 tabular-nums">{suyas.filter(c => !c.hecho).length}</span>
                    </header>
                    <ul className="m-0 -mx-3 flex list-none flex-col p-0">
                      {agrupar(suyas, d.hoy).flatMap(g => g.cosas).slice(0, 7).map(c => <Renglon key={c.clave} c={c} alAbrir={abrir} conDia compacto />)}
                    </ul>
                  </section>
                )
              })}
            </div>
          )}

          {vista === 'semana' && (
            <div className="cr-vidrio overflow-x-auto rounded-[24px] p-3">
              <div className="grid min-w-[840px] grid-cols-7 gap-2">
                {semana.map(dia => {
                  const suyas = visibles.filter(c => (c.dia === dia) || (dia === d.hoy && c.vencida && !c.hecho))
                    .sort((a, b) => Number(b.vencida && !b.hecho) - Number(a.vencida && !a.hecho) || minutos(a.hora) - minutos(b.hora))
                  return (
                    <section key={dia} className={`flex min-h-[320px] flex-col gap-2 rounded-[18px] p-2.5 ${dia === d.hoy ? 'bg-[color-mix(in_srgb,var(--cr-acento,#8b7fd6)_10%,transparent)]' : ''}`}>
                      <h2 className={`px-1 text-[13px] ${dia === d.hoy ? 'font-semibold text-tinta' : 'text-tinta-2'}`}>{dia === d.hoy ? 'Hoy' : diaCorto(dia)}</h2>
                      {suyas.map(c => (
                        <button
                          key={c.clave}
                          type="button"
                          onClick={() => abrir(c)}
                          className="flex cursor-pointer flex-col items-start gap-1 rounded-[12px] border-0 bg-superficie px-2.5 py-2 text-left shadow-z1"
                          style={{ boxShadow: `inset 3px 0 0 ${COLOR[c.espacio]}` }}
                        >
                          <span className="text-[11.5px] text-tinta-3 tabular-nums">{c.vencida && !c.hecho ? 'Se pasó' : c.hora ?? 'Todo el día'}</span>
                          <span className={`line-clamp-3 text-[13px] leading-[1.3] text-tinta ${c.hecho ? 'line-through opacity-60' : ''}`}>{c.titulo}</span>
                        </button>
                      ))}
                    </section>
                  )
                })}
              </div>
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
            <Caja key={f.familia} titulo={f.familia} href={f.href} mas="La casa">
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

          <Caja titulo="Apps" href={d.hrefs.apps} mas="Conectar">
            <div className="flex flex-wrap gap-2">
              {d.apps.map(a => (
                <Link key={a.clave} href={d.hrefs.apps} className="cr-chip flex items-center gap-2 no-underline">
                  <span className={`size-1.5 rounded-full ${a.estado === 'encendido' ? 'bg-[#3aa76d]' : 'bg-[color-mix(in_srgb,var(--z-ink)_25%,transparent)]'}`} aria-hidden="true" />
                  {a.nombre}
                  <span className="text-[11.5px] text-tinta-3">{a.estado === 'encendido' ? 'conectada' : a.estado === 'pronto' ? 'pronto' : 'conectar'}</span>
                </Link>
              ))}
            </div>
          </Caja>

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
