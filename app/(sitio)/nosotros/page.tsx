import Link from 'next/link'
import Campo from '@/components/sitio/Campo'
import { Iconos } from '@/components/sitio/Iconos'
import { textos } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'

export async function generateMetadata() {
  const t = textos(await idiomaActual())
  return { title: t('ns.meta.titulo'), description: t('ns.meta.desc') }
}

/** `/nosotros` — quiénes somos, por qué Zaelyn y las empresas detrás (#186). */
export default async function Nosotros() {
  const t = textos(await idiomaActual())
  return (
    <main>
      <section className="st-banda st-hero st-hero-chico">
        <Campo />
        <div className="st-caja">
          <p className="st-rotulo st-hero-etq">{t('ns.etq')}</p>
          <h1>
            <span>{t('ns.h1a')}</span> <em>{t('ns.h1b')}</em>
          </h1>
          <p className="st-bajada">{t('ns.sub')}</p>
        </div>
      </section>

      <section className="st-banda st-seccion" id="por-que">
        <div className="st-caja st-dos">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('ns.por.rotulo')}</p>
            <h2>{t('ns.por.h2')}</h2>
          </div>
          <div className="st-prosa">
            <p>{t('ns.por.p1')}</p>
            <p>{t('ns.por.p2')}</p>
            <p className="st-prosa-fuerte">{t('ns.por.p3')}</p>
          </div>
        </div>
      </section>

      <section className="st-banda st-leyes">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('ns.como.rotulo')}</p>
            <h2>{t('ns.como.h2')}</h2>
          </div>
          <div className="st-lista-leyes">
            {(['c1', 'c2', 'c3'] as const).map((c, i) => (
              <div className="st-ley" key={c}>
                <div className="st-rom">{['I', 'II', 'III'][i]}</div>
                <h3>{t(`ns.${c}.t`)}</h3>
                <p>{t(`ns.${c}.p`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion" id="empresas">
        <div className="st-caja">
          <div className="st-encabeza">
            <p className="st-rotulo">{t('ns.emp.rotulo')}</p>
            <h2>{t('ns.emp.h2')}</h2>
          </div>
          <div className="st-rejilla-2">
            <article className="st-producto">
              <span className="st-ico" aria-hidden="true">{Iconos.edificio}</span>
              <h3>{t('ns.mx.t')}</h3>
              <p>{t('ns.mx.p')}</p>
              <a className="st-enlace" href="https://nationalexpertise.com" target="_blank" rel="noopener noreferrer">nationalexpertise.com ↗</a>
            </article>
            <article className="st-producto">
              <span className="st-ico" aria-hidden="true">{Iconos.edificio}</span>
              <h3>{t('ns.us.t')}</h3>
              <p>{t('ns.us.p')}</p>
              <a className="st-enlace" href="https://national.expert" target="_blank" rel="noopener noreferrer">national.expert ↗</a>
            </article>
          </div>
        </div>
      </section>

      <section className="st-banda st-cierre" id="contacto">
        <div className="st-caja">
          <p className="st-rotulo">{t('ns.contacto.rotulo')}</p>
          <h2 style={{ marginTop: '.8rem' }}>{t('ns.contacto.h2')}</h2>
          <p className="st-bajada">{t('ns.contacto.p')}</p>
          <p className="st-falta">{t('ns.contacto.mail')}</p>
          <div className="st-acciones">
            <a className="st-btn st-btn-1" href="https://t.me/ZaelynBot" target="_blank" rel="noopener noreferrer">{t('em.abrir')}</a>
            <Link className="st-btn st-btn-2" href="/legal/privacidad">{t('pie.privacidad')}</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
