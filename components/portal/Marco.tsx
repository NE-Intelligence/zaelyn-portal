import Link from 'next/link'

/**
 * La barra superior del portal y el pie. Sin un solo control que escriba.
 *
 * El aviso de «datos de ejemplo» es una PROP y no algo que esté siempre
 * puesto: cuando la pantalla trae datos reales, decir que son inventados es
 * exactamente igual de dañino que lo contrario.
 */
export function Barra({
  migas, ejemplo = false, sesion = false, modo = 'lectura',
}: {
  migas: { texto: string; href?: string }[]
  ejemplo?: boolean
  sesion?: boolean
  /** El editor de proyectos (#174) sí escribe: borradores, no el plan vivo. */
  modo?: 'lectura' | 'editor' | 'cuenta'
}) {
  return (
    <>
      {ejemplo && (
        <div className="pt-aviso">
          <b>Datos de ejemplo</b>
          <span>
            El proyecto, las personas y las fechas de esta pantalla están inventados.
            Con tus datos reales la pantalla es la misma: cambia de dónde salen los
            números, no cómo se pintan.
          </span>
        </div>
      )}
      <header className="pt-barra">
        <Link className="pt-marca" href="/">
          <span className="campo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo/zaelyn-wordmark-320.png" alt="zælyn" width={320} height={110} />
          </span>
          <span className="pt-etq">Proyectos</span>
        </Link>
        <nav className="pt-migas" aria-label="Dónde estoy">
          {migas.map((m, i) => (
            <span key={i} style={{ display: 'contents' }}>
              {i > 0 && <span className="sep">/</span>}
              {m.href
                ? <Link href={m.href}>{m.texto}</Link>
                : <span style={{ color: 'var(--ink)' }}>{m.texto}</span>}
            </span>
          ))}
        </nav>
        <div className="pt-der">
          <span className="pt-overline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 18, height: 18, borderRadius: '50%',
                background: 'var(--zaelyn)', display: 'grid', placeItems: 'center',
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 10, height: 10, fill: 'var(--surface)' }} aria-hidden="true">
                <path d="M12 2.6l2.1 5.9 5.9 2.1-5.9 2.1-2.1 5.9-2.1-5.9L4 10.6l5.9-2.1z" />
              </svg>
            </span>
            {modo === 'editor' ? 'Editor · borrador' : modo === 'cuenta' ? 'Tu cuenta' : 'Solo lectura'}
          </span>
          {/* Un FORMULARIO y no un enlace: ver `app/salir/route.ts`. */}
          {sesion && (
            <form action="/salir" method="post" style={{ display: 'contents' }}>
              <button type="submit" className="pt-salir pt-overline">Salir</button>
            </form>
          )}
        </div>
      </header>
    </>
  )
}

export function Pie({ modo = 'lectura' }: { modo?: 'lectura' | 'editor' | 'cuenta' } = {}) {
  return (
    <footer className="pt-pie">
      <span>Zaelyn es un producto de NE Intelligence</span>
      <span className="der">
        {modo === 'editor'
          ? 'Lo que armas aquí es un borrador: Zaelyn lo sigue cuando lo liberas.'
          : modo === 'cuenta'
            ? 'El pago lo procesa Stripe: Zaelyn nunca ve tu tarjeta.'
            : 'Se cambia hablando, no aquí: el portal solo muestra.'}
      </span>
    </footer>
  )
}
