import type { Idioma } from '../copy'
import { legalEs } from './es'
import { legalEn } from './en'
import { legalPt } from './pt'
import type { TextosLegales } from './tipos'

export * from './tipos'

/** Los textos legales del idioma; si falta la traducción, rige el español. */
export function legal(lang: Idioma): TextosLegales {
  return (lang === 'en' ? legalEn : lang === 'pt' ? legalPt : null) ?? legalEs
}
