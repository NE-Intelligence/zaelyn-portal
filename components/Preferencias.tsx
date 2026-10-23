'use client'

import { useState } from 'react'
import { IDIOMAS, NOMBRE_IDIOMA, type Idioma } from '@/lib/copy'

type Tema = 'claro' | 'oscuro' | 'sistema'
const SIGUIENTE: Record<Tema, Tema> = { sistema: 'claro', claro: 'oscuro', oscuro: 'sistema' }

/**
 * Tema e idioma, juntos y siempre a la vista (#186).
 *
 * El TEMA se cambia en el navegador —es pura presentación— y se recuerda en
 * una cookie para que el servidor pinte la siguiente página ya con él, sin
 * destello. El IDIOMA es un formulario POST: cambia textos que arma el
 * servidor.
 */
export function Preferencias({
  lang,
  tema: inicial,
  et,
  clase,
}: {
  lang: Idioma
  tema: Tema
  et: { tema: string; claro: string; oscuro: string; sistema: string; idioma: string }
  clase: string
}) {
  const [tema, setTema] = useState<Tema>(inicial)

  const cambiar = () => {
    const t = SIGUIENTE[tema]
    setTema(t)
    const html = document.documentElement
    if (t === 'sistema') delete html.dataset.tema
    else html.dataset.tema = t
    document.cookie = `zt=${t}; path=/; max-age=31536000; samesite=lax`
  }

  const nombre = tema === 'claro' ? et.claro : tema === 'oscuro' ? et.oscuro : et.sistema

  return (
    <div className={`${clase}-pref`}>
      <button type="button" className={`${clase}-tema`} onClick={cambiar} title={`${et.tema}: ${nombre}`} aria-label={`${et.tema}: ${nombre}`}>
        {tema === 'claro' ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
          </svg>
        ) : tema === 'oscuro' ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" />
          </svg>
        )}
        <span className={`${clase}-tema-txt`}>{nombre}</span>
      </button>
      <form
        action="/idioma"
        method="post"
        className={`${clase}-idiomas`}
        aria-label={et.idioma}
        onSubmit={(e) => {
          const v = e.currentTarget.elements.namedItem('volver') as HTMLInputElement
          v.value = window.location.pathname + window.location.search
        }}
      >
        <input type="hidden" name="volver" defaultValue="/" />
        {IDIOMAS.map((l) => (
          <button key={l} type="submit" name="l" value={l} aria-pressed={l === lang} className={l === lang ? 'ahora' : undefined}>
            {NOMBRE_IDIOMA[l]}
          </button>
        ))}
      </form>
    </div>
  )
}
