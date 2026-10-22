import { bienvenida } from '@/lib/api'

/**
 * Cómo se entra al portal, con un botón y no con una instrucción.
 *
 * ── EL PORTAL NO TIENE CONTRASEÑA, PERO TENÍA UNA FRASE ────────────────
 *
 * La pantalla decía «dile a Zaelyn ábreme el portal» y ahí se acababa: había
 * que acordarse de la frase, encontrar el chat y teclearla. Quien no se
 * acuerda, no entra — así que la puerta sin contraseña estaba cerrada con
 * una oración, que es peor, porque una contraseña al menos se guarda en el
 * navegador.
 *
 * Ahora es un toque: el enlace de Telegram lleva `?start=portal`, Telegram
 * abre el chat y manda ese primer mensaje solo, y Zaelyn contesta con el
 * pase. La frase sigue funcionando para quien ya la sabe.
 *
 * El nombre del bot NO está escrito aquí: se le pregunta a Zaelyn, que es lo
 * único que lo sabe. Si no contesta, quedan las instrucciones y ningún botón
 * roto.
 */
export async function Entrar({ compacto = false }: { compacto?: boolean }) {
  const b = await bienvenida()

  return (
    <div className="pt-entrar">
      {b.telegram ? (
        <>
          <a className="pt-boton" href={b.telegram.enlace} rel="noopener">
            <Telegrama />
            Pedir mi enlace en Telegram
          </a>
          {!compacto && (
            <p className="nota">
              Se abre tu chat con <b>@{b.telegram.usuario}</b> y Zaelyn te manda el
              enlace. Vale una sola vez y quince minutos, porque viaja por un chat.
            </p>
          )}
        </>
      ) : (
        <p className="nota">
          Dile a Zaelyn <b>«ábreme el portal»</b> por el chat donde ya lo usas y te
          manda el enlace.
        </p>
      )}

      {/* WhatsApp todavía no: está en el sandbox y sin plantilla aprobada por
          Meta. Se dice en vez de callarlo — quien lo busca ahí merece saber
          que viene, no quedarse pensando que se le pasó el botón. */}
      {!compacto && !b.whatsapp && (
        <p className="nota tenue">Por WhatsApp, en cuanto Meta apruebe el remitente.</p>
      )}
    </div>
  )
}

const Telegrama = () => (
  <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
    <path d="M21.9 4.3 18.6 20c-.25 1.1-.9 1.37-1.83.85l-5.06-3.73-2.44 2.35c-.27.27-.5.5-1.02.5l.36-5.15L17.9 6.3c.4-.36-.09-.56-.63-.2L6.7 12.68 1.7 11.1c-1.09-.34-1.1-1.09.23-1.61L20.5 2.68c.9-.33 1.69.21 1.4 1.62Z" />
  </svg>
)
