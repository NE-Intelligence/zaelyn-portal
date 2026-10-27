import Link from 'next/link'
import Campo from '@/components/sitio/Campo'
import { Iconos } from '@/components/sitio/Iconos'
import { bienvenida, fundadores } from '@/lib/api'
import { textos, type Clave } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'

export async function generateMetadata() {
  const t = textos(await idiomaActual())
  return { title: t('ez.meta.titulo'), description: t('ez.meta.desc') }
}

type Para = 'personal' | 'familia' | 'proyectos'
const ES_PARA = (x: unknown): x is Para => x === 'personal' || x === 'familia' || x === 'proyectos'

const OPCIONES: { id: Para; nav: Clave; d: Clave; icono: React.ReactNode }[] = [
  { id: 'personal', nav: 'nav.personal', d: 'ez.pe.d', icono: Iconos.reloj },
  { id: 'familia', nav: 'nav.familia', d: 'ez.fa.d', icono: Iconos.familia },
  { id: 'proyectos', nav: 'nav.proyectos', d: 'ez.pr.d', icono: Iconos.plan },
]

/**
 * `/empezar` — el caminito de alta (#194).
 *
 * Una sola página para todo el que quiere probar: elige para qué lo quiere,
 * abre Telegram con un toque (o con el QR desde la computadora) y la prueba
 * de 7 días se activa sola al terminar el alta. No hay registro ni
 * contraseña: la identidad es el chat, y por eso esta página no pide nada.
 *
 * La elección viaja en la liga (`?start=prueba_familia`) para que el primer
 * mensaje de Zaelyn traiga el ejemplo correcto. Elegir es un enlace, no un
 * formulario: funciona sin JavaScript y se puede compartir.
 */
export default async function Empezar({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [lang, b, f, q] = await Promise.all([idiomaActual(), bienvenida(), fundadores(), searchParams])
  const t = textos(lang)
  const para = ES_PARA(q.para) ? q.para : null
  const carga = para ? `prueba_${para}` : 'prueba'
  // El nombre del bot lo dice Zaelyn; si no contesta, el de siempre.
  const usuario = b.telegram?.usuario ?? 'ZaelynBot'
  const liga = `https://t.me/${usuario}?start=${carga}`

  return (
    <main>
      <section className="st-banda st-hero st-hero-chico">
        <Campo />
        <div className="st-caja">
          <p className="st-rotulo st-hero-etq">{t('ez.etq')}</p>
          <h1>
            <span>{t('ez.h1a')}</span> <em>{t('ez.h1b')}</em>
          </h1>
          <p className="st-bajada">{t('ez.sub')}</p>
        </div>
      </section>

      <section className="st-banda st-seccion st-seccion-pegada">
        <div className="st-caja st-ez">
          {/* 1 · para qué */}
          <div className="st-ez-paso">
            <span className="st-ez-n">1</span>
            <div className="st-ez-cuerpo">
              <h2>{t('ez.p1')}</h2>
              <p className="st-ez-sub">{t('ez.p1.sub')}</p>
              <div className="st-ez-opciones">
                {OPCIONES.map((o) => (
                  <Link
                    key={o.id}
                    href={`/empezar?para=${o.id}#abrir`}
                    scroll={false}
                    className="st-ez-opcion"
                    data-espacio={o.id}
                    aria-current={para === o.id ? 'true' : undefined}
                  >
                    <span className="st-ico" aria-hidden="true">{o.icono}</span>
                    <b>{t(o.nav)}</b>
                    <span>{t(o.d)}</span>
                    {para === o.id && <small>✓ {t('ez.elegido')}</small>}
                  </Link>
                ))}
              </div>
              <Link href="/empezar#abrir" scroll={false} className="st-ez-todo" aria-current={!para ? 'true' : undefined}>
                {t('ez.todo')}
              </Link>
            </div>
          </div>

          {/* 2 · abrir Telegram */}
          <div className="st-ez-paso" id="abrir">
            <span className="st-ez-n">2</span>
            <div className="st-ez-cuerpo">
              <h2>{t('ez.p2')}</h2>
              <p className="st-ez-sub">{t('ez.p2.sub')}</p>
              <div className="st-ez-abrir">
                <div className="st-ez-boton">
                  <a className="st-btn st-btn-1 st-ez-cta" href={liga} target="_blank" rel="noopener noreferrer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                      <path d="M21.9 4.3 18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15L17.9 6.3c.4-.36-.09-.56-.63-.2L6.7 12.68 1.7 11.1c-1.09-.34-1.1-1.09.23-1.61L20.5 2.68c.9-.33 1.69.21 1.4 1.62Z" />
                    </svg>
                    {t('ez.abrir')}
                  </a>
                  {f.abierto && f.tramo && (
                    <p className="st-ez-fund">{t('ez.fund').replace('{t}', String(f.tramo)).replace('{q}', String(f.quedan))}</p>
                  )}
                  <p className="st-ez-tg">
                    {t('ez.sintg')}{' '}
                    <a href="https://apps.apple.com/app/telegram-messenger/id686449807" target="_blank" rel="noopener noreferrer">App Store</a>
                    {' · '}
                    <a href="https://play.google.com/store/apps/details?id=org.telegram.messenger" target="_blank" rel="noopener noreferrer">Google Play</a>
                  </p>
                </div>
                <figure className="st-ez-qr">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/empezar/qr-${carga}.svg`} alt={t('ez.qr')} width={200} height={200} />
                  <figcaption>{t('ez.qr.p')}</figcaption>
                </figure>
              </div>
            </div>
          </div>

          {/* 3 · qué pasa después */}
          <div className="st-ez-paso">
            <span className="st-ez-n">3</span>
            <div className="st-ez-cuerpo">
              <h2>{t('ez.p3')}</h2>
              <ol className="st-ez-linea">
                {(['s1', 's2', 's3', 's4'] as const).map((s) => (
                  <li key={s}>
                    <b>{t(`ez.${s}.t`)}</b>
                    <span>{t(`ez.${s}.p`)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="st-banda st-seccion st-faq-banda">
        <div className="st-caja st-caja-angosta">
          <h2 className="st-h2">{t('ez.faq')}</h2>
          <div className="st-faq">
            {(['f1', 'f2', 'f3', 'f4', 'f5'] as const).map((k) => (
              <details key={k}>
                <summary>{t(`ez.${k}.q`)}</summary>
                <p>
                  {t(`ez.${k}.a`)}
                  {k === 'f5' && <> <Link href="/app" className="st-enlace">{t('ez.entrar')} →</Link></>}
                </p>
              </details>
            ))}
          </div>
          <p className="st-nota">{t('em.codigo.p')}</p>
        </div>
      </section>
    </main>
  )
}
