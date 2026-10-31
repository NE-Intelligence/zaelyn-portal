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
import { PAGA, type NivelDePaga, type VistaPlan } from '@/lib/plan-uso/tipos'
import { decirError, escribir } from '@/components/editor/comun'
import { Facturacion } from '@/components/plan/Facturacion'
import { CanjearCodigo, Invitaciones } from '@/components/plan/Codigos'
import { Historial, Suscripcion } from '@/components/plan/Suscripcion'

const usd = (n: number) => `${n.toFixed(2)} USD`

function Medidor({ titulo, usados, tope, nota }: { titulo: string; usados: number; tope: number | null; nota?: string }) {
  // Sin tope (los proyectos desde decisiones/2026-10-31-modos-pmo-escalamiento-roles del motor).
  if (tope === null) {
    return (
      <div className="pu-medidor bien">
        <div className="pu-med-cab"><span>{titulo}</span><b className="mono">{usados}<i> · sin límite</i></b></div>
      </div>
    )
  }
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

/** Lo que trae cada nivel, en una línea por cosa (#190). Los números son los del motor. */
const NIVELES: { clave: NivelDePaga; para: string; rasgos: string[] }[] = [
  { clave: 'base', para: 'Para ti', rasgos: ['Portal Personal: tu día cruzado con todos tus grupos', 'Avisos por WhatsApp', '50 recordatorios activos', 'Un año de historial'] },
  { clave: 'family', para: 'Para tu familia', rasgos: ['Todo Sprint, más:', 'Portal de Familia completo', '4 participantes incluidos', 'Traslados, quehaceres con puntos, medallero y fechas'] },
  { clave: 'pro', para: 'Para tus proyectos', rasgos: ['Todo Sprint, más:', 'Portal de Proyectos y editor con IA', '3 proyectos, 6 Ejecutores y 2 Monitores', '30 créditos de IA y 100 avisos de WhatsApp al mes'] },
]

export function PlanYUso({ v, pagado, inicial }: { v: VistaPlan; pagado: boolean; inicial?: NivelDePaga | null }) {
  const actuales = v.cuenta?.complementos ?? {}
  const [cant, setCant] = useState<Record<string, number>>(() => ({ ...actuales }))
  const [moneda, setMoneda] = useState<'usd' | 'mxn'>(v.suscripcion?.moneda?.toLowerCase() === 'mxn' ? 'mxn' : 'usd')
  const [periodo, setPeriodo] = useState<'mes' | 'anio'>('mes')
  const [estado, setEstado] = useState<'listo' | 'enviando' | 'hecho'>('listo')
  const [error, setError] = useState('')
  const viva = v.suscripcion?.viva === true
  // Con suscripción viva, el plan es el que se paga; sin ella (prueba o
  // cortesía), todos los niveles se ofrecen para contratar.
  const pagado_ = viva ? (v.plan.clave as NivelDePaga) : null
  const [elegido, setElegido] = useState<NivelDePaga | null>(inicial ?? (pagado_ === 'pro' ? 'pro' : null))
  const esPmo = pagado_ === 'pro'
  const configurandoPmo = elegido === 'pro'
  // El tramo de fundador se aplica al PLAN, no a los complementos (#190).
  const fundador = v.fundador?.abierto && !viva ? v.fundador : null
  const descuento = viva ? (v.miDescuento?.porcentaje ?? 0) : (fundador?.tramo ?? 0)
  const conDescuento = (n: number) => Math.round(n * (1 - descuento / 100) * 100) / 100
  const tc = v.cobro.tipoCambio['MXN']
  const pmo = v.planes.find(p => p.clave === 'pro')!

  const anual = periodo === 'anio'
  const total = useMemo(() => {
    let t = conDescuento(anual ? pmo.precioAnualUsd : pmo.precioUsd)
    for (const c of v.complementos) t += (cant[c.clave] ?? 0) * (anual ? c.precioAnualUsd : c.precioUsd)
    return t
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cant, v.complementos, pmo, anual, descuento])
  // Tu cuenta la paga una organización (la administres o no): no se contrata por aquí.
  const pagaOrg = !!v.cuenta?.org || (!!v.organizacion && !v.organizacion.esAdmin)
  const nombreOrg = v.cuenta?.org?.nombre ?? v.organizacion?.nombre ?? ''
  const cambio = v.complementos.some(c => (cant[c.clave] ?? 0) !== (actuales[c.clave] ?? 0))
  const enMoneda = (n: number) => (moneda === 'mxn' && tc ? `${(n * tc.valor).toFixed(2)} MXN` : usd(n))

  async function comprar(plan: NivelDePaga) {
    setEstado('enviando'); setError('')
    const r = await escribir<{ ok: boolean; url?: string; cambiado?: boolean }>('plan-comprar', {
      plan,
      complementos: plan === 'pro' ? cant : {},
      moneda,
      periodo: plan === 'pro' ? periodo : 'mes',
    })
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
      {viva ? <Suscripcion v={v} /> : (
      <header className="pu-cab">
        <div>
          <span className="pu-rotulo">Tu plan</span>
          <h1>{v.plan.nombre}</h1>
          <p>{v.plan.queEs}{v.plan.precioUsd ? ` · ${usd(v.plan.precioUsd)} al mes, IVA incluido` : ''}</p>
        </div>
        {v.suscripcion && (
          <div className="pu-sub">
            <span className={`pu-estado e-${v.suscripcion.estado}`}>{v.suscripcion.estado === 'active' ? 'Al corriente' : v.suscripcion.estado === 'past_due' ? 'Pago pendiente' : v.suscripcion.estado}</span>
            {v.suscripcion.hasta && <small>Se renueva el {new Date(v.suscripcion.hasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</small>}
          </div>
        )}
      </header>
      )}

      <nav className="pu-atajos">
        <Link href="/app/participaciones" className="ed-btn suave">Mis participaciones</Link>
        <Link href="/app/organizacion" className="ed-btn suave">{v.organizacion?.esAdmin ? `Administrar ${v.organizacion.nombre}` : v.organizacion ? v.organizacion.nombre : 'Organización'}</Link>
      </nav>

      {pagaOrg && (
        <div className="pu-aviso">Tu cuenta la paga <b>{nombreOrg}</b>. Tus límites son los de la organización entera; {v.organizacion?.esAdmin ? <>los complementos se compran en <a href="/app/organizacion">la organización</a>.</> : 'los cambios los hace su administrador.'}</div>
      )}

      {pagado && <div className="pu-aviso">Gracias. El pago se refleja en un minuto; si no ves el cambio, recarga la página.</div>}
      {estado === 'hecho' && <div className="pu-aviso">Listo: tu suscripción se actualizó. Stripe prorratea la diferencia en tu siguiente cobro.</div>}

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
            <Medidor titulo="Lugares de Stakeholder o Monitor extra" usados={v.cuenta.informados.usados} tope={v.cuenta.informados.tope}
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

      {/* BETA 1 · FUNDADORES (#190): el descuento lo pone el servidor al abrir
          el pago; aquí solo se anuncia. Sin código que teclear. */}
      {!pagaOrg && fundador && (
        <div className="pu-fundador">
          <b>Beta 1 · Precio de fundador: {fundador.tramo}% menos, para siempre</b>
          <span>Quedan {fundador.quedan} {fundador.quedan === 1 ? 'lugar' : 'lugares'} en este tramo. El descuento se aplica al plan mientras mantengas tu suscripción; si la cancelas, se pierde.</span>
        </div>
      )}

      {!pagaOrg && <section className="pu-seccion">
        <h2>{viva ? 'Tu nivel' : 'Elige tu nivel'}</h2>
        <p className="pu-nota">Kickoff es gratis en Telegram. Precios en dólares al mes, IVA incluido{moneda === 'mxn' ? '; en pesos al tipo de cambio FIX del día' : ''}.</p>
        <div className="pu-niveles">
          {NIVELES.map(n => {
            const p = v.planes.find(x => x.clave === n.clave)
            if (!p) return null
            const actual = pagado_ === n.clave
            // Lo que ya viene dentro de lo que pagas no se vende otra vez (#192).
            const conTribu = (actuales['tribu'] ?? 0) > 0
            const incluido = viva && !actual && (
              (n.clave === 'base' && (pagado_ === 'family' || pagado_ === 'pro'))
              || (n.clave === 'family' && pagado_ === 'pro' && conTribu))
            const final = conDescuento(p.precioUsd)
            return (
              <article className={`pu-nivel${actual || incluido ? ' actual' : ''}${elegido === n.clave ? ' elegido' : ''}`} key={n.clave} data-nivel={n.clave}>
                <span className="pu-rotulo">{n.para}</span>
                <h3>{p.nombre}</h3>
                <div className="pu-nivel-precio">
                  {descuento > 0 && <s className="mono">{enMoneda(p.precioUsd)}</s>}
                  <b className="mono">{enMoneda(final)}</b><i>/mes</i>
                </div>
                <ul>{n.rasgos.map(r => <li key={r}>{r}</li>)}</ul>
                {actual ? (
                  <span className="pu-nivel-tuyo">Tu plan</span>
                ) : incluido ? (
                  <span className="pu-nivel-tuyo">{n.clave === 'family' ? 'Activo: paquete con PMO' : 'Incluido en tu plan'}</span>
                ) : (
                  <button
                    className={`ed-btn ${n.clave === 'pro' ? 'primario' : 'suave'}`}
                    disabled={!v.cobro.disponible || estado === 'enviando'}
                    onClick={() => (n.clave === 'pro' && !viva ? setElegido('pro') : void comprar(n.clave))}
                  >
                    {estado === 'enviando' ? 'Abriendo…' : viva ? `Cambiar a ${p.nombre}` : `Contratar ${p.nombre}`}
                  </button>
                )}
              </article>
            )
          })}
        </div>
        {viva && <p className="pu-nota">Al cambiar de nivel, Stripe prorratea la diferencia en tu siguiente cobro.</p>}
      </section>}

      {!pagaOrg && (esPmo || configurandoPmo) && <section className="pu-seccion" id="pmo">
        <h2>{esPmo ? 'Complementos de PMO' : `Arma tu ${pmo.nombre}`}</h2>
        {!esPmo && <p className="pu-nota">PMO incluye 3 proyectos activos, 6 Ejecutores, 2 Monitores, 30 créditos de IA y 100 avisos de WhatsApp. Suma lo que necesites; los complementos no llevan descuento de fundador.</p>}
        <div className="pu-comps">
          {v.complementos.map(c => {
            const n = cant[c.clave] ?? 0
            return (
              <div className={`pu-comp${n ? ' on' : ''}`} key={c.clave}>
                <div>
                  <b>{c.nombre}</b>
                  <span>{c.dice}</span>
                </div>
                <span className="pu-precio mono">{enMoneda(anual ? c.precioAnualUsd : c.precioUsd)}<i>{anual ? '/año' : '/mes'}</i></span>
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
            <small>IVA incluido.{descuento > 0 ? ` Con ${descuento}% de descuento en el plan.` : ''}</small>
            {anual && <small>Al año: PMO y lugares se cobran como {pmo.mesesAnual} meses; los paquetes de créditos y avisos, completos. Créditos y avisos se renuevan cada mes.</small>}
          </div>
          {!viva && (
            <div className="ed-segmentos chico">
              <button className={!anual ? 'on' : ''} onClick={() => setPeriodo('mes')}>Mensual</button>
              <button className={anual ? 'on' : ''} onClick={() => setPeriodo('anio')}>Anual</button>
            </div>
          )}
          <button className="ed-btn primario" disabled={!v.cobro.disponible || estado === 'enviando' || (esPmo && viva && !cambio)}
            onClick={() => void comprar('pro')}>
            {estado === 'enviando' ? 'Abriendo el pago…' : esPmo && viva ? 'Guardar cambios' : `Contratar ${pmo.nombre}`}
          </button>
        </div>
        {error && <div className="ed-error">{error}</div>}
      </section>}

      {!pagaOrg && v.cobro.monedas.length > 1 && (
        <div className="pu-moneda">
          <span>Pagar en</span>
          <div className="ed-segmentos chico">
            <button className={moneda === 'usd' ? 'on' : ''} onClick={() => setMoneda('usd')}>USD</button>
            <button className={moneda === 'mxn' ? 'on' : ''} onClick={() => setMoneda('mxn')}>MXN</button>
          </div>
        </div>
      )}
      {!pagaOrg && !v.cobro.disponible && <p className="pu-nota">El pago en línea todavía no está abierto. Los precios ya son los definitivos.</p>}
      {!pagaOrg && error && !configurandoPmo && !esPmo && <div className="ed-error">{error}</div>}

      {!pagaOrg && !v.suscripcion?.viva && <CanjearCodigo prueba={v.prueba} />}
      {v.invitaciones && <Invitaciones lista={v.invitaciones} />}

      {!pagaOrg && v.historial && <Historial lista={v.historial} hayDatos={!!v.fiscal.datos} />}
      {!pagaOrg && <Facturacion datos={v.fiscal.datos} cobros={v.historial ? [] : v.fiscal.cobros} regimenes={v.fiscal.regimenes} usos={v.fiscal.usos} />}
    </div>
  )
}
