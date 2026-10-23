import { Barra, Pie } from '@/components/portal/Marco'
import { Lienzo, esVista } from '@/components/portal/Plan'
import { DEMO } from '@/lib/demo'

/**
 * `/demo` — el portal completo, con datos inventados y dicho en voz alta.
 *
 * Existe por dos razones y las dos valen: se puede enseñar sin una cuenta, y
 * es la prueba de que las vistas no saben de dónde salen los números. El
 * mismo componente pinta esto y pinta un plan real.
 */
export default async function Demo({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const vista = esVista((await searchParams).v)
  return (
    <>
      <Barra area="proyectos"
        migas={[{ texto: 'Ejemplo' }, { texto: DEMO.estado.plan!.nombre }]}
        ejemplo
      />
      <main className="pt-lienzo">
        <Lienzo v={DEMO} vista={vista} base="/demo" leido={new Date().toISOString()} />
      </main>
      <Pie />
    </>
  )
}
