/**
 * La plantilla única de las landings (decisiones/2026-11-10-landings-y-portal).
 * La principal y las tres soluciones se arman con ella; cambia el contenido
 * (`lib/landings.ts`), no la estructura. Una idea por bloque, mucho aire, el
 * color solo en el punto de cada módulo y el degradado solo en el nombre y el
 * orbe. Tailwind con los tokens de `app/zaelyn.css`.
 */
import Link from 'next/link'
import { LANDINGS, MODULO, canales, type Landing as L, type Modulo } from '@/lib/landings'
import { PLANES_PUBLICOS } from '@/lib/precios'
import { textos } from '@/lib/copy'
import { Telefono } from './Telefono'

const CAJA = 'mx-auto w-full max-w-[1120px] px-6 sm:px-8'
const TITULO = { letterSpacing: '-0.04em' }
const BTN = 'inline-flex h-[52px] items-center justify-center rounded-full px-[26px] text-[16px] font-semibold no-underline transition-shadow'
const BTN_PRI = `${BTN} bg-pri text-sobre-pri hover:shadow-z2`
const BTN_SEC = `${BTN} bg-superficie text-tinta shadow-[inset_0_0_0_1px_var(--z-line)] hover:shadow-[inset_0_0_0_1px_var(--z-line-strong)]`
const TARJETA = 'rounded-[28px] bg-superficie shadow-z1'

