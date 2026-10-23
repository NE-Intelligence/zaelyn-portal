import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { Participaciones } from '@/components/plan/Participaciones'
import { participaciones } from '@/lib/api'

export const dynamic = 'force-dynamic'

/** `/app/participaciones` — todo lo que haces y quién lo paga (Zaelyn DECISIONS #180). */
export default async function ParticipacionesPagina() {
  const r = await participaciones()
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  return (
    <>
      <Barra area="cuenta" migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: 'Mis participaciones' }]} sesion modo="cuenta" />
      <main className="pt-lienzo">
        <Participaciones v={r.dato} />
      </main>
      <Pie modo="cuenta" />
    </>
  )
}
