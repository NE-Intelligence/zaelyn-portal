/**
 * El lienzo de un plan: encabezado, pestañas y la vista que toque.
 *
 * Vive aparte de la ruta porque lo usan DOS: `/app/g/…/…` con datos reales y
 * `/demo` con el ejemplo. Es la prueba más barata de que la pantalla no sabe
 * de dónde vienen los números — si lo supiera, no se podría reutilizar así.
 */
import type { ReactNode } from 'react'
import Link from 'next/link'
import { Salud, fecha, plural } from './atomos'
import { Avance } from './atomos'
import { Bitacora, Equipo, Gantt, Resumen, Ruta, Tablero } from './vistas'
import { ROL_PUEDE, VISTA_NOMBRE, type VistaDePlan, type Vista } from '@/lib/plan'
import { nombreDeRol } from '@/lib/plan-uso/tipos'
import { Calendario, Detalle, FiltroPersona, Kanban, dePersona, type Filtros } from './vistas2'
import { BarraPregunta } from './Pregunta'

/** Lee los filtros de la dirección; un valor raro se ignora, no se adivina. */
export function filtrosDe(sp: Record<string, string | string[] | undefined>): Filtros {
  const uno = (x: string | string[] | undefined) => (Array.isArray(x) ? x[0] : x) ?? null
  const limpio = (x: string | null) => (x && /^[\w:.-]{1,80}$/.test(x) ? x : null)
  return { p: limpio(uno(sp.p)), a: limpio(uno(sp.a)), m: limpio(uno(sp.m)) }
}

/** Las vistas que se pueden ver por persona: las que solo reacomodan renglones. */
const POR_PERSONA: Vista[] = ['tablero', 'kanban', 'calendario']

export const VISTAS = Object.keys(VISTA_NOMBRE) as Vista[]

export function esVista(v: string | string[] | undefined): Vista {
  const uno = Array.isArray(v) ? v[0] : v
  return (VISTAS as string[]).includes(uno ?? '') ? (uno as Vista) : 'resumen'
}

/** Cuándo se leyó. Un dato viejo que no dice que es viejo engaña. */
function frescura(iso: string, ahora = Date.now()): string {
  const min = Math.max(0, Math.round((ahora - Date.parse(iso)) / 60000))
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  if (min < 48 * 60) return `hace ${Math.round(min / 60)} h`
  return `hace ${Math.round(min / 1440)} días`
}

export function Lienzo({
  v, vista, base, leido, en, general, f = {}, conSesion = false,
}: {
  v: VistaDePlan
  vista: Vista
  /** La ruta de este plan, para armar los enlaces de las pestañas. */
  base: string
  /** Cuándo se leyó el estado. */
  leido: string
  /** El tramo que se está viendo en el Tablero: [fase, ...grupos] (#200). */
  en?: Array<string | null> | null
  /** La sección General (#202), solo cuando se pide y hay un plan. */
  general?: ReactNode
  /** Persona, actividad abierta y mes, de la dirección (vistas2.tsx). */
  f?: Filtros
  /** Con sesión aparece la barra para preguntarle a Zaelyn. */
  conSesion?: boolean
}) {
  const e = v.estado
  const nombre = e.plan?.nombre ?? e.grupo.nombre
  const abiertos = e.renglones.filter(r => r.abierto).length

  return (
    <>
      <div className="pt-cabeza">
        <div className="fila">
          <div style={{ minWidth: 0, flex: '1 1 320px' }}>
            <h1>{nombre}</h1>
            <div className="meta">
              {v.ruta.venceElPlan && <span>hasta {fecha(v.ruta.venceElPlan)}</span>}
              <span>
                {plural(e.renglones.length, 'actividad', 'actividades')} · {abiertos} abiertas
                {' · '}{plural(e.personas.length, 'persona')}
              </span>
              <span>Leído {frescura(leido)}</span>
              {v.rol && <span title={ROL_PUEDE[v.rol] ?? undefined}>Tu rol aquí: {nombreDeRol(v.rol)}</span>}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10, minWidth: 220, flex: '0 1 280px' }}>
            <Salud veredicto={e.veredicto} />
            <Avance real={e.punto.declarado} esperado={e.punto.esperado} />
          </div>
        </div>

        <nav className="pt-pestanas" aria-label="Vistas del plan">
          {VISTAS.filter(x => x !== 'general' || e.plan).map(x => (
            <Link
              key={x}
              href={x === 'resumen' ? base : `${base}?v=${x}`}
              aria-current={x === vista ? 'page' : undefined}
            >
              {VISTA_NOMBRE[x]}
            </Link>
          ))}
        </nav>
      </div>

      {conSesion && (
        <BarraPregunta
          contexto={nombre}
          ejemplos={['¿Qué está atrasado?', '¿Qué le toca a cada quien esta semana?', '¿Qué manda sobre la fecha final?']}
        />
      )}
      {POR_PERSONA.includes(vista) && <FiltroPersona v={v} base={base} vista={vista} f={f} />}

      {vista === 'resumen' && <Resumen v={v} base={base} />}
      {vista === 'tablero' && <Tablero v={f.p ? { ...v, estado: { ...e, renglones: dePersona(e.renglones, f.p) } } : v} en={en ?? null} base={base} />}
      {vista === 'kanban' && <Kanban v={v} base={base} f={f} />}
      {vista === 'calendario' && <Calendario v={v} base={base} f={f} />}
      {vista === 'gantt' && <Gantt v={v} />}
      {vista === 'ruta' && <Ruta v={v} />}
      {vista === 'equipo' && <Equipo v={v} />}
      {vista === 'bitacora' && <Bitacora v={v} />}
      {vista === 'general' && general}
      <Detalle v={v} base={base} vista={vista} f={f} conSesion={conSesion} />
    </>
  )
}
