import { Barra, Pie } from '@/components/portal/Marco'
import { LienzoFamilia } from '@/components/familia/Familia'
import { SinSesion } from '@/components/portal/SinSesion'
import { laFamilia } from '@/lib/api'
import { esVistaFamilia } from '@/lib/familia'

export const dynamic = 'force-dynamic'

/** `/app/f/<grupo>` — la semana de una familia, con la vista que diga `?v=`. */
export default async function Familia({
  params, searchParams,
}: {
  params: Promise<{ grupo: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { grupo } = await params
  const vista = esVistaFamilia((await searchParams).v)
  const r = await laFamilia(grupo)
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  const e = r.dato
  return (
    <>
      <Barra area="familia" migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: e.grupo.nombre }]} sesion etq="Familia" />
      <main className="pt-lienzo">
        <LienzoFamilia e={e} vista={vista} base={`/app/f/${grupo}`} leido={new Date().toISOString()} />
      </main>
      <Pie />
    </>
  )
}
