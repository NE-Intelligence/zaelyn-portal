/**
 * Los cuatro niveles tal como se PUBLICAN (#186).
 *
 * Espejo de la fuente de verdad comercial —el modelo final de niveles del
 * 22 de octubre— y de `src/shared/planes.ts` del motor, ya con el 16% de IVA
 * encima del neto. Si cambia un precio, cambia allá primero y aquí después:
 * este archivo no decide nada, solo lo escribe en pantalla.
 *
 * Lo que todavía no tiene cifra decidida se queda como «por confirmar» en el
 * texto: un precio inventado aquí se convertiría en una promesa.
 */
import type { Clave } from './copy'

export type PlanPublico = {
  id: 'kickoff' | 'sprint' | 'tribu' | 'pmo'
  nombre: string
  /** USD al mes con IVA; null = gratis. */
  precio: string | null
  espacio: 'personal' | 'familia' | 'proyectos'
  para: Clave
  resumen: Clave
  cta: Clave
  incluye: Clave | null
  rasgos: Clave[]
  destacado?: boolean
}

export const PLANES_PUBLICOS: PlanPublico[] = [
  {
    id: 'kickoff', nombre: 'Kickoff', precio: null, espacio: 'personal',
    para: 'pc.para.k', resumen: 'z1.p', cta: 'pc.cta.k', incluye: null,
    rasgos: ['pc.k.1', 'pc.k.2', 'pc.k.3', 'pc.k.4', 'pc.k.5', 'pc.k.6'],
  },
  {
    id: 'sprint', nombre: 'Sprint', precio: '5.79', espacio: 'personal',
    para: 'pc.para.s', resumen: 'z2.p', cta: 'pc.cta.s', incluye: 'pc.inc.s',
    rasgos: ['pc.s.1', 'pc.s.2', 'pc.s.3', 'pc.s.4', 'pc.s.5', 'pc.s.6'],
  },
  {
    id: 'tribu', nombre: 'Tribu', precio: '15.07', espacio: 'familia',
    para: 'pc.para.t', resumen: 'z3.p', cta: 'pc.cta.t', incluye: 'pc.inc.tp',
    rasgos: ['pc.t.1', 'pc.t.2', 'pc.t.3', 'pc.t.4', 'pc.t.5', 'pc.t.6'],
  },
  {
    id: 'pmo', nombre: 'PMO', precio: '28.99', espacio: 'proyectos',
    para: 'pc.para.p', resumen: 'z4.p', cta: 'pc.cta.p', incluye: 'pc.inc.tp',
    rasgos: ['pc.p.1', 'pc.p.2', 'pc.p.3', 'pc.p.4', 'pc.p.5', 'pc.p.6'],
    destacado: true,
  },
]

/** Complementos de PMO publicados (USD al mes con IVA). */
export const COMPLEMENTOS_PMO: Clave[] = ['pz.comp.1', 'pz.comp.2', 'pz.comp.3', 'pz.comp.4', 'pz.comp.5', 'pz.comp.6', 'pc.comp.dec']
export const COMPLEMENTOS_TRIBU: Clave[] = ['pc.comp.t1', 'pc.comp.t2']

/**
 * La tabla comparativa. `true`/`false` se pintan como incluido / no incluido;
 * un texto es una cifra o un «por confirmar».
 */
type Celda = boolean | Clave | string
export const COMPARATIVA: { f: Clave; v: [Celda, Celda, Celda, Celda] }[] = [
  { f: 'pc.f.tg', v: [true, true, true, true] },
  { f: 'pc.f.wa', v: [false, '20', 'pc.v.conf', '100'] },
  { f: 'pc.f.ppe', v: [false, true, true, true] },
  { f: 'pc.f.pfa', v: [false, false, true, false] },
  { f: 'pc.f.ppr', v: [false, false, false, true] },
  { f: 'pc.f.ed', v: [false, false, false, true] },
  { f: 'pc.f.gr', v: [false, false, 'pc.v.fam', 'pc.v.proy'] },
  { f: 'pc.f.rec', v: ['5', '50', '100', '500'] },
  { f: 'pc.f.his', v: ['pc.v.15d', 'pc.v.1a', 'pc.v.1a', 'pc.v.sl'] },
  { f: 'pc.f.voz', v: ['5', '60', '120', '600'] },
  { f: 'pc.f.med', v: ['10', '200', '500', '2000'] },
]
