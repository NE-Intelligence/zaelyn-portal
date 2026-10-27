import Link from 'next/link'
import type { Clave } from '@/lib/copy'

/**
 * La ficha de cada espacio (#186): para quién es, dónde vive y qué plan lo
 * incluye, con la misma forma en Personal, Familia y Proyectos. Así las tres
 * páginas se leen como hermanas y nadie tiene que adivinar qué compra.
 */
export function Ficha({ espacio, t }: { espacio: 'personal' | 'familia' | 'proyectos'; t: (k: Clave) => string }) {
  const k = espacio === 'personal' ? 'pe' : espacio === 'familia' ? 'fa' : 'pr'
  return (
    <section className="st-banda st-ficha-banda" data-espacio={espacio}>
      <div className="st-caja">
        <dl className="st-ficha">
          <div>
            <dt>{t('fi.para')}</dt>
            <dd>{t(`fi.${k}.para` as Clave)}</dd>
          </div>
          <div>
            <dt>{t('fi.donde')}</dt>
            <dd>{t(`fi.${k}.donde` as Clave)}</dd>
          </div>
          <div>
            <dt>{t('fi.plan')}</dt>
            <dd>
              {t(`fi.${k}.plan` as Clave)}{' '}
              <Link href="/precios" className="st-enlace">{t('fi.precios')} →</Link>
            </dd>
            <dd className="st-ficha-cta">
              <Link href={`/empezar?para=${espacio}`} className="st-btn st-btn-1">{t('fi.probar')}</Link>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
