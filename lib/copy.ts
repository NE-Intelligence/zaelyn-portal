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
  'nav.entrar': 'Entrar',
  'nav.entrar.ayuda': 'Abrir mi portal de proyectos',
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

  // ── empieza (#182) ───────────────────────────────────────────────────
  'nav.empieza': 'Empieza',
  'hero.cta0': 'Empieza gratis',
  'em.rotulo': 'Empieza en 3 minutos',
  'em.h2': 'Abre Telegram, escanea y escríbele.',
  'em.sub': 'Zaelyn vive en Telegram: no hay app nueva que instalar ni cuenta que crear. El código de la guía te da 3 días de Zaelyn completa —Personal, Familia y Proyectos— sin tarjeta.',
  'em.1t': 'Ten Telegram',
  'em.1p': 'Si no lo tienes, descárgalo gratis en tu teléfono desde App Store o Google Play.',
  'em.2t': 'Escanea el código',
  'em.2p': 'Con la cámara del teléfono. Se abre el chat con @ZaelynBot y tu prueba se activa sola.',
  'em.3t': 'Salúdalo',
  'em.3p': 'Te pregunta tu ciudad para avisarte a tu hora. Después escríbele como a una persona.',
  'em.abrir': 'Abrir Zaelyn en Telegram',
  'em.qr': 'Código QR que abre Zaelyn en Telegram con la prueba de 3 días',
  'em.codigo': 'Código de prueba',
  'em.codigo.p': '3 días de Zaelyn completa. Si ya tienes el chat abierto, escribe «/codigo ZAELYN3».',
  'em.inv': '¿Te invitó alguien del equipo de Zaelyn? Tu invitación completa el mes gratis: escribe «/codigo» y el código que te dieron.',
  'em.guias': 'Guías para descargar',
  'em.g1t': 'Guía rápida de inicio',
  'em.g1p': 'De cero a tu primer recordatorio, en 4 páginas.',
  'em.g2t': 'Guía completa de capacidades',
  'em.g2p': 'Todo lo que puedes hacer en Telegram y en el portal, con ejemplos y pantallas.',
  'em.pdf': 'Descargar PDF',

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
  'p3.l': 'Dónde estás parado',
  'p3.p':
    'Gratis en Telegram: recordatorios que llegan a su hora y dejan de llegar cuando los cancelas, notas y hábitos. Con Sprint, tu día cruzado con todos tus grupos en una pantalla.',
  'p3.a': 'Recordatorios sueltos y series, en tu zona horaria',
  'p3.b': 'Anotaciones que después puedes buscar',
  'p3.c': 'Tu agenda de Google en el mismo resumen',
  'p3.d': 'Apuntar no es avisar: tú decides qué suena',
  'p3.pie': 'Kickoff es gratis en Telegram. Sprint agrega la pantalla y WhatsApp, y ya va dentro de Tribu y PMO.',

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
    'Paga quien decide: el Sponsor y sus Líderes. Quien ejecuta entra en bloques, y quien solo da seguimiento entra gratis.',
  'pz.nota': 'Precios en dólares al mes, IVA incluido. En México se cobran en pesos al tipo de cambio FIX de Banxico del día. Si necesitas factura, la pides en tu portal.',
  'pz.mes': 'USD al mes',
  'z1.t': 'Kickoff',
  'z1.p': 'Zaelyn gratis en Telegram: recordatorios, notas y pendientes.',
  'z1.precio': 'Gratis',
  'z2.t': 'Sprint',
  'z2.p': 'Tu día en WhatsApp y en pantalla: el portal Personal con todos tus grupos, conversación, audios y avisos redactados.',
  'z2.precio': '5.79',
  'z3.t': 'Tribu',
  'z3.p': 'Tu familia conectada: calendario, quién lleva y quién recoge, quehaceres con puntos y el medallero, para cuatro personas. Sin planes de proyecto.',
  'z3.precio': '15.07',
  'z4.t': 'PMO',
  'z4.p': 'Tu PMO de bolsillo: 3 proyectos activos, 6 Ejecutores, 2 Monitores, 30 créditos de IA y el editor de proyectos.',
  'z4.precio': '28.99',
  'pz.comp.t': 'Complementos de PMO',
  'pz.comp.1': 'Líder · 5.79',
  'pz.comp.2': '3 Ejecutores · 9.27',
  'pz.comp.3': 'Proyecto activo · 5.79',
  'pz.comp.4': 'Stakeholder o Monitor extra · 2.31',
  'pz.comp.5': '15 créditos de IA · 5.79',
  'pz.comp.6': '100 avisos de WhatsApp · 5.79',
  'pz.anual': 'Al año, PMO y sus lugares se pagan como 10 meses.',
  'pz.org': 'Organizaciones: varios Sponsors en una sola factura, con los límites juntos en una bolsa y cada persona contada una vez.',

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

  'fa.meta.titulo': 'Zaelyn Familia — Organiza tu día, disfruta en familia',
  'fa.meta.desc': 'Quién lleva, quién recoge, quién ya cumplió y quién ganó el sábado. Se habla en el chat y se ve en una pantalla que no contradice al chat.',
  'fa.hero.etq': 'Zaelyn Familia',
  'fa.h1a': 'Organiza tu día,',
  'fa.h1b': 'disfruta en familia.',
  'fa.sub':
    'La escuela, el futbol, la natación, quién lleva y quién recoge, los quehaceres y los cumpleaños. Se lo dices a Zaelyn como se lo dirías a alguien de la casa, le avisa a quien le toca, y la semana entera se ve en una pantalla.',
  'fa.cta1': 'Ver una familia de ejemplo',
  'fa.cta2': 'Cómo se le habla',
  'fa.charla': 'Una conversación de ejemplo con Zaelyn',
  'fa.chat.1': 'Hoy no puedo recoger a Mateo de futbol',
  'fa.chat.2a': 'Listo, lo suelto. Les aviso a Andrés y a la abuela Tere que hoy nadie recoge a Mateo;',
  'fa.chat.2b': 'el primero que diga «voy yo» se queda con él',
  'fa.chat.2c': 'y si nadie lo toma, insisto.',
  'fa.chat.3': 'Mateo cumplió con sacar la basura',
  'fa.chat.4a': '⭐ Sacar la basura — 10 puntos para Mateo. Lleva',
  'fa.chat.4b': '96',
  'fa.chat.4c': 'puntos, y para «invitar a un amigo a dormir» le faltan 24.',

  'fa.vistas.rotulo': 'La pantalla de la casa',
  'fa.vistas.h2': 'Seis vistas, la misma semana que lleva el chat.',
  'fa.vistas.sub': 'Ninguna pantalla hace cuentas por su lado: quién recoge a Mateo el jueves sale de la misma función que contesta en el chat. Ábrelas con una familia de ejemplo.',
  'fa.v1.t': 'Hoy en casa',
  'fa.v1.p': 'Una columna por persona, con su día, quién lleva y quién recoge. Arriba, lo que nadie ha cubierto y los choques: dos lugares a la misma hora con un solo adulto.',
  'fa.v2.t': 'Calendario',
  'fa.v2.p': 'Dos semanas con un color por persona: escuela, entrenamientos, partidos, clases, días sin clases de la SEP y cumpleaños.',
  'fa.v3.t': 'Traslados',
  'fa.v3.p': 'El reparto de la semana en una tabla: quién lleva y quién recoge cada día, y en rojo lo que se quedó sin nadie.',
  'fa.v4.t': 'Quehaceres y premios',
  'fa.v4.p': 'Tender la cama, sacar la basura, lavar los trastes: cada uno vale puntos, los Guías los aprueban y se canjean por premios que ponen ustedes.',
  'fa.v5.t': 'Medallero',
  'fa.v5.p': 'La vitrina de cada quien: medallas, trofeos, diplomas, marcas personales y los resultados de cada partido, por deporte.',
  'fa.v6.t': 'Fechas',
  'fa.v6.p': 'Cumpleaños, aniversarios y fechas importantes con su cuenta regresiva, y los días sin clases de las próximas dos semanas.',

  'fa.dice.rotulo': 'Se habla, no se llena',
  'fa.dice.h2': 'Nadie tiene que aprender una app.',
  'fa.dice.sub': 'Zaelyn entiende la forma en que ya hablan en casa. Estas frases funcionan hoy, tal cual:',
  'fa.d1': 'Mateo tiene futbol martes y jueves de 5 a 6:30',
  'fa.d2': 'yo llevo a Mateo a futbol los martes',
  'fa.d3': 'hoy no puedo recoger a Valeria',
  'fa.d4': 'quehacer para Mateo: tender su cama todos los días por 5 puntos',
  'fa.d5': 'premio: elegir la película del viernes por 40 puntos',
  'fa.d6': 'Valeria ganó el primer lugar en voleibol',
  'fa.d7': 'Mateo cumple años el 2 de noviembre',
  'fa.d8': '¿quién recoge a Mateo hoy?',

  'fa.roles.rotulo': 'Cada quien su papel',
  'fa.roles.h2': 'Una familia no es un equipo de trabajo, y los permisos tampoco.',
  'fa.roles.sub': 'Los papeles se ponen por persona y cambian con el tiempo: un hijo crece, alguien se muda, una casa se vuelve dos.',
  'fa.r1.t': 'Guía',
  'fa.r1.p': 'Mamá, papá, quien cuida. Reparte traslados, pone quehaceres y premios, y aprueba los puntos.',
  'fa.r2.t': 'A cargo',
  'fa.r2.p': 'Los hijos, con cuenta o sin ella. Ven su día, dicen «ya cumplí» y llevan su vitrina.',
  'fa.r3.t': 'Apoyo',
  'fa.r3.p': 'La abuela, la niñera, el tío que recoge los jueves. Ven sus traslados y nada más: ni puntos ni premios.',
  'fa.r4.t': 'Integrante',
  'fa.r4.p': 'Cualquiera más de la familia: participa en lo que le toca y recibe sus avisos.',

  'fa.reglas.rotulo': 'Lo que Zaelyn no hace',
  'fa.reglas.h2': 'Hay cosas que una app no debe decidir por una familia.',
  'fa.g1.t': 'No arbitra entre padres',
  'fa.g1.p': 'La relación de un Guía con sus hijos la termina solo ese Guía. En una separación, nadie saca al otro del horario de sus hijos con un comando.',
  'fa.g2.t': 'No supone un festivo',
  'fa.g2.p': 'Que sea Consejo Técnico no dice si hay clases en tu escuela. Zaelyn pregunta, y la primera respuesta queda para todos.',
  'fa.g3.t': 'No se aprueba solo',
  'fa.g3.p': 'Si Mateo dice que ya cumplió, sus puntos esperan a que un Guía los apruebe con un botón. Nadie se aprueba sus propios puntos.',

  'fa.precio.rotulo': 'Precio',
  'fa.precio.h2': 'Tribu: tu familia conectada.',
  'fa.precio.p': 'Calendario, quién lleva y quién recoge, quehaceres con puntos, premios, medallero y fechas para cuatro personas. Sin planes de proyecto: si también quieres el PMO, son dos módulos.',
  'fa.precio.cta': 'Ver todos los planes',
  'fa.fin.h2': 'Ábrela con una familia de ejemplo y dime qué le falta a la tuya.',
  'fa.fin.sub': 'La familia del ejemplo no existe. La tuya entra por el chat: «crea el grupo Familia», y desde ahí todo lo demás.',
  'fa.fin.cta': 'Ver una familia de ejemplo',

  'pe.meta.titulo': 'Zaelyn Personal — Dónde estás parado',
  'pe.meta.desc': 'Gratis en Telegram: recordatorios, notas y hábitos. Con Sprint, tu día en una pantalla: lo tuyo, lo de tu familia y lo de tus proyectos juntos, con lo que choca y lo que venció.',
  'pe.hero.etq': 'Zaelyn Personal',
  'pe.h1a': 'Todo lo que te toca,',
  'pe.h1b': 'en un solo lugar.',
  'pe.sub':
    'Zaelyn te ayuda a recordar, a ver dónde estás parado y a decidir qué va primero. El chat es gratis; la pantalla que cruza todos tus grupos es Sprint.',
  'pe.cta1': 'Ver un día de ejemplo',
  'pe.cta2': 'Qué es gratis y qué no',
  'pe.charla': 'Una conversación de ejemplo',
  'pe.chat.1': '¿qué tengo hoy?',
  'pe.chat.2a': 'Tres cosas, en este orden:',
  'pe.chat.2b': '«Matriz de pruebas» venció el lunes (Andes);',
  'pe.chat.2c': 'a las 2:00 te chocan la revisión con Termika y recoger a Valeria.',
  'pe.chat.3': 'recuérdame mañana a las 8 llevar el coche a servicio',
  'pe.chat.4a': 'Listo: mañana a las',
  'pe.chat.4b': '8:00 am',
  'pe.chat.4c': '. Si lo cancelas, deja de llegar.',

  'pe.vistas.rotulo': 'La pantalla',
  'pe.vistas.h2': 'Tú, a través de todos tus grupos.',
  'pe.vistas.sub':
    'Familia ve una casa y Proyectos ve un plan. Personal te ve a ti: lo que te toca en cada uno, junto, y lo que nadie más ve porque está en el cruce.',
  'pe.v1.t': 'Dónde estoy parado',
  'pe.v1.p': 'Las tres cosas que importan hoy, cada una con su porqué: lo vencido, lo que choca, lo que vence hoy.',
  'pe.v2.t': 'Mis compromisos',
  'pe.v2.p': 'Tus grupos, tu papel en cada uno, quién lo paga, y todo lo que está a tu nombre en cualquier plan.',
  'pe.v3.t': 'Calendario',
  'pe.v3.p': 'Dos semanas con tus recordatorios, tus encargos de familia, tus entregas y tu agenda de Google, cada cosa con el color de su grupo.',
  'pe.v4.t': 'Hábitos',
  'pe.v4.p': 'Lo que prometiste, con lo de hoy, tu racha y los últimos 28 días. El ánimo no se grafica.',

  'pe.dice.rotulo': 'Se habla, no se llena',
  'pe.dice.h2': 'Todo esto ya se le dice al chat.',
  'pe.dice.sub': 'La pantalla no tiene formularios: pinta lo que Zaelyn ya sabe por lo que le dijiste.',
  'pe.d1': 'recuérdame cada lunes a las 9 la junta de avance',
  'pe.d2': 'el 4 de noviembre es la boda de Ana',
  'pe.d3': 'quiero leer 10 páginas al día',
  'pe.d4': 'leí 12 páginas',
  'pe.d5': '¿qué tengo hoy?',
  'pe.d6': '¿qué tengo pendiente en Andes?',
  'pe.d7': 'anota: la clave del portón es la del garage',
  'pe.d8': 'mándame el resumen a las 7',

  'pe.reglas.rotulo': 'Tres reglas',
  'pe.reglas.h2': 'Lo que esta pantalla nunca hace.',
  'pe.g1.t': 'No calcula por su cuenta',
  'pe.g1.p': 'Lo que ves es lo mismo que contesta el chat, salido de la misma función. Si el chat dice que nada choca, la pantalla no puede decir otra cosa.',
  'pe.g2.t': 'No prioriza sin decir por qué',
  'pe.g2.p': 'Cada cosa del foco trae su motivo. El orden es una regla escrita —vencido, choque, vence hoy, lo próximo—, no la opinión de un modelo.',
  'pe.g3.t': 'No interpreta cómo te sientes',
  'pe.g3.p': 'Lo que escribes de tu ánimo se guarda con tus palabras. Leer patrones ahí es otro módulo, con tu permiso.',

  'pe.precio.rotulo': 'Precio',
  'pe.precio.h2': 'El chat es gratis. La pantalla se paga.',
  'pe.precio.sub':
    'Kickoff te deja usar Zaelyn completo desde Telegram, con límites. Sprint agrega tu portal Personal y WhatsApp. Tribu y PMO ya incluyen Sprint.',
  'pe.k.p': 'Todo desde Telegram: 5 recordatorios activos, notas de los últimos 15 días, 5 minutos de voz al mes. Entras a los grupos que te inviten.',
  'pe.s.p': 'Tu portal Personal, avisos por WhatsApp, 50 recordatorios activos, un año de historial y la conversación completa.',
  'pe.precio.inc': 'Incluido en Tribu y en PMO.',
  'pe.precio.cta': 'Ver todos los planes',

  'pe.fin.h2': 'Ábrelo con el día de alguien más y dime qué le falta al tuyo.',
  'pe.fin.sub': 'Sofía no existe. Tu día entra por el chat, y la pantalla se abre con «ábreme el portal».',
  'pe.fin.cta': 'Ver un día de ejemplo',
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
