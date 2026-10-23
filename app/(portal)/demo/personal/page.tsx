import { Barra, Pie } from '@/components/portal/Marco'
import { LienzoPersona } from '@/components/persona/Persona'
import { demoPersona } from '@/lib/demo-persona'
import { esVistaPersona } from '@/lib/persona'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Personal · ejemplo' }

/**
 * `/demo/personal` — el portal Personal con una persona inventada.
 *
 * Sofía no existe, y la barra lo dice. Es la misma pantalla que ve quien
 * entra a `/app/personal`: solo cambia de dónde sale el estado.
 */
export default async function DemoPersonal({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const vista = esVistaPersona((await searchParams).v)
  const e = demoPersona()
  return (
    <>
      <Barra
        migas={[{ texto: 'Ejemplo' }, { texto: 'Personal' }]}
        ejemplo
        etq="Personal"
        aviso="Sofía, sus grupos y sus pendientes están inventados. Con tus datos la pantalla es la misma: cambia de dónde sale tu día, no cómo se pinta."
      />
      <main className="pt-lienzo">
        <LienzoPersona e={e} vista={vista} base="/demo/personal" leido={new Date().toISOString()} nombre="Sofía" />
      </main>
      <Pie />
    </>
  )
}
