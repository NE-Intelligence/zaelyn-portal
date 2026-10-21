import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Barra, Pie } from '@/components/portal/Marco'
import { Avance, Salud, fecha } from '@/components/portal/atomos'
import { Bitacora, Equipo, Gantt, Resumen, Ruta, Tablero } from '@/components/portal/vistas'
import { DEMO, GRUPOS } from '@/lib/demo'
import { ROL_NOMBRE, ROL_PUEDE, VISTA_NOMBRE, type Vista } from '@/lib/plan'

const VISTAS = Object.keys(VISTA_NOMBRE) as Vista[]

function esVista(v: string | string[] | undefined): Vista {
  const uno = Array.isArray(v) ? v[0] : v
  return (VISTAS as string[]).includes(uno ?? '') ? (uno as Vista) : 'resumen'
}

/** Cuándo se leyó el plan. Un dato viejo que no dice que es viejo engaña. */
function frescura(iso: string): string {
  const min = Math.max(0, Math.round((Date.parse('2026-11-18T09:40:00-06:00') - Date.parse(iso)) / 60000))
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  return `hace ${Math.round(min / 60)} h`
}

export default async function Plan({
  params,
  searchParams,
}: {
  params: Promise<{ plan: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { plan: id } = await params
  const vista = esVista((await searchParams).v)

  // Solo el plan de ejemplo tiene detalle. Los demás existen en la lista y
  // todavía no traen datos: se dice, no se inventa una pantalla vacía.
  const conocido = GRUPOS.flatMap((g) => g.planes).find((p) => p.id === id)
  if (!conocido) notFound()

  const grupo = GRUPOS.find((g) => g.planes.some((p) => p.id === id))!

  if (id !== 'andes') {
    return (
      <>
        <Barra migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: grupo.nombre, href: '/app' }, { texto: conocido.nombre }]} />
        <main className="pt-lienzo">
          <div className="pt-vacio" style={{ maxWidth: 560 }}>
            <b>Este plan todavía no trae datos de ejemplo</b>
            <span>
              La pantalla de arriba es la misma para cualquier plan. Para ver el portal completo, abre «Andes · Compras y
              aprobaciones».
            </span>
            <Link href="/app/andes" style={{ color: 'var(--brand)', marginTop: 6 }}>
              Ir a ese plan
            </Link>
          </div>
        </main>
        <Pie />
      </>
    )
  }

  const plan = DEMO
  const p = plan.proyecto

  return (
    <>
      <Barra migas={[{ texto: 'Mis grupos', href: '/app' }, { texto: grupo.nombre, href: '/app' }, { texto: p.corto }]} />

      <main className="pt-lienzo">
        <div className="pt-cabeza">
          <div className="fila">
            <div style={{ minWidth: 0, flex: '1 1 320px' }}>
              <h1>{p.nombre}</h1>
              <div className="meta">
                <span>
                  {fecha(p.inicio)} → {fecha(p.fin)}
                </span>
                <span>{plan.actividades.length} actividades · {plan.personas.length} personas</span>
                <span>Actualizado {frescura(p.actualizado)}</span>
                <span title={ROL_PUEDE[grupo.rol]}>Tu rol aquí: {ROL_NOMBRE[grupo.rol]}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gap: 10, minWidth: 220, flex: '0 1 280px' }}>
              <Salud salud={p.salud} />
              <Avance real={p.avance.real} esperado={p.avance.esperado} />
            </div>
          </div>

          <nav className="pt-pestanas" aria-label="Vistas del plan">
            {VISTAS.map((v) => (
              <Link
                key={v}
                href={v === 'resumen' ? `/app/${id}` : `/app/${id}?v=${v}`}
                aria-current={v === vista ? 'page' : undefined}
              >
                {VISTA_NOMBRE[v]}
              </Link>
            ))}
          </nav>
        </div>

        {vista === 'resumen' && <Resumen plan={plan} />}
        {vista === 'tablero' && <Tablero plan={plan} />}
        {vista === 'gantt' && <Gantt plan={plan} />}
        {vista === 'ruta' && <Ruta plan={plan} />}
        {vista === 'equipo' && <Equipo plan={plan} />}
        {vista === 'bitacora' && <Bitacora plan={plan} />}
      </main>

      <Pie />
    </>
  )
}
