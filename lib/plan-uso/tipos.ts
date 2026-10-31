/**
 * «Plan y uso» (Zaelyn DECISIONS #179): lo que manda el motor, tal cual.
 * La pantalla no calcula topes: los pinta.
 */
export type Topes = {
  /** null = sin tope. */
  proyectosActivos: number | null; ejecutores: number; lideres: number; supervisores?: number
  monitoresIncluidos: number; informados: number; creditos: number; avisos: number
}

export type CuentaPmo = {
  ownerId: string; plan: string; grupos: number; proyectosActivos: number
  ejecutores: number; lideres: number; supervisores?: number; stakeholders: number; monitores: number
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
  suscripcion: {
    estado: string; hasta: string | null; moneda: string | null; viva: boolean
    /** #192: el periodo, el próximo cargo y la cancelación programada. Opcionales mientras el motor no los mande. */
    desde?: string | null
    proximoCargo?: { fecha: string; totalCentavos: number; moneda: string } | null
    importeCentavos?: number | null
    cancelaAlFinal?: boolean
    termina?: string | null
    plan?: string
    complementos?: Array<{ clave: string; nombre: string; cantidad: number }>
  } | null
  /** #192: cada cobro con su periodo, su IVA y el estado de su factura. */
  historial?: Movimiento[]
  /** Beta 1 (#190): el tramo de fundador abierto, si lo hay. Opcional mientras el motor no lo mande. */
  fundador?: Fundadores
  /** El descuento que ya trae tu suscripción viva (fundador o promoción). */
  miDescuento?: { porcentaje: number; cupon: string } | null
}

/** `GET /portal/fundadores` (#190): tramos de 10 lugares al 75, 50 y 25%. */
export type Fundadores = { abierto: boolean; tramo: 75 | 50 | 25 | null; quedan: number; ocupados?: number; total?: number }

/** Un cobro en el historial (#192). Centavos de su moneda. */
export type Movimiento = {
  id: string; fecha: string; periodoDesde: string | null; periodoHasta: string | null; moneda: string
  totalCentavos: number; netoCentavos: number; ivaCentavos: number; descuentoCentavos: number | null
  urlStripe: string | null
  factura: 'emitida' | 'solicitada' | 'disponible' | 'global'
  folio: string | null
}

/** Los niveles que se pueden contratar por sí solos (#190). */
export type NivelDePaga = 'base' | 'family' | 'pro'

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
  pmo: 'PMO', supervisor: 'Supervisor',
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
