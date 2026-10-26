/**
 * La marca de los reportes (#202): lo que va en TODOS y no se puede quitar.
 *
 * La leyenda y el logo de Zaelyn PMO salen siempre, pequeños, en el pie de
 * cada página y de cada lámina. Los logos del sponsor y del cliente son los
 * que cada proyecto sube; éstos no.
 */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { DatosDeReporte, Ritmo } from '../api'

export const LEYENDA = 'Emitido por Zaelyn PMO by NE National Expertise · Houston / Monterrey'
export const PRODUCTO = 'Zaelyn PMO'

export const COLOR = {
  tinta: '#12151b', tinta2: '#4f5766', tinta3: '#646c7d', linea: '#e3e6ec', fondo: '#f4f5f8', riel: '#eceef3',
  marca: '#2f55f4', marcaSuave: '#e8edff', zaelyn: '#c2410c', noche: '#12151b',
  bien: '#1fa36b', riesgo: '#e89a0c', mal: '#d92d20', futuro: '#a8b0bf',
}
export const COLOR_RITMO: Record<Ritmo, string> = {
  hecho: COLOR.bien, bien: COLOR.marca, riesgo: COLOR.riesgo, atrasado: COLOR.mal, futuro: COLOR.futuro,
}
export const NOMBRE_RITMO: Record<Ritmo, string> = {
  hecho: 'Terminado', bien: 'En tiempo', riesgo: 'Ligeramente atrás', atrasado: 'Atrasado', futuro: 'Por empezar',
}
export const VEREDICTO: Record<DatosDeReporte['avance']['veredicto'], { texto: string; color: string }> = {
  al_dia: { texto: 'En tiempo', color: COLOR.bien },
  adelantado: { texto: 'Adelantado', color: COLOR.bien },
  atrasado: { texto: 'Atrasado', color: COLOR.mal },
  sin_fechas: { texto: 'Sin fechas para comparar', color: COLOR.tinta3 },
}

const MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const MES3 = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const fechaLarga = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} de ${MES[(m ?? 1) - 1]} de ${y}`
}
export const fechaCorta = (iso: string | null | undefined) => {
  if (!iso) return '—'
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return `${d} ${MES3[(m ?? 1) - 1]} ${String(y).slice(2)}`
}
export const horas = (min: number) => (min ? `${Math.round((min / 60) * 10) / 10} h` : '—')

export const periodoTexto = (d: DatosDeReporte) =>
  d.tipo === 'semanal' || d.tipo === 'facturacion'
    ? `${fechaCorta(d.periodo.desde)} al ${fechaCorta(d.periodo.hasta)}`
    : fechaLarga(d.periodo.hasta)

/** Qué secciones lleva cada tipo. Un kickoff no tiene «lo realizado». */
export type Seccion = 'datos' | 'equipo' | 'resumen' | 'arbol' | 'realizado' | 'atrasos' | 'siguiente' | 'hitos' | 'facturacion' | 'comentarios'
export const SECCIONES: Record<DatosDeReporte['tipo'], Seccion[]> = {
  kickoff: ['datos', 'equipo', 'arbol', 'hitos', 'siguiente', 'comentarios'],
  semanal: ['resumen', 'arbol', 'realizado', 'atrasos', 'siguiente', 'hitos', 'comentarios'],
  fase_inicio: ['resumen', 'arbol', 'siguiente', 'hitos', 'comentarios'],
  fase_cierre: ['resumen', 'arbol', 'realizado', 'atrasos', 'facturacion', 'comentarios'],
  golive: ['resumen', 'hitos', 'realizado', 'atrasos', 'siguiente', 'comentarios'],
  cierre: ['resumen', 'arbol', 'hitos', 'facturacion', 'comentarios', 'equipo'],
  facturacion: ['resumen', 'facturacion', 'realizado', 'comentarios'],
}

/** Lo que dice el reporte cuando quien lo emite no escribió algo: no se inventa. */
export const SIN_TEXTO = {
  causas: 'Sin causa registrada por quien emite el reporte.',
  acciones: 'Sin acciones registradas por quien emite el reporte.',
}

export type Logo = { datos: Buffer; mime: string }
export type Logos = { sponsor: Logo | null; cliente: Logo | null; zaelyn: Buffer }

let zaelyn: Promise<Buffer> | null = null
export const logoZaelyn = () => (zaelyn ??= readFile(join(process.cwd(), 'public', 'logo', 'zaelyn-logo-320.png')))
export const fuente = (n: string) => join(process.cwd(), 'lib', 'fuentes', n)
