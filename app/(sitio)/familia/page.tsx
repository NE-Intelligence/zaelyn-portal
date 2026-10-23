import Link from 'next/link'
import Campo from '@/components/sitio/Campo'
import { type Clave, textos } from '@/lib/copy'

const t = textos('es')

export const metadata = {
  title: t('fa.meta.titulo'),
  description: t('fa.meta.desc'),
  openGraph: {
    type: 'website', locale: 'es_MX', siteName: 'Zaelyn',
    title: t('fa.meta.titulo'), description: t('fa.meta.desc'), url: '/familia',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'zælyn' }],
  },
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

/** Las seis vistas, cada una abre el ejemplo directo en ella. */
const VISTAS: { k: string; v: string; icono: React.ReactNode }[] = [
  { k: 'v1', v: '', icono: <svg {...trazo}><path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-5h-6v5H5a1 1 0 01-1-1z" /></svg> },
  { k: 'v2', v: '?v=calendario', icono: <svg {...trazo}><rect x="3.5" y="5" width="17" height="15" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg> },
  { k: 'v3', v: '?v=traslados', icono: <svg {...trazo}><path d="M4 16V9l2-4h12l2 4v7M4 16h16M7 16v2M17 16v2" /><circle cx="7.5" cy="12.5" r="1" /><circle cx="16.5" cy="12.5" r="1" /></svg> },
  { k: 'v4', v: '?v=quehaceres', icono: <svg {...trazo}><path d="M12 3.5l2.3 4.8 5.2.7-3.8 3.6.9 5.2L12 15.3l-4.6 2.5.9-5.2L4.5 9l5.2-.7z" /></svg> },
  { k: 'v5', v: '?v=medallero', icono: <svg {...trazo}><path d="M8 4h8v5a4 4 0 01-8 0zM8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8.5 20h7M10 17h4" /></svg> },
  { k: 'v6', v: '?v=fechas', icono: <svg {...trazo}><path d="M5 20h14M6 20v-7h12v7M9 13V9M12 13V8M15 13V9" /><path d="M9 6.5c0-1 1-1.5 0-2.5M12 5.5c0-1 1-1.5 0-2.5M15 6.5c0-1 1-1.5 0-2.5" /></svg> },
]

export default function Familia() {
  return (
    <main>
      <section className="st-banda st-hero">
        <Campo />
        <div className="st-caja">
          <p className="st-rotulo" style={{ color: 'var(--brasa)' }}>{t('fa.hero.etq')}</p>
          <h1 style={{ marginTop: '1.1rem' }}>
            <span>{t('fa.h1a')}</span> <em>{t('fa.h1b')}</em>
          </h1>
          <p className="st-bajada">{t('fa.sub')}</p>
          <div className="st-acciones">
            <Link className="st-btn st-btn-1" href="/demo/familia">{t('fa.cta1')}</Link>
            <a className="st-btn st-btn-2" href="#se-habla">{t('fa.cta2')}</a>
          </div>

          <nav className="st-vistas" aria-label="Entrar directo a una vista del ejemplo">
            <Link href="/demo/familia">Hoy en casa</Link>
            <Link href="/demo/familia?v=calendario">Calendario</Link>
            <Link href="/demo/familia?v=traslados">Traslados</Link>
            <Link href="/demo/familia?v=quehaceres">Quehaceres</Link>
            <Link href="/demo/familia?v=medallero">Medallero</Link>
            <Link href="/demo/familia?v=fechas">Fechas</Link>
          </nav>

          <div className="st-charla" aria-label={t('fa.charla')}>
            <div className="st-turno st-yo"><div className="st-burbuja">{t('fa.chat.1')}</div></div>
            <div className="st-turno st-el">
              <Chispa />
              <div className="st-burbuja">{t('fa.chat.2a')} {t('fa.chat.2b')}, <b>{t('fa.chat.2c')}</b></div>
            </div>
            <div className="st-turno st-yo"><div className="st-burbuja">{t('fa.chat.3')}</div></div>
            <div className="st-turno st-el">
              <Chispa />
              <div className="st-burbuja">
                {t('fa.chat.4a')} <span className="st-cifra">{t('fa.chat.4b')}</span> {t('fa.chat.4c')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="st-banda st-leyes" id="pantalla">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('fa.vistas.rotulo')}</p>
            <h2>{t('fa.vistas.h2')}</h2>
            <p>{t('fa.vistas.sub')}</p>
          </div>
          <div className="st-rejilla-3" style={{ marginTop: '2.4rem' }}>
            {VISTAS.map((v) => (
              <Link className="st-producto st-tocable" key={v.k} href={`/demo/familia${v.v}`}>
                <span className="st-ico" aria-hidden="true">{v.icono}</span>
                <h3 style={{ fontSize: '1.1rem' }}>{t(`fa.${v.k}.t` as Clave)}</h3>
                <p>{t(`fa.${v.k}.p` as Clave)}</p>
                <span className="st-abrir">Abrir esta vista</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="se-habla">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('fa.dice.rotulo')}</p>
            <h2>{t('fa.dice.h2')}</h2>
            <p>{t('fa.dice.sub')}</p>
          </div>
          <div className="st-prueba" style={{ marginTop: '2rem' }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '.65rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {(['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'] as const).map((k) => (
                <li key={k} style={{ fontSize: '14.5px', color: 'var(--tinta-2)' }}>«{t(`fa.${k}` as Clave)}»</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="roles">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('fa.roles.rotulo')}</p>
            <h2>{t('fa.roles.h2')}</h2>
            <p>{t('fa.roles.sub')}</p>
          </div>
          <div className="st-lista-leyes" style={{ marginTop: '2.4rem', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))' }}>
            {(['r1', 'r2', 'r3', 'r4'] as const).map((k, i) => (
              <div className="st-ley" key={k}>
                <div className="st-rom">{['I', 'II', 'III', 'IV'][i]}</div>
                <h3>{t(`fa.${k}.t` as Clave)}</h3>
                <p>{t(`fa.${k}.p` as Clave)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('fa.reglas.rotulo')}</p>
            <h2>{t('fa.reglas.h2')}</h2>
          </div>
          <div className="st-pasos">
            {(['g1', 'g2', 'g3'] as const).map((k, i) => (
              <div className="st-paso" key={k}>
                <div className="st-n">{String(i + 1).padStart(2, '0')}</div>
                <h3>{t(`fa.${k}.t` as Clave)}</h3>
                <p>{t(`fa.${k}.p` as Clave)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="precio">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('fa.precio.rotulo')}</p>
            <h2>{t('fa.precio.h2')}</h2>
          </div>
          <div className="st-planes" style={{ maxWidth: 520, gridTemplateColumns: 'minmax(0, 1fr)' }}>
            <article className="st-plan st-plan-pmo">
              <h3>{t('z3.t')}</h3>
              <div className="st-precio">{t('z3.precio')}<small> {t('pz.mes')}</small></div>
              <p>{t('fa.precio.p')}</p>
            </article>
          </div>
          <p className="st-nota">{t('pz.nota')}</p>
          <div className="st-acciones" style={{ justifyContent: 'flex-start' }}>
            <Link className="st-btn st-btn-2" href="/#precios">{t('fa.precio.cta')}</Link>
          </div>
        </div>
      </section>

      <section className="st-banda st-cierre">
        <div className="st-caja">
          <h2>{t('fa.fin.h2')}</h2>
          <p className="st-bajada">{t('fa.fin.sub')}</p>
          <div className="st-acciones">
            <Link className="st-btn st-btn-1" href="/demo/familia">{t('fa.fin.cta')}</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
