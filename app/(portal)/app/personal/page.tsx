import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { LienzoPersona } from '@/components/persona/Persona'
import { SinSesion } from '@/components/portal/SinSesion'
import { yoMismo } from '@/lib/api'
import { esVistaPersona } from '@/lib/persona'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Personal' }

/**
 * `/app/personal` — dónde estoy parado, en todos mis grupos (#184).
 *
 * En Kickoff el motor contesta 402: todo esto ya lo tiene en el chat, y la
 * pantalla es lo que se paga. Se le dice así, con lo que gana, y no con un
 * error.
 */
export default async function Personal({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const vista = esVistaPersona((await searchParams).v)
  const r = await yoMismo(14)
  if (!r.ok && r.fallo === 'SIN_PLAN') {
    return (
      <>
        <Barra migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: 'Personal' }]} sesion etq="Personal" />
        <main className="pt-lienzo">
          <section className="pt-tarjeta" style={{ maxWidth: 640 }}>
            <header><h2>Tu portal Personal es de Sprint en adelante</h2></header>
            <p>Hoy tienes <b>{r.plan.nombre}</b>: todo lo tuyo funciona en el chat de Telegram, gratis.
              Con Sprint lo ves aquí cruzado con todos tus grupos —qué te toca hoy, qué choca, qué venció y tus
              hábitos— y además te llegan los avisos por WhatsApp.</p>
            <p>Tribu y PMO ya incluyen Sprint.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
              <Link className="pt-boton" href="/app/plan">Ver Plan y uso</Link>
              <Link className="pt-boton" href="/demo/personal">Ver el ejemplo</Link>
            </div>
          </section>
        </main>
        <Pie />
      </>
    )
  }
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  return (
    <>
      <Barra migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: 'Personal' }]} sesion etq="Personal" />
      <main className="pt-lienzo">
        <LienzoPersona e={r.dato} vista={vista} base="/app/personal" leido={new Date().toISOString()} />
      </main>
      <Pie />
    </>
  )
}
