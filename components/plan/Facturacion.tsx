'use client'
/**
 * Facturación (Zaelyn DECISIONS #181).
 *
 * Los precios ya incluyen IVA. Quien quiere factura deja aquí sus datos y NE
 * la emite con cada cobro; quien no, entra en la factura global del mes.
 * También enseña lo cobrado con su IVA separado.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Cobro, DatosFiscales } from '@/lib/plan-uso/tipos'
import { decirError, escribir } from '@/components/editor/comun'

const VACIO: DatosFiscales = { quiereFactura: true, rfc: '', razonSocial: '', regimen: '', cp: '', usoCfdi: 'G03', email: '' }

export function Facturacion({ datos, cobros, regimenes, usos, orgId, titulo = 'Facturación' }: {
  datos: DatosFiscales | null; cobros: Cobro[]; regimenes: Record<string, string>; usos: Record<string, string>
  orgId?: string; titulo?: string
}) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(!!datos?.quiereFactura)
  const [d, setD] = useState<DatosFiscales>(datos ?? VACIO)
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'hecho'>('listo')
  const [error, setError] = useState('')

  async function guardar(quiere: boolean) {
    setEstado('enviando'); setError('')
    const r = await escribir('fiscal', { ...d, quiereFactura: quiere, ...(orgId ? { orgId } : {}) })
    if (!r.ok) {
      setEstado('listo')
      const ps = r.cuerpo['problemas'] as Array<{ dice: string }> | undefined
      setError(ps?.length ? ps.map(p => p.dice).join(' ') : decirError(r))
      return
    }
    setEstado('hecho')
    router.refresh()
  }

  const fmt = (n: number, m: string) => `${n.toFixed(2)} ${m.toUpperCase()}`
  return (
    <section className="pu-seccion">
      <h2>{titulo}</h2>
      <p className="pu-nota">Todos los precios incluyen IVA. Si necesitas factura (CFDI), deja tus datos y NE la emite con cada cobro y te la manda por correo. Si no la pides, tu pago entra en la factura global del mes.</p>

      <label className="og-check" style={{ display: 'flex' }}>
        <input type="checkbox" checked={abierto} onChange={e => {
          setAbierto(e.target.checked)
          if (!e.target.checked && datos?.quiereFactura) void guardar(false)
        }} />
        Quiero factura
      </label>

      {abierto && (
        <div className="og-form">
          <label>RFC<input value={d.rfc} onChange={e => setD({ ...d, rfc: e.target.value.toUpperCase() })} maxLength={13} /></label>
          <label>Razón social (como en tu constancia)<input value={d.razonSocial} onChange={e => setD({ ...d, razonSocial: e.target.value })} maxLength={254} /></label>
          <label>Régimen fiscal
            <select value={d.regimen} onChange={e => setD({ ...d, regimen: e.target.value })}>
              <option value="">Elige…</option>
              {Object.entries(regimenes).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
            </select>
          </label>
          <label>Código postal fiscal<input value={d.cp} onChange={e => setD({ ...d, cp: e.target.value.replace(/\D/g, '') })} maxLength={5} inputMode="numeric" /></label>
          <label>Uso del CFDI
            <select value={d.usoCfdi} onChange={e => setD({ ...d, usoCfdi: e.target.value })}>
              {Object.entries(usos).map(([k, v]) => <option key={k} value={k}>{k} · {v}</option>)}
            </select>
          </label>
          <label>Correo para recibir la factura<input type="email" value={d.email} onChange={e => setD({ ...d, email: e.target.value })} maxLength={200} /></label>
          <button className="ed-btn primario" disabled={estado === 'enviando'} onClick={() => void guardar(true)}>
            {estado === 'enviando' ? 'Guardando…' : 'Guardar datos de facturación'}
          </button>
        </div>
      )}
      {estado === 'hecho' && <div className="pu-aviso">Listo. Tus próximos cobros se facturarán con estos datos.</div>}
      {error && <div className="ed-error">{error}</div>}

      {cobros.length > 0 && (
        <div className="og-tabla-envoltura">
          <table className="og-tabla">
            <thead>
              <tr><th>Fecha</th><th className="num">Total</th><th className="num og-opc">Subtotal</th><th className="num og-opc">IVA</th><th>Factura</th></tr>
            </thead>
            <tbody>
              {cobros.map((c, i) => (
                <tr key={i}>
                  <td>{new Date(c.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="num">{fmt(c.total, c.moneda)}</td>
                  <td className="num og-opc">{fmt(c.neto, c.moneda)}</td>
                  <td className="num og-opc">{fmt(c.iva, c.moneda)}</td>
                  <td>{c.facturado ? `Emitida${c.folio ? ` · ${c.folio}` : ''}` : c.facturaSolicitada ? 'En proceso' : 'Factura global'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
