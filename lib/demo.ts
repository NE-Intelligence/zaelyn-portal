/**
 * Datos de ejemplo.
 *
 * Esto NO es de nadie: el proyecto, las personas y las fechas están
 * inventados. Existe para que el portal se pueda ver y revisar antes de que
 * exista el endpoint que devuelve `estadoDePlan()` desde Zaelyn.
 *
 * La pantalla lo dice en voz alta con la cinta de «datos de ejemplo». El día
 * que el endpoint exista, se cambia la fuente y no se toca ni un componente,
 * porque los dos devuelven la misma forma: `EstadoPlan`.
 *
 * Los números son consistentes a propósito: `esperado` sale de las fechas
 * contra el día de hoy, no de una cifra puesta a mano. Un dato de ejemplo que
 * se contradice enseña a desconfiar de la pantalla.
 */
import type { Actividad, EstadoPlan, Estado, Grupo, Prioridad } from './plan'

const HOY = '2026-11-18'

const dia = (s: string) => new Date(s + 'T00:00:00Z').getTime()
const DIA = 86_400_000
const dias = (a: string, b: string) => Math.round((dia(b) - dia(a)) / DIA)
const suma = (s: string, n: number) => new Date(dia(s) + n * DIA).toISOString().slice(0, 10)

/** Lo que tocaría hoy según las fechas. Es lo que Zaelyn calcula; aquí se imita. */
function esperadoDe(inicio: string, fin: string, hoy = HOY): number {
  const total = Math.max(dias(inicio, fin), 1)
  const corrido = dias(inicio, hoy)
  if (corrido <= 0) return 0
  if (corrido >= total) return 100
  return Math.round((corrido / total) * 100)
}

type Fila = [
  clave: string,
  nombre: string,
  fase: string,
  responsable: string | undefined,
  inicio: string,
  fin: string,
  avance: number,
  estado: Estado,
  prioridad: Prioridad,
  depende: string[],
  extra?: Partial<Actividad>,
]

const FILAS: Fila[] = [
  ['A01', 'Levantar el proceso actual de compras', 'f1', 'mariana', '2026-09-28', '2026-10-09', 100, 'hecha', 'alta', [], { minutos: 2400 }],
  ['A02', 'Mapear catálogos de proveedor', 'f1', 'rafa', '2026-10-05', '2026-10-16', 100, 'hecha', 'media', ['A01'], { minutos: 1800 }],
  ['A03', 'Validar el diseño con el área usuaria', 'f1', 'mariana', '2026-10-12', '2026-10-23', 100, 'hecha', 'alta', ['A01'], { minutos: 1200, hito: true }],
  ['A04', 'Definir la política de aprobaciones', 'f1', 'sofia', '2026-10-19', '2026-11-06', 70, 'curso', 'alta', ['A03'], { minutos: 1500 }],

  ['A05', 'Construir el alta de solicitudes', 'f2', 'rafa', '2026-10-26', '2026-11-20', 65, 'curso', 'critica', ['A03'], { minutos: 4800, critica: true, holgura: 0 }],
  ['A06', 'Construir el flujo de autorización', 'f2', 'rafa', '2026-11-09', '2026-12-04', 20, 'curso', 'critica', ['A05'], { minutos: 4200, critica: true, holgura: 0 }],
  ['A07', 'Interfaz con el sistema contable', 'f2', 'beto', '2026-11-02', '2026-11-27', 15, 'detenida', 'critica', ['A04'], { minutos: null, bloqueo: 'esperando las credenciales del ambiente de pruebas' }],
  ['A08', 'Reportes de seguimiento', 'f2', 'sofia', '2026-11-16', '2026-12-11', 0, 'pendiente', 'media', ['A05'], { minutos: 2100 }],
  ['A09', 'Migrar el catálogo histórico', 'f2', 'beto', '2026-11-23', '2026-12-11', 0, 'pendiente', 'alta', ['A02'], { minutos: null }],

  ['A10', 'Plan de pruebas integrales', 'f3', 'sofia', '2026-11-30', '2026-12-18', 0, 'pendiente', 'alta', ['A06'], { minutos: 1800, critica: true, holgura: 0 }],
  ['A11', 'Ejecutar pruebas con usuarios', 'f3', undefined, '2026-12-14', '2027-01-15', 0, 'pendiente', 'critica', ['A10'], { minutos: null, critica: true, holgura: 0 }],
  ['A12', 'Corregir hallazgos de pruebas', 'f3', 'rafa', '2027-01-04', '2027-01-22', 0, 'pendiente', 'alta', ['A11'], { minutos: 2400, critica: true, holgura: 0 }],

  ['A13', 'Material de capacitación', 'f4', 'mariana', '2026-12-07', '2027-01-08', 0, 'pendiente', 'media', ['A08'], { minutos: 1500 }],
  ['A14', 'Capacitar a usuarios clave', 'f4', 'mariana', '2027-01-11', '2027-01-29', 0, 'pendiente', 'alta', ['A12', 'A13'], { minutos: 2400, critica: true, holgura: 0 }],

  ['A15', 'Carga inicial en productivo', 'f5', 'beto', '2027-02-01', '2027-02-05', 0, 'pendiente', 'critica', ['A14'], { minutos: 960, critica: true, holgura: 0 }],
  ['A16', 'Salida en vivo', 'f5', 'mariana', '2027-02-08', '2027-02-08', 0, 'pendiente', 'critica', ['A15'], { minutos: 480, hito: true, critica: true, holgura: 0 }],
]

