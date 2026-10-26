/** Las fuentes de la marca para dibujar imágenes con `ImageResponse` (#200, #202). */
import { readFile } from 'node:fs/promises'
import { fuente } from './marca'

type FuenteOg = { name: string; data: Buffer; weight: 400 | 600 | 700; style: 'normal' }
let cargadas: Promise<FuenteOg[]> | null = null
export const fuentesOg = () => (cargadas ??= (async () => [
  { name: 'Prompt', data: await readFile(fuente('prompt-latin-400-normal.woff')), weight: 400 as const, style: 'normal' as const },
  { name: 'Prompt', data: await readFile(fuente('prompt-latin-600-normal.woff')), weight: 600 as const, style: 'normal' as const },
  { name: 'MuseoModerno', data: await readFile(fuente('museomoderno-latin-700-normal.woff')), weight: 700 as const, style: 'normal' as const },
])())
