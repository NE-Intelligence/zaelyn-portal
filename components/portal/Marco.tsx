import Link from 'next/link'
import { LogoBarra } from '@/components/Logo'
import { Preferencias } from '@/components/Preferencias'
import { soyAdmin } from '@/lib/api'
import { textos, type Clave } from '@/lib/copy'
import { idiomaActual, temaActual } from '@/lib/preferencias'

export type Area = 'inicio' | 'personal' | 'familia' | 'proyectos' | 'cuenta' | 'admin'
type Modo = 'lectura' | 'editor' | 'cuenta' | 'admin'

/** La casa de cada área, con sesión y en el ejemplo. */
const CASA: Record<Area, { app: string; demo: string | null; k: Clave }> = {
  inicio: { app: '/app', demo: null, k: 'po.inicio' },
  personal: { app: '/app/personal', demo: '/demo/personal', k: 'po.personal' },
  familia: { app: '/app/familia', demo: '/demo/familia', k: 'po.familia' },
  proyectos: { app: '/app/proyectos', demo: '/demo', k: 'po.proyectos' },
  cuenta: { app: '/app/cuenta', demo: null, k: 'po.cuenta' },
  admin: { app: '/admin', demo: null, k: 'po.admin' },
}

/**
 * La barra del portal (#186): marca, preferencias y, debajo, las PESTAÑAS DE
 * ÁREA — Inicio · Personal · Familia · Proyectos · Cuenta.
 *
 * Antes la barra solo decía «Mi día» y «Mis grupos», y familia y proyectos
 * convivían en la misma lista. Ahora cada área tiene su casa y su color, y
 * la pestaña activa dice siempre dónde estás. Las migas empiezan en el área:
 * «Proyectos / GestionDM / Plan», ya no «Mis grupos / …».
 *
 * En el ejemplo las pestañas llevan a los tres ejemplos; con sesión, a las
 * casas reales. «Administración» aparece solo si el motor dice que lo eres.
 */
export async function Barra({
  migas = [], ejemplo = false, sesion = false, modo = 'lectura', area, aviso,
}: {
  migas?: { texto: string; href?: string }[]
  ejemplo?: boolean
  sesion?: boolean
  modo?: Modo
  area?: Area
  /** El área antes de #186; se conserva para no tocar cada llamada. */
  etq?: string
  aviso?: string
}) {
  const [lang, tema, admin] = await Promise.all([idiomaActual(), temaActual(), sesion ? soyAdmin() : Promise.resolve(false)])
  const t = textos(lang)
  const a: Area | undefined = area
  const pestanas: Area[] = ejemplo ? ['personal', 'familia', 'proyectos'] : sesion ? ['inicio', 'personal', 'familia', 'proyectos', 'cuenta'] : []
  if (admin) pestanas.push('admin')
  const href = (x: Area) => (ejemplo ? CASA[x].demo ?? '/' : CASA[x].app)
  // «Mis grupos» era la raíz de todo; ahora la raíz es el área.
  const nombreArea = a ? [t(CASA[a].k), textos('es')(CASA[a].k)] : []
  const resto = migas.filter((m) => m.texto !== 'Mis grupos' && m.texto !== 'Ejemplo' && !nombreArea.includes(m.texto))
  const cadena = a && a !== 'inicio' ? [{ texto: t(CASA[a].k), href: resto.length ? href(a) : undefined }, ...resto] : resto
  const modoTxt = modo === 'editor' ? t('po.modo.editor') : modo === 'cuenta' ? t('po.modo.cuenta') : modo === 'admin' ? t('po.modo.admin') : t('po.modo.lectura')

  return (
    <>
      {ejemplo && (
        <div className="pt-aviso">
          <b>{t('po.ejemplo')}</b>
          <span>{aviso ?? t('po.ejemplo.p')}</span>
        </div>
      )}
      <header className="pt-barra" data-area={a}>
        <Link className="pt-marca" href={sesion ? '/app' : '/'}>
          <LogoBarra ancho={104} />
        </Link>
        {cadena.length > 0 && (
          <nav className="pt-migas" aria-label={t('po.donde')}>
            {cadena.map((m, i) => (
              <span key={i} style={{ display: 'contents' }}>
                {i > 0 && <span className="sep">/</span>}
                {m.href ? <Link href={m.href}>{m.texto}</Link> : <span style={{ color: 'var(--ink)' }}>{m.texto}</span>}
              </span>
            ))}
          </nav>
        )}
        <div className="pt-der">
          <span className="pt-overline pt-modo">
            <span className="pt-modo-punto" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M12 2.6l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9L4 10.6l5.9-2.1z" /></svg>
            </span>
            {modoTxt}
          </span>
          <Preferencias
            lang={lang}
            tema={tema}
            clase="pt"
            et={{ tema: t('nav.tema'), claro: t('nav.tema.claro'), oscuro: t('nav.tema.oscuro'), sistema: t('nav.tema.sistema'), idioma: t('nav.idioma') }}
          />
          {/* Un FORMULARIO y no un enlace: ver `app/salir/route.ts`. */}
          {sesion && (
            <form action="/salir" method="post" style={{ display: 'contents' }}>
              <button type="submit" className="pt-salir pt-overline">{t('po.salir')}</button>
            </form>
          )}
          {ejemplo && <Link href="/app" className="pt-boton pt-boton-chico">{t('nav.entrar')}</Link>}
        </div>
      </header>
      {pestanas.length > 0 && (
        <nav className="pt-pestanas" aria-label={t('po.areas')}>
          <div className="pt-pestanas-in">
            {pestanas.map((x) => (
              <Link key={x} href={href(x)} data-area={x} aria-current={x === a ? 'page' : undefined}>
                <i aria-hidden="true" />
                {t(CASA[x].k)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </>
  )
}

export async function Pie({ modo = 'lectura' }: { modo?: Modo } = {}) {
  const t = textos(await idiomaActual())
  return (
    <footer className="pt-pie">
      <span>{t('pie.by')}</span>
      <span className="der">
        {modo === 'editor' ? t('po.pie.editor') : modo === 'cuenta' ? t('po.pie.cuenta') : modo === 'admin' ? t('po.pie.admin') : t('po.pie.lectura')}
        {' · '}
        <Link href="/legal">{t('po.pie.legal')}</Link>
      </span>
    </footer>
  )
}
