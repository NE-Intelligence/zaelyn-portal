import Link from 'next/link'
import { Barra, Pie } from '@/components/portal/Marco'
import { Avance, Salud } from '@/components/portal/atomos'
import { GRUPOS } from '@/lib/demo'
import { ROL_NOMBRE, ROL_PUEDE } from '@/lib/plan'

/**
 * La portada del portal: los grupos de la persona y los planes de cada uno.
 *
 * En Zaelyn un proyecto ES un grupo, y la familia también es un grupo. Por eso
 * aquí conviven: lo que cambia entre uno y otro no es el modelo, es qué vistas
 * tiene el lienzo. Familia y Personal aparecen con su lugar marcado.
 */
export default function Grupos() {
  const proyectos = GRUPOS.filter((g) => g.tipo === 'proyecto')
  const otros = GRUPOS.filter((g) => g.tipo !== 'proyecto')

  return (
    <>
      <Barra migas={[{ texto: 'Mis grupos' }]} />

      <main className="pt-lienzo">
        <div className="pt-cabeza">
          <div className="fila">
            <div style={{ minWidth: 0 }}>
              <h1>Mis grupos</h1>
              <div className="meta">
                <span>
                  {proyectos.length} de proyecto · {otros.length} más
                </span>
                <span>El rol se da por grupo, y quien lo cambia es quien administra</span>
              </div>
            </div>
          </div>
        </div>

        <section style={{ display: 'grid', gap: 16 }}>
          <h2 className="pt-overline">Proyectos</h2>
          <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))' }}>
            {proyectos.map((g) => (
              <article className="pt-grupo" key={g.id}>
                <header>
                  <h2>{g.nombre}</h2>
                  <span style={{ marginLeft: 'auto' }} className="pt-rol" title={ROL_PUEDE[g.rol]}>
                    {ROL_NOMBRE[g.rol]}
                  </span>
                </header>
                {g.planes.map((p) => (
                  <Link className="pt-plan" href={`/app/${p.id}`} key={p.id}>
                    <div className="t">
                      <span>{p.nombre}</span>
                      <span style={{ marginLeft: 'auto' }}>
                        <Salud salud={p.salud} />
                      </span>
                    </div>
                    <Avance real={p.avance} esperado={p.esperado} />
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{p.abiertos} actividades abiertas</div>
                  </Link>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gap: 16 }}>
          <h2 className="pt-overline">Lo demás que Zaelyn te lleva</h2>
          <div className="pt-rejilla" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))' }}>
            {otros.map((g) => (
              <article className="pt-grupo" key={g.id}>
                <header>
                  <h2>{g.nombre}</h2>
                  <span style={{ marginLeft: 'auto' }} className="pt-rol">
                    {ROL_NOMBRE[g.rol]}
                  </span>
                </header>
                <div className="pt-vacio">
                  <b>{g.tipo === 'familia' ? 'Familia' : 'Personal'}: todavía sin pantalla</b>
                  <span>
                    {g.tipo === 'familia'
                      ? 'Quién lleva, quién recoge y las actividades de los hijos ya funcionan en el chat. La vista de este grupo se diseña después del portal de proyectos.'
                      : 'Tus recordatorios, notas y hábitos ya funcionan en el chat. Aquí van a vivir tu día y tu semana.'}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Pie />
    </>
  )
}
