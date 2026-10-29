import { Barra, Pie } from '@/components/portal/Marco'
import { Mensajes } from '@/components/portal/Mensajes'
import { SinSesion } from '@/components/portal/SinSesion'
import { cuentaWeb, misConversaciones } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mensajes' }

/**
 * `/app/mensajes` — mensajes entre personas (Zaelyn DECISIONS #230).
 * Zaelyn solo lee lo que se le muestra con «@zaelyn».
 */
export default async function PaginaMensajes() {
  const [r, web] = await Promise.all([misConversaciones(), cuentaWeb()])
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  return (
    <>
      <Barra area="mensajes" sesion />
      <main className="pt-lienzo ms-lienzo">
        <Mensajes inicial={r.dato.conversaciones} yo={web.ok ? web.dato.handle : null} />
      </main>
      <Pie />
    </>
  )
}
