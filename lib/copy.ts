/**
 * El texto del sitio, por idioma.
 *
 * `es` está completo y es la base: cualquier clave que falte en otro idioma
 * cae en español en vez de quedarse vacía. Para abrir inglés o portugués solo
 * hay que llenar esos objetos con las mismas claves — ni las rutas ni los
 * componentes cambian.
 *
 * Los ejemplos usan un proyecto y unas personas inventadas (Andes, @mariana,
 * @rafa). Nada de lo que aparece aquí es de un cliente real.
 */

export const IDIOMAS = ['es', 'en', 'pt'] as const
export type Idioma = (typeof IDIOMAS)[number]
export const NOMBRE_IDIOMA: Record<Idioma, string> = { es: 'ES', en: 'EN', pt: 'PT' }

const es = {
  // ── marco ────────────────────────────────────────────────────────────
  'nav.proyectos': 'Proyectos',
  'nav.familia': 'Familia',
  'nav.personal': 'Personal',
  'nav.precios': 'Precios',
  'nav.portal': 'Ver el portal',
  'nav.menu': 'Abrir menú',
  'nav.inicio': 'zælyn, inicio',
  'nav.idioma': 'Idioma',
  'aviso.prueba': 'En pruebas cerradas',
  'aviso.texto': 'Zaelyn está en pruebas con un grupo pequeño. La beta abierta se anuncia aquí.',
  'pie.ne': 'Zaelyn es un producto de NE Intelligence',
  'pie.priv': 'Privacidad',
  'pie.term': 'Términos',
  'pie.year': '© 2026 NE Intelligence',
  'pie.proyectos': 'Zaelyn Proyectos',
  'pie.familia': 'Zaelyn Familia',
  'pie.personal': 'Zaelyn Personal',
  'pie.portal': 'Portal de proyectos',

  // ── portada ──────────────────────────────────────────────────────────
  'meta.titulo': 'Zaelyn — Tu PMO de bolsillo',
  'meta.desc':
    'Sube el Excel que ya tienes y lleva el seguimiento hablando. Proyectos, familia y pendientes en un solo lugar, con un número que no se inventa.',
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
  'chat.3': 'ruta crítica de Andes',
  'chat.4a': 'La cadena más larga son 7 actividades y termina en «Capacitar a usuarios clave».',
  'chat.4b': 'No te doy el total: faltan las horas de 3 renglones.',
  'chat.4c': 'Rellenarlas con un promedio sería un número inventado con cara de cálculo.',

  'prod.rotulo': 'Un motor, tres maneras de usarlo',
  'prod.h2': 'El mismo asistente, para lo que cada quien tiene que llevar.',
  'prod.sub':
    'Por dentro todo es lo mismo: grupos, actividades, responsables y fechas. Lo que cambia es qué te enseña y qué te recuerda.',
  'prod.ver': 'Ver Proyectos',
  'prod.pronto': 'En diseño',

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
  'p2.d': 'Se reparte de nuevo cuando algo cambia a última hora',
  'p2.pie': 'El chat ya funciona. La pantalla se diseña después de Proyectos.',

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
    '«La cotización va al 40%», «ya empecé el anexo», «pásale la factura a @rafa». Nadie entra a un sistema, nadie llena una celda, y queda registrado quién lo dijo y cuándo.',
  'c3.t': 'Pregunta cuando quieras',
  'c3.p':
    '«¿Qué está en riesgo hoy?», «¿cómo va @mariana?», «mándame el estatus en Excel». Llega armado en ese momento, no el viernes que alguien actualice la hoja.',

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
    'Zaelyn está en pruebas cerradas con un grupo pequeño. Aquí se anuncia cuando abra, y aquí vive el portal de proyectos.',
  'fin.cta': 'Conoce el producto',

  // ── Proyectos ────────────────────────────────────────────────────────
  'pr.meta.titulo': 'Zaelyn Proyectos — Tu PMO de bolsillo',
  'pr.meta.desc':
    'El plan vive en una base de datos, se actualiza hablando y se ve en un tablero que no puede contradecir al chat.',
  'pr.hero.etq': 'Zaelyn Proyectos',
  'pr.hero.h1a': 'Tu PMO',
  'pr.hero.h1b': 'de bolsillo.',
  'pr.hero.sub':
    'El plan deja de ser una hoja que alguien actualiza los viernes. Se carga una vez, se actualiza hablando y se ve en un tablero que lee exactamente lo mismo que el chat.',
  'pr.hero.cta1': 'Abrir el portal de ejemplo',
  'pr.hero.cta2': 'Cómo se carga un plan',

  'pr.dolor.rotulo': 'Por qué existe',
  'pr.dolor.h2': 'Entre viernes y viernes, nadie sabe dónde está parado el proyecto.',
  'pr.dolor.sub':
    'La hoja se actualiza una vez por semana y el avance real vive en mensajes sueltos. Para cuando se actualiza, ya es historia: nadie sabe qué está detenido, quién va retrasado ni qué hay que empujar hoy.',
  'pr.d1.t': 'El avance es una sola cifra, y miente',
  'pr.d1.p':
    'Un 60% no dice si tocaba 60 o si tocaba 85. Zaelyn da tres números: lo declarado, lo esperado al día de hoy y la distancia entre los dos.',
  'pr.d2.t': 'Lo que detiene a otra cosa no se ve',
  'pr.d2.p':
    'Una actividad detenida esperando a un tercero se ve igual que una que va lenta. Aquí se declara la dependencia y Zaelyn avisa en cuanto se destraba.',
  'pr.d3.t': 'La fecha final es una promesa sin sustento',
  'pr.d3.p':
    'Si no sabes qué cadena manda, mover una tarea es a ciegas. Zaelyn dibuja la cadena, y cuando le faltan horas para dar el total lo dice en vez de estimarlo.',

  'pr.vistas.rotulo': 'El portal',
  'pr.vistas.h2': 'Seis maneras de ver el mismo plan, todas leyendo el mismo número.',
  'pr.vistas.sub':
    'El portal no tiene consultas propias: pinta el objeto que Zaelyn usa para redactar en el chat. Si el chat dice 34%, la pantalla dice 34%. No es disciplina, es cómo está construido.',
  'pr.v1.t': 'Resumen',
  'pr.v1.p': 'Avance contra lo esperado, curva por semana, avance por fase y lo que Zaelyn ve hoy.',
  'pr.v2.t': 'Tablero',
  'pr.v2.p': 'Actividad por actividad, agrupado por fase: responsable, estado, prioridad, fechas y avance.',
  'pr.v3.t': 'Gantt',
  'pr.v3.p': 'Cuándo pasa qué, qué depende de qué, la línea de hoy y la ruta crítica marcada.',
  'pr.v4.t': 'Ruta crítica',
  'pr.v4.p': 'La cadena que manda sobre la fecha final, eslabón por eslabón, y qué dato falta para dar el total.',
  'pr.v5.t': 'Equipo',
  'pr.v5.p': 'Quién trae qué, con qué carga, qué entrega sigue y qué quedó sin responsable.',
  'pr.v6.t': 'Bitácora',
  'pr.v6.p': 'Qué cambió, quién lo dijo y por qué canal. Sin que nadie haya llenado una celda.',

  'pr.roles.rotulo': 'Quién puede qué',
  'pr.roles.h2': 'Cuatro roles, editables en cualquier momento.',
  'pr.roles.sub':
    'El rol se da por grupo y decide tanto lo que se ve como lo que se le puede pedir a Zaelyn. Quien solo observa puede preguntarle todo al asistente, pero no puede interrumpir a una persona: interrumpir es autoridad.',
  'pr.r1.t': 'Observa',
  'pr.r1.p': 'Ve avance, fechas, hitos y estados. Pregunta lo que quiera. No ve notas internas ni bitácora.',
  'pr.r2.t': 'Ejecuta',
  'pr.r2.p': 'Ve el plan completo y reporta el avance de lo suyo. Entra filtrado a sus actividades.',
  'pr.r3.t': 'Lidera',
  'pr.r3.p': 'Asigna, prioriza, mueve fechas y le pide avance a una persona.',
  'pr.r4.t': 'Administra',
  'pr.r4.p': 'Todo lo anterior, más roles, asientos y alta de proyectos.',

  'pr.excel.rotulo': 'El archivo',
  'pr.excel.h2': 'Tu Excel entra como está, y sale cuando lo pidas.',
  'pr.excel.sub':
    'Zaelyn reconoce los nombres de columna más usados y te enseña qué entendió antes de escribir nada. Las columnas que no usa no las pierde. Y cuando replanean, el archivo nuevo no sustituye al anterior: se reconcilia con él, renglón por renglón, por la columna de ID.',
  'pr.e1': 'Vista previa antes de aplicar: cuántos renglones son nuevos, cuántos cambian y cuáles no entendió',
  'pr.e2': 'Lo que desapareció del archivo no se cancela solo: se pregunta',
  'pr.e3': 'El estatus se descarga en Excel y se vuelve a subir como actualización',
  'pr.e4': 'Cada plan admite una sola fuente externa, para que dos listas no se fusionen en silencio',

  'pr.fin.h2': 'Ábrelo con datos de ejemplo y dime qué te falta.',
  'pr.fin.sub':
    'El portal está en construcción y corre con un proyecto inventado. Lo que ya funciona de verdad es el motor: el plan, el avance, las dependencias y la ruta crítica viven en Zaelyn desde hoy.',
  'pr.fin.cta': 'Abrir el portal de ejemplo',

  // ── áreas marcadas ───────────────────────────────────────────────────
  'ar.etq': 'En diseño',
  'ar.cta': 'Ver Proyectos, que ya está',
  'ar.chat': 'Qué funciona hoy en el chat',
  'ar.pantalla': 'Qué falta por diseñar',

  'fa.meta.titulo': 'Zaelyn Familia',
  'fa.meta.desc': 'Quién lleva, quién recoge y quién ya cumplió. El chat ya funciona; la pantalla se diseña después.',
  'fa.h1a': 'Organiza tu día,',
  'fa.h1b': 'disfruta en familia.',
  'fa.sub':
    'La logística de una familia repartida en dos casas y tres ciudades no cabe en un calendario compartido. Zaelyn la lleva hablando, y le avisa a quien le toca.',
  'fa.c1': 'Actividades de los hijos, con sus series y sus excepciones',
  'fa.c2': 'Quién lleva y quién recoge, con confirmación de quien lo asignó',
  'fa.c3': 'Un festivo no se supone: se le pregunta a los padres y la respuesta queda',
  'fa.c4': 'Alguien sin cuenta de Zaelyn también puede estar a cargo',
  'fa.c5': 'Compromisos abiertos: «¿quién los lleva?» y Zaelyn insiste si nadie lo toma',
  'fa.f1': 'El calendario de la familia en pantalla, con el reparto del día',
  'fa.f2': 'La vista de «esta semana en casa» para los dos hogares',
  'fa.f3': 'El calendario de la escuela, para que los festivos dejen de preguntarse',

  'pe.meta.titulo': 'Zaelyn Personal',
  'pe.meta.desc': 'Recordatorios que llegan a su hora y dejan de llegar cuando los cancelas. Notas, hábitos y tu día.',
  'pe.h1a': 'Lo tuyo,',
  'pe.h1b': 'incluido.',
  'pe.sub':
    'Va dentro de los dos planes y sin cobro aparte, porque un asistente que no te sirve a ti tampoco le va a servir a tu equipo.',
  'pe.c1': 'Recordatorios sueltos y series, en tu zona horaria',
  'pe.c2': 'Un recordatorio cancelado deja de llegar, de verdad',
  'pe.c3': 'Anotaciones que después puedes buscar por lo que dijiste',
  'pe.c4': 'Tu agenda de Google en el mismo resumen del día',
  'pe.c5': 'Apuntar no es avisar: un evento va a la agenda y no suena hasta que pides que suene',
  'pe.f1': 'Tu día y tu semana en pantalla, no solo en el chat',
  'pe.f2': 'Hábitos con su racha y su historia',
  'pe.f3': 'El diario, con la lectura de patrones que ya hace el chat',
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
