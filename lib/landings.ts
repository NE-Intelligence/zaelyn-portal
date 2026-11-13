/**
 * El contenido de las landings (decisiones/2026-11-13-planes-por-ambito):
 * una general y una por nivel (Personal, Personal+, Familia, Profesional y
 * PMO), más `/modulos`. Todas con la misma piel (`components/landing/`);
 * aquí solo vive el texto.
 *
 * Los ejemplos son inventados y lo son a propósito: la familia «Ríos», el
 * proyecto «Subestación Andes» y su gente no existen. Nunca un nombre de un
 * cliente, de un usuario real ni de la familia del dueño.
 */
import { AMBITO, type Ambito, type ClavePlan } from './planes'

export { AMBITO }

/** Una pieza de la conversación de ejemplo, pintada como en la app. */
export type Pieza =
  | { yo: string }
  | { zaelyn: string }
  | { tarjeta: { ambito: Ambito; contexto: string; titulo: string; dato: string; opciones: string[] } }

export type Beneficio = { titulo: string; texto: string; conversacion: Pieza[] }

export type LandingNivel = {
  id: ClavePlan
  meta: { titulo: string; descripcion: string }
  titular: [string, string]
  beneficios: Beneficio[]
  ventajas: string[]
}

/** «Qué es Zaelyn», igual en todas. */
export const QUE_ES = [
  'Zaelyn es un asistente que entiende lo que le escribes o le dices.',
  'Lo convierte en recordatorios, actividades, metas y memoria, y te contesta con tarjetas y botones: nada de adivinar comandos.',
]

export const CANALES = 'App · Portal web · Telegram'

const t = (ambito: Ambito, contexto: string, titulo: string, dato: string, opciones: string[]): Pieza =>
  ({ tarjeta: { ambito, contexto, titulo, dato, opciones } })

