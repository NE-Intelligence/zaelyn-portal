import Link from 'next/link'
import Campo from '@/components/sitio/Campo'
import { textos, type Clave } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'
import { COMPARATIVA, COMPLEMENTOS_PMO, COMPLEMENTOS_TRIBU, PLANES_PUBLICOS } from '@/lib/precios'

export async function generateMetadata() {
  const t = textos(await idiomaActual())
  return { title: t('pc.meta.titulo'), description: t('pc.meta.desc') }
}

const Palomita = ({ si, et }: { si: boolean; et: string }) =>
  si ? (
    <svg className="st-si" viewBox="0 0 24 24" width="18" height="18" role="img" aria-label={et}>
      <path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <span className="st-no" role="img" aria-label={et}>—</span>
  )

/**
 * `/precios` — los cuatro niveles, la tabla, los complementos, los roles y
 * las preguntas de siempre (#186). Antes los precios eran una sección al
 * final de la portada, mezclados con complementos sin decir de qué plan.
 */
export default async function Precios() {
  const lang = await idiomaActual()
  const t = textos(lang)
  const celda = (v: boolean | string, fila: Clave) => {
    if (typeof v === 'boolean') return <Palomita si={v} et={v ? '✓' : '—'} />
    const txt = v.startsWith('pc.') ? t(v as Clave) : v
    return fila === 'pc.f.voz' && !v.startsWith('pc.') ? `${txt} ${t('pc.v.min')}` : txt
  }

  return (
    <main>
      <section className="st-banda st-hero st-hero-chico">
        <Campo />
        <div className="st-caja">
          <p className="st-rotulo st-hero-etq">{t('pc.etq')}</p>
          <h1>
            <span>{t('pc.h1a')}</span> <em>{t('pc.h1b')}</em>
          </h1>
          <p className="st-bajada">{t('pc.sub')}</p>
        </div>
      </section>

      <section className="st-banda st-seccion st-seccion-pegada">
        <div className="st-caja">
          <div className="st-planes st-planes-grandes">
            {PLANES_PUBLICOS.map((p) => (
              <article className={`st-plan${p.destacado ? ' st-plan-pmo' : ''}`} key={p.id} data-espacio={p.espacio}>
                {p.destacado && <span className="st-sello">{t('pc.popular')}</span>}
                <p className="st-para">{t(p.para)}</p>
                <h2 className="st-plan-nombre">{p.nombre}</h2>
                <div className="st-precio">
                  {p.precio === null ? t('pc.gratis') : p.precio}
                  {p.precio !== null && <small> {t('pc.mes')}</small>}
                </div>
                {p.id === 'pmo' && <p className="st-anual">{t('pc.anio')}</p>}
                <p>{t(p.resumen)}</p>
                <a className={`st-btn ${p.destacado ? 'st-btn-1' : 'st-btn-2'} st-plan-cta`} href={p.id === 'kickoff' ? '/#empieza' : '/app/plan'}>
                  {t(p.cta)}
                </a>
                {p.incluye && <p className="st-incluye">{t(p.incluye)}</p>}
                <ul className="st-rasgos">
                  {p.rasgos.map((r) => <li key={r}>{t(r)}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <p className="st-nota">{t('pz.nota')}</p>
        </div>
      </section>

      <section className="st-banda st-seccion" id="comparar">
        <div className="st-caja">
          <div className="st-encabeza">
            <h2>{t('pc.tabla.h2')}</h2>
          </div>
          <div className="st-tabla-caja" role="region" aria-label={t('pc.tabla.cap')} tabIndex={0}>
            <table className="st-tabla">
              <caption className="st-oculto">{t('pc.tabla.cap')}</caption>
              <thead>
                <tr>
                  <th scope="col"><span className="st-oculto">{t('pc.tabla.cap')}</span></th>
                  {PLANES_PUBLICOS.map((p) => (
                    <th scope="col" key={p.id} data-espacio={p.espacio}>
                      <span>{p.nombre}</span>
                      <small>{p.precio === null ? t('pc.gratis') : `${p.precio} USD`}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARATIVA.map((fila) => (
                  <tr key={fila.f}>
                    <th scope="row">{t(fila.f)}</th>
                    {fila.v.map((v, i) => <td key={i}>{celda(v, fila.f)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="st-banda st-leyes" id="complementos">
        <div className="st-caja">
          <div className="st-encabeza">
            <h2>{t('pc.comp.h2')}</h2>
            <p>{t('pc.comp.sub')}</p>
          </div>
          <div className="st-comp-rejilla">
            <article className="st-comp" data-espacio="proyectos">
              <h3>{t('pc.comp.pmo')}</h3>
              <ul>{COMPLEMENTOS_PMO.map((k) => <li key={k}>{t(k)}</li>)}</ul>
            </article>
            <article className="st-comp" data-espacio="familia">
              <h3>{t('pc.comp.tribu')}</h3>
              <ul>{COMPLEMENTOS_TRIBU.map((k) => <li key={k}>{t(k)}</li>)}</ul>
            </article>
            <article className="st-comp st-comp-paq">
              <h3>{t('pc.paq.t')}</h3>
              <p>{t('pc.paq.p')}</p>
              <p className="st-precio">36.53 <small>{t('pc.mes')}</small></p>
            </article>
          </div>
          <p className="st-nota">{t('pz.anual')} {t('pz.org')}</p>
        </div>
      </section>

      <section className="st-banda st-seccion" id="roles">
        <div className="st-caja">
          <div className="st-encabeza">
            <h2>{t('pc.roles.h2')}</h2>
            <p>{t('pc.roles.sub')}</p>
          </div>
          <div className="st-roles">
            {(['sp', 'li', 'ej', 'st', 'mo'] as const).map((r) => (
              <div className="st-rol" key={r}>
                <h3>{t(`pc.r.${r}`)}</h3>
                <p>{t(`pc.r.${r}.p`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion st-faq-banda" id="preguntas">
        <div className="st-caja st-caja-angosta">
          <h2 className="st-h2">{t('pc.faq.h2')}</h2>
          <div className="st-faq">
            {(['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7'] as const).map((f) => (
              <details key={f}>
                <summary>{t(`pc.${f}.q`)}</summary>
                <p>{t(`pc.${f}.a`)}</p>
              </details>
            ))}
          </div>
          <p className="st-nota">{t('pc.nota')}</p>
          <div className="st-acciones st-acciones-izq">
            <a className="st-btn st-btn-1" href="/#empieza">{t('hero.cta0')}</a>
            <Link className="st-btn st-btn-2" href="/legal/terminos">{t('pie.terminos')}</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
