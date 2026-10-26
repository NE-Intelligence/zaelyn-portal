/**
 * El contrato de lectura — la forma REAL que devuelve Zaelyn.
 *
 * Ref: Zaelyn DECISIONS #164, #167, #168, #169
 *
 * ── ESTE ARCHIVO ES UN ESPEJO, NO UN DISEÑO ────────────────────────────
 *
 * Cada tipo de aquí es el mismo que `src/services/plan-estado.ts` y
 * `src/services/portal.ts` declaran en Zaelyn, con los mismos nombres de
 * campo y los mismos valores. No se traduce nada: un `estatus` que allá vale
 * `en_curso` aquí vale `en_curso`, aunque la píldora diga «En curso».
 *
 * La versión anterior de este archivo era un contrato INVENTADO, escrito
 * antes de que el motor tuviera fases, hitos ni holgura. Tenía campos que
 * ninguna consulta podía llenar —`atraso` en días, `prioridad` en cuatro
 * cubetas, `critica` como bandera— y la pantalla los iba a calcular sola.
 * Eso es la segunda verdad: el día que el chat dijera 40% y la pantalla 43%,
 * nadie podría decir cuál está mal. Por eso ahora el espejo es literal.
 *
 * ── LO ÚNICO QUE SE HACE AQUÍ ES PRESENTACIÓN ──────────────────────────
 *
 * Nombres legibles, clases de CSS, iniciales de una persona, el color de una
 * fase. Nada de eso es un número: son maneras de pintar un dato que ya vino
 * medido. Si alguna vez hace falta una CUENTA que no esté en el payload, la
 * respuesta no es hacerla aquí — es pedirla al contrato.
 */

// ── los valores, tal como los dice el motor ─────────────────────────────────

export type Estatus = 'abierto' | 'en_curso' | 'bloqueado' | 'hecho' | 'cancelado'
export const ABIERTOS: readonly Estatus[] = ['abierto', 'en_curso', 'bloqueado']

export type Criticidad = 'ninguna' | 'atencion' | 'critica'
export type Confianza = 'alta' | 'media' | 'baja'
export type Veredicto = 'sin_fechas' | 'atrasado' | 'al_dia' | 'adelantado'

export type Senal =
  | 'atrasado' | 'vencido' | 'bloqueado' | 'sin_dueno' | 'eterno'
  | 'estancado' | 'sin_declarar' | 'salto' | 'retroceso'

export type Vista = 'resumen' | 'tablero' | 'gantt' | 'ruta' | 'equipo' | 'bitacora'

export const ESTATUS_NOMBRE: Record<Estatus, string> = {
  abierto: 'Sin iniciar',
  en_curso: 'En curso',
  bloqueado: 'Detenida',
  hecho: 'Hecha',
  cancelado: 'Cancelada',
}

/**
 * La clase de CSS de cada estatus.
 *
 * El CSS se escribió con otras palabras (`pendiente`, `curso`, `detenida`,
 * `hecha`) y aquí está el único puente entre los dos vocabularios. Va en una
 * tabla y no esparcido por las vistas a propósito: un puente que se ve es un
 * puente que se puede cruzar de vuelta.
 */
export const CLASE_ESTATUS: Record<Estatus, string> = {
  abierto: 'pendiente',
  en_curso: 'curso',
  bloqueado: 'detenida',
  hecho: 'hecha',
  cancelado: 'cancelada',
}

export const CRITICIDAD_NOMBRE: Record<Criticidad, string> = {
  ninguna: 'Normal',
  atencion: 'Atención',
  critica: 'Crítica',
}

export const VEREDICTO_NOMBRE: Record<Veredicto, string> = {
  sin_fechas: 'Sin fechas',
  atrasado: 'Atrasado',
  al_dia: 'En tiempo',
  adelantado: 'Adelantado',
}

/** La etiqueta corta, para una píldora. Con sus acentos: «sin dueno» no es una palabra. */
export const SENAL_CORTO: Record<Senal, string> = {
  atrasado: 'atrasado',
  vencido: 'vencido',
  bloqueado: 'esperando',
  sin_dueno: 'sin dueño',
  eterno: 'porcentaje eterno',
  estancado: 'estancado',
  sin_declarar: 'sin declarar',
  salto: 'subió de golpe',
  retroceso: 'retrocedió',
}

export const SENAL_NOMBRE: Record<Senal, string> = {
  atrasado: 'Va por debajo de lo esperado',
  vencido: 'La fecha ya pasó',
  bloqueado: 'Espera a algo',
  sin_dueno: 'Nadie la tiene',
  eterno: 'Lleva mucho con el mismo porcentaje',
  estancado: 'Nada se ha movido',
  sin_declarar: 'Debería haber empezado y nadie ha dicho nada',
  salto: 'Subió de golpe',
  retroceso: 'El porcentaje bajó',
}

