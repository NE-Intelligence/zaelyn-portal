'use client'

/**
 * Apariencia (decisiones/2026-11-11-cristal): el panel de vidrio donde quien
 * mira ajusta el portal a su gusto. Día, noche o sistema; la paleta pastel;
 * el material del vidrio (tres preajustes y cinco controles finos); y si las
 * tarjetas flotan y el fondo 3D se mueve. Todo se ve al instante y se guarda
 * en cookies de preferencia (`zt` el tema, `zc` lo demás) para que la
 * siguiente página ya salga así.
 */
import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  COOKIE_CRISTAL, CRISTAL_FABRICA, PALETAS, PRESETS, aCookie, normalizar, variables,
  type Cristal, type Material, type Paleta, LETRAS, type Letra } from '@/lib/cristal'

type Tema = 'claro' | 'oscuro' | 'sistema'
const ANIO = 'path=/; max-age=31536000; samesite=lax'

function aplicar(c: Cristal) {
  const h = document.documentElement
  h.dataset.paleta = c.paleta
  if (c.flotar) delete h.dataset.flotar
  else h.dataset.flotar = 'no'
  if (c.fondo3d) delete h.dataset.fondo3d
  else h.dataset.fondo3d = 'no'
  for (const [k, v] of Object.entries(variables(c.material))) h.style.setProperty(k, v)
  h.style.setProperty('--zy-esc', String(LETRAS[c.letra].escala))
  document.cookie = `${COOKIE_CRISTAL}=${aCookie(c)}; ${ANIO}`
}

const CONTROLES: Array<{ k: keyof Omit<Material, 'tinte'>; nombre: string; min: number; max: number; paso: number; ver: (v: number) => string }> = [
  { k: 'blur', nombre: 'Desenfoque', min: 0, max: 40, paso: 1, ver: v => `${Math.round(v)} px` },
  { k: 'opacidad', nombre: 'Opacidad', min: 0.08, max: 0.9, paso: 0.01, ver: v => `${Math.round(v * 100)}%` },
  { k: 'saturacion', nombre: 'Saturación', min: 0.5, max: 2, paso: 0.05, ver: v => `${Math.round(v * 100)}%` },
  { k: 'borde', nombre: 'Luz del borde', min: 0, max: 1, paso: 0.05, ver: v => `${Math.round(v * 100)}%` },
]

