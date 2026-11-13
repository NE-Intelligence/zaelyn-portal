/**
 * La app de Zaelyn dentro de un teléfono, tal cual se ve en la app
 * (zaelyn-app v1, estilo Muse): el orbe con su nombre arriba, burbujas grises
 * y tarjetas con opciones como diálogos sutiles. Solo presentación: no hay
 * nada que tocar.
 */
import { AMBITO, type Pieza } from '@/lib/landings'

const SOMBRA = 'shadow-[0_1px_2px_rgba(0,0,0,.04),0_6px_20px_rgba(0,0,0,.06)]'

export function Telefono({ piezas, etiqueta, chico }: { piezas: Pieza[]; etiqueta: string; chico?: boolean }) {
  return (
    <figure className="m-0" aria-label={etiqueta}>
      <div className={`${chico ? 'h-[600px] w-[320px]' : 'h-[740px] w-[360px]'} max-w-full rounded-[54px] bg-[#1d1d1f] p-3 shadow-[0_30px_80px_rgba(0,0,0,.18)]`}>
        <div className="flex h-full flex-col overflow-hidden rounded-[44px] bg-fondo text-left text-tinta">
          <div className="flex flex-none items-start justify-between px-4 pt-[18px] pb-1" aria-hidden="true">
            <span className={`grid size-10 place-items-center rounded-full bg-superficie ${SOMBRA}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 9h16M4 15h16" /></svg>
            </span>
            <span className="flex flex-col items-center">
              <span className="z-orbe size-[58px]" />
              <span className={`-mt-3 rounded-full bg-superficie px-3.5 py-1 text-[13px] font-semibold ${SOMBRA}`}>Zaelyn</span>
            </span>
            <span className={`grid h-10 place-items-center rounded-full bg-superficie px-3.5 text-[13px] font-medium ${SOMBRA}`}>Invitar</span>
          </div>
          <div className="flex flex-1 flex-col gap-[7px] overflow-hidden px-3.5 py-2.5">
            {piezas.map((p, i) => <Pedazo key={i} p={p} />)}
          </div>
          <div className="flex-none px-3.5 pt-1.5 pb-3" aria-hidden="true">
            <div className={`flex h-[46px] items-center gap-1.5 rounded-full bg-superficie px-2 ${SOMBRA}`}>
              <span className="w-8 text-center text-[20px]">+</span>
              <span className="flex-1 text-[14px] text-tinta-3">Mensaje para Zaelyn</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>
            </div>
          </div>
        </div>
      </div>
    </figure>
  )
}

function Pedazo({ p }: { p: Pieza }) {
  if ('yo' in p) {
    return <p className="m-0 max-w-[80%] self-end rounded-[20px] bg-[#d9e8ff] px-3.5 py-2.5 text-[14px] leading-snug text-[#0b2a55]">{p.yo}</p>
  }
  if ('zaelyn' in p) {
    return <p className="m-0 max-w-[88%] self-start rounded-[20px] bg-burbuja px-3.5 py-2.5 text-[14px] leading-snug">{p.zaelyn}</p>
  }
  const t = p.tarjeta
  const m = AMBITO[t.ambito]
  const cols = t.opciones.some(o => o.length > 22) ? 1 : t.opciones.length === 4 ? 2 : Math.min(t.opciones.length, 3)
  return (
    <div className="grid gap-2.5 rounded-[22px] bg-burbuja px-4 py-3.5">
      <span className="flex items-center gap-[7px] text-[12px] text-tinta-2">
        <span className="size-[7px] rounded-full" style={{ background: m.color }} />
        {t.contexto.startsWith(m.nombre) ? t.contexto : `${m.nombre} · ${t.contexto}`}
      </span>
      <span className="text-[17px] font-semibold leading-tight tracking-[-0.02em]">{t.titulo}</span>
      <span className="text-[13px] text-tinta-2">{t.dato}</span>
      <span className="grid gap-[7px]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {t.opciones.map((o, i) => (
          <span
            key={o}
            className={`rounded-[14px] bg-superficie px-2 py-2.5 text-center text-[14px] ${i === 0 ? 'border-[1.5px] border-solid border-tinta font-semibold' : 'border border-dashed border-linea-fuerte font-medium'}`}
          >
            {o}
          </span>
        ))}
      </span>
      <span className="flex justify-end gap-3 text-[12px] text-tinta-3" aria-hidden="true">
        <span>Ayuda</span><span>Más</span>
      </span>
    </div>
  )
}
