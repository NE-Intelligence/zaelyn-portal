import Link from 'next/link'
import Menu from './Menu'
import { IDIOMAS, NOMBRE_IDIOMA, type Idioma, textos, traducidos } from '@/lib/copy'

/** La cinta de pruebas, la barra y el pie. Compartidos por todas las páginas. */
export function Encabezado({ lang }: { lang: Idioma }) {
  const t = textos(lang)
  const listos = traducidos()
  // Las tres áreas van en el menú. ENTRAR NO: ver qué es el producto y entrar
  // a usarlo son dos intenciones distintas, y la segunda estaba escondida
  // entre las otras tres como un enlace más — en un teléfono, detrás de una
  // hamburguesa que además no abría.
  const enlaces = [
    { href: '/proyectos', texto: t('nav.proyectos') },
    { href: '/familia', texto: t('nav.familia') },
    { href: '/personal', texto: t('nav.personal') },
    { href: '/demo', texto: t('nav.portal') },
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/zaelyn-wordmark-320.png" alt="zælyn" width={320} height={110} />
          </Link>
          <Menu enlaces={enlaces} etiqueta={t('nav.menu')} />
          <Link className="st-btn st-btn-1 st-entrar" href="/app" title={t('nav.entrar.ayuda')}>
            {t('nav.entrar')}
          </Link>
          <div className="st-idiomas" role="group" aria-label={t('nav.idioma')}>
            {IDIOMAS.map((l) =>
              l === lang ? (
                <span key={l} className="st-ahora" aria-current="true">
                  {NOMBRE_IDIOMA[l]}
                </span>
              ) : listos.includes(l) ? (
                <a key={l} href={`/${l}`}>
                  {NOMBRE_IDIOMA[l]}
                </a>
              ) : (
                <span key={l} className="st-pronto" title="Próximamente">
                  {NOMBRE_IDIOMA[l]}
                </span>
              ),
            )}
          </div>
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
        <span>{t('pie.ne')}</span>
        <span className="st-der">
          <Link href="/proyectos">{t('pie.proyectos')}</Link>
          <Link href="/familia">{t('pie.familia')}</Link>
          <Link href="/personal">{t('pie.personal')}</Link>
          <Link href="/app">{t('pie.portal')}</Link>
          <span>{t('pie.year')}</span>
        </span>
      </div>
    </footer>
  )
}
