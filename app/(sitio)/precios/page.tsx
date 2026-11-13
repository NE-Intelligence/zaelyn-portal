import type { Metadata } from 'next'
import Link from 'next/link'
import { Ramas } from '@/components/landing/Ramas'
import { BTN_PRI, BTN_SEC } from '@/components/landing/piezas'
import { fundadores } from '@/lib/api'
import { COMPLEMENTOS, FAMILIA_A_MITAD, MESES_ANUAL, PLANES, plan, usd } from '@/lib/planes'
import { metaDeLanding } from '@/lib/meta-landing'

export const metadata: Metadata = metaDeLanding(
  { titulo: 'Precios de Zaelyn · Personal, Personal+, Familia, Profesional y PMO', descripcion: 'No es una escalera: cada nivel y cada módulo se contrata por separado. Personal es gratis.' },
  '/precios',
)

const CAJA = 'mx-auto w-full max-w-[1120px] px-6 sm:px-8'
const TITULO = { letterSpacing: '-0.04em' }

type Celda = boolean | string
/** Lo que trae cada nivel, en el orden de `PLANES`: Personal, Personal+, Familia, Profesional, PMO. */
const COMPARA: { f: string; v: [Celda, Celda, Celda, Celda, Celda] }[] = [
  { f: 'App y Telegram', v: [true, true, true, true, true] },
  { f: 'Portal web', v: [false, true, true, true, true] },
  { f: 'Recordatorios activos', v: ['5', 'Sin tope', 'Sin tope', 'Sin tope', 'Sin tope'] },
  { f: 'Memoria', v: ['15 días', 'Sin tope', 'Sin tope', 'Sin tope', 'Sin tope'] },
  { f: 'Chat con IA, voz, fotos y documentos', v: [false, true, true, true, true] },
  { f: 'Familia: quién lleva, obligaciones y premios', v: [false, false, true, false, false] },
  { f: 'Grupos de trabajo', v: [false, false, false, 'Sin tope de miembros', 'Sin tope de miembros'] },
  { f: 'Registro de horas', v: [false, false, false, true, true] },
  { f: 'Proyectos con roles, asignación y aprobaciones', v: [false, false, false, false, true] },
  { f: 'Asientos incluidos', v: ['—', '—', '4 integrantes', '—', 'Sponsor, 1 Líder, 3 Ejecutores'] },
  { f: 'Kore y TCGBusters', v: [true, true, true, true, true] },
]

const PREGUNTAS = [
  { q: '¿Es una escalera?', a: 'No. Personal es la base y Personal+ le suma portal e IA. De ahí salen dos ramas hermanas: Familia, para tu casa, y Profesional, para tu trabajo. PMO es el módulo de proyectos e incluye Profesional y Personal+.' },
  { q: '¿Y si quiero Familia y trabajo?', a: `Pagas la rama más cara completa y la otra a mitad: Familia como complemento de Profesional o de PMO cuesta ${usd(FAMILIA_A_MITAD)} USD al mes.` },
  { q: '¿Los precios incluyen impuestos?', a: 'No. Son netos en dólares al mes; el IVA o el sales tax se agregan al pagar. También puedes pagar en pesos.' },
  { q: '¿Hay pago anual?', a: `En PMO, sí: pagas ${MESES_ANUAL} meses y usas 12. Los demás planes son mensuales.` },
  { q: '¿Qué es el precio de fundador?', a: 'Las primeras 30 suscripciones tienen un descuento permanente: 75% las primeras 10, 50% las siguientes 10 y 25% las últimas 10. Lo pone el sistema al pagar, sin códigos. Dura mientras sigas pagando: si cancelas, se pierde para siempre. Hoy no aplica a Profesional.' },
  { q: '¿Qué pasa con los integrantes de mi familia que no pagan?', a: 'Tienen Zaelyn Personal: la app y Telegram, sin portal. Ven y hacen lo que les toca en la familia.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí, desde Plan y uso. Se cancela al final del periodo pagado y tu cuenta vuelve a Personal, gratis.' },
]

