/**
 * El contenido de las cuatro landings (decisiones/2026-11-10-landings-y-portal):
 * la principal y una por solución, con la MISMA plantilla
 * (`components/landing/Landing.tsx`).
 *
 * Los ejemplos de la conversación son inventados y lo son a propósito: la
 * gente, la familia y la obra de aquí no existen. Nunca un nombre de un
 * cliente, de un usuario real ni de la familia del dueño.
 *
 * Por ahora solo en español; inglés y portugués se agregan aquí cuando se
 * traduzcan (las demás páginas del sitio ya los tienen).
 */
import type { PlanPublico } from './precios'

export type Modulo = 'personal' | 'familia' | 'pmo'

export const MODULO: Record<Modulo, { nombre: string; color: string; ruta: string }> = {
  personal: { nombre: 'Personal', color: 'var(--z-personal)', ruta: '/personal' },
  familia: { nombre: 'Familia', color: 'var(--z-familia)', ruta: '/familia' },
  pmo: { nombre: 'PMO', color: 'var(--z-proyectos)', ruta: '/pmo' },
}

/** Una pieza de la conversación de ejemplo, pintada como en la app. */
export type Pieza =
  | { yo: string }
  | { zaelyn: string }
  | { tarjeta: { modulo: Modulo; contexto: string; titulo: string; dato: string; opciones: string[] } }

export type Beneficio = { titulo: string; texto: string }

export type Landing = {
  id: 'zaelyn' | Modulo
  meta: { titulo: string; descripcion: string }
  /** El rótulo de arriba del titular; en las soluciones lleva el punto del módulo. */
  rotulo?: string
  titular: [string, string]
  bajada: string
  cta: { texto: string; href: string }
  cta2: { texto: string; href: string }
  conversacion: Pieza[]
  beneficios: { titulo: string; lista: Beneficio[] }
  /** Las tres soluciones en tarjetas: solo en la principal. */
  soluciones?: boolean
  apps?: boolean
  /** Qué planes se enseñan. La principal enseña los cuatro. */
  planes: PlanPublico['id'][]
  preciosTitulo: [string, string]
}

const CANALES = 'Telegram hoy · WhatsApp en activación · Portal web'
export const canales = CANALES

