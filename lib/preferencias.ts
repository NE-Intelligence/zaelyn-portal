/**
 * Idioma y tema de quien visita (#186). Se leen en el SERVIDOR.
 *
 * Los dos viven en cookies de preferencia —no de sesión— para que la primera
 * pintura ya salga en el idioma y el tema correctos: si se decidieran en el
 * navegador, la página destellaría en español y en blanco antes de cambiar.
 *
 * Idioma: la cookie manda; sin cookie, el `Accept-Language` del navegador;
 * sin nada, español. Tema: `claro`, `oscuro` o `sistema` (lo que diga el
 * sistema operativo).
 */
import { cookies, headers } from 'next/headers'
import { IDIOMAS, type Idioma } from './copy'

export type Tema = 'claro' | 'oscuro' | 'sistema'
export const COOKIE_IDIOMA = 'zl'
export const COOKIE_TEMA = 'zt'

export const esIdioma = (x: unknown): x is Idioma => typeof x === 'string' && (IDIOMAS as readonly string[]).includes(x)

export async function idiomaActual(): Promise<Idioma> {
  const c = (await cookies()).get(COOKIE_IDIOMA)?.value
  if (esIdioma(c)) return c
  const al = (await headers()).get('accept-language') ?? ''
  for (const parte of al.split(',')) {
    const l = parte.trim().slice(0, 2).toLowerCase()
    if (esIdioma(l)) return l
  }
  return 'es'
}

export async function temaActual(): Promise<Tema> {
  const c = (await cookies()).get(COOKIE_TEMA)?.value
  return c === 'claro' || c === 'oscuro' ? c : 'sistema'
}

/** El `lang` de HTML y el locale de Open Graph por idioma. */
export const LANG_HTML: Record<Idioma, string> = { es: 'es-MX', en: 'en', pt: 'pt-BR' }
export const LOCALE_OG: Record<Idioma, string> = { es: 'es_MX', en: 'en_US', pt: 'pt_BR' }
