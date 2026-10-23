/**
 * Espejo LITERAL de `EstadoDeFamilia` del motor (`src/services/familia-estado.ts`).
 *
 * Ref: DECISIONS #183, #164
 *
 * La misma regla que `plan.ts`: el portal recibe la familia ya medida —quién
 * recoge a quién, quién se quedó sin responsable, cuántos puntos lleva cada
 * quien— y no abre una sola consulta ni suma nada. Si a la pantalla le falta
 * una cuenta, se le pide al contrato.
 */

export type Accion = 'llevar' | 'recoger'

export type Traslado = {
  accion: Accion
  quien: string | null
  quienId: string | null
  hecho: boolean
  por: string
}

export type EventoDelDia = {
  actividadId: string
  titulo: string
  de: string | null
  personaId: string | null
  inicio: string | null
  fin: string | null
  estado: 'ocurre' | 'por_confirmar' | 'no_hay'
  motivo: string | null
  traslados: Traslado[]
}

export type QuehacerDelDia = { tareaId: string; titulo: string; de: string | null; puntos: number; hecho: boolean }

export type DiaDeFamilia = {
  fecha: string
  festivo: string | null
  eventos: EventoDelDia[]
  quehaceres: QuehacerDelDia[]
  fechas: string[]
}

export type AlertaDeFamilia =
  | { tipo: 'sin_responsable'; fecha: string; titulo: string; de: string | null; accion: Accion; hora: string | null }
  | { tipo: 'choque'; fecha: string; quien: string; hora: string; cosas: string[] }
  | { tipo: 'por_confirmar'; fecha: string; titulo: string; nombre: string }
  | { tipo: 'por_aprobar'; cuantos: number; puntos: number }
  | { tipo: 'fecha_cerca'; titulo: string; faltan: number }

export type EstadoDeFamilia = {
  grupo: { id: string; nombre: string; clase: string }
  hoy: string
  yo: { personaId: string | null; rol: string | null; rolDicho: string; guia: boolean }
  personas: Array<{ id: string; nombre: string; rol: string | null; rolDicho: string; aCargo: boolean
    conCuenta: boolean; cuidadoPor: string[] }>
  dias: DiaDeFamilia[]
  alertas: AlertaDeFamilia[]
  tablero: Array<{ personaId: string; nombre: string; saldo: number; porAprobar: number; semana: number }>
  quehaceres: Array<{ id: string; titulo: string; de: string | null; puntos: number; cuando: string | null }>
  porAprobar: Array<{ de: string; titulo: string; puntos: number; fecha: string }>
  premios: Array<{ titulo: string; puntos: number }>
  medallero: Array<{ personaId: string; nombre: string; medallas: number; trofeos: number; reconocimientos: number
    partidos: number; disciplinas: string[] }>
  logros: Array<{ de: string; tipo: string; titulo: string; disciplina: string | null; fecha: string }>
  fechas: Array<{ titulo: string; tipo: string; de: string | null; fecha: string; faltan: number; cumple: number | null }>
}

// ── lo que la pantalla sí puede saber: cómo se dice cada cosa

export const VISTAS_FAMILIA = {
  hoy: 'Hoy en casa',
  calendario: 'Calendario',
  traslados: 'Traslados',
  quehaceres: 'Quehaceres y premios',
  medallero: 'Medallero',
  fechas: 'Fechas',
} as const
export type VistaFamilia = keyof typeof VISTAS_FAMILIA

export function esVistaFamilia(v: string | string[] | undefined): VistaFamilia {
  const uno = Array.isArray(v) ? v[0] : v
  return uno && uno in VISTAS_FAMILIA ? (uno as VistaFamilia) : 'hoy'
}

/** RRULE → palabras, para la lista de quehaceres. Traducción, no cálculo. */
export function cuandoEnPalabras(regla: string | null): string {
  if (!regla) return 'cuando se haga'
  if (/FREQ=DAILY/.test(regla)) return 'todos los días'
  const m = /BYDAY=([A-Z,]+)/.exec(regla)
  if (!m) return 'cada semana'
  const N: Record<string, string> = { MO: 'lun', TU: 'mar', WE: 'mié', TH: 'jue', FR: 'vie', SA: 'sáb', SU: 'dom' }
  const d = m[1]!.split(',')
  if (d.join() === 'MO,TU,WE,TH,FR') return 'entre semana'
  if (d.join() === 'SA,SU') return 'fines de semana'
  return d.map(x => N[x] ?? x).join(' · ')
}

/** Un color estable por persona, de los seis del sistema. */
export function colorDePersona(personas: EstadoDeFamilia['personas'], id: string | null): string {
  if (!id) return 'var(--ink-3)'
  const i = personas.findIndex(p => p.id === id)
  return `var(--grp-${(Math.max(i, 0) % 6) + 1})`
}

export const ICONO_LOGRO: Record<string, string> = {
  medalla: '🥇', trofeo: '🏆', resultado: '⚽', reconocimiento: '🎖️', marca: '⏱️',
}
