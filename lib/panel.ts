/**
 * Cómo se ve el panel de Zaelyn en el portal (decisiones/2026-11-18-panel-de-zaelyn).
 *
 * Se guarda POR DISPOSITIVO (localStorage): en la laptop se quiere una columna
 * a todo lo alto y en la tablet quizá un teléfono flotante. En el teléfono no
 * aplica: ahí la conversación ocupa toda la pantalla.
 */
export type Forma = 'columna' | 'flotante' | 'telefono'
export type PanelPrefs = {
  forma: Forma
  lado: 'der' | 'izq'
  ancho: 'angosto' | 'normal' | 'ancho'
  alto: 'medio' | 'alto' | 'completo'
  equipo: 'iphone' | 'android'
  marco: 'negro' | 'titanio' | 'blanco'
  /** Escala del panel completo: letra, botones y espacios juntos. */
  letra: 0.8 | 0.9 | 1 | 1.12
  /** «portal»: la app toma la luz y la paleta del portal. «app»: usa las suyas. */
  apariencia: 'portal' | 'app'
  /** Dónde quedó la ventana flotante si se arrastró (px desde arriba a la izquierda). */
  pos: { x: number; y: number } | null
}

export const PANEL_FABRICA: PanelPrefs = {
  forma: 'columna', lado: 'der', ancho: 'normal', alto: 'alto', equipo: 'iphone', marco: 'negro', letra: 0.9, apariencia: 'portal', pos: null,
}

export const ANCHOS = { angosto: 360, normal: 400, ancho: 480 } as const
export const LETRAS_PANEL: Array<[PanelPrefs['letra'], string]> = [[0.8, 'Mínima'], [0.9, 'Chica'], [1, 'Normal'], [1.12, 'Grande']]

const LLAVE = 'zaelyn.panel.v1'

const de = <T extends string | number>(v: unknown, ok: readonly T[], f: T): T => (ok.includes(v as T) ? (v as T) : f)

export function normalizarPanel(o: unknown): PanelPrefs {
  const x = (o && typeof o === 'object' ? o : {}) as Record<string, unknown>
  const f = PANEL_FABRICA
  const p = x.pos as { x?: unknown; y?: unknown } | null | undefined
  return {
    forma: de(x.forma, ['columna', 'flotante', 'telefono'] as const, f.forma),
    lado: de(x.lado, ['der', 'izq'] as const, f.lado),
    ancho: de(x.ancho, ['angosto', 'normal', 'ancho'] as const, f.ancho),
    alto: de(x.alto, ['medio', 'alto', 'completo'] as const, f.alto),
    equipo: de(x.equipo, ['iphone', 'android'] as const, f.equipo),
    marco: de(x.marco, ['negro', 'titanio', 'blanco'] as const, f.marco),
    letra: de(x.letra, [0.8, 0.9, 1, 1.12] as const, f.letra),
    apariencia: de(x.apariencia, ['portal', 'app'] as const, f.apariencia),
    pos: p && typeof p.x === 'number' && typeof p.y === 'number' && Number.isFinite(p.x) && Number.isFinite(p.y) ? { x: p.x, y: p.y } : null,
  }
}

export function leerPanel(): PanelPrefs {
  try { return normalizarPanel(JSON.parse(window.localStorage.getItem(LLAVE) ?? 'null')) } catch { return PANEL_FABRICA }
}
export function guardarPanel(p: PanelPrefs) {
  try { window.localStorage.setItem(LLAVE, JSON.stringify(p)) } catch { /* sin almacenamiento: dura lo que la pestaña */ }
}