const NOTAS: Record<string, { autor: string; fecha: string; canal: string; texto: string }[]> = {
  A05: [
    { autor: 'rafa', fecha: '2026-11-14', canal: 'Telegram', texto: 'El alta ya guarda, falta la validación de duplicados.' },
  ],
  A07: [
    { autor: 'beto', fecha: '2026-11-10', canal: 'Telegram', texto: 'Pedí las credenciales por correo, sin respuesta todavía.' },
    { autor: 'mariana', fecha: '2026-11-17', canal: 'Telegram', texto: 'Lo subo a la junta del jueves.' },
  ],
}

function armarActividades(): Actividad[] {
  return FILAS.map(([clave, nombre, fase, responsable, inicio, fin, avance, estado, prioridad, depende, extra]) => {
    const esperado = estado === 'hecha' ? 100 : esperadoDe(inicio, fin)
    const atraso = estado !== 'hecha' && fin < HOY ? dias(fin, HOY) : 0
    return {
      id: clave,
      clave,
      nombre,
      fase,
      responsable,
      estado,
      prioridad,
      inicio,
      fin,
      avance,
      esperado,
      depende,
      hito: false,
      critica: false,
      holgura: 6,
      atraso,
      minutos: 0,
      notas: NOTAS[clave] ?? [],
      ...extra,
    } satisfies Actividad
  })
}

const ACTIVIDADES = armarActividades()

/** La curva: esperado y real por semana. El real se corta en hoy, no se proyecta. */
function armarCurva() {
  const puntos: EstadoPlan['curva'] = []
  const inicio = '2026-09-28'
  for (let i = 0; i <= 20; i++) {
    const fecha = suma(inicio, i * 7)
    const vivas = ACTIVIDADES.filter((a) => a.inicio <= fecha)
    const esperado = vivas.length
      ? Math.round(vivas.reduce((s, a) => s + esperadoDe(a.inicio, a.fin, fecha), 0) / ACTIVIDADES.length)
      : 0
    const real =
      fecha <= HOY
        ? Math.round(
            ACTIVIDADES.reduce(
              (s, a) => s + (a.inicio <= fecha ? Math.min(a.avance, esperadoDe(a.inicio, a.fin, fecha)) : 0),
              0,
            ) / ACTIVIDADES.length,
          )
        : undefined
    puntos.push({ fecha, esperado, real })
  }
  return puntos
}

const media = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0)

