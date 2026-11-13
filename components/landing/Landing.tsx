/**
 * Las landings (decisiones/2026-11-13-planes-por-ambito). La misma piel de
 * siempre (decisiones/2026-11-10-landings-y-portal): una idea por bloque,
 * mucho aire, el color solo en el punto de cada ámbito y el degradado solo en
 * el nombre y el orbe. Cambia la organización:
 *
 * - `LandingGeneral`: `/`.
 * - `LandingNivel`: `/personal`, `/personal-plus`, `/familia`, `/profesional`
 *   y `/pmo`, las cinco con la misma estructura (qué es, objetivo, cuatro
 *   beneficios con su teléfono, ventajas, precio con restricciones, cómo
 *   contratar).
 * - `LandingModulos`: `/modulos`.
 *
 * El contenido vive en `lib/landings.ts` y los precios en `lib/planes.ts`.
 */
import Link from 'next/link'
import { CANALES, GENERAL, NIVELES, QUE_ES } from '@/lib/landings'
import { AMBITO, MODULOS, PLANES, plan, usd, type ClavePlan } from '@/lib/planes'
import { fundadores } from '@/lib/api'
import { Telefono } from './Telefono'
import { Ramas } from './Ramas'
import { BTN_PRI, BTN_SEC, Punto, TarjetaPlan, hrefContratar } from './piezas'

const CAJA = 'mx-auto w-full max-w-[1120px] px-6 sm:px-8'
const TITULO = { letterSpacing: '-0.04em' }
const TARJETA = 'rounded-[28px] bg-superficie shadow-z1'

function H2({ a, b }: { a: string; b?: string }) {
  return (
    <h2 className="text-[40px] leading-[1.05] font-semibold sm:text-[48px]" style={TITULO}>
      {a}{b && <><br /><span className="text-[#8e8e93]">{b}</span></>}
    </h2>
  )
}


async function BannerFundador({ clave }: { clave?: ClavePlan }) {
  if (clave && !plan(clave).fundador) return null
  const f = await fundadores()
  if (!f.abierto || !f.tramo) return null
  return (
    <p className="m-0 rounded-full bg-superficie px-5 py-2.5 text-center text-[15px] text-tinta shadow-z1">
      Quedan <b>{f.quedan}</b> {f.quedan === 1 ? 'lugar' : 'lugares'} de fundador al <b>{f.tramo}%</b> de por vida.
    </p>
  )
}

