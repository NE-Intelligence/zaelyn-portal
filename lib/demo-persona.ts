/**
 * La persona del ejemplo: Sofía, inventada de punta a punta, y dicho en pantalla.
 *
 * Igual que `demo.ts` y `demo-familia.ts`, este archivo ocupa el lugar del
 * SERVIDOR: aquí sí se arma el estado, porque no hay motor detrás. Sofía es
 * Guía en la Familia Ríos (la del ejemplo de Familia) y Ejecutora en
 * Subestación Andes (la del ejemplo de Proyectos): así se ve lo único que
 * Personal agrega, que es el cruce entre los dos.
 *
 * Nada de aquí es de nadie.
 */
import type { DiaPersonal, EntradaDelDia, EstadoDePersona, Habito } from './persona'

const pad = (n: number) => String(n).padStart(2, '0')
function hoyMx(): string {
  const d = new Date(Date.now() - 6 * 3_600_000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}
const sumar = (f: string, n: number) => {
  const d = new Date(`${f}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10)
}
const dow = (f: string) => new Date(`${f}T12:00:00Z`).getUTCDay()
const iso = (f: string, hhmm: string) => `${f}T${hhmm}:00-06:00`

const FAM = 'Familia Ríos'
const AND = 'Andes'
const CUENTA = 'sofia@trabajo.example'

function diaDe(f: string, k: number): EntradaDelDia[] {
  const d = dow(f)
  const out: EntradaDelDia[] = []
  const habil = d >= 1 && d <= 5
  if (habil) {
    out.push({ tipo: 'fuera', texto: 'Daily de Andes', inicio: iso(f, '09:00'), hhmm: '09:00', diaCompleto: false, cuenta: CUENTA })
  }
  // Hoy siempre trae el cruce que Personal existe para enseñar: la revisión
  // del trabajo a las 2:00 y recoger a Valeria a las 2:10.
  if (k === 0) {
    out.push({ tipo: 'encargo', texto: 'recoger a Valeria de la secundaria', hhmm: '14:10', hora: '2:10 de la tarde', grupo: FAM, hecho: false })
  } else if (d === 1 || d === 3 || d === 5) {
    out.push({ tipo: 'encargo', texto: 'recoger a Valeria de la secundaria', hhmm: '14:10', hora: '2:10 de la tarde', grupo: FAM, hecho: false })
  }
  if (k !== 0 && (d === 2 || d === 4)) {
    out.push({ tipo: 'encargo', texto: 'llevar a Mateo a futbol', hhmm: '16:45', hora: '4:45 de la tarde', grupo: FAM, hecho: false })
  }
  if (k === 0) {
    out.push({ tipo: 'fuera', texto: 'Revisión de ingeniería con Termika', inicio: iso(f, '14:00'), hhmm: '14:00', diaCompleto: false, cuenta: CUENTA })
    out.push({ tipo: 'recordatorio', id: 'r1', texto: 'pagar la tarjeta', inicio: iso(f, '18:00'), hhmm: '18:00', grupo: null })
    out.push({ tipo: 'vence', pendienteId: 'x2', texto: 'Memoria de cálculo de tierras', grupo: AND, estatus: 'en_curso' })
  }
  if (k === 1) out.push({ tipo: 'recordatorio', id: 'r2', texto: 'llevar el coche a servicio', inicio: iso(f, '08:00'), hhmm: '08:00', grupo: null })
  if (k === 3) out.push({ tipo: 'evento', id: 'e1', texto: 'Cumpleaños de la abuela Tere', inicio: iso(f, '19:00'), hhmm: '19:00', grupo: FAM })
  if (k === 5) out.push({ tipo: 'vence', pendienteId: 'x3', texto: 'Lista de materiales del patio de 115 kV', grupo: AND, estatus: 'abierto' })
  if (k === 9) out.push({ tipo: 'recordatorio', id: 'r3', texto: 'renovar el pasaporte', inicio: iso(f, '10:00'), hhmm: '10:00', grupo: null })
  return out.sort((a, b) => ((a.tipo === 'vence' ? null : a.hhmm) ?? '99').localeCompare((b.tipo === 'vence' ? null : b.hhmm) ?? '99'))
}

function habito(nombre: string, unidad: string | null, meta: number, hoy: string, patron: (k: number) => number): Habito {
  const dias = Array.from({ length: 28 }, (_, k) => {
    const dia = sumar(hoy, k - 27)
    const total = patron(27 - k)
    return { dia, total, cumplido: total >= meta }
  })
  let racha = 0
  let k = dias.length - 1
  if (!dias[k]!.cumplido) k--
  while (k >= 0 && dias[k]!.cumplido) { racha++; k-- }
  return { nombre, unidad, meta, cadencia: 'diaria', dias, hoy: dias[27]!.total, racha }
}

export function demoPersona(): EstadoDePersona {
  const hoy = hoyMx()
  const dias: DiaPersonal[] = Array.from({ length: 14 }, (_, k) => {
    const fecha = sumar(hoy, k)
    return { fecha, entradas: diaDe(fecha, k) }
  })
  const hoyEntradas = dias[0]!.entradas
  const choque = hoyEntradas.some(x => x.tipo === 'encargo' && x.hhmm === '14:10')
  return {
    hoy, tz: 'America/Monterrey', dias,
    alertas: [
      ...(choque ? [{ tipo: 'choque' as const, hhmm: '14:00', cosas: ['Revisión de ingeniería con Termika', 'recoger a Valeria de la secundaria'] }] : []),
      { tipo: 'vencida', texto: 'Matriz de pruebas FAT', grupo: AND, vence: sumar(hoy, -2) },
      { tipo: 'por_aprobar', grupo: FAM, groupId: 'g-rios', cuantos: 2 },
    ],
    foco: [
      { texto: 'Matriz de pruebas FAT', porque: `venció el ${sumar(hoy, -2)}`, grupo: AND },
      ...(choque ? [{ texto: 'Revisión de ingeniería con Termika · recoger a Valeria de la secundaria', porque: 'chocan a las 14:00', grupo: null }] : []),
      { texto: 'Memoria de cálculo de tierras', porque: 'vence hoy', grupo: AND },
    ].slice(0, 3),
    compromisos: {
      participaciones: [
        { groupId: 'g-rios', grupo: FAM, clase: 'family', rol: 'responsable', nombreRol: 'Guía', cajon: 'diriges',
          propio: true, paga: { quien: 'tu', nombre: null }, ocupaLugar: null, proyectosActivos: 0, misAbiertas: 0, misVencidas: 0 },
        { groupId: 'g-andes', grupo: AND, clase: 'work', rol: 'integrante', nombreRol: 'Ejecutor', cajon: 'ejecutas',
          propio: false, paga: { quien: 'sponsor', nombre: '@marcela' }, ocupaLugar: true, proyectosActivos: 1, misAbiertas: 3, misVencidas: 1 },
      ],
      pendientes: [
        { pendienteId: 'x1', groupId: 'g-andes', grupo: AND, plan: 'Subestación Andes', texto: 'Matriz de pruebas FAT',
          vence: sumar(hoy, -2), estatus: 'en_curso', avance: 60, vencida: true },
        { pendienteId: 'x2', groupId: 'g-andes', grupo: AND, plan: 'Subestación Andes', texto: 'Memoria de cálculo de tierras',
          vence: hoy, estatus: 'en_curso', avance: 80, vencida: false },
        { pendienteId: 'x3', groupId: 'g-andes', grupo: AND, plan: 'Subestación Andes', texto: 'Lista de materiales del patio de 115 kV',
          vence: sumar(hoy, 5), estatus: 'abierto', avance: 0, vencida: false },
      ],
    },
    habitos: [
      habito('agua', 'litros', 2, hoy, k => (k === 0 ? 1 : k % 9 === 4 ? 1 : 2)),
      habito('caminar', 'minutos', 30, hoy, k => (k % 4 === 3 ? 0 : k === 0 ? 0 : 35)),
      habito('leer', 'páginas', 10, hoy, k => (k % 3 === 0 ? 5 : 12)),
    ],
    proximo: { texto: 'llevar el coche a servicio', cuando: iso(sumar(hoy, 1), '08:00') },
    agendaConectada: true,
    plan: { clave: 'base', nombre: 'Zaelyn Sprint' },
  }
}
