/**
 * Las vistas que nacieron con el rediseño (decisiones/2026-11-10-rediseno-del-portal):
 * Kanban, Calendario del proyecto, el filtro por persona y el panel de detalle
 * de una actividad.
 *
 * Mismas reglas que `vistas.tsx`: ninguna mide nada. Reacomodan los renglones
 * que mandó el motor (por estado, por día) y la única aritmética es de
 * calendario. Los sucesores de una actividad no son un dato nuevo: son los
 * renglones cuyo `antecesores` la nombra, leídos al revés.
 *
 * Todo se maneja con la dirección (`?v=`, `?p=`, `?a=`, `?m=`), sin estado en
 * el navegador: así Zaelyn puede mandar a alguien directo a «el Gantt de
 * @bruno con la B-01 abierta» con un enlace (`portal.ir`).
 */
import Link from 'next/link'
import type { Estatus, PersonaEnPlan, Renglon, VistaDePlan } from '@/lib/plan'
import { CRITICIDAD_NOMBRE, ESTATUS_NOMBRE, SENAL_NOMBRE, corto, iniciales, persona as personaDe } from '@/lib/plan'
import { fecha, tarde, plural, Pill } from './atomos'
import { CopiarFrase } from './Pregunta'

// ── la dirección ────────────────────────────────────────────────────────────

export type Filtros = { p?: string | null; a?: string | null; m?: string | null }

/** Arma la dirección conservando lo demás. `null` quita la llave. */
export function liga(base: string, vista: string, f: Filtros, cambio: Filtros = {}): string {
  const q = new URLSearchParams()
  if (vista !== 'resumen') q.set('v', vista)
  const todo = { ...f, ...cambio }
  for (const k of ['p', 'm', 'a'] as const) {
    const x = todo[k]
    if (x) q.set(k, x)
  }
  const s = q.toString()
  return s ? `${base}?${s}` : base
}

export const dePersona = (rs: Renglon[], p?: string | null) => (p ? rs.filter(r => r.personaId === p) : rs)

// ── piezas ──────────────────────────────────────────────────────────────────

function Ini({ p, chico = false }: { p?: PersonaEnPlan; chico?: boolean }) {
  const tono = p ? (p.nombre.charCodeAt(0) % 5) + 1 : 0
  return (
    <span
      className={`inline-grid place-items-center rounded-full font-semibold text-white ${chico ? 'size-5 text-[10px]' : 'size-6 text-[11px]'}`}
      style={{ background: p ? `var(--grp-${tono})` : 'var(--z-line-strong)' }}
      title={p?.nombre ?? 'Sin dueño'}
      aria-hidden="true"
    >
      {p ? iniciales(p.nombre) : '?'}
    </span>
  )
}

/** La pista fina de avance con la marca de «esperado hoy». */
function Pista({ real, esperado }: { real: number; esperado: number | null }) {
  return (
    <span className="relative block h-1.5 rounded-full bg-pista" aria-hidden="true">
      <span className="block h-1.5 rounded-full bg-proyectos" style={{ width: `${Math.min(100, real)}%` }} />
      {esperado !== null && (
        <span className="absolute -top-1 h-3.5 w-0.5 rounded-sm bg-tinta-2" style={{ left: `${Math.min(100, esperado)}%` }} />
      )}
    </span>
  )
}

// ── filtro por persona ──────────────────────────────────────────────────────

