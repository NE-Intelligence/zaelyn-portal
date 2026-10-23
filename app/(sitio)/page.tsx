import Link from 'next/link'
import Campo from '@/components/sitio/Campo'
import { Logo } from '@/components/Logo'
import { Iconos, trazo } from '@/components/sitio/Iconos'
import { textos, type Clave } from '@/lib/copy'
import { LOCALE_OG, idiomaActual } from '@/lib/preferencias'
import { PLANES_PUBLICOS } from '@/lib/precios'

export async function generateMetadata() {
  const t = textos(await idiomaActual())
  const lang = await idiomaActual()
  return {
    title: { absolute: t('meta.titulo') },
    description: t('meta.desc'),
    openGraph: {
      type: 'website', locale: LOCALE_OG[lang], siteName: 'Zaelyn',
      title: t('meta.titulo'), description: t('meta.desc'), url: '/',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'zælyn' }],
    },
    twitter: { card: 'summary_large_image' as const, title: t('meta.titulo'), description: t('meta.desc'), images: ['/og.png'] },
  }
}

const Chispa = () => (
  <span className="st-chispa" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="#0A0512">
      <path d="M12 2.6l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9L4 10.6l5.9-2.1z" />
    </svg>
  </span>
)

/** La liga del QR: abre el bot y canjea la prueba de 3 días en el mismo toque (#182). */
const LIGA_PRUEBA = 'https://t.me/ZaelynBot?start=ZAELYN3'
const GUIAS = [
  { k: 'g1', href: '/guias/zaelyn-guia-rapida.pdf' },
  { k: 'g2', href: '/guias/zaelyn-guia-completa.pdf' },
] as const

/**
 * Los tres espacios, en el orden en que una persona los descubre: primero lo
 * suyo, luego su casa, luego su equipo. Personal va primero porque es el que
 * cruza a los otros dos (#186).
 */
const ESPACIOS = [
  { id: 'personal', p: 'p3', para: 'que.pe.para', plan: 'que.pe.plan', nav: 'nav.personal', href: '/personal', demo: '/demo/personal', icono: Iconos.reloj },
  { id: 'familia', p: 'p2', para: 'que.fa.para', plan: 'que.fa.plan', nav: 'nav.familia', href: '/familia', demo: '/demo/familia', icono: Iconos.familia },
  { id: 'proyectos', p: 'p1', para: 'que.pr.para', plan: 'que.pr.plan', nav: 'nav.proyectos', href: '/proyectos', demo: '/demo', icono: Iconos.plan },
] as const