export const LANDINGS: Record<Landing['id'], Landing> = {
  zaelyn: {
    id: 'zaelyn',
    meta: {
      titulo: 'Zaelyn · Tu asistente personal, familiar y de proyectos',
      descripcion: 'Le hablas como a una persona; Zaelyn recuerda, avisa a quien le toca y te enseña dónde estás parado.',
    },
    titular: ['Dilo una vez.', 'Zaelyn se encarga.'],
    bajada: 'Tu asistente para lo tuyo, tu casa y tus proyectos. Le hablas como a una persona; ella recuerda, avisa y te enseña dónde estás parado.',
    cta: { texto: 'Probar 7 días gratis', href: '/empezar' },
    cta2: { texto: 'Ver las soluciones', href: '#soluciones' },
    conversacion: [
      { yo: '¿Qué tengo hoy?' },
      { tarjeta: { modulo: 'personal', contexto: 'Hoy', titulo: 'Pagar el seguro del coche', dato: 'Vence hoy · lo agregaste el lunes', opciones: ['Ya lo pagué', 'Mañana'] } },
      { yo: 'Hoy no puedo recoger a Emilio' },
      { tarjeta: { modulo: 'familia', contexto: 'Casa', titulo: '¿Quién recoge a Emilio?', dato: 'Natación · sale 6:30 pm', opciones: ['Diego', 'Abuela Rosa'] } },
      { yo: '¿Cómo va la torre?' },
      { zaelyn: 'Va al 58%; hoy tocaba 64%. La frena la losa del nivel 3, con Bruno.' },
    ],
    beneficios: {
      titulo: 'Lo que hace por ti, sin que abras otra app.',
      lista: [
        { titulo: 'Recuerda por ti', texto: 'Lo que le dices queda guardado: pendientes, fechas, notas. Te lo trae cuando importa, no antes.' },
        { titulo: 'Avisa a quien le toca', texto: 'En tu familia o tu equipo, Zaelyn le pregunta a la persona correcta y te cuenta qué dijo.' },
        { titulo: 'Te enseña dónde estás parado', texto: 'El chat y el portal leen lo mismo: si Zaelyn dice 34%, la pantalla dice 34%.' },
        { titulo: 'Texto, voz y fotos', texto: 'Escríbele, mándale un audio o una foto. Sin formularios ni contraseñas.' },
      ],
    },
    soluciones: true,
    apps: true,
    planes: ['kickoff', 'sprint', 'tribu', 'pmo'],
    preciosTitulo: ['Empieza gratis.', 'Paga solo lo que decides.'],
  },

  personal: {
    id: 'personal',
    meta: {
      titulo: 'Zaelyn Personal · Todo lo que te toca, en un solo lugar',
      descripcion: 'Recordatorios a su hora, tus compromisos de todos tus grupos, hábitos y tu semana. Zaelyn recuerda por ti.',
    },
    rotulo: 'Zaelyn Personal',
    titular: ['Todo lo que te toca,', 'en un solo lugar.'],
    bajada: 'Zaelyn recuerda por ti, te dice qué va primero y cruza tu día con todos tus grupos.',
    cta: { texto: 'Empezar gratis', href: '/empezar?para=personal' },
    cta2: { texto: 'Ver un día de ejemplo', href: '/demo/personal' },
    conversacion: [
      { yo: 'Recuérdame el viernes a las 6 la cena con Inés' },
      { tarjeta: { modulo: 'personal', contexto: 'Agenda', titulo: 'Cena con Inés', dato: 'Viernes · 6:00 pm', opciones: ['Confirmar', 'Cambiar hora', 'Ayuda'] } },
      { zaelyn: 'Listo. A las 5:30 te aviso para que salgas a tiempo.' },
      { yo: '¿Cómo voy con correr esta semana?' },
      { zaelyn: 'Llevas 2 de 3 salidas. Mañana toca la tercera.' },
    ],
    beneficios: {
      titulo: 'Tu día, sin tener que acordarte de todo.',
      lista: [
        { titulo: 'Recordatorios que llegan a su hora', texto: 'Díselos como se te ocurran: «el viernes a las 6», «cada lunes», «en dos horas».' },
        { titulo: 'Dónde estás parado', texto: 'Lo que vence, lo que choca y lo que espera de ti, en una sola pantalla.' },
        { titulo: 'Tus compromisos de todos lados', texto: 'Lo que te toca en tu familia y en tus proyectos se junta con lo tuyo.' },
        { titulo: 'Hábitos y calendario', texto: 'Tu semana completa y los hábitos que quieres sostener, sin otra app.' },
      ],
    },
    apps: true,
    planes: ['kickoff', 'sprint'],
    preciosTitulo: ['Empieza gratis.', 'Sube cuando lo necesites.'],
  },

  familia: {
    id: 'familia',
    meta: {
      titulo: 'Zaelyn Familia · Organiza tu día, disfruta en familia',
      descripcion: 'Quién lleva y quién recoge, quehaceres con puntos, cumpleaños y la semana completa de tu casa, en una conversación.',
    },
    rotulo: 'Zaelyn Familia',
    titular: ['Organiza tu día,', 'disfruta en familia.'],
    bajada: 'La escuela, los entrenamientos, quién lleva y quién recoge. Se lo dices a Zaelyn como a alguien de la casa y le avisa a quien le toca.',
    cta: { texto: 'Empezar gratis', href: '/empezar?para=familia' },
    cta2: { texto: 'Ver una familia de ejemplo', href: '/demo/familia' },
    conversacion: [
      { yo: 'Hoy no puedo recoger a Emilio de natación' },
      { tarjeta: { modulo: 'familia', contexto: 'Casa', titulo: '¿Quién recoge a Emilio?', dato: 'Natación · sale 6:30 pm', opciones: ['Diego', 'Abuela Rosa'] } },
      { zaelyn: 'Le pregunté a Diego y a la abuela. El primero que diga «yo voy» se queda con él.' },
      { yo: '¿Quién va ganando los quehaceres?' },
      { zaelyn: 'Paula, con 42 puntos. Emilio lleva 35 y le falta tender su cama hoy.' },
    ],
    beneficios: {
      titulo: 'La semana de tu casa, sin perseguir a nadie.',
      lista: [
        { titulo: 'Quién lleva y quién recoge', texto: 'Cada traslado tiene responsable. Si alguien no puede, Zaelyn busca quién sí.' },
        { titulo: 'Quehaceres con puntos', texto: 'Cada quien sabe qué le toca; lo hecho suma puntos y se canjea por premios.' },
        { titulo: 'Calendario de todos', texto: 'Escuela, entrenamientos y fechas importantes en un solo lugar.' },
        { titulo: 'Cumpleaños y fechas importantes', texto: 'Todas a la vista en el portal, junto con la semana de cada quien.' },
      ],
    },
    planes: ['kickoff', 'tribu'],
    preciosTitulo: ['Empieza gratis.', 'Tu familia completa, cuando la quieras.'],
  },

  pmo: {
    id: 'pmo',
    meta: {
      titulo: 'Zaelyn PMO · Tu PMO de bolsillo',
      descripcion: 'Proyectos actividad por actividad, avance real contra esperado y un equipo que se actualiza hablando con Zaelyn.',
    },
    rotulo: 'Zaelyn PMO',
    titular: ['Tu PMO', 'de bolsillo.'],
    bajada: 'Cada quien actualiza su avance hablando con Zaelyn. Tú ves el proyecto completo, al día, sin perseguir a nadie.',
    cta: { texto: 'Empezar gratis', href: '/empezar?para=proyectos' },
    cta2: { texto: 'Ver un proyecto de ejemplo', href: '/demo' },
    conversacion: [
      { yo: 'Quiero actualizar mi avance de hoy' },
      { tarjeta: { modulo: 'pmo', contexto: 'Torre Mirador', titulo: 'Losa del nivel 3', dato: '60% · esperado hoy 70% · vence viernes', opciones: ['70%', '80%', 'Terminada'] } },
      { zaelyn: 'Listo, quedó en 80%. Ya vas por arriba de lo esperado.' },
      { yo: '¿Qué está atrasado?' },
      { zaelyn: 'Dos cosas: la instalación eléctrica del nivel 2, con Tomás, y el contrato de acero.' },
    ],
    beneficios: {
      titulo: 'El proyecto al día, sin juntas para preguntar cómo va.',
      lista: [
        { titulo: 'Avance real contra esperado', texto: 'Cada actividad dice dónde va y dónde debería ir hoy. Sin adivinar.' },
        { titulo: 'El equipo actualiza hablando', texto: 'Nadie llena hojas: le dicen a Zaelyn cómo van y el plan se mueve solo.' },
        { titulo: 'Lo que manda sobre la fecha', texto: 'Ruta crítica, dependencias y lo que se atrasa, a la vista.' },
        { titulo: 'Tu plan, desde tu Excel', texto: 'Súbelo o ármalo con IA en el editor; Zaelyn lo lleva desde ahí.' },
      ],
    },
    planes: ['kickoff', 'pmo'],
    preciosTitulo: ['Empieza gratis.', 'Crece asiento por asiento.'],
  },
}