/** `/precios` — las ramas, la comparación, los complementos y las preguntas (decisiones/2026-11-13-planes-por-ambito). */
export default async function Precios() {
  const f = await fundadores()
  const celda = (v: Celda) => (typeof v === 'boolean' ? (v ? <span aria-label="Incluido">✓</span> : <span className="text-tinta-3" aria-label="No incluido">—</span>) : v)

  return (
    <div className="bg-fondo text-tinta">
      <section className="pt-20 pb-12 text-center sm:pt-28">
        <div className={`${CAJA} flex flex-col items-center gap-5`}>
          <h1 className="text-[38px] leading-[1.05] font-semibold sm:text-[60px]" style={{ letterSpacing: '-0.045em' }}>
            No es una escalera.<br /><span className="text-[#8e8e93]">Tomas solo lo que usas.</span>
          </h1>
          {f.abierto && f.tramo && (
            <p className="m-0 rounded-full bg-superficie px-5 py-2.5 text-[15px] shadow-z1">
              Quedan <b>{f.quedan}</b> {f.quedan === 1 ? 'lugar' : 'lugares'} de fundador al <b>{f.tramo}%</b> de por vida.
            </p>
          )}
        </div>
      </section>

      <section className="pb-24">
        <div className={CAJA}><Ramas /></div>
      </section>

      <section className="bg-superficie-2 py-24" id="comparar">
        <div className={`${CAJA} flex flex-col gap-8`}>
          <h2 className="text-[40px] leading-[1.05] font-semibold" style={TITULO}>Qué trae cada uno.</h2>
          <div className="overflow-x-auto rounded-[24px] bg-superficie shadow-z1" role="region" aria-label="Comparación de planes" tabIndex={0}>
            <table className="w-full min-w-[820px] border-collapse text-[15px]">
              <thead>
                <tr>
                  <th scope="col" className="p-4 text-left"><span className="sr-only">Qué incluye</span></th>
                  {PLANES.map(p => (
                    <th scope="col" key={p.clave} className="p-4 text-left align-bottom">
                      <span className="block font-semibold">{p.nombre.replace('Zaelyn ', '')}</span>
                      <small className="font-normal text-tinta-3">{p.precio ? `${usd(p.precio)} USD` : 'Gratis'}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARA.map(fila => (
                  <tr key={fila.f} className="border-t border-linea">
                    <th scope="row" className="p-4 text-left font-medium">{fila.f}</th>
                    {fila.v.map((v, i) => <td key={i} className="p-4 text-tinta-2">{celda(v)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-24" id="complementos">
        <div className={`${CAJA} flex flex-col gap-8`}>
          <h2 className="text-[40px] leading-[1.05] font-semibold" style={TITULO}>Complementos.</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {(['family', 'pro'] as const).map(de => (
              <div key={de} className="flex flex-col gap-3 rounded-[24px] bg-superficie p-7 shadow-z1">
                <span className="text-[22px] font-semibold">{plan(de).nombre}</span>
                <ul className="m-0 grid list-none gap-2 p-0 text-[16px]">
                  {COMPLEMENTOS.filter(c => c.de === de).map(c => (
                    <li key={c.nombre} className="flex justify-between gap-4">
                      <span>{c.nombre}{c.nota && <span className="text-tinta-3"> · {c.nota}</span>}</span>
                      <span className="tabular-nums text-tinta-2">{usd(c.precio)} USD</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="m-0 text-[15px] text-tinta-3">Precios netos al mes; el IVA o el sales tax van aparte. Los complementos no llevan descuento de fundador.</p>
        </div>
      </section>

      <section className="bg-superficie-2 py-24" id="preguntas">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-6 sm:px-8">
          <h2 className="text-[40px] leading-[1.05] font-semibold" style={TITULO}>Preguntas.</h2>
          <div className="flex flex-col gap-3">
            {PREGUNTAS.map(p => (
              <details key={p.q} className="rounded-[20px] bg-superficie px-6 py-4 shadow-z1">
                <summary className="cursor-pointer text-[17px] font-semibold">{p.q}</summary>
                <p className="mt-3 mb-0 text-[16px] leading-[1.55] text-tinta-2">{p.a}</p>
              </details>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/empezar" className={BTN_PRI}>Empieza gratis</Link>
            <Link href="/legal/terminos" className={BTN_SEC}>Condiciones de uso</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
