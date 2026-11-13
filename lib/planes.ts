/**
 * Los planes y módulos de Zaelyn tal como se PUBLICAN — lista `2026-11`
 * (decisiones/2026-11-13-planes-por-ambito; Core: docs/decisiones/2026-11-13-planes-por-ambito,
 * `src/shared/planes.ts`).
 *
 * Es el ÚNICO lugar del portal con precios de lista: landings, `/precios` y la
 * comparación leen de aquí. Si cambia un precio, cambia en el Core primero y
 * aquí después. A quien ya paga NUNCA se le calcula su precio con esto: lo
 * dice `/portal/plan` (conserva su lista `2026-10` y su descuento).
 *
 * Precios netos en USD al mes; el IVA o el sales tax van aparte.
 */

/** Las claves del Core. Los nombres viejos (Kickoff, Sprint, Tribu) ya no se muestran. */
export type ClavePlan = 'free' | 'base' | 'family' | 'profesional' | 'pro'

/** Con qué color y nombre se ve cada ámbito (la regla de vocabulario del Core). */
export type Ambito = 'personal' | 'metas' | 'familia' | 'grupo' | 'pmo' | 'modulo'

export const AMBITO: Record<Ambito, { nombre: string; color: string }> = {
  personal: { nombre: 'Personal', color: 'var(--z-personal)' },
  metas: { nombre: 'Metas', color: 'var(--z-personal)' },
  familia: { nombre: 'Familia', color: 'var(--z-familia)' },
  grupo: { nombre: 'Grupo', color: '#2f9c95' },
  pmo: { nombre: 'Proyecto', color: 'var(--z-proyectos)' },
  modulo: { nombre: 'Módulo', color: '#b4690e' },
}

export type Plan = {
  clave: ClavePlan
  nombre: string
  /** USD netos al mes; 0 = gratis. */
  precio: number
  ruta: string
  ambito: Ambito
  /** «Para quién», en tres palabras. */
  para: string
  objetivo: string
  incluye: string[]
  restricciones: string[]
  /** El tramo de fundador vigente aplica a este plan (no a Profesional, por ahora). */
  fundador: boolean
  /** Hoy el Core solo acepta pago anual en PMO. */
  anual: boolean
  cta: string
}

export const PLANES: Plan[] = [
  {
    clave: 'free', nombre: 'Zaelyn Personal', precio: 0, ruta: '/personal', ambito: 'personal',
    para: 'Para empezar',
    objetivo: 'Que nada se te olvide, gratis, en el teléfono.',
    incluye: ['Recordatorios y eventos', 'Actividades, metas y notas', 'Tu memoria', 'Chats con otras personas', 'App y Telegram'],
    restricciones: ['Sin portal', '5 recordatorios activos', 'Memoria de 15 días', 'Hilo de 5 días', '10 fotos o documentos y 5 min de voz al mes', 'Sin chat con IA'],
    fundador: false, anual: false, cta: 'Empieza gratis',
  },
  {
    clave: 'base', nombre: 'Zaelyn Personal+', precio: 7.99, ruta: '/personal-plus', ambito: 'personal',
    para: 'Para ti',
    objetivo: 'Lo tuyo sin topes, con IA que trabaja por ti y un portal.',
    incluye: ['Todo Personal, sin topes', 'Portal web', 'Chat con IA que se guarda en tu Memoria', 'Voz, fotos y documentos', 'Brief diario y resúmenes'],
    restricciones: ['Un usuario', 'Tope mensual de IA de trabajo (lo ves en Plan y uso)'],
    fundador: true, anual: false, cta: 'Contratar Personal+',
  },
  {
    clave: 'family', nombre: 'Zaelyn Familia', precio: 14.99, ruta: '/familia', ambito: 'familia',
    para: 'Para tu casa',
    objetivo: 'Que en casa cada quien sepa qué le toca, sin perseguir a nadie.',
    incluye: ['Todo Personal+', 'Memoria compartida de la familia', 'Quién lleva y quién trae', 'Actividades familiares con planes', 'Obligaciones y premios', '4 integrantes contando al responsable'],
    restricciones: ['+2 integrantes por 4.99 USD', 'Los integrantes sin pago tienen Personal: app y Telegram, sin portal', 'No incluye Grupos de trabajo (Profesional + Familia a mitad: 7.50 USD)'],
    fundador: true, anual: false, cta: 'Contratar Familia',
  },
  {
    clave: 'profesional', nombre: 'Zaelyn Profesional', precio: 19.99, ruta: '/profesional', ambito: 'grupo',
    para: 'Para tu trabajo',
    objetivo: 'Grupos de trabajo donde todos comparten lo mismo y cada quien lleva lo suyo.',
    incluye: ['Todo Personal+', 'Grupos de trabajo sin tope de miembros', 'Chat y memoria del grupo', 'Correo y calendario', 'Registro de horas con Excel', 'Metas propias en cada grupo'],
    restricciones: ['No asigna actividades a otros', 'Sin roles ni aprobaciones (eso es PMO)', 'Sin asientos'],
    fundador: false, anual: false, cta: 'Contratar Profesional',
  },
  {
    clave: 'pro', nombre: 'Zaelyn PMO', precio: 49.99, ruta: '/pmo', ambito: 'pmo',
    para: 'Módulo de proyectos',
    objetivo: 'Proyectos con dueño, plan y seguimiento, sin hojas de cálculo sueltas.',
    incluye: ['Profesional y Personal+ incluidos', 'Proyectos sin tope', 'Dueño, roles y aprobaciones', 'Plan de actividades, importación de Excel', 'Materiales, estimaciones y reportes', 'Sponsor, 1 Líder o PMO y 3 Ejecutores'],
    restricciones: ['Más asientos con complementos', 'Créditos de IA del proyecto aparte'],
    fundador: true, anual: true, cta: 'Contratar PMO',
  },
]