export const NIVELES: Record<ClavePlan, LandingNivel> = {
  free: {
    id: 'free',
    meta: { titulo: 'Zaelyn Personal · Gratis, para que nada se te olvide', descripcion: 'Recordatorios, actividades, metas y tu memoria en una conversación. Gratis en la app y en Telegram.' },
    titular: ['Que nada se te olvide.', 'Gratis, en tu teléfono.'],
    beneficios: [
      {
        titulo: 'Recordatorios en una frase', texto: 'Díselo como se te ocurra: Zaelyn entiende el día, la hora y si se repite.',
        conversacion: [
          { yo: 'Recuérdame pagar la luz el viernes a las 9' },
          t('personal', 'Recordatorio', 'Pagar la luz', 'Viernes · 9:00', ['Cambiar hora', 'Repetir cada mes', 'Listo']),
          { yo: 'Repetir cada mes' },
          { zaelyn: 'Hecho: cada mes el día 15 a las 9:00.' },
        ],
      },
      {
        titulo: 'Actividades que siguen contigo', texto: 'Lo que tienes que hacer queda en tu lista y Zaelyn te pregunta qué sigue.',
        conversacion: [
          { yo: 'Tengo que comprar regalo para mamá' },
          t('personal', 'Actividad', 'Comprar regalo para mamá', '¿Qué sigue con esto?', ['Ponerle fecha', 'Hacerla meta', 'Otra actividad', 'Listo']),
        ],
      },
      {
        titulo: 'Tu memoria', texto: 'Anótale lo que no quieres cargar en la cabeza y pregúntale después.',
        conversacion: [
          { yo: 'Anota que la talla de Emilio es 8' },
          { zaelyn: 'Nota guardada: «Talla de Emilio: 8».' },
          { yo: '¿Qué talla es Emilio?' },
          { zaelyn: '8. Lo anotaste el 3 de noviembre.' },
        ],
      },
      {
        titulo: 'Metas', texto: 'Ponle fecha a lo que quieres lograr y Zaelyn te lo recuerda cada semana.',
        conversacion: [
          { yo: 'Quiero correr 5 km en enero' },
          t('metas', 'Meta', 'Correr 5 km', 'Enero', ['Agregar pasos', 'Recordármelo cada semana']),
        ],
      },
    ],
    ventajas: ['Sin instalar otra app de tareas: es una conversación.', 'Nada de formularios ni contraseñas.', 'Lo mismo en la app y en Telegram.'],
  },

  base: {
    id: 'base',
    meta: { titulo: 'Zaelyn Personal+ · Lo tuyo sin topes, con IA y portal', descripcion: 'Chat con IA que se guarda solo, lee fotos y documentos, entiende tu voz, te manda tu día y te da un portal.' },
    titular: ['Lo tuyo, sin topes.', 'Con IA que trabaja por ti.'],
    beneficios: [
      {
        titulo: 'Chat con IA que se guarda solo', texto: 'Platica lo que necesites; al terminar, lo importante queda en tu Memoria.',
        conversacion: [
          { yo: 'Ayúdame a planear una semana de comidas sin gluten' },
          t('personal', 'Chat con IA', 'Semana sin gluten', 'Lunes a domingo · 3 comidas · lista del súper', ['Terminar chat']),
          { zaelyn: 'Guardé la plática en tu Memoria.' },
        ],
      },
      {
        titulo: 'Lee fotos y documentos', texto: 'Mándale la foto de un recibo o un PDF y te dice qué hacer con él.',
        conversacion: [
          { yo: '📷 Foto de un recibo' },
          t('personal', 'Documento', 'Recibo de agua', '412 MXN · vence el 20 nov', ['Recordármelo', 'Guardar en Memoria']),
        ],
      },
      {
        titulo: 'Voz', texto: 'Una nota de voz de camino al trabajo y Zaelyn saca lo que tienes que hacer.',
        conversacion: [
          { yo: '🎙 Nota de voz · 0:40' },
          t('personal', 'Voz', '3 actividades', 'Llamar al dentista · renovar el seguro · comprar focos', ['Crear las 3', 'Elegir']),
        ],
      },
      {
        titulo: 'Tu día y tu portal', texto: 'Cada mañana, tu día en una tarjeta. En la computadora, todo junto en el portal.',
        conversacion: [
          { zaelyn: 'Buenos días.' },
          t('personal', 'Tu día', 'Hoy', '2 eventos · 3 actividades · una meta en riesgo', ['Ver en el portal']),
        ],
      },
    ],
    ventajas: ['Una sola IA para tus pendientes, tus documentos y tus pláticas.', 'Lo que platicas no se pierde: queda en tu Memoria.', 'El portal y el teléfono ven lo mismo.'],
  },

  family: {
    id: 'family',
    meta: { titulo: 'Zaelyn Familia · Cada quien sabe qué le toca', descripcion: 'Quién lleva y quién trae, obligaciones y premios, memoria compartida y actividades familiares con plan.' },
    titular: ['Cada quien sabe qué le toca.', 'Sin perseguir a nadie.'],
    beneficios: [
      {
        titulo: 'Quién lleva y quién trae', texto: 'Cada traslado tiene responsable y Zaelyn le avisa a quien le toca.',
        conversacion: [
          { yo: 'Mañana Marta lleva a Emilio a natación y yo lo recojo' },
          t('familia', 'Familia Ríos', 'Natación de Emilio', 'Lleva Marta 4:00 pm · trae Tú 5:30 pm', ['Avisarles', 'Repetir los martes']),
        ],
      },
      {
        titulo: 'Obligaciones y premios', texto: 'Lo que toca en casa suma, y lo que suma se canjea.',
        conversacion: [
          { yo: 'Si Emilio tiende su cama 5 días, gana una salida al cine' },
          t('familia', 'Familia Ríos', 'Premio: salida al cine', 'Emilio · 0 de 5', ['Ver obligaciones de Emilio']),
        ],
      },
      {
        titulo: 'Memoria compartida', texto: 'Lo que uno anota, la familia lo sabe.',
        conversacion: [
          { yo: '¿Cuándo le toca vacuna a Paula?' },
          { zaelyn: 'El 12 de diciembre. Lo anotó Marta en la familia Ríos.' },
        ],
      },
      {
        titulo: 'Actividades familiares con plan', texto: 'Lo grande se parte en pasos y cada paso tiene quién.',
        conversacion: [
          { yo: 'Organizar la posada familiar' },
          t('familia', 'Familia Ríos', 'Posada familiar', '4 pasos · sin fecha', ['Repartir pasos', 'Ponerle fecha']),
        ],
      },
    ],
    ventajas: ['Nadie tiene que acordarse de avisar: Zaelyn avisa.', 'Los niños ven lo suyo, sin acceso a lo de los adultos.', 'Una sola cuenta paga; los demás entran gratis desde el teléfono.'],
  },

  profesional: {
    id: 'profesional',
    meta: { titulo: 'Zaelyn Profesional · Grupos de trabajo', descripcion: 'Grupos donde todos comparten chat, memoria, calendario y archivos, y cada quien lleva lo suyo. Con registro de horas.' },
    titular: ['Todos comparten lo mismo.', 'Cada quien lleva lo suyo.'],
    beneficios: [
      {
        titulo: 'Pedir sin asignar', texto: 'Lo pides al grupo y lo toma quien puede. Entra en su lista, no en la tuya.',
        conversacion: [
          { yo: 'Alguien que revise el logo para el viernes' },
          t('grupo', 'Grupo Diseño', 'Revisar el logo', 'Para el viernes · lo pidió Tú', ['Lo tomo']),
          { zaelyn: 'Carla lo tomó. Ya está en su lista.' },
        ],
      },
      {
        titulo: 'Registro de horas', texto: 'Dile en qué trabajaste y cuánto. La semana se exporta a Excel.',
        conversacion: [
          { yo: 'Hoy 3 horas en la propuesta de Acme' },
          t('grupo', 'Horas', 'Propuesta de Acme', '3 h hoy · 14 h esta semana', ['Enviar semana', 'Exportar Excel']),
        ],
      },
      {
        titulo: 'Memoria del grupo', texto: 'Lo que el grupo acordó, a la mano de todos.',
        conversacion: [
          { yo: '¿Qué acordamos de tipografías?' },
          { zaelyn: 'Prompt para texto y MuseoModerno para títulos. Lo acordaron el 4 de noviembre.' },
        ],
      },
      {
        titulo: 'Calendario y correo', texto: 'Juntas del grupo con invitación y recordatorio.',
        conversacion: [
          { yo: 'Junta del grupo el jueves a las 10' },
          t('grupo', 'Grupo Diseño', 'Junta del grupo', 'Jueves · 10:00 am', ['Invitar por correo', 'Recordar 15 min antes']),
        ],
      },
    ],
    ventajas: ['Sin jefes de tablero: nadie le asigna nada a nadie.', 'Chat, memoria, archivos y calendario del grupo en un lugar.', 'Miembros sin tope.'],
  },

  pro: {
    id: 'pro',
    meta: { titulo: 'Zaelyn PMO · Proyectos con dueño, plan y seguimiento', descripcion: 'El módulo de proyectos de Zaelyn: plan desde tu Excel, roles, aprobaciones, materiales y seguimiento. Incluye Profesional y Personal+.' },
    titular: ['Proyectos con dueño y plan.', 'Sin hojas de cálculo sueltas.'],
    beneficios: [
      {
        titulo: 'Importa el plan', texto: 'Sube tu Excel y Zaelyn lo convierte en un plan que el equipo actualiza hablando.',
        conversacion: [
          { yo: '📎 Plan Subestación Andes.xlsx' },
          t('pmo', 'Subestación Andes', 'Plan importado', '48 actividades · 6 frentes · 3 responsables', ['Revisar', 'Publicar plan']),
        ],
      },
      {
        titulo: 'Asigna y aprueba', texto: 'Cada actividad tiene responsable y lo terminado pasa por tu visto bueno.',
        conversacion: [
          { yo: 'Que Raúl haga el tendido de cable para el 28' },
          t('pmo', 'Subestación Andes', 'Tendido de cable', 'Raúl · para el 28', ['Pedir aprobación al terminar']),
          t('pmo', 'Subestación Andes', 'Raúl terminó', '¿Lo apruebas?', ['Aprobar', 'Regresar']),
        ],
      },
      {
        titulo: 'Seguimiento', texto: 'Cada lunes, dónde va el proyecto y qué lo frena.',
        conversacion: [
          t('pmo', 'Subestación Andes', 'Tu semana', '62% de avance · 3 atrasadas · 2 por aprobar', ['Ver atrasadas', 'Reporte para Sponsor']),
        ],
      },
      {
        titulo: 'Materiales y estimaciones', texto: 'Lo que llega a la obra queda ligado a su actividad.',
        conversacion: [
          { yo: 'Llegaron 200 m de cable' },
          t('pmo', 'Subestación Andes', 'Entrada de material', '200 m de cable · tendido de cable', ['Ver estimación']),
        ],
      },
    ],
    ventajas: ['El equipo actualiza hablando; nadie llena hojas.', 'Avance real contra esperado, actividad por actividad.', 'Reportes para el Sponsor sin armarlos a mano.', 'Incluye Profesional y Personal+.'],
  },
}

