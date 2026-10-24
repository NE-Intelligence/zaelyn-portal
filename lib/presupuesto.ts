/** El presupuesto de un proyecto (Zaelyn #195). Tipos del motor (`services/presupuesto.ts`); montos en centavos. */
export type Tarifa = { personaId: string; persona: string; desde: string; centavos: number; moneda: string }
export type FilaPresupuesto = {
  id: string; actividad: string; persona: string | null; estimadoMin: number | null
  costoEstimado: number | null; avance: number; valorGanado: number | null; valorPlaneado: number | null
  realMin: number; costoReal: number; inicia: string | null; vence: string | null; sinTarifa: boolean
}
export type EstadoPresupuesto = {
  groupId: string; grupo: string; hoy: string; moneda: string
  aprobado: number | null
  bac: number; pv: number; ev: number; ac: number
  cpi: number | null; spi: number | null; eac: number | null; vac: number | null
  tarifas: Tarifa[]
  personas: Array<{ personaId: string; persona: string; tarifa: number | null; estimadoMin: number; costoEstimado: number; realMin: number; costoReal: number; disponibilidadMin: number }>
  actividades: FilaPresupuesto[]
  faltantes: { actividadesSinTarifa: number; horasSinTarifaMin: number; personasSinTarifa: string[] }
  disponibilidadMin: number
}
export const dinero = (c: number | null) => c === null ? '—' : `$${(c / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const dineroCorto = (c: number | null) => c === null ? '—' : `$${Math.round(c / 100).toLocaleString('es-MX')}`
export const horas = (m: number | null) => m === null ? '—' : (Math.round(m / 6) / 10).toLocaleString('es-MX')
