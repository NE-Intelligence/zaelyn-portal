'use client'
/**
 * La organización (Zaelyn DECISIONS #180): varios Sponsors, una factura.
 *
 * El administrador paga un PMO por cada Sponsor más los complementos para
 * todos; los límites son una sola bolsa. Los Sponsors entran con un código y
 * pueden salirse. La pantalla no calcula topes: los pinta del motor.
 */
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { VistaOrganizacion, VistaPlan } from '@/lib/plan-uso/tipos'
import { decirError, escribir } from '@/components/editor/comun'
import { Facturacion } from '@/components/plan/Facturacion'

const usd = (n: number) => `${n.toFixed(2)} USD`

const ERRORES: Record<string, string> = {
  YA_ADMINISTRA: 'Ya administras una organización.',
  YA_EN_ORG: 'Esta cuenta ya es parte de una organización.',
  TIENE_SUSCRIPCION: 'Tu cuenta tiene una suscripción propia activa. Cancélala primero en «Plan y uso» (para no pagar dos veces) y vuelve a entrar con el código.',
  CODIGO: 'Ese código no existe, ya se usó o venció. Pídele uno nuevo al administrador.',
  SIN_PERMISO: 'Solo el administrador de la organización puede hacer eso.',
  FACTURA_NO_AUTORIZADA: 'La factura a 30 días la habilita Zaelyn para cada organización; mientras, se paga con tarjeta.',
  SIN_EMAIL: 'Para pagar con factura falta el correo de facturación.',
  SIN_CUENTAS: 'Primero suma al menos un Sponsor: se cobra un PMO por cada uno.',
  SIN_COBRO: 'El pago en línea todavía no está abierto.',
  MONEDA: 'Hoy no tengo el tipo de cambio para cobrar en pesos. Intenta en dólares o más tarde.',
  INVALIDO: 'Revisa los datos: algo no tiene el formato correcto (el RFC lleva 12 o 13 caracteres).',
}
const decir = (r: { status: number; error: string; cuerpo: Record<string, unknown> }) => ERRORES[r.error] ?? decirError(r)

