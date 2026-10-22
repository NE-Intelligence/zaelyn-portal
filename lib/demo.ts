/**
 * El ejemplo: un `VistaDePlan` inventado, con la forma exacta del real.
 *
 * ── ESTE ARCHIVO HACE DE SERVIDOR, NO DE PANTALLA ──────────────────────
 *
 * Aquí sí se calculan cosas —el esperado de cada renglón, la holgura, la
 * curva— y eso no contradice nada: este módulo ocupa el lugar de Zaelyn, no
 * el de la vista. Las vistas no saben de dónde viene el objeto, y ésa es la
 * prueba: la misma pantalla pinta esto y pinta los datos reales sin cambiar
 * una línea.
 *
 * Las fórmulas son las del motor (Zaelyn #151, #168): esperado lineal entre
 * inicio y vencimiento, holgura hacia atrás desde el arranque del sucesor. Si
 * algún día difieren, el ejemplo se verá raro y eso es justo lo que se quiere
 * — un ejemplo que no puede estar mal no prueba nada.
 */
import type {
  Criticidad, Curva, EstadoDePlan, Estatus, FaseDePlan, GrupoEnPortal, Narrativa,
  PersonaEnPlan, Punto, Renglon, Ruta, Senal, Suceso, VistaDePlan,
} from './plan'

const HOY = '2026-11-18'
const DIA = 86_400_000
const dia = (s: string) => Date.parse(`${s}T00:00:00Z`)
const dias = (a: string, b: string) => Math.round((dia(b) - dia(a)) / DIA)
const mas = (s: string, n: number) => new Date(dia(s) + n * DIA).toISOString().slice(0, 10)

const PERSONAS: PersonaEnPlan[] = [
  { id: 'p1', nombre: '@marcela', rol: 'responsable', nivel: 3, tieneCuenta: true, abiertos: 0, cerrados: 0, atrasados: 0 },
  { id: 'p2', nombre: '@efrain', rol: 'lider', nivel: 2, tieneCuenta: true, abiertos: 0, cerrados: 0, atrasados: 0 },
  { id: 'p3', nombre: '@lupita', rol: 'integrante', nivel: 1, tieneCuenta: true, abiertos: 0, cerrados: 0, atrasados: 0 },
  { id: 'p4', nombre: 'Termika', rol: 'integrante', nivel: 1, tieneCuenta: false, abiertos: 0, cerrados: 0, atrasados: 0 },
  { id: 'p5', nombre: '@rodrigo', rol: 'observador', nivel: 0, tieneCuenta: true, abiertos: 0, cerrados: 0, atrasados: 0 },
]

type Semilla = {
  clave: string
  texto: string
  fase: string
  quien: string | null
  inicia: string
  vence: string
  estatus: Estatus
  avance: number
  horas: number | null
  antecesores?: string[]
  hito?: boolean
  notas?: number
}

/**
 * Un proyecto creíble: tres fases, dos caminos que confluyen —para que la
 * holgura se vea— un hito, un renglón sin horas y uno sin dueño.
 */
