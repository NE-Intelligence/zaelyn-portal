/**
 * «Plan y uso» (Zaelyn DECISIONS #179): lo que manda el motor, tal cual.
 * La pantalla no calcula topes: los pinta.
 */
export type Topes = {
  proyectosActivos: number; ejecutores: number; lideres: number
  monitoresIncluidos: number; informados: number; creditos: number; avisos: number
}

export type CuentaPmo = {
  ownerId: string; plan: string; grupos: number; proyectosActivos: number
  ejecutores: number; lideres: number; stakeholders: number; monitores: number
  creditos: number; avisos: number
  complementos: Record<string, number>
  topes: Topes
  informados: { usados: number; tope: number }
}

export type VistaPlan = {
  plan: { clave: string; nombre: string; queEs: string; precioUsd: number }
  cuenta: CuentaPmo | null
  planes: Array<{ clave: string; nombre: string; queEs: string; precioUsd: number }>
  complementos: Array<{ clave: string; nombre: string; precioUsd: number; da: number; dice: string }>
  cobro: { disponible: boolean; monedas: string[]; tipoCambio: Record<string, { valor: number; fecha: string; fuente: string }> }
  suscripcion: { estado: string; hasta: string | null; moneda: string | null; viva: boolean } | null
}

/** Un tope que el motor dijo que se alcanzó (402 · LIMITE). */
export type Limite = {
  que: string; usados: number; tope: number; esSponsor: boolean
  complemento: { clave: string; nombre: string; precioUsd: number; da: number }
}

/**
 * Los roles con su nombre de cara a la persona (#179). La clave del motor no
 * cambia; cambia lo que se lee.
 */
export const NOMBRE_DE_ROL: Record<string, string> = {
  administrador: 'Sponsor', lider: 'Líder', integrante: 'Ejecutor', observador: 'Monitor', stakeholder: 'Stakeholder',
  responsable: 'Guía', miembro: 'Integrante', a_cargo: 'A cargo', apoyo: 'Apoyo',
}
export const nombreDeRol = (r: string | null | undefined): string => (r ? NOMBRE_DE_ROL[r] ?? r : 'sin rol')
