import Link from 'next/link'
import { Barra } from '@/components/portal/Marco'
import { SinSesion } from '@/components/portal/SinSesion'
import { gruposArchivados, misGrupos } from '@/lib/api'
import { Archivados } from '@/components/portal/Archivados'
import { ROL_PUEDE } from '@/lib/plan'
import { nombreDeRol } from '@/lib/plan-uso/tipos'
import { fecha } from '@/components/portal/atomos'
import { textos } from '@/lib/copy'
import { idiomaActual } from '@/lib/preferencias'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Proyectos' }

/**
 * `/app/proyectos` — la casa de Proyectos (#186): los grupos de trabajo, sus
 * planes con atajos directos a cada vista, y el editor.
 *
 * Los grupos de familia ya no aparecen aquí: tienen su propia casa.
 */
export default async function Proyectos({ searchParams }: { searchParams: Promise<{ archivado?: string }> }) {
  const [r, lang, arch, q] = await Promise.all([misGrupos(), idiomaActual(), gruposArchivados(), searchParams])
  if (!r.ok) return <SinSesion fallo={r.fallo} />
  const t = textos(lang)
  const trabajo = r.dato.grupos.filter((g) => g.clase === 'work')
  const otros = r.dato.grupos.filter((g) => g.clase !== 'work' && g.clase !== 'family')

  const conPlanes = [...trabajo, ...otros.filter((g) => g.planes.length > 0)]
  const fila = 'grid grid-cols-[1fr_auto_16px] items-center gap-6 border-b border-linea px-6 py-5 text-tinta no-underline last:border-0 hover:bg-superficie-2'

  return (
    <>
      <Barra area="proyectos" sesion />
      <main className="mx-auto flex w-full max-w-[1080px] flex-col gap-8 px-6 pt-12 pb-20 text-tinta sm:px-14">
        <header className="flex flex-wrap items-end gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="flex items-center gap-2 text-[14px] text-tinta-3"><span className="size-[9px] rounded-full bg-proyectos" aria-hidden="true" />PMO</span>
            <h1 className="text-[34px] font-semibold sm:text-[40px]" style={{ letterSpacing: '-0.04em' }}>Tus proyectos</h1>
          </div>
          <Link href="/app/editor" className="inline-flex h-11 items-center rounded-full bg-superficie px-5 text-[15px] font-medium text-tinta no-underline shadow-[0_0_0_1px_var(--z-line)]">{t('po.pr.mios')}</Link>
          <Link href="/app/editor/nuevo" className="inline-flex h-11 items-center rounded-full bg-pri px-5 text-[15px] font-semibold text-sobre-pri no-underline">{t('po.pr.nuevo')}</Link>
        </header>

        {q.archivado && <p className="rounded-[18px] bg-superficie-2 px-5 py-3.5 text-[15px]">Listo: el grupo quedó archivado. Si te arrepientes, lo recuperas abajo.</p>}

        {trabajo.length + otros.length === 0 && (
          <div className="flex max-w-[560px] flex-col gap-2 rounded-[26px] bg-superficie p-8 shadow-z1">
            <b className="text-[18px]">{t('po.pr.vacio.t')}</b>
            <span className="text-[15px] text-tinta-2">{t('po.pr.vacio.p')}</span>
            <Link href="/demo" className="pt-2 text-[15px] font-semibold text-tinta no-underline">{t('po.ejemplo.ver')} ›</Link>
          </div>
        )}

        {conPlanes.map((g) => (
          <section key={g.id} className="flex flex-col gap-3" aria-label={g.nombre}>
            <div className="flex flex-wrap items-center gap-3 px-1">
              <h2 className="text-[18px] font-semibold">{g.nombre}</h2>
              {g.rol && <span className="text-[13px] text-tinta-3" title={ROL_PUEDE[g.rol] ?? undefined}>{nombreDeRol(g.rol)}</span>}
              <Link href={`/app/g/${g.id}/editor`} className="ml-auto text-[14px] text-tinta-2 no-underline hover:text-tinta">{t('po.pr.editor')}</Link>
              <Link href={`/app/g/${g.id}/ajustes`} className="text-[14px] text-tinta-2 no-underline hover:text-tinta">Ajustes</Link>
            </div>
            <div className="overflow-hidden rounded-[26px] bg-superficie shadow-z1">
              {g.planes.map((p) => (
                <Link key={p.id} href={`/app/g/${g.id}/${p.id}`} className={fila}>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-[17px] font-semibold" style={{ letterSpacing: '-0.02em' }}>{p.nombre}</span>
                    <span className="text-[14px] text-tinta-3">{p.abiertos} {t('po.abiertas')}{p.hasta && ` · hasta ${fecha(p.hasta)}`}</span>
                  </span>
                  {p.vencidos > 0
                    ? <span className="inline-flex items-center gap-1.5 rounded-full bg-det-bg px-3 py-1 text-[13px] font-medium text-det-tinta"><span className="size-1.5 rounded-full bg-current" />{p.vencidos} {t('po.vencidas')}</span>
                    : <span className="inline-flex items-center gap-1.5 rounded-full bg-hecha-bg px-3 py-1 text-[13px] font-medium text-hecha-tinta"><span className="size-1.5 rounded-full bg-current" />Sin vencidas</span>}
                  <span className="text-tinta-3" aria-hidden="true">›</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {otros.filter((g) => g.planes.length === 0).length > 0 && (
          <section className="pt-seccion-area">
            <h2 className="pt-overline">{t('po.pr.otros')}</h2>
            <p style={{ margin: 0, color: 'var(--ink-2)' }}>{t('po.pr.otros.d')}</p>
            <div className="pt-lista-enlaces" style={{ maxWidth: 560 }}>
              {otros.filter((g) => g.planes.length === 0).map((g) => (
                <Link key={g.id} href={`/app/g/${g.id}/editor`}><span>{g.nombre}</span><small>{t('po.pr.editor')} →</small></Link>
              ))}
            </div>
          </section>
        )}
        {arch.ok && <Archivados lista={arch.dato.archivados} dias={arch.dato.dias} />}
      </main>
    </>
  )
}
