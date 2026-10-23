import { notFound } from 'next/navigation'
import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { TableroAdminVista, esVistaAdmin } from '@/components/admin/Tablero'
import { soyAdmin, tableroAdmin } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Administración', robots: { index: false, follow: false } }

const fecha = (x: unknown) => (typeof x === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(x) ? x : undefined)

/**
 * `/admin` — el portal de administración (#186). Solo para administradores.
 *
 * Quién lo es lo decide el MOTOR, no esta página: si `soy` no dice que sí,
 * la ruta no existe (404, no 403 — no se anuncia que aquí hay algo). Todo lo
 * que se ve sale de `GET /portal/admin/tablero`, que arma el motor en SQL y
 * concilia contra Stripe; aquí no se suma nada.
 */
export default async function Admin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const q = await searchParams
  if (!(await soyAdmin())) notFound()
  const desde = fecha(q.desde)
  const hasta = fecha(q.hasta)
  const r = await tableroAdmin(desde, hasta)
  if (!r.ok) {
    if (r.fallo === 'NO_LO_ENCUENTRO') notFound()
    return <SinSesion fallo={r.fallo} />
  }
  return (
    <>
      <Barra area="admin" sesion modo="admin" />
      <main className="pt-lienzo">
        <TableroAdminVista d={r.dato} vista={esVistaAdmin(q.v)} desde={desde} hasta={hasta} />
      </main>
      <Pie modo="admin" />
    </>
  )
}