export function Landing({ l }: { l: L }) {
  const t = textos('es')
  const planes = PLANES_PUBLICOS.filter(p => l.planes.includes(p.id))
  const mod = l.id === 'zaelyn' ? null : MODULO[l.id as Modulo]
  const otras = (Object.keys(MODULO) as Modulo[]).filter(m => m !== l.id)
  const conversacion = l.id === 'zaelyn'

  return (
    <div className="bg-fondo text-tinta">
      {/* ── el titular ── */}
      <section className={conversacion ? 'pt-24 pb-16 text-center sm:pt-[120px]' : 'pt-20 pb-24 sm:pt-28'}>
        <div className={`${CAJA} ${conversacion ? 'flex flex-col items-center gap-7' : 'grid items-center gap-16 lg:grid-cols-[1.1fr_1fr]'}`}>
          <div className={`flex flex-col gap-6 ${conversacion ? 'items-center' : ''}`}>
            {conversacion
              ? <span className="z-orbe respira size-[132px]" aria-hidden="true" />
              : (
                <span className="flex items-center gap-2.5 text-[15px] text-tinta-2">
                  <span className="size-2.5 rounded-full" style={{ background: mod!.color }} aria-hidden="true" />
                  {l.rotulo}
                </span>
              )}
            <h1 className={`text-[38px] leading-[1.05] font-semibold sm:text-[64px] ${conversacion ? 'max-w-[13ch] lg:text-[72px]' : ''}`} style={{ letterSpacing: '-0.045em' }}>
              {l.titular[0]}<br /><span className="text-[#8e8e93]">{l.titular[1]}</span>
            </h1>
            <p className={`text-[19px] leading-[1.5] text-tinta-2 sm:text-[21px] ${conversacion ? 'max-w-[34ch]' : 'max-w-[32ch]'}`}>{l.bajada}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={l.cta.href} className={BTN_PRI}>{l.cta.texto}</Link>
              <Link href={l.cta2.href} className={BTN_SEC}>{l.cta2.texto}</Link>
            </div>
            <p className="text-[15px] text-tinta-3">{canales}</p>
          </div>
          {!conversacion && (
            <div className="flex justify-center">
              <Telefono piezas={l.conversacion} etiqueta={`Así se ve Zaelyn ${mod!.nombre} en la app`} />
            </div>
          )}
        </div>
      </section>

      {conversacion && (
        <section className="pb-32">
          <div className={`${CAJA} flex justify-center`}>
            <Telefono piezas={l.conversacion} etiqueta="Así se ve Zaelyn en la app" />
          </div>
        </section>
      )}

      {/* ── las tres soluciones (solo la principal) ── */}
      {l.soluciones && (
        <section id="soluciones" className="bg-superficie-2 py-24">
          <div className={`${CAJA} flex flex-col gap-12`}>
            <div className="flex max-w-[620px] flex-col gap-3">
              <h2 className="text-[40px] leading-[1.05] font-semibold sm:text-[48px]" style={TITULO}>
                Tres soluciones.<br /><span className="text-[#8e8e93]">Una sola Zaelyn.</span>
              </h2>
              <p className="text-[19px] leading-[1.5] text-tinta-2">Empieza por la que más te urge. Las tres viven en la misma conversación.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {(Object.keys(MODULO) as Modulo[]).map(m => (
                <Link key={m} href={MODULO[m].ruta} className={`${TARJETA} flex flex-col gap-3.5 p-8 text-tinta no-underline transition-shadow hover:shadow-z2`}>
                  <span className="flex items-center gap-2.5 text-[15px] text-tinta-2">
                    <span className="size-2.5 rounded-full" style={{ background: MODULO[m].color }} aria-hidden="true" />
                    {MODULO[m].nombre}
                  </span>
                  <span className="text-[28px] leading-[1.15] font-semibold" style={{ letterSpacing: '-0.03em' }}>{LANDINGS[m].titular.join(' ')}</span>
                  <span className="text-[16px] leading-[1.5] text-tinta-2">{LANDINGS[m].meta.descripcion}</span>
                  <span className="mt-auto pt-3 text-[16px] font-semibold">Conocer {MODULO[m].nombre} ›</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── beneficios ── */}
      <section className={l.soluciones ? 'py-28' : 'bg-superficie-2 py-24'}>
        <div className={`${CAJA} grid gap-x-24 gap-y-14 md:grid-cols-2`}>
          <h2 className="max-w-[18ch] text-[40px] leading-[1.05] font-semibold sm:text-[48px] md:col-span-2" style={TITULO}>{l.beneficios.titulo}</h2>
          {l.beneficios.lista.map(b => (
            <div key={b.titulo} className="flex flex-col gap-2.5">
              <h3 className="text-[22px] font-semibold">{b.titulo}</h3>
              <p className="text-[17px] leading-[1.55] text-tinta-2">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── apps conectadas ── */}
      {l.apps && (
        <section className="pb-28">
          <div className={CAJA}>
            <div className="flex flex-col gap-8 rounded-[32px] bg-superficie-2 p-10 md:flex-row md:items-center md:p-12">
              <div className="flex flex-1 flex-col gap-2.5">
                <span className="text-[15px] text-tinta-3">Apps conectadas</span>
                <h2 className="text-[32px] leading-[1.15] font-semibold" style={{ letterSpacing: '-0.03em' }}>Zaelyn también habla con tus otras apps.</h2>
                <p className="text-[17px] leading-[1.5] text-tinta-2">Incluidas para todos los que tienen portal.</p>
              </div>
              <div className="flex flex-wrap gap-3.5">
                <div className="flex w-[180px] flex-col gap-1.5 rounded-[22px] bg-superficie p-[22px]"><span className="text-[19px] font-semibold">Kore</span><span className="text-[14px] text-tinta-2">Salud y entrenamiento</span></div>
                <div className="flex w-[180px] flex-col gap-1.5 rounded-[22px] bg-superficie p-[22px]"><span className="text-[19px] font-semibold">TCGBusters</span><span className="text-[14px] text-tinta-2">Cartas coleccionables</span></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── precios ── */}
      <section id="precios" className="bg-superficie-2 py-24">
        <div className={`${CAJA} flex flex-col items-center gap-11`}>
          <div className="flex flex-col items-center gap-3 text-center">
            <h2 className="text-[40px] leading-[1.05] font-semibold sm:text-[48px]" style={TITULO}>
              {l.preciosTitulo[0]}<br /><span className="text-[#8e8e93]">{l.preciosTitulo[1]}</span>
            </h2>
            <p className="text-[17px] text-tinta-3">Precios en USD al mes, con IVA.</p>
          </div>
          <div className={`grid w-full gap-4 ${planes.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'max-w-[760px] sm:grid-cols-2'}`}>
            {planes.map(p => {
              const fuerte = p.id !== 'kickoff' && (planes.length === 2 || p.destacado)
              return (
                <div key={p.id} className={`flex flex-col gap-2.5 rounded-[24px] bg-superficie p-7 ${fuerte ? 'shadow-[inset_0_0_0_1.5px_var(--z-ink)]' : 'shadow-z1'}`}>
                  <span className="text-[15px] text-tinta-3">{t(p.para)}</span>
                  <span className="text-[22px] font-semibold">{p.nombre}</span>
                  <span className="text-[40px] leading-none font-semibold" style={TITULO}>
                    {p.precio ?? 'Gratis'}
                    {p.precio && <span className="ml-1.5 text-[14px] font-normal text-tinta-3" style={{ letterSpacing: 0 }}>USD al mes</span>}
                  </span>
                  {planes.length > 2
                    ? <span className="text-[15px] leading-[1.5] text-tinta-2">{t(p.resumen)}</span>
                    : (
                      <ul className="m-0 grid list-none gap-1.5 p-0 text-[15px] leading-[1.5] text-tinta-2">
                        {p.rasgos.slice(0, 4).map(r => <li key={r}>{t(r)}</li>)}
                      </ul>
                    )}
                  <Link href={p.id === 'kickoff' ? '/empezar' : `/empezar?plan=${p.id}`} className={`${fuerte ? BTN_PRI : BTN_SEC} mt-auto h-11 text-[15px]`}>{t(p.cta)}</Link>
                </div>
              )
            })}
          </div>
          <Link href="/precios" className="text-[16px] font-semibold text-tinta no-underline">
            {planes.length > 2 ? 'Comparar todo lo que incluye cada plan ›' : 'Ver todos los planes ›'}
          </Link>
        </div>
      </section>

      {/* ── el cierre ── */}
      {mod ? (
        <section className="py-24">
          <div className={`${CAJA} flex flex-col items-start gap-6 md:flex-row md:items-center md:gap-8`}>
            <span className="z-orbe size-14" aria-hidden="true" />
            <div className="flex flex-1 flex-col gap-1">
              <span className="text-[26px] font-semibold" style={{ letterSpacing: '-0.03em' }}>Zaelyn también organiza {otras.map(o => (o === 'pmo' ? 'tus proyectos' : o === 'familia' ? 'tu familia' : 'tu día')).join(' y ')}.</span>
              <span className="text-[15px] text-tinta-3">Con la misma conversación.</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {otras.map(o => <Link key={o} href={MODULO[o].ruta} className={BTN_SEC}>{MODULO[o].nombre}</Link>)}
              <Link href="/" className={BTN_SEC}>Todo Zaelyn</Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-28 text-center">
          <div className={`${CAJA} flex flex-col items-center gap-6`}>
            <span className="z-orbe size-16" aria-hidden="true" />
            <h2 className="text-[44px] font-semibold" style={TITULO}>Escríbele hoy.</h2>
            <Link href={l.cta.href} className={BTN_PRI}>{l.cta.texto}</Link>
          </div>
        </section>
      )}
    </div>
  )
}
