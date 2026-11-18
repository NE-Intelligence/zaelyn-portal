'use client'

/**
 * Los ajustes del panel de Zaelyn (decisiones/2026-11-18-panel-de-zaelyn):
 * forma, lado, tamaño, teléfono, letra y de dónde toma la apariencia. Cada
 * cambio se ve en vivo y se guarda en este dispositivo.
 */
import { LETRAS_PANEL, PANEL_FABRICA, type PanelPrefs } from '@/lib/panel'

function Fila<T extends string | number>({ et, opciones, valor, alElegir }: { et: string; opciones: Array<[T, string]>; valor: T; alElegir: (v: T) => void }) {
  return (
    <fieldset className="m-0 flex flex-col gap-1.5 border-0 p-0">
      <legend className="mb-1 p-0 text-[12px] font-semibold text-tinta-3">{et}</legend>
      <div className="flex rounded-full bg-[color-mix(in_srgb,var(--z-ink)_5%,transparent)] p-1" role="radiogroup" aria-label={et}>
        {opciones.map(([k, t]) => (
          <button key={String(k)} type="button" role="radio" aria-checked={valor === k} onClick={() => alElegir(k)}
            className={`h-8 flex-1 cursor-pointer rounded-full border-0 px-2 text-[12.5px] ${valor === k ? 'bg-superficie font-medium text-tinta shadow-z1' : 'bg-transparent text-tinta-2'}`}>
            {t}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function AjustesPanel({ p, cambiar, cerrar }: { p: PanelPrefs; cambiar: (x: Partial<PanelPrefs>) => void; cerrar: () => void }) {
  return (
    <div className="rl-ajustes cr-vidrio cr-panel" role="dialog" aria-label="Ajustes del panel de Zaelyn">
      <header className="flex items-center justify-between">
        <b className="text-[14px]">Panel de Zaelyn</b>
        <button type="button" onClick={cerrar} className="rl-acc" aria-label="Cerrar ajustes">×</button>
      </header>
      <Fila et="Forma" valor={p.forma} alElegir={forma => cambiar({ forma, pos: null })}
        opciones={[['columna', 'Columna'], ['flotante', 'Flotante'], ['telefono', 'Teléfono']]} />
      <p className="m-0 -mt-1.5 text-[12px] leading-[1.4] text-tinta-3">
        {p.forma === 'columna' ? 'A todo lo alto, a un lado; la página se recorre y nada queda tapado.'
          : p.forma === 'flotante' ? 'Una ventana encima de la página. Arrástrala de la barra de arriba.'
            : 'Como tener el teléfono en el escritorio. Arrástralo de la barra de arriba.'}
      </p>
      {p.forma !== 'columna' && (
        <Fila et="Lado" valor={p.lado} alElegir={lado => cambiar({ lado, pos: null })} opciones={[['izq', 'Izquierda'], ['der', 'Derecha']]} />
      )}
      <Fila et="Ancho" valor={p.ancho} alElegir={ancho => cambiar({ ancho })} opciones={[['angosto', 'Angosto'], ['normal', 'Normal'], ['ancho', 'Ancho']]} />
      {p.forma === 'flotante' && (
        <Fila et="Alto" valor={p.alto} alElegir={alto => cambiar({ alto, pos: null })} opciones={[['medio', 'Medio'], ['alto', 'Alto'], ['completo', 'Completo']]} />
      )}
      {p.forma === 'telefono' && (
        <>
          <Fila et="Teléfono" valor={p.equipo} alElegir={equipo => cambiar({ equipo })} opciones={[['iphone', 'iPhone'], ['android', 'Android']]} />
          <Fila et="Color" valor={p.marco} alElegir={marco => cambiar({ marco })} opciones={[['negro', 'Negro'], ['titanio', 'Titanio'], ['blanco', 'Blanco']]} />
        </>
      )}
      <Fila et="Letra" valor={p.letra} alElegir={letra => cambiar({ letra })} opciones={LETRAS_PANEL} />
      <Fila et="Colores y luz" valor={p.apariencia} alElegir={apariencia => cambiar({ apariencia })}
        opciones={[['portal', 'Como el portal'], ['app', 'Como mi app']]} />
      <p className="m-0 -mt-1.5 text-[12px] leading-[1.4] text-tinta-3">
        Fondo, tipo de letra y burbujas vienen de los ajustes de tu app; cámbialos ahí y aquí se ven igual.
      </p>
      <button type="button" onClick={() => cambiar(PANEL_FABRICA)}
        className="h-9 cursor-pointer rounded-full border-0 bg-[color-mix(in_srgb,var(--z-ink)_6%,transparent)] text-[13px] text-tinta">Volver a lo de fábrica</button>
    </div>
  )
}
