/**
 * Las piezas chicas del portal.
 *
 * Ninguna calcula nada: reciben el número ya medido y lo pintan. La regla de
 * color del sistema se respeta aquí — ningún estado se comunica solo con
 * color, cada píldora y cada segmento lleva su palabra al lado.
 *
 * La única aritmética que se permite es de CALENDARIO: cuántos días hay entre
 * dos fechas que ya vinieron dadas, para poder dibujar una barra o decir «3
 * días tarde». Eso no es una medición, es la misma clase de cosa que escribir
 * «23 oct» en vez de «2026-10-23».
 */
import type { Criticidad, Estatus, PersonaEnPlan, Renglon, Senal, Veredicto } from '@/lib/plan'
import {
  CLASE_ESTATUS, CRITICIDAD_NOMBRE, ESTATUS_NOMBRE, SALUD, SENAL_CORTO,
  SENAL_NOMBRE, VEREDICTO_NOMBRE, colorDeFase, corto, iniciales,
} from '@/lib/plan'

const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const ESTE_ANO = new Date().getUTCFullYear()

/** «23 oct». Con año solo cuando no es el corriente, para no repetirlo 40 veces. */
export function fecha(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  if (!a || !m || !d) return '—'
  return `${d} ${MES[m - 1]}${a !== ESTE_ANO ? ` ${String(a).slice(2)}` : ''}`
}

export function cuando(iso: string): string {
  const d = new Date(iso)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

export function dias(a: string, b: string): number {
  return Math.round((Date.parse(`${b.slice(0, 10)}T00:00:00Z`)
    - Date.parse(`${a.slice(0, 10)}T00:00:00Z`)) / 86_400_000)
}

/** Días de retraso contra la fecha comprometida. Resta de calendario, no medición. */
export function tarde(r: Renglon, hoy: string): number {
  if (!r.abierto || !r.vence || r.vence >= hoy) return 0
  return dias(r.vence, hoy)
}

/**
 * Plural en español, sin paréntesis.
 *
 * «2 eslabón(es)» y «1 personas» son las dos caras del mismo descuido, y las
 * dos se leen como una plantilla sin terminar. Esta pantalla se enseña en una
 * junta: ahí la diferencia entre «1 persona» y «1 personas» es si el trabajo
 * parece cuidado o no.
 */
export const plural = (n: number, uno: string, varios = `${uno}s`): string =>
  `${n} ${n === 1 ? uno : varios}`

export const Chispa = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2.6l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9L4 10.6l5.9-2.1z" />
  </svg>
)

export const Pill = ({ estatus }: { estatus: Estatus }) => (
  <span className={`pt-pill ${CLASE_ESTATUS[estatus]}`}>
    <i />
    {ESTATUS_NOMBRE[estatus]}
  </span>
)

/**
 * La criticidad, en tres escalones y con su palabra.
 *
 * Son los que el motor mide (`ninguna` / `atencion` / `critica`), no cuatro
 * cubetas de prioridad: eso último era un invento de la primera versión de la
 * pantalla, y nada lo llenaba.
 */
export const Crit = ({ criticidad }: { criticidad: Criticidad }) => {
  const n = criticidad === 'critica' ? 3 : criticidad === 'atencion' ? 2 : 1
  return (
    <span className={`pt-prio ${criticidad}`} title={CRITICIDAD_NOMBRE[criticidad]}>
      {Array.from({ length: n }, (_, i) => <span key={i} />)}
      <span className="pt-sr">{CRITICIDAD_NOMBRE[criticidad]}</span>
    </span>
  )
}

/**
 * Las señales, en palabras. Nunca solo un color.
 *
 * Con su etiqueta y no con la clave: la primera versión imprimía
 * `s.replace('_',' ')` y en pantalla decía «sin dueno», que no es una palabra
 * en ningún idioma. Una pantalla de proyecto se enseña en una junta.
 */
export const Senales = ({ senales }: { senales: Senal[] }) => (
  <>
    {senales.map(s => (
      <span className="pt-bandera" key={s} title={SENAL_NOMBRE[s]}>
        {SENAL_CORTO[s]}
      </span>
    ))}
  </>
)

/** El margen de un renglón, en calma: tener holgura no es una alarma. */
export const Margen = ({ dias: d }: { dias: number | null }) =>
  d === null
    ? <span className="pt-bandera ok" title="Falta la fecha para poder medirlo">margen desconocido</span>
    : d <= 0
      ? <span className="pt-bandera">sin margen</span>
      : <span className="pt-bandera ok">{d}d de margen</span>

