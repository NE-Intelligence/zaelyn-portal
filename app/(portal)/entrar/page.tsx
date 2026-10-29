import { headers } from 'next/headers'
import { Barra, Pie } from '@/components/portal/Marco'
import { Acceso } from '@/components/portal/Acceso'
import { Entrar as BotonTelegram } from '@/components/portal/Entrar'

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
  if (!pase) {
    return (
      <>
        <Barra migas={[{ texto: 'Entrar' }]} />
        <main className="pt-lienzo">
          <div className="pt-vacio" style={{ maxWidth: 460 }}>
            <b>Entra a Zaelyn</b>
            <span>Con tu passkey, con un código a tu correo, o desde tu chat de Telegram.</span>
            <Acceso telegram={<BotonTelegram compacto />} />
          </div>
        </main>
        <Pie />
      </>
    )
  }

  return (
    <>
      <Barra migas={[{ texto: 'Entrar' }]} />
      <main className="pt-lienzo">
        <div className="pt-vacio" style={{ maxWidth: 560 }}>
          <b>Abriendo tu portal…</b>
          <span>
            Un segundo. Si no pasa nada, toca el botón.
          </span>
          <form id="f" method="post" action="/entrar/canjear">
            <input type="hidden" name="pase" value={pase} />
            <button className="pt-boton" type="submit">Entrar</button>
          </form>
        </div>
      </main>
      <Pie />
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
    </>
  )
}
