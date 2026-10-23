/**
 * Los textos legales, por idioma (#186).
 *
 * Cada documento es una lista de secciones; cada párrafo es un texto o, si es
 * un arreglo, una lista con viñetas. Así la página los pinta igual en los tres
 * idiomas y una traducción no puede romper el formato.
 *
 * Lo que todavía no está decidido se escribe [FALTA: …] y se ve en pantalla
 * como un hueco marcado: un domicilio o un correo inventados en un aviso de
 * privacidad son peores que un hueco.
 */
export type Parrafo = string | string[]
export type Seccion = { id: string; t: string; p: Parrafo[] }
export type Documento = { titulo: string; resumen: string; secciones: Seccion[] }
export type ClaveLegal = 'privacidad' | 'datos' | 'terminos' | 'deslinde'

export type TextosLegales = {
  ui: {
    etq: string
    indice: string
    version: string
    preliminar: string
    contenido: string
    otros: string
    volver: string
  }
  docs: Record<ClaveLegal, Documento>
}

export const ORDEN_LEGAL: ClaveLegal[] = ['privacidad', 'datos', 'terminos', 'deslinde']
