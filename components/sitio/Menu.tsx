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
      {/*
        LA CLASE ES `abierto`, NO `st-abierto`.
        El CSS la espera así (`.st-menu.abierto`), y con el prefijo puesto el
        menú del teléfono no se abría: tocabas la hamburguesa y no pasaba
        nada. No había error en ninguna parte — simplemente el sitio no tenía
        navegación en un teléfono, que es donde lo abre la mayoría.
      */}
      <nav className={abierto ? 'st-menu abierto' : 'st-menu'} id="menu" onClick={() => setAbierto(false)}>
        {enlaces.map((e) => (
          <a key={e.href} href={e.href}>
            {e.texto}
          </a>
        ))}
      </nav>
    </>
  )
}
