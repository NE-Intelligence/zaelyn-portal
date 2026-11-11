import Link from 'next/link'
import { Barra } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { misGrupos, yoMismo } from '@/lib/api'
import { lugarDe, type EntradaDelDia } from '@/lib/persona'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inicio' }

/**
 * `/app` — el Inicio de la persona (decisiones/2026-11-10-landings-y-portal).
 *
 * Una pantalla tranquila: el saludo, lo primero que Zaelyn ve hoy, una tarjeta
 * por solución con UNA sola cifra y la lista de hoy. Las cifras son las que el
 * motor ya contó (`/portal/persona`, `/portal/grupos`): aquí no se mide nada,
 * ni se pinta un porcentaje que no venga medido.
 */
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function saludo(tz: string | null): string {
  let h = new Date().getUTCHours()
  try { h = Number(new Intl.DateTimeFormat('es-MX', { hour: 'numeric', hourCycle: 'h23', timeZone: tz ?? undefined }).format(new Date())) } catch { /* zona rara */ }
  return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'
}
function hoyLargo(iso: string): string {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number) as [number, number, number]
  const f = new Date(Date.UTC(a, m - 1, d))
  const t = `${DIAS[f.getUTCDay()]} ${d} de ${MESES[m - 1]}`
  return t[0]!.toUpperCase() + t.slice(1)
}
const hora = (e: EntradaDelDia): string => ('hhmm' in e && e.hhmm ? e.hhmm : 'Hoy')

const TILE = 'flex flex-col gap-3.5 rounded-[26px] bg-superficie p-[26px] text-tinta no-underline shadow-z1 transition-shadow hover:shadow-z2'
const GRANDE = { letterSpacing: '-0.04em' }

