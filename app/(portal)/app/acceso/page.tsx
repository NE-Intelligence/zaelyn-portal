import { redirect } from 'next/navigation'
import { Barra, Pie } from '@/components/portal/Marco'
import { CuentaWeb } from '@/components/portal/CuentaWeb'
import { SinSesion } from '@/components/portal/SinSesion'
import { cuentaWeb } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Tu acceso web' }

/**
 * `/app/acceso` — completar el acceso web de quien entró por Telegram
 * (Zaelyn DECISIONS #229: se pide «al entrar al portal»).
 *
 * Mientras el correo no esté conectado del lado del motor, NO se detiene a
 * nadie: no tendría cómo cumplir el paso. Se sigue directo a donde iba.
 */
export default async function Acceso({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const crudo = (await searchParams).siguiente
  const pedido = Array.isArray(crudo) ? crudo[0] : crudo
  const siguiente = pedido && /^\/app(\/[\w\-/]*)?$/.test(pedido) ? pedido : '/app'
  const r = await cuentaWeb()
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  if (r.dato.email || !r.dato.correo) redirect(siguiente)

  return (
    <>
      <Barra area="cuenta" sesion modo="cuenta" />
      <main className="pt-lienzo">
        <div className="pt-hub-cabeza">
          <h1>Completa tu acceso web</h1>
          <p>
            Agrega tu correo para entrar a Zaelyn desde cualquier navegador, sin depender de
            Telegram, y para recuperar tu cuenta si cambias de teléfono. Toma un minuto.
          </p>
        </div>
        <section className="pt-area cw-marco" data-area="cuenta">
          <CuentaWeb inicial={r.dato} alTerminar={siguiente} />
        </section>
      </main>
      <Pie modo="cuenta" />
    </>
  )
}
