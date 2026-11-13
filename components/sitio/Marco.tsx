import Link from 'next/link'
import Menu from './Menu'
import { Logo, LogoBarra } from '@/components/Logo'
import { Preferencias } from '@/components/Preferencias'
import { type Idioma, textos } from '@/lib/copy'
import type { Tema } from '@/lib/preferencias'

/**
 * La cinta, la barra y el pie del sitio público (#186).
 *
 * El menú dice QUÉ ES Zaelyn en el orden en que se entiende: los tres
 * espacios (Personal, Familia, Proyectos), cuánto cuesta y quién lo hace.
 * Entrar y Empezar quedan fuera del menú, siempre visibles: son las dos
 * intenciones de quien ya decidió.
 */
export function Encabezado({ lang, tema }: { lang: Idioma; tema: Tema }) {
  const t = textos(lang)
  // Una landing por nivel y la de módulos (decisiones/2026-11-13-planes-por-ambito).
  const enlaces = [
    { href: '/personal', texto: t('nav.personal') },
    { href: '/personal-plus', texto: 'Personal+' },
    { href: '/familia', texto: t('nav.familia') },
    { href: '/profesional', texto: 'Profesional' },
    { href: '/pmo', texto: 'PMO' },
    { href: '/modulos', texto: 'Módulos' },
    { href: '/precios', texto: t('nav.precios') },
  ]

  return (
    <>
      <div className="st-banda st-cinta">
        <div className="st-caja">
          <b>{t('aviso.prueba')}</b>
          <span>{t('aviso.texto')}</span>
        </div>
      </div>

      <header className="st-banda st-barra">
        <div className="st-caja">
          <Link className="st-marca-nav" href="/" aria-label={t('nav.inicio')}>
            <LogoBarra ancho={128} />
          </Link>
          <Menu enlaces={enlaces} etiqueta={t('nav.menu')} />
          <Link className="st-btn st-btn-2 st-entrar" href="/app" title={t('nav.entrar.ayuda')}>
            {t('nav.entrar')}
          </Link>
          <Link className="st-btn st-btn-1 st-empezar" href="/empezar">
            {t('nav.empezar')}
          </Link>
        </div>
      </header>
    </>
  )
}

/**
 * El pie, en una sola franja (decisiones/2026-11-10-landings-y-portal): quién
 * lo hace, los enlaces que se buscan al final y las preferencias de tema e
 * idioma, que salieron de la barra para dejarla limpia.
 */
export function PieSitio({ lang, tema }: { lang: Idioma; tema: Tema }) {
  const t = textos(lang)
  const enl = 'text-tinta-2 no-underline hover:text-tinta'
  return (
    <footer className="border-t border-linea bg-fondo">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-6 py-10 text-[13px] text-tinta-3 sm:px-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Logo ancho={84} />
          <span>{t('pie.by')}</span>
          <nav aria-label={t('pie.col.producto')} className="flex flex-wrap gap-x-5 gap-y-2 md:ml-auto">
            <Link className={enl} href="/personal">Personal</Link>
            <Link className={enl} href="/personal-plus">Personal+</Link>
            <Link className={enl} href="/familia">Familia</Link>
            <Link className={enl} href="/profesional">Profesional</Link>
            <Link className={enl} href="/pmo">PMO</Link>
            <Link className={enl} href="/modulos">Módulos</Link>
            <Link className={enl} href="/precios">{t('pie.precios')}</Link>
            <Link className={enl} href="/nosotros">{t('pie.nosotros')}</Link>
            <Link className={enl} href="/app">{t('pie.entrar')}</Link>
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-linea pt-5">
          <nav aria-label={t('pie.col.legal')} className="flex flex-wrap gap-x-5 gap-y-2">
            <Link className={enl} href="/legal/privacidad">{t('pie.privacidad')}</Link>
            <Link className={enl} href="/legal/datos">{t('pie.datos')}</Link>
            <Link className={enl} href="/legal/terminos">{t('pie.terminos')}</Link>
            <Link className={enl} href="/legal/deslinde">{t('pie.deslinde')}</Link>
          </nav>
          <span className="md:ml-auto">{t('pie.mx')} · {t('pie.us')}</span>
          <Preferencias
            lang={lang}
            tema={tema}
            clase="st"
            et={{ tema: t('nav.tema'), claro: t('nav.tema.claro'), oscuro: t('nav.tema.oscuro'), sistema: t('nav.tema.sistema'), idioma: t('nav.idioma') }}
          />
        </div>
      </div>
    </footer>
  )
}