export function Apariencia({ inicial, compacto = false }: { inicial: Cristal; compacto?: boolean }) {
  const [abierto, setAbierto] = useState(false)
  const [c, setC] = useState<Cristal>(inicial)
  const [tema, setTema] = useState<Tema>('sistema')
  const id = useId()
  const boton = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = document.documentElement.dataset.tema
    setTema(t === 'claro' || t === 'oscuro' ? t : 'sistema')
  }, [])
  useEffect(() => {
    if (!abierto) return
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus()
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setAbierto(false); boton.current?.focus() } }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [abierto])

  const cambiar = (parche: Partial<Cristal> | ((x: Cristal) => Cristal)) => {
    setC(prev => {
      const sig = normalizar(typeof parche === 'function' ? parche(prev) : { ...prev, ...parche })
      aplicar(sig)
      return sig
    })
  }
  const material = (m: Partial<Material>) => cambiar(x => ({ ...x, material: { ...x.material, ...m } }))
  const ponerTema = (t: Tema) => {
    setTema(t)
    const h = document.documentElement
    if (t === 'sistema') delete h.dataset.tema
    else h.dataset.tema = t
    document.cookie = `zt=${t}; ${ANIO}`
  }

  const seg = (on: boolean) =>
    `h-9 flex-1 cursor-pointer rounded-full border-0 text-[13px] ${on ? 'bg-superficie font-semibold text-tinta shadow-z1' : 'bg-transparent text-tinta-2'}`

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto(a => !a)}
        aria-expanded={abierto}
        aria-controls={id}
        className={compacto
          ? 'grid size-10 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-tinta-2 hover:bg-sel'
          : 'flex h-11 w-full cursor-pointer items-center gap-3 rounded-[14px] border-0 bg-transparent px-3.5 text-[15px] text-tinta-2 hover:bg-sel'}
        aria-label={compacto ? 'Apariencia' : undefined}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" />
        </svg>
        {!compacto && 'Apariencia'}
      </button>

      {abierto && createPortal(
        <div
          ref={panel}
          id={id}
          role="dialog"
          aria-label="Apariencia"
          className="cr-vidrio cr-panel fixed bottom-6 left-6 z-50 flex max-h-[calc(100dvh-48px)] w-[340px] max-w-[calc(100vw-48px)] flex-col gap-5 overflow-y-auto rounded-[28px] p-6 text-tinta lg:left-[268px]"
          style={{ boxShadow: 'var(--z-sombra-2)' }}
        >
          <div className="flex items-center gap-3">
            <span className="z-orbe size-8" aria-hidden="true" />
            <div className="flex-1">
              <h2 className="cr-titulo text-[24px] leading-none">Apariencia</h2>
              <p className="mt-1 text-[12.5px] text-tinta-3">Se guarda en este navegador.</p>
            </div>
            <button type="button" onClick={() => { setAbierto(false); boton.current?.focus() }}
              className="grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-superficie-2 text-[18px] text-tinta" aria-label="Cerrar">×</button>
          </div>

          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2 p-0 text-[12.5px] font-medium text-tinta-3">Luz</legend>
            <div className="flex gap-1 rounded-full bg-superficie-2 p-1">
              {(['claro', 'oscuro', 'sistema'] as Tema[]).map(t => (
                <button key={t} type="button" aria-pressed={tema === t} onClick={() => ponerTema(t)} className={seg(tema === t)}>
                  {t === 'claro' ? 'Día' : t === 'oscuro' ? 'Noche' : 'Sistema'}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2 p-0 text-[12.5px] font-medium text-tinta-3">Paleta</legend>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(PALETAS) as Paleta[]).map(p => (
                <button key={p} type="button" aria-pressed={c.paleta === p} onClick={() => cambiar({ paleta: p })}
                  className="flex cursor-pointer flex-col items-center gap-1.5 border-0 bg-transparent p-0 text-[11.5px] text-tinta-2">
                  <span className="relative size-11 rounded-full"
                    style={{
                      background: `conic-gradient(from 200deg, ${PALETAS[p].muestra.join(', ')}, ${PALETAS[p].muestra[0]})`,
                      boxShadow: c.paleta === p ? '0 0 0 2px var(--z-bg), 0 0 0 3.5px var(--z-ink)' : 'inset 0 0 0 1px rgba(0,0,0,.06)',
                    }} />
                  <span className={c.paleta === p ? 'font-semibold text-tinta' : ''}>{PALETAS[p].nombre}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
            <legend className="mb-2 p-0 text-[12.5px] font-medium text-tinta-3">Vidrio</legend>
            <div className="flex gap-2">
              {PRESETS.map(p => {
                const on = Object.entries(p.material).every(([k, v]) => c.material[k as keyof Material] === v)
                return <button key={p.nombre} type="button" aria-pressed={on} onClick={() => material(p.material)} className="cr-chip flex-1 justify-center">{p.nombre}</button>
              })}
            </div>
            {CONTROLES.map(x => (
              <label key={x.k} className="flex flex-col gap-1 text-[13px]">
                <span className="flex justify-between"><span>{x.nombre}</span><output className="tabular-nums text-tinta-3">{x.ver(c.material[x.k])}</output></span>
                <input className="cr-rango" type="range" min={x.min} max={x.max} step={x.paso} value={c.material[x.k]}
                  onChange={e => material({ [x.k]: Number(e.target.value) })} />
              </label>
            ))}
            <label className="flex items-center justify-between text-[13px]">
              Tinte del vidrio
              <input type="color" value={c.material.tinte} onChange={e => material({ tinte: e.target.value })}
                className="h-8 w-12 cursor-pointer rounded-full border-0 bg-transparent p-0" />
            </label>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2 p-0 text-[12.5px] font-medium text-tinta-3">Movimiento</legend>
            {([['flotar', 'Tarjetas que flotan y respiran'], ['fondo3d', 'Cuerpo de vidrio al fondo']] as const).map(([k, nombre]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between gap-3 text-[13.5px]">
                {nombre}
                <input type="checkbox" role="switch" checked={c[k]} onChange={e => cambiar({ [k]: e.target.checked })}
                  className="h-5 w-9 cursor-pointer accent-[var(--z-ink)]" />
              </label>
            ))}
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
            <legend className="mb-2 p-0 text-[12.5px] font-medium text-tinta-3">Tamaño de Zaelyn en el portal</legend>
            <div className="flex gap-1.5" role="radiogroup" aria-label="Tamaño de Zaelyn en el portal">
              {(Object.keys(LETRAS) as Letra[]).map(k => (
                <button key={k} type="button" role="radio" aria-checked={c.letra === k} onClick={() => cambiar({ letra: k })}
                  className={`h-9 flex-1 cursor-pointer rounded-full border-0 text-[13px] ${c.letra === k ? 'bg-tinta text-superficie' : 'bg-superficie-2 text-tinta'}`}>
                  {LETRAS[k].nombre}
                </button>
              ))}
            </div>
          </fieldset>

          <button type="button" onClick={() => cambiar(CRISTAL_FABRICA)}
            className="h-10 cursor-pointer rounded-full border-0 bg-superficie-2 text-[13.5px] text-tinta">Volver a lo de fábrica</button>
        </div>,
        document.body,
      )}
    </>
  )
}