export function Avatar({ persona, nombre = true }: { persona?: PersonaEnPlan; nombre?: boolean }) {
  if (!persona) {
    return (
      <span className="pt-avatar vacio" title="Nadie la tiene">
        <span className="ini">?</span>
        {nombre && <span className="nom">Sin dueño</span>}
      </span>
    )
  }
  // El color sale del nombre y es estable: la misma persona sale del mismo
  // color en todas las pantallas sin que nadie guarde un color por persona.
  const tono = (persona.nombre.charCodeAt(0) % 5) + 1
  return (
    <span className="pt-avatar" title={persona.nombre}>
      <span className="ini" style={{ background: `var(--grp-${tono})` }}>
        {iniciales(persona.nombre)}
      </span>
      {nombre && <span className="nom">{corto(persona.nombre)}</span>}
    </span>
  )
}

/**
 * La pista de avance, con la marca de lo esperado.
 *
 * `esperado` en `null` NO se dibuja en cero: sin fecha límite no hay nada que
 * esperar, y una marca pegada a la izquierda se lee como «vas adelantadísimo»
 * de algo que no se puede medir.
 */
export function Avance({
  real, esperado, cifras = true,
}: {
  real: number
  esperado?: number | null
  cifras?: boolean
}) {
  const esp = esperado ?? null
  const atras = esp !== null && real < esp ? esp - real : 0
  return (
    <div className="pt-avance">
      <div
        className="pista"
        role="img"
        aria-label={esp !== null
          ? `Avance ${real} por ciento, esperado hoy ${esp} por ciento`
          : `Avance ${real} por ciento, sin fecha para compararlo`}
      >
        <div className="real" style={{ width: `${Math.min(Math.max(real, 0), 100)}%` }} />
        {esp !== null && (
          <div
            className="esperado"
            style={{ left: `calc(${Math.min(esp, 100)}% - 1px)` }}
            title={`Esperado hoy: ${esp}%`}
          />
        )}
      </div>
      {cifras && (
        <div className="cifras">
          <span><b>{real}%</b> real</span>
          {esp !== null ? <span>{esp}% esperado</span> : <span>sin fecha que comparar</span>}
          {atras > 0 && <span className="abajo">{atras} pts abajo</span>}
        </div>
      )}
    </div>
  )
}

export function Kpi({
  etiqueta, valor, unidad, detalle, tono,
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

const ORDEN: Estatus[] = ['hecho', 'en_curso', 'abierto', 'bloqueado', 'cancelado']

export function Distribucion({ renglones }: { renglones: Renglon[] }) {
  const total = renglones.length || 1
  const cuenta = ORDEN
    .map(e => ({ estatus: e, n: renglones.filter(r => r.estatus === e).length }))
    .filter(c => c.n > 0)
  return (
    <div>
      <div className="pt-dist">
        {cuenta.map(c => (
          <span
            key={c.estatus}
            style={{ width: `${(c.n / total) * 100}%`, background: `var(--st-${CLASE_ESTATUS[c.estatus]})` }}
            title={`${ESTATUS_NOMBRE[c.estatus]}: ${c.n}`}
          />
        ))}
      </div>
      <div className="pt-leyenda">
        {cuenta.map(c => (
          <span key={c.estatus}>
            <i style={{ background: `var(--st-${CLASE_ESTATUS[c.estatus]})` }} />
            {ESTATUS_NOMBRE[c.estatus]} {c.n}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * El veredicto del plan, en una etiqueta.
 *
 * `sin_fechas` tiene su propio tono y no se pinta de verde: un plan al que no
 * se le puede medir el tiempo no está «en tiempo», y teñirlo así sería la
 * mentira más cómoda de toda la pantalla.
 */
export const Salud = ({ veredicto }: { veredicto: Veredicto }) => (
  <span className={`pt-salud ${SALUD[veredicto]}`} title={VEREDICTO_NOMBRE[veredicto]}>
    <i />
    {VEREDICTO_NOMBRE[veredicto]}
  </span>
)

/** La franja de color de una fase. Sale de su orden en el archivo. */
export const Franja = ({ orden }: { orden: number | null }) => (
  <span
    className="franja"
    style={{ width: 3, height: 14, borderRadius: 2, background: `var(--grp-${colorDeFase(orden)})` }}
  />
)
