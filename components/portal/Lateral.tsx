'use client'

/**
 * La barra lateral del portal (decisiones/2026-11-18-menu-por-modulos).
 *
 *   Inicio                    ← el centro de comando
 *   MÓDULOS
 *     Personal
 *     Familia      ▸ cada familia
 *     Profesional  ▸ cada grupo de trabajo
 *     PMO          ▸ cada proyecto
 *     Kore · TCGBusters …
 *   Plan y uso · Configuración · (Admin)
 *
 * Todo lo que se contrata es un módulo y se ve igual; dentro de cada uno, sus
 * espacios con sangría. Lo que el plan no trae se ve con candado y lleva a
 * contratarlo. En el teléfono la barra se vuelve pestañas abajo.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/Logo'
import { Apariencia } from '@/components/cristal/Apariencia'
import type { Cristal } from '@/lib/cristal'

export type Espacio = { id: string; nombre: string; href: string }
export type Espacios = {
  familias: Espacio[]
  grupos: Espacio[]
  proyectos: Espacio[]
  /** Kore, TCGBusters…: lo que dice `/portal/modulos`. */
  apps?: Array<{ clave: string; nombre: string; estado: 'encendido' | 'apagado' | 'pronto' }>
  /** El nombre del plan que lo trae, si está apagado. */
  bloqueo: { personal?: string | null; familia?: string | null; grupos?: string | null; proyectos?: string | null }
}

type Icono = keyof typeof ICONO
type Modulo = {
  clave: string
  texto: string
  icono: Icono
  href: string
  activa: (r: string) => boolean
  candado?: string | null
  nota?: string
  hijos?: Array<{ href: string; texto: string; activa: (r: string) => boolean }>
}

const ICONO = {
  inicio: <path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z" />,
  personal: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20a7 7 0 0114 0" /></>,
  familia: <><circle cx="8.5" cy="9" r="2.8" /><circle cx="16" cy="9.5" r="2.3" /><path d="M3.5 19.5a5 5 0 0110 0M13 19.5a4 4 0 017.5-1.5" /></>,
  profesional: <><rect x="3.5" y="7.5" width="17" height="12" rx="2.5" /><path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5M3.5 12.5h17" /></>,
  pmo: <><rect x="3.5" y="4" width="17" height="16" rx="2.5" /><path d="M8 9h5M8 13h8M8 17h3" /></>,
  kore: <path d="M3.5 12h4l2-5 4 10 2-5h5" />,
  tcgbusters: <><rect x="5" y="3.5" width="11" height="15" rx="2" /><path d="M9 20.5h8a2 2 0 002-2v-11" /></>,
  app: <><rect x="4" y="4" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="3.25" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" /></>,
  plan: <><rect x="3.5" y="6" width="17" height="12" rx="2.5" /><path d="M3.5 10h17" /></>,
  ajustes: <><circle cx="12" cy="12" r="3" /><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6" /></>,
  admin: <path d="M12 3.5l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-5z" />,
}

const empieza = (...xs: string[]) => (r: string) => xs.some(x => r === x || r.startsWith(x + '/'))
const exacta = (x: string) => (r: string) => r === x || r.startsWith(x + '/')
const ABIERTOS = 'zaelyn.lateral.cerrados'

function Svg({ i }: { i: Icono }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONO[i]}</svg>
}
function Candado({ plan }: { plan: string }) {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-label={`Lo trae ${plan}`}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
}

