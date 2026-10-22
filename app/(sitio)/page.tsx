import Link from 'next/link'
import Campo from '@/components/sitio/Campo'
import { textos } from '@/lib/copy'

const t = textos('es')

export const metadata = {
  title: t('meta.titulo'),
  description: t('meta.desc'),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Zaelyn',
    title: t('meta.titulo'),
    description: t('meta.desc'),
    url: '/',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'zælyn' }],
  },
  twitter: { card: 'summary_large_image' as const, title: t('meta.titulo'), description: t('meta.desc'), images: ['/og.png'] },
}

const Chispa = () => (
  <span className="st-chispa" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="#0A0512">
      <path d="M12 2.6l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9L4 10.6l5.9-2.1z" />
    </svg>
  </span>
)

const trazo = {
  width: 26,
  height: 26,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export default function Portada() {
  return (
    <main id="top">
      <section className="st-banda st-hero">
        <Campo />
        <div className="st-caja">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="st-wordmark" src="/logo/zaelyn-wordmark-1200.png" alt="zælyn" width={1200} height={413} />

          <h1>
            <span>{t('hero.h1a')}</span> <em>{t('hero.h1b')}</em>
          </h1>
          <p className="st-bajada">{t('hero.sub')}</p>

          <div className="st-acciones">
            <Link className="st-btn st-btn-1" href="/proyectos">
              {t('hero.cta1')}
            </Link>
            <a className="st-btn st-btn-2" href="#como">
              {t('hero.cta2')}
            </a>
            <Link className="st-btn st-btn-2" href="/demo">
              {t('nav.portal')}
            </Link>
          </div>

          <div className="st-canales">
            <span>
              <i className="st-punto" />
              <span>{t('hero.c1')}</span>
            </span>
            <span>
              <i className="st-punto st-esp" />
              <span>{t('hero.c2')}</span>
            </span>
            <span>
              <i className="st-punto st-esp" />
              <span>{t('hero.c3')}</span>
            </span>
          </div>

          <div className="st-charla" aria-label={t('hero.charla')}>
            <div className="st-turno st-yo">
              <div className="st-burbuja">{t('chat.1')}</div>
            </div>
            <div className="st-turno st-el">
              <Chispa />
              <div className="st-burbuja">
                {t('chat.2a')} <span className="st-cifra">40%</span>. {t('chat.2b')} <span className="st-cifra">65%</span>:{' '}
                <b>{t('chat.2c')}</b>.
              </div>
            </div>
            <div className="st-turno st-yo">
              <div className="st-burbuja">{t('chat.3')}</div>
            </div>
            <div className="st-turno st-el">
              <Chispa />
              <div className="st-burbuja">
                {t('chat.4a')} <b>{t('chat.4b')}</b> {t('chat.4c')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="productos">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('prod.rotulo')}</p>
            <h2>{t('prod.h2')}</h2>
            <p>{t('prod.sub')}</p>
          </div>

          <div className="st-rejilla-3">
            <article className="st-producto">
              <span className="st-ico" aria-hidden="true">
                <svg {...trazo}>
                  <path d="M3 5.5h7.5M3 12h13M3 18.5h9" />
                  <circle cx="19" cy="5.5" r="2" />
                  <circle cx="19" cy="18.5" r="2" />
                  <path d="M19 7.5v9" strokeDasharray="2 2.4" />
                </svg>
              </span>
              <h3>{t('p1.t')}</h3>
              <p className="st-lema">{t('p1.l')}</p>
              <p>{t('p1.p')}</p>
              <ul>
                <li>{t('p1.a')}</li>
                <li>{t('p1.b')}</li>
                <li>{t('p1.c')}</li>
                <li>{t('p1.d')}</li>
              </ul>
              <p className="st-pie">{t('p1.pie')}</p>
              <Link className="st-btn st-btn-2" href="/proyectos" style={{ justifySelf: 'start' }}>
                {t('prod.ver')}
              </Link>
            </article>

            <article className="st-producto">
              <span className="st-ico" aria-hidden="true">
                <svg {...trazo}>
                  <circle cx="7" cy="7" r="2.4" />
                  <circle cx="17" cy="7" r="2.4" />
                  <circle cx="12" cy="17" r="2.4" />
                  <path d="M8.8 8.9l2.2 5.9M15.2 8.9L13 14.8M9.4 7h5.2" />
                </svg>
              </span>
              <h3>{t('p2.t')}</h3>
              <p className="st-lema">{t('p2.l')}</p>
              <p>{t('p2.p')}</p>
              <ul>
                <li>{t('p2.a')}</li>
                <li>{t('p2.b')}</li>
                <li>{t('p2.c')}</li>
                <li>{t('p2.d')}</li>
              </ul>
              <p className="st-pie">{t('p2.pie')}</p>
              <Link className="st-btn st-btn-2" href="/familia" style={{ justifySelf: 'start' }}>
                {t('nav.familia')}
              </Link>
            </article>

            <article className="st-producto">
              <span className="st-ico" aria-hidden="true">
                <svg {...trazo}>
                  <path d="M12 4.2v7.8l4.6 2.7" />
                  <circle cx="12" cy="12" r="8.4" />
                </svg>
              </span>
              <h3>{t('p3.t')}</h3>
              <p className="st-lema">{t('p3.l')}</p>
              <p>{t('p3.p')}</p>
              <ul>
                <li>{t('p3.a')}</li>
                <li>{t('p3.b')}</li>
                <li>{t('p3.c')}</li>
                <li>{t('p3.d')}</li>
              </ul>
              <p className="st-pie">{t('p3.pie')}</p>
              <Link className="st-btn st-btn-2" href="/personal" style={{ justifySelf: 'start' }}>
                {t('nav.personal')}
              </Link>
            </article>
          </div>
        </div>
      </section>

      <div className="st-caja">
        <div className="st-rayo" />
      </div>

      <section className="st-banda st-seccion" id="como">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('como.rotulo')}</p>
            <h2>{t('como.h2')}</h2>
          </div>
          <div className="st-pasos">
            <div className="st-paso">
              <div className="st-n">01</div>
              <h3>{t('c1.t')}</h3>
              <p>{t('c1.p')}</p>
            </div>
            <div className="st-paso">
              <div className="st-n">02</div>
              <h3>{t('c2.t')}</h3>
              <p>{t('c2.p')}</p>
            </div>
            <div className="st-paso">
              <div className="st-n">03</div>
              <h3>{t('c3.t')}</h3>
              <p>{t('c3.p')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="st-banda st-leyes" id="leyes">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('ley.rotulo')}</p>
            <h2>{t('ley.h2')}</h2>
            <p>{t('ley.sub')}</p>
          </div>

          <div className="st-lista-leyes">
            <div className="st-ley">
              <div className="st-rom">I</div>
              <h3>{t('l1.t')}</h3>
              <p>{t('l1.p')}</p>
            </div>
            <div className="st-ley">
              <div className="st-rom">II</div>
              <h3>{t('l2.t')}</h3>
              <p>{t('l2.p')}</p>
            </div>
            <div className="st-ley">
              <div className="st-rom">III</div>
              <h3>{t('l3.t')}</h3>
              <p>{t('l3.p')}</p>
            </div>
          </div>

          <div className="st-prueba">
            <p className="st-rotulo">{t('pr.rotulo')}</p>
            <p className="st-dice">{t('pr.dice')}</p>
            <p>{t('pr.p')}</p>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="precios">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pz.rotulo')}</p>
            <h2>{t('pz.h2')}</h2>
            <p>{t('pz.sub')}</p>
          </div>
          <div className="st-planes">
            {(['z1', 'z2', 'z3', 'z4'] as const).map(z => (
              <article className={`st-plan${z === 'z4' ? ' st-plan-pmo' : ''}`} key={z}>
                <h3>{t(`${z}.t`)}</h3>
                <div className="st-precio">
                  {t(`${z}.precio`)}{z !== 'z1' && <small> {t('pz.mes')}</small>}
                </div>
                <p>{t(`${z}.p`)}</p>
              </article>
            ))}
          </div>
          <div className="st-complementos">
            <h3>{t('pz.comp.t')}</h3>
            <ul>
              {(['pz.comp.1', 'pz.comp.2', 'pz.comp.3', 'pz.comp.4', 'pz.comp.5', 'pz.comp.6'] as const).map(k => <li key={k}>{t(k)}</li>)}
            </ul>
          </div>
          <p className="st-nota">{t('pz.nota')}</p>
        </div>
      </section>

      <section className="st-banda st-cierre">
        <div className="st-caja">
          <h2>{t('fin.h2')}</h2>
          <p className="st-bajada">{t('fin.sub')}</p>
          <div className="st-acciones">
            <Link className="st-btn st-btn-1" href="/proyectos">
              {t('fin.cta')}
            </Link>
            <Link className="st-btn st-btn-2" href="/demo">
              {t('nav.portal')}
            </Link>
          </div>

          <nav className="st-vistas" aria-label="Entrar directo a una vista del portal">
            <Link href="/demo">Resumen</Link>
            <Link href="/demo?v=tablero">Tablero</Link>
            <Link href="/demo?v=gantt">Gantt</Link>
            <Link href="/demo?v=ruta">Ruta crítica</Link>
            <Link href="/demo?v=equipo">Equipo</Link>
            <Link href="/demo?v=bitacora">Bitácora</Link>
          </nav>
        </div>
      </section>
    </main>
  )
}