const SEMILLA: Semilla[] = [
  { clave: 'A-01', texto: 'Levantar el alcance con el cliente', fase: 'Definición', quien: 'p1', inicia: '2026-09-07', vence: '2026-09-18', estatus: 'hecho', avance: 100, horas: 24 },
  { clave: 'A-02', texto: 'Cerrar el cuadro de cargas', fase: 'Definición', quien: 'p2', inicia: '2026-09-21', vence: '2026-10-02', estatus: 'hecho', avance: 100, horas: 32, antecesores: ['A-01'] },
  { clave: 'A-03', texto: 'Aprobación del comité técnico', fase: 'Definición', quien: 'p1', inicia: '2026-10-05', vence: '2026-10-09', estatus: 'hecho', avance: 100, horas: 8, antecesores: ['A-02'], hito: true },

  { clave: 'B-01', texto: 'Ingeniería de detalle del tablero', fase: 'Ingeniería', quien: 'p2', inicia: '2026-10-12', vence: '2026-11-13', estatus: 'en_curso', avance: 70, horas: 120, antecesores: ['A-03'], notas: 3 },
  { clave: 'B-02', texto: 'Memoria de cálculo y planos', fase: 'Ingeniería', quien: 'p3', inicia: '2026-10-12', vence: '2026-10-30', estatus: 'hecho', avance: 100, horas: 60, antecesores: ['A-03'] },
  { clave: 'B-03', texto: 'Tramitar el permiso municipal', fase: 'Ingeniería', quien: 'p3', inicia: '2026-10-19', vence: '2026-11-06', estatus: 'hecho', avance: 100, horas: 16, antecesores: ['A-03'] },
  { clave: 'B-04', texto: 'Revisión de interferencias en sitio', fase: 'Ingeniería', quien: null, inicia: '2026-11-02', vence: '2026-11-13', estatus: 'abierto', avance: 0, horas: null, antecesores: ['B-02'] },

  { clave: 'C-01', texto: 'Fabricación del tablero principal', fase: 'Obra', quien: 'p4', inicia: '2026-11-16', vence: '2026-12-11', estatus: 'abierto', avance: 10, horas: 200, antecesores: ['B-01'] },
  { clave: 'C-02', texto: 'Obra civil de la base', fase: 'Obra', quien: 'p4', inicia: '2026-11-09', vence: '2026-11-27', estatus: 'en_curso', avance: 25, horas: 80, antecesores: ['B-03'] },
  { clave: 'C-03', texto: 'Montaje y conexionado', fase: 'Obra', quien: 'p2', inicia: '2026-12-12', vence: '2027-01-08', estatus: 'bloqueado', avance: 0, horas: 160, antecesores: ['C-01', 'C-02'] },
  { clave: 'C-04', texto: 'Pruebas en vacío', fase: 'Obra', quien: 'p3', inicia: '2027-01-09', vence: '2027-01-20', estatus: 'abierto', avance: 0, horas: 40, antecesores: ['C-03'] },
  { clave: 'C-05', texto: 'Energización y entrega', fase: 'Obra', quien: 'p1', inicia: '2027-01-21', vence: '2027-01-22', estatus: 'abierto', avance: 0, horas: 16, antecesores: ['C-04'], hito: true },
]

// ── las mismas cuentas que hace el motor ────────────────────────────────────

const esperadoDe = (s: Semilla, cuando: string): number => {
  const total = dias(s.inicia, s.vence)
  if (total <= 0) return dias(cuando, s.vence) <= 0 ? 100 : 0
  const corridos = dias(s.inicia, cuando)
  if (corridos <= 0) return 0
  if (corridos >= total) return 100
  return Math.round((corridos / total) * 100)
}

const senalesDe = (s: Semilla, esperado: number): Senal[] => {
  if (s.estatus === 'hecho' || s.estatus === 'cancelado') return []
  const out: Senal[] = []
  if (esperado - s.avance >= 15) out.push('atrasado')
  if (s.vence < HOY) out.push('vencido')
  if (s.estatus === 'bloqueado') out.push('bloqueado')
  if (!s.quien) out.push('sin_dueno')
  return out
}

const critDe = (se: Senal[]): Criticidad => {
  const duras = se.filter(x => x === 'vencido' || x === 'sin_dueno' || x === 'bloqueado').length
  if (se.includes('vencido') && duras >= 2) return 'critica'
  if (se.length >= 2) return 'critica'
  return se.length ? 'atencion' : 'ninguna'
}

/** El paso hacia atrás, igual que `cpm.ts`: del final al principio. */
function holguras(): Map<string, number | null> {
  const porClave = new Map(SEMILLA.map(s => [s.clave, s]))
  const sucesores = new Map<string, string[]>()
  for (const s of SEMILLA) {
    for (const a of s.antecesores ?? []) {
      sucesores.set(a, [...(sucesores.get(a) ?? []), s.clave])
    }
  }
  const fin = SEMILLA.map(s => s.vence).sort().at(-1)!
  const out = new Map<string, number | null>()
  for (const s of [...SEMILLA].reverse()) {
    const detras = (sucesores.get(s.clave) ?? []).map(c => porClave.get(c)!)
    if (!detras.length) { out.set(s.clave, dias(s.vence, fin)); continue }
    out.set(s.clave, Math.min(...detras.map(d =>
      dias(s.vence, d.inicia) - 1 + (out.get(d.clave) ?? 0))))
  }
  return out
}

const HOLGURA = holguras()
const ID = new Map(SEMILLA.map((s, i) => [s.clave, `r${i + 1}`]))

