/**
 * Espejo LITERAL de `EstadoDePersona` del motor (`src/services/persona-estado.ts`).
 *
 * Ref: DECISIONS #184, #164, #183
 *
 * La misma regla que `plan.ts` y `familia.ts`: el portal recibe a la persona
 * ya medida —qué le toca hoy en cada grupo, qué choca, qué venció, su racha—
 * y no abre una sola consulta ni suma nada. Si a la pantalla le falta una
 * cuenta, se le pide al contrato.
 */
import type { Participacion } from './plan-uso/tipos'

export type Estatus = 'abierto' | 'en_curso' | 'bloqueado' | 'hecho' | 'cancelado'

export type EntradaDelDia =
  | { tipo: 'recordatorio' | 'evento'; id: string; texto: string; inicio: string; hhmm: string; grupo: string | null }
  | { tipo: 'encargo'; texto: string; hhmm: string | null; hora: string | null; grupo: string; hecho: boolean }
  | { tipo: 'fuera'; texto: string; inicio: string; hhmm: string | null; diaCompleto: boolean; cuenta: string }
  | { tipo: 'vence'; pendienteId: string; texto: string; grupo: string; estatus: Estatus }

export type DiaPersonal = { fecha: string; entradas: EntradaDelDia[] }

export type AlertaPersonal =
  | { tipo: 'hueco'; hora: string | null; texto: string }
  | { tipo: 'choque'; hhmm: string; cosas: string[] }
  | { tipo: 'vencida'; texto: string; grupo: string; vence: string }
  | { tipo: 'por_aprobar'; grupo: string; groupId: string; cuantos: number }
  | { tipo: 'agenda_parcial' }

export type Foco = { texto: string; porque: string; grupo: string | null }

export type MiPendiente = {
  pendienteId: string; groupId: string; grupo: string; plan: string
  texto: string; vence: string | null; estatus: Estatus; avance: number; vencida: boolean
}

export type Habito = {
  nombre: string; unidad: string | null; meta: number; cadencia: 'diaria' | 'semanal'
  dias: Array<{ dia: string; total: number; cumplido: boolean }>
  hoy: number
  racha: number
}

export type EstadoDePersona = {
  hoy: string
  tz: string
  dias: DiaPersonal[]
  alertas: AlertaPersonal[]
  foco: Foco[]
  compromisos: { participaciones: Participacion[]; pendientes: MiPendiente[] }
  habitos: Habito[]
  proximo: { texto: string; cuando: string } | null
  agendaConectada: boolean
  /** Lo agrega la ruta: el plan de quien mira. */
  plan?: { clave: string; nombre: string }
}

// ── lo que la pantalla sí puede saber: cómo se dice cada cosa

export const VISTAS_PERSONA = {
  hoy: 'Dónde estoy parado',
  compromisos: 'Mis compromisos',
  calendario: 'Calendario',
  habitos: 'Hábitos',
} as const
export type VistaPersona = keyof typeof VISTAS_PERSONA

export function esVistaPersona(v: string | string[] | undefined): VistaPersona {
  const uno = Array.isArray(v) ? v[0] : v
  return uno && uno in VISTAS_PERSONA ? (uno as VistaPersona) : 'hoy'
}

/** De dónde viene una entrada, como se lee: el grupo, «tuyo» o la cuenta de fuera. */
export function lugarDe(e: EntradaDelDia): string {
  if (e.tipo === 'fuera') return e.cuenta
  return e.grupo ?? 'Tuyo'
}

export const TIPO_ENTRADA: Record<EntradaDelDia['tipo'], string> = {
  recordatorio: 'Recordatorio', evento: 'Evento', encargo: 'Encargo', fuera: 'Agenda', vence: 'Vence',
}
