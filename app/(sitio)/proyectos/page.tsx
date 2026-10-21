import Link from 'next/link'
import Campo from '@/components/sitio/Campo'
import { type Clave, textos } from '@/lib/copy'

const t = textos('es')

export const metadata = {
  title: t('pr.meta.titulo'),
  description: t('pr.meta.desc'),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Zaelyn',
    title: t('pr.meta.titulo'),
    description: t('pr.meta.desc'),
    url: '/proyectos',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'zælyn' }],
  },
}

const trazo = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const VISTAS: { k: string; icono: React.ReactNode }[] = [
  {
    k: 'v1',
    icono: (
      <svg {...trazo}>
        <path d="M4 19V9M10 19V5M16 19v-7M4 19h16" />
      </svg>
    ),
  },
  {
    k: 'v2',
    icono: (
      <svg {...trazo}>
        <rect x="3" y="4.5" width="18" height="15" rx="2" />
        <path d="M3 9.5h18M9 9.5V19" />
      </svg>
    ),
  },
  {
    k: 'v3',
    icono: (
      <svg {...trazo}>
        <path d="M4 7h8M7 12h10M4 17h6" />
      </svg>
    ),
  },
  {
    k: 'v4',
    icono: (
      <svg {...trazo}>
        <circle cx="5.5" cy="6" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="18.5" cy="18" r="2" />
        <path d="M7 7.4l3.4 3.2M13.4 13.4l3.4 3.2" />
      </svg>
    ),
  },
  {
    k: 'v5',
    icono: (
      <svg {...trazo}>
        <circle cx="9" cy="8.5" r="3" />
        <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5M16 6.2a3 3 0 010 5.6M18 19.5c0-2.2-1-3.9-2.6-4.7" />
      </svg>
    ),
  },
  {
    k: 'v6',
    icono: (
      <svg {...trazo}>
        <path d="M12 7v5l3.2 1.9" />
        <path d="M3.6 12a8.4 8.4 0 108.4-8.4" />
        <path d="M3.6 6.2v4h4" />
      </svg>
    ),
  },
]

const ROLES = ['r1', 'r2', 'r3', 'r4'] as const

export default function Proyectos() {
  return (
    <main>
      <section className="st-banda st-hero">
        <Campo />
        <div className="st-caja">
          <p className="st-rotulo" style={{ color: 'var(--cian)' }}>
            {t('pr.hero.etq')}
          </p>
          <h1 style={{ marginTop: '1.1rem' }}>
            <span>{t('pr.hero.h1a')}</span> <em>{t('pr.hero.h1b')}</em>
          </h1>
          <p className="st-bajada">{t('pr.hero.sub')}</p>
          <div className="st-acciones">
            <Link className="st-btn st-btn-1" href="/app/andes">
              {t('pr.hero.cta1')}
            </Link>
            <a className="st-btn st-btn-2" href="#archivo">
              {t('pr.hero.cta2')}
            </a>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pr.dolor.rotulo')}</p>
            <h2>{t('pr.dolor.h2')}</h2>
            <p>{t('pr.dolor.sub')}</p>
          </div>
          <div className="st-pasos">
            {(['d1', 'd2', 'd3'] as const).map((k, i) => (
              <div className="st-paso" key={k}>
                <div className="st-n">{String(i + 1).padStart(2, '0')}</div>
                <h3>{t(`pr.${k}.t` as Clave)}</h3>
                <p>{t(`pr.${k}.p` as Clave)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-leyes" id="portal">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pr.vistas.rotulo')}</p>
            <h2>{t('pr.vistas.h2')}</h2>
            <p>{t('pr.vistas.sub')}</p>
          </div>
          <div className="st-rejilla-3" style={{ marginTop: '2.4rem' }}>
            {VISTAS.map((v) => (
              <article className="st-producto" key={v.k}>
                <span className="st-ico" aria-hidden="true">
                  {v.icono}
                </span>
                <h3 style={{ fontSize: '1.1rem' }}>{t(`pr.${v.k}.t` as Clave)}</h3>
                <p>{t(`pr.${v.k}.p` as Clave)}</p>
              </article>
            ))}
          </div>
          <div className="st-acciones" style={{ justifyContent: 'flex-start', marginTop: '2.2rem' }}>
            <Link className="st-btn st-btn-1" href="/app/andes">
              {t('pr.fin.cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="archivo">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pr.excel.rotulo')}</p>
            <h2>{t('pr.excel.h2')}</h2>
            <p>{t('pr.excel.sub')}</p>
          </div>
          <div className="st-prueba" style={{ marginTop: '2rem' }}>
            <p className="st-rotulo">Lo que pasa al cargar</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '.6rem' }}>
              {(['e1', 'e2', 'e3', 'e4'] as const).map((k) => (
                <li key={k} style={{ display: 'flex', gap: '.6rem', fontSize: '14.5px', color: 'var(--tinta-2)' }}>
                  <span
                    aria-hidden="true"
                    style={{ flex: '0 0 auto', width: 4, height: 4, borderRadius: '50%', background: 'var(--cian)', marginTop: '.6rem' }}
                  />
                  {t(`pr.${k}` as Clave)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="roles">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pr.roles.rotulo')}</p>
            <h2>{t('pr.roles.h2')}</h2>
            <p>{t('pr.roles.sub')}</p>
          </div>
          <div className="st-lista-leyes" style={{ marginTop: '2.4rem', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
            {ROLES.map((k, i) => (
              <div className="st-ley" key={k}>
                <div className="st-rom">{['I', 'II', 'III', 'IV'][i]}</div>
                <h3>{t(`pr.${k}.t` as Clave)}</h3>
                <p>{t(`pr.${k}.p` as Clave)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-cierre">
        <div className="st-caja">
          <h2>{t('pr.fin.h2')}</h2>
          <p className="st-bajada">{t('pr.fin.sub')}</p>
          <div className="st-acciones">
            <Link className="st-btn st-btn-1" href="/app/andes">
              {t('pr.fin.cta')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
