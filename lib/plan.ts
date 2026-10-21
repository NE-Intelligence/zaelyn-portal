/**
 * El contrato de lectura.
 *
 * `EstadoPlan` es lo que Zaelyn devuelve ya medido: avance, avance esperado,
 * criticidad, holgura y atraso vienen hechos. **El portal no calcula ninguno
 * de esos números y no consulta la base.** Si el chat dice 34%, la pantalla
 * dice 34%, porque las dos leen esto mismo.
 *
 * Mientras el endpoint no exista, `lib/demo.ts` arma un objeto de esta forma
 * con datos de ejemplo, y la pantalla lo dice en voz alta.
 */

export type Estado = 'pendiente' | 'curso' | 'revision' | 'detenida' | 'hecha'
export type Prioridad = 'critica' | 'alta' | 'media' | 'baja'
export type Rol = 'observa' | 'ejecuta' | 'lidera' | 'administra'
export type Vista = 'resumen' | 'tablero' | 'gantt' | 'ruta' | 'equipo' | 'bitacora'

export const ESTADO_NOMBRE: Record<Estado, string> = {
  pendiente: 'Sin iniciar',
  curso: 'En curso',
  revision: 'En revisión',
  detenida: 'Detenida',
  hecha: 'Hecha',
}

export const PRIORIDAD_NOMBRE: Record<Prioridad, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
}

export const ROL_NOMBRE: Record<Rol, string> = {
  observa: 'Observa',
  ejecuta: 'Ejecuta',
  lidera: 'Lidera',
  administra: 'Administra',
}

/** Lo que cada rol puede pedirle a Zaelyn. El portal nunca escribe. */
export const ROL_PUEDE: Record<Rol, string> = {
  observa: 'Preguntar lo que quiera. No puede interrumpir a una persona.',
  ejecuta: 'Reportar el avance de sus actividades.',
  lidera: 'Asignar, priorizar y pedirle avance a una persona.',
  administra: 'Todo lo anterior, más roles y alta de proyectos.',
}

export const VISTA_NOMBRE: Record<Vista, string> = {
  resumen: 'Resumen',
  tablero: 'Tablero',
  gantt: 'Gantt',
  ruta: 'Ruta crítica',
  equipo: 'Equipo',
  bitacora: 'Bitácora',
}

export type Persona = {
  id: string
  nombre: string
  corto: string
  iniciales: string
  rol: Rol
  /** 1–6: elige el color de fase/avatar. */
  color: number
  canal?: string
  puesto?: string
}

export type Fase = { id: string; nombre: string; color: number }

export type Nota = { autor: string; fecha: string; canal: string; texto: string }

export type Actividad = {
  id: string
  clave: string
  nombre: string
  fase: string
  responsable?: string
  estado: Estado
  prioridad: Prioridad
  inicio: string
  fin: string
  /** Lo declarado por quien la trae. */
  avance: number
  /** Lo que tocaría hoy según las fechas. Lo calcula Zaelyn, no la pantalla. */
  esperado: number
  depende: string[]
  hito: boolean
  critica: boolean
  /** Días de holgura. 0 = manda sobre la fecha final. */
  holgura: number
  /** Días de atraso contra la fecha de vencimiento. */
  atraso: number
  /** Qué la detiene, cuando está detenida. */
  bloqueo?: string
  /** Horas estimadas. `null` cuando nadie las ha puesto: por eso la ruta no da total. */
  minutos: number | null
  notas: Nota[]
}

export type Proyecto = {
  id: string
  corto: string
  nombre: string
  grupo: string
  inicio: string
  fin: string
  hoy: string
  salud: 'bien' | 'riesgo' | 'mal'
  avance: { real: number; esperado: number }
  actualizado: string
}

export type EstadoPlan = {
  proyecto: Proyecto
  personas: Persona[]
  fases: Fase[]
  actividades: Actividad[]
  curva: { fecha: string; esperado: number; real?: number }[]
  bitacora: { fecha: string; hora: string; autor: string; canal: string; texto: string; actividad?: string }[]
  zaelyn: { resumen: string; puntos: string[] }
  /** Cuántos renglones abiertos le faltan datos. Lo que impide calcular la ruta. */
  falta: { estimacion: number; fecha: number; inicio: number; dueno: number }
}

export type Grupo = {
  id: string
  nombre: string
  tipo: 'proyecto' | 'familia' | 'personal'
  rol: Rol
  planes: { id: string; nombre: string; avance: number; esperado: number; salud: Proyecto['salud']; abiertos: number }[]
}

// ── lecturas derivadas que NO son números nuevos, solo recortes ──────────────

export const porFase = (p: EstadoPlan, fase: string) =>
  p.actividades.filter((a) => a.fase === fase)

export const abiertas = (p: EstadoPlan) =>
  p.actividades.filter((a) => a.estado !== 'hecha')

export const enRiesgo = (p: EstadoPlan) =>
  p.actividades
    .filter((a) => a.estado !== 'hecha' && (a.atraso > 0 || a.estado === 'detenida'))
    .sort((x, y) => y.atraso - x.atraso || (y.estado === 'detenida' ? 1 : 0))

export const cadenaCritica = (p: EstadoPlan) =>
  p.actividades.filter((a) => a.critica).sort((x, y) => x.inicio.localeCompare(y.inicio))

export const persona = (p: EstadoPlan, id?: string) =>
  p.personas.find((x) => x.id === id)

export const actividad = (p: EstadoPlan, id: string) =>
  p.actividades.find((x) => x.id === id)