const RENGLONES: Renglon[] = SEMILLA.map(s => {
  const abierto = s.estatus === 'abierto' || s.estatus === 'en_curso' || s.estatus === 'bloqueado'
  const esperado = esperadoDe(s, HOY)
  const senales = senalesDe(s, esperado)
  const h = HOLGURA.get(s.clave) ?? null
  const fases = [...new Set(SEMILLA.map(x => x.fase))]
  return {
    id: ID.get(s.clave)!,
    clave: s.clave,
    texto: s.texto,
    estatus: s.estatus,
    abierto,
    planId: 'plan-andes',
    plan: 'Subestación Andes',
    personaId: s.quien,
    quien: PERSONAS.find(p => p.id === s.quien)?.nombre ?? null,
    prioridad: 100,
    inicia: s.inicia,
    vence: s.vence,
    minutos: s.horas === null ? null : s.horas * 60,
    antecesores: (s.antecesores ?? []).map(c => ID.get(c)!),
    fase: s.fase,
    faseOrden: fases.indexOf(s.fase) + 1,
    hito: s.hito ?? false,
    holgura: h,
    manda: h !== null && h <= 0,
    espera: (s.antecesores ?? [])
      .map(c => SEMILLA.find(x => x.clave === c))
      .filter(x => x && x.estatus !== 'hecho' && x.estatus !== 'cancelado')
      .map(x => x!.texto).join(', ') || null,
    avance: s.avance,
    avanceEn: abierto && s.avance > 0 ? `${mas(HOY, -9)}T16:20:00.000Z` : null,
    esperado: abierto ? esperado : null,
    base: 'inicia',
    senales,
    confianza: senales.includes('atrasado') ? 'media' : 'alta',
    criticidad: critDe(senales),
    gravedad: senales.length * 20,
    notas: s.notas ?? 0,
    creadoEn: '2026-09-01T17:00:00.000Z',
    movidoEn: `${mas(HOY, -4)}T15:00:00.000Z`,
  }
})

function puntoDe(rs: Renglon[], cuando = HOY): Punto {
  const vivos = rs.filter(r => r.estatus !== 'cancelado')
  const sinEstimacion = vivos.filter(r => !r.minutos).length
  const base: Punto['base'] = sinEstimacion === 0 && vivos.length ? 'minutos' : 'cantidad'
  const peso = (r: Renglon) => (base === 'minutos' ? (r.minutos ?? 1) : 1)
  const total = vivos.reduce((s, r) => s + peso(r), 0) || 1
  let conFecha = 0, espAcum = 0
  const senales: Partial<Record<Senal, number>> = {}
  for (const r of vivos) {
    const s = SEMILLA.find(x => ID.get(x.clave) === r.id)!
    const esp = esperadoDe(s, cuando)
    conFecha += peso(r); espAcum += peso(r) * esp
    for (const x of r.senales) senales[x] = (senales[x] ?? 0) + 1
  }
  return {
    esperado: conFecha ? Math.round(espAcum / conFecha) : null,
    declarado: Math.round(vivos.reduce((s, r) => s + peso(r) * r.avance, 0) / total),
    comprobado: Math.round(vivos.reduce((s, r) => s + peso(r) * (r.estatus === 'hecho' ? 100 : 0), 0) / total),
    base,
    sinEstimacion,
    sinFecha: 0,
    total: vivos.length,
    cerrados: vivos.filter(r => r.estatus === 'hecho').length,
    cancelados: rs.length - vivos.length,
    senales,
    dudosos: vivos.filter(r => r.confianza === 'baja').length,
    dichoSinCerrar: vivos.filter(r => r.abierto && r.avance >= 100).length,
  }
}

const PUNTO = puntoDe(RENGLONES)

const FASES: FaseDePlan[] = [...new Set(SEMILLA.map(s => s.fase))].map((nombre, i) => {
  const rs = RENGLONES.filter(r => r.fase === nombre)
  return {
    nombre, orden: i + 1, punto: puntoDe(rs), total: rs.length,
    abiertos: rs.filter(r => r.abierto).length,
    hitos: rs.filter(r => r.hito).length,
  }
})

const porId = new Map(RENGLONES.map(r => [r.id, r]))
const eslabon = (r: Renglon) => ({
  id: r.id, texto: r.texto, quien: r.quien, estatus: r.estatus,
  abierto: r.abierto, minutos: r.minutos, vence: r.vence, criticidad: r.criticidad,
})

/** La cadena más larga en días, desde A-01 hasta la entrega. */
const CADENA = ['A-01', 'A-02', 'A-03', 'B-01', 'C-01', 'C-03', 'C-04', 'C-05']
  .map(c => porId.get(ID.get(c)!)!)