export function FiltroPersona({ v, base, vista, f }: { v: VistaDePlan; base: string; vista: string; f: Filtros }) {
  const gente = v.estado.personas.filter(p => v.estado.renglones.some(r => r.personaId === p.id))
  if (gente.length < 2) return null
  const chip = 'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] no-underline transition-colors'
  return (
    <nav aria-label="Ver por persona" className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[13px] text-tinta-2">Ver</span>
      <Link
        href={liga(base, vista, f, { p: null, a: null })}
        aria-current={!f.p ? 'true' : undefined}
        className={`${chip} ${!f.p ? 'bg-pri text-sobre-pri font-semibold' : 'bg-superficie text-tinta shadow-z1 hover:bg-superficie-2'}`}
      >
        Todo el equipo
      </Link>
      {gente.map(p => (
        <Link
          key={p.id}
          href={liga(base, vista, f, { p: p.id, a: null })}
          aria-current={f.p === p.id ? 'true' : undefined}
          className={`${chip} ${f.p === p.id ? 'bg-pri text-sobre-pri font-semibold' : 'bg-superficie text-tinta shadow-z1 hover:bg-superficie-2'}`}
        >
          <Ini p={p} chico />
          {corto(p.nombre)}
        </Link>
      ))}
    </nav>
  )
}

// ── Kanban ──────────────────────────────────────────────────────────────────

const COLUMNAS: Array<{ estatus: Estatus; punto: string }> = [
  { estatus: 'abierto', punto: 'bg-pend' },
  { estatus: 'en_curso', punto: 'bg-curso' },
  { estatus: 'bloqueado', punto: 'bg-det' },
  { estatus: 'hecho', punto: 'bg-hecha' },
]

export function Kanban({ v, base, f }: { v: VistaDePlan; base: string; f: Filtros }) {
  const e = v.estado
  const rs = dePersona(e.renglones, f.p)
  const canceladas = rs.filter(r => r.estatus === 'cancelado').length
  return (
    <div className="grid gap-3">
      <div className="grid gap-4 overflow-x-auto pb-2 [grid-template-columns:repeat(4,minmax(260px,1fr))]">
        {COLUMNAS.map(c => {
          const lista = rs.filter(r => r.estatus === c.estatus)
          // Lo que más cuesta no ver va arriba: el orden de riesgo lo decidió el motor.
          const orden = new Map(v.riesgo.map((id, i) => [id, i]))
          lista.sort((a, b) => (orden.get(a.id) ?? 1e9) - (orden.get(b.id) ?? 1e9) || (a.vence ?? '9').localeCompare(b.vence ?? '9'))
          return (
            <section key={c.estatus} aria-label={ESTATUS_NOMBRE[c.estatus]} className="grid content-start gap-2.5 rounded-xl bg-superficie-2 p-2.5">
              <header className="flex items-center gap-2 px-1.5 pt-1 pb-0.5">
                <span className={`size-2 rounded-full ${c.punto}`} aria-hidden="true" />
                <h2 className="text-[14px]">{ESTATUS_NOMBRE[c.estatus]}</h2>
                <span className="ml-auto text-[13px] text-tinta-2 tabular-nums">{lista.length}</span>
              </header>
              {lista.length === 0 && <p className="px-1.5 pb-2 text-[13px] text-tinta-3">Nada aquí.</p>}
              {lista.map(r => (
                <Tarjeta key={r.id} r={r} v={v} href={liga(base, 'kanban', f, { a: r.id })} />
              ))}
            </section>
          )
        })}
      </div>
      {canceladas > 0 && <p className="text-[13px] text-tinta-3">{plural(canceladas, 'cancelada')} fuera del tablero.</p>}
    </div>
  )
}

