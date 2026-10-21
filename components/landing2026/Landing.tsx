import Campo from '@/components/landing2026/Campo'
import Menu from '@/components/landing2026/Menu'
import { IDIOMAS, NOMBRE_IDIOMA, type Idioma, textos, traducidos } from '@/lib/copy-landing'
import { display, texto, dato } from '@/lib/fuentes-landing'

const Chispa = () => (
  <span className="l26-chispa" aria-hidden="true">
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

export default function Landing({ lang }: { lang: Idioma }) {
  const t = textos(lang)
  const listos = traducidos()

  const enlaces = [
    { href: '#productos', texto: t('nav.productos') },
    { href: '#como', texto: t('nav.como') },
    { href: '#leyes', texto: t('nav.leyes') },
    { href: '#precios', texto: t('nav.precios') },
  ]

  return (
    <div
      className={`l26 ${display.variable} ${texto.variable} ${dato.variable}`}
      style={{ minHeight: '100dvh' }}
    >
      <div className="l26-banda l26-cinta">
        <div className="l26-caja">
          <b>{t('aviso.prueba')}</b>
          <span>{t('aviso.texto')}</span>
        </div>
      </div>

      <header className="l26-banda l26-barra">
        <div className="l26-caja">
          <a className="l26-marca-nav" href="/" aria-label={t('nav.inicio')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/zaelyn-wordmark-320.png" alt="zælyn" width={320} height={110} />
          </a>
          <Menu enlaces={enlaces} etiqueta={t('nav.menu')} />
          <div className="l26-idiomas" role="group" aria-label={t('nav.idioma')}>
            {IDIOMAS.map((l) =>
              l === lang ? (
                <span key={l} className="l26-ahora" aria-current="true">
                  {NOMBRE_IDIOMA[l]}
                </span>
              ) : listos.includes(l) ? (
                <a key={l} href={`/${l}`}>
                  {NOMBRE_IDIOMA[l]}
                </a>
              ) : (
                <span key={l} className="l26-pronto" title="Próximamente">
                  {NOMBRE_IDIOMA[l]}
                </span>
              ),
            )}
          </div>
        </div>
      </header>

      <main id="top">
        <section className="l26-banda l26-hero">
          <Campo />
          <div className="l26-caja">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="l26-wordmark"
              src="/logo/zaelyn-wordmark-1200.png"
              alt="zælyn"
              width={1200}
              height={413}
            />

            <h1>
              <span>{t('hero.h1a')}</span> <em>{t('hero.h1b')}</em>
            </h1>
            <p className="l26-bajada">{t('hero.sub')}</p>

            <div className="l26-acciones">
              <a className="l26-btn l26-btn-1" href="#productos">
                {t('hero.cta1')}
              </a>
              <a className="l26-btn l26-btn-2" href="#como">
                {t('hero.cta2')}
              </a>
            </div>

            <div className="l26-canales">
              <span>
                <i className="l26-punto" />
                <span>{t('hero.c1')}</span>
              </span>
              <span>
                <i className="l26-punto l26-esp" />
                <span>{t('hero.c2')}</span>
              </span>
              <span>
                <i className="l26-punto l26-esp" />
                <span>{t('hero.c3')}</span>
              </span>
            </div>

            <div className="l26-charla" aria-label={t('hero.charla')}>
              <div className="l26-turno l26-yo">
                <div className="l26-burbuja">{t('chat.1')}</div>
              </div>
              <div className="l26-turno l26-el">
                <Chispa />
                <div className="l26-burbuja">
                  {t('chat.2a')} <span className="l26-cifra">40%</span>. {t('chat.2b')}{' '}
                  <span className="l26-cifra">65%</span>: <b>{t('chat.2c')}</b>.
                </div>
              </div>
              <div className="l26-turno l26-yo">
                <div className="l26-burbuja">{t('chat.3')}</div>
              </div>
              <div className="l26-turno l26-el">
                <Chispa />
                <div className="l26-burbuja">
                  {t('chat.4a')} <b>{t('chat.4b')}</b> {t('chat.4c')}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="l26-banda l26-seccion" id="productos">
          <div className="l26-caja">
            <div className="l26-encabeza">
              <p className="l26-rotulo">{t('prod.rotulo')}</p>
              <h2>{t('prod.h2')}</h2>
              <p>{t('prod.sub')}</p>
            </div>

            <div className="l26-rejilla-3">
              <article className="l26-producto">
                <span className="l26-ico" aria-hidden="true">
                  <svg {...trazo}>
                    <path d="M3 5.5h7.5M3 12h13M3 18.5h9" />
                    <circle cx="19" cy="5.5" r="2" />
                    <circle cx="19" cy="18.5" r="2" />
                    <path d="M19 7.5v9" strokeDasharray="2 2.4" />
                  </svg>
                </span>
                <h3>{t('p1.t')}</h3>
                <p className="l26-lema">{t('p1.l')}</p>
                <p>{t('p1.p')}</p>
                <ul>
                  <li>{t('p1.a')}</li>
                  <li>{t('p1.b')}</li>
                  <li>{t('p1.c')}</li>
                  <li>{t('p1.d')}</li>
                </ul>
                <p className="l26-pie">{t('p1.pie')}</p>
              </article>

              <article className="l26-producto">
                <span className="l26-ico" aria-hidden="true">
                  <svg {...trazo}>
                    <circle cx="7" cy="7" r="2.4" />
                    <circle cx="17" cy="7" r="2.4" />
                    <circle cx="12" cy="17" r="2.4" />
                    <path d="M8.8 8.9l2.2 5.9M15.2 8.9L13 14.8M9.4 7h5.2" />
                  </svg>
                </span>
                <h3>{t('p2.t')}</h3>
                <p className="l26-lema">{t('p2.l')}</p>
                <p>{t('p2.p')}</p>
                <ul>
                  <li>{t('p2.a')}</li>
                  <li>{t('p2.b')}</li>
                  <li>{t('p2.c')}</li>
                  <li>{t('p2.d')}</li>
                </ul>
                <p className="l26-pie">{t('p2.pie')}</p>
              </article>

              <article className="l26-producto">
                <span className="l26-ico" aria-hidden="true">
                  <svg {...trazo}>
                    <path d="M12 4.2v7.8l4.6 2.7" />
                    <circle cx="12" cy="12" r="8.4" />
                  </svg>
                </span>
                <h3>{t('p3.t')}</h3>
                <p className="l26-lema">{t('p3.l')}</p>
                <p>{t('p3.p')}</p>
                <ul>
                  <li>{t('p3.a')}</li>
                  <li>{t('p3.b')}</li>
                  <li>{t('p3.c')}</li>
                  <li>{t('p3.d')}</li>
                </ul>
                <p className="l26-pie">{t('p3.pie')}</p>
              </article>
            </div>
          </div>
        </section>

        <div className="l26-caja">
          <div className="l26-rayo" />
        </div>

        <section className="l26-banda l26-seccion" id="como">
          <div className="l26-caja">
            <div className="l26-encabeza">
              <p className="l26-rotulo">{t('como.rotulo')}</p>
              <h2>{t('como.h2')}</h2>
            </div>
            <div className="l26-pasos">
              <div className="l26-paso">
                <div className="l26-n">01</div>
                <h3>{t('c1.t')}</h3>
                <p>{t('c1.p')}</p>
              </div>
              <div className="l26-paso">
                <div className="l26-n">02</div>
                <h3>{t('c2.t')}</h3>
                <p>{t('c2.p')}</p>
              </div>
              <div className="l26-paso">
                <div className="l26-n">03</div>
                <h3>{t('c3.t')}</h3>
                <p>{t('c3.p')}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="l26-banda l26-leyes" id="leyes">
          <div className="l26-caja">
            <div className="l26-encabeza">
              <p className="l26-rotulo">{t('ley.rotulo')}</p>
              <h2>{t('ley.h2')}</h2>
              <p>{t('ley.sub')}</p>
            </div>

            <div className="l26-lista-leyes">
              <div className="l26-ley">
                <div className="l26-rom">I</div>
                <h3>{t('l1.t')}</h3>
                <p>{t('l1.p')}</p>
              </div>
              <div className="l26-ley">
                <div className="l26-rom">II</div>
                <h3>{t('l2.t')}</h3>
                <p>{t('l2.p')}</p>
              </div>
              <div className="l26-ley">
                <div className="l26-rom">III</div>
                <h3>{t('l3.t')}</h3>
                <p>{t('l3.p')}</p>
              </div>
            </div>

            <div className="l26-prueba">
              <p className="l26-rotulo">{t('pr.rotulo')}</p>
              <p className="l26-dice">{t('pr.dice')}</p>
              <p>{t('pr.p')}</p>
            </div>
          </div>
        </section>

        <section className="l26-banda l26-seccion" id="precios">
          <div className="l26-caja">
            <div className="l26-encabeza">
              <p className="l26-rotulo">{t('pz.rotulo')}</p>
              <h2>{t('pz.h2')}</h2>
              <p>{t('pz.sub')}</p>
            </div>
            <div className="l26-planes">
              <article className="l26-plan">
                <h3>{t('z1.t')}</h3>
                <div className="l26-precio">{t('z1.precio')}</div>
                <p>{t('z1.p')}</p>
              </article>
              <article className="l26-plan">
                <h3>{t('z2.t')}</h3>
                <div className="l26-precio l26-cuando">{t('pz.cuando')}</div>
                <p>{t('z2.p')}</p>
              </article>
              <article className="l26-plan">
                <h3>{t('z3.t')}</h3>
                <div className="l26-precio l26-cuando">{t('pz.cuando')}</div>
                <p>{t('z3.p')}</p>
              </article>
            </div>
            <p className="l26-nota">{t('pz.nota')}</p>
          </div>
        </section>

        <section className="l26-banda l26-cierre">
          <div className="l26-caja">
            <h2>{t('fin.h2')}</h2>
            <p className="l26-bajada">{t('fin.sub')}</p>
            <div className="l26-acciones">
              <a className="l26-btn l26-btn-1" href="#productos">
                {t('fin.cta')}
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="l26-banda l26-piep">
        <div className="l26-caja">
          <span>{t('pie.ne')}</span>
          <span className="l26-der">
            <a href="#leyes">{t('pie.priv')}</a>
            <a href="#leyes">{t('pie.term')}</a>
            <span>{t('pie.year')}</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