/**
 * Los roles de Zaelyn, con lo que cada uno puede PEDIRLE a Zaelyn.
 *
 * El portal nunca escribe, así que el rol no habilita un botón: explica qué
 * puede hacer esa persona hablando. Son los nombres reales del motor (#160),
 * no cuatro categorías redondeadas.
 */
export const ROL_PUEDE: Record<string, string> = {
  observador: 'Monitor: puede preguntar lo que quiera. No puede interrumpir a nadie.',
  stakeholder: 'Stakeholder: pregunta lo que quiera, recibe el resumen ejecutivo de los lunes y manda comunicados al equipo.',
  miembro: 'Puede reportar el avance de lo suyo.',
  integrante: 'Ejecutor: reporta el avance de lo suyo.',
  a_cargo: 'Puede reportar el avance de lo suyo.',
  apoyo: 'Puede asignar y pedir avance.',
  lider: 'Líder: asigna, prioriza, mueve fechas y aprueba.',
  responsable: 'Todo lo anterior, más roles y alta de planes.',
  administrador: 'Sponsor: todo lo anterior, más roles, planes y la cuenta.',
}

export const VISTA_NOMBRE: Record<Vista, string> = {
  resumen: 'Resumen',
  tablero: 'Tablero',
  gantt: 'Gantt',
  ruta: 'Ruta crítica',
  equipo: 'Equipo',
  bitacora: 'Bitácora',
}

// ── el payload ──────────────────────────────────────────────────────────────

/** Un renglón del plan, YA MEDIDO. Espejo de `RenglonDePlan`. */
export type Renglon = {
  id: string
  clave: string | null
  texto: string
  estatus: Estatus
  abierto: boolean
  planId: string
  plan: string
  personaId: string | null
  quien: string | null
  prioridad: number
  inicia: string | null
  vence: string | null
  minutos: number | null
  antecesores: string[]
  fase: string | null
  faseOrden: number | null
  hito: boolean
  /** La ruta de grupos del archivo: «Entregable 3» → «DEV-03» (#197). */
  grupo?: string[] | null
  /** La duración planeada en días (#197). */
  dias?: number | null
  /** Quienes apoyan además del responsable (#197). */
  apoyos?: Array<{ id: string; nombre: string }>
  /** Soporte posterior al go-live: pesa poco en el avance (#198). */
  soporte?: boolean
  /** Días que puede recorrerse sin empujar nada. `null` = no se puede saber. */
  holgura: number | null
  /** Holgura cero: manda sobre la fecha final. */
  manda: boolean
  /** Qué la detiene, con el texto de lo que espera. */
  espera: string | null
  avance: number
  avanceEn: string | null
  /** Lo que tocaría hoy. `null` sin fecha límite: no se le puede medir. */
  esperado: number | null
  base: 'inicia' | 'creado' | null
  senales: Senal[]
  confianza: Confianza
  criticidad: Criticidad
  gravedad: number
  /** Cuántas notas lleva. Los textos van en la bitácora. */
  notas: number
  creadoEn: string
  movidoEn: string
}

export type Punto = {
  esperado: number | null
  declarado: number
  comprobado: number
  base: Base
  sinEstimacion: number
  sinFecha: number
  total: number
  cerrados: number
  cancelados: number
  senales: Partial<Record<Senal, number>>
  dudosos: number
  dichoSinCerrar: number
  /** Actividades de soporte post go-live, y cuánto pesaron en % (#198). */
  soporte?: number
  pesoSoporte?: number | null
}

export type PersonaEnPlan = {
  id: string
  nombre: string
  rol: string | null
  nivel: number
  tieneCuenta: boolean
  abiertos: number
  cerrados: number
  atrasados: number
}

export type Eslabon = {
  id: string
  texto: string
  quien: string | null
  estatus: Estatus
  abierto: boolean
  minutos: number | null
  vence: string | null
  criticidad: Criticidad
}

export type Ruta = {
  cadena: Eslabon[]
  /** Holgura cero: lo que de verdad manda sobre la fecha final. */
  manda: Eslabon[]
  minutos: number | null
  minutosRestantes: number | null
  faltanEstimacion: number
  base: 'dias' | 'eslabones'
  holguraDesconocida: number
  sinVence: number
  sinInicioDelSucesor: number
  ciclo: boolean
  enCiclo: string[]
  dependencias: number
  sueltos: number
  vence: string | null
  venceElPlan: string | null
}

export type PuntoDeCurva = {
  fecha: string
  esperado: number | null
  /** `null` de hoy en adelante: la curva no proyecta. */
  real: number | null
  comprobado: number | null
}

