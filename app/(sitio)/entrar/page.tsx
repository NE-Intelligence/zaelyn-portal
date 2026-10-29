import { headers } from 'next/headers'
import Campo from '@/components/sitio/Campo'
import { Acceso } from '@/components/portal/Acceso'
import { bienvenida } from '@/lib/api'

export const metadata = { title: 'Entrar · Zaelyn' }

export const dynamic = 'force-dynamic'

/**
 * `/entrar?pase=…` — la puerta. Y NO canjea nada: solo pregunta.
 *
 * ── POR QUÉ ESTO DEJÓ DE SER UN GET QUE CANJEABA ───────────────────────
 *
 * Porque el pase se gastaba solo. Los registros no dejan lugar a dudas: dos
 * pases emitidos y canjeados **0.7 y 1.0 segundos después**, con la sesión
 * abierta y la cookie entregada — al robot de Telegram, que al armar la
 * tarjeta de previsualización del mensaje sigue la dirección. Cuando la
 * persona tocaba el enlace, medio minuto más tarde, leía «ese pase ya se
 * usó» sobre un pase que nunca había tocado.
 *
 * Quitar la tarjeta en Telegram arregla a Telegram. No arregla WhatsApp, ni
 * el antivirus que abre los enlaces del correo, ni el prefetch del navegador,
 * ni el rastreador de Slack el día que alguien reenvíe el mensaje ahí. Todos
 * hacen lo mismo: un GET.
 *
 * Así que el canje pasó a ser un POST. Ninguna de esas cosas manda POST. Esta
 * página solo pinta un formulario que se envía solo: para la persona sigue
 * siendo un toque —no ve nada de esto— y para un robot es una página más.
 *
 * ── UN GET NO CAMBIA ESTADO, Y AQUÍ ESTÁ POR QUÉ ES UNA REGLA ─────────
 *
 * Es la misma lección que `/salir`: era GET, «Salir» era un enlace, Next lo
 * prefetcheaba y la sesión se cerraba sola al pintar la barra. Dos defectos
 * distintos, la misma causa — un GET que hacía algo. La tercera vez conviene
 * dejarlo escrito: en este portal, lo que cambia estado va por POST.
 */
export default async function Entrar({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const crudo = (await searchParams).pase
  const pase = (Array.isArray(crudo) ? crudo[0] : crudo ?? '').trim().toUpperCase()
  // El nonce de la política de contenido (proxy.ts): sin él, el envío
  // automático del formulario no corre.
  const nonce = (await headers()).get('x-nonce') ?? undefined

  // Sin pase: la puerta de la web (fase 2) — passkey, correo o Telegram.
  // Vive en el marco del sitio (el de la landing), no en el del portal:
  // quien llega aquí todavía no está dentro.
  if (!pase) {
    const b = await bienvenida()
    const telegram = b.telegram
      ? (
        <a className="st-btn st-btn-2 ac-ancho" href={b.telegram.enlace} rel="noopener">
          <Telegrama /> Pedir mi enlace en Telegram
        </a>
      )
      : null
    return (
      <main>
        <Cabeza
          etq="Tu cuenta"
          a="Entra a"
          b="Zaelyn."
          bajada="Sin contraseña: con tu passkey, con un código a tu correo o desde tu chat de Telegram."
        />
        <section className="st-banda st-seccion st-seccion-pegada">
          <div className="st-caja">
            <div className="st-acceso">
              <Acceso registro="sitio" telegram={telegram} />
            </div>
            <p className="st-acceso-nota">
              ¿Primera vez? Con tu correo te creamos la cuenta en un minuto.
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main>
      <Cabeza etq="Tu portal" a="Abriendo" b="tu portal…" bajada="Un segundo. Si no pasa nada, toca el botón." />
      <section className="st-banda st-seccion st-seccion-pegada">
        <div className="st-caja">
          <form id="f" method="post" action="/entrar/canjear" className="st-acceso st-acceso-pase">
            <input type="hidden" name="pase" value={pase} />
            <button className="st-btn st-btn-1 ac-ancho" type="submit">Entrar</button>
          </form>
        </div>
      </section>
      {/*
        Se envía solo. Va como script en el HTML y no como efecto de React
        para que ocurra antes de hidratar: lo que la persona ve es una
        redirección, no una pantalla intermedia. Un robot que no ejecuta
        JavaScript se queda aquí, que es justo lo que se busca.
      */}
      <script
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `(function(){var f=document.getElementById('f');if(f)f.submit()})()`,
        }}
      />
    </main>
  )
}

/** El encabezado de la landing: rótulo, titular con degradado y bajada. */
function Cabeza({ etq, a, b, bajada }: { etq: string; a: string; b: string; bajada: string }) {
  return (
    <section className="st-banda st-hero st-hero-chico">
      <Campo />
      <div className="st-caja">
        <p className="st-rotulo st-hero-etq">{etq}</p>
        <h1><span>{a}</span> <em>{b}</em></h1>
        <p className="st-bajada">{bajada}</p>
      </div>
    </section>
  )
}

const Telegrama = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <path d="M21.9 4.3 18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15L17.9 6.3c.4-.36-.09-.56-.63-.2L6.7 12.68 1.7 11.1c-1.09-.34-1.1-1.09.23-1.61L20.5 2.68c.9-.33 1.69.21 1.4 1.62Z" />
  </svg>
)