function Tarjeta({ r, v, href }: { r: Renglon; v: VistaDePlan; href: string }) {
  const p = personaDe(v.estado, r.personaId)
  const d = tarde(r, v.estado.hoy)
  return (
    <Link
      href={href}
      scroll={false}
      className="grid gap-2.5 rounded-lg bg-superficie p-3.5 text-tinta no-underline shadow-z1 transition-shadow hover:shadow-z2"
    >
      <span className="flex items-start gap-2">
        <span className="min-w-0 flex-1 text-[14.5px] font-medium leading-snug">
          {r.clave && <span className="mr-1.5 font-mono text-[12px] text-tinta-3">{r.clave}</span>}
          {r.texto}
        </span>
        {r.criticidad !== 'ninguna' && (
          <span
            className={`mt-1 size-2 shrink-0 rounded-full ${r.criticidad === 'critica' ? 'bg-det' : 'bg-curso'}`}
            title={CRITICIDAD_NOMBRE[r.criticidad]}
          >
            <span className="sr-only">{CRITICIDAD_NOMBRE[r.criticidad]}</span>
          </span>
        )}
      </span>
      {r.abierto && <Pista real={r.avance} esperado={r.esperado} />}
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-tinta-2">
        <Ini p={p} chico />
        <span>{p ? corto(p.nombre) : 'Sin dueño'}</span>
        <span aria-hidden="true">·</span>
        <span className={d > 0 ? 'font-medium text-det-tinta' : undefined}>
          {r.vence ? (d > 0 ? `${d} d tarde` : `vence ${fecha(r.vence)}`) : 'sin fecha'}
        </span>
        {r.abierto && <span className="ml-auto font-semibold tabular-nums text-tinta">{r.avance}%</span>}
      </span>
      {(r.hito || r.espera || r.notas > 0) && (
        <span className="flex flex-wrap gap-1.5 text-[12px]">
          {r.hito && <span className="rounded-full bg-superficie-2 px-2 py-0.5 text-tinta-2">◆ Hito</span>}
          {r.espera && <span className="rounded-full bg-det-bg px-2 py-0.5 text-det-tinta">Espera: {r.espera}</span>}
          {r.notas > 0 && <span className="rounded-full bg-superficie-2 px-2 py-0.5 text-tinta-2">{plural(r.notas, 'nota')}</span>}
        </span>
      )}
    </Link>
  )
}

// ── Calendario del proyecto ─────────────────────────────────────────────────

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIAS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

type Marca = { r: Renglon; tipo: 'hito' | 'vence' | 'inicia' }

function mesValido(m: string | null | undefined, hoy: string): string {
  return m && /^\d{4}-(0[1-9]|1[0-2])$/.test(m) ? m : hoy.slice(0, 7)
}
function otroMes(m: string, delta: number): string {
  const [a, mm] = m.split('-').map(Number) as [number, number]
  const d = new Date(Date.UTC(a, mm - 1 + delta, 1))
  return d.toISOString().slice(0, 7)
}

