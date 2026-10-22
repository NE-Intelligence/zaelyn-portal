import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { Entrar } from '@/components/portal/Entrar'

/**
 * El pase no sirvió, y se dice cuál de los motivos fue.
 *
 * «Ya usado» y «expirado» llevan a acciones distintas: el primero suele ser
 * alguien que recargó la pestaña —y su sesión probablemente ya está abierta—,
 * y el segundo es pedir otro. Juntarlos en «enlace inválido» deja a la persona
 * sin saber qué hacer.
 */
const POR: Record<string, { titulo: string; cuerpo: string }> = {
  falta: {
    titulo: 'Ese enlace no trae pase',
    cuerpo: 'Pídele a Zaelyn «ábreme el portal» y usa el enlace completo que te manda.',
  },
  no_existe: {
    titulo: 'No reconozco ese pase',
    cuerpo: 'Puede estar cortado: los enlaces de chat se parten al copiarlos a mano. '
      + 'Pídele otro a Zaelyn y ábrelo tocándolo, sin copiar.',
  },
  expirado: {
    titulo: 'Ese pase ya venció',
    cuerpo: 'Duran quince minutos a propósito: viajan por un chat, y lo que viaja por un '
      + 'chat se reenvía y queda en el historial de un teléfono prestado. Pídele otro.',
  },
  usado: {
    titulo: 'Ese pase ya se usó',
    cuerpo: 'Vale una sola vez, también a propósito: si el segundo uso funcionara, '
      + 'reenviar el mensaje sería regalar la cuenta. Si fuiste tú quien ya entró, '
      + 'tu sesión sigue abierta.',
  },
  sin_api: {
    titulo: 'El portal todavía no está conectado',
    cuerpo: 'Falta decirle a este sitio dónde vive Zaelyn. El ejemplo completo sí se puede ver.',
  },
  caido: {
    titulo: 'Zaelyn no contestó',
    cuerpo: 'El pase puede seguir siendo bueno. Vuelve a abrir el enlace en un momento.',
  },
}

export default async function No({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const r = (await searchParams).r
  const clave = Array.isArray(r) ? r[0] : r
  const t = POR[clave ?? ''] ?? POR['caido']!

  return (
    <>
      <Barra migas={[{ texto: 'Entrar' }]} />
      <main className="pt-lienzo">
        <div className="pt-vacio" style={{ maxWidth: 620 }}>
          <b>{t.titulo}</b>
          <span>{t.cuerpo}</span>
          {/* Pedir otro pase es lo que resuelve CUATRO de los seis motivos, y
              no estorba en los otros dos. */}
          <Entrar compacto />
          <div style={{ display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
            <Link href="/app" style={{ color: 'var(--brand)' }}>Probar con mi sesión</Link>
            <Link href="/demo" style={{ color: 'var(--brand)' }}>Ver el ejemplo</Link>
          </div>
        </div>
      </main>
      <Pie />
    </>
  )
}