function Medidor({ titulo, usados, tope }: { titulo: string; usados: number; tope: number }) {
  const pct = tope > 0 ? Math.min(100, Math.round((usados / tope) * 100)) : (usados > 0 ? 100 : 0)
  const estado = tope === 0 && usados === 0 ? 'vacio' : usados >= tope ? 'lleno' : usados / Math.max(1, tope) >= 0.8 ? 'cerca' : 'bien'
  return (
    <div className={`pu-medidor ${estado}`}>
      <div className="pu-med-cab"><span>{titulo}</span><b className="mono">{usados}<i> / {tope}</i></b></div>
      <div className="pu-barra"><span style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

function csvDe(o: VistaOrganizacion, precioPmo: number): string {
  const fila = (xs: Array<string | number | null>) => xs.map(x => {
    const s = x === null ? '' : String(x)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }).join(',')
  const cab = ['Sponsor', 'Centro de costos', 'Desde', 'PMO USD/mes (IVA incluido)', 'Grupos', 'Proyectos activos', 'Ejecutores', 'Líderes', 'Stakeholders', 'Monitores', 'Créditos IA del mes', 'Avisos del mes']
  const filas = o.cuentas.map((c, i) => fila([
    c.etiqueta ?? `Sponsor ${i + 1}`, c.centroCostos, c.desde.slice(0, 10), precioPmo,
    c.uso.grupos, c.uso.proyectosActivos, c.uso.ejecutores, c.uso.lideres, c.uso.stakeholders, c.uso.monitores, c.uso.creditos, c.uso.avisos,
  ]))
  return [fila(cab), ...filas].join('\n')
}

export function Organizacion({ o, cobro, plan, pagado, codigo }: {
  o: VistaOrganizacion | null; cobro: boolean; plan: VistaPlan; pagado: boolean; codigo: string
}) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState('')

  async function hacer<T>(accion: Parameters<typeof escribir>[0], cuerpo: unknown, despues?: (d: T) => void) {
    setOcupado(true); setError(''); setAviso('')
    const r = await escribir<T>(accion, cuerpo)
    setOcupado(false)
    if (!r.ok) { setError(decir(r)); return }
    if (despues) despues(r.dato)
    router.refresh()
  }

  if (!o) return <SinOrganizacion codigo={codigo} hacer={hacer} ocupado={ocupado} error={error} />

  return (
    <div className="pu">
      <header className="pu-cab">
        <div>
          <span className="pu-rotulo">Organización</span>
          <h1>{o.nombre}</h1>
          <p>
            {o.cuentas.length} Sponsor{o.cuentas.length === 1 ? '' : 's'} · una sola factura
            {o.esAdmin ? ' · tú la administras' : ' · tu cuenta la paga la organización'}
          </p>
        </div>
        {o.suscripcion && (
          <div className="pu-sub">
            <span className={`pu-estado e-${o.suscripcion.estado}`}>{o.suscripcion.estado === 'active' ? 'Al corriente' : o.suscripcion.estado === 'past_due' ? 'Pago pendiente' : o.suscripcion.estado}</span>
            {o.suscripcion.hasta && <small>Se renueva el {new Date(o.suscripcion.hasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</small>}
          </div>
        )}
      </header>

      {pagado && <div className="pu-aviso">Gracias. El pago se refleja en un minuto en cada cuenta; si no ves el cambio, recarga la página.</div>}
      {aviso && <div className="pu-aviso">{aviso}</div>}
      {error && <div className="ed-error">{error}</div>}

      {o.topes && (
        <section className="pu-seccion">
          <h2>La bolsa de la organización</h2>
          <p className="pu-nota">Lo incluido se suma por cada PMO pagado ({o.sponsors}) más los complementos. Una persona cuenta una vez en toda la organización, y un Sponsor no ocupa lugar en los grupos de otro.</p>
          <div className="pu-medidores">
            <Medidor titulo="Proyectos activos" usados={o.uso.proyectosActivos} tope={o.topes.proyectosActivos} />
            <Medidor titulo="Ejecutores" usados={o.uso.ejecutores} tope={o.topes.ejecutores} />
            <Medidor titulo="Líderes" usados={o.uso.lideres} tope={o.topes.lideres} />
            <Medidor titulo="Monitores incluidos" usados={Math.min(o.uso.monitores, o.topes.monitoresIncluidos)} tope={o.topes.monitoresIncluidos} />
            {o.informados && <Medidor titulo="Lugares de Stakeholder o Monitor extra" usados={o.informados.usados} tope={o.informados.tope} />}
            <Medidor titulo="Créditos IA este mes" usados={o.uso.creditos} tope={o.topes.creditos} />
            <Medidor titulo="Avisos de WhatsApp este mes" usados={o.uso.avisos} tope={o.topes.avisos} />
          </div>
        </section>
      )}
      {!o.topes && <section className="pu-seccion"><p className="pu-nota">La bolsa se activa cuando la organización contrata: hasta entonces, cada cuenta conserva su plan.</p></section>}

      <Sponsors o={o} hacer={hacer} ocupado={ocupado} setAviso={setAviso} precioPmo={plan.planes.find(p => p.clave === 'pro')?.precioUsd ?? 0} />
      {o.esAdmin && <Contratar o={o} cobro={cobro} plan={plan} hacer={hacer} ocupado={ocupado} />}
      {o.esAdmin && <DatosCobro o={o} hacer={hacer} ocupado={ocupado} />}
      {o.esAdmin && o.fiscal && (
        <Facturacion titulo="Facturación de la organización" orgId={o.id} datos={o.fiscal.datos} cobros={o.fiscal.cobros}
          regimenes={plan.fiscal.regimenes} usos={plan.fiscal.usos} />
      )}
    </div>
  )
}

type Hacer = <T>(accion: Parameters<typeof escribir>[0], cuerpo: unknown, despues?: (d: T) => void) => Promise<void>

function SinOrganizacion({ codigo, hacer, ocupado, error }: { codigo: string; hacer: Hacer; ocupado: boolean; error: string }) {
  const [nombre, setNombre] = useState('')
  const [incluirme, setIncluirme] = useState(true)
  const [etiqueta, setEtiqueta] = useState('')
  const [centro, setCentro] = useState('')
  const [cod, setCod] = useState(codigo)
  return (
    <div className="pu">
      <header className="pu-cab">
        <div>
          <span className="pu-rotulo">Organización</span>
          <h1>Varios Sponsors, una factura</h1>
          <p>Para empresas con varios Sponsors: un administrador paga un PMO por cada uno y los complementos para todos. Los límites se juntan en una sola bolsa y una persona cuenta una vez en toda la organización.</p>
        </div>
      </header>
      {error && <div className="ed-error">{error}</div>}
      <section className="pu-seccion">
        <h2>Crear una organización</h2>
        <p className="pu-nota">Quien la crea la administra y paga. Puede ser también uno de los Sponsors, o alguien de finanzas que no dirige proyectos.</p>
        <div className="og-form">
          <label>Nombre de la organización<input value={nombre} onChange={e => setNombre(e.target.value)} maxLength={80} placeholder="Grupo Norte" /></label>
          <label className="og-check"><input type="checkbox" checked={incluirme} onChange={e => setIncluirme(e.target.checked)} />Mi cuenta también es un Sponsor</label>
          {incluirme && <label>Cómo te identificas<input value={etiqueta} onChange={e => setEtiqueta(e.target.value)} maxLength={80} placeholder="Dirección de TI" /></label>}
          {incluirme && <label>Centro de costos<input value={centro} onChange={e => setCentro(e.target.value)} maxLength={60} placeholder="CC-100" /></label>}
          <button className="ed-btn primario" disabled={ocupado || nombre.trim().length < 2}
            onClick={() => void hacer('org-crear', { nombre, incluirme, etiqueta, centro })}>Crear organización</button>
        </div>
      </section>
      <section className="pu-seccion">
        <h2>Entrar con un código</h2>
        <p className="pu-nota">Si el administrador de tu empresa te mandó un código ZAO-…, tu cuenta pasa a pagarla la organización. Puedes salirte cuando quieras.</p>
        <div className="og-form">
          <label>Código<input value={cod} onChange={e => setCod(e.target.value.toUpperCase())} maxLength={20} placeholder="ZAO-XXXXXX" className="og-codigo" /></label>
          <button className="ed-btn primario" disabled={ocupado || cod.trim().length < 6}
            onClick={() => void hacer('org-unirse', { codigo: cod })}>Entrar a la organización</button>
        </div>
      </section>
    </div>
  )
}

function Sponsors({ o, hacer, ocupado, setAviso, precioPmo }: { o: VistaOrganizacion; hacer: Hacer; ocupado: boolean; setAviso: (s: string) => void; precioPmo: number }) {
  const [etiqueta, setEtiqueta] = useState('')
  const [centro, setCentro] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [ed, setEd] = useState({ etiqueta: '', centro: '' })

  function descargar() {
    const b = new Blob([`﻿${csvDe(o, precioPmo)}`], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(b)
    a.download = `${o.nombre.replace(/[^\p{L}\p{N}]+/gu, '-')}-detalle-por-sponsor.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <section className="pu-seccion">
      <h2>Sponsors</h2>
      <p className="pu-nota">Se cobra un PMO por cada uno. El uso de cada cuenta sirve para repartir el costo por centro de costos.</p>
      <div className="og-tabla-envoltura">
        <table className="og-tabla">
          <thead>
            <tr>
              <th>Sponsor</th><th>Centro de costos</th>
              <th className="num og-opc">Grupos</th><th className="num">Proyectos</th><th className="num">Ejecutores</th>
              <th className="num og-opc">Líderes</th><th className="num og-opc">Créditos</th><th />
            </tr>
          </thead>
          <tbody>
            {o.cuentas.map((c, i) => (
              <tr key={c.userId}>
                {editando === c.userId ? (
                  <>
                    <td><input value={ed.etiqueta} onChange={e => setEd({ ...ed, etiqueta: e.target.value })} maxLength={80} /></td>
                    <td><input value={ed.centro} onChange={e => setEd({ ...ed, centro: e.target.value })} maxLength={60} /></td>
                  </>
                ) : (
                  <>
                    <td>{c.etiqueta ?? `Sponsor ${i + 1}`}{c.soyYo ? ' (tú)' : ''}{c.plan !== 'pro' ? <span className="pu-nota"> · aún sin PMO</span> : null}</td>
                    <td>{c.centroCostos ?? '—'}</td>
                  </>
                )}
                <td className="num og-opc">{c.uso.grupos}</td>
                <td className="num">{c.uso.proyectosActivos}</td>
                <td className="num">{c.uso.ejecutores}</td>
                <td className="num og-opc">{c.uso.lideres}</td>
                <td className="num og-opc">{c.uso.creditos}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  {o.esAdmin && editando !== c.userId && (
                    <button className="ed-btn suave chico" onClick={() => { setEditando(c.userId); setEd({ etiqueta: c.etiqueta ?? '', centro: c.centroCostos ?? '' }) }}>Editar</button>
                  )}
                  {o.esAdmin && editando === c.userId && (
                    <button className="ed-btn primario chico" disabled={ocupado}
                      onClick={() => void hacer('org-etiquetar', { orgId: o.id, cuenta: c.userId, ...ed }, () => setEditando(null))}>Guardar</button>
                  )}
                  {(o.esAdmin || c.soyYo) && (
                    <button className="ed-btn suave chico" disabled={ocupado}
                      onClick={() => {
                        const msg = c.soyYo ? '¿Salir de la organización? Tu cuenta vuelve al plan gratuito.' : '¿Quitar esta cuenta? Vuelve al plan gratuito y deja de cobrarse su PMO.'
                        if (window.confirm(msg)) void hacer('org-quitar', { orgId: o.id, cuenta: c.userId })
                      }}>{c.soyYo && !o.esAdmin ? 'Salir' : 'Quitar'}</button>
                  )}
                </td>
              </tr>
            ))}
            {!o.cuentas.length && <tr><td colSpan={8} className="pu-nota">Todavía no hay Sponsors. Invita al primero abajo.</td></tr>}
          </tbody>
        </table>
      </div>
      {o.esAdmin && o.cuentas.length > 0 && (
        <div><button className="ed-btn suave" onClick={descargar}>Descargar detalle por Sponsor (CSV)</button></div>
      )}

      {o.esAdmin && (
        <>
          <h2 style={{ marginTop: 8 }}>Invitar a un Sponsor</h2>
          <p className="pu-nota">Genera un código y mándaselo. Lo teclea en «Organización» de su portal; nadie queda dentro sin aceptarlo. Vale 14 días.</p>
          <div className="og-form">
            <label>Para quién<input value={etiqueta} onChange={e => setEtiqueta(e.target.value)} maxLength={80} placeholder="Operaciones · Laura" /></label>
            <label>Centro de costos<input value={centro} onChange={e => setCentro(e.target.value)} maxLength={60} placeholder="CC-200" /></label>
            <button className="ed-btn primario" disabled={ocupado}
              onClick={() => void hacer<{ codigo: string }>('org-invitar', { orgId: o.id, etiqueta, centro }, d => {
                setAviso(`Código para ${etiqueta || 'el nuevo Sponsor'}: ${d.codigo}. Mándaselo; vale 14 días.`)
                setEtiqueta(''); setCentro('')
              })}>Generar código</button>
          </div>
          {o.invitaciones && o.invitaciones.length > 0 && (
            <ul className="pu-ajenas">
              {o.invitaciones.map(i => (
                <li key={i.codigo}>
                  <span className="og-codigo">{i.codigo}</span>
                  <span>{i.etiqueta ?? 'Sin nombre'}{i.centroCostos ? ` · ${i.centroCostos}` : ''}</span>
                  <span>vence {new Date(i.expira).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

function Contratar({ o, cobro, plan, hacer, ocupado }: { o: VistaOrganizacion; cobro: boolean; plan: VistaPlan; hacer: Hacer; ocupado: boolean }) {
  const [cant, setCant] = useState<Record<string, number>>(() => ({ ...o.complementos }))
  const [periodo, setPeriodo] = useState<'mes' | 'anio'>('mes')
  const [moneda, setMoneda] = useState<'usd' | 'mxn'>('usd')
  const pmo = plan.planes.find(p => p.clave === 'pro')!
  const comps = plan.complementos.filter(c => c.clave !== 'tribu')
  const anual = periodo === 'anio'
  const viva = !!o.suscripcion && ['active', 'trialing', 'past_due'].includes(o.suscripcion.estado)
  const n = Math.max(1, o.cuentas.length)
  const tc = plan.cobro.tipoCambio['MXN']
  const enMoneda = (x: number) => (moneda === 'mxn' && tc ? `${(x * tc.valor).toFixed(2)} MXN` : usd(x))
  const total = useMemo(() => {
    let t = n * (anual ? pmo.precioAnualUsd : pmo.precioUsd)
    for (const c of comps) t += (cant[c.clave] ?? 0) * (anual ? c.precioAnualUsd : c.precioUsd)
    return t
  }, [n, pmo, comps, cant, anual])
  const cambio = comps.some(c => (cant[c.clave] ?? 0) !== (o.complementos[c.clave] ?? 0))

  return (
    <section className="pu-seccion">
      <h2>{viva ? 'Complementos de la organización' : 'Contratar para la organización'}</h2>
      <p className="pu-nota">{n} PMO ({usd(pmo.precioUsd)} cada uno al mes) con todo lo incluido sumado en la bolsa. Los complementos son para todos los Sponsors.</p>
      <div className="pu-comps">
        {comps.map(c => {
          const k = cant[c.clave] ?? 0
          return (
            <div className={`pu-comp${k ? ' on' : ''}`} key={c.clave}>
              <div><b>{c.nombre}</b><span>{c.dice}</span></div>
              <span className="pu-precio mono">{enMoneda(anual ? c.precioAnualUsd : c.precioUsd)}<i>{anual ? '/año' : '/mes'}</i></span>
              <div className="pu-paso">
                <button aria-label={`Quitar ${c.nombre}`} onClick={() => setCant(x => ({ ...x, [c.clave]: Math.max(0, k - 1) }))} disabled={!k}>−</button>
                <span className="mono">{k}</span>
                <button aria-label={`Agregar ${c.nombre}`} onClick={() => setCant(x => ({ ...x, [c.clave]: Math.min(1000, k + 1) }))}>+</button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="pu-total">
        <div>
          <span>{anual ? 'Total al año' : 'Total al mes'}</span>
          <b className="mono">{enMoneda(total)}</b>
          <small>{o.cobro === 'factura' ? 'Factura con transferencia a 30 días.' : 'Con tarjeta.'} IVA incluido.{anual ? ` PMO y lugares como ${pmo.mesesAnual} meses; créditos y avisos completos.` : ''}</small>
        </div>
        {!viva && (
          <div className="ed-segmentos chico">
            <button className={!anual ? 'on' : ''} onClick={() => setPeriodo('mes')}>Mensual</button>
            <button className={anual ? 'on' : ''} onClick={() => setPeriodo('anio')}>Anual</button>
          </div>
        )}
        {!viva && plan.cobro.monedas.length > 1 && (
          <div className="ed-segmentos chico">
            <button className={moneda === 'usd' ? 'on' : ''} onClick={() => setMoneda('usd')}>USD</button>
            <button className={moneda === 'mxn' ? 'on' : ''} onClick={() => setMoneda('mxn')}>MXN</button>
          </div>
        )}
        <button className="ed-btn primario" disabled={!cobro || ocupado || !o.cuentas.length || (viva && !cambio)}
          onClick={() => void hacer<{ url?: string; facturada?: boolean }>('org-comprar', { orgId: o.id, complementos: cant, moneda, periodo }, d => {
            if (d.url) window.location.href = d.url
          })}>
          {ocupado ? 'Un momento…' : viva ? 'Guardar cambios' : o.cobro === 'factura' ? 'Contratar con factura' : 'Contratar con tarjeta'}
        </button>
      </div>
      {!cobro && <p className="pu-nota">El pago en línea todavía no está abierto. Los precios ya son los definitivos.</p>}
    </section>
  )
}

function DatosCobro({ o, hacer, ocupado }: { o: VistaOrganizacion; hacer: Hacer; ocupado: boolean }) {
  const [f, setF] = useState({
    nombre: o.nombre, razonSocial: o.razonSocial ?? '', rfc: o.rfc ?? '', emailFactura: o.emailFactura ?? '', cobro: o.cobro,
  })
  return (
    <section className="pu-seccion">
      <h2>Datos del pago</h2>
      <p className="pu-nota">A nombre de quién y a qué correo manda Stripe el recibo, y cómo se paga.</p>
      <div className="og-form">
        <label>Nombre<input value={f.nombre} onChange={e => setF({ ...f, nombre: e.target.value })} maxLength={80} /></label>
        <label>Razón social<input value={f.razonSocial} onChange={e => setF({ ...f, razonSocial: e.target.value })} maxLength={200} /></label>
        <label>RFC<input value={f.rfc} onChange={e => setF({ ...f, rfc: e.target.value.toUpperCase() })} maxLength={13} /></label>
        <label>Correo de facturación<input type="email" value={f.emailFactura} onChange={e => setF({ ...f, emailFactura: e.target.value })} maxLength={200} /></label>
        <label>Forma de pago
          <select value={f.cobro} onChange={e => setF({ ...f, cobro: e.target.value as 'tarjeta' | 'factura' })}>
            <option value="tarjeta">Tarjeta</option>
            <option value="factura" disabled={!o.facturaAutorizada}>Factura a 30 días{o.facturaAutorizada ? '' : ' (la habilita Zaelyn)'}</option>
          </select>
        </label>
        <button className="ed-btn primario" disabled={ocupado} onClick={() => void hacer('org-editar', { orgId: o.id, ...f })}>Guardar</button>
      </div>
    </section>
  )
}