const RUTA: Ruta = {
  cadena: CADENA.map(eslabon),
  manda: RENGLONES.filter(r => r.manda).map(eslabon),
  minutos: CADENA.some(r => r.minutos === null) ? null : CADENA.reduce((s, r) => s + (r.minutos ?? 0), 0),
  minutosRestantes: CADENA.filter(r => r.abierto).some(r => r.minutos === null)
    ? null : CADENA.filter(r => r.abierto).reduce((s, r) => s + (r.minutos ?? 0), 0),
  faltanEstimacion: CADENA.filter(r => r.minutos === null).length,
  base: 'dias',
  holguraDesconocida: 0,
  sinVence: 0,
  sinInicioDelSucesor: 0,
  ciclo: false,
  enCiclo: [],
  dependencias: SEMILLA.reduce((s, x) => s + (x.antecesores?.length ?? 0), 0),
  sueltos: 0,
  vence: CADENA.at(-1)!.vence,
  venceElPlan: RENGLONES.map(r => r.vence!).sort().at(-1)!,
}

/** La curva, semana a semana. La real se corta en hoy: no se proyecta. */
function curva(): Curva {
  const ini = SEMILLA.map(s => s.inicia).sort()[0]!
  const fin = RUTA.venceElPlan!
  const puntos: Curva['puntos'] = []
  for (let d = 0; d <= dias(ini, fin); d += 7) {
    const f = mas(ini, d)
    const futuro = f > HOY
    const p = puntoDe(RENGLONES, f)
    // Lo declarado «a esa fecha» se simula con lo cerrado para entonces más lo
    // que hoy se declara de lo que ya había arrancado. Es un ejemplo, y lo
    // único que tiene que ser verdad es la FORMA.
    const real = Math.round(
      RENGLONES.filter(r => r.inicia! <= f)
        .reduce((s, r) => s + (r.vence! <= f && r.estatus === 'hecho' ? 100 : r.avance), 0)
      / (RENGLONES.length || 1))
    puntos.push({
      fecha: f,
      esperado: p.esperado,
      real: futuro ? null : real,
      comprobado: futuro ? null : Math.round(
        RENGLONES.filter(r => r.estatus === 'hecho' && r.vence! <= f).length / RENGLONES.length * 100),
    })
  }
  if (puntos.at(-1)!.fecha !== fin) {
    puntos.push({ fecha: fin, esperado: 100, real: null, comprobado: null })
  }
  return { puntos, paso: 7, desde: '2026-09-14', sinBitacora: 0, base: PUNTO.base }
}

function narrativa(): Narrativa {
  const abiertos = RENGLONES.filter(r => r.abierto)
  const mandan = RENGLONES.filter(r => r.manda && r.abierto)
  const criticos = abiertos.filter(r => r.criticidad === 'critica')
  const huecos: string[] = []
  const sinDueno = abiertos.filter(r => !r.personaId).length
  const sinHoras = abiertos.filter(r => r.minutos === null).length
  if (sinDueno) huecos.push(`${sinDueno} sin dueño`)
  if (sinHoras) huecos.push(`${sinHoras} sin horas estimadas`)
  return {
    resumen: `Va al ${PUNTO.declarado}% cuando hoy tocaba ${PUNTO.esperado}%. `
      + (PUNTO.base === 'minutos'
        ? 'El porcentaje está ponderado por las horas estimadas.'
        : `El porcentaje cuenta por número de actividades: ${PUNTO.sinEstimacion} no traen `
          + 'estimación, así que no se puede ponderar por esfuerzo.'),
    puntos: [
      ...(mandan.length
        ? [`${mandan.length} actividad(es) no tienen margen: si se mueven, se mueve la `
          + `fecha final. La primera es «${mandan[0]!.texto}».`]
        : []),
      ...(criticos.length
        ? [`${criticos.length} requiere(n) atención hoy, empezando por `
          + `«${criticos[0]!.texto}»${criticos[0]!.quien ? ` (${criticos[0]!.quien})` : ''}.`]
        : []),
      ...(huecos.length
        ? [`De las ${abiertos.length} abiertas: ${huecos.join(', ')}. `
          + 'Mientras falten, hay cuentas que prefiero no hacer.']
        : []),
    ],
  }
}

