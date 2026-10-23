/**
 * La familia del ejemplo: inventada de punta a punta, y dicho en pantalla.
 *
 * Igual que `demo.ts`, este archivo ocupa el lugar del SERVIDOR: aquí sí se
 * arma la semana, porque no hay motor detrás. La pantalla no se entera — el
 * mismo componente pinta esto y la familia real de quien entra.
 *
 * Nada de aquí es de nadie. Los Ríos no existen.
 */
import type { AlertaDeFamilia, DiaDeFamilia, EstadoDeFamilia, EventoDelDia } from './familia'

const pad = (n: number) => String(n).padStart(2, '0')
function hoyMx(): string {
  const d = new Date(Date.now() - 6 * 3_600_000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
const sumar = (f: string, n: number) => {
  const d = new Date(`${f}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10)
}
const dow = (f: string) => new Date(`${f}T12:00:00Z`).getUTCDay()

const P = {
  sofia: { id: 'p-sofia', nombre: 'Sofía', rol: 'responsable' },
  andres: { id: 'p-andres', nombre: 'Andrés', rol: 'responsable' },
  vale: { id: 'p-vale', nombre: 'Valeria', rol: 'a_cargo' },
  mateo: { id: 'p-mateo', nombre: 'Mateo', rol: 'a_cargo' },
  tere: { id: 'p-tere', nombre: 'Abuela Tere', rol: 'apoyo' },
} as const

type Act = { id: string; titulo: string; de: keyof typeof P; dias: number[]; inicio: string; fin: string
  llevar?: Partial<Record<number, keyof typeof P>>; recoger?: Partial<Record<number, keyof typeof P>> }

const ACTS: Act[] = [
  { id: 'a-esc-v', titulo: 'secundaria', de: 'vale', dias: [1, 2, 3, 4, 5], inicio: '07:20', fin: '14:10',
    llevar: { 1: 'andres', 2: 'andres', 3: 'andres', 4: 'andres', 5: 'andres' },
    recoger: { 1: 'sofia', 2: 'tere', 3: 'sofia', 4: 'tere', 5: 'sofia' } },
  { id: 'a-esc-m', titulo: 'primaria', de: 'mateo', dias: [1, 2, 3, 4, 5], inicio: '07:45', fin: '13:30',
    llevar: { 1: 'andres', 2: 'andres', 3: 'andres', 4: 'andres', 5: 'andres' },
    recoger: { 1: 'sofia', 2: 'tere', 3: 'sofia', 4: 'tere', 5: 'sofia' } },
  { id: 'a-fut', titulo: 'futbol', de: 'mateo', dias: [2, 4], inicio: '17:00', fin: '18:30',
    llevar: { 2: 'sofia', 4: 'andres' }, recoger: { 2: 'sofia' } },
  { id: 'a-nat', titulo: 'natación', de: 'mateo', dias: [6], inicio: '09:00', fin: '10:00',
    llevar: { 6: 'andres' }, recoger: { 6: 'andres' } },
  { id: 'a-vol', titulo: 'voleibol', de: 'vale', dias: [1, 3, 5], inicio: '16:30', fin: '18:00',
    llevar: { 1: 'sofia', 3: 'tere', 5: 'sofia' }, recoger: { 1: 'andres', 3: 'andres', 5: 'andres' } },
  { id: 'a-pia', titulo: 'piano', de: 'vale', dias: [2], inicio: '18:30', fin: '19:30',
    llevar: { 2: 'sofia' }, recoger: { 2: 'sofia' } },
]

const QUEHACERES = [
  { id: 't1', titulo: 'tender su cama', de: 'mateo', puntos: 5, regla: 'FREQ=DAILY', dias: [0, 1, 2, 3, 4, 5, 6] },
  { id: 't2', titulo: 'tender su cama', de: 'vale', puntos: 5, regla: 'FREQ=DAILY', dias: [0, 1, 2, 3, 4, 5, 6] },
  { id: 't3', titulo: 'sacar la basura', de: 'mateo', puntos: 10, regla: 'FREQ=WEEKLY;BYDAY=TU,TH', dias: [2, 4] },
  { id: 't4', titulo: 'lavar los trastes', de: 'vale', puntos: 8, regla: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR', dias: [1, 2, 3, 4, 5] },
  { id: 't5', titulo: 'darle de comer a Canela', de: 'mateo', puntos: 3, regla: 'FREQ=DAILY', dias: [0, 1, 2, 3, 4, 5, 6] },
  { id: 't6', titulo: 'lavar el coche', de: null, puntos: 25, regla: null, dias: [] },
] as const

function armar(): EstadoDeFamilia {
  const hoy = hoyMx()
  const nombre = (k: keyof typeof P | null | undefined) => (k ? P[k].nombre : null)
  const dias: DiaDeFamilia[] = []
  const alertas: AlertaDeFamilia[] = []
  // Un festivo por confirmar y un hueco sin responsable, para que se vea qué
  // pasa cuando Zaelyn encuentra algo.
  const festivo = sumar(hoy, ((5 - dow(hoy) + 7) % 7) + 7) // el viernes de la semana que entra
  for (let k = 0; k < 14; k++) {
    const f = sumar(hoy, k)
    const d = dow(f)
    const eventos: EventoDelDia[] = []
    for (const a of ACTS) {
      if (!a.dias.includes(d)) continue
      const escolar = a.titulo === 'secundaria' || a.titulo === 'primaria'
      if (escolar && f === festivo) {
        eventos.push({ actividadId: a.id, titulo: a.titulo, de: nombre(a.de), personaId: P[a.de].id, inicio: a.inicio,
          fin: a.fin, estado: 'por_confirmar', motivo: 'Consejo Técnico Escolar', traslados: [] })
        if (a.titulo === 'primaria') alertas.push({ tipo: 'por_confirmar', fecha: f, titulo: 'escuela', nombre: 'Consejo Técnico Escolar' })
        continue
      }
      const ev: EventoDelDia = { actividadId: a.id, titulo: a.titulo, de: nombre(a.de), personaId: P[a.de].id,
        inicio: a.inicio, fin: a.fin, estado: 'ocurre', motivo: null, traslados: [] }
      for (const acc of ['llevar', 'recoger'] as const) {
        const tabla = acc === 'llevar' ? a.llevar : a.recoger
        if (!tabla) continue
        const q = tabla[d] ?? null
        ev.traslados.push({ accion: acc, quien: nombre(q), quienId: q ? P[q].id : null,
          hecho: k === 0 && acc === 'llevar' && a.inicio < '09:00', por: q ? 'turno' : 'nadie' })
        if (!q) alertas.push({ tipo: 'sin_responsable', fecha: f, titulo: a.titulo, de: nombre(a.de), accion: acc, hora: a.fin })
      }
      eventos.push(ev)
    }
    eventos.sort((x, y) => (x.inicio ?? '').localeCompare(y.inicio ?? ''))
    dias.push({
      fecha: f, festivo: f === festivo ? 'Consejo Técnico Escolar' : null, eventos,
      quehaceres: QUEHACERES.filter(t => t.regla && (t.dias as readonly number[]).includes(d)).map(t => ({
        tareaId: t.id, titulo: t.titulo, de: nombre(t.de), puntos: t.puntos,
        hecho: k === 0 && (t.id === 't1' || t.id === 't5') })),
      fechas: [],
    })
  }
  // El jueves Sofía lleva a Mateo a futbol a las 5 y recoge a Valeria a las…
  // no: el choque del ejemplo es el martes, piano y futbol casi juntos.
  const martes = dias.find(x => dow(x.fecha) === 2)
  if (martes) alertas.unshift({ tipo: 'choque', fecha: martes.fecha, quien: 'Sofía', hora: '18:30',
    cosas: ['recoger a Mateo (futbol)', 'llevar a Valeria (piano)'] })

  const cumpleMateo = sumar(hoy, 9)
  const fechas = [
    { titulo: 'Cumpleaños de Mateo', tipo: 'cumpleanos', de: 'Mateo', fecha: cumpleMateo, faltan: 9, cumple: 10 },
    { titulo: 'Aniversario de Sofía y Andrés', tipo: 'aniversario', de: null, fecha: sumar(hoy, 23), faltan: 23, cumple: 15 },
    { titulo: 'Cumpleaños de la abuela Tere', tipo: 'cumpleanos', de: 'Abuela Tere', fecha: sumar(hoy, 41), faltan: 41, cumple: 71 },
    { titulo: 'Cumpleaños de Valeria', tipo: 'cumpleanos', de: 'Valeria', fecha: sumar(hoy, 128), faltan: 128, cumple: 13 },
  ]
  for (const f of fechas) dias.find(d => d.fecha === f.fecha)?.fechas.push(f.titulo)
  alertas.push({ tipo: 'por_aprobar', cuantos: 2, puntos: 18 })

  const personas = Object.values(P).map(p => ({ id: p.id, nombre: p.nombre, rol: p.rol,
    rolDicho: p.rol === 'responsable' ? 'Guía' : p.rol === 'a_cargo' ? 'A cargo' : 'Apoyo',
    aCargo: p.rol === 'a_cargo', conCuenta: p.id !== 'p-mateo' && p.id !== 'p-tere',
    cuidadoPor: p.rol === 'a_cargo' ? ['Sofía', 'Andrés', 'Abuela Tere'] : [] }))

  return {
    grupo: { id: 'demo-familia', nombre: 'Familia Ríos', clase: 'family' },
    hoy,
    yo: { personaId: P.sofia.id, rol: 'responsable', rolDicho: 'Guía', guia: true },
    personas,
    dias,
    alertas,
    tablero: [
      { personaId: P.vale.id, nombre: 'Valeria', saldo: 142, porAprobar: 8, semana: 61 },
      { personaId: P.mateo.id, nombre: 'Mateo', saldo: 96, porAprobar: 10, semana: 47 },
    ],
    quehaceres: QUEHACERES.map(t => ({ id: t.id, titulo: t.titulo, de: nombre(t.de), puntos: t.puntos, cuando: t.regla })),
    porAprobar: [
      { de: 'Mateo', titulo: 'sacar la basura', puntos: 10, fecha: sumar(hoy, -1) },
      { de: 'Valeria', titulo: 'lavar los trastes', puntos: 8, fecha: hoy },
    ],
    premios: [
      { titulo: 'elegir la película del viernes', puntos: 40 },
      { titulo: 'una hora extra de videojuegos', puntos: 60 },
      { titulo: 'invitar a un amigo a dormir', puntos: 120 },
      { titulo: 'salida al cine', puntos: 200 },
    ],
    medallero: [
      { personaId: P.mateo.id, nombre: 'Mateo', medallas: 4, trofeos: 1, reconocimientos: 1, partidos: 9, disciplinas: ['natación', 'futbol'] },
      { personaId: P.vale.id, nombre: 'Valeria', medallas: 2, trofeos: 2, reconocimientos: 2, partidos: 6, disciplinas: ['voleibol', 'piano'] },
    ],
    logros: [
      { de: 'Mateo', tipo: 'resultado', titulo: 'Ganó 3 a 1 contra Halcones, metió 2 goles', disciplina: 'futbol', fecha: sumar(hoy, -2) },
      { de: 'Valeria', tipo: 'trofeo', titulo: 'Primer lugar del torneo estatal', disciplina: 'voleibol', fecha: sumar(hoy, -5) },
      { de: 'Mateo', tipo: 'medalla', titulo: 'Medalla de oro, 50 m dorso', disciplina: 'natación', fecha: sumar(hoy, -11) },
      { de: 'Mateo', tipo: 'marca', titulo: '50 m libre en 41.2 segundos', disciplina: 'natación', fecha: sumar(hoy, -11) },
      { de: 'Valeria', tipo: 'reconocimiento', titulo: 'Diploma del recital de otoño', disciplina: 'piano', fecha: sumar(hoy, -19) },
      { de: 'Mateo', tipo: 'resultado', titulo: 'Empató 2 a 2 contra Tigres', disciplina: 'futbol', fecha: sumar(hoy, -9) },
      { de: 'Valeria', tipo: 'resultado', titulo: 'Ganó 2 sets a 0', disciplina: 'voleibol', fecha: sumar(hoy, -3) },
    ],
    fechas,
  }
}

export const demoFamilia = (): EstadoDeFamilia => armar()
