import { Barra } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { cuentaWeb, elAcceso, laAgenda, laFamilia, losModulos, misGrupos, yoMismo } from '@/lib/api'
import { ambitoDe } from '@/lib/plan'
import { Ejecucion } from '@/components/portal/Ejecucion'
import { appsDe, avisosDe, casaDe, desdeAgenda, desdePersona, fechasDe, gruposDe, proyectosDe } from '@/lib/ejecucion'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Inicio' }

/**
 * `/app` — el Inicio como vista de ejecución (decisiones/2026-11-11-inicio-de-ejecucion).
 *
 * Todo lo que la persona tiene que hacer, venga de Personal, Familia,
 * Proyectos o una app, en una lista priorizada, en tarjetas o en la semana;
 * al lado, la agenda, la casa, las fechas, los hábitos, los proyectos y las
 * apps. Lee lo que el motor ya midió: `/portal/agenda` (la misma de la app),
 * `/portal/persona`, `/portal/familia/<g>`, `/portal/grupos` y `/portal/modulos`.
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
const enZona = (tz: string | null) => {
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz ?? 'America/Mexico_City' }).format(new Date()) } catch { return new Date().toISOString().slice(0, 10) }
}
const sumar = (iso: string, n: number) => {
  const [a, m, d] = iso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}

export default async function Inicio() {
  const [r, yo, cuenta, mods, acc] = await Promise.all([misGrupos(), yoMismo(1), cuentaWeb(), losModulos(), elAcceso()])
  if (!r.ok) return <SinSesion fallo={r.fallo} />

  const grupos = r.dato.grupos
  const tz = yo.ok ? yo.dato.tz : null
  const hoy = yo.ok ? yo.dato.hoy.slice(0, 10) : enZona(tz)
  const familias = grupos.filter(g => ambitoDe(g) === 'family')
  const [agenda, ...casas] = await Promise.all([laAgenda(hoy, sumar(hoy, 41)), ...familias.slice(0, 3).map(g => laFamilia(g.id))])

  const cosas = agenda.ok ? desdeAgenda(agenda.dato) : []
  const ya = new Set(cosas.map(c => c.clave.split(':').slice(0, 2).join(':')))
  if (yo.ok) cosas.push(...desdePersona(yo.dato, ya))
  const fams = casas.flatMap((c, i) => (c.ok ? [{ f: c.dato, href: `/app/f/${familias[i]!.id}` }] : []))
  const foco = yo.ok ? yo.dato.foco[0] : undefined
  const handle = cuenta.ok ? cuenta.dato.handle : null

  return (
    <>
      <Barra area="inicio" sesion />
      <Ejecucion d={{
        hoy,
        fecha: hoyLargo(hoy),
        saludo: saludo(tz),
        quien: handle ? handle.replace(/^@/, '') : null,
        foco: foco ? { texto: foco.texto, porque: foco.porque || null } : null,
        avisos: yo.ok ? avisosDe(yo.dato) : [],
        cosas,
        casa: fams.map(x => casaDe(x.f, x.href)),
        fechas: fechasDe(fams.map(x => x.f)),
        habitos: yo.ok ? yo.dato.habitos.map(h => ({ nombre: h.nombre, hoy: h.hoy, meta: h.meta, unidad: h.unidad, racha: h.racha })) : [],
        proyectos: proyectosDe(grupos),
        grupos: gruposDe(grupos),
        contratado: acc.ok ? {
          plan: acc.dato.plan.nombre,
          apagado: ([['familia', 'Familia'], ['grupos', 'Grupos'], ['proyectos', 'Proyectos PMO']] as const)
            .flatMap(([k, que]) => {
              const s = acc.dato.secciones[k]
              return s && !s.encendido ? [{ que, plan: s.plan?.nombre ?? 'otro plan' }] : []
            }),
        } : undefined,
        apps: mods.ok ? appsDe(mods.dato.modulos) : [],
        hrefs: { personal: '/app/personal', familia: '/app/familia', proyectos: '/app/proyectos', apps: '/app/apps', calendario: '/app/personal?v=calendario' },
        faltan: [
          ...(agenda.ok ? [] : ['la agenda (el motor no contestó)']),
          'tu propio orden de prioridades',
          'listas',
          'lo pendiente dentro de las apps',
        ],
      }} />
    </>
  )
}
