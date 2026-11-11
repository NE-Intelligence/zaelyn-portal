'use client'

/**
 * La barra lateral del portal (decisiones/2026-11-10-landings-y-portal):
 * Inicio · Personal · Familia · PMO · Apps, y abajo Configuración · Cuenta ·
 * Admin. Zaelyn no es una sección: es el orbe (Riel.tsx).
 *
 * En el teléfono la barra se vuelve pestañas abajo, como la app: Inicio,
 * Personal, Familia y PMO, y «Más» lleva a lo demás.
 *
 * En el ejemplo (/demo…) las secciones llevan a los tres ejemplos y no hay
 * Apps, Configuración ni Cuenta: no hay una persona detrás.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'

type Item = { href: string; texto: string; punto?: string; icono?: 'inicio' | 'apps'; activa: (r: string) => boolean }

const ICONO = {
  inicio: <path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z" />,
  apps: <><rect x="4" y="4" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="3.25" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" /></>,
}

const empieza = (...xs: string[]) => (r: string) => xs.some(x => r === x || r.startsWith(x + '/'))

export function Lateral({ admin, ejemplo, quien }: { admin: boolean; ejemplo: boolean; quien: string | null }) {
  const ruta = usePathname()
  const principales: Item[] = ejemplo
    ? [
      { href: '/demo/personal', texto: 'Personal', punto: 'var(--z-personal)', activa: empieza('/demo/personal') },
      { href: '/demo/familia', texto: 'Familia', punto: 'var(--z-familia)', activa: empieza('/demo/familia') },
      { href: '/demo', texto: 'PMO', punto: 'var(--z-proyectos)', activa: r => r === '/demo' },
    ]
    : [
      { href: '/app', texto: 'Inicio', icono: 'inicio', activa: r => r === '/app' },
      { href: '/app/personal', texto: 'Personal', punto: 'var(--z-personal)', activa: empieza('/app/personal', '/app/horas') },
      { href: '/app/familia', texto: 'Familia', punto: 'var(--z-familia)', activa: empieza('/app/familia', '/app/f') },
      { href: '/app/proyectos', texto: 'PMO', punto: 'var(--z-proyectos)', activa: empieza('/app/proyectos', '/app/g', '/app/editor') },
      { href: '/app/apps', texto: 'Apps', icono: 'apps', activa: empieza('/app/apps') },
    ]
  const ajustes: Item[] = ejemplo
    ? []
    : [
      { href: '/app/configuracion', texto: 'Configuración', activa: empieza('/app/configuracion') },
      { href: '/app/cuenta', texto: 'Cuenta', activa: empieza('/app/cuenta', '/app/plan', '/app/organizacion', '/app/participaciones', '/app/acceso') },
      ...(admin ? [{ href: '/admin', texto: 'Admin', activa: empieza('/admin') }] : []),
    ]

  const fila = (x: Item, chica = false) => {
    const on = x.activa(ruta)
    return (
      <Link
        key={x.href}
        href={x.href}
        aria-current={on ? 'page' : undefined}
        className={`flex h-11 items-center gap-3 rounded-[14px] px-3.5 text-[15px] no-underline transition-colors ${on ? 'bg-superficie font-semibold text-tinta shadow-z1' : `${chica ? 'text-tinta-2' : 'text-tinta'} hover:bg-sel`}`}
      >
        {x.punto && <span className="size-[9px] flex-none rounded-full" style={{ background: x.punto }} aria-hidden="true" />}
        {x.icono && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONO[x.icono]}</svg>
        )}
        {x.texto}
      </Link>
    )
  }

  return (
    <>
      <aside className="pt-lateral fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col gap-1 border-r border-linea bg-superficie-2 px-3.5 py-6 lg:flex" aria-label="Secciones">
        <Link href={ejemplo ? '/' : '/app'} className="px-3.5 pb-5 text-tinta no-underline" aria-label="zælyn, inicio">
          <Logo ancho={96} />
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Soluciones">{principales.map(x => fila(x))}</nav>
        {ajustes.length > 0 && (
          <>
            <div className="mx-3.5 my-3.5 h-px bg-linea" />
            <nav className="flex flex-col gap-1" aria-label="Ajustes">{ajustes.map(x => fila(x, true))}</nav>
          </>
        )}
        <div className="mt-auto flex flex-col gap-2 px-1.5">
          {ejemplo
            ? <Link href="/app" className="inline-flex h-11 items-center justify-center rounded-full bg-pri text-[15px] font-semibold text-sobre-pri no-underline">Entrar</Link>
            : (
              <div className="flex items-center gap-3 px-2">
                <span className="grid size-[34px] place-items-center rounded-full bg-pri text-[13px] font-semibold text-sobre-pri" aria-hidden="true">
                  {(quien ?? '·').replace(/^@/, '').slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{quien ?? 'Tu cuenta'}</span>
                {/* Un FORMULARIO y no un enlace: ver `app/salir/route.ts`. */}
                <form action="/salir" method="post" className="contents">
                  <button type="submit" className="cursor-pointer rounded-full border-0 bg-transparent px-2 py-1 text-[13px] text-tinta-2 hover:bg-sel">Salir</button>
                </form>
              </div>
            )}
        </div>
      </aside>

      {/* Teléfono: pestañas abajo, como la app */}
      <nav className="pt-pestanas-abajo fixed inset-x-4 bottom-4 z-30 flex h-16 items-center justify-between rounded-full bg-superficie/95 px-2 shadow-z2 backdrop-blur lg:hidden" aria-label="Secciones">
        {principales.filter(x => x.texto !== 'Apps').map(x => {
          const on = x.activa(ruta)
          return (
            <Link key={x.href} href={x.href} aria-current={on ? 'page' : undefined} aria-label={x.texto}
              className={`flex h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[11px] text-tinta no-underline ${on ? 'bg-sel font-semibold' : ''}`}>
              {x.punto
                ? <span className="size-2.5 rounded-full" style={{ background: x.punto }} aria-hidden="true" />
                : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONO.inicio}</svg>}
              {x.texto}
            </Link>
          )
        })}
        {!ejemplo && (
          <Link href="/app/configuracion" aria-label="Más" className="flex h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[11px] text-tinta no-underline">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">{ICONO.apps}</svg>
            Más
          </Link>
        )}
      </nav>
    </>
  )
}
