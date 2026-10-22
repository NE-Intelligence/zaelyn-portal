'use client'
/**
 * «Plan y uso» (Zaelyn DECISIONS #179).
 *
 * Lo que la persona tiene, cuánto usa de su cuenta PMO y qué puede sumar.
 * Los números vienen del motor —los mismos que hacen cumplir los topes en el
 * chat— y aquí solo se pintan. Comprar va a Stripe; la pantalla no toca
 * dinero.
 */
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PAGA, type VistaPlan } from '@/lib/plan-uso/tipos'
import { decirError, escribir } from '@/components/editor/comun'

const usd = (n: number) => `${n.toFixed(2)} USD`

function Medidor({ titulo, usados, tope, nota }: { titulo: string; usados: number; tope: number; nota?: string }) {
  const pct = tope > 0 ? Math.min(100, Math.round((usados / tope) * 100)) : (usados > 0 ? 100 : 0)
  const estado = tope === 0 && usados === 0 ? 'vacio' : usados >= tope ? 'lleno' : usados / Math.max(1, tope) >= 0.8 ? 'cerca' : 'bien'
  return (
    <div className={`pu-medidor ${estado}`}>
      <div className="pu-med-cab">
        <span>{titulo}</span>
        <b className="mono">{usados}<i> / {tope}</i></b>
      </div>
      <div className="pu-barra"><span style={{ width: `${pct}%` }} /></div>
      {nota && <small>{nota}</small>}
    </div>
  )
}

