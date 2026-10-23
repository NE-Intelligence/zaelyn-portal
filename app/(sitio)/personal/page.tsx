import Link from 'next/link'
import Campo from '@/components/sitio/Campo'
import { type Clave, textos } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'
import { Ficha } from '@/components/sitio/Ficha'

export async function generateMetadata() {
  const t = textos(await idiomaActual())
  return {
    title: t('pe.meta.titulo'),
    description: t('pe.meta.desc'),
    openGraph: {
      type: 'website',  siteName: 'Zaelyn',
      title: t('pe.meta.titulo'), description: t('pe.meta.desc'), url: '/personal',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'zælyn' }],
    },
  }
}

const Chispa = () => (
  <span className="st-chispa" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="#0A0512">
      <path d="M12 2.6l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9L4 10.6l5.9-2.1z" />
    </svg>
  </span>
)

const trazo = {
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
}

/** Las cuatro vistas; cada una abre el ejemplo directo en ella. */
const VISTAS: { k: string; v: string; icono: React.ReactNode }[] = [
  { k: 'v1', v: '', icono: <svg {...trazo}><circle cx="12" cy="10" r="3" /><path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" /></svg> },
  { k: 'v2', v: '?v=compromisos', icono: <svg {...trazo}><path d="M9 6h11M9 12h11M9 18h11" /><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" /></svg> },
  { k: 'v3', v: '?v=calendario', icono: <svg {...trazo}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg> },
  { k: 'v4', v: '?v=habitos', icono: <svg {...trazo}><path d="M4 18V9M9 18V5M14 18v-6M19 18V8" /></svg> },
]

export default async function Personal() {
  const t = textos(await idiomaActual())
  return (
    <main>
      <section className="st-banda st-hero">
        <Campo />
        <div className="st-caja">
          <p className="st-rotulo" style={{ color: 'var(--brasa)' }}>{t('pe.hero.etq')}</p>
          <h1 style={{ marginTop: '1.1rem' }}>
            <span>{t('pe.h1a')}</span> <em>{t('pe.h1b')}</em>
          </h1>
          <p className="st-bajada">{t('pe.sub')}</p>
          <div className="st-acciones">
            <Link className="st-btn st-btn-1" href="/demo/personal">{t('pe.cta1')}</Link>
            <a className="st-btn st-btn-2" href="#precio">{t('pe.cta2')}</a>
          </div>

          <nav className="st-vistas" aria-label="Entrar directo a una vista del ejemplo">
            <Link href="/demo/personal">Dónde estoy parado</Link>
            <Link href="/demo/personal?v=compromisos">Mis compromisos</Link>
            <Link href="/demo/personal?v=calendario">Calendario</Link>
            <Link href="/demo/personal?v=habitos">Hábitos</Link>
          </nav>

          <div className="st-charla" aria-label={t('pe.charla')}>
            <div className="st-turno st-yo"><div className="st-burbuja">{t('pe.chat.1')}</div></div>
            <div className="st-turno st-el">
              <Chispa />
              <div className="st-burbuja">{t('pe.chat.2a')} {t('pe.chat.2b')} <b>{t('pe.chat.2c')}</b></div>
            </div>
            <div className="st-turno st-yo"><div className="st-burbuja">{t('pe.chat.3')}</div></div>
            <div className="st-turno st-el">
              <Chispa />
              <div className="st-burbuja">
                {t('pe.chat.4a')} <span className="st-cifra">{t('pe.chat.4b')}</span>{t('pe.chat.4c')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Ficha espacio="personal" t={t} />

      <section className="st-banda st-leyes" id="pantalla">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pe.vistas.rotulo')}</p>
            <h2>{t('pe.vistas.h2')}</h2>
            <p>{t('pe.vistas.sub')}</p>
          </div>
          <div className="st-rejilla-3" style={{ marginTop: '2.4rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {VISTAS.map((v) => (
              <Link className="st-producto st-tocable" key={v.k} href={`/demo/personal${v.v}`}>
                <span className="st-ico" aria-hidden="true">{v.icono}</span>
                <h3 style={{ fontSize: '1.1rem' }}>{t(`pe.${v.k}.t` as Clave)}</h3>
                <p>{t(`pe.${v.k}.p` as Clave)}</p>
                <span className="st-abrir">Abrir esta vista</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="se-habla">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pe.dice.rotulo')}</p>
            <h2>{t('pe.dice.h2')}</h2>
            <p>{t('pe.dice.sub')}</p>
          </div>
          <div className="st-prueba" style={{ marginTop: '2rem' }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '.65rem', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'] as const).map((k) => (
                <li key={k} style={{ fontSize: '14.5px', color: 'var(--tinta-2)' }}>«{t(`pe.${k}` as Clave)}»</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pe.reglas.rotulo')}</p>
            <h2>{t('pe.reglas.h2')}</h2>
          </div>
          <div className="st-pasos">
            {(['g1', 'g2', 'g3'] as const).map((k, i) => (
              <div className="st-paso" key={k}>
                <div className="st-n">{String(i + 1).padStart(2, '0')}</div>
                <h3>{t(`pe.${k}.t` as Clave)}</h3>
                <p>{t(`pe.${k}.p` as Clave)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="precio">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pe.precio.rotulo')}</p>
            <h2>{t('pe.precio.h2')}</h2>
            <p>{t('pe.precio.sub')}</p>
          </div>
          <div className="st-planes" style={{ maxWidth: 820, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            <article className="st-plan">
              <h3>{t('z1.t')}</h3>
              <div className="st-precio">{t('z1.precio')}</div>
              <p>{t('pe.k.p')}</p>
            </article>
            <article className="st-plan st-plan-pmo">
              <h3>{t('z2.t')}</h3>
              <div className="st-precio">{t('z2.precio')}<small> {t('pz.mes')}</small></div>
              <p>{t('pe.s.p')}</p>
              <p style={{ marginTop: '.6rem', fontSize: '13px', opacity: 0.85 }}>{t('pe.precio.inc')}</p>
            </article>
          </div>
          <p className="st-nota">{t('pz.nota')}</p>
          <div className="st-acciones" style={{ justifyContent: 'flex-start' }}>
            <Link className="st-btn st-btn-2" href="/#precios">{t('pe.precio.cta')}</Link>
          </div>
        </div>
      </section>

      <section className="st-banda st-cierre">
        <div className="st-caja">
          <h2>{t('pe.fin.h2')}</h2>
          <p className="st-bajada">{t('pe.fin.sub')}</p>
          <div className="st-acciones">
            <Link className="st-btn st-btn-1" href="/demo/personal">{t('pe.fin.cta')}</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
