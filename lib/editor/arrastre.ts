/**
 * Lo que se está arrastrando, compartido entre la paleta, el árbol y el
 * tablero.
 *
 * Durante un `dragover` el navegador no deja leer el contenido del arrastre
 * (es una protección: una página no debe poder espiar lo que pasa por
 * encima). Pero para pintar el destino en verde o rojo hay que saber QUÉ se
 * arrastra. Así que la carga vive aquí, en memoria de la página, y el
 * `dataTransfer` solo lleva una marca.
 */
import type { TipoNodo } from './tipos'

export type Carga = { id: string; tipo: TipoNodo } | { nuevo: TipoNodo }

let actual: Carga | null = null

export const MARCA = 'text/x-zaelyn-editor'

export function empezar(e: React.DragEvent, c: Carga): void {
  actual = c
  e.dataTransfer.setData(MARCA, '1')
  e.dataTransfer.effectAllowed = 'move'
}

export const carga = (): Carga | null => actual
export const terminar = (): void => { actual = null }
export const tipoDe = (c: Carga): TipoNodo => ('nuevo' in c ? c.nuevo : c.tipo)