const BITACORA: Suceso[] = [
  { pendienteId: ID.get('C-02')!, pendiente: 'Obra civil de la base', clave: 'C-02', evento: 'prorroga_aprobada', texto: 'llovió tres días y no se pudo colar', avance: null, hasta: `${mas(HOY, 6)}`, en: `${mas(HOY, -1)}T19:02:00.000Z`, quien: '@marcela' },
  { pendienteId: ID.get('C-02')!, pendiente: 'Obra civil de la base', clave: 'C-02', evento: 'prorroga_pedida', texto: 'llovió tres días y no se pudo colar', avance: null, hasta: `${mas(HOY, 6)}`, en: `${mas(HOY, -1)}T18:30:00.000Z`, quien: 'Termika' },
  { pendienteId: ID.get('C-02')!, pendiente: 'Obra civil de la base', clave: 'C-02', evento: 'avance', texto: null, avance: 25, hasta: null, en: `${mas(HOY, -1)}T18:12:00.000Z`, quien: 'Termika' },
  { pendienteId: ID.get('B-01')!, pendiente: 'Ingeniería de detalle del tablero', clave: 'B-01', evento: 'comentado', texto: 'el cliente pidió cambiar el interruptor principal, ya está en el plano', avance: null, hasta: null, en: `${mas(HOY, -2)}T22:40:00.000Z`, quien: '@efrain' },
  { pendienteId: ID.get('B-03')!, pendiente: 'Tramitar el permiso municipal', clave: 'B-03', evento: 'hecho', texto: null, avance: null, hasta: null, en: `${mas(HOY, -12)}T17:05:00.000Z`, quien: '@lupita' },
  { pendienteId: ID.get('B-01')!, pendiente: 'Ingeniería de detalle del tablero', clave: 'B-01', evento: 'avance', texto: null, avance: 70, hasta: null, en: `${mas(HOY, -9)}T16:20:00.000Z`, quien: '@efrain' },
  { pendienteId: ID.get('C-03')!, pendiente: 'Montaje y conexionado', clave: 'C-03', evento: 'bloqueado', texto: null, avance: null, hasta: null, en: `${mas(HOY, -15)}T15:00:00.000Z`, quien: '@marcela' },
  { pendienteId: ID.get('B-02')!, pendiente: 'Memoria de cálculo y planos', clave: 'B-02', evento: 'hecho', texto: null, avance: null, hasta: null, en: '2026-10-30T19:30:00.000Z', quien: '@lupita' },
  { pendienteId: ID.get('A-03')!, pendiente: 'Aprobación del comité técnico', clave: 'A-03', evento: 'hecho', texto: null, avance: null, hasta: null, en: '2026-10-09T20:00:00.000Z', quien: '@marcela' },
]

const ESTADO: EstadoDePlan = {
  grupo: { id: 'g-andes', nombre: 'Andes' },
  plan: { id: 'plan-andes', clave: 'ANDES', nombre: 'Subestación Andes' },
  planes: [{ id: 'plan-andes', clave: 'ANDES', nombre: 'Subestación Andes' }],
  hoy: HOY,
  punto: PUNTO,
  veredicto: PUNTO.esperado !== null && PUNTO.declarado < PUNTO.esperado - 5 ? 'atrasado' : 'al_dia',
  renglones: RENGLONES,
  personas: PERSONAS.map(p => ({
    ...p,
    abiertos: RENGLONES.filter(r => r.personaId === p.id && r.abierto).length,
    cerrados: RENGLONES.filter(r => r.personaId === p.id && r.estatus === 'hecho').length,
    atrasados: RENGLONES.filter(r => r.personaId === p.id && r.abierto && r.vence! < HOY).length,
  })),
  falta: {
    estimacion: RENGLONES.filter(r => r.abierto && r.minutos === null).length,
    fecha: 0,
    inicio: 0,
    dueno: RENGLONES.filter(r => r.abierto && !r.personaId).length,
  },
}

export const DEMO: VistaDePlan = {
  estado: ESTADO,
  ruta: RUTA,
  curva: curva(),
  fases: FASES,
  narrativa: narrativa(),
  // En orden, como viene el real (`ORDER BY en DESC`). A mano se coló un
  // «6 nov» antes de un «9 nov» y la bitácora se leía como si saltara.
  bitacora: [...BITACORA].sort((a, b) => b.en.localeCompare(a.en)),
  riesgo: [...RENGLONES]
    .filter(r => r.abierto)
    .sort((a, b) => b.gravedad - a.gravedad
      || (a.vence ?? '9999').localeCompare(b.vence ?? '9999'))
    .map(r => r.id),
  rol: 'responsable',
  nivel: 3,
}

export const GRUPOS_DEMO: GrupoEnPortal[] = [
  {
    id: 'g-andes', nombre: 'Andes', clase: 'work', rol: 'responsable', nivel: 3,
    planes: [{
      id: 'plan-andes', clave: 'ANDES', nombre: 'Subestación Andes',
      abiertos: RENGLONES.filter(r => r.abierto).length,
      vencidos: RENGLONES.filter(r => r.abierto && r.vence! < HOY).length,
      hasta: RUTA.venceElPlan,
    }],
  },
]
