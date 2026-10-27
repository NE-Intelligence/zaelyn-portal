/**
 * Espejo LITERAL del tablero que arma el motor en `GET /portal/admin/tablero`
 * (#185 en Zaelyn, #186 aquí). El portal no suma ni agrupa nada de esto:
 * pinta lo que el motor midió. Montos en centavos de su moneda.
 */
export type Centavos = number

export type TableroAdmin = {
  generado: string
  periodo: { desde: string; hasta: string }
  usuarios: {
    total: number
    nuevosPeriodo: number
    activos30d: number
    porPais: { pais: string; region: string | null; n: number }[]
    porPlan: { plan: string; n: number }[]
    /** En prueba de 7 días hoy, y quienes la tuvieron y hoy pagan (#194). */
    enPrueba?: number
    pruebasConvertidas?: number
    altasPorMes: { mes: string; n: number }[]
  }
  suscripciones: { plan: string; estado: string; moneda: string; n: number }[]
  complementos: { clave: string; origen: string; cantidad: number; cuentas: number }[]
  ventas: {
    porDia: { dia: string; moneda: string; total: Centavos; neto: Centavos; iva: Centavos; n: number }[]
    porMes: { mes: string; moneda: string; total: Centavos; neto: Centavos; iva: Centavos; n: number }[]
    porPlan: { plan: string; moneda: string; total: Centavos; n: number }[]
    porPais: { pais: string; moneda: string; total: Centavos; n: number }[]
    totales: { moneda: string; total: Centavos; neto: Centavos; iva: Centavos; n: number; ticketPromedio: Centavos }[]
  }
  libro: {
    id: string
    stripeInvoice: string
    fecha: string
    moneda: string
    total: Centavos
    neto: Centavos
    iva: Centavos
    tasaIva: number
    tipoCambio: number | null
    userId: string | null
    orgId: string | null
    pais: string
    plan: string | null
    facturaSolicitada: boolean
    facturadoEn: string | null
    folioCfdi: string | null
    rfc: string | null
    razonSocial: string | null
  }[]
  costos: {
    iaUsd: number
    iaPorModulo: { modulo: string; usd: number; llamadas: number }[]
    consumo: { mes: string; concepto: string; cantidad: number }[]
  }
  facturacion: {
    solicitadas: number
    pendientes: number
    ivaPolizaGlobal: { mes: string; moneda: string; iva: Centavos; total: Centavos }[]
  }
  conciliacion: {
    disponible: boolean
    motivo?: string
    stripe: { moneda: string; total: Centavos; n: number }[]
    zaelyn: { moneda: string; total: Centavos; n: number }[]
    soloEnStripe: { invoice: string; fecha: string; moneda: string; total: Centavos }[]
    soloEnZaelyn: { invoice: string; fecha: string; moneda: string; total: Centavos }[]
    diferencias: { invoice: string; moneda: string; stripe: Centavos; zaelyn: Centavos }[]
    cuadra: boolean
  }
}
