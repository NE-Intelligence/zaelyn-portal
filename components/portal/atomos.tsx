/**
 * Las piezas chicas del portal.
 *
 * Ninguna calcula nada: reciben el número ya medido y lo pintan. La regla de
 * color del sistema de diseño se respeta aquí — ningún estado se comunica
 * solo con color, cada píldora y cada segmento lleva su palabra al lado.
 */
import type { Actividad, Estado, Persona, Prioridad, Rol } from '@/lib/plan'
import { ESTADO_NOMBRE, PRIORIDAD_NOMBRE, ROL_NOMBRE } from '@/lib/plan'

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** «23 oct». Sin año, porque el encabezado ya dice de qué periodo se habla. */
export function fecha(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number)
  return `${d} ${MES[m - 1]}${a !== 2026 ? ` ${String(a).slice(2)}` : ''}`
}

export function dias(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86_400_000)
}

export const Chispa = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.6l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9L4 10.6l5.9-2.1z" />
  </svg>
)

export const Pill = ({ estado }: { estado: Estado }) => (
  <span className={`pt-pill ${estado}`}>
    <i />
    {ESTADO_NOMBRE[estado]}
  </span>
)

export const Prio = ({ prioridad }: { prioridad: Prioridad }) => (
  <span className={`pt-prio ${prioridad}`} title={`Prioridad ${PRIORIDAD_NOMBRE[prioridad].toLowerCase()}`}>
    <span />
    {prioridad !== 'baja' && <span />}
    {(prioridad === 'alta' || prioridad === 'critica') && <span />}
    <span className="pt-sr">{PRIORIDAD_NOMBRE[prioridad]}</span>
  </span>
)

export const RolEtq = ({ rol }: { rol: Rol }) => <span className="pt-rol">{ROL_NOMBRE[rol]}</span>

export function Avatar({ persona, nombre = true }: { persona?: Persona; nombre?: boolean }) {
  if (!persona) {
    return (
      <span className="pt-avatar vacio" title="Sin responsable">
        <span className="ini">?</span>
        {nombre && <span className="nom">Sin dueño</span>}
      </span>
    )
  }
  return (
    <span className="pt-avatar">
      <span className="ini" style={{ background: `var(--grp-${persona.color})` }}>
        {persona.iniciales}
      </span>
      {nombre && <span className="nom">{persona.corto}</span>}
    </span>
  )
}

/** La marca de «esperado hoy» sobre la pista es lo que hace visible el desfase. */
export function Avance({
  real,
  esperado,
  cifras = true,
}: {
  real: number
  esperado?: number
  cifras?: boolean
}) {
  const atras = esperado != null && real < esperado ? esperado - real : 0
  return (
    <div className="pt-avance">
      <div
        className="pista"
        role="img"
        aria-label={
          esperado != null
            ? `Avance ${real} por ciento, esperado hoy ${esperado} por ciento`
            : `Avance ${real} por ciento`
        }
      >
        <div className="real" style={{ width: `${Math.min(Math.max(real, 0), 100)}%` }} />
        {esperado != null && (
          <div className="esperado" style={{ left: `calc(${Math.min(esperado, 100)}% - 1px)` }} title={`Esperado hoy: ${esperado}%`} />
        )}
      </div>
      {cifras && (
        <div className="cifras">
          <span>
            <b>{real}%</b> real
          </span>
          {esperado != null && <span>{esperado}% esperado</span>}
          {atras > 0 && <span className="abajo">{atras} pts abajo</span>}
        </div>
      )}
    </div>
  )
}

export function Kpi({
  etiqueta,
  valor,
  unidad,
  detalle,
  tono,
}: {
  etiqueta: string
  valor: string | number
  unidad?: string
  detalle?: string
  tono?: 'alerta' | 'aviso'
}) {
  return (
    <div className={`pt-kpi${tono ? ` ${tono}` : ''}`}>
      <div className="pt-overline">{etiqueta}</div>
      <div className="n">
        {valor}
        {unidad && <small>{unidad}</small>}
      </div>
      {detalle && <div className="d">{detalle}</div>}
    </div>
  )
}

const ORDEN: Estado[] = ['hecha', 'curso', 'revision', 'detenida', 'pendiente']

export function Distribucion({ actividades }: { actividades: Actividad[] }) {
  const total = actividades.length || 1
  const cuenta = ORDEN.map((e) => ({ estado: e, n: actividades.filter((a) => a.estado === e).length }))
  return (
    <div>
      <div className="pt-dist">
        {cuenta
          .filter((c) => c.n > 0)
          .map((c) => (
            <span
              key={c.estado}
              style={{ width: `${(c.n / total) * 100}%`, background: `var(--st-${c.estado})` }}
              title={`${ESTADO_NOMBRE[c.estado]}: ${c.n}`}
            />
          ))}
      </div>
      <div className="pt-leyenda">
        {cuenta
          .filter((c) => c.n > 0)
          .map((c) => (
            <span key={c.estado}>
              <i style={{ background: `var(--st-${c.estado})` }} />
              {ESTADO_NOMBRE[c.estado]} {c.n}
            </span>
          ))}
      </div>
    </div>
  )
}

export const Salud = ({ salud }: { salud: 'bien' | 'riesgo' | 'mal' }) => (
  <span className={`pt-salud ${salud}`}>
    <i />
    {salud === 'bien' ? 'En tiempo' : salud === 'riesgo' ? 'En riesgo' : 'Atrasado'}
  </span>
)
