'use client'

import { useState } from 'react'

type Enlace = { href: string; texto: string }

export default function Menu({ enlaces, etiqueta }: { enlaces: Enlace[]; etiqueta: string }) {
  const [abierto, setAbierto] = useState(false)
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
          <path d="M3 7h18M3 12h18M3 17h18" />
        </svg>
      </button>
      <nav className={abierto ? 'st-menu st-abierto' : 'st-menu'} id="menu" onClick={() => setAbierto(false)}>
        {enlaces.map((e) => (
          <a key={e.href} href={e.href}>
            {e.texto}
          </a>
        ))}
      </nav>
    </>
  )
}
