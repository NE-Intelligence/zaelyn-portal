import Link from 'next/link'
import type { TableroAdmin } from '@/lib/admin/tipos'
import { complemento, dia, dinero, entero, mes, pais, plan, usd } from '@/lib/admin/formato'

export const VISTAS_ADMIN = [
  ['resumen', 'Resumen'],
  ['ventas', 'Ventas'],
  ['libro', 'Libro contable'],
  ['usuarios', 'Usuarios'],
  ['uso', 'Uso y costos'],
  ['conciliacion', 'Conciliación Stripe'],
  ['reportes', 'Reportes'],
] as const
export type VistaAdmin = (typeof VISTAS_ADMIN)[number][0]
export const esVistaAdmin = (v: unknown): VistaAdmin =>
  (VISTAS_ADMIN.map((x) => x[0]) as string[]).includes(String(v)) ? (v as VistaAdmin) : 'resumen'

/* ── piezas ─────────────────────────────────────────────────────────── */

function Cifra({ k, v, sub, tono }: { k: string; v: string; sub?: string; tono?: 'bien' | 'mal' }) {
  return (
    <div className={`ad-cifra${tono ? ` ${tono}` : ''}`}>
      <span className="k">{k}</span>
      <span className="v">{v}</span>
      {sub && <span className="s">{sub}</span>}
    </div>
  )
}

function Vacio({ t, p }: { t: string; p: string }) {
  return (
    <div className="pt-vacio">
      <b>{t}</b>
      <span>{p}</span>
    </div>
  )
}

/**
 * Barras de una sola serie. Una serie no lleva leyenda: el título la nombra.
 * Cada barra trae su `<title>` (tooltip nativo) y el área de toque es la
 * columna entera, no solo la barra.
 */
function Barras({ datos, etiqueta, valor, titulo }: {
  datos: { x: string; y: number }[]
  etiqueta: (x: string) => string
  valor: (y: number) => string
  titulo: string
}) {
  if (!datos.length) return null
  const max = Math.max(...datos.map((d) => d.y), 1)
  const an = 640
  const al = 180
  const paso = an / datos.length
  const barra = Math.min(36, paso - 6)
  return (
    <figure className="ad-grafica">
      <figcaption>{titulo}</figcaption>
      <svg viewBox={`0 0 ${an} ${al + 26}`} role="img" aria-label={titulo}>
        <line x1="0" x2={an} y1={al} y2={al} className="eje" />
        {datos.map((d, i) => {
          const h = Math.max(d.y > 0 ? 3 : 0, (d.y / max) * (al - 18))
          const x = i * paso + (paso - barra) / 2
          return (
            <g key={d.x} className="col">
              <title>{`${etiqueta(d.x)}: ${valor(d.y)}`}</title>
              <rect x={i * paso} y="0" width={paso} height={al} className="toque" />
              <path
                className="barra"
                d={h > 0 ? `M${x},${al} v${-(h - 4)} q0,-4 4,-4 h${barra - 8} q4,0 4,4 v${h - 4} z` : ''}
              />
              {datos.length <= 14 && (
                <text x={i * paso + paso / 2} y={al + 17} textAnchor="middle" className="et">{etiqueta(d.x)}</text>
              )}
            </g>
          )
        })}
        <text x="0" y="11" className="et">{valor(max)}</text>
      </svg>
    </figure>
  )
}

