import type { Doc } from './tipos'

/**
 * Cómo se ENSEÑA el esfuerzo: en horas o en días de trabajo (Zaelyn #189).
 *
 * El documento guarda el esfuerzo SIEMPRE en horas; la unidad y la jornada
 * son la vista. La duración (`dias`) es otra cosa —cuánto dura en el
 * calendario— y no se convierte: cinco días de calendario con dos personas
 * son diez días de trabajo.
 */
export const JORNADA = 8
export const jornadaDe = (doc: Doc): number => doc.jornada ?? JORNADA
const r2 = (n: number) => Math.round(n * 100) / 100

/** Horas → el número que se enseña en el campo. */
export const aVista = (h: number, doc: Doc): number => (doc.unidad === 'dias' ? r2(h / jornadaDe(doc)) : h)
/** El número del campo → horas. */
export const deVista = (v: number, doc: Doc): number => (doc.unidad === 'dias' ? r2(v * jornadaDe(doc)) : v)

/** «40 h» o «5 d de trabajo». */
export function esfuerzoTexto(h: number, doc: Doc, corto = false): string {
  if (doc.unidad === 'dias') {
    const d = Math.round((h / jornadaDe(doc)) * 10) / 10
    return corto ? `${d} d trab.` : `${d} día${d === 1 ? '' : 's'} de trabajo`
  }
  return `${Math.round(h * 10) / 10} h`
}

export const NOMBRE_ESFUERZO = (doc: Doc): string =>
  doc.unidad === 'dias' ? `días de trabajo de ${jornadaDe(doc)} h` : 'horas'
