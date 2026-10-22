/**
 * El lienzo de un plan: encabezado, pestañas y la vista que toque.
 *
 * Vive aparte de la ruta porque lo usan DOS: `/app/g/…/…` con datos reales y
 * `/demo` con el ejemplo. Es la prueba más barata de que la pantalla no sabe
 * de dónde vienen los números — si lo supiera, no se podría reutilizar así.
 */
import Link from 'next/link'
import { Salud, fecha, plural } from './atomos'
import { Avance } from './atomos'
import { Bitacora, Equipo, Gantt, Resumen, Ruta, Tablero } from './vistas'
import { ROL_PUEDE, VISTA_NOMBRE, type VistaDePlan, type Vista } from '@/lib/plan'
import { nombreDeRol } from '@/lib/plan-uso/tipos'

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
  v, vista, base, leido,
}: {
  v: VistaDePlan
  vista: Vista
  /** La ruta de este plan, para armar los enlaces de las pestañas. */
  base: string
  /** Cuándo se leyó el estado. */
  leido: string
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
          {VISTAS.map(x => (
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

      {vista === 'resumen' && <Resumen v={v} />}
      {vista === 'tablero' && <Tablero v={v} />}
      {vista === 'gantt' && <Gantt v={v} />}
      {vista === 'ruta' && <Ruta v={v} />}
      {vista === 'equipo' && <Equipo v={v} />}
      {vista === 'bitacora' && <Bitacora v={v} />}
    </>
  )
}