export const plan = (c: ClavePlan) => PLANES.find(p => p.clave === c)!

/** «Paga 10 meses, usa 12». Hoy solo PMO. */
export const MESES_ANUAL = 10

/** Familia como complemento de Profesional o PMO: la rama más barata, a mitad. */
export const FAMILIA_A_MITAD = 7.5

export const COMPLEMENTOS: { de: ClavePlan; nombre: string; precio: number; nota?: string }[] = [
  { de: 'family', nombre: '+2 integrantes', precio: 4.99 },
  { de: 'pro', nombre: 'Líder', precio: 12 },
  { de: 'pro', nombre: 'Ejecutor', precio: 6 },
  { de: 'pro', nombre: 'Supervisor', precio: 9 },
  { de: 'pro', nombre: 'Visibilidad', precio: 9, nota: 'por 3 asientos' },
  { de: 'pro', nombre: 'Stakeholder o Monitor', precio: 1.99 },
  { de: 'pro', nombre: '15 créditos de IA', precio: 4.99 },
]

export type Modulo = {
  clave: string
  nombre: string
  que: string
  estado: 'gratis' | 'pronto'
  ejemplo?: { yo: string; titulo: string; dato: string; opciones: string[] }
}

export const MODULOS: Modulo[] = [
  {
    clave: 'kore', nombre: 'Kore', que: 'Salud y entrenamiento: tu plan, tu avance y tus hábitos.', estado: 'gratis',
    ejemplo: { yo: '¿Cómo voy esta semana?', titulo: 'Tu semana en Kore', dato: '3 de 4 entrenamientos · agua 5/7 días', opciones: ['Agendar el que falta'] },
  },
  {
    clave: 'tcgbusters', nombre: 'TCGBusters', que: 'Cartas coleccionables: buscar, apartar, comprar y vender.', estado: 'gratis',
    ejemplo: { yo: 'Busca Charizard ex', titulo: '3 resultados', dato: 'Desde 38 USD · 2 tiendas cerca', opciones: ['Apartar', 'Ver más'] },
  },
  { clave: 'zaebench', nombre: 'ZaeBench', que: 'Próximamente.', estado: 'pronto' },
  { clave: 'ams', nombre: 'AMS', que: 'Próximamente.', estado: 'pronto' },
  { clave: 'assessments', nombre: 'Assessments', que: 'Próximamente.', estado: 'pronto' },
]

export const usd = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2))
