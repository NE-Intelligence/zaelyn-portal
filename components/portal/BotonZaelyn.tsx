'use client'

/**
 * «✦ Zaelyn» en la barra: abre y cierra el panel lateral de Zaelyn.
 * Reemplaza al botón flotante (decisiones/2026-10-30-panel-y-ventanas).
 */
import { useEffect, useState } from 'react'

export function BotonZaelyn({ etiqueta }: { etiqueta: string }) {
  const [abierto, setAbierto] = useState(false)
  useEffect(() => {
    const oir = (e: Event) => setAbierto(!!(e as CustomEvent<boolean>).detail)
    window.addEventListener('zaelyn:panel', oir)
    setAbierto(document.documentElement.dataset.zpanel === 'abierto')
    return () => window.removeEventListener('zaelyn:panel', oir)
  }, [])
  return (
    <button
      type="button"
      className="pt-zaelyn"
      aria-pressed={abierto}
      aria-controls="zaelyn-panel"
      title={etiqueta}
      onClick={() => window.dispatchEvent(new Event('zaelyn:alternar'))}
    >
      <span className="pt-zaelyn-chispa" aria-hidden="true">✦</span>
      <span className="pt-zaelyn-txt">Zaelyn</span>
    </button>
  )
}