export const DEMO: EstadoPlan = {
  proyecto: {
    id: 'andes',
    corto: 'Andes',
    nombre: 'Andes · Compras y aprobaciones',
    grupo: 'Implementación Andes',
    inicio: '2026-09-28',
    fin: '2027-02-08',
    hoy: HOY,
    salud: 'riesgo',
    avance: {
      real: media(ACTIVIDADES.map((a) => a.avance)),
      esperado: media(ACTIVIDADES.map((a) => a.esperado)),
    },
    actualizado: '2026-11-18T09:12:00-06:00',
  },
  personas: [
    { id: 'mariana', nombre: 'Mariana Esquivel', corto: 'Mariana', iniciales: 'ME', rol: 'lidera', color: 1, canal: 'Telegram', puesto: 'Líder del proyecto' },
    { id: 'rafa', nombre: 'Rafael Ponce', corto: 'Rafa', iniciales: 'RP', rol: 'ejecuta', color: 2, canal: 'Telegram', puesto: 'Desarrollo' },
    { id: 'sofia', nombre: 'Sofía Cantú', corto: 'Sofía', iniciales: 'SC', rol: 'ejecuta', color: 3, canal: 'Telegram', puesto: 'Procesos' },
    { id: 'beto', nombre: 'Alberto Nava', corto: 'Beto', iniciales: 'AN', rol: 'ejecuta', color: 4, canal: 'Telegram', puesto: 'Infraestructura' },
    { id: 'paty', nombre: 'Patricia Rentería', corto: 'Paty', iniciales: 'PR', rol: 'observa', color: 5, canal: 'Telegram', puesto: 'Dirección' },
  ],
  fases: [
    { id: 'f1', nombre: 'Diseño', color: 1 },
    { id: 'f2', nombre: 'Construcción', color: 2 },
    { id: 'f3', nombre: 'Pruebas', color: 3 },
    { id: 'f4', nombre: 'Capacitación', color: 4 },
    { id: 'f5', nombre: 'Salida en vivo', color: 5 },
  ],
  actividades: ACTIVIDADES,
  curva: armarCurva(),
  bitacora: [
    { fecha: '2026-11-18', hora: '09:12', autor: 'rafa', canal: 'Telegram', texto: 'Puso «Construir el alta de solicitudes» en 65%', actividad: 'A05' },
    { fecha: '2026-11-17', hora: '18:40', autor: 'mariana', canal: 'Telegram', texto: 'Dejó una nota en «Interfaz con el sistema contable»', actividad: 'A07' },
    { fecha: '2026-11-17', hora: '08:05', autor: 'Zaelyn', canal: 'Escalamiento', texto: 'Avisó a Mariana: «Interfaz con el sistema contable» lleva 5 días detenida', actividad: 'A07' },
    { fecha: '2026-11-16', hora: '11:22', autor: 'sofia', canal: 'Telegram', texto: 'Puso «Definir la política de aprobaciones» en 70%', actividad: 'A04' },
    { fecha: '2026-11-14', hora: '16:51', autor: 'rafa', canal: 'Telegram', texto: 'Movió el vencimiento de «Construir el flujo de autorización» al 4 de diciembre', actividad: 'A06' },
    { fecha: '2026-11-12', hora: '09:30', autor: 'mariana', canal: 'Excel', texto: 'Importó el plan: 16 renglones, 2 nuevos, 5 cambiaron' },
    { fecha: '2026-11-10', hora: '14:08', autor: 'beto', canal: 'Telegram', texto: 'Marcó «Interfaz con el sistema contable» como detenida', actividad: 'A07' },
  ],
  zaelyn: {
    resumen:
      'El plan va 9 puntos abajo de lo esperado y la causa está concentrada: dos de las tres actividades que mandan sobre la fecha final vienen retrasadas.',
    puntos: [
      '«Interfaz con el sistema contable» lleva 8 días detenida esperando credenciales. Es la única detenida y ya se escaló a Mariana.',
      '«Construir el flujo de autorización» va en 20% y hoy tocaba 36%. Está en la ruta crítica.',
      '«Ejecutar pruebas con usuarios» no tiene responsable y arranca en 26 días.',
      'Faltan las horas de 3 renglones, así que no se puede dar la duración total de la cadena.',
    ],
  },
  falta: { estimacion: 3, fecha: 0, inicio: 0, dueno: 1 },
}

/** Los grupos del usuario. Personal y Familia existen pero todavía no tienen vistas. */
export const GRUPOS: Grupo[] = [
  {
    id: 'andes',
    nombre: 'Implementación Andes',
    tipo: 'proyecto',
    rol: 'lidera',
    planes: [
      { id: 'andes', nombre: 'Andes · Compras y aprobaciones', avance: DEMO.proyecto.avance.real, esperado: DEMO.proyecto.avance.esperado, salud: 'riesgo', abiertos: 13 },
      { id: 'andes-2', nombre: 'Andes · Fase II inventarios', avance: 4, esperado: 6, salud: 'bien', abiertos: 11 },
    ],
  },
  {
    id: 'meridiano',
    nombre: 'Meridiano',
    tipo: 'proyecto',
    rol: 'observa',
    planes: [{ id: 'meridiano', nombre: 'Meridiano · Portal de clientes', avance: 61, esperado: 58, salud: 'bien', abiertos: 9 }],
  },
  { id: 'casa', nombre: 'Casa', tipo: 'familia', rol: 'administra', planes: [] },
  { id: 'mio', nombre: 'Lo mío', tipo: 'personal', rol: 'administra', planes: [] },
]