export function PlanYUso({ v, pagado }: { v: VistaPlan; pagado: boolean }) {
  const actuales = v.cuenta?.complementos ?? {}
  const [cant, setCant] = useState<Record<string, number>>(() => ({ ...actuales }))
  const [moneda, setMoneda] = useState<'usd' | 'mxn'>(v.suscripcion?.moneda === 'mxn' ? 'mxn' : 'usd')
  const [periodo, setPeriodo] = useState<'mes' | 'anio'>('mes')
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'hecho'>('listo')
  const [error, setError] = useState('')
  const esPmo = v.plan.clave === 'pro'
  const tc = v.cobro.tipoCambio['MXN']
  const pmo = v.planes.find(p => p.clave === 'pro')!

  const anual = periodo === 'anio'
  const total = useMemo(() => {
    let t = pmo.precioUsd * (anual ? pmo.mesesAnual : 1)
    for (const c of v.complementos) t += (cant[c.clave] ?? 0) * c.precioUsd * (anual ? c.mesesAnual : 1)
    return t
  }, [cant, v.complementos, pmo, anual])
  // Tu cuenta la paga una organización (la administres o no): no se contrata por aquí.
  const pagaOrg = !!v.cuenta?.org || (!!v.organizacion && !v.organizacion.esAdmin)
  const nombreOrg = v.cuenta?.org?.nombre ?? v.organizacion?.nombre ?? ''
  const viva = v.suscripcion?.viva === true
  const cambio = v.complementos.some(c => (cant[c.clave] ?? 0) !== (actuales[c.clave] ?? 0))
  const enMoneda = (n: number) => (moneda === 'mxn' && tc ? `${(n * tc.valor).toFixed(2)} MXN` : usd(n))

  async function comprar() {
    setEstado('enviando'); setError('')
    const r = await escribir<{ ok: boolean; url?: string; cambiado?: boolean }>('plan-comprar', { complementos: cant, moneda, periodo })
    if (!r.ok) {
      setEstado('listo')
      setError(r.error === 'SIN_COBRO' ? 'El pago en línea todavía no está abierto.'
        : r.error === 'MONEDA' ? 'Hoy no tengo el tipo de cambio para cobrar en pesos. Intenta en dólares o más tarde.'
          : r.error === 'EN_ORGANIZACION' ? `Tu cuenta la paga ${String(r.cuerpo['organizacion'] ?? 'tu organización')}: los cambios los hace su administrador.`
            : decirError(r))
      return
    }
    if (r.dato.url) { window.location.href = r.dato.url; return }
    setEstado('hecho')
  }

  const t = v.cuenta?.topes
  return (
    <div className="pu">
      <header className="pu-cab">
        <div>
          <span className="pu-rotulo">Tu plan</span>
          <h1>{v.plan.nombre}</h1>
          <p>{v.plan.queEs}{v.plan.precioUsd ? ` · ${usd(v.plan.precioUsd)} al mes` : ''}</p>
        </div>
        {v.suscripcion && (
          <div className="pu-sub">
            <span className={`pu-estado e-${v.suscripcion.estado}`}>{v.suscripcion.estado === 'active' ? 'Al corriente' : v.suscripcion.estado === 'past_due' ? 'Pago pendiente' : v.suscripcion.estado}</span>
            {v.suscripcion.hasta && <small>Se renueva el {new Date(v.suscripcion.hasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</small>}
          </div>
        )}
      </header>

      <nav className="pu-atajos">
        <Link href="/app/participaciones" className="ed-btn suave">Mis participaciones</Link>
        <Link href="/app/organizacion" className="ed-btn suave">{v.organizacion?.esAdmin ? `Administrar ${v.organizacion.nombre}` : v.organizacion ? v.organizacion.nombre : 'Organización'}</Link>
      </nav>

      {pagaOrg && (
        <div className="pu-aviso">Tu cuenta la paga <b>{nombreOrg}</b>. Tus límites son los de la organización entera; {v.organizacion?.esAdmin ? <>los complementos se compran en <a href="/app/organizacion">la organización</a>.</> : 'los cambios los hace su administrador.'}</div>
      )}

      {pagado && <div className="pu-aviso">Gracias. El pago se refleja en un minuto; si no ves el cambio, recarga la página.</div>}
      {estado === 'hecho' && <div className="pu-aviso">Listo: los complementos se actualizaron. Stripe prorratea la diferencia en tu siguiente cobro.</div>}

      {v.cuenta && t && (
        <section className="pu-seccion">
          <h2>{v.cuenta.org ? `Uso de la bolsa de ${v.cuenta.org.nombre}` : 'Uso de tu cuenta PMO'}</h2>
          <p className="pu-nota">
            {v.cuenta.org
              ? `Se suma entre los grupos de los ${v.cuenta.sponsors} Sponsors de la organización (${v.cuenta.grupos} grupos). Una persona cuenta una vez en toda la organización.`
              : `Se suma entre todos tus grupos (${v.cuenta.grupos}). Una persona cuenta una vez aunque esté en varios.`}
            {v.cuenta.conPmoPropio > 0 && ` ${v.cuenta.conPmoPropio} persona${v.cuenta.conPmoPropio === 1 ? '' : 's'} con PMO propio no ocupa${v.cuenta.conPmoPropio === 1 ? '' : 'n'} lugar.`}
          </p>
          <div className="pu-medidores">
            <Medidor titulo="Proyectos activos" usados={v.cuenta.proyectosActivos} tope={t.proyectosActivos} nota="Un proyecto sin actividades abiertas no cuenta." />
            <Medidor titulo="Ejecutores" usados={v.cuenta.ejecutores} tope={t.ejecutores} />
            <Medidor titulo="Líderes" usados={v.cuenta.lideres} tope={t.lideres} nota="Tú, como Sponsor, no cuentas." />
            <Medidor titulo="Monitores incluidos" usados={Math.min(v.cuenta.monitores, t.monitoresIncluidos)} tope={t.monitoresIncluidos} />
            <Medidor titulo="Lugares de 1.99" usados={v.cuenta.informados.usados} tope={v.cuenta.informados.tope}
              nota={`${v.cuenta.stakeholders} Stakeholder${v.cuenta.stakeholders === 1 ? '' : 's'} · ${Math.max(0, v.cuenta.monitores - t.monitoresIncluidos)} Monitor(es) extra`} />
            <Medidor titulo="Créditos IA este mes" usados={v.cuenta.creditos} tope={t.creditos} nota="Armar un plan gasta 1 a 3; reorganizar, 1 o más según el tamaño." />
            <Medidor titulo="Avisos de WhatsApp este mes" usados={v.cuenta.avisos} tope={t.avisos} nota="En Telegram los avisos no tienen tope." />
          </div>
        </section>
      )}

      {v.ajenas.length > 0 && (
        <section className="pu-seccion">
          <h2>Lugares que ocupas en otras cuentas</h2>
          <p className="pu-nota">Los paga cada cuenta, no tú: no cuentan en tus medidores.</p>
          <ul className="pu-ajenas">
            {v.ajenas.map(a => (
              <li key={a.groupId}>
                <Link href={`/app/g/${a.groupId}`}>{a.grupo}</Link>
                <span>{a.nombreRol}</span>
                <span>{PAGA(a.paga)}</span>
                {a.ocupaLugar === false && <span className="pu-chip">Sin costo: tienes PMO</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!pagaOrg && <section className="pu-seccion">
        <h2>{esPmo ? 'Complementos' : `Contratar ${pmo.nombre}`}</h2>
        {!esPmo && <p className="pu-nota">{pmo.queEs}. {usd(pmo.precioUsd)} al mes con 3 proyectos activos, 6 Ejecutores, 2 Monitores, 30 créditos IA y 100 avisos de WhatsApp. Suma lo que necesites:</p>}
        <div className="pu-comps">
          {v.complementos.filter(c => c.clave !== 'tribu' || esPmo).map(c => {
            const n = cant[c.clave] ?? 0
            return (
              <div className={`pu-comp${n ? ' on' : ''}`} key={c.clave}>
                <div>
                  <b>{c.nombre}</b>
                  <span>{c.dice}</span>
                </div>
                <span className="pu-precio mono">{enMoneda(c.precioUsd * (anual ? c.mesesAnual : 1))}<i>{anual ? '/año' : '/mes'}</i></span>
                <div className="pu-paso">
                  <button aria-label={`Quitar ${c.nombre}`} onClick={() => setCant(x => ({ ...x, [c.clave]: Math.max(0, n - 1) }))} disabled={!n}>−</button>
                  <span className="mono">{n}</span>
                  <button aria-label={`Agregar ${c.nombre}`} onClick={() => setCant(x => ({ ...x, [c.clave]: Math.min(c.clave === 'tribu' ? 1 : 100, n + 1) }))}>+</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pu-total">
          <div>
            <span>{anual ? 'Total al año' : 'Total al mes'}</span>
            <b className="mono">{enMoneda(total)}</b>
            {moneda === 'mxn' && tc && <small>{usd(total)} al tipo de cambio FIX de Banxico del {tc.fecha} ({tc.valor.toFixed(4)}). Se recalcula antes de cada renovación.</small>}
            {moneda === 'usd' && <small>Más impuestos aplicables.</small>}
            {anual && <small>Al año: PMO y lugares se cobran como {pmo.mesesAnual} meses; los paquetes de créditos y avisos, completos. Créditos y avisos se renuevan cada mes.</small>}
          </div>
          {!viva && (
            <div className="ed-segmentos chico">
              <button className={!anual ? 'on' : ''} onClick={() => setPeriodo('mes')}>Mensual</button>
              <button className={anual ? 'on' : ''} onClick={() => setPeriodo('anio')}>Anual</button>
            </div>
          )}
          {v.cobro.monedas.length > 1 && (
            <div className="ed-segmentos chico">
              <button className={moneda === 'usd' ? 'on' : ''} onClick={() => setMoneda('usd')}>USD</button>
              <button className={moneda === 'mxn' ? 'on' : ''} onClick={() => setMoneda('mxn')}>MXN</button>
            </div>
          )}
          <button className="ed-btn primario" disabled={!v.cobro.disponible || estado === 'enviando' || (esPmo && v.suscripcion?.viva === true && !cambio)}
            onClick={() => void comprar()}>
            {estado === 'enviando' ? 'Abriendo el pago…' : esPmo && v.suscripcion?.viva ? 'Guardar cambios' : `Contratar ${pmo.nombre}`}
          </button>
        </div>
        {!v.cobro.disponible && <p className="pu-nota">El pago en línea todavía no está abierto. Los precios ya son los definitivos.</p>}
        {error && <div className="ed-error">{error}</div>}
      </section>}

      <section className="pu-seccion">
        <h2>Los planes</h2>
        <div className="pu-planes">
          {v.planes.map(p => (
            <div className={`pu-plan${p.clave === v.plan.clave ? ' actual' : ''}`} key={p.clave}>
              <b>{p.nombre}</b>
              <span className="pu-precio mono">{p.precioUsd ? usd(p.precioUsd) : 'Gratis'}{p.precioUsd ? <i>/mes</i> : null}</span>
              {p.clave === 'pro' && <small className="pu-anual">o {usd(p.precioUsd * p.mesesAnual)} al año</small>}
              <p>{p.queEs}</p>
              {p.clave === v.plan.clave && <small>Tu plan</small>}
            </div>
          ))}
        </div>
        <p className="pu-nota">Paga quien decide: el Sponsor y sus Líderes. Quien ejecuta entra en bloques; quien solo da seguimiento, gratis hasta dos.</p>
      </section>
    </div>
  )
}
