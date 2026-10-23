import { Barra, Pie } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { Horas } from '@/components/horas/Horas'
import { misHoras } from '@/lib/api'
import { esFecha, rangoDe, type Periodo } from '@/lib/horas'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mis horas' }

/**
 * `/app/horas` — mi registro de horas (#191).
 *
 * Lo de mis proyectos lo registra cualquiera que escribe en ellos; lo
 * personal es del portal Personal (el motor lo decide y la pantalla solo
 * esconde la opción). `?p=semana|mes&d=<fecha>` elige el periodo.
 */
export default async function MisHoras({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const periodo: Periodo = sp.p === 'mes' ? 'mes' : 'semana'
  const hoyAprox = new Date().toISOString().slice(0, 10)
  const ancla = esFecha(sp.d) ? sp.d : hoyAprox
  const { desde, hasta } = rangoDe(periodo, ancla)
  const r = await misHoras(desde, hasta)
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  return (
    <>
      <Barra area="personal" migas={[{ texto: "Personal", href: "/app/personal" }, { texto: "Horas" }]} sesion modo="horas" />
      <main className="pt-lienzo">
        <Horas v={r.dato} periodo={periodo} ancla={ancla} />
      </main>
      <Pie />
    </>
  )
}
