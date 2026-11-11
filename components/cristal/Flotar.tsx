'use client'

/**
 * La inclinación al pasar el puntero (decisiones/2026-11-11-cristal). Un solo
 * oyente para todo el portal: busca la `.cr-tarjeta` bajo el puntero y le pone
 * `--rx`, `--ry` (giro de hasta 5°) y `--lx`, `--ly` (dónde va el brillo).
 * Sin puntero fino (teléfonos), con «reducir movimiento» o con el movimiento
 * apagado en Apariencia, no hace nada.
 */
import { useEffect } from 'react'

export function Flotar() {
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let actual: HTMLElement | null = null
    let cuadro = 0
    const soltar = () => {
      if (!actual) return
      actual.style.setProperty('--rx', '0deg')
      actual.style.setProperty('--ry', '0deg')
      actual = null
    }
    const mover = (e: PointerEvent) => {
      if (document.documentElement.dataset.flotar === 'no') return soltar()
      const t = (e.target as Element | null)?.closest?.('.cr-tarjeta') as HTMLElement | null
      if (t !== actual) soltar()
      if (!t) return
      actual = t
      cancelAnimationFrame(cuadro)
      cuadro = requestAnimationFrame(() => {
        const r = t.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width
        const y = (e.clientY - r.top) / r.height
        t.style.setProperty('--ry', `${((x - 0.5) * 7).toFixed(2)}deg`)
        t.style.setProperty('--rx', `${((0.5 - y) * 6).toFixed(2)}deg`)
        t.style.setProperty('--lx', `${(x * 100).toFixed(1)}%`)
        t.style.setProperty('--ly', `${(y * 100).toFixed(1)}%`)
      })
    }
    document.addEventListener('pointermove', mover, { passive: true })
    document.addEventListener('pointerleave', soltar)
    return () => {
      document.removeEventListener('pointermove', mover)
      document.removeEventListener('pointerleave', soltar)
      cancelAnimationFrame(cuadro)
    }
  }, [])
  return null
}
