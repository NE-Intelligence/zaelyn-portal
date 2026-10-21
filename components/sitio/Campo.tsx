'use client'

import { useEffect, useRef } from 'react'

/**
 * Campo de filamentos.
 *
 * El ligado æ del logotipo está hecho de muchas copias finas de una misma
 * curva en lazo. Esto habla el mismo idioma: cintas de líneas de un píxel,
 * desplazadas y con muy poca opacidad. Se apaga con prefers-reduced-motion.
 */
export default function Campo() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return

    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let an = 0
    let al = 0
    let cintas: Cinta[] = []
    let vivo = true
    let cuadroId = 0

    type Cinta = {
      cx: number; cy: number; rx: number; ry: number
      a: number; b: number; giro: number; vel: number
      hebras: number; tono: number; fase: number
    }

    function cinta(semilla: number): Cinta {
      const r = (n: number) => Math.sin(semilla * 999.7 + n * 37.13) * 0.5 + 0.5
      return {
        cx: 0.12 + r(1) * 0.76,
        cy: 0.18 + r(2) * 0.64,
        rx: 0.08 + r(3) * 0.17,
        ry: 0.05 + r(4) * 0.13,
        a: 2 + Math.floor(r(5) * 3),
        b: 3 + Math.floor(r(6) * 3),
        giro: r(7) * Math.PI,
        vel: (0.1 + r(8) * 0.22) * (r(9) > 0.5 ? 1 : -1),
        hebras: 11 + Math.floor(r(10) * 9),
        tono: r(11),
        fase: r(12) * Math.PI * 2,
      }
    }

    function medir() {
      if (!cv || !ctx) return
      const caja = cv.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      an = Math.max(caja.width, 1)
      al = Math.max(caja.height, 1)
      cv.width = Math.round(an * dpr)
      cv.height = Math.round(al * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = an < 700 ? 5 : 8
      cintas = Array.from({ length: n }, (_, i) => cinta(i + 1))
    }

    function pintar(t: number) {
      if (!ctx) return
      ctx.clearRect(0, 0, an, al)
      ctx.lineWidth = 1
      for (const c of cintas) {
        const cx = c.cx * an
        const cy = c.cy * al
        const rx = c.rx * Math.min(an, al * 1.9)
        const ry = c.ry * Math.min(an, al * 1.9)
        for (let h = 0; h < c.hebras; h++) {
          const k = h / (c.hebras - 1)
          const esc = 0.42 + k * 0.58
          const corr = c.fase + t * c.vel + k * 0.3
          ctx.beginPath()
          for (let i = 0; i <= 190; i++) {
            const u = (i / 190) * Math.PI * 2
            const x =
              cx +
              Math.cos(c.a * u + corr) * rx * esc * Math.cos(c.giro) -
              Math.sin(c.b * u) * ry * esc * Math.sin(c.giro)
            const y =
              cy +
              Math.sin(c.b * u + corr * 0.7) * ry * esc * Math.cos(c.giro) +
              Math.cos(c.a * u) * rx * esc * Math.sin(c.giro) * 0.5
            if (i) ctx.lineTo(x, y)
            else ctx.moveTo(x, y)
          }
          const mezcla = Math.min(1, Math.max(0, c.tono * 0.7 + k * 0.3))
          const R = Math.round(176 + (95 - 176) * mezcla)
          const G = Math.round(108 + (200 - 108) * mezcla)
          const B = Math.round(240 + (238 - 240) * mezcla)
          ctx.strokeStyle = `rgba(${R},${G},${B},${(0.042 + k * 0.075).toFixed(3)})`
          ctx.stroke()
        }
      }
    }

    let arranque: number | null = null
    function cuadro(ts: number) {
      if (!vivo) return
      if (arranque === null) arranque = ts
      pintar((ts - arranque) / 1000)
      cuadroId = requestAnimationFrame(cuadro)
    }

    medir()
    if (quieto) pintar(0)
    else cuadroId = requestAnimationFrame(cuadro)

    let temporizador: ReturnType<typeof setTimeout>
    const alCambiar = () => {
      clearTimeout(temporizador)
      temporizador = setTimeout(() => {
        medir()
        if (quieto) pintar(0)
      }, 150)
    }
    window.addEventListener('resize', alCambiar)

    return () => {
      vivo = false
      cancelAnimationFrame(cuadroId)
      clearTimeout(temporizador)
      window.removeEventListener('resize', alCambiar)
    }
  }, [])

  return <canvas ref={ref} className="st-campo" aria-hidden="true" />
}