export default async function Inicio() {
  const [r, yo] = await Promise.all([misGrupos(), yoMismo(1)])
  if (!r.ok) return <SinSesion fallo={r.fallo} />

  const grupos = r.dato.grupos
  const familias = grupos.filter(g => g.clase === 'family')
  const proyectos = grupos.filter(g => g.clase !== 'family')
  const planes = proyectos.flatMap(g => g.planes.map(p => ({ ...p, grupo: g.id })))
  const vencidasPmo = planes.reduce((n, p) => n + p.vencidos, 0)
  const hoy = yo.ok ? yo.dato.dias[0]?.entradas ?? [] : []
  const vencidasYo = yo.ok ? yo.dato.compromisos.pendientes.filter(p => p.vencida).length : 0
  const foco = yo.ok ? yo.dato.foco[0] : undefined
  const choques = yo.ok ? yo.dato.alertas.filter(a => a.tipo === 'choque').length : 0

  return (
    <>
      <Barra area="inicio" sesion />
      <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-9 px-6 pt-12 pb-20 text-tinta sm:px-14">
        <header className="flex flex-col gap-1.5">
          <span className="text-[14px] text-tinta-3">{yo.ok ? hoyLargo(yo.dato.hoy) : ''}</span>
          <h1 className="text-[34px] font-semibold sm:text-[40px]" style={GRANDE}>{saludo(yo.ok ? yo.dato.tz : null)}</h1>
        </header>

        {/* Lo primero que Zaelyn ve hoy: su frase, tal cual la manda el motor */}
        {foco && (
          <section className="flex items-start gap-4">
            <span className="z-orbe size-11" aria-hidden="true" />
            <p className="max-w-[640px] rounded-[24px] bg-burbuja px-5 py-4 text-[17px] leading-[1.45]">
              {foco.texto}{foco.porque ? <span className="text-tinta-2"> · {foco.porque}</span> : null}
            </p>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-3" aria-label="Tus soluciones">
          <Link href="/app/personal" className={TILE}>
            <span className="flex items-center gap-2 text-[14px] text-tinta-3"><span className="size-[9px] rounded-full bg-personal" aria-hidden="true" />Personal</span>
            {yo.ok ? (
              <>
                <span className="text-[40px] leading-none font-semibold" style={GRANDE}>{hoy.length}</span>
                <span className="text-[15px] text-tinta-2">
                  {hoy.length === 1 ? 'cosa hoy' : 'cosas hoy'}
                  {vencidasYo > 0 && <> · <span className="text-det-tinta">{vencidasYo} {vencidasYo === 1 ? 'vencida' : 'vencidas'}</span></>}
                  {choques > 0 && <> · {choques} {choques === 1 ? 'choque' : 'choques'}</>}
                </span>
              </>
            ) : (
              <span className="text-[15px] leading-[1.5] text-tinta-2">Tu día cruzado con todos tus grupos llega con Sprint. En el chat ya lo tienes.</span>
            )}
          </Link>

          <Link href={familias.length === 1 ? `/app/f/${familias[0]!.id}` : '/app/familia'} className={TILE}>
            <span className="flex items-center gap-2 text-[14px] text-tinta-3"><span className="size-[9px] rounded-full bg-familia" aria-hidden="true" />Familia</span>
            {familias.length > 0 ? (
              <>
                <span className="text-[28px] leading-[1.1] font-semibold" style={{ letterSpacing: '-0.03em' }}>{familias.length === 1 ? familias[0]!.nombre : `${familias.length} familias`}</span>
                <span className="text-[15px] text-tinta-2">La semana de tu casa</span>
              </>
            ) : (
              <span className="text-[15px] leading-[1.5] text-tinta-2">Todavía no tienes una familia en Zaelyn. Díselo en el chat: «crea mi familia».</span>
            )}
          </Link>

          <Link href={planes.length === 1 ? `/app/g/${planes[0]!.grupo}/${planes[0]!.id}` : '/app/proyectos'} className={TILE}>
            <span className="flex items-center gap-2 text-[14px] text-tinta-3"><span className="size-[9px] rounded-full bg-proyectos" aria-hidden="true" />PMO</span>
            {planes.length > 0 ? (
              <>
                <span className="text-[40px] leading-none font-semibold" style={GRANDE}>{planes.length}</span>
                <span className="text-[15px] text-tinta-2">
                  {planes.length === 1 ? 'proyecto' : 'proyectos'}
                  {vencidasPmo > 0 && <> · <span className="text-det-tinta">{vencidasPmo} {vencidasPmo === 1 ? 'actividad vencida' : 'actividades vencidas'}</span></>}
                </span>
              </>
            ) : (
              <span className="text-[15px] leading-[1.5] text-tinta-2">Arma tu primer proyecto en el editor o súbelo desde Excel.</span>
            )}
          </Link>
        </section>

        {hoy.length > 0 && (
          <section className="flex flex-col">
            <h2 className="mb-1.5 text-[20px] font-semibold">Hoy</h2>
            {hoy.slice(0, 8).map((e, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-linea py-4 last:border-0">
                <span className="w-[72px] flex-none text-[14px] text-tinta-3 tabular-nums">{hora(e)}</span>
                <span className="min-w-0 flex-1 truncate text-[16px]">{e.texto}</span>
                <span className="flex-none text-[14px] text-tinta-3">{lugarDe(e)}</span>
              </div>
            ))}
            {hoy.length > 8 && <Link href="/app/personal" className="pt-3 text-[15px] font-semibold text-tinta no-underline">Ver todo tu día ›</Link>}
          </section>
        )}

        <section className="flex flex-wrap items-center gap-3">
          <span className="mr-1.5 text-[14px] text-tinta-3">Apps</span>
          <Link href="/app/apps" className="inline-flex h-10 items-center rounded-full bg-superficie px-4 text-[14px] text-tinta no-underline shadow-[0_0_0_1px_var(--z-line)]">Kore</Link>
          <Link href="/app/apps" className="inline-flex h-10 items-center rounded-full bg-superficie px-4 text-[14px] text-tinta no-underline shadow-[0_0_0_1px_var(--z-line)]">TCGBusters</Link>
        </section>
      </main>
    </>
  )
}
