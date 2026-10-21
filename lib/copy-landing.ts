/**
 * El texto del sitio, por idioma.
 *
 * `es` está completo y es la base: cualquier clave que falte en otro idioma
 * cae en español en vez de quedarse vacía. Para abrir inglés o portugués solo
 * hay que llenar esos objetos con las mismas claves — ni las rutas ni los
 * componentes cambian.
 */

export const IDIOMAS = ['es', 'en', 'pt'] as const
export type Idioma = (typeof IDIOMAS)[number]

export const NOMBRE_IDIOMA: Record<Idioma, string> = { es: 'ES', en: 'EN', pt: 'PT' }

const es = {
  'meta.titulo': 'Zaelyn — Tu PMO de bolsillo',
  'meta.desc':
    'Sube el Excel que ya tienes y lleva el seguimiento hablando. Proyectos, familia y pendientes en un solo lugar, con un número que no se inventa.',

  'nav.productos': 'Productos',
  'nav.como': 'Cómo funciona',
  'nav.leyes': 'Por qué confiar',
  'nav.precios': 'Precios',
  'nav.menu': 'Abrir menú',
  'nav.inicio': 'zælyn, inicio',
  'nav.idioma': 'Idioma',

  'aviso.prueba': 'En pruebas cerradas',
  'aviso.texto': 'Zaelyn está en pruebas con un grupo pequeño. La beta abierta se anuncia aquí.',

  'hero.h1a': 'Dilo en el chat.',
  'hero.h1b': 'Zaelyn lleva el plan.',
  'hero.sub':
    'Tus proyectos, tu familia y tus pendientes en un solo lugar, que se actualiza hablando. Sin instalar nada, sin pantallas que aprender, sin que nadie llene un formulario.',
  'hero.cta1': 'Ver qué resuelve',
  'hero.cta2': 'Cómo funciona',
  'hero.c1': 'Telegram, hoy',
  'hero.c2': 'WhatsApp, en proceso de activación',
  'hero.c3': 'Portal web, en construcción',
  'hero.charla': 'Ejemplo de conversación con Zaelyn',

  'chat.1': 'la cotización va al 40%',
  'chat.2a': 'Anotado. «Mandar la cotización» va en',
  'chat.2b': 'Para hoy se esperaba',
  'chat.2c': 'va 25 puntos abajo',
  'chat.3': 'ruta crítica de Cuprum',
  'chat.4a': 'La cadena más larga son 7 actividades y termina en «Capacitar a usuarios».',
  'chat.4b': 'No te doy el total: faltan las horas de 3 renglones.',
  'chat.4c': 'Rellenarlas con un promedio sería un número inventado con cara de cálculo.',

  'prod.rotulo': 'Un motor, tres maneras de usarlo',
  'prod.h2': 'El mismo asistente, para lo que cada quien tiene que llevar.',
  'prod.sub':
    'Por dentro todo es lo mismo: grupos, actividades, responsables y fechas. Lo que cambia es qué te enseña y qué te recuerda.',

  'p1.t': 'Proyectos',
  'p1.l': 'Tu PMO de bolsillo',
  'p1.p':
    'Sube el Excel que ya tienes y a partir de ahí el seguimiento se lleva hablando. Cada quien reporta lo suyo y tú ves el plan completo.',
  'p1.a': 'Avance real contra el esperado al día de hoy',
  'p1.b': 'Dependencias, y aviso en cuanto algo se destraba',
  'p1.c': 'Ruta crítica, o el dato exacto que falta para calcularla',
  'p1.d': 'Cuatro roles: observa, ejecuta, lidera, administra',
  'p1.pie': 'Para PMO, consultoras, despachos y equipos de implementación.',

  'p2.t': 'Familia',
  'p2.l': 'Organiza tu día, disfruta en familia',
  'p2.p':
    'Quién lleva, quién recoge y quién ya cumplió. Lo que se repite se repite solo, y lo que cambia se avisa a quien le toca.',
  'p2.a': 'Actividades de los hijos, con sus excepciones',
  'p2.b': 'Un festivo no se supone: se confirma',
  'p2.c': 'Quien no tiene cuenta también puede estar a cargo',
  'p2.d': '«Hoy me quedé sin coche» y se reparte de nuevo',
  'p2.pie': 'Papás y mamás con agenda repartida en dos casas y tres ciudades.',

  'p3.t': 'Personal',
  'p3.l': 'Lo tuyo, incluido',
  'p3.p':
    'Recordatorios que llegan a la hora correcta y dejan de llegar cuando los cancelas. Notas, hábitos y el corte de tu día.',
  'p3.a': 'Recordatorios sueltos y series, en tu zona horaria',
  'p3.b': 'Anotaciones que después puedes buscar',
  'p3.c': 'Tu agenda de Google en el mismo resumen',
  'p3.d': 'Apuntar no es avisar: tú decides qué suena',
  'p3.pie': 'Va dentro de los dos planes, sin cobro aparte.',

  'como.rotulo': 'De tu hoja de cálculo al chat',
  'como.h2': 'Diez minutos, una sola vez.',
  'c1.t': 'Sube el archivo que ya tienes',
  'c1.p':
    'No hay que rehacerlo. Zaelyn reconoce los nombres de columna más usados, te enseña qué entendió y no escribe nada hasta que aprietas el botón.',
  'c2.t': 'Tu equipo reporta hablando',
  'c2.p':
    '«La cotización va al 40%», «ya empecé el anexo», «pásale la factura a Ana». Nadie entra a un sistema, nadie llena una celda, y queda registrado quién lo dijo y cuándo.',
  'c3.t': 'Pregunta cuando quieras',
  'c3.p':
    '«¿Qué está en riesgo hoy?», «¿cómo va Ana?», «mándame el estatus en Excel». Llega armado en ese momento, no el viernes que alguien actualice la hoja.',

  'ley.rotulo': 'Por qué confiar en el número',
  'ley.h2': 'Un asistente que prefiere decir «no sé» antes que inventarte un dato.',
  'ley.sub':
    'Zaelyn está construido sobre tres reglas que no se negocian, y cada una existe porque su ausencia ya rompió un producto antes.',
  'l1.t': 'Una sola fuente de la verdad',
  'l1.p':
    'Todo vive en una base de datos y lo demás se deriva de ahí. Por eso un recordatorio cancelado deja de llegar, y el Excel que descargas dice lo mismo que el chat.',
  'l2.t': 'El modelo entiende, el código decide',
  'l2.p':
    'La inteligencia artificial interpreta tu frase. Lo que se guarda, se calcula y se avisa lo hace código determinista. Ningún modelo escribe en tu plan.',
  'l3.t': 'Ante la duda, se pregunta',
  'l3.p':
    'Si hay dos actividades que calzan con lo que dijiste, Zaelyn pregunta cuál. Cerrar la equivocada no se arregla con un «perdón».',
  'pr.rotulo': 'Lo que eso significa en la práctica',
  'pr.dice':
    '«Para el cálculo completo faltan las horas de 3 pendientes del plan. El camino más rápido: pídeme “mándame el estatus en excel”, llena la columna Horas y súbelo con “importa el plan”.»',
  'pr.p':
    'Otro asistente habría promediado y te habría entregado una fecha. Esa fecha se vería igual de convincente, y alguien habría tomado una decisión con ella.',

  'pz.rotulo': 'Precios',
  'pz.h2': 'Se cobra la autoridad, no el acceso.',
  'pz.sub':
    'Quien solo ejecuta su parte, o solo quiere ver cómo va el proyecto, no paga asiento. Se cobra el titular y a quien toma decisiones.',
  'pz.cuando': 'Al abrir la beta',
  'pz.nota': 'Las cifras se publican cuando abra la beta abierta.',
  'z1.t': 'Personal',
  'z1.p': 'Recordatorios, notas, hábitos y agenda. Gratis en Telegram.',
  'z1.precio': 'Gratis',
  'z2.t': 'Familia',
  'z2.p': 'El grupo de la familia más un par de grupos adicionales, con asientos para quienes deciden.',
  'z3.t': 'Proyectos',
  'z3.p': 'Planes con avance, dependencias y ruta crítica. Observadores de solo lectura sin costo.',

  'fin.h2': 'El plan deja de vivir en una hoja que alguien actualiza los viernes.',
  'fin.sub':
    'Zaelyn está en pruebas cerradas con un grupo pequeño. Aquí se anuncia cuando abra, y aquí va a vivir el portal de proyectos.',
  'fin.cta': 'Conoce el producto',

  'pie.ne': 'Zaelyn es un producto de NE Intelligence',
  'pie.priv': 'Privacidad',
  'pie.term': 'Términos',
  'pie.year': '© 2026 NE Intelligence',
}

export type Clave = keyof typeof es

const en: Partial<Record<Clave, string>> = {}
const pt: Partial<Record<Clave, string>> = {}

const TEXTOS: Record<Idioma, Partial<Record<Clave, string>>> = { es, en, pt }

/** Devuelve el traductor del idioma; lo que falte cae en español. */
export function textos(lang: Idioma) {
  const d = TEXTOS[lang] ?? {}
  return (k: Clave): string => d[k] ?? es[k]
}

/** Qué idiomas están realmente traducidos (español siempre). */
export function traducidos(): Idioma[] {
  return IDIOMAS.filter((l) => l === 'es' || Object.keys(TEXTOS[l]).length > 0)
}
