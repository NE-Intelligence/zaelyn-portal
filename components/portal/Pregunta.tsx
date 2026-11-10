'use client'

/**
 * «Pregúntale a Zaelyn» desde la pantalla, y las frases de cambio.
 *
 * El portal no cambia nada por su cuenta: la barra solo le pasa la pregunta al
 * panel de Zaelyn (evento `zaelyn:preguntar`), que la manda al motor como si
 * se hubiera escrito ahí. Si la respuesta trae página (`portal.ir`), el panel
 * mueve la pantalla: otra vista, una persona, una actividad abierta. Esas
 * direcciones (`?v=`, `?p=`, `?a=`) son las que entiende el lienzo.
 */
import { useState } from 'react'

export const preguntarAZaelyn = (texto: string, contexto?: string) =>
  window.dispatchEvent(new CustomEvent('zaelyn:preguntar', { detail: { texto, contexto } }))

export function BarraPregunta({ contexto, ejemplos }: { contexto: string; ejemplos: string[] }) {
  const [texto, setTexto] = useState('')
  const mandar = (t: string) => {
    const limpio = t.trim()
    if (!limpio) return
    preguntarAZaelyn(limpio, contexto)
    setTexto('')
  }
  return (
    <form
      className="grid gap-2"
      onSubmit={e => { e.preventDefault(); mandar(texto) }}
      aria-label="Pregúntale a Zaelyn"
    >
      <div className="flex h-12 items-center gap-2 rounded-full bg-superficie pl-2 pr-1.5 shadow-z2">
        <span className="z-orbe size-8" aria-hidden="true" />
        <input
          value={texto}
          onChange={e => setTexto(e.target.value)}
          placeholder={`Pregúntale a Zaelyn sobre ${contexto}`}
          aria-label="Pregunta para Zaelyn"
          className="h-10 min-w-0 flex-1 border-0 bg-transparent text-[15px] text-tinta outline-none placeholder:text-tinta-3"
        />
        <button
          type="submit"
          disabled={!texto.trim()}
          className="h-9 cursor-pointer rounded-full border-0 bg-pri px-4 text-[14px] font-semibold text-sobre-pri disabled:cursor-default disabled:opacity-35"
        >
          Preguntar
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 pl-2">
        {ejemplos.map(x => (
          <button
            key={x}
            type="button"
            onClick={() => mandar(x)}
            className="cursor-pointer rounded-full border border-dashed border-linea-fuerte bg-transparent px-3 py-1 text-[12.5px] text-tinta-2 hover:border-solid hover:text-tinta"
          >
            {x}
          </button>
        ))}
      </div>
    </form>
  )
}

/** Una frase de cambio: se manda a Zaelyn (con sesión) o se copia. */
export function CopiarFrase({ frase, enviar }: { frase: string; enviar: boolean }) {
  const [hecho, setHecho] = useState<'' | 'copiada' | 'enviada'>('')
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(frase)
      setHecho('copiada')
      setTimeout(() => setHecho(''), 1600)
    } catch { /* sin portapapeles: la frase sigue a la vista */ }
  }
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-linea-fuerte bg-superficie px-3 py-2">
      <code className="min-w-0 flex-1 font-sans text-[13.5px] text-tinta">«{frase}»</code>
      {enviar && (
        <button type="button" onClick={() => { preguntarAZaelyn(frase); setHecho('enviada') }}
          className="cursor-pointer rounded-full border-0 bg-pri px-3 py-1 text-[12.5px] font-semibold text-sobre-pri">
          {hecho === 'enviada' ? 'Enviada' : 'Mandar'}
        </button>
      )}
      <button type="button" onClick={copiar}
        className="cursor-pointer rounded-full border-0 bg-superficie-2 px-3 py-1 text-[12.5px] text-tinta">
        {hecho === 'copiada' ? 'Copiada' : 'Copiar'}
      </button>
    </div>
  )
}
