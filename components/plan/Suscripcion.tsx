'use client'
/**
 * Tu suscripción y tu historial de pagos (#192).
 *
 * Lo primero que tiene que ver quien pagó: QUÉ tiene activo (PMO + Tribu, no
 * solo «PMO»), CUÁNTO paga de verdad —con su descuento de fundador, no el
 * precio de lista—, hasta cuándo está pagado y cuándo es el siguiente cargo.
 * Y desde aquí mismo puede suspender la renovación o pedir la factura de un
 * pago que ya hizo.
 *
 * Todo sale del motor: aquí no se calcula ni un peso.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Movimiento, VistaPlan } from '@/lib/plan-uso/tipos'
import { decirError, escribir } from '@/components/editor/comun'

const dinero = (c: number, m: string) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: m.toUpperCase(), currencyDisplay: 'code' }).format(c / 100)
const dia = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' }) : '—'
const corto = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'America/Mexico_City' }) : '—'

export function Suscripcion({ v }: { v: VistaPlan }) {
  const router = useRouter()
  const s = v.suscripcion
  const [confirmar, setConfirmar] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  if (!s?.viva) return null

  const moneda = s.moneda ?? 'usd'
  const nombres = [v.plan.nombre.replace(/^Zaelyn\s+/, ''), ...(s.complementos ?? []).map(c => (c.cantidad > 1 ? `${c.cantidad} × ${c.nombre}` : c.nombre))]
  const descuento = v.miDescuento?.porcentaje ?? 0

  async function cambiar(accion: 'cancelar' | 'reanudar') {
    setEnviando(true); setError('')
    const r = await escribir('plan-cancelar', { accion })
    setEnviando(false)
    if (!r.ok) { setError(decirError(r)); return }
    setConfirmar(false)
    router.refresh()
  }

  return (
    <section className="pu-sus">
      <div className="pu-sus-cab">
        <div>
          <span className="pu-rotulo">Tu suscripción</span>
          <h1>Zaelyn {nombres.join(' + ')}</h1>
          {descuento > 0 && <span className="pu-sus-sello">Fundador · {descuento}% menos para siempre</span>}
        </div>
        <span className={`pu-estado e-${s.cancelaAlFinal ? 'cancela' : s.estado}`}>
          {s.cancelaAlFinal ? 'Se cancela al final del periodo' : s.estado === 'active' ? 'Al corriente' : s.estado === 'past_due' ? 'Pago pendiente' : s.estado}
        </span>
      </div>

      <dl className="pu-sus-datos">
        <div>
          <dt>Pagas</dt>
          <dd>{s.importeCentavos != null ? <><b>{dinero(s.importeCentavos, moneda)}</b> al mes</> : '—'}</dd>
          <small>IVA incluido{descuento > 0 ? ` · con ${descuento}% en el plan` : ''}</small>
        </div>
        <div>
          <dt>Periodo pagado</dt>
          <dd>{s.desde ? `${corto(s.desde)} – ${corto(s.hasta)}` : `Hasta el ${dia(s.hasta)}`}</dd>
        </div>
        <div>
          <dt>{s.cancelaAlFinal ? 'Termina' : 'Próximo cargo'}</dt>
          <dd>
            {s.cancelaAlFinal
              ? dia(s.termina ?? s.hasta)
              : s.proximoCargo
                ? <>{dia(s.proximoCargo.fecha)} · <b>{dinero(s.proximoCargo.totalCentavos, s.proximoCargo.moneda)}</b></>
                : dia(s.hasta)}
          </dd>
          {s.cancelaAlFinal && <small>Después vuelves a Kickoff, gratis en Telegram.</small>}
        </div>
      </dl>

      <div className="pu-sus-acciones">
        {s.cancelaAlFinal ? (
          <>
            <p>Tu plan sigue completo hasta el {dia(s.termina ?? s.hasta)}. Si reanudas antes, no se te cobra nada extra y {descuento > 0 ? 'conservas tu precio de fundador' : 'sigues con el mismo precio'}.</p>
            <button className="ed-btn primario" disabled={enviando} onClick={() => void cambiar('reanudar')}>{enviando ? 'Reanudando…' : 'Reanudar mi suscripción'}</button>
          </>
        ) : confirmar ? (
          <>
            <p>
              No se hará el siguiente cargo. Conservas todo hasta el {dia(s.hasta)} y después tu cuenta vuelve a Kickoff: sin portal, sin WhatsApp y con los límites del plan gratuito.
              {descuento > 0 && <> <b>Si dejas que termine, pierdes tu precio de fundador.</b> Puedes reanudar antes de esa fecha.</>}
            </p>
            <div className="pu-sus-botones">
              <button className="ed-btn suave" disabled={enviando} onClick={() => setConfirmar(false)}>No, mantener</button>
              <button className="ed-btn peligro" disabled={enviando} onClick={() => void cambiar('cancelar')}>{enviando ? 'Suspendiendo…' : 'Sí, suspender la renovación'}</button>
            </div>
          </>
        ) : (
          <button className="ed-btn suave" onClick={() => setConfirmar(true)}>Suspender renovación</button>
        )}
        {error && <div className="ed-error">{error}</div>}
      </div>
    </section>
  )
}

export function Historial({ lista, hayDatos }: { lista: Movimiento[]; hayDatos: boolean }) {
  const router = useRouter()
  const [pidiendo, setPidiendo] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function pedir(id: string) {
    setPidiendo(id); setError('')
    const r = await escribir('fiscal-solicitar', { cobroId: id })
    setPidiendo(null)
    if (!r.ok) {
      setError(r.error === 'SIN_DATOS_FISCALES' ? 'Primero guarda tus datos de facturación aquí abajo y vuelve a pedirla.'
        : r.error === 'MES_CERRADO' ? 'Ese pago ya se incluyó en la factura global de su mes.'
          : decirError(r))
      return
    }
    router.refresh()
  }

  return (
    <section className="pu-seccion">
      <h2>Historial de pagos</h2>
      {lista.length === 0 ? (
        <p className="pu-nota">Todavía no hay pagos registrados.</p>
      ) : (
        <div className="og-tabla-envoltura">
          <table className="og-tabla pu-historial">
            <thead>
              <tr>
                <th>Fecha</th><th>Periodo</th><th className="num">Total</th><th className="num og-opc">IVA</th>
                <th className="num og-opc">Descuento</th><th>Factura</th><th>Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {lista.map(m => (
                <tr key={m.id}>
                  <td>{dia(m.fecha)}</td>
                  <td>{m.periodoDesde ? `${corto(m.periodoDesde)} – ${corto(m.periodoHasta)}` : '—'}</td>
                  <td className="num">{dinero(m.totalCentavos, m.moneda)}</td>
                  <td className="num og-opc">{dinero(m.ivaCentavos, m.moneda)}</td>
                  <td className="num og-opc">{m.descuentoCentavos ? `−${dinero(m.descuentoCentavos, m.moneda)}` : '—'}</td>
                  <td>
                    {m.factura === 'emitida' ? `Emitida${m.folio ? ` · ${m.folio}` : ''}`
                      : m.factura === 'solicitada' ? 'En proceso'
                        : m.factura === 'global' ? 'Factura global del mes'
                          : (
                            <button className="ed-btn suave chico" disabled={pidiendo === m.id} onClick={() => void pedir(m.id)}>
                              {pidiendo === m.id ? 'Pidiendo…' : 'Pedir factura'}
                            </button>
                          )}
                  </td>
                  <td>{m.urlStripe ? <a href={m.urlStripe} target="_blank" rel="noopener noreferrer">Ver</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="pu-nota">
        Puedes pedir la factura de un pago durante el mismo mes en que lo hiciste{hayDatos ? '' : '; antes guarda tus datos de facturación aquí abajo'}. Al cerrar el mes, lo que no se facturó entra en la factura global, como lo pide el SAT.
      </p>
      {error && <div className="ed-error">{error}</div>}
    </section>
  )
}
