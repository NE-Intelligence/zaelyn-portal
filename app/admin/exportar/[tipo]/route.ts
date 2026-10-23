import { soyAdmin, tableroAdmin } from '@/lib/api'
import type { TableroAdmin } from '@/lib/admin/tipos'

const fecha = (x: string | null) => (x && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : undefined)
const peso = (c: number) => (c / 100).toFixed(2)

/** Una celda de CSV a prueba de comas, comillas y fórmulas de Excel. */
const celda = (v: unknown) => {
  let s = v === null || v === undefined ? '' : String(v)
  if (/^[=+\-@]/.test(s)) s = `'${s}`
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

function filas(tipo: string, d: TableroAdmin): (string | number | null)[][] | null {
  switch (tipo) {
    case 'libro':
      return [
        ['fecha', 'factura_stripe', 'moneda', 'neto', 'iva', 'total', 'tasa_iva', 'tipo_cambio', 'plan', 'pais', 'user_id', 'org_id', 'factura_solicitada', 'rfc', 'razon_social', 'folio_cfdi', 'facturado_en'],
        ...d.libro.map((x) => [x.fecha, x.stripeInvoice, x.moneda.toUpperCase(), peso(x.neto), peso(x.iva), peso(x.total), x.tasaIva, x.tipoCambio, x.plan, x.pais, x.userId, x.orgId, x.facturaSolicitada ? 'si' : 'no', x.rfc, x.razonSocial, x.folioCfdi, x.facturadoEn]),
      ]
    case 'poliza':
      return [['mes', 'moneda', 'total_sin_factura', 'iva'], ...d.facturacion.ivaPolizaGlobal.map((x) => [x.mes, x.moneda.toUpperCase(), peso(x.total), peso(x.iva)])]
    case 'dias':
      return [['dia', 'moneda', 'cobros', 'neto', 'iva', 'total'], ...d.ventas.porDia.map((x) => [x.dia, x.moneda.toUpperCase(), x.n, peso(x.neto), peso(x.iva), peso(x.total)])]
    case 'meses':
      return [['mes', 'moneda', 'cobros', 'neto', 'iva', 'total'], ...d.ventas.porMes.map((x) => [x.mes, x.moneda.toUpperCase(), x.n, peso(x.neto), peso(x.iva), peso(x.total)])]
    case 'planes':
      return [['plan', 'moneda', 'cobros', 'total'], ...d.ventas.porPlan.map((x) => [x.plan, x.moneda.toUpperCase(), x.n, peso(x.total)])]
    case 'paises':
      return [['pais', 'moneda', 'cobros', 'total'], ...d.ventas.porPais.map((x) => [x.pais, x.moneda.toUpperCase(), x.n, peso(x.total)])]
    case 'usuarios':
      return [
        ['dimension', 'valor', 'zona', 'usuarios'],
        ...d.usuarios.porPais.map((x) => ['pais', x.pais, x.region, x.n]),
        ...d.usuarios.porPlan.map((x) => ['plan', x.plan, null, x.n]),
      ]
    case 'complementos':
      return [['complemento', 'origen', 'cantidad', 'cuentas'], ...d.complementos.map((x) => [x.clave, x.origen, x.cantidad, x.cuentas])]
    case 'costos':
      return [['modulo', 'llamadas', 'costo_usd'], ...d.costos.iaPorModulo.map((x) => [x.modulo, x.llamadas, x.usd.toFixed(6)])]
    case 'conciliacion': {
      const c = d.conciliacion
      return [
        ['tipo', 'factura', 'fecha', 'moneda', 'stripe', 'zaelyn'],
        ...c.soloEnStripe.map((x) => ['solo_en_stripe', x.invoice, x.fecha, x.moneda.toUpperCase(), peso(x.total), null]),
        ...c.soloEnZaelyn.map((x) => ['solo_en_zaelyn', x.invoice, x.fecha, x.moneda.toUpperCase(), null, peso(x.total)]),
        ...c.diferencias.map((x) => ['monto_distinto', x.invoice, null, x.moneda.toUpperCase(), peso(x.stripe), peso(x.zaelyn)]),
      ]
    }
    default:
      return null
  }
}

/**
 * `GET /admin/exportar/<tipo>` — un reporte del tablero en CSV (#186).
 *
 * GET porque solo lee. Pasa por el mismo candado que la página: si el motor
 * no dice que eres administrador, 404. El CSV lleva BOM para que Excel abra
 * bien los acentos.
 */
export async function GET(req: Request, { params }: { params: Promise<{ tipo: string }> }) {
  const { tipo } = await params
  if (!(await soyAdmin())) return new Response('No encontrado', { status: 404 })
  const u = new URL(req.url)
  const desde = fecha(u.searchParams.get('desde'))
  const hasta = fecha(u.searchParams.get('hasta'))
  const r = await tableroAdmin(desde, hasta)
  if (!r.ok) return new Response('No disponible', { status: r.fallo === 'NO_LO_ENCUENTRO' ? 404 : 502 })
  const f = filas(tipo, r.dato)
  if (!f) return new Response('No encontrado', { status: 404 })
  const csv = '﻿' + f.map((x) => x.map(celda).join(',')).join('\r\n')
  const nombre = `zaelyn-${tipo}-${r.dato.periodo.desde}_${r.dato.periodo.hasta}.csv`
  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${nombre}"`,
      'cache-control': 'no-store',
    },
  })
}