export default async function Portada() {
  const t = textos(await idiomaActual())
  return (
    <main id="top">
      {/* ── 1 · qué es, en una frase ─────────────────────────────────── */}
      <section className="st-banda st-hero">
        <Campo />
        <div className="st-caja">
          <Logo ancho={560} src="/logo/zaelyn-wordmark-1200.png" clase="st-wordmark" />
          <p className="st-rotulo st-hero-etq">{t('hero.etq')}</p>
          <h1>
            <span>{t('hero.h1a')}</span> <em>{t('hero.h1b2')}</em>
          </h1>
          <p className="st-bajada">{t('hero.sub2')}</p>

          <div className="st-acciones">
            <a className="st-btn st-btn-1" href="#empieza">{t('hero.cta0')}</a>
            <Link className="st-btn st-btn-2" href="/precios">{t('nav.precios')}</Link>
            <Link className="st-btn st-btn-2" href="/demo">{t('nav.demo')}</Link>
          </div>

          <div className="st-canales">
            <span><i className="st-punto" /><span>{t('hero.c1')}</span></span>
            <span><i className="st-punto st-esp" /><span>{t('hero.c2')}</span></span>
            <span><i className="st-punto" /><span>{t('hero.c3')}</span></span>
          </div>

          <div className="st-charla" aria-label={t('hero.charla')}>
            <div className="st-turno yo"><div className="st-burbuja">{t('pe.chat.1')}</div></div>
            <div className="st-turno el">
              <Chispa />
              <div className="st-burbuja">
                {t('pe.chat.2a')} <b>{t('pe.chat.2b')}</b> {t('pe.chat.2c')}
              </div>
            </div>
            <div className="st-turno yo"><div className="st-burbuja">{t('chat.1')}</div></div>
            <div className="st-turno el">
              <Chispa />
              <div className="st-burbuja">
                {t('chat.2a')} <span className="st-cifra">40%</span>. {t('chat.2b')} <span className="st-cifra">65%</span>: <b>{t('chat.2c')}</b>.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · los tres espacios ────────────────────────────────────── */}
      <section className="st-banda st-seccion" id="que">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('que.rotulo')}</p>
            <h2>{t('que.h2')}</h2>
            <p>{t('que.sub')}</p>
          </div>

          <div className="st-rejilla-3">
            {ESPACIOS.map((e) => (
              <article className="st-producto st-espacio" data-espacio={e.id} key={e.id}>
                <div className="st-espacio-cab">
                  <span className="st-ico" aria-hidden="true">{e.icono}</span>
                  <span className="st-para">{t(e.para)}</span>
                </div>
                <h3>Zaelyn {t(e.nav)}</h3>
                <p className="st-lema">{t(`${e.p}.l` as Clave)}</p>
                <p>{t(`${e.p}.p` as Clave)}</p>
                <ul>
                  {(['a', 'b', 'c', 'd'] as const).map((x) => <li key={x}>{t(`${e.p}.${x}` as Clave)}</li>)}
                </ul>
                <p className="st-espacio-plan">{t(e.plan)}</p>
                <div className="st-espacio-acc">
                  <Link className="st-btn st-btn-1" href={e.href}>{t('que.ver')} {t(e.nav)}</Link>
                  <Link className="st-btn st-btn-2" href={e.demo}>{t('que.ejemplo')}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 · cómo se conectan ─────────────────────────────────────── */}
      <section className="st-banda st-mapa-banda" id="mapa">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('mapa.rotulo')}</p>
            <h2>{t('mapa.h2')}</h2>
            <p>{t('mapa.sub')}</p>
          </div>
          <div className="st-mapa">
            <div className="st-mapa-lado">
              <span className="st-ico" aria-hidden="true">{Iconos.chat}</span>
              <h3>{t('mapa.chat')}</h3>
              <p>{t('mapa.chat.p')}</p>
            </div>
            <svg className="st-mapa-svg" viewBox="0 0 360 260" role="img" aria-label={t('mapa.h2')}>
              <defs>
                <linearGradient id="mapa-marca" x1="0" x2="1">
                  <stop offset="0" stopColor="var(--violeta)" />
                  <stop offset="1" stopColor="var(--cian)" />
                </linearGradient>
              </defs>
              <circle cx="180" cy="130" r="112" fill="none" stroke="url(#mapa-marca)" strokeWidth="1.5" strokeDasharray="3 5" />
              <line x1="180" y1="130" x2="82" y2="72" stroke="var(--linea-2)" strokeWidth="1.2" />
              <line x1="180" y1="130" x2="278" y2="72" stroke="var(--linea-2)" strokeWidth="1.2" />
              <line x1="180" y1="130" x2="180" y2="232" stroke="var(--linea-2)" strokeWidth="1.2" />
              <g className="st-mapa-nodo" data-espacio="familia">
                <circle cx="82" cy="72" r="34" />
                <text x="82" y="76" textAnchor="middle">{t('nav.familia')}</text>
              </g>
              <g className="st-mapa-nodo" data-espacio="proyectos">
                <circle cx="278" cy="72" r="34" />
                <text x="278" y="76" textAnchor="middle">{t('nav.proyectos')}</text>
              </g>
              <g className="st-mapa-nodo" data-espacio="otros">
                <circle cx="180" cy="232" r="22" />
                <text x="180" y="236" textAnchor="middle" className="chico">+</text>
              </g>
              <g className="st-mapa-centro">
                <circle cx="180" cy="130" r="46" fill="url(#mapa-marca)" />
                <text x="180" y="127" textAnchor="middle">{t('mapa.tu')}</text>
                <text x="180" y="145" textAnchor="middle" className="chico">{t('nav.personal')}</text>
              </g>
            </svg>
            <div className="st-mapa-lado">
              <span className="st-ico" aria-hidden="true">{Iconos.pantalla}</span>
              <h3>{t('mapa.portal')}</h3>
              <p>{t('mapa.portal.p')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4 · cómo funciona ────────────────────────────────────────── */}
      <section className="st-banda st-seccion" id="como">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('como.rotulo')}</p>
            <h2>{t('como.h2')}</h2>
          </div>
          <div className="st-pasos">
            {(['c1', 'c2', 'c3'] as const).map((c, i) => (
              <div className="st-paso" key={c}>
                <div className="st-n">0{i + 1}</div>
                <h3>{t(`${c}.t`)}</h3>
                <p>{t(`${c}.p`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 · por qué confiar ──────────────────────────────────────── */}
      <section className="st-banda st-leyes" id="leyes">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('ley.rotulo')}</p>
            <h2>{t('ley.h2')}</h2>
            <p>{t('ley.sub')}</p>
          </div>
          <div className="st-lista-leyes">
            {(['l1', 'l2', 'l3'] as const).map((l, i) => (
              <div className="st-ley" key={l}>
                <div className="st-rom">{['I', 'II', 'III'][i]}</div>
                <h3>{t(`${l}.t`)}</h3>
                <p>{t(`${l}.p`)}</p>
              </div>
            ))}
          </div>
          <div className="st-prueba">
            <p className="st-rotulo">{t('pr.rotulo')}</p>
            <p className="st-dice">{t('pr.dice')}</p>
            <p>{t('pr.p')}</p>
          </div>
        </div>
      </section>

      {/* ── 6 · precios, en resumen ──────────────────────────────────── */}
      <section className="st-banda st-seccion" id="precios">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('pz.rotulo')}</p>
            <h2>{t('pz.h2b')}</h2>
            <p>{t('pz.sub2')}</p>
          </div>
          <div className="st-planes">
            {PLANES_PUBLICOS.map((p) => (
              <article className={`st-plan${p.destacado ? ' st-plan-pmo' : ''}`} key={p.id} data-espacio={p.espacio}>
                <p className="st-para">{t(p.para)}</p>
                <h3>{p.nombre}</h3>
                <div className="st-precio">
                  {p.precio === null ? t('pc.gratis') : p.precio}
                  {p.precio !== null && <small> {t('pc.mes')}</small>}
                </div>
                <p>{t(p.resumen)}</p>
              </article>
            ))}
          </div>
          <div className="st-acciones st-acciones-izq">
            <Link className="st-btn st-btn-2" href="/precios">{t('pz.ver')} →</Link>
          </div>
          <p className="st-nota">{t('pz.nota')}</p>
        </div>
      </section>

      {/* ── 7 · empieza ──────────────────────────────────────────────── */}
      <section className="st-banda st-seccion st-empieza" id="empieza">
        <div className="st-caja">
          <div className="st-em-rejilla">
            <div>
              <p className="st-rotulo">{t('em.rotulo')}</p>
              <h2>{t('em.h2')}</h2>
              <p className="st-em-sub">{t('em.sub')}</p>
              <ol className="st-em-pasos">
                {(['1', '2', '3'] as const).map((n) => (
                  <li key={n}>
                    <span className="st-em-n">{n}</span>
                    <div>
                      <h3>{t(`em.${n}t`)}</h3>
                      <p>{t(`em.${n}p`)}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="st-acciones st-em-acciones">
                <a className="st-btn st-btn-1" href={LIGA_PRUEBA} target="_blank" rel="noopener noreferrer">{t('em.abrir')}</a>
              </div>
            </div>
            <div className="st-em-tarjeta">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="st-em-qr" src="/guias/zaelyn-qr.svg" alt={t('em.qr')} width={240} height={240} />
              <p className="st-rotulo">{t('em.codigo')}</p>
              <p className="st-em-codigo">ZAELYN3</p>
              <p className="st-em-nota">{t('em.codigo.p')}</p>
              <p className="st-em-nota st-em-inv">{t('em.inv')}</p>
            </div>
          </div>

          <div className="st-em-guias">
            <p className="st-rotulo">{t('em.guias')}</p>
            <div className="st-em-lista">
              {GUIAS.map((g) => (
                <a className="st-em-guia" key={g.k} href={g.href} download>
                  <span className="st-em-ico" aria-hidden="true">
                    <svg {...trazo}>
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                      <path d="M14 3v5h5M12 11v6M9 14l3 3 3-3" />
                    </svg>
                  </span>
                  <span className="st-em-txt">
                    <b>{t(`em.${g.k}t`)}</b>
                    <span>{t(`em.${g.k}p`)}</span>
                  </span>
                  <span className="st-em-bajar">{t('em.pdf')}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8 · cierre ───────────────────────────────────────────────── */}
      <section className="st-banda st-cierre">
        <div className="st-caja">
          <h2>{t('fin.h2')}</h2>
          <p className="st-bajada">{t('fin.sub')}</p>
          <div className="st-acciones">
            <a className="st-btn st-btn-1" href="#empieza">{t('hero.cta0')}</a>
            <Link className="st-btn st-btn-2" href="/nosotros">{t('nav.nosotros')}</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