export function Calendario({ v, base, f }: { v: VistaDePlan; base: string; f: Filtros }) {
  const hoy = v.estado.hoy.slice(0, 10)
  const mes = mesValido(f.m, hoy)
  const [a, m] = mes.split('-').map(Number) as [number, number]
  const primero = new Date(Date.UTC(a, m - 1, 1))
  const enMes = new Date(Date.UTC(a, m, 0)).getUTCDate()
  const hueco = (primero.getUTCDay() + 6) % 7 // lunes primero
  const celdas = Math.ceil((hueco + enMes) / 7) * 7

  const porDia = new Map<string, Marca[]>()
  const poner = (dia: string | null, x: Marca) => {
    if (!dia || dia.slice(0, 7) !== mes) return
    const k = dia.slice(0, 10)
    porDia.set(k, [...(porDia.get(k) ?? []), x])
  }
  for (const r of dePersona(v.estado.renglones, f.p)) {
    if (r.estatus === 'cancelado') continue
    if (r.hito) poner(r.vence ?? r.inicia, { r, tipo: 'hito' })
    else {
      poner(r.vence, { r, tipo: 'vence' })
      if (r.inicia && r.inicia !== r.vence) poner(r.inicia, { r, tipo: 'inicia' })
    }
  }
  const PESO = { hito: 0, vence: 1, inicia: 2 }

  return (
    <section className="overflow-hidden rounded-lg bg-superficie shadow-z1" aria-label={`Calendario de ${MESES[m - 1]} ${a}`}>
      <header className="flex flex-wrap items-center gap-3 border-b border-linea px-5 py-3.5">
        <h2 className="text-[19px] capitalize">{MESES[m - 1]} <span className="text-tinta-2">{a}</span></h2>
        <span className="flex flex-wrap gap-3 text-[12.5px] text-tinta-2">
          <span className="inline-flex items-center gap-1.5"><span aria-hidden="true">◆</span> Hito</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-proyectos" aria-hidden="true" /> Vence</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full border border-linea-fuerte" aria-hidden="true" /> Empieza</span>
        </span>
        <nav className="ml-auto flex items-center gap-1" aria-label="Cambiar de mes">
          <Link href={liga(base, 'calendario', f, { m: otroMes(mes, -1), a: null })} className="rounded-full px-3 py-1.5 text-[13px] text-tinta no-underline hover:bg-superficie-2" aria-label="Mes anterior">‹</Link>
          <Link href={liga(base, 'calendario', f, { m: null, a: null })} className="rounded-full bg-superficie-2 px-3 py-1.5 text-[13px] font-medium text-tinta no-underline">Hoy</Link>
          <Link href={liga(base, 'calendario', f, { m: otroMes(mes, 1), a: null })} className="rounded-full px-3 py-1.5 text-[13px] text-tinta no-underline hover:bg-superficie-2" aria-label="Mes siguiente">›</Link>
        </nav>
      </header>
      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-7">
          {DIAS.map(d => (
            <div key={d} className="border-b border-linea px-3 py-2 text-[12px] font-medium text-tinta-2">{d}</div>
          ))}
          {Array.from({ length: celdas }, (_, i) => {
            const n = i - hueco + 1
            if (n < 1 || n > enMes) return <div key={i} className="min-h-28 border-b border-r border-linea bg-superficie-2/50" />
            const k = `${mes}-${String(n).padStart(2, '0')}`
            const marcas = (porDia.get(k) ?? []).sort((x, y) => PESO[x.tipo] - PESO[y.tipo])
            const esHoy = k === hoy
            return (
              <div key={i} className="grid min-h-28 content-start gap-1 border-b border-r border-linea p-1.5">
                <span className={`ml-1 inline-grid size-6 place-items-center rounded-full text-[12.5px] tabular-nums ${esHoy ? 'bg-pri font-semibold text-sobre-pri' : 'text-tinta-2'}`}>
                  {n}
                  {esHoy && <span className="sr-only"> (hoy)</span>}
                </span>
                {marcas.slice(0, 3).map(x => (
                  <Link
                    key={x.r.id + x.tipo}
                    href={liga(base, 'calendario', f, { a: x.r.id })}
                    scroll={false}
                    title={`${x.tipo === 'inicia' ? 'Empieza' : x.tipo === 'hito' ? 'Hito' : 'Vence'}: ${x.r.texto}`}
                    className={`flex items-center gap-1.5 truncate rounded-md px-1.5 py-1 text-[12px] no-underline ${
                      x.tipo === 'hito' ? 'bg-pri font-medium text-sobre-pri'
                        : x.tipo === 'vence' ? (tarde(x.r, v.estado.hoy) > 0 ? 'bg-det-bg text-det-tinta' : 'bg-proyectos-suave text-proyectos')
                          : 'text-tinta-2 hover:bg-superficie-2'}`}
                  >
                    {x.tipo === 'hito' ? <span aria-hidden="true">◆</span> : x.tipo === 'inicia' ? <span className="size-1.5 shrink-0 rounded-full border border-linea-fuerte" aria-hidden="true" /> : null}
                    <span className="truncate">{x.r.clave ? <><b className="font-semibold">{x.r.clave}</b> {x.r.texto}</> : x.r.texto}</span>
                  </Link>
                ))}
                {marcas.length > 3 && <span className="px-1.5 text-[11.5px] text-tinta-3">+{marcas.length - 3} más</span>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ── Panel de detalle de una actividad ───────────────────────────────────────

export function Detalle({
  v, base, vista, f, conSesion,
}: {
  v: VistaDePlan
  base: string
  vista: string
  f: Filtros
  /** En el ejemplo no hay a quién pedirle el cambio: solo se copia la frase. */
  conSesion: boolean
}) {
  const e = v.estado
  const r = f.a ? e.renglones.find(x => x.id === f.a) : undefined
  if (!r) return null
  const porId = new Map(e.renglones.map(x => [x.id, x]))
  const antes = r.antecesores.map(id => porId.get(id)).filter((x): x is Renglon => !!x)
  const despues = e.renglones.filter(x => x.antecesores.includes(r.id))
  const quien = personaDe(e, r.personaId)
  const d = tarde(r, e.hoy)
  const historia = v.bitacora.filter(s => s.pendienteId === r.id).slice(0, 6)
  const proyecto = e.plan?.nombre ?? e.grupo.nombre
  const ref = r.clave ?? `«${r.texto}»`
  const sugerido = r.abierto ? Math.min(100, Math.max(r.avance + 10, r.esperado ?? 0)) : r.avance
  const frases = r.abierto
    ? [
      `en ${proyecto} actualiza ${ref} al ${Math.round(sugerido / 5) * 5}%`,
      `en ${proyecto} mueve ${ref} al ${fecha(r.vence ? r.vence : e.hoy)}`,
      `en ${proyecto} ${ref} está detenida porque …`,
    ]
    : [`en ${proyecto} reabre ${ref}`]
  const cerrar = liga(base, vista, f, { a: null })
  const fila = 'grid grid-cols-[120px_1fr] gap-3 py-2 text-[14px]'

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-labelledby="det-titulo">
      <Link href={cerrar} scroll={false} aria-label="Cerrar el detalle" className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />
      <aside className="relative flex h-full w-full max-w-[460px] flex-col overflow-y-auto bg-fondo shadow-z3 sm:m-3 sm:h-[calc(100%-24px)] sm:rounded-xl">
        <header className="sticky top-0 z-10 flex items-start gap-3 bg-fondo/90 px-6 pt-5 pb-3 backdrop-blur">
          <div className="grid min-w-0 flex-1 gap-1.5">
            <span className="flex flex-wrap items-center gap-2 text-[12.5px] text-tinta-2">
              <span className="size-2 rounded-full bg-proyectos" aria-hidden="true" />
              <span>{[r.fase ?? 'Sin fase', ...(r.grupo ?? [])].join(' › ')}</span>
            </span>
            <h2 id="det-titulo" className="text-[22px] leading-tight">
              {r.clave && <span className="mr-2 font-mono text-[15px] font-normal text-tinta-3">{r.clave}</span>}
              {r.texto}
            </h2>
          </div>
          <Link href={cerrar} scroll={false} className="grid size-9 shrink-0 place-items-center rounded-full bg-superficie-2 text-[18px] text-tinta no-underline" aria-label="Cerrar">×</Link>
        </header>

        <div className="grid gap-5 px-6 pb-8">
          <section className="grid gap-3 rounded-lg bg-superficie p-4 shadow-z1">
            <span className="flex items-end gap-3">
              <span className="text-[40px] font-semibold leading-none tracking-[-0.03em] tabular-nums">{r.avance}%</span>
              <span className="pb-1 text-[13px] text-tinta-2">
                {!r.abierto ? 'Cerrada.' : r.esperado === null ? 'Sin fecha límite: no se le puede medir.' : `Esperado hoy ${r.esperado}%`}
              </span>
              <span className="ml-auto pb-1"><Pill estatus={r.estatus} /></span>
            </span>
            <Pista real={r.avance} esperado={r.esperado} />
          </section>

          <section className="divide-y divide-linea rounded-lg bg-superficie px-4 shadow-z1">
            <div className={fila}>
              <span className="text-tinta-2">Responsable</span>
              <span className="flex flex-wrap items-center gap-2">
                <Ini p={quien} chico />{quien ? corto(quien.nombre) : 'Sin dueño'}
                {r.apoyos?.length ? <span className="text-tinta-2">· apoyan {r.apoyos.map(x => corto(x.nombre)).join(', ')}</span> : null}
              </span>
            </div>
            <div className={fila}>
              <span className="text-tinta-2">Fechas</span>
              <span>
                {fecha(r.inicia)} → {fecha(r.vence)}
                {d > 0 && <span className="ml-2 font-medium text-det-tinta">{d} días tarde</span>}
              </span>
            </div>
            <div className={fila}>
              <span className="text-tinta-2">Margen</span>
              <span>{r.holgura === null ? 'No se puede saber todavía' : r.manda ? 'Ninguno: manda sobre la fecha final' : plural(r.holgura, 'día')}</span>
            </div>
            <div className={fila}>
              <span className="text-tinta-2">Criticidad</span>
              <span>{CRITICIDAD_NOMBRE[r.criticidad]}{r.hito ? ' · es hito' : ''}</span>
            </div>
            {r.espera && (
              <div className={fila}>
                <span className="text-tinta-2">Espera</span>
                <span className="text-det-tinta">{r.espera}</span>
              </div>
            )}
            {r.senales.length > 0 && (
              <div className={fila}>
                <span className="text-tinta-2">Señales</span>
                <span className="grid gap-1">{r.senales.map(s => <span key={s}>{SENAL_NOMBRE[s]}</span>)}</span>
              </div>
            )}
          </section>

          <section className="grid gap-2">
            <h3 className="text-[15px]">Dependencias</h3>
            <div className="grid gap-3 rounded-lg bg-superficie p-4 shadow-z1">
              <Deps titulo="Espera a" vacia="No espera a nada." rs={antes} base={base} vista={vista} f={f} />
              <Deps titulo="La esperan" vacia="Nada depende de ella." rs={despues} base={base} vista={vista} f={f} />
            </div>
          </section>

          <section className="grid gap-2">
            <h3 className="text-[15px]">Para cambiarla, díselo a Zaelyn</h3>
            <p className="text-[13px] text-tinta-2">
              El portal muestra; los cambios se piden en la conversación. {conSesion ? 'Toca una frase para mandarla o cópiala.' : 'Copia la frase y mándala por el chat.'}
            </p>
            <div className="grid gap-2">
              {frases.map(x => <CopiarFrase key={x} frase={x} enviar={conSesion} />)}
            </div>
          </section>

          {historia.length > 0 && (
            <section className="grid gap-2">
              <h3 className="text-[15px]">Lo último</h3>
              <ol className="m-0 grid list-none gap-0 rounded-lg bg-superficie p-0 px-4 shadow-z1">
                {historia.map((s, i) => (
                  <li key={i} className="grid gap-0.5 border-b border-linea py-2.5 text-[13.5px] last:border-0">
                    <span className="text-[12px] text-tinta-3">{fecha(s.en)}{s.quien ? ` · ${corto(s.quien)}` : ''}</span>
                    <span>{s.texto ?? s.evento}{s.avance !== null ? ` · ${s.avance}%` : ''}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </aside>
    </div>
  )
}

function Deps({ titulo, vacia, rs, base, vista, f }: { titulo: string; vacia: string; rs: Renglon[]; base: string; vista: string; f: Filtros }) {
  return (
    <div className="grid gap-1.5">
      <span className="text-[12.5px] text-tinta-2">{titulo}</span>
      {rs.length === 0 && <span className="text-[13.5px] text-tinta-3">{vacia}</span>}
      {rs.map(x => (
        <Link key={x.id} href={liga(base, vista, f, { a: x.id })} scroll={false}
          className="flex items-center gap-2 rounded-md bg-superficie-2 px-3 py-2 text-[13.5px] text-tinta no-underline hover:bg-sel">
          {x.clave && <span className="font-mono text-[12px] text-tinta-3">{x.clave}</span>}
          <span className="min-w-0 flex-1 truncate">{x.texto}</span>
          <span className="text-[12px] text-tinta-2">{ESTATUS_NOMBRE[x.estatus]}</span>
        </Link>
      ))}
    </div>
  )
}
