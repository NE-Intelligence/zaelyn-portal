import Link from 'next/link'
import { Barra } from '@/components/portal/Marco'
import { Preferencias } from '@/components/Preferencias'
import { soyAdmin } from '@/lib/api'
import { textos } from '@/lib/copy'
import { idiomaActual, temaActual } from '@/lib/preferencias'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Configuración' }

/**
 * `/app/configuracion` — cómo se ve y cómo se comporta Zaelyn para ti
 * (decisiones/2026-11-10-landings-y-portal). En el teléfono es también «Más»:
 * lleva a Apps, Mensajes, Cuenta y Admin, que no caben en las pestañas.
 *
 * La personalidad, los avisos y las paletas viven en el motor y se cambian
 * platicando con Zaelyn; aquí solo tema e idioma, que son del navegador.
 */
export default async function Configuracion() {
  const [lang, tema, admin] = await Promise.all([idiomaActual(), temaActual(), soyAdmin()])
  const t = textos(lang)
  const fila = 'flex items-center justify-between gap-4 border-b border-linea px-6 py-4 text-[16px] text-tinta no-underline last:border-0'
  return (
    <>
      <Barra area="cuenta" sesion />
      <main className="mx-auto flex w-full max-w-[760px] flex-col gap-9 px-6 pt-12 pb-20 text-tinta sm:px-14">
        <h1 className="text-[34px] font-semibold sm:text-[40px]" style={{ letterSpacing: '-0.04em' }}>Configuración</h1>

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-medium text-tinta-3">Apariencia e idioma</h2>
          <div className="flex items-center justify-between gap-4 rounded-[22px] bg-superficie px-6 py-4 shadow-z1">
            <span className="text-[16px]">Tema e idioma</span>
            <Preferencias
              lang={lang}
              tema={tema}
              clase="pt"
              et={{ tema: t('nav.tema'), claro: t('nav.tema.claro'), oscuro: t('nav.tema.oscuro'), sistema: t('nav.tema.sistema'), idioma: t('nav.idioma') }}
            />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-medium text-tinta-3">Zaelyn</h2>
          <div className="flex items-start gap-4 rounded-[22px] bg-superficie px-6 py-5 shadow-z1">
            <span className="z-orbe size-9" aria-hidden="true" />
            <p className="text-[15px] leading-[1.5] text-tinta-2">Su personalidad, a qué hora te avisa y por dónde, se cambian platicando con ella: «avísame por WhatsApp», «sé más breve».</p>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[15px] font-medium text-tinta-3">Más</h2>
          <nav className="flex flex-col rounded-[22px] bg-superficie shadow-z1" aria-label="Más secciones">
            <Link href="/app/mensajes" className={fila}>Mensajes <span className="text-tinta-3">›</span></Link>
            <Link href="/app/apps" className={fila}>Apps <span className="text-tinta-3">›</span></Link>
            <Link href="/app/cuenta" className={fila}>Cuenta <span className="text-tinta-3">›</span></Link>
            <Link href="/app/plan" className={fila}>Plan y uso <span className="text-tinta-3">›</span></Link>
            {admin && <Link href="/admin" className={fila}>Admin <span className="text-tinta-3">›</span></Link>}
          </nav>
          <form action="/salir" method="post">
            <button type="submit" className="mt-2 h-11 w-full cursor-pointer rounded-full border-0 bg-superficie-2 text-[15px] font-medium text-tinta">Salir</button>
          </form>
        </section>
      </main>
    </>
  )
}
