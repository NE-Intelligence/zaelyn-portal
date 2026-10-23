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
  /** El puesto que la hace: viaja en las plantillas; la persona se elige al liberar. */
  puesto?: string
  inicio?: string | null
  dias?: number | null
  horas?: number | null
  depende?: string[]
  notas?: string
  hecho?: boolean
  /** Cómo va en el seguimiento, si el plan se reabrió (#178). Solo se lee. */
  seguimiento?: { estatus: EstatusSeguimiento; avance: number }
  /** Lo que decía el archivo del que salió (#188). Lo lee la revisión; el editor no lo cambia. */
  origen?: Origen
}

export type Origen = {
  fila: number
  inicio?: string | null
  fin?: string | null
  horas?: number | null
  avance?: number | null
  estatus?: EstatusSeguimiento
  persona?: string
  /** La duración que decía el archivo, en días del calendario (#189). */
  dias?: number | null
}

/** La revisión antes de liberar (#188). La calcula el motor. */
export type NivelHallazgo = 'error' | 'aviso' | 'info'
export type Hallazgo = {
  codigo: string
  nivel: NivelHallazgo
  nodo: string | null
  titulo: string | null
  fila: number | null
  dice: string
  arreglo?: { etiqueta: string; cambios: { inicio?: string; dias?: number } }
}
export type Revision = { hallazgos: Hallazgo[]; errores: number; avisos: number; info: number }

/** Lo que se entendió de un Excel al convertirlo en borrador (#188). */
export type LecturaExcel = {
  hoja: string
  filaEncabezado: number
  renglones: number
  fases: number
  actividades: number
  hitos: number
  columnas: Array<{ campo: string; titulo: string }>
  ajenas: string[]
  problemas: string[]
  fechasSeguras: boolean
  diaPrimero: boolean
  calendario: 'habiles' | 'naturales'
  estructura: 'esquema' | 'fase' | 'plana'
  dependenciasPerdidas: number
  tiempo: Array<{ titulo: string; tipo: 'duracion' | 'esfuerzo'; unidad: string }>
  jornada: number
}

/** Una columna de tiempo cuyos números no dicen en qué están (#189). */
export type PreguntaUnidad = { col: number; titulo: string; tipo: 'duracion' | 'esfuerzo'; ejemplos: string[] }

export type EstatusSeguimiento = 'abierto' | 'en_curso' | 'bloqueado' | 'hecho' | 'cancelado'

/** Ya avanzó en el seguimiento: no se quita desde el editor. */
export const avanzo = (n: Nodo): boolean =>
  !!n.seguimiento && (n.seguimiento.estatus === 'hecho' || n.seguimiento.estatus === 'en_curso' || n.seguimiento.avance > 0)

export const SEGUIMIENTO_DICE: Record<EstatusSeguimiento, string> = {
  abierto: 'Sin empezar', en_curso: 'En curso', bloqueado: 'En espera', hecho: 'Hecha', cancelado: 'Cancelada',
}

export type Doc = {
  v: 1
  objetivo?: string
  alcance?: string
  inicio: string | null
  golive?: string | null
  habiles: boolean
  /** Qué fecha manda: el arranque o el go-live. */
  fijar?: 'inicio' | 'golive'
  /** Cómo se enseña el esfuerzo (#189). Se guarda siempre en horas. */
  unidad?: 'horas' | 'dias'
  /** Horas de una jornada; 8 si no se dice. */
  jornada?: number
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

export type Liberado = { groupId: string | null; planId: string | null; en: string; version: number }

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
  groupId: string | null
  liberado: Liberado | null
}

export type Abierto = Tarjeta & { groupId: string | null; doc: Doc; puede: boolean }

export type PersonaDelEditor = { id: string; nombre: string; rol: string | null; tieneCuenta: boolean }

export type Mesa = {
  grupo: { id: string; nombre: string }
  puede: boolean
  administra: boolean
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
  creditos?: number
}

export type Diferencia = {
  agregados: Array<{ id: string; titulo: string; tipo: TipoNodo }>
  quitados: Array<{ id: string; titulo: string; tipo: TipoNodo }>
  modificados: Array<{ id: string; titulo: string; campos: string[] }>
  protegidos: string[]
}

/** Lo que Zaelyn propone cambiar sobre un plan que ya existe (#178). */
export type Reorganizacion = {
  doc: Doc
  resumen: string
  cambios: string[]
  riesgos: string[]
  dif: Diferencia
  descartados: number
  costoUsd: number
  creditos?: number
}

export type Reapertura = { ok: true; id: string; nuevo: boolean; actualizados: number; agregados: number; quitados: number }

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

export type GrupoDestino = {
  id: string
  nombre: string
  clase: string
  rol: string | null
  puede: boolean
  administra: boolean
  planes: Array<{ id: string; clave: string; nombre: string }>
}

export type MisProyectos = {
  borradores: Tarjeta[]
  deGrupos: Array<Tarjeta & { grupo: string }>
  plantillas: Tarjeta[]
  grupos: GrupoDestino[]
  metodologias: Ficha[]
  base: PlantillaBase[]
  ia: boolean
}

export type VistaLiberar = {
  grupo: { id: string; nombre: string }
  personas: PersonaDelEditor[]
  puestos: Array<{ puesto: string; huella: string; actividades: number; asignado: string | null }>
  conservaResponsables: boolean
  plan: { modo: 'nuevo'; nombre: string } | { modo: 'existente'; planId: string; nombre: string }
  anterior: { planId: string; nombre: string } | null
  choque: string | null
  planes: Array<{ id: string; nombre: string }>
  resumen: {
    renglones: number; nuevos: number; cambios: number; iguales: number
    desaparecidos: number; sinDueno: number
    detalle: Array<{ texto: string; campos: string[] }>
  }
  fechas: { inicia: string | null; termina: string | null }
}

export const ROLES_DE_PROYECTO = ['integrante', 'lider', 'administrador', 'stakeholder', 'observador'] as const
export const ROL_DICE: Record<string, string> = {
  integrante: 'Ejecuta lo suyo y reporta avance',
  lider: 'Asigna, prioriza, mueve fechas y aprueba',
  administrador: 'Todo, más invitar, roles y la cuenta',
  stakeholder: 'Directivo: pregunta, recibe el resumen ejecutivo y manda comunicados',
  observador: 'Da seguimiento; solo consulta y no interrumpe',
}
