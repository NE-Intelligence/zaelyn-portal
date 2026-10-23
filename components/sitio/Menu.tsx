'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

type Enlace = { href: string; texto: string }

export default function Menu({ enlaces, etiqueta }: { enlaces: Enlace[]; etiqueta: string }) {
  const [abierto, setAbierto] = useState(false)
  const ruta = usePathname()
  return (
    <>
      <button
        className="st-hamb"
        type="button"
        aria-label={etiqueta}
        aria-expanded={abierto}
        aria-controls="menu"
        onClick={() => setAbierto((v) => !v)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
          {abierto ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
        </svg>
      </button>
      {/*
        LA CLASE ES `abierto`, NO `st-abierto`: el CSS la espera así
        (`.st-menu.abierto`). Con el prefijo, el menú del teléfono no abría.
      */}
      <nav className={abierto ? 'st-menu abierto' : 'st-menu'} id="menu" onClick={() => setAbierto(false)}>
        {enlaces.map((e) => (
          <a key={e.href} href={e.href} aria-current={ruta === e.href || ruta.startsWith(e.href + '/') ? 'page' : undefined}>
            {e.texto}
          </a>
        ))}
      </nav>
    </>
  )
}
