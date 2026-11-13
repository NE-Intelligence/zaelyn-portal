'use client'

/**
 * La barra lateral del portal por planes y módulos
 * (decisiones/2026-11-13-planes-por-ambito):
 *
 *   Inicio · Chat
 *   Personal (Metas incluidas)
 *   una entrada por Familia, por Grupo de trabajo y por Proyecto PMO
 *   Módulos
 *   Cuenta: Plan y uso · Configuración · Perfil · Organización · Admin
 *
 * Lo que el plan no trae no se esconde: se ve con candado y «Lo trae …».
 * En el teléfono la barra se vuelve pestañas abajo, como la app.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/Logo'
import { Apariencia } from '@/components/cristal/Apariencia'
import type { Cristal } from '@/lib/cristal'

type Item = { href: string; texto: string; punto?: string; icono?: 'inicio' | 'apps' | 'chat'; activa: (r: string) => boolean; candado?: string | null; accion?: () => void }

export type Espacio = { id: string; nombre: string; href: string }
export type Espacios = {
  familias: Espacio[]
  grupos: Espacio[]
  proyectos: Espacio[]
  /** El nombre del plan que lo trae, si está apagado. */
  bloqueo: { personal?: string | null; familia?: string | null; grupos?: string | null; proyectos?: string | null }
}

const ICONO = {
  inicio: <path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z" />,
  apps: <><rect x="4" y="4" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="3.25" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" /></>,
  chat: <path d="M5 18l-1 3 3.5-1.5A8.5 8.5 0 1012 3.5 8.5 8.5 0 003.5 12c0 1.4.3 2.7 1 3.9" />,
}

const PUNTO = { personal: 'var(--z-personal)', familia: 'var(--z-familia)', grupo: '#2f9c95', proyecto: 'var(--z-proyectos)' }

const empieza = (...xs: string[]) => (r: string) => xs.some(x => r === x || r.startsWith(x + '/'))
const exacta = (x: string) => (r: string) => r === x || r.startsWith(x + '/')

