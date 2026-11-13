import { Barra } from '@/components/portal/Marco'
import { Ejecucion, type Cosa } from '@/components/portal/Ejecucion'

export const metadata = { title: 'Inicio · ejemplo' }

/**
 * `/demo/inicio` — el Inicio de ejecución con gente inventada
 * (decisiones/2026-11-13-planes-por-ambito): Mariana, la familia Ríos, la
 * Subestación Andes, el grupo Diseño y Vértice no existen. Las fechas se acomodan a hoy para
 * que el ejemplo siempre se vea vivo.
 */
const HOY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Mexico_City' }).format(new Date())
const dia = (n: number) => {
  const [a, m, d] = HOY.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const fecha = (() => {
  const [a, m, d] = HOY.split('-').map(Number) as [number, number, number]
  const t = `${DIAS[new Date(Date.UTC(a, m - 1, d)).getUTCDay()]} ${d} de ${MESES[m - 1]}`
  return t[0]!.toUpperCase() + t.slice(1)
})()

let n = 0
const c = (x: Partial<Cosa> & Pick<Cosa, 'titulo' | 'espacio' | 'lugar'>): Cosa => ({
  clave: `d${n++}`, abrir: null, tipo: 'actividad', dia: HOY, hora: null, quien: null, vencida: false, hecho: false, avance: null, esEvento: false, ...x,
})

const COSAS: Cosa[] = [
  c({ titulo: 'Memoria de cálculo de tierras', tipo: 'pendiente', espacio: 'proyecto', lugar: 'Subestación Andes', dia: dia(-2), vencida: true, avance: 60 }),
  c({ titulo: 'Pagar el seguro del coche', tipo: 'recordatorio', espacio: 'personal', lugar: 'Personal', dia: dia(-1), vencida: true }),
  c({ titulo: 'Junta diaria de obra', tipo: 'evento', espacio: 'proyecto', lugar: 'Subestación Andes', hora: '9:00', esEvento: true, hecho: true }),
  c({ titulo: 'Revisar planos del tablero principal', tipo: 'pendiente', espacio: 'proyecto', lugar: 'Subestación Andes', hora: '11:00', quien: 'Tú', avance: 40 }),
  c({ titulo: 'Revisión de ingeniería con Vértice', tipo: 'evento', espacio: 'personal', lugar: 'Personal', hora: '14:00', esEvento: true }),
  c({ titulo: 'Recoger a Paula de la secundaria', tipo: 'actividad', espacio: 'familia', lugar: 'Familia Ríos', hora: '14:00', esEvento: true }),
  c({ titulo: 'Natación de Emilio', tipo: 'actividad', espacio: 'familia', lugar: 'Familia Ríos', hora: '18:30', quien: 'Emilio', esEvento: true }),
  c({ titulo: 'Llamar al pediatra para la cita de Emilio', tipo: 'actividad', espacio: 'familia', lugar: 'Familia Ríos' }),
  c({ titulo: 'Revisar el logo para el viernes', tipo: 'actividad', espacio: 'grupo', lugar: 'Grupo Diseño', dia: dia(2) }),
  c({ titulo: 'Junta del grupo', tipo: 'evento', espacio: 'grupo', lugar: 'Grupo Diseño', dia: dia(1), hora: '10:00', esEvento: true }),
  c({ titulo: 'Comprar regalo para Diego', tipo: 'actividad', espacio: 'personal', lugar: 'Personal', dia: dia(1) }),
  c({ titulo: 'Entrega de ingeniería de detalle', tipo: 'pendiente', espacio: 'proyecto', lugar: 'Subestación Andes', dia: dia(1), quien: 'Equipo eléctrico', avance: 75 }),
  c({ titulo: 'Junta de padres', tipo: 'evento', espacio: 'familia', lugar: 'Familia Ríos', dia: dia(2), hora: '19:00', esEvento: true }),
  c({ titulo: 'Correr 5 km en enero', tipo: 'actividad', espacio: 'personal', lugar: 'Personal', dia: null, avance: 30 }),
  c({ titulo: 'Renovar la licencia de manejo', tipo: 'recordatorio', espacio: 'personal', lugar: 'Personal', dia: dia(3) }),
  c({ titulo: 'Comité de avance con el cliente', tipo: 'evento', espacio: 'proyecto', lugar: 'Subestación Andes', dia: dia(4), hora: '10:00', esEvento: true }),
  c({ titulo: 'Partido de Paula', tipo: 'actividad', espacio: 'familia', lugar: 'Familia Ríos', dia: dia(5), hora: '9:30', quien: 'Paula', esEvento: true }),
  c({ titulo: 'Ordenar facturas del mes', tipo: 'actividad', espacio: 'personal', lugar: 'Personal', dia: null }),
  c({ titulo: 'Tendido de cable', tipo: 'pendiente', espacio: 'proyecto', lugar: 'Subestación Andes', dia: dia(12), quien: 'Raúl' }),
]

export default function InicioDeEjemplo() {
  return (
    <>
      <Barra area="inicio" ejemplo />
      <Ejecucion d={{
        ejemplo: true,
        hoy: HOY,
        fecha,
        saludo: 'Buenos días',
        quien: 'Mariana',
        foco: { texto: 'A las 2:00 te chocan la revisión con Vértice y recoger a Paula.', porque: '¿le pido a Diego que vaya?' },
        avisos: ['3 avances esperan tu visto bueno en Subestación Andes.'],
        cosas: COSAS,
        casa: [{
          familia: 'Familia Ríos', href: '/demo/familia', cosas: [
            { hora: '14:00', texto: 'Salida de la secundaria', quien: 'Paula', traslado: 'Recoge: nadie todavía' },
            { hora: '18:30', texto: 'Natación', quien: 'Emilio', traslado: 'Lleva: Diego' },
          ],
        }],
        fechas: [
          { titulo: 'Cumpleaños de Diego · 41 años', cuando: '', faltan: 1 },
          { titulo: 'Aniversario de bodas', cuando: '24 nov', faltan: 13 },
          { titulo: 'Cumpleaños de la abuela Carmen', cuando: '2 dic', faltan: 21 },
        ],
        habitos: [
          { nombre: 'Caminar', hoy: 4200, meta: 8000, unidad: 'pasos', racha: 6 },
          { nombre: 'Leer', hoy: 20, meta: 20, unidad: 'min', racha: 12 },
        ],
        grupos: [{ nombre: 'Grupo Diseño', href: '/demo/inicio' }],
        contratado: { plan: 'Zaelyn PMO', apagado: [{ que: 'Familia', plan: 'Zaelyn Familia' }] },
        proyectos: [
          { nombre: 'Subestación Andes', grupo: 'Constructora del Norte', href: '/demo', abiertos: 7, vencidos: 2 },
          
        ],
        apps: [
          { clave: 'tcgbusters', nombre: 'TCGBusters', estado: 'encendido' },
          { clave: 'kore', nombre: 'Kore', estado: 'pronto' },
        ],
        hrefs: { personal: '/demo/personal', familia: '/demo/familia', proyectos: '/demo', apps: '/demo/inicio', calendario: '/demo/personal?v=calendario' },
      }} />
    </>
  )
}
