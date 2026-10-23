import { Barra, Pie } from '@/components/portal/Marco'
import { LienzoFamilia } from '@/components/familia/Familia'
import { demoFamilia } from '@/lib/demo-familia'
import { esVistaFamilia } from '@/lib/familia'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Familia · ejemplo' }

/**
 * `/demo/familia` — el portal de Familia con una familia inventada.
 *
 * Los Ríos no existen, y la barra lo dice. Es la misma pantalla que ve una
 * familia real en `/app/f/…`: solo cambia de dónde sale la semana.
 */
export default async function DemoFamilia({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const vista = esVistaFamilia((await searchParams).v)
  const e = demoFamilia()
  return (
    <>
      <Barra area="familia"
        migas={[{ texto: 'Ejemplo' }, { texto: e.grupo.nombre }]}
        ejemplo
        etq="Familia"
        aviso="La familia, los nombres y las fechas de esta pantalla están inventados. Con tu familia la pantalla es la misma: cambia de dónde sale la semana, no cómo se pinta."
      />
      <main className="pt-lienzo">
        <LienzoFamilia e={e} vista={vista} base="/demo/familia" leido={new Date().toISOString()} />
      </main>
      <Pie />
    </>
  )
}