/** La landing general. */
export const GENERAL = {
  meta: { titulo: 'Zaelyn · Tu asistente portátil', descripcion: 'Uno solo para tu día, tu familia y tu trabajo. En la app, en el portal y en Telegram.' },
  titular: ['Zaelyn, tu asistente portátil.', 'Uno solo para tu día, tu familia y tu trabajo.'] as [string, string],
  conversacion: [
    { yo: '¿Qué tengo hoy?' },
    t('personal', 'Hoy', 'Pagar el seguro del coche', 'Vence hoy', ['Ya lo pagué', 'Mañana']),
    { yo: 'Mañana Marta lleva a Emilio a natación' },
    t('familia', 'Familia Ríos', 'Natación de Emilio', 'Lleva Marta 4:00 pm', ['Avisarle', 'Repetir los martes']),
    { yo: '¿Cómo va Subestación Andes?' },
    { zaelyn: 'Va al 62%; 3 actividades atrasadas y 2 esperan tu aprobación.' },
  ] as Pieza[],
  dondeVive: [
    { titulo: 'App', texto: 'En tu mano. La conversación con tarjetas y botones.' },
    { titulo: 'Portal', texto: 'En tu escritorio, todo junto: tu día, tu casa y tu trabajo.' },
    { titulo: 'Telegram', texto: 'Donde ya platicas. Sin instalar nada.' },
  ],
  objetivo: 'Que nada se te olvide y que lo compartido tenga dueño, sin que tengas que aprender una herramienta.',
}
