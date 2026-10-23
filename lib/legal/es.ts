import type { TextosLegales } from './tipos'

/**
 * Español (México). Es la versión que rige: si una traducción difiere, manda
 * esta. Versión preliminar del 23 de octubre de 2026, pendiente de revisión
 * por abogado.
 */
export const legalEs: TextosLegales = {
  ui: {
    etq: 'Legal',
    indice: 'Documentos legales',
    version: 'Última actualización: 23 de octubre de 2026',
    preliminar: 'Versión preliminar. En caso de diferencia entre idiomas, rige la versión en español.',
    contenido: 'En este documento',
    otros: 'Otros documentos',
    volver: 'Todos los documentos',
  },
  docs: {
    // ═════════════════════════════════════════════════ AVISO DE PRIVACIDAD
    privacidad: {
      titulo: 'Aviso de privacidad',
      resumen:
        'Quién trata tus datos personales cuando usas Zaelyn, para qué, con quién se comparten y cómo ejerces tus derechos.',
      secciones: [
        {
          id: 'responsable',
          t: '1. Quién es responsable de tus datos',
          p: [
            'Zaelyn es un servicio de NE National Expertise («NE»). El responsable del tratamiento de tus datos personales es NE National Expertise Mexico, S.C. («NE México»), con domicilio en [FALTA: domicilio de NE México], que puedes contactar en [FALTA: correo de privacidad].',
            'Cuando Zaelyn se preste a personas fuera de México, el responsable será NE National Expertise America, Inc., y así se indicará en este aviso.',
            'Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente desde el 21 de marzo de 2025 y su reglamento.',
          ],
        },
        {
          id: 'datos',
          t: '2. Qué datos tratamos',
          p: [
            'Tratamos únicamente los datos necesarios para prestarte el servicio:',
            [
              'Identificación del canal: tu identificador y nombre de usuario de Telegram y, cuando esté disponible, tu número de WhatsApp.',
              'Perfil: el nombre con el que te presentas, tu ciudad o zona horaria y tu idioma.',
              'Contenido que tú registras: mensajes, recordatorios, notas, hábitos, audios, fotos, documentos, planes, actividades, quehaceres y fechas.',
              'Datos de otras personas que tú registras: integrantes de tu familia —incluidos menores a tu cargo— o de tu equipo, con su nombre, su papel y sus actividades.',
              'Datos de pago: Stripe procesa el cobro. NE recibe la confirmación del pago, el importe, la moneda y un identificador de cliente; nunca recibe ni guarda el número de tu tarjeta.',
              'Datos fiscales, solo si pides factura: RFC, razón social, régimen fiscal, código postal, uso del CFDI y correo.',
              'Datos técnicos del portal: cookies de sesión y de preferencias y registros de acceso.',
              'Servicios que tú decidas conectar, como tu calendario: solo lo que autorices en esa conexión y solo para mostrártelo en Zaelyn.',
            ],
            'Zaelyn no te pide datos personales sensibles. Si tú decides escribir alguno —por ejemplo, sobre tu salud o tu estado de ánimo—, al registrarlo nos das tu consentimiento expreso para tratarlo con el único fin de prestarte el servicio. Puedes borrarlo cuando quieras.',
          ],
        },
        {
          id: 'finalidades',
          t: '3. Para qué los usamos',
          p: [
            'Finalidades necesarias para el servicio:',
            [
              'Entender lo que escribes o dices y guardarlo donde corresponde.',
              'Recordarte, avisarte y avisar a los integrantes de tus grupos lo que les toca, según los papeles que ustedes definen.',
              'Mostrarte tu información en el portal.',
              'Cobrar, facturar y llevar la contabilidad de lo cobrado.',
              'Proteger tu cuenta y el servicio, prevenir abusos y atender fallas.',
              'Atenderte y cumplir obligaciones legales y fiscales.',
            ],
            'Finalidades adicionales, a las que puedes negarte sin perder el servicio: enviarte novedades de Zaelyn y elaborar estadísticas agregadas que no te identifican para mejorar el producto. Para negarte, escríbenos a [FALTA: correo de privacidad].',
            'No vendemos tus datos. No los usamos para publicidad. No usamos tu contenido para entrenar modelos de inteligencia artificial, propios ni de terceros.',
          ],
        },
        {
          id: 'encargados',
          t: '4. Con quién se comparten',
          p: [
            'Para operar Zaelyn usamos proveedores que tratan datos por cuenta de NE, bajo contrato y solo para prestar el servicio:',
            [
              'Base de datos y alojamiento: Supabase (Estados Unidos).',
              'Servidores de aplicación: Fly.io (Estados Unidos).',
              'Sitio y portal web: Vercel (Estados Unidos).',
              'Interpretación con inteligencia artificial: Anthropic (Estados Unidos), que no usa estos datos para entrenar sus modelos.',
              'Transcripción de audios: [FALTA: proveedor de transcripción de voz].',
              'Administración de llaves de cifrado: Google Cloud KMS.',
              'Envío de mensajes de WhatsApp: Twilio.',
              'Procesamiento de pagos: Stripe.',
            ],
            'Algunos de estos proveedores están fuera de México, por lo que tus datos se transfieren a otros países con las garantías que exige la ley.',
            'Telegram y WhatsApp (Meta) no son proveedores de NE: son servicios que tú eliges y que tratan tus mensajes conforme a sus propios avisos de privacidad.',
            'Lo que escribes dentro de un grupo lo ven sus integrantes según su papel: es la naturaleza de un grupo y lo decides tú al invitarlos.',
            'Solo entregaremos datos a una autoridad cuando una ley o una orden fundada y motivada lo exija.',
          ],
        },
        {
          id: 'derechos',
          t: '5. Tus derechos',
          p: [
            'Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su tratamiento (derechos ARCO), revocar tu consentimiento y limitar su uso. También puedes oponerte a decisiones que se tomen solo de forma automatizada y te afecten de manera significativa.',
            'Para ejercerlos, escribe a [FALTA: correo de privacidad] con tu nombre, el canal con el que usas Zaelyn, el derecho que quieres ejercer y un medio para responderte. El procedimiento completo está en «Tus datos personales».',
            'Si consideras que tu derecho no fue atendido, puedes acudir a la Secretaría Anticorrupción y Buen Gobierno, autoridad garante en materia de protección de datos personales.',
          ],
        },
        {
          id: 'cookies',
          t: '6. Cookies',
          p: [
            'El sitio y el portal usan solo cookies necesarias: una de sesión para mantenerte dentro del portal y dos de preferencia para recordar tu idioma y tu tema. No usamos cookies de publicidad ni de rastreo de terceros.',
          ],
        },
        {
          id: 'menores',
          t: '7. Menores de edad',
          p: [
            'Zaelyn está dirigido a personas mayores de edad. Un menor puede aparecer en un grupo de familia registrado por su madre, padre o tutor, quien declara ejercer la patria potestad o la tutela y es responsable de esa información. Un menor solo puede tener cuenta propia con autorización de quien ejerza la patria potestad o la tutela.',
          ],
        },
        {
          id: 'cambios',
          t: '8. Cambios a este aviso',
          p: [
            'Cualquier cambio se publicará en esta página con su fecha. Si el cambio es importante, también te lo diremos por el chat de Zaelyn.',
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ TUS DATOS PERSONALES
    datos: {
      titulo: 'Tus datos personales',
      resumen: 'Dónde viven tus datos, cuánto tiempo se guardan, cómo los proteges y cómo ejerces tus derechos paso a paso.',
      secciones: [
        {
          id: 'donde',
          t: '1. Dónde viven',
          p: [
            'Todo lo que le dices a Zaelyn vive en una sola base de datos. El chat y el portal leen de ella; el portal no guarda copia propia. El contenido de los grupos se cifra con llaves por grupo, protegidas a su vez por una llave maestra que administra Google Cloud KMS.',
          ],
        },
        {
          id: 'tiempo',
          t: '2. Cuánto tiempo se guardan',
          p: [
            [
              'Tu historial se conserva según tu plan: 15 días en Kickoff, un año en Sprint y Tribu, y sin límite en PMO mientras tu cuenta esté activa.',
              'Los datos de cobro y facturación se conservan cinco años, porque las leyes fiscales lo exigen.',
              'Cuando cancelas tu cuenta, tus datos se borran o se anonimizan, salvo lo que la ley nos obligue a conservar.',
            ],
          ],
        },
        {
          id: 'control',
          t: '3. Lo que puedes hacer tú mismo',
          p: [
            [
              'Ver lo tuyo: pregúntale a Zaelyn o ábrelo en tu portal.',
              'Descargar el estatus de un plan: «mándame el estatus en Excel».',
              'Corregir: dile a Zaelyn el dato correcto, o cámbialo en tu portal donde se pueda.',
              'Borrar recordatorios, notas o actividades: pídeselo a Zaelyn.',
              'Salir de un grupo o sacar a alguien, según tu papel.',
              'Revisar y cerrar tus sesiones del portal: «mis sesiones», «cierra todas».',
            ],
          ],
        },
        {
          id: 'arco',
          t: '4. Cómo ejercer tus derechos ARCO',
          p: [
            'Escribe a [FALTA: correo de privacidad] e incluye:',
            [
              'Tu nombre y el canal con el que usas Zaelyn (tu usuario de Telegram o tu número de WhatsApp).',
              'El derecho que quieres ejercer y, si aplica, qué dato quieres corregir o borrar.',
              'Un medio para responderte.',
              'Si actúas en nombre de otra persona, el documento que acredite tu representación.',
            ],
            'Para confirmar que eres tú, te pediremos verificarlo desde el mismo chat de Zaelyn. Te responderemos dentro de los plazos que marca la ley y, si procede, haremos efectivo el cambio sin costo.',
          ],
        },
        {
          id: 'terceros',
          t: '5. Datos de otras personas',
          p: [
            'Si registras a alguien más —tu familia, tu equipo, un cliente—, eres responsable de contar con su consentimiento o con el derecho de hacerlo, y de que lo que registras sea correcto. En ese caso NE trata esos datos por tu cuenta y solo para prestarte el servicio. Si esa persona nos pide ejercer sus derechos, la atenderemos y te lo haremos saber.',
          ],
        },
        {
          id: 'seguridad',
          t: '6. Seguridad',
          p: [
            [
              'La comunicación con el portal y con nuestros servidores viaja cifrada.',
              'Cada persona solo puede ver los grupos a los que pertenece; el aislamiento se comprueba con pruebas automáticas.',
              'Al portal se entra con un enlace de un solo uso que pides desde tu chat; la sesión dura 14 días y la puedes cerrar desde el chat.',
              'El navegador nunca recibe tu credencial de sesión: la usa solo nuestro servidor.',
            ],
            'Ningún sistema es invulnerable. Si ocurre una vulneración que afecte de forma significativa tus derechos, te lo informaremos sin demora.',
          ],
        },
        {
          id: 'cookies',
          t: '7. Cookies que usamos',
          p: [
            [
              'zpt — sesión del portal. Necesaria. Dura 14 días.',
              'zl — idioma elegido. Preferencia. Dura un año.',
              'zt — tema elegido (día, noche o automático). Preferencia. Dura un año.',
            ],
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ TÉRMINOS
    terminos: {
      titulo: 'Términos y condiciones',
      resumen: 'Las reglas para usar Zaelyn: el servicio, los planes y pagos, tu contenido, el uso permitido y cómo se resuelven las diferencias.',
      secciones: [
        {
          id: 'quien',
          t: '1. Quién presta el servicio',
          p: [
            'Zaelyn es un servicio de NE National Expertise. En México lo presta y lo cobra NE National Expertise Mexico, S.C.; fuera de México lo hará NE National Expertise America, Inc. En estos términos, «NE» se refiere a la entidad que te presta el servicio.',
          ],
        },
        {
          id: 'aceptacion',
          t: '2. Aceptación',
          p: [
            'Al usar Zaelyn —por chat o por el portal— aceptas estos términos, el aviso de privacidad y el documento de deslinde y responsabilidades. Si contratas en nombre de una empresa, declaras que puedes obligarla.',
          ],
        },
        {
          id: 'servicio',
          t: '3. El servicio',
          p: [
            'Zaelyn es un asistente de organización personal, familiar y de proyectos que funciona por chat (Telegram y, cuando esté disponible, WhatsApp) y por un portal web. Hoy está en pruebas: algunas funciones pueden cambiar, agregarse o retirarse. Te avisaremos de los cambios que afecten lo que contrataste.',
          ],
        },
        {
          id: 'cuenta',
          t: '4. Tu cuenta y tu acceso',
          p: [
            'Tu identidad en Zaelyn es tu cuenta del canal con el que lo usas. Cuidar el acceso a tu teléfono, a tu cuenta de Telegram o WhatsApp y a tus sesiones del portal es responsabilidad tuya. Si pierdes un dispositivo, cierra tus sesiones desde el chat.',
          ],
        },
        {
          id: 'pagos',
          t: '5. Planes, precios y pagos',
          p: [
            [
              'Los precios publicados están en dólares e incluyen IVA. En México se cobran en pesos al tipo de cambio FIX de Banxico del día del cobro.',
              'Los planes de paga se renuevan automáticamente cada mes o cada año, según lo que elijas, hasta que los canceles.',
              'Los complementos se suman o se quitan en cualquier momento y se cobran de forma prorrateada.',
              'Puedes cancelar cuando quieras desde tu portal. El plan sigue activo hasta el fin del periodo pagado y después tu cuenta vuelve a Kickoff.',
              'Los pagos los procesa Stripe conforme a sus propios términos.',
              'Un cambio de precio se avisa con al menos 30 días de anticipación y nunca afecta un periodo ya pagado.',
              'Si un cobro no se puede realizar, la cuenta puede volver a Kickoff hasta que se regularice.',
              'Beta 1 · fundadores: las primeras 30 suscripciones reciben un descuento permanente sobre el plan —75% las primeras 10, 50% las siguientes 10 y 25% las siguientes 10, por orden de contratación— mientras la suscripción se mantenga activa. No aplica a complementos. Si la suscripción se cancela, el descuento no se recupera.',
              'Las promociones temporales tienen su propia vigencia, se indican al contratar y no se acumulan con el descuento de fundador.',
            ],
          ],
        },
        {
          id: 'factura',
          t: '6. Facturación',
          p: [
            'Si necesitas factura, captura tus datos fiscales en tu portal antes del cierre del mes. Lo cobrado y no facturado a tiempo se incluye en la factura global del mes, conforme a las reglas fiscales vigentes.',
          ],
        },
        {
          id: 'uso',
          t: '7. Uso permitido',
          p: [
            'No puedes usar Zaelyn para:',
            [
              'Actividades ilegales, fraude, acoso, amenazas o discriminación.',
              'Registrar o difundir datos de otras personas sin derecho a hacerlo.',
              'Mandar avisos masivos o no deseados a través de los grupos.',
              'Intentar acceder a información de otros, vulnerar el servicio o automatizar su uso de forma abusiva.',
              'Revender el servicio sin autorización escrita de NE.',
            ],
            'Si detectamos un uso así, podemos limitar o suspender la cuenta.',
          ],
        },
        {
          id: 'contenido',
          t: '8. Tu contenido',
          p: [
            'Lo que registras en Zaelyn es tuyo. Nos das permiso de guardarlo, procesarlo y mostrarlo solo para prestarte el servicio, incluido avisar a los integrantes de tus grupos. Eres responsable de lo que registras y de tener derecho a registrar datos de otras personas.',
          ],
        },
        {
          id: 'ia',
          t: '9. Inteligencia artificial',
          p: [
            'Zaelyn usa inteligencia artificial para entender lo que escribes o dices; lo que se guarda, se calcula y se avisa lo decide código. Aun así, puede entender mal una frase. Revisa lo importante. Zaelyn no da asesoría médica, legal, fiscal ni financiera.',
          ],
        },
        {
          id: 'disponibilidad',
          t: '10. Disponibilidad',
          p: [
            'Trabajamos para que Zaelyn esté disponible siempre, pero puede haber interrupciones por mantenimiento, fallas o servicios de terceros. Durante las pruebas no ofrecemos un nivel de servicio garantizado.',
          ],
        },
        {
          id: 'propiedad',
          t: '11. Propiedad intelectual',
          p: [
            'La marca Zaelyn, el software, el diseño y los contenidos del servicio son de NE. Usar Zaelyn no te da derechos sobre ellos, más allá de usar el servicio conforme a estos términos.',
          ],
        },
        {
          id: 'responsabilidad',
          t: '12. Responsabilidad',
          p: [
            'Lo que es responsabilidad de NE y lo que es tuyo se detalla en el documento «Deslinde y responsabilidades», que forma parte de estos términos.',
          ],
        },
        {
          id: 'terminacion',
          t: '13. Suspensión y terminación',
          p: [
            'Puedes dejar de usar Zaelyn y cancelar tu cuenta en cualquier momento. NE puede suspender o terminar una cuenta que incumpla estos términos; cuando sea posible, te avisaremos antes y te diremos por qué.',
          ],
        },
        {
          id: 'cambios',
          t: '14. Cambios a estos términos',
          p: [
            'Publicaremos cualquier cambio en esta página con su fecha y te avisaremos por el chat cuando sea importante. Si no estás de acuerdo, puedes cancelar antes de que entre en vigor.',
          ],
        },
        {
          id: 'ley',
          t: '15. Ley aplicable',
          p: [
            'Estos términos se rigen por las leyes federales de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a los tribunales de [FALTA: ciudad de jurisdicción], sin perjuicio de los derechos que como consumidor te reconoce la ley, incluido acudir a la Procuraduría Federal del Consumidor.',
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ DESLINDE
    deslinde: {
      titulo: 'Deslinde y responsabilidades',
      resumen:
        'Qué es y qué no es Zaelyn, qué responde NE, qué responde quien contrata y qué depende de servicios de terceros como Telegram, WhatsApp o Stripe.',
      secciones: [
        {
          id: 'que-es',
          t: '1. Qué es y qué no es Zaelyn',
          p: [
            'Zaelyn es una herramienta de organización: recuerda, avisa, ordena y muestra lo que tú y tus grupos le dicen. No es:',
            [
              'Un servicio de emergencias. Ante una emergencia, llama al 911 o al número local.',
              'Asesoría médica, psicológica, legal, fiscal, contable ni financiera.',
              'Quien cuida a un menor. Zaelyn recuerda quién lleva y quién recoge; llevar y recoger lo hacen las personas.',
              'Un sistema de registro oficial, contable o de cumplimiento normativo de tu empresa.',
            ],
          ],
        },
        {
          id: 'usuario',
          t: '2. Lo que es responsabilidad de quien usa Zaelyn',
          p: [
            'El uso de Zaelyn y la información que en él se registra son responsabilidad de la persona o empresa que contrata el servicio y de cada usuario respecto de lo que registra. En particular:',
            [
              'La veracidad, legalidad y oportunidad de lo que registras.',
              'Tener el consentimiento o el derecho de registrar datos de otras personas, incluidos menores a tu cargo.',
              'A quién invitas a tus grupos y qué papel le das: lo que se escribe en un grupo lo ven sus integrantes según ese papel.',
              'Las decisiones que tomas con base en lo que Zaelyn te muestra o te recuerda, y verificar lo crítico antes de actuar.',
              'Cuidar tus dispositivos, tus cuentas de Telegram o WhatsApp y tus sesiones del portal.',
              'Usar Zaelyn conforme a la ley y a los términos.',
            ],
          ],
        },
        {
          id: 'terceros',
          t: '3. Servicios de terceros',
          p: [
            'Telegram, WhatsApp (Meta), Twilio, Google, Microsoft, Stripe y los demás servicios con los que Zaelyn se conecta son independientes de NE y se rigen por sus propios términos y avisos de privacidad. NE no los controla, por lo que no responde por:',
            [
              'Su disponibilidad, sus fallas, sus demoras ni su seguridad.',
              'Cómo almacenan, cifran o tratan los mensajes que viajan por sus plataformas.',
              'Cambios en sus políticas —por ejemplo, restricciones de Meta a los asistentes de inteligencia artificial en WhatsApp— ni suspensiones o bloqueos de tu cuenta en esos servicios.',
              'Mensajes que no se entreguen o lleguen tarde por causas de esos servicios o de tu red.',
            ],
            'Cuando un tercero cambie sus condiciones de forma que afecte a Zaelyn, haremos lo razonable para ofrecerte una alternativa y te lo avisaremos.',
          ],
        },
        {
          id: 'ia',
          t: '4. Inteligencia artificial y avisos',
          p: [
            'Zaelyn interpreta lenguaje natural y puede entender mal una frase; por eso pregunta cuando duda y te muestra lo que entendió antes de aplicar cambios grandes. Un aviso depende de que el canal lo entregue: no uses Zaelyn como único recordatorio de algo cuya omisión pueda causar un daño grave.',
          ],
        },
        {
          id: 'ne',
          t: '5. Lo que sí es responsabilidad de NE',
          p: [
            [
              'Proteger los datos que custodia con medidas de seguridad administrativas, técnicas y físicas razonables, y tratarlos solo para las finalidades del aviso de privacidad.',
              'Prestar el servicio como se describe y cobrar únicamente lo publicado.',
              'Avisarte sin demora si ocurre una vulneración de seguridad que afecte de forma significativa tus derechos.',
              'Atender tus derechos ARCO y tus aclaraciones.',
              'Responder por los daños que cause por dolo o negligencia propios, en los términos de la ley.',
            ],
          ],
        },
        {
          id: 'limite',
          t: '6. Límite de responsabilidad',
          p: [
            'En la medida en que la ley lo permita, la responsabilidad total de NE frente a una cuenta se limita al monto que esa cuenta pagó en los doce meses anteriores al hecho que la origine, y NE no responde por daños indirectos, lucro cesante ni pérdida de oportunidades.',
            'Nada de lo anterior limita los derechos que la ley te otorga como consumidor ni la responsabilidad que legalmente no pueda excluirse.',
          ],
        },
        {
          id: 'fuerza',
          t: '7. Caso fortuito y fuerza mayor',
          p: [
            'NE no responde por incumplimientos causados por hechos fuera de su control razonable, como desastres naturales, fallas generales de internet o de energía, actos de autoridad o fallas de los servicios de terceros descritos arriba.',
          ],
        },
        {
          id: 'indemnidad',
          t: '8. Reclamaciones de terceros',
          p: [
            'Si un tercero reclama a NE por contenido que registraste sin derecho o por un uso de Zaelyn contrario a la ley o a los términos, en la medida permitida por la ley responderás frente a ese tercero y mantendrás a NE en paz y a salvo.',
          ],
        },
      ],
    },
  },
}