function ComoContratar({ clave }: { clave: ClavePlan }) {
  const gratis = clave === 'free'
  const pasos = gratis
    ? [
      { t: 'Crea tu cuenta', p: 'Con Telegram o con tu correo. Sin tarjeta.' },
      { t: 'Escríbele', p: 'En la app o en Telegram: «Recuérdame…».' },
      { t: 'Listo', p: 'Cuando quieras portal e IA, sube a Personal+.' },
    ]
    : [
      { t: 'Crea tu cuenta o entra', p: 'Con Telegram o con tu correo.' },
      { t: 'Revisa tu plan', p: `${plan(clave).nombre}, en dólares o pesos${plan(clave).anual ? ', mensual o anual' : ''}, con tu descuento de fundador si hay lugar.` },
      { t: 'Paga y empieza', p: 'Pago seguro con Stripe. Vuelves a tu portal con todo encendido.' },
    ]
  return (
    <section className="py-24">
      <div className={`${CAJA} flex flex-col gap-10`}>
        <H2 a="Cómo contratar." b={gratis ? 'Un minuto, sin tarjeta.' : 'Tres pasos.'} />
        <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3">
          {pasos.map((x, i) => (
            <li key={x.t} className={`${TARJETA} flex flex-col gap-2 p-7`}>
              <span className="text-[15px] text-tinta-3">{i + 1}</span>
              <span className="text-[22px] font-semibold">{x.t}</span>
              <span className="text-[16px] leading-[1.5] text-tinta-2">{x.p}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3">
          <Link href={hrefContratar(clave)} className={BTN_PRI}>{plan(clave).cta}</Link>
          <Link href="/app" className={BTN_SEC}>Ya tengo cuenta</Link>
        </div>
      </div>
    </section>
  )
}

/** El cierre: las otras landings y la general. */
function Otras({ actual }: { actual: ClavePlan | 'modulos' }) {
  return (
    <section className="bg-superficie-2 py-20">
      <div className={`${CAJA} flex flex-col items-start gap-6`}>
        <span className="z-orbe size-14" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <span className="text-[26px] font-semibold" style={{ letterSpacing: '-0.03em' }}>Una sola Zaelyn para todo.</span>
          <span className="text-[15px] text-tinta-3">Cada nivel y cada módulo se contrata por separado.</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {PLANES.filter(p => p.clave !== actual).map(p => <Link key={p.clave} href={p.ruta} className={`${BTN_SEC} h-11 text-[15px]`}>{p.nombre.replace('Zaelyn ', '')}</Link>)}
          {actual !== 'modulos' && <Link href="/modulos" className={`${BTN_SEC} h-11 text-[15px]`}>Módulos</Link>}
          <Link href="/" className={`${BTN_SEC} h-11 text-[15px]`}>Todo Zaelyn</Link>
        </div>
      </div>
    </section>
  )
}

// ── por nivel ───────────────────────────────────────────────────────────────
export function LandingNivel({ clave }: { clave: ClavePlan }) {
  const l = NIVELES[clave]
  const p = plan(clave)
  const color = AMBITO[p.ambito].color
  return (
    <div className="bg-fondo text-tinta">
      {/* 1 · qué es + el titular del nivel */}
      <section className="pt-20 pb-24 sm:pt-28">
        <div className={`${CAJA} grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]`}>
          <div className="flex flex-col gap-6">
            <span className="flex items-center gap-2.5 text-[15px] text-tinta-2"><Punto color={color} />{p.nombre}</span>
            <h1 className="text-[38px] leading-[1.05] font-semibold sm:text-[60px]" style={{ letterSpacing: '-0.045em' }}>
              {l.titular[0]}<br /><span className="text-[#8e8e93]">{l.titular[1]}</span>
            </h1>
            <p className="max-w-[36ch] text-[19px] leading-[1.5] text-tinta-2 sm:text-[21px]">{QUE_ES.join(' ')}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={hrefContratar(clave)} className={BTN_PRI}>{p.cta}</Link>
              <Link href="#precio" className={BTN_SEC}>{p.precio ? `${usd(p.precio)} USD al mes` : 'Ver qué incluye'}</Link>
            </div>
            <p className="text-[15px] text-tinta-3">{clave === 'free' ? 'App · Telegram' : CANALES}</p>
          </div>
          <div className="flex justify-center">
            <Telefono piezas={l.beneficios.flatMap(b => b.conversacion.slice(0, 2)).slice(0, 6)} etiqueta={`Así se ve ${p.nombre} en la app`} />
          </div>
        </div>
      </section>

      {/* 2 · objetivo */}
      <section className="bg-superficie-2 py-20">
        <div className={`${CAJA} flex flex-col gap-3`}>
          <span className="text-[15px] text-tinta-3">El objetivo</span>
          <p className="m-0 max-w-[24ch] text-[34px] leading-[1.15] font-semibold sm:text-[44px]" style={TITULO}>{p.objetivo}</p>
        </div>
      </section>

      {/* 3 · beneficios, cada uno con su conversación */}
      <section className="py-24">
        <div className={`${CAJA} flex flex-col gap-24`}>
          {l.beneficios.map((b, i) => (
            <div key={b.titulo} className="grid items-center gap-12 md:grid-cols-2">
              <div className={`flex flex-col gap-3 ${i % 2 ? 'md:order-2' : ''}`}>
                <span className="text-[15px] text-tinta-3">{i + 1} de {l.beneficios.length}</span>
                <h2 className="text-[34px] leading-[1.1] font-semibold sm:text-[40px]" style={TITULO}>{b.titulo}</h2>
                <p className="text-[18px] leading-[1.55] text-tinta-2">{b.texto}</p>
              </div>
              <div className="flex justify-center">
                <Telefono piezas={b.conversacion} etiqueta={b.titulo} chico />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 · ventajas */}
      <section className="bg-superficie-2 py-24">
        <div className={`${CAJA} grid gap-x-24 gap-y-10 md:grid-cols-2`}>
          <div className="md:col-span-2"><H2 a="Contra hacerlo a mano" b="o con otra app." /></div>
          {l.ventajas.map(v => (
            <p key={v} className="m-0 flex gap-3 text-[19px] leading-[1.5]">
              <Punto color={color} /><span className="-mt-1.5">{v}</span>
            </p>
          ))}
        </div>
      </section>

      {/* 5 · precio del nivel */}
      <section id="precio" className="py-24">
        <div className={`${CAJA} flex flex-col items-center gap-8`}>
          <H2 a={p.precio ? `${usd(p.precio)} USD al mes.` : 'Gratis.'} b={p.precio ? 'Más IVA o sales tax.' : 'Para siempre.'} />
          <BannerFundador clave={clave} />
          <div className="w-full max-w-[440px]"><TarjetaPlan clave={clave} fuerte /></div>
          <Link href="/precios" className="text-[16px] font-semibold text-tinta no-underline">Ver todos los planes y módulos ›</Link>
        </div>
      </section>

      {/* 6 · cómo contratar */}
      <ComoContratar clave={clave} />
      <Otras actual={clave} />
    </div>
  )
}

// ── general ─────────────────────────────────────────────────────────────────
export function LandingGeneral() {
  const g = GENERAL
  return (
    <div className="bg-fondo text-tinta">
      {/* 1 · hero */}
      <section className="pt-24 pb-16 text-center sm:pt-[120px]">
        <div className={`${CAJA} flex flex-col items-center gap-7`}>
          <span className="z-orbe respira size-[132px]" aria-hidden="true" />
          <h1 className="max-w-[16ch] text-[38px] leading-[1.05] font-semibold sm:text-[64px]" style={{ letterSpacing: '-0.045em' }}>
            {g.titular[0]}<br /><span className="text-[#8e8e93]">{g.titular[1]}</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/empezar" className={BTN_PRI}>Empieza gratis</Link>
            <Link href="/precios" className={BTN_SEC}>Ver planes</Link>
          </div>
          <p className="text-[15px] text-tinta-3">{CANALES}</p>
        </div>
      </section>
      <section className="pb-28">
        <div className={`${CAJA} flex justify-center`}>
          <Telefono piezas={g.conversacion} etiqueta="Así se ve Zaelyn en la app" />
        </div>
      </section>

      {/* 2 · qué es */}
      <section className="bg-superficie-2 py-24">
        <div className={`${CAJA} flex flex-col gap-5`}>
          <H2 a="Qué es Zaelyn." />
          <p className="m-0 max-w-[40ch] text-[21px] leading-[1.5] text-tinta-2">{QUE_ES.join(' ')}</p>
        </div>
      </section>

      {/* 3 · dónde vive */}
      <section className="py-24">
        <div className={`${CAJA} flex flex-col gap-10`}>
          <H2 a="Vive donde tú estás." b="Lo que haces en uno aparece en los otros." />
          <div className="grid gap-5 md:grid-cols-3">
            {g.dondeVive.map(d => (
              <div key={d.titulo} className={`${TARJETA} flex flex-col gap-2 p-8`}>
                <span className="text-[26px] font-semibold" style={{ letterSpacing: '-0.03em' }}>{d.titulo}</span>
                <span className="text-[16px] leading-[1.5] text-tinta-2">{d.texto}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · objetivo */}
      <section className="bg-superficie-2 py-20">
        <div className={`${CAJA} flex flex-col gap-3`}>
          <span className="text-[15px] text-tinta-3">El objetivo</span>
          <p className="m-0 max-w-[26ch] text-[34px] leading-[1.15] font-semibold sm:text-[44px]" style={TITULO}>{g.objetivo}</p>
        </div>
      </section>

      {/* 5 · un ejemplo por nivel */}
      <section className="py-24">
        <div className="flex flex-col gap-10">
          <div className={CAJA}><H2 a="Un ejemplo por nivel." b="Cada uno con su propia landing." /></div>
          <div className="flex snap-x gap-8 overflow-x-auto px-6 pb-6 sm:px-8 xl:px-[calc((100vw_-_1120px)/2_+_2rem)]">
            {PLANES.map(p => (
              <Link key={p.clave} href={p.ruta} className="flex flex-none snap-start flex-col gap-4 text-tinta no-underline">
                <span className="flex items-center gap-2.5 text-[15px] font-semibold"><Punto color={AMBITO[p.ambito].color} />{p.nombre}</span>
                <Telefono piezas={NIVELES[p.clave].beneficios[0]!.conversacion} etiqueta={p.nombre} chico />
                <span className="max-w-[300px] text-[15px] leading-[1.45] text-tinta-2">{p.objetivo} <b className="text-tinta">Conocer ›</b></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · precios en ramas */}
      <section id="precios" className="bg-superficie-2 py-24">
        <div className={`${CAJA} flex flex-col items-center gap-10`}>
          <H2 a="No es una escalera." b="Tomas solo lo que usas." />
          <BannerFundador />
          <Ramas />
          <Link href="/precios" className="text-[16px] font-semibold text-tinta no-underline">Comparar todo lo que incluye cada plan ›</Link>
        </div>
      </section>

      {/* 7 · módulos */}
      <BloqueModulos />

      {/* 8 · CTA */}
      <section className="py-28 text-center">
        <div className={`${CAJA} flex flex-col items-center gap-6`}>
          <span className="z-orbe size-16" aria-hidden="true" />
          <h2 className="text-[44px] font-semibold" style={TITULO}>Escríbele hoy.</h2>
          <Link href="/empezar" className={BTN_PRI}>Empieza gratis</Link>
        </div>
      </section>
    </div>
  )
}

function BloqueModulos() {
  return (
    <section className="pb-28">
      <div className={CAJA}>
        <div className="flex flex-col gap-8 rounded-[32px] bg-superficie-2 p-10 md:p-12">
          <div className="flex flex-col gap-2.5">
            <span className="text-[15px] text-tinta-3">Módulos</span>
            <h2 className="text-[32px] leading-[1.15] font-semibold" style={{ letterSpacing: '-0.03em' }}>Zaelyn también habla con tus otras apps.</h2>
            <p className="text-[17px] leading-[1.5] text-tinta-2">Kore y TCGBusters, gratis desde Personal.</p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            {MODULOS.map(m => (
              <Link key={m.clave} href="/modulos" className="flex w-[180px] flex-col gap-1.5 rounded-[22px] bg-superficie p-[22px] text-tinta no-underline">
                <span className="text-[19px] font-semibold">{m.nombre}</span>
                <span className="text-[14px] text-tinta-2">{m.estado === 'gratis' ? 'Gratis' : 'Próximamente'}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ── módulos ─────────────────────────────────────────────────────────────────
export function LandingModulos() {
  return (
    <div className="bg-fondo text-tinta">
      <section className="pt-20 pb-16 sm:pt-28">
        <div className={`${CAJA} flex flex-col gap-6`}>
          <span className="flex items-center gap-2.5 text-[15px] text-tinta-2"><Punto color={AMBITO.modulo.color} />Módulos de Zaelyn</span>
          <h1 className="text-[38px] leading-[1.05] font-semibold sm:text-[60px]" style={{ letterSpacing: '-0.045em' }}>
            Tus otras apps,<br /><span className="text-[#8e8e93]">en la misma conversación.</span>
          </h1>
          <p className="max-w-[36ch] text-[19px] leading-[1.5] text-tinta-2 sm:text-[21px]">{QUE_ES[0]} Con los módulos, también habla con las apps que ya usas.</p>
        </div>
      </section>
      <section className="pb-24">
        <div className={`${CAJA} grid gap-16 md:grid-cols-2`}>
          {MODULOS.filter(m => m.ejemplo).map(m => (
            <div key={m.clave} className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-1.5 text-center">
                <span className="text-[30px] font-semibold" style={TITULO}>{m.nombre}</span>
                <span className="text-[16px] text-tinta-2">{m.que} Gratis desde Personal.</span>
              </div>
              <Telefono chico etiqueta={m.nombre} piezas={[
                { yo: m.ejemplo!.yo },
                { tarjeta: { ambito: 'modulo', contexto: m.nombre, titulo: m.ejemplo!.titulo, dato: m.ejemplo!.dato, opciones: m.ejemplo!.opciones } },
              ]} />
            </div>
          ))}
        </div>
      </section>
      <section className="bg-superficie-2 py-20">
        <div className={`${CAJA} flex flex-col gap-6`}>
          <H2 a="Los que vienen." />
          <div className="flex flex-wrap gap-3.5">
            {MODULOS.filter(m => m.estado === 'pronto').map(m => (
              <div key={m.clave} className="flex w-[200px] flex-col gap-1.5 rounded-[22px] bg-superficie p-[22px]">
                <span className="text-[19px] font-semibold">{m.nombre}</span>
                <span className="text-[14px] text-tinta-2">Próximamente</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ComoContratar clave="free" />
      <Otras actual="modulos" />
    </div>
  )
}
