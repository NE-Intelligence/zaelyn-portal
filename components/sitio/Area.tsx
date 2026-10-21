import Link from 'next/link'
import Campo from './Campo'
import { type Clave, textos } from '@/lib/copy'

const t = textos('es')

/**
 * Un área del producto que todavía no tiene pantalla.
 *
 * No es un «próximamente» vacío: dice qué funciona hoy en el chat y qué falta
 * por diseñar. Prometer una pantalla que no existe se descubre el día en que
 * alguien dependía de ella.
 */
export function Area({
  h1a,
  h1b,
  sub,
  hoy,
  falta,
}: {
  h1a: Clave
  h1b: Clave
  sub: Clave
  hoy: Clave[]
  falta: Clave[]
}) {
  return (
    <main>
      <section className="st-banda st-hero">
        <Campo />
        <div className="st-caja">
          <p className="st-rotulo" style={{ color: 'var(--brasa)' }}>
            {t('ar.etq')}
          </p>
          <h1 style={{ marginTop: '1.1rem' }}>
            <span>{t(h1a)}</span> <em>{t(h1b)}</em>
          </h1>
          <p className="st-bajada">{t(sub)}</p>
          <div className="st-acciones">
            <Link className="st-btn st-btn-2" href="/proyectos">
              {t('ar.cta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion">
        <div className="st-caja">
          <div className="st-rejilla-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: 0 }}>
            <article className="st-producto">
              <h3 style={{ fontSize: '1.12rem' }}>{t('ar.chat')}</h3>
              <ul>
                {hoy.map((k) => (
                  <li key={k}>{t(k)}</li>
                ))}
              </ul>
              <p className="st-pie">Esto ya corre hoy, hablando por Telegram.</p>
            </article>

            <article className="st-producto">
              <h3 style={{ fontSize: '1.12rem' }}>{t('ar.pantalla')}</h3>
              <ul>
                {falta.map((k) => (
                  <li key={k}>{t(k)}</li>
                ))}
              </ul>
              <p className="st-pie">Se diseña después del portal de proyectos.</p>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