function Tabla({ cab, filas, derecha = [], vacio }: { cab: string[]; filas: (string | number)[][]; derecha?: number[]; vacio?: string }) {
  if (!filas.length) return <p className="ad-nada">{vacio ?? 'Sin movimientos en el periodo.'}</p>
  return (
    <div className="ad-tabla-caja" tabIndex={0}>
      <table className="ad-tabla">
        <thead>
          <tr>{cab.map((c, i) => <th key={i} className={derecha.includes(i) ? 'der' : undefined}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i}>{f.map((c, j) => <td key={j} className={derecha.includes(j) ? 'der' : undefined}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Tarjeta({ t, sub, children, ancho }: { t: string; sub?: string; children: React.ReactNode; ancho?: boolean }) {
  return (
    <section className={`pt-tarjeta ad-tarjeta${ancho ? ' ancho' : ''}`}>
      <header>
        <h2>{t}</h2>
        {sub && <span className="pt-overline">{sub}</span>}
      </header>
      {children}
    </section>
  )
}

/* ── vistas ─────────────────────────────────────────────────────────── */

function Resumen({ d }: { d: TableroAdmin }) {
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
  const mesActual = hoy.slice(0, 7)
  const activas = d.suscripciones.filter((s) => s.estado === 'active' || s.estado === 'trialing').reduce((n, s) => n + s.n, 0)
  const c = d.conciliacion
  return (
    <>
      {d.ventas.totales.length === 0 ? (
        <div className="ad-cifras">
          <Cifra k="Ingresos del periodo" v={dinero(0, 'MXN')} sub="Sin cobros confirmados por Stripe" />
          <Cifra k="Venta promedio" v="—" sub="Aparece con el primer cobro" />
          <Cifra k="Venta de hoy" v={dinero(0, 'MXN')} />
          <Cifra k="Venta del mes" v={dinero(0, 'MXN')} />
        </div>
      ) : (
        d.ventas.totales.map((m) => {
          const hoyV = d.ventas.porDia.find((x) => x.dia === hoy && x.moneda === m.moneda)
          const mesV = d.ventas.porMes.find((x) => x.mes === mesActual && x.moneda === m.moneda)
          return (
            <div className="ad-cifras" key={m.moneda}>
              <Cifra k={`Ingresos del periodo · ${m.moneda.toUpperCase()}`} v={dinero(m.total, m.moneda)} sub={`Neto ${dinero(m.neto, m.moneda)} · IVA ${dinero(m.iva, m.moneda)}`} />
              <Cifra k="Venta promedio" v={dinero(m.ticketPromedio, m.moneda)} sub={`${entero(m.n)} cobros`} />
              <Cifra k="Venta de hoy" v={dinero(hoyV?.total ?? 0, m.moneda)} sub={`${hoyV?.n ?? 0} cobros`} />
              <Cifra k="Venta del mes" v={dinero(mesV?.total ?? 0, m.moneda)} sub={`${mesV?.n ?? 0} cobros`} />
            </div>
          )
        })
      )}
      <div className="ad-cifras">
        <Cifra k="Usuarios" v={entero(d.usuarios.total)} sub={`${entero(d.usuarios.nuevosPeriodo)} nuevos en el periodo`} />
        <Cifra k="Activos 30 días" v={entero(d.usuarios.activos30d)} sub={d.usuarios.total ? `${Math.round((d.usuarios.activos30d / d.usuarios.total) * 100)}% del total` : undefined} />
        <Cifra k="Suscripciones vivas" v={entero(activas)} />
        <Cifra
          k="Conciliación con Stripe"
          v={!c.disponible ? 'No disponible' : c.cuadra ? 'Cuadra' : 'No cuadra'}
          sub={!c.disponible ? (c.motivo === 'SIN_STRIPE' ? 'El motor no tiene llave de Stripe' : 'Stripe no contestó') : `${c.soloEnStripe.length + c.soloEnZaelyn.length + c.diferencias.length} diferencias`}
          tono={c.disponible ? (c.cuadra ? 'bien' : 'mal') : undefined}
        />
      </div>
      <div className="ad-dos">
        <Tarjeta t="Ventas por mes" sub="Total con IVA">
          {d.ventas.porMes.length ? (
            d.ventas.totales.map((m) => (
              <Barras
                key={m.moneda}
                titulo={m.moneda.toUpperCase()}
                datos={d.ventas.porMes.filter((x) => x.moneda === m.moneda).map((x) => ({ x: x.mes, y: x.total }))}
                etiqueta={mes}
                valor={(y) => dinero(y, m.moneda)}
              />
            ))
          ) : (
            <Vacio t="Todavía no hay ventas" p="Cuando Stripe confirme el primer cobro aparece aquí, con su IVA ya separado." />
          )}
        </Tarjeta>
        <Tarjeta t="Usuarios por plan">
          <Tabla cab={['Plan', 'Usuarios']} derecha={[1]} filas={d.usuarios.porPlan.map((p) => [plan(p.plan), entero(p.n)])} vacio="Sin usuarios." />
          <p className="ad-nota">
            En prueba hoy: <b>{entero(d.usuarios.enPrueba ?? 0)}</b> · pruebas que ya pagan: <b>{entero(d.usuarios.pruebasConvertidas ?? 0)}</b>
          </p>
          <p className="ad-nota">
            Facturas solicitadas: <b>{d.facturacion.solicitadas}</b> · pendientes de emitir: <b>{d.facturacion.pendientes}</b>
          </p>
        </Tarjeta>
      </div>
    </>
  )
}

function Ventas({ d }: { d: TableroAdmin }) {
  return (
    <>
      <Tarjeta t="Ventas por día" sub="Con IVA desglosado" ancho>
        {d.ventas.totales.map((m) => (
          <Barras
            key={m.moneda}
            titulo={`Venta diaria · ${m.moneda.toUpperCase()}`}
            datos={d.ventas.porDia.filter((x) => x.moneda === m.moneda).map((x) => ({ x: x.dia, y: x.total }))}
            etiqueta={dia}
            valor={(y) => dinero(y, m.moneda)}
          />
        ))}
        <Tabla
          cab={['Día', 'Moneda', 'Cobros', 'Neto', 'IVA', 'Total']}
          derecha={[2, 3, 4, 5]}
          filas={[...d.ventas.porDia].reverse().map((x) => [dia(x.dia), x.moneda.toUpperCase(), x.n, dinero(x.neto, x.moneda), dinero(x.iva, x.moneda), dinero(x.total, x.moneda)])}
        />
      </Tarjeta>
      <div className="ad-dos">
        <Tarjeta t="Ventas por mes">
          <Tabla
            cab={['Mes', 'Moneda', 'Cobros', 'Neto', 'IVA', 'Total']}
            derecha={[2, 3, 4, 5]}
            filas={[...d.ventas.porMes].reverse().map((x) => [mes(x.mes), x.moneda.toUpperCase(), x.n, dinero(x.neto, x.moneda), dinero(x.iva, x.moneda), dinero(x.total, x.moneda)])}
          />
        </Tarjeta>
        <Tarjeta t="Ventas por plan">
          <Tabla cab={['Plan', 'Moneda', 'Cobros', 'Total']} derecha={[2, 3]} filas={d.ventas.porPlan.map((x) => [plan(x.plan), x.moneda.toUpperCase(), x.n, dinero(x.total, x.moneda)])} />
        </Tarjeta>
        <Tarjeta t="Ventas por país">
          <Tabla cab={['País', 'Moneda', 'Cobros', 'Total']} derecha={[2, 3]} filas={d.ventas.porPais.map((x) => [pais(x.pais), x.moneda.toUpperCase(), x.n, dinero(x.total, x.moneda)])} />
        </Tarjeta>
        <Tarjeta t="Complementos vivos" sub="Compra de adicionales">
          <Tabla cab={['Complemento', 'Origen', 'Cantidad', 'Cuentas']} derecha={[2, 3]} filas={d.complementos.map((x) => [complemento(x.clave), x.origen === 'stripe' ? 'Stripe' : 'Cortesía', entero(x.cantidad), entero(x.cuentas)])} vacio="Nadie ha comprado complementos todavía." />
        </Tarjeta>
      </div>
    </>
  )
}

function Libro({ d, q }: { d: TableroAdmin; q: string }) {
  return (
    <Tarjeta t="Libro de ventas" sub={`${d.libro.length} cobros`} ancho>
      <p className="ad-nota">
        Un renglón por factura de Stripe pagada. El IVA se separa del total con la tasa que viajó en el cobro. Los datos fiscales son la foto del día del pago.{' '}
        <a href={`/admin/exportar/libro${q}`}>Descargar CSV</a>
      </p>
      <Tabla
        cab={['Fecha', 'Factura Stripe', 'Plan', 'País', 'Neto', 'IVA', 'Total', 'T. C.', 'RFC', 'CFDI']}
        derecha={[4, 5, 6, 7]}
        filas={d.libro.map((x) => [
          dia(x.fecha),
          x.stripeInvoice,
          plan(x.plan),
          pais(x.pais),
          dinero(x.neto, x.moneda),
          dinero(x.iva, x.moneda),
          dinero(x.total, x.moneda),
          x.tipoCambio ? x.tipoCambio.toFixed(4) : '—',
          x.rfc ?? (x.facturaSolicitada ? 'Solicitada' : 'Público en general'),
          x.folioCfdi ?? (x.facturaSolicitada ? 'Pendiente' : 'Póliza global'),
        ])}
        vacio="Sin cobros en el periodo."
      />
      <h3 className="ad-h3">IVA para la póliza global</h3>
      <Tabla
        cab={['Mes', 'Moneda', 'Total sin factura', 'IVA']}
        derecha={[2, 3]}
        filas={d.facturacion.ivaPolizaGlobal.map((x) => [mes(x.mes), x.moneda.toUpperCase(), dinero(x.total, x.moneda), dinero(x.iva, x.moneda)])}
        vacio="Nada que llevar a la póliza global en el periodo."
      />
    </Tarjeta>
  )
}

function Usuarios({ d }: { d: TableroAdmin }) {
  return (
    <>
      <div className="ad-cifras">
        <Cifra k="Usuarios" v={entero(d.usuarios.total)} />
        <Cifra k="Nuevos en el periodo" v={entero(d.usuarios.nuevosPeriodo)} />
        <Cifra k="Activos 30 días" v={entero(d.usuarios.activos30d)} />
        <Cifra k="Países" v={entero(new Set(d.usuarios.porPais.map((p) => p.pais)).size)} />
      </div>
      <div className="ad-dos">
        <Tarjeta t="Altas por mes">
          <Barras titulo="Usuarios nuevos" datos={d.usuarios.altasPorMes.map((x) => ({ x: x.mes, y: x.n }))} etiqueta={mes} valor={entero} />
        </Tarjeta>
        <Tarjeta t="Por país y zona" sub="País derivado de la zona horaria cuando falta">
          <Tabla cab={['País', 'Zona', 'Usuarios']} derecha={[2]} filas={d.usuarios.porPais.map((x) => [pais(x.pais), x.region ?? '—', entero(x.n)])} />
        </Tarjeta>
        <Tarjeta t="Por nivel de Zaelyn">
          <Tabla cab={['Plan', 'Usuarios']} derecha={[1]} filas={d.usuarios.porPlan.map((x) => [plan(x.plan), entero(x.n)])} />
        </Tarjeta>
        <Tarjeta t="Suscripciones">
          <Tabla cab={['Plan', 'Estado', 'Moneda', 'Cuentas']} derecha={[3]} filas={d.suscripciones.map((x) => [plan(x.plan), x.estado, x.moneda.toUpperCase(), entero(x.n)])} vacio="Sin suscripciones de paga todavía." />
        </Tarjeta>
      </div>
    </>
  )
}

function Uso({ d }: { d: TableroAdmin }) {
  return (
    <>
      <div className="ad-cifras">
        <Cifra k="Costo de IA del periodo" v={usd(d.costos.iaUsd)} sub="Lo que cobró el proveedor de modelos" />
        <Cifra k="Llamadas al modelo" v={entero(d.costos.iaPorModulo.reduce((n, m) => n + m.llamadas, 0))} />
      </div>
      <div className="ad-dos">
        <Tarjeta t="IA por módulo">
          <Tabla cab={['Módulo', 'Llamadas', 'Costo']} derecha={[1, 2]} filas={d.costos.iaPorModulo.map((x) => [x.modulo, entero(x.llamadas), usd(x.usd)])} vacio="Sin llamadas al modelo en el periodo." />
        </Tarjeta>
        <Tarjeta t="Consumo mensual" sub="Créditos de IA y avisos">
          <Tabla cab={['Mes', 'Concepto', 'Cantidad']} derecha={[2]} filas={d.costos.consumo.map((x) => [mes(x.mes), x.concepto, entero(x.cantidad)])} vacio="Sin consumo registrado." />
        </Tarjeta>
      </div>
    </>
  )
}

function Conciliacion({ d }: { d: TableroAdmin }) {
  const c = d.conciliacion
  if (!c.disponible) {
    return (
      <Tarjeta t="Conciliación contra Stripe" ancho>
        <Vacio
          t="No se pudo conciliar"
          p={c.motivo === 'SIN_STRIPE' ? 'El motor no tiene configurada la llave de Stripe, así que no hay contra qué comparar.' : 'Stripe no contestó a tiempo. El resto del tablero sí está al día; vuelve a intentarlo en un momento.'}
        />
      </Tarjeta>
    )
  }
  const monedas = Array.from(new Set([...c.stripe.map((x) => x.moneda), ...c.zaelyn.map((x) => x.moneda)]))
  return (
    <>
      <div className="ad-cifras">
        <Cifra k="Estado" v={c.cuadra ? 'Cuadra' : 'No cuadra'} tono={c.cuadra ? 'bien' : 'mal'} />
        <Cifra k="Solo en Stripe" v={entero(c.soloEnStripe.length)} sub="Pagado y sin registrar en Zaelyn" tono={c.soloEnStripe.length ? 'mal' : undefined} />
        <Cifra k="Solo en Zaelyn" v={entero(c.soloEnZaelyn.length)} sub="Registrado y sin pago en Stripe" tono={c.soloEnZaelyn.length ? 'mal' : undefined} />
        <Cifra k="Montos distintos" v={entero(c.diferencias.length)} tono={c.diferencias.length ? 'mal' : undefined} />
      </div>
      <Tarjeta t="Totales" ancho>
        <Tabla
          cab={['Moneda', 'Stripe · cobros', 'Stripe · total', 'Zaelyn · cobros', 'Zaelyn · total', 'Diferencia']}
          derecha={[1, 2, 3, 4, 5]}
          filas={monedas.map((m) => {
            const s = c.stripe.find((x) => x.moneda === m)
            const z = c.zaelyn.find((x) => x.moneda === m)
            return [m.toUpperCase(), s?.n ?? 0, dinero(s?.total ?? 0, m), z?.n ?? 0, dinero(z?.total ?? 0, m), dinero((s?.total ?? 0) - (z?.total ?? 0), m)]
          })}
          vacio="Ni Stripe ni Zaelyn tienen cobros en el periodo: cuadra en cero."
        />
      </Tarjeta>
      {c.soloEnStripe.length > 0 && (
        <Tarjeta t="Pagado en Stripe, no registrado en Zaelyn" sub="Revisar el webhook" ancho>
          <Tabla cab={['Fecha', 'Factura', 'Total']} derecha={[2]} filas={c.soloEnStripe.map((x) => [dia(x.fecha), x.invoice, dinero(x.total, x.moneda)])} />
        </Tarjeta>
      )}
      {c.soloEnZaelyn.length > 0 && (
        <Tarjeta t="Registrado en Zaelyn, no encontrado en Stripe" ancho>
          <Tabla cab={['Fecha', 'Factura', 'Total']} derecha={[2]} filas={c.soloEnZaelyn.map((x) => [dia(x.fecha), x.invoice, dinero(x.total, x.moneda)])} />
        </Tarjeta>
      )}
      {c.diferencias.length > 0 && (
        <Tarjeta t="Montos que no coinciden" ancho>
          <Tabla cab={['Factura', 'Stripe', 'Zaelyn', 'Diferencia']} derecha={[1, 2, 3]} filas={c.diferencias.map((x) => [x.invoice, dinero(x.stripe, x.moneda), dinero(x.zaelyn, x.moneda), dinero(x.stripe - x.zaelyn, x.moneda)])} />
        </Tarjeta>
      )}
    </>
  )
}

const REPORTES = [
  ['libro', 'Libro de ventas', 'Contable: cada cobro con neto, IVA, total, tipo de cambio, RFC y folio CFDI.'],
  ['poliza', 'IVA para póliza global', 'Contable: lo cobrado sin factura, por mes y moneda, con su IVA.'],
  ['dias', 'Ventas por día', 'Financiero: venta diaria con neto e IVA.'],
  ['meses', 'Ventas por mes', 'Financiero: venta mensual con neto e IVA.'],
  ['planes', 'Ventas por plan', 'Comercial: qué nivel vende y cuánto.'],
  ['paises', 'Ventas por país', 'Comercial: dónde se vende.'],
  ['usuarios', 'Usuarios por país y plan', 'Comercial: base instalada por zona y nivel.'],
  ['complementos', 'Complementos vivos', 'Comercial: compra de adicionales por tipo.'],
  ['costos', 'Costo de IA por módulo', 'Financiero: lo que cuesta operar el periodo.'],
  ['conciliacion', 'Conciliación con Stripe', 'Control: diferencias factura por factura.'],
] as const
export const TIPOS_REPORTE = REPORTES.map((r) => r[0])

function Reportes({ q }: { q: string }) {
  return (
    <Tarjeta t="Reportes descargables" sub="CSV para Excel, del periodo seleccionado" ancho>
      <div className="ad-reportes">
        {REPORTES.map(([k, t, p]) => (
          <a key={k} href={`/admin/exportar/${k}${q}`} className="ad-reporte">
            <b>{t}</b>
            <span>{p}</span>
            <small>Descargar CSV ↓</small>
          </a>
        ))}
      </div>
    </Tarjeta>
  )
}

/* ── el lienzo ──────────────────────────────────────────────────────── */

export function TableroAdminVista({ d, vista, desde, hasta }: { d: TableroAdmin; vista: VistaAdmin; desde?: string; hasta?: string }) {
  const p = new URLSearchParams()
  if (desde) p.set('desde', desde)
  if (hasta) p.set('hasta', hasta)
  const q = p.toString() ? `?${p}` : ''
  const conVista = (v: string) => {
    const x = new URLSearchParams(p)
    if (v !== 'resumen') x.set('v', v)
    const s = x.toString()
    return `/admin${s ? `?${s}` : ''}`
  }
  const hoy = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
  const atajos: [string, string, string][] = [
    ['Este mes', `${hoy.slice(0, 7)}-01`, hoy],
    ['Este año', `${hoy.slice(0, 4)}-01-01`, hoy],
    ['12 meses', '', ''],
  ]

  return (
    <>
      <div className="pt-cabeza">
        <div className="fila">
          <div className="pt-hub-cabeza" style={{ minWidth: 0 }}>
            <h1>Administración</h1>
            <p>
              Del {dia(d.periodo.desde)} al {dia(d.periodo.hasta)} · leído {new Date(d.generado).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          </div>
          <form className="ad-filtro" method="get" action="/admin">
            {vista !== 'resumen' && <input type="hidden" name="v" value={vista} />}
            <label>Desde<input type="date" name="desde" defaultValue={desde ?? d.periodo.desde} /></label>
            <label>Hasta<input type="date" name="hasta" defaultValue={hasta ?? d.periodo.hasta} /></label>
            <button type="submit" className="ed-btn primario">Aplicar</button>
          </form>
        </div>
        <div className="ad-atajos">
          {atajos.map(([t, a, b]) => {
            const x = new URLSearchParams()
            if (vista !== 'resumen') x.set('v', vista)
            if (a) x.set('desde', a)
            if (b) x.set('hasta', b)
            const s = x.toString()
            return <Link key={t} href={`/admin${s ? `?${s}` : ''}`}>{t}</Link>
          })}
        </div>
        <nav className="pt-vistas ad-vistas" aria-label="Secciones de administración">
          {VISTAS_ADMIN.map(([v, t]) => (
            <Link key={v} href={conVista(v)} aria-current={v === vista ? 'page' : undefined}>{t}</Link>
          ))}
        </nav>
      </div>

      {vista === 'resumen' && <Resumen d={d} />}
      {vista === 'ventas' && <Ventas d={d} />}
      {vista === 'libro' && <Libro d={d} q={q} />}
      {vista === 'usuarios' && <Usuarios d={d} />}
      {vista === 'uso' && <Uso d={d} />}
      {vista === 'conciliacion' && <Conciliacion d={d} />}
      {vista === 'reportes' && <Reportes q={q} />}
    </>
  )
}
