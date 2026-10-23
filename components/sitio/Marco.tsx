import Link from 'next/link'
import Menu from './Menu'
import { Logo } from '@/components/Logo'
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
  const enlaces = [
    { href: '/personal', texto: t('nav.personal') },
    { href: '/familia', texto: t('nav.familia') },
    { href: '/proyectos', texto: t('nav.proyectos') },
    { href: '/precios', texto: t('nav.precios') },
    { href: '/nosotros', texto: t('nav.nosotros') },
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
            <Logo ancho={118} />
          </Link>
          <Menu enlaces={enlaces} etiqueta={t('nav.menu')} />
          <Preferencias
            lang={lang}
            tema={tema}
            clase="st"
            et={{ tema: t('nav.tema'), claro: t('nav.tema.claro'), oscuro: t('nav.tema.oscuro'), sistema: t('nav.tema.sistema'), idioma: t('nav.idioma') }}
          />
          <Link className="st-btn st-btn-2 st-entrar" href="/app" title={t('nav.entrar.ayuda')}>
            {t('nav.entrar')}
          </Link>
          <Link className="st-btn st-btn-1 st-empezar" href="/#empieza">
            {t('nav.empezar')}
          </Link>
        </div>
      </header>
    </>
  )
}

export function PieSitio({ lang }: { lang: Idioma }) {
  const t = textos(lang)
  return (
    <footer className="st-banda st-piep">
      <div className="st-caja">
        <div className="st-pie-rejilla">
          <div className="st-pie-marca">
            <Logo ancho={112} />
            <p className="st-pie-by">{t('pie.by')}</p>
            <p>{t('pie.lema')}</p>
          </div>
          <nav aria-label={t('pie.col.producto')}>
            <h2>{t('pie.col.producto')}</h2>
            <Link href="/personal">{t('pie.personal')}</Link>
            <Link href="/familia">{t('pie.familia')}</Link>
            <Link href="/proyectos">{t('pie.proyectos')}</Link>
            <Link href="/precios">{t('pie.precios')}</Link>
            <Link href="/demo">{t('pie.demo')}</Link>
            <Link href="/app">{t('pie.entrar')}</Link>
          </nav>
          <nav aria-label={t('pie.col.empresa')}>
            <h2>{t('pie.col.empresa')}</h2>
            <Link href="/nosotros">{t('pie.nosotros')}</Link>
            <Link href="/nosotros#por-que">{t('pie.porque')}</Link>
            <Link href="/nosotros#contacto">{t('pie.contacto')}</Link>
          </nav>
          <nav aria-label={t('pie.col.legal')}>
            <h2>{t('pie.col.legal')}</h2>
            <Link href="/legal/privacidad">{t('pie.privacidad')}</Link>
            <Link href="/legal/datos">{t('pie.datos')}</Link>
            <Link href="/legal/terminos">{t('pie.terminos')}</Link>
            <Link href="/legal/deslinde">{t('pie.deslinde')}</Link>
          </nav>
        </div>
        <div className="st-pie-legal">
          <p>{t('pie.mx')} · {t('pie.us')}</p>
          <p>{t('pie.copy')} {t('pie.marcas')}</p>
        </div>
      </div>
    </footer>
  )
}