export type Curva = {
  puntos: PuntoDeCurva[]
  paso: number
  desde: string | null
  sinBitacora: number
  base: Base
}

/** Cómo se ponderó un avance (#197). Se dice siempre: cambia lo que significa. */
export type Base = 'minutos' | 'duracion' | 'cantidad'

export const comoSePesa = (b: Base): string =>
  b === 'minutos' ? 'ponderado por horas' : b === 'duracion' ? 'ponderado por duración' : 'por número de actividades'

/** El avance de un grupo del archivo —un entregable— a todos sus niveles (#197). */
export type GrupoDePlan = {
  ruta: string[]
  nombre: string
  nivel: number
  fase: string | null
  punto: Punto
  total: number
  abiertos: number
  hitos: number
  inicia: string | null
  vence: string | null
}

export type FaseDePlan = {
  /** `null` = los renglones que no traen fase. No se esconden. */
  nombre: string | null
  orden: number | null
  punto: Punto
  total: number
  abiertos: number
  hitos: number
}

export type Narrativa = { resumen: string; puntos: string[] }

export type Suceso = {
  pendienteId: string
  pendiente: string
  clave: string | null
  evento: string
  texto: string | null
  avance: number | null
  /** La fecha de una prórroga (#174). Nulo en los demás eventos. */
  hasta: string | null
  en: string
  quien: string | null
}

export type EstadoDePlan = {
  grupo: { id: string; nombre: string }
  plan: { id: string; clave: string; nombre: string } | null
  planes: Array<{ id: string; clave: string; nombre: string }>
  hoy: string
  punto: Punto
  veredicto: Veredicto
  renglones: Renglon[]
  personas: PersonaEnPlan[]
  falta: { estimacion: number; fecha: number; inicio: number; dueno: number }
}

export type VistaDePlan = {
  estado: EstadoDePlan
  ruta: Ruta
  curva: Curva
  fases: FaseDePlan[]
  /** Desde #197. Opcional: el demo y un motor viejo no lo traen. */
  grupos?: GrupoDePlan[]
  narrativa: Narrativa
  bitacora: Suceso[]
  /** Los ids de lo abierto, ordenados por lo que cuesta no verlo hoy. */
  riesgo: string[]
  rol: string | null
  nivel: number
}

export type GrupoEnPortal = {
  id: string
  nombre: string
  /** family | work | study | other. Decide qué vistas tiene el lienzo. */
  clase: string
  rol: string | null
  nivel: number
  planes: Array<{
    id: string
    clave: string
    nombre: string
    abiertos: number
    vencidos: number
    hasta: string | null
  }>
}

// ── recortes: ni uno de éstos es un número nuevo ────────────────────────────

export const abiertas = (e: EstadoDePlan) => e.renglones.filter(r => r.abierto)

/** El orden del riesgo lo decidió el contrato; aquí solo se resuelven los ids. */
export const enRiesgo = (v: VistaDePlan): Renglon[] => {
  const porId = new Map(v.estado.renglones.map(r => [r.id, r]))
  return v.riesgo.map(id => porId.get(id)).filter((r): r is Renglon => r !== undefined)
}

export const deFase = (e: EstadoDePlan, fase: string | null) =>
  e.renglones.filter(r => (r.fase ?? null) === fase)

export const persona = (e: EstadoDePlan, id?: string | null) =>
  id ? e.personas.find(p => p.id === id) : undefined

/** El color de una fase sale de su ORDEN, que es un dato del archivo. */
export const colorDeFase = (orden: number | null): number =>
  orden === null ? 6 : ((orden - 1) % 5) + 1

/** Dos iniciales de un nombre. Presentación, no dato. */
export const iniciales = (nombre: string): string =>
  nombre.replace(/^@/, '').split(/[\s._-]+/).filter(Boolean).slice(0, 2)
    .map(x => x[0]!.toUpperCase()).join('') || '?'

export const corto = (nombre: string): string => {
  const limpio = nombre.replace(/^@/, '')
  const [uno, dos] = limpio.split(/\s+/)
  return dos ? `${uno} ${dos[0]!.toUpperCase()}.` : limpio
}

/**
 * El veredicto como salud, para las tres palabras de la etiqueta.
 *
 * `sin_fechas` NO se pinta como «en tiempo»: un plan al que no se le puede
 * medir el tiempo no está en tiempo, y teñirlo de verde sería la mentira más
 * cómoda de toda la pantalla.
 */
export const SALUD: Record<Veredicto, 'bien' | 'riesgo' | 'mal' | 'mudo'> = {
  adelantado: 'bien',
  al_dia: 'bien',
  atrasado: 'mal',
  sin_fechas: 'mudo',
}
