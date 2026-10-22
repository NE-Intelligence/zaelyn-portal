/**
 * El documento del editor — ESPEJO de `src/services/editor.ts` en Zaelyn.
 *
 * Ref: Zaelyn DECISIONS #174
 *
 * Mismos nombres de campo, mismos valores, mismas reglas de anidado. Quien
 * decide si un documento es válido es el motor (`validar`); esta copia existe
 * para que el lienzo no ofrezca un movimiento que el motor va a rechazar.
 *
 * ── LA EXCEPCIÓN A «EL PORTAL NO CALCULA» ──────────────────────────────
 *
 * El resto del portal no calcula nada: pinta el estado que el motor midió.
 * El editor sí programa fechas, suma duraciones y empuja sucesores — porque
 * lo que edita NO es el plan que Zaelyn sigue, es un borrador que nadie ha
 * liberado. No hay una segunda verdad posible: la primera todavía no existe.
 * Cuando se libere, lo que entre a Zaelyn lo medirá Zaelyn.
 */

export const TIPOS_NODO = ['fase', 'sprint', 'grupo', 'actividad', 'subtarea', 'hito'] as const
export type TipoNodo = (typeof TIPOS_NODO)[number]

export const PADRES: Readonly<Record<TipoNodo, readonly (TipoNodo | null)[]>> = {
  fase: [null],
  sprint: [null, 'fase'],
  grupo: [null, 'fase', 'sprint', 'grupo'],
  actividad: [null, 'fase', 'sprint', 'grupo'],
  hito: [null, 'fase', 'sprint', 'grupo'],
  subtarea: ['actividad'],
}

export const PROGRAMABLES: readonly TipoNodo[] = ['actividad', 'hito']
export const CONTENEDORES: readonly TipoNodo[] = ['fase', 'sprint', 'grupo']

export type Nodo = {
  id: string
  tipo: TipoNodo
  padre: string | null
  orden: number
  titulo: string
  objetivo?: string
  relevancia?: string
  terminado?: string
  responsable?: string | null
  inicio?: string | null
  dias?: number | null
  horas?: number | null
  depende?: string[]
  notas?: string
  hecho?: boolean
}

export type Doc = {
  v: 1
  objetivo?: string
  alcance?: string
  inicio: string | null
  golive?: string | null
  habiles: boolean
  nodos: Nodo[]
}

export const METODOLOGIAS = ['activate', 'scrum', 'cascada', 'hibrida', 'kanban', 'dmaic', 'libre'] as const
export type Metodologia = (typeof METODOLOGIAS)[number]

export type Ficha = {
  clave: Metodologia
  nombre: string
  resumen: string
  cuando: string
  forma: string
}

export type PlantillaBase = {
  clave: string
  metodologia: Metodologia
  nombre: string
  resumen: string
  doc: Doc
}

export type Tarjeta = {
  id: string
  tipo: 'borrador' | 'plantilla'
  nombre: string
  metodologia: string
  nodos: number
  inicia: string | null
  termina: string | null
  version: number
  movidoEn: string
}

export type Abierto = Tarjeta & { groupId: string | null; doc: Doc; puede: boolean }

export type PersonaDelEditor = { id: string; nombre: string; rol: string | null; tieneCuenta: boolean }

export type Mesa = {
  grupo: { id: string; nombre: string }
  puede: boolean
  rol: string | null
  personas: PersonaDelEditor[]
  borradores: Tarjeta[]
  plantillas: Tarjeta[]
  metodologias: Ficha[]
  base: PlantillaBase[]
  ia: boolean
}

export type Propuesta = {
  metodologia: Metodologia
  porque: string
  alternativa: string | null
  riesgos: string[]
  doc: Doc
  descartados: number
  costoUsd: number
}

export type Brief = {
  nombre: string
  objetivo: string
  alcance?: string
  inicio?: string | null
  golive?: string | null
  metodologia: Metodologia | 'recomendar'
  detalle: 'compacto' | 'normal' | 'detallado'
  restricciones?: string
}

// ── presentación ─────────────────────────────────────────────────────────

export const TIPO_NOMBRE: Record<TipoNodo, string> = {
  fase: 'Fase', sprint: 'Sprint', grupo: 'Grupo', actividad: 'Actividad', subtarea: 'Subtarea', hito: 'Hito',
}

/** Qué hace cada objeto, en una línea. Lo que se lee al pasar sobre la paleta. */
export const TIPO_DICE: Record<TipoNodo, string> = {
  fase: 'Etapa del proyecto con objetivo y criterio de salida. Contiene todo lo demás.',
  sprint: 'Iteración de duración fija. Vive suelto o dentro de una fase.',
  grupo: 'Junta actividades por entregable o frente de trabajo.',
  actividad: 'El trabajo que Zaelyn va a seguir: tiene responsable, duración y dependencias.',
  subtarea: 'Un renglón de lista dentro de una actividad. No se programa.',
  hito: 'Un punto de control sin duración: una compuerta, una aprobación, el go-live.',
}

export const METODOLOGIA_CORTA: Record<string, string> = {
  activate: 'SAP Activate', scrum: 'Scrum', cascada: 'Cascada', hibrida: 'Híbrida',
  kanban: 'Lean / Kanban', dmaic: 'DMAIC', libre: 'Libre',
}

export const puedeVivir = (tipo: TipoNodo, padre: TipoNodo | null): boolean => PADRES[tipo].includes(padre)
