import { Barra } from '@/components/portal/Marco'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Apps' }

/**
 * `/app/apps` — las otras apps de NE que Zaelyn conoce
 * (decisiones/2026-11-10-landings-y-portal). Incluidas para todos los que
 * tienen portal. Qué se le puede pedir a Zaelyn de cada una está por definir:
 * aquí solo se dice qué es y se abre.
 */
const APPS = [
  { nombre: 'Kore', que: 'Salud y entrenamiento', href: 'https://getkore.health' },
  { nombre: 'TCGBusters', que: 'Cartas coleccionables', href: 'https://www.tcgbusters.com' },
]

export default function Apps() {
  return (
    <>
      <Barra area="inicio" sesion />
      <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-9 px-6 pt-12 pb-20 text-tinta sm:px-14">
        <header className="flex flex-col gap-1.5">
          <span className="text-[14px] text-tinta-3">Apps conectadas</span>
          <h1 className="text-[34px] font-semibold sm:text-[40px]" style={{ letterSpacing: '-0.04em' }}>Tus otras apps</h1>
          <p className="max-w-[52ch] text-[17px] leading-[1.5] text-tinta-2">Incluidas con tu portal. Ábrelas desde aquí.</p>
        </header>
        <section className="grid gap-4 md:grid-cols-2">
          {APPS.map(a => (
            <a key={a.nombre} href={a.href} target="_blank" rel="noopener noreferrer"
              className="flex flex-col gap-2 rounded-[26px] bg-superficie p-8 text-tinta no-underline shadow-z1 transition-shadow hover:shadow-z2">
              <span className="text-[26px] font-semibold" style={{ letterSpacing: '-0.03em' }}>{a.nombre}</span>
              <span className="text-[16px] text-tinta-2">{a.que}</span>
              <span className="mt-4 text-[15px] font-semibold">Abrir {a.nombre} ↗</span>
            </a>
          ))}
        </section>
      </main>
    </>
  )
}
