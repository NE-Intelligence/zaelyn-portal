/**
 * Cristal: la apariencia editable del portal (decisiones/2026-11-11-cristal).
 *
 * Quien mira escoge una paleta pastel, el material del vidrio (desenfoque,
 * opacidad, saturación, tinte y luz del borde) y si las tarjetas flotan y el
 * fondo 3D se mueve. Vive en una cookie de preferencia (`zc`), como el tema y
 * el idioma, para que la primera pintura ya salga como la persona la dejó.
 * Es apariencia del navegador, no un dato del motor; cuando el motor guarde
 * preferencias de interfaz (spec de la app, §8) se sincroniza desde ahí.
 *
 * Todo lo que llega de la cookie se valida y se acota aquí: un valor raro se
 * cambia por el de fábrica, nunca se pinta tal cual.
 */

export const PALETAS = {
  lavanda: { nombre: 'Lavanda', muestra: ['#cdbdff', '#9fe3ee', '#f6d6ec'] },
  salvia: { nombre: 'Salvia', muestra: ['#bfe3cf', '#e8f1c8', '#a9d8e0'] },
  arena: { nombre: 'Arena', muestra: ['#f3dcc4', '#f6c9b8', '#e9e2cf'] },
  cielo: { nombre: 'Cielo', muestra: ['#bcd6ff', '#c8f0f6', '#dcd2ff'] },
  rosa: { nombre: 'Rosa', muestra: ['#f8c8dc', '#ffd9c7', '#e3cfff'] },
} as const
export type Paleta = keyof typeof PALETAS

export type Material = { blur: number; opacidad: number; saturacion: number; tinte: string; borde: number }
export type Cristal = { paleta: Paleta; material: Material; flotar: boolean; fondo3d: boolean }

export const MATERIAL_FABRICA: Material = { blur: 24, opacidad: 0.42, saturacion: 1.35, tinte: '#ffffff', borde: 0.7 }
export const CRISTAL_FABRICA: Cristal = { paleta: 'lavanda', material: MATERIAL_FABRICA, flotar: true, fondo3d: true }

export const PRESETS: Array<{ nombre: string; material: Partial<Material> }> = [
  { nombre: 'Claro', material: { blur: 10, opacidad: 0.18, saturacion: 1.2, borde: 0.85 } },
  { nombre: 'Escarchado', material: { blur: 24, opacidad: 0.42, saturacion: 1.35, borde: 0.7 } },
  { nombre: 'Sólido', material: { blur: 34, opacidad: 0.82, saturacion: 1, borde: 0.4 } },
]

export const COOKIE_CRISTAL = 'zc'

const entre = (v: unknown, min: number, max: number, def: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : def

export function normalizar(x: unknown): Cristal {
  const o = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>
  const m = (o.material && typeof o.material === 'object' ? o.material : {}) as Record<string, unknown>
  const F = MATERIAL_FABRICA
  return {
    paleta: typeof o.paleta === 'string' && o.paleta in PALETAS ? (o.paleta as Paleta) : CRISTAL_FABRICA.paleta,
    material: {
      blur: entre(m.blur, 0, 40, F.blur),
      opacidad: entre(m.opacidad, 0.08, 0.9, F.opacidad),
      saturacion: entre(m.saturacion, 0.5, 2, F.saturacion),
      tinte: typeof m.tinte === 'string' && /^#[0-9a-f]{6}$/i.test(m.tinte) ? m.tinte.toLowerCase() : F.tinte,
      borde: entre(m.borde, 0, 1, F.borde),
    },
    flotar: typeof o.flotar === 'boolean' ? o.flotar : true,
    fondo3d: typeof o.fondo3d === 'boolean' ? o.fondo3d : true,
  }
}

export function leerCookie(valor: string | undefined): Cristal {
  if (!valor) return CRISTAL_FABRICA
  try {
    return normalizar(JSON.parse(decodeURIComponent(valor)))
  } catch {
    return CRISTAL_FABRICA
  }
}

export const aCookie = (c: Cristal) => encodeURIComponent(JSON.stringify(c))

/** Las variables CSS que el material pone en <html>. */
export function variables(m: Material): Record<string, string> {
  return {
    '--cr-blur': `${m.blur}px`,
    '--cr-op': String(m.opacidad),
    '--cr-sat': String(m.saturacion),
    '--cr-tinte': m.tinte,
    '--cr-borde': String(m.borde),
  }
}
