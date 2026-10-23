/**
 * El registro de horas en el portal (Zaelyn #191). Los tipos son los del
 * motor (`services/horas.ts`); aquí no se hacen cuentas que el motor no haya
 * hecho, salvo formato.
 */

export type TipoHora = 'trabajo' | 'disponibilidad'

export type RegistroHora = {
  id: string
  fecha: string
  minutos: number
  tipo: TipoHora
  groupId: string | null
  grupo: string | null
  pendienteId: string | null
  actividad: string | null
  etiqueta: string | null
  nota: string | null
  origen: 'chat' | 'portal' | 'cronometro'
}

export type Carga = { dias: number; nivel: 'leve' | 'alta' | 'extrema' | null; promedio: number }

export type OpcionesHoras = Array<{ groupId: string; grupo: string; actividades: Array<{ id: string; texto: string; cerrada: boolean }> }>

export type VistaHoras = {
  desde: string; hasta: string; hoy: string
  registros: RegistroHora[]
  porDia: Array<{ fecha: string; trabajo: number; disponibilidad: number }>
  totales: { trabajo: number; disponibilidad: number }
  carga: Carga
  cronometro: { desde: string; minutos: number } | null
  opciones: OpcionesHoras
  personal: boolean
  umbrales: { leve: number; alta: number; extrema: number; dias: number }
  envios: EnvioHoras[]
  /** id de registro → folio del envío que lo tiene cerrado. */
  cerrados: Record<string, string>
}

export type EstadoEnvio = 'enviado' | 'aprobado' | 'rechazado' | 'retirado'
export type EnvioHoras = {
  id: string; folio: string; groupId: string; grupo: string; desde: string; hasta: string
  estado: EstadoEnvio; trabajo: number; disponibilidad: number; enviadoEn: string; resueltoEn: string | null
  persona?: string; resueltoPor?: string | null; motivo?: string | null
}
export const ESTADO_ENVIO: Record<EstadoEnvio, string> = { enviado: 'Por aprobar', aprobado: 'Aprobado', rechazado: 'Rechazado', retirado: 'Retirado' }

export type ReporteProyecto = {
  groupId: string; grupo: string; desde: string; hasta: string
  registros: Array<RegistroHora & { persona: string }>
  envios: EnvioHoras[]
  puedeAprobar: boolean
  porPersona: Array<{ persona: string; trabajo: number; disponibilidad: number }>
  porActividad: Array<{ pendienteId: string | null; actividad: string; estimado: number | null; real: number; disponibilidad: number }>
  totales: { trabajo: number; disponibilidad: number }
}

export const horasTexto = (min: number): string => {
  const h = Math.floor(min / 60), m = Math.round(min % 60)
  if (!h) return `${m} min`
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}
export const enHoras = (min: number): string => (Math.round(min / 6) / 10).toLocaleString('es-MX')

const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const diaCorto = (f: string) => {
  const d = new Date(`${f}T12:00:00Z`)
  return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} ${MESES[d.getUTCMonth()]}`
}
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
export const mesLargo = (f: string) => `${MESES_LARGOS[Number(f.slice(5, 7)) - 1]} ${f.slice(0, 4)}`
export const sumarDias = (f: string, n: number) => {
  const d = new Date(`${f}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export type Periodo = 'semana' | 'mes'

/** El rango de una semana (lunes a domingo) o un mes que contiene a `ancla`. */
export function rangoDe(periodo: Periodo, ancla: string): { desde: string; hasta: string } {
  if (periodo === 'mes') {
    const desde = `${ancla.slice(0, 7)}-01`
    const sig = new Date(`${desde}T12:00:00Z`); sig.setUTCMonth(sig.getUTCMonth() + 1)
    return { desde, hasta: sumarDias(sig.toISOString().slice(0, 10), -1) }
  }
  const dow = new Date(`${ancla}T12:00:00Z`).getUTCDay()
  const desde = sumarDias(ancla, -((dow + 6) % 7))
  return { desde, hasta: sumarDias(desde, 6) }
}

/** El ancla del periodo anterior o siguiente. */
export function moverAncla(periodo: Periodo, ancla: string, n: number): string {
  if (periodo === 'semana') return sumarDias(ancla, 7 * n)
  const d = new Date(`${ancla.slice(0, 7)}-01T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + n)
  return d.toISOString().slice(0, 10)
}

export const esFecha = (x: unknown): x is string => typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x)

export const TIPO_DICE: Record<TipoHora, string> = { trabajo: 'Trabajo', disponibilidad: 'Disponibilidad o guardia' }