export function Lateral({ admin, ejemplo, quien, cristal, espacios }: { admin: boolean; ejemplo: boolean; quien: string | null; cristal: Cristal; espacios: Espacios }) {
  const ruta = usePathname()
  const abrirChat = () => window.dispatchEvent(new Event('zaelyn:abrir-chat'))
  const b = espacios.bloqueo
  const principales: Item[] = ejemplo
    ? [
      { href: '/demo/inicio', texto: 'Inicio', icono: 'inicio', activa: empieza('/demo/inicio') },
      { href: '/demo/personal', texto: 'Personal', punto: PUNTO.personal, activa: empieza('/demo/personal') },
    ]
    : [
      { href: '/app', texto: 'Inicio', icono: 'inicio', activa: r => r === '/app' },
      { href: '#chat', texto: 'Chat', icono: 'chat', activa: () => false, accion: abrirChat },
      { href: '/app/personal', texto: 'Personal', punto: PUNTO.personal, activa: empieza('/app/personal', '/app/horas', '/app/mensajes'), candado: b.personal },
    ]
  const ambitos: { titulo: string; items: Item[] }[] = [
    {
      titulo: 'Familia',
      items: espacios.familias.length
        ? espacios.familias.map(f => ({ href: f.href, texto: f.nombre, punto: PUNTO.familia, activa: exacta(f.href) }))
        : ejemplo ? [] : [{ href: '/app/familia', texto: 'Familia', punto: PUNTO.familia, activa: empieza('/app/familia'), candado: b.familia }],
    },
    {
      titulo: 'Grupos',
      items: espacios.grupos.length
        ? espacios.grupos.map(g => ({ href: g.href, texto: g.nombre, punto: PUNTO.grupo, activa: exacta(g.href) }))
        : ejemplo ? [] : [{ href: '/profesional', texto: 'Grupos de trabajo', punto: PUNTO.grupo, activa: () => false, candado: b.grupos ?? 'Zaelyn Profesional' }],
    },
    {
      titulo: 'Proyectos',
      items: espacios.proyectos.length
        ? [
          ...espacios.proyectos.map(p => ({ href: p.href, texto: p.nombre, punto: PUNTO.proyecto, activa: ejemplo ? (r: string) => r === p.href : exacta(p.href) })),
          ...(ejemplo ? [] : [{ href: '/app/proyectos', texto: 'Todos los proyectos', activa: empieza('/app/proyectos', '/app/editor') }]),
        ]
        : ejemplo ? [] : [{ href: '/app/proyectos', texto: 'Proyectos PMO', punto: PUNTO.proyecto, activa: empieza('/app/proyectos'), candado: b.proyectos }],
    },
  ].filter(x => x.items.length > 0)
  const finales: Item[] = ejemplo ? [] : [
    { href: '/app/apps', texto: 'Módulos', icono: 'apps', activa: empieza('/app/apps') },
  ]
  const ajustes: Item[] = ejemplo
    ? []
    : [
      { href: '/app/plan', texto: 'Plan y uso', activa: empieza('/app/plan') },
      { href: '/app/configuracion', texto: 'Configuración', activa: empieza('/app/configuracion') },
      { href: '/app/cuenta', texto: 'Perfil', activa: empieza('/app/cuenta', '/app/acceso', '/app/participaciones') },
      { href: '/app/organizacion', texto: 'Organización', activa: empieza('/app/organizacion') },
      ...(admin ? [{ href: '/admin', texto: 'Admin', activa: empieza('/admin') }] : []),
    ]

  const fila = (x: Item, chica = false) => {
    const on = x.activa(ruta)
    const clase = `flex h-11 w-full items-center gap-3 rounded-[14px] px-3.5 text-[15px] no-underline transition-colors ${on ? 'bg-superficie font-semibold text-tinta shadow-z1' : `${chica || x.candado ? 'text-tinta-2' : 'text-tinta'} hover:bg-sel`}`
    if (x.accion) {
      return (
        <button key={x.href} type="button" onClick={x.accion} className={`${clase} cursor-pointer border-0 bg-transparent text-left`}>
          {x.icono && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONO[x.icono]}</svg>}
          {x.texto}
        </button>
      )
    }
    return (
      <Link
        key={x.href}
        title={x.candado ? `Lo trae ${x.candado}` : undefined}
        href={x.candado ? (x.href.startsWith('/app') ? '/app/plan' : x.href) : x.href}
        aria-current={on ? 'page' : undefined}
          className={clase}
      >
        {x.punto && <span className="size-[9px] flex-none rounded-full" style={{ background: x.punto }} aria-hidden="true" />}
        {x.icono && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONO[x.icono]}</svg>
        )}
        <span className="min-w-0 flex-1 truncate">{x.texto}</span>
        {x.candado && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-label={`Lo trae ${x.candado}`}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
        )}
      </Link>
    )
  }

  return (
    <>
      <aside className="pt-lateral fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col gap-1 border-r border-linea bg-superficie-2 px-3.5 py-6 lg:flex" aria-label="Secciones">
        <Link href={ejemplo ? '/' : '/app'} className="px-3.5 pb-5 text-tinta no-underline" aria-label="zælyn, inicio">
          <Logo ancho={96} />
        </Link>
        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
          <nav className="flex flex-col gap-1" aria-label="Principal">{principales.map(x => fila(x))}</nav>
          {ambitos.map(a => (
            <nav key={a.titulo} className="flex flex-col gap-1 pt-3" aria-label={a.titulo}>
              <span className="px-3.5 pb-1 text-[11.5px] font-semibold tracking-[0.06em] text-tinta-3 uppercase">{a.titulo}</span>
              {a.items.map(x => fila(x))}
            </nav>
          ))}
          {finales.length > 0 && <nav className="flex flex-col gap-1 pt-3" aria-label="Módulos">{finales.map(x => fila(x))}</nav>}
          {ajustes.length > 0 && (
            <nav className="flex flex-col gap-1 pt-3" aria-label="Cuenta">
              <span className="px-3.5 pb-1 text-[11.5px] font-semibold tracking-[0.06em] text-tinta-3 uppercase">Cuenta</span>
              {ajustes.map(x => fila(x, true))}
            </nav>
          )}
        </div>
        <div className="mt-2 flex flex-col gap-2 px-1.5">
          <Apariencia inicial={cristal} />
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
        {[
          ...principales.filter(x => !x.accion),
          ...ambitos.map(a => ({ ...a.items[0]!, texto: a.titulo })),
        ].slice(0, 4).map(x => {
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
