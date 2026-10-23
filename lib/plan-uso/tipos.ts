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
  sponsors: number; org: { id: string; nombre: string } | null; conPmoPropio: number
  topes: Topes
  informados: { usados: number; tope: number }
}

export type VistaPlan = {
  plan: { clave: string; nombre: string; queEs: string; precioUsd: number }
  /** Los precios ya traen el IVA (#181). */
  tasaIva: number
  cuenta: CuentaPmo | null
  planes: Array<{ clave: string; nombre: string; queEs: string; precioUsd: number; mesesAnual: number; precioAnualUsd: number }>
  complementos: Array<{ clave: string; nombre: string; precioUsd: number; da: number; dice: string; mesesAnual: number; precioAnualUsd: number }>
  ajenas: Array<{ groupId: string; grupo: string; nombreRol: string; paga: Paga; ocupaLugar: boolean | null }>
  organizacion: { id: string; nombre: string; esAdmin: boolean } | null
  fiscal: { datos: DatosFiscales | null; cobros: Cobro[]; regimenes: Record<string, string>; usos: Record<string, string> }
  prueba: { expira: string; tipo: string } | null
  invitaciones: Array<{ codigo: string; nota: string | null; usado: boolean; vence: string | null; creado: string }> | null
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

// ─────────────────────────────── participaciones y organización (#180)

export type Paga = { quien: 'tu' | 'sponsor' | 'organizacion'; nombre: string | null }

export type Participacion = {
  groupId: string; grupo: string; clase: string; rol: string | null; nombreRol: string
  cajon: 'diriges' | 'ejecutas' | 'supervisas' | 'sigues'
  propio: boolean; paga: Paga; ocupaLugar: boolean | null
  proyectosActivos: number; misAbiertas: number; misVencidas: number
}

export type Ejecutivo = {
  groupId: string; grupo: string; hoy: string
  veredicto: 'sin_fechas' | 'atrasado' | 'al_dia' | 'adelantado'
  punto: { esperado: number | null; declarado: number; comprobado: number; total: number; cerrados: number }
  planes: string[]; abiertas: number
  criticos: Array<{ texto: string; quien: string | null; vence: string | null }>
  hitos: Array<{ texto: string; vence: string | null }>
  paga: Paga
}

export type VistaParticipaciones = { participaciones: Participacion[]; tablero: Ejecutivo[] }

export type UsoCuenta = {
  grupos: number; proyectosActivos: number; ejecutores: number; lideres: number
  stakeholders: number; monitores: number; creditos: number; avisos: number
}

export type VistaOrganizacion = {
  id: string; nombre: string; esAdmin: boolean; soyCuenta: boolean
  razonSocial: string | null; rfc: string | null; emailFactura: string | null
  cobro: 'tarjeta' | 'factura'; facturaAutorizada: boolean
  sponsors: number
  cuentas: Array<{ userId: string; etiqueta: string | null; centroCostos: string | null; desde: string; soyYo: boolean; plan: string; uso: UsoCuenta }>
  complementos: Record<string, number>
  uso: UsoCuenta & { conPmoPropio: number }
  topes: Topes | null
  informados: { usados: number; tope: number } | null
  invitaciones: Array<{ codigo: string; etiqueta: string | null; centroCostos: string | null; expira: string }> | null
  suscripcion: { id: string | null; estado: string; hasta: string | null } | null
  total: { mes: number; anio: number }
  fiscal: { datos: DatosFiscales | null; cobros: Cobro[] } | null
}

export const PAGA = (p: Paga): string =>
  p.quien === 'tu' ? 'Tu cuenta' : p.quien === 'organizacion' ? `Lo paga ${p.nombre ?? 'su organización'}` : `Lo paga ${p.nombre ?? 'el Sponsor'}`

// ─────────────────────────────── facturación (#181)
export type DatosFiscales = {
  quiereFactura: boolean; rfc: string; razonSocial: string; regimen: string; cp: string; usoCfdi: string; email: string
}
export type Cobro = {
  fecha: string; moneda: string; total: number; neto: number; iva: number
  facturaSolicitada: boolean; facturado: boolean; folio: string | null
}
