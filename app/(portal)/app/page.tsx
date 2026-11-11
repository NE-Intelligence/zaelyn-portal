import { Barra } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { misGrupos, yoMismo } from '@/lib/api'
import { lugarDe, type EntradaDelDia } from '@/lib/persona'
import { Inicio as Vista } from '@/components/portal/Inicio'
import { cuentaWeb } from '@/lib/api'

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

export default async function Inicio() {
  const [r, yo, cuenta] = await Promise.all([misGrupos(), yoMismo(1), cuentaWeb()])
  if (!r.ok) return <SinSesion fallo={r.fallo} />

  const grupos = r.dato.grupos
  const familias = grupos.filter(g => g.clase === 'family')
  const proyectos = grupos.filter(g => g.clase !== 'family')
  const planes = proyectos.flatMap(g => g.planes.map(p => ({ ...p, grupo: g.id })))
  const hoy = yo.ok ? yo.dato.dias[0]?.entradas ?? [] : []
  const foco = yo.ok ? yo.dato.foco[0] : undefined
  const handle = cuenta.ok ? cuenta.dato.handle : null

  return (
    <>
      <Barra area="inicio" sesion />
      <Vista d={{
        fecha: yo.ok ? hoyLargo(yo.dato.hoy) : '',
        saludo: saludo(yo.ok ? yo.dato.tz : null),
        quien: handle ? handle.replace(/^@/, '') : null,
        foco: foco ? { texto: foco.texto, porque: foco.porque || null } : null,
        personal: yo.ok ? {
          hoy: hoy.length,
          vencidas: yo.dato.compromisos.pendientes.filter(p => p.vencida).length,
          choques: yo.dato.alertas.filter(a => a.tipo === 'choque').length,
        } : null,
        familia: familias.length === 0 ? null
          : familias.length === 1 ? { nombre: familias[0]!.nombre, href: `/app/f/${familias[0]!.id}` }
            : { cuantas: familias.length, href: '/app/familia' },
        pmo: planes.length ? {
          proyectos: planes.length,
          vencidas: planes.reduce((n, p) => n + p.vencidos, 0),
          href: planes.length === 1 ? `/app/g/${planes[0]!.grupo}/${planes[0]!.id}` : '/app/proyectos',
        } : null,
        hoy: hoy.map(e => ({ hora: hora(e), texto: e.texto, lugar: lugarDe(e) })),
        hrefs: { personal: '/app/personal', apps: '/app/apps' },
      }} />
    </>
  )
}