export function Lateral({ admin, ejemplo, quien, cristal, espacios }: { admin: boolean; ejemplo: boolean; quien: string | null; cristal: Cristal; espacios: Espacios }) {
  const ruta = usePathname()
  const b = espacios.bloqueo
  // Qué módulos están plegados (se recuerda en este navegador).
  const [cerrados, setCerrados] = useState<Set<string>>(new Set())
  useEffect(() => {
    try { setCerrados(new Set(JSON.parse(window.localStorage.getItem(ABIERTOS) ?? '[]') as string[])) } catch { /* nada */ }
  }, [])
  const plegar = (k: string) => setCerrados(s => {
    const n = new Set(s)
    if (n.has(k)) n.delete(k); else n.add(k)
    try { window.localStorage.setItem(ABIERTOS, JSON.stringify([...n])) } catch { /* nada */ }
    return n
  })

  const hijos = (xs: Espacio[]) => xs.map(x => ({ href: x.href, texto: x.nombre, activa: ejemplo ? (r: string) => r === x.href : exacta(x.href) }))
  const modulos: Modulo[] = ejemplo
    ? [
      { clave: 'personal', texto: 'Personal', icono: 'personal', href: '/demo/personal', activa: empieza('/demo/personal') },
      { clave: 'familia', texto: 'Familia', icono: 'familia', href: '/demo/familia', activa: () => false, hijos: hijos(espacios.familias) },
      { clave: 'profesional', texto: 'Profesional', icono: 'profesional', href: '/demo/inicio', activa: () => false, hijos: hijos(espacios.grupos) },
      { clave: 'pmo', texto: 'PMO', icono: 'pmo', href: '/demo', activa: () => false, hijos: hijos(espacios.proyectos) },
    ]
    : [
      { clave: 'personal', texto: 'Personal', icono: 'personal', href: '/app/personal', activa: empieza('/app/personal', '/app/horas', '/app/mensajes'), candado: b.personal },
      { clave: 'familia', texto: 'Familia', icono: 'familia', href: '/app/familia', activa: r => r === '/app/familia', candado: espacios.familias.length ? null : b.familia, hijos: hijos(espacios.familias) },
      {
        clave: 'profesional', texto: 'Profesional', icono: 'profesional', activa: () => false, hijos: hijos(espacios.grupos),
        candado: espacios.grupos.length ? null : (b.grupos ?? 'Zaelyn Profesional'),
        href: espacios.grupos[0]?.href ?? '/profesional',
      },
      { clave: 'pmo', texto: 'PMO', icono: 'pmo', href: '/app/proyectos', activa: empieza('/app/proyectos', '/app/editor'), candado: espacios.proyectos.length ? null : b.proyectos, hijos: hijos(espacios.proyectos) },
      ...(espacios.apps ?? []).map(a => ({
        clave: a.clave, texto: a.nombre, icono: (a.clave in ICONO ? a.clave : 'app') as Icono, href: '/app/apps', activa: () => false,
        nota: a.estado === 'encendido' ? undefined : a.estado === 'pronto' ? 'Pronto' : 'Encender',
      })),
    ]
  const cuenta: Modulo[] = ejemplo ? [] : [
    { clave: 'plan', texto: 'Plan y uso', icono: 'plan', href: '/app/plan', activa: empieza('/app/plan', '/app/organizacion') },
    { clave: 'ajustes', texto: 'Configuración', icono: 'ajustes', href: '/app/configuracion', activa: empieza('/app/configuracion', '/app/cuenta', '/app/apps') },
    ...(admin ? [{ clave: 'admin', texto: 'Admin', icono: 'admin' as Icono, href: '/admin', activa: empieza('/admin') }] : []),
  ]
  const inicio: Modulo = { clave: 'inicio', texto: 'Inicio', icono: 'inicio', href: ejemplo ? '/demo/inicio' : '/app', activa: ejemplo ? empieza('/demo/inicio') : r => r === '/app' }

  // Una fila: hueco de 20 px con el ícono, la misma letra y altura para todas.
  const FILA = 'flex h-10 min-w-0 flex-1 items-center gap-3 rounded-[12px] px-3 text-[14.5px] no-underline transition-colors'
  const estilo = (on: boolean, apagado?: boolean) => on ? 'bg-superficie font-semibold text-tinta shadow-z1' : `${apagado ? 'text-tinta-3' : 'text-tinta-2'} hover:bg-sel hover:text-tinta`

  const fila = (m: Modulo) => {
    const dentro = m.hijos?.some(h => h.activa(ruta)) ?? false
    const on = m.activa(ruta)
    const conHijos = !m.candado && (m.hijos?.length ?? 0) > 0
    const abierto = conHijos && (!cerrados.has(m.clave) || dentro)
    return (
      <li key={m.clave} className="flex flex-col">
        <div className="flex items-center">
          <Link href={m.candado ? (ejemplo ? '/precios' : '/app/plan') : m.href} aria-current={on ? 'page' : undefined}
            title={m.candado ? `Lo trae ${m.candado}` : undefined} className={`${FILA} ${estilo(on, !!m.candado)} ${dentro && !on ? 'text-tinta' : ''}`}>
            <span className="grid size-5 flex-none place-items-center"><Svg i={m.icono} /></span>
            <span className="min-w-0 flex-1 truncate">{m.texto}</span>
            {m.candado && <Candado plan={m.candado} />}
            {m.nota && <span className="text-[11.5px] text-tinta-3">{m.nota}</span>}
          </Link>
          {conHijos && (
            <button type="button" onClick={() => plegar(m.clave)} aria-expanded={abierto} aria-label={`${abierto ? 'Plegar' : 'Desplegar'} ${m.texto}`}
              className="grid size-8 flex-none cursor-pointer place-items-center rounded-full border-0 bg-transparent text-tinta-3 hover:bg-sel hover:text-tinta">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ transform: abierto ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}><path d="M9 6l6 6-6 6" /></svg>
            </button>
          )}
        </div>
        {abierto && (
          <ul className="m-0 ml-[21px] flex list-none flex-col gap-0.5 border-l border-linea py-0.5 pl-2.5">
            {m.hijos!.map(h => {
              const hon = h.activa(ruta)
              return (
                <li key={h.href}>
                  <Link href={h.href} aria-current={hon ? 'page' : undefined}
                    className={`flex h-9 items-center rounded-[10px] px-2.5 text-[14px] no-underline transition-colors ${hon ? 'bg-superficie font-semibold text-tinta shadow-z1' : 'text-tinta-2 hover:bg-sel hover:text-tinta'}`}>
                    <span className="min-w-0 truncate">{h.texto}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </li>
    )
  }
  const principales = [inicio, ...modulos.filter(m => !m.candado).slice(0, 3)]

  return (
    <>
      <aside className="pt-lateral fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col gap-1 border-r border-linea bg-superficie-2 px-3.5 py-6 lg:flex" aria-label="Secciones">
        <Link href={ejemplo ? '/' : '/app'} className="px-3 pb-5 text-tinta no-underline" aria-label="zælyn, inicio">
          <Logo ancho={96} />
        </Link>
        <div className="-mx-1 flex min-h-0 flex-1 flex-col overflow-y-auto px-1" style={{ maskImage: 'linear-gradient(to bottom, #000 calc(100% - 24px), transparent)', WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 24px), transparent)' }}>
          <ul className="m-0 flex list-none flex-col p-0" aria-label="Inicio">{fila(inicio)}</ul>
          <nav className="flex flex-col pt-5" aria-label="Módulos">
            <span className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-tinta-3 uppercase">Módulos</span>
            <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{modulos.map(fila)}</ul>
          </nav>
          {cuenta.length > 0 && (
            <nav className="flex flex-col pt-5 pb-4" aria-label="Cuenta">
              <span className="px-3 pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-tinta-3 uppercase">Cuenta</span>
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{cuenta.map(fila)}</ul>
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
                <Link href="/app/cuenta" className="min-w-0 flex-1 truncate text-[14px] font-semibold text-tinta no-underline" title="Perfil">{quien ?? 'Tu cuenta'}</Link>
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
        {principales.map(x => {
          const on = x.activa(ruta) || (x.hijos?.some(h => h.activa(ruta)) ?? false)
          return (
            <Link key={x.clave} href={x.href} aria-current={on ? 'page' : undefined} aria-label={x.texto}
              className={`flex h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[11px] text-tinta no-underline ${on ? 'bg-sel font-semibold' : ''}`}>
              <Svg i={x.icono} />
              {x.texto}
            </Link>
          )
        })}
        {!ejemplo && (
          <Link href="/app/configuracion" aria-label="Más" className="flex h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-full px-2 text-[11px] text-tinta no-underline">
            <Svg i="app" />
            Más
          </Link>
        )}
      </nav>
    </>
  )
}
