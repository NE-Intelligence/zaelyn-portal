import type { TextosLegales } from './tipos'

/**
 * Tradução para o português dos textos jurídicos. Rege a versão em espanhol;
 * se houver diferença, prevalece o espanhol. Versão preliminar, 23 de outubro
 * de 2026.
 */
export const legalPt: TextosLegales | null = {
  ui: {
    etq: 'Jurídico',
    indice: 'Documentos jurídicos',
    version: 'Última atualização: 23 de outubro de 2026',
    preliminar: 'Versão preliminar. Esta é uma tradução de cortesia: rege a versão em espanhol, que prevalece se houver diferença.',
    contenido: 'Neste documento',
    otros: 'Outros documentos',
    volver: 'Todos os documentos',
  },
  docs: {
    // ═════════════════════════════════════════════════ AVISO DE PRIVACIDADE
    privacidad: {
      titulo: 'Aviso de privacidade',
      resumen:
        'Quem trata seus dados pessoais quando você usa a Zaelyn, para quê, com quem são compartilhados e como exercer seus direitos.',
      secciones: [
        {
          id: 'responsable',
          t: '1. Quem é responsável pelos seus dados',
          p: [
            'A Zaelyn é um serviço da NE National Expertise («NE»). A controladora dos seus dados pessoais é NE National Expertise Mexico, S.C. («NE México»), com sede em [FALTA: endereço da NE México], que você pode contatar em [FALTA: e-mail de privacidade].',
            'Quando a Zaelyn for prestada a pessoas fora do México, a controladora será NE National Expertise America, Inc., e isso será indicado neste aviso.',
            'Este aviso é emitido conforme a Ley Federal de Protección de Datos Personales en Posesión de los Particulares (lei federal mexicana de proteção de dados pessoais em posse de particulares), vigente desde 21 de março de 2025, e seu regulamento.',
          ],
        },
        {
          id: 'datos',
          t: '2. Quais dados tratamos',
          p: [
            'Tratamos apenas os dados necessários para prestar o serviço:',
            [
              'Identificação do canal: seu identificador e nome de usuário do Telegram e, quando disponível, seu número de WhatsApp.',
              'Perfil: o nome com que você se apresenta, sua cidade ou fuso horário e seu idioma.',
              'Conteúdo que você registra: mensagens, lembretes, notas, hábitos, áudios, fotos, documentos, planos, atividades, tarefas e datas.',
              'Dados de outras pessoas que você registra: integrantes da sua família —incluindo menores sob sua responsabilidade— ou da sua equipe, com nome, papel e atividades.',
              'Dados de pagamento: a Stripe processa a cobrança. A NE recebe a confirmação do pagamento, o valor, a moeda e um identificador de cliente; nunca recebe nem guarda o número do seu cartão.',
              'Dados fiscais, só se você pedir nota fiscal: RFC (cadastro fiscal mexicano), razão social, regime fiscal, código postal, uso do CFDI e e-mail.',
              'Dados técnicos do portal: cookies de sessão e de preferências e registros de acesso.',
              'Serviços que você decidir conectar, como sua agenda: só o que você autorizar nessa conexão e só para mostrar a você na Zaelyn.',
            ],
            'A Zaelyn não pede dados pessoais sensíveis. Se você decidir escrever algum —por exemplo, sobre sua saúde ou seu humor—, ao registrá-lo você nos dá seu consentimento expresso para tratá-lo com o único fim de prestar o serviço. Você pode apagá-lo quando quiser.',
          ],
        },
        {
          id: 'finalidades',
          t: '3. Para que os usamos',
          p: [
            'Finalidades necessárias para o serviço:',
            [
              'Entender o que você escreve ou diz e guardar onde corresponde.',
              'Lembrar você, avisar você e avisar os integrantes dos seus grupos do que é com eles, conforme os papéis que vocês definem.',
              'Mostrar suas informações no portal.',
              'Cobrar, emitir notas fiscais e manter a contabilidade do que foi cobrado.',
              'Proteger sua conta e o serviço, prevenir abusos e atender falhas.',
              'Atender você e cumprir obrigações legais e fiscais.',
            ],
            'Finalidades adicionais, que você pode recusar sem perder o serviço: enviar novidades da Zaelyn e elaborar estatísticas agregadas que não identificam você para melhorar o produto. Para recusar, escreva para [FALTA: e-mail de privacidade].',
            'Não vendemos seus dados. Não os usamos para publicidade. Não usamos seu conteúdo para treinar modelos de inteligência artificial, próprios ou de terceiros.',
          ],
        },
        {
          id: 'encargados',
          t: '4. Com quem são compartilhados',
          p: [
            'Para operar a Zaelyn usamos fornecedores que tratam dados em nome da NE, sob contrato e só para prestar o serviço:',
            [
              'Banco de dados e hospedagem: Supabase (Estados Unidos).',
              'Servidores de aplicação: Fly.io (Estados Unidos).',
              'Site e portal web: Vercel (Estados Unidos).',
              'Interpretação com inteligência artificial: Anthropic (Estados Unidos), que não usa esses dados para treinar seus modelos.',
              'Transcrição de áudios: [FALTA: fornecedor de transcrição de voz].',
              'Gestão de chaves de criptografia: Google Cloud KMS.',
              'Envio de mensagens de WhatsApp: Twilio.',
              'Processamento de pagamentos: Stripe.',
            ],
            'Alguns desses fornecedores estão fora do México, por isso seus dados são transferidos para outros países com as garantias que a lei exige.',
            'Telegram e WhatsApp (Meta) não são fornecedores da NE: são serviços que você escolhe e que tratam suas mensagens conforme seus próprios avisos de privacidade.',
            'O que você escreve dentro de um grupo é visto pelos integrantes conforme seu papel: é a natureza de um grupo, e você decide isso ao convidá-los.',
            'Só entregaremos dados a uma autoridade quando uma lei ou uma ordem fundamentada o exigir.',
          ],
        },
        {
          id: 'derechos',
          t: '5. Seus direitos',
          p: [
            'Você pode acessar seus dados, retificá-los, cancelá-los ou se opor ao seu tratamento (direitos ARCO: acesso, retificação, cancelamento e oposição), revogar seu consentimento e limitar seu uso. Também pode se opor a decisões tomadas apenas de forma automatizada que afetem você de maneira significativa.',
            'Para exercê-los, escreva para [FALTA: e-mail de privacidade] com seu nome, o canal com que usa a Zaelyn, o direito que quer exercer e um meio para respondermos. O procedimento completo está em «Seus dados pessoais».',
            'Se considerar que seu direito não foi atendido, você pode recorrer à Secretaría Anticorrupción y Buen Gobierno (secretaria mexicana anticorrupção e de bom governo), autoridade responsável pela proteção de dados pessoais.',
          ],
        },
        {
          id: 'cookies',
          t: '6. Cookies',
          p: [
            'O site e o portal usam apenas cookies necessários: um de sessão para manter você no portal e dois de preferência para lembrar seu idioma e seu tema. Não usamos cookies de publicidade nem de rastreamento de terceiros.',
          ],
        },
        {
          id: 'menores',
          t: '7. Menores de idade',
          p: [
            'A Zaelyn é destinada a maiores de idade. Um menor pode aparecer num grupo de família registrado pela mãe, pelo pai ou pelo tutor, que declara exercer o poder familiar ou a tutela e é responsável por essa informação. Um menor só pode ter conta própria com autorização de quem exerce o poder familiar ou a tutela.',
          ],
        },
        {
          id: 'cambios',
          t: '8. Mudanças neste aviso',
          p: [
            'Qualquer mudança será publicada nesta página com sua data. Se a mudança for importante, também avisaremos pelo chat da Zaelyn.',
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ SEUS DADOS PESSOAIS
    datos: {
      titulo: 'Seus dados pessoais',
      resumen: 'Onde vivem seus dados, por quanto tempo são guardados, como protegê-los e como exercer seus direitos passo a passo.',
      secciones: [
        {
          id: 'donde',
          t: '1. Onde vivem',
          p: [
            'Tudo o que você diz à Zaelyn vive num único banco de dados. O chat e o portal leem dele; o portal não guarda cópia própria. O conteúdo dos grupos é criptografado com chaves por grupo, protegidas por sua vez por uma chave mestra administrada pelo Google Cloud KMS.',
          ],
        },
        {
          id: 'tiempo',
          t: '2. Por quanto tempo são guardados',
          p: [
            [
              'Seu histórico é guardado conforme seu plano: 15 dias no Kickoff, um ano no Sprint e no Tribu, e sem limite no PMO enquanto sua conta estiver ativa.',
              'Os dados de cobrança e faturamento são guardados por cinco anos, porque as leis fiscais exigem.',
              'Quando você cancela sua conta, seus dados são apagados ou anonimizados, exceto o que a lei nos obrigar a guardar.',
            ],
          ],
        },
        {
          id: 'control',
          t: '3. O que você mesmo pode fazer',
          p: [
            [
              'Ver o que é seu: pergunte à Zaelyn ou abra no seu portal.',
              'Baixar o status de um plano: «mándame el estatus en Excel» (me manda o status em Excel).',
              'Corrigir: diga à Zaelyn o dado correto, ou altere no seu portal onde for possível.',
              'Apagar lembretes, notas ou atividades: peça à Zaelyn.',
              'Sair de um grupo ou remover alguém, conforme seu papel.',
              'Revisar e encerrar suas sessões do portal: «mis sesiones» (minhas sessões), «cierra todas» (encerra todas).',
            ],
          ],
        },
        {
          id: 'arco',
          t: '4. Como exercer seus direitos ARCO',
          p: [
            'Escreva para [FALTA: e-mail de privacidade] e inclua:',
            [
              'Seu nome e o canal com que usa a Zaelyn (seu usuário do Telegram ou seu número de WhatsApp).',
              'O direito que quer exercer e, se for o caso, qual dado quer corrigir ou apagar.',
              'Um meio para respondermos.',
              'Se você age em nome de outra pessoa, o documento que comprove sua representação.',
            ],
            'Para confirmar que é você, pediremos a verificação pelo mesmo chat da Zaelyn. Responderemos dentro dos prazos que a lei estabelece e, se proceder, faremos a mudança sem custo.',
          ],
        },
        {
          id: 'terceros',
          t: '5. Dados de outras pessoas',
          p: [
            'Se você registra outra pessoa —sua família, sua equipe, um cliente—, é responsável por ter o consentimento dela ou o direito de fazê-lo, e por que o registrado esteja correto. Nesse caso a NE trata esses dados em seu nome e só para prestar o serviço. Se essa pessoa nos pedir para exercer seus direitos, vamos atendê-la e avisar você.',
          ],
        },
        {
          id: 'seguridad',
          t: '6. Segurança',
          p: [
            [
              'A comunicação com o portal e com nossos servidores trafega criptografada.',
              'Cada pessoa só pode ver os grupos dos quais faz parte; o isolamento é verificado com testes automáticos.',
              'Entra-se no portal com um link de uso único que você pede pelo seu chat; a sessão dura 14 dias e pode ser encerrada pelo chat.',
              'O navegador nunca recebe sua credencial de sessão: só nosso servidor a usa.',
            ],
            'Nenhum sistema é invulnerável. Se ocorrer um incidente que afete de forma significativa seus direitos, informaremos você sem demora.',
          ],
        },
        {
          id: 'cookies',
          t: '7. Cookies que usamos',
          p: [
            [
              'zpt — sessão do portal. Necessário. Dura 14 dias.',
              'zl — idioma escolhido. Preferência. Dura um ano.',
              'zt — tema escolhido (dia, noite ou automático). Preferência. Dura um ano.',
            ],
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ TERMOS
    terminos: {
      titulo: 'Termos e condições',
      resumen: 'As regras para usar a Zaelyn: o serviço, os planos e pagamentos, seu conteúdo, o uso permitido e como se resolvem as divergências.',
      secciones: [
        {
          id: 'quien',
          t: '1. Quem presta o serviço',
          p: [
            'A Zaelyn é um serviço da NE National Expertise. No México é prestado e cobrado pela NE National Expertise Mexico, S.C.; fora do México será pela NE National Expertise America, Inc. Nestes termos, «NE» se refere à empresa que presta o serviço a você.',
          ],
        },
        {
          id: 'aceptacion',
          t: '2. Aceitação',
          p: [
            'Ao usar a Zaelyn —pelo chat ou pelo portal— você aceita estes termos, o aviso de privacidade e o documento de isenção e responsabilidades. Se contratar em nome de uma empresa, declara que pode obrigá-la.',
          ],
        },
        {
          id: 'servicio',
          t: '3. O serviço',
          p: [
            'A Zaelyn é uma assistente de organização pessoal, familiar e de projetos que funciona por chat (Telegram e, quando disponível, WhatsApp) e por um portal web. Hoje está em testes: algumas funções podem mudar, ser adicionadas ou retiradas. Avisaremos das mudanças que afetem o que você contratou.',
          ],
        },
        {
          id: 'cuenta',
          t: '4. Sua conta e seu acesso',
          p: [
            'Sua identidade na Zaelyn é sua conta no canal com que você a usa. Cuidar do acesso ao seu celular, à sua conta de Telegram ou WhatsApp e às suas sessões do portal é responsabilidade sua. Se perder um dispositivo, encerre suas sessões pelo chat.',
          ],
        },
        {
          id: 'pagos',
          t: '5. Planos, preços e pagamentos',
          p: [
            [
              'Os preços publicados estão em dólares e incluem IVA mexicano. No México são cobrados em pesos pelo câmbio FIX do Banxico do dia da cobrança.',
              'Os planos pagos se renovam automaticamente a cada mês ou a cada ano, conforme sua escolha, até você cancelar.',
              'Os complementos podem ser somados ou retirados a qualquer momento e são cobrados de forma proporcional.',
              'Você pode cancelar quando quiser pelo seu portal. O plano segue ativo até o fim do período pago e depois sua conta volta ao Kickoff.',
              'Os pagamentos são processados pela Stripe conforme seus próprios termos.',
              'Uma mudança de preço é avisada com pelo menos 30 dias de antecedência e nunca afeta um período já pago.',
              'Se uma cobrança não puder ser feita, a conta pode voltar ao Kickoff até ser regularizada.',
              'Beta 1 · fundadores: as primeiras 30 assinaturas recebem um desconto permanente no plano —75% para as 10 primeiras, 50% para as 10 seguintes e 25% para as 10 seguintes, por ordem de contratação— enquanto a assinatura estiver ativa. Não se aplica a complementos. Se a assinatura for cancelada, o desconto não é recuperado.',
              'Promoções temporárias têm validade própria, são indicadas na contratação e não se acumulam com o desconto de fundador.',
            ],
          ],
        },
        {
          id: 'factura',
          t: '6. Faturamento',
          p: [
            'Se precisar de nota fiscal, cadastre seus dados fiscais no seu portal antes do fechamento do mês. O que foi cobrado e não faturado a tempo é incluído na nota fiscal global do mês, conforme as regras fiscais vigentes.',
          ],
        },
        {
          id: 'uso',
          t: '7. Uso permitido',
          p: [
            'Você não pode usar a Zaelyn para:',
            [
              'Atividades ilegais, fraude, assédio, ameaças ou discriminação.',
              'Registrar ou divulgar dados de outras pessoas sem direito a isso.',
              'Enviar avisos em massa ou indesejados pelos grupos.',
              'Tentar acessar informações de outros, violar o serviço ou automatizar seu uso de forma abusiva.',
              'Revender o serviço sem autorização por escrito da NE.',
            ],
            'Se detectarmos um uso assim, podemos limitar ou suspender a conta.',
          ],
        },
        {
          id: 'contenido',
          t: '8. Seu conteúdo',
          p: [
            'O que você registra na Zaelyn é seu. Você nos dá permissão para guardar, processar e mostrar só para prestar o serviço, incluindo avisar os integrantes dos seus grupos. Você é responsável pelo que registra e por ter direito a registrar dados de outras pessoas.',
          ],
        },
        {
          id: 'ia',
          t: '9. Inteligência artificial',
          p: [
            'A Zaelyn usa inteligência artificial para entender o que você escreve ou diz; o que é guardado, calculado e avisado é decidido por código. Mesmo assim, pode entender mal uma frase. Confira o que é importante. A Zaelyn não dá orientação médica, jurídica, fiscal nem financeira.',
          ],
        },
        {
          id: 'disponibilidad',
          t: '10. Disponibilidade',
          p: [
            'Trabalhamos para que a Zaelyn esteja sempre disponível, mas pode haver interrupções por manutenção, falhas ou serviços de terceiros. Durante os testes não oferecemos um nível de serviço garantido.',
          ],
        },
        {
          id: 'propiedad',
          t: '11. Propriedade intelectual',
          p: [
            'A marca Zaelyn, o software, o design e os conteúdos do serviço são da NE. Usar a Zaelyn não dá a você direitos sobre eles, além de usar o serviço conforme estes termos.',
          ],
        },
        {
          id: 'responsabilidad',
          t: '12. Responsabilidade',
          p: [
            'O que é responsabilidade da NE e o que é seu está detalhado no documento «Isenção e responsabilidades», que faz parte destes termos.',
          ],
        },
        {
          id: 'terminacion',
          t: '13. Suspensão e encerramento',
          p: [
            'Você pode deixar de usar a Zaelyn e cancelar sua conta a qualquer momento. A NE pode suspender ou encerrar uma conta que descumpra estes termos; quando possível, avisaremos antes e diremos por quê.',
          ],
        },
        {
          id: 'cambios',
          t: '14. Mudanças nestes termos',
          p: [
            'Publicaremos qualquer mudança nesta página com sua data e avisaremos pelo chat quando for importante. Se não concordar, você pode cancelar antes que entre em vigor.',
          ],
        },
        {
          id: 'ley',
          t: '15. Lei aplicável',
          p: [
            'Estes termos são regidos pelas leis federais dos Estados Unidos Mexicanos. Para qualquer controvérsia, as partes se submetem aos tribunais de [FALTA: cidade do foro], sem prejuízo dos direitos que a lei reconhece a você como consumidor, incluindo recorrer à Procuraduría Federal del Consumidor (PROFECO, órgão mexicano de defesa do consumidor).',
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ ISENÇÃO
    deslinde: {
      titulo: 'Isenção e responsabilidades',
      resumen:
        'O que a Zaelyn é e o que não é, pelo que a NE responde, pelo que responde quem contrata e o que depende de serviços de terceiros como Telegram, WhatsApp ou Stripe.',
      secciones: [
        {
          id: 'que-es',
          t: '1. O que a Zaelyn é e o que não é',
          p: [
            'A Zaelyn é uma ferramenta de organização: lembra, avisa, ordena e mostra o que você e seus grupos dizem a ela. Ela não é:',
            [
              'Um serviço de emergência. Numa emergência, ligue para o 911 ou para o número local.',
              'Orientação médica, psicológica, jurídica, fiscal, contábil nem financeira.',
              'Quem cuida de um menor. A Zaelyn lembra quem leva e quem busca; levar e buscar, quem faz são as pessoas.',
              'Um sistema de registro oficial, contábil ou de conformidade regulatória da sua empresa.',
            ],
          ],
        },
        {
          id: 'usuario',
          t: '2. O que é responsabilidade de quem usa a Zaelyn',
          p: [
            'O uso da Zaelyn e as informações nela registradas são responsabilidade da pessoa ou empresa que contrata o serviço e de cada usuário em relação ao que registra. Em particular:',
            [
              'A veracidade, a legalidade e a oportunidade do que você registra.',
              'Ter o consentimento ou o direito de registrar dados de outras pessoas, incluindo menores sob sua responsabilidade.',
              'Quem você convida para seus grupos e que papel dá a cada um: o que se escreve num grupo é visto pelos integrantes conforme esse papel.',
              'As decisões que você toma com base no que a Zaelyn mostra ou lembra, e verificar o que é crítico antes de agir.',
              'Cuidar dos seus dispositivos, das suas contas de Telegram ou WhatsApp e das suas sessões do portal.',
              'Usar a Zaelyn conforme a lei e os termos.',
            ],
          ],
        },
        {
          id: 'terceros',
          t: '3. Serviços de terceiros',
          p: [
            'Telegram, WhatsApp (Meta), Twilio, Google, Microsoft, Stripe e os demais serviços com que a Zaelyn se conecta são independentes da NE e se regem por seus próprios termos e avisos de privacidade. A NE não os controla, por isso não responde por:',
            [
              'Sua disponibilidade, suas falhas, seus atrasos nem sua segurança.',
              'Como armazenam, criptografam ou tratam as mensagens que trafegam por suas plataformas.',
              'Mudanças em suas políticas —por exemplo, restrições da Meta a assistentes de inteligência artificial no WhatsApp— nem suspensões ou bloqueios da sua conta nesses serviços.',
              'Mensagens que não sejam entregues ou cheguem atrasadas por causa desses serviços ou da sua rede.',
            ],
            'Quando um terceiro mudar suas condições de forma que afete a Zaelyn, faremos o razoável para oferecer uma alternativa e avisaremos você.',
          ],
        },
        {
          id: 'ia',
          t: '4. Inteligência artificial e avisos',
          p: [
            'A Zaelyn interpreta linguagem natural e pode entender mal uma frase; por isso pergunta quando tem dúvida e mostra o que entendeu antes de aplicar mudanças grandes. Um aviso depende de o canal entregá-lo: não use a Zaelyn como único lembrete de algo cuja omissão possa causar um dano grave.',
          ],
        },
        {
          id: 'ne',
          t: '5. O que é responsabilidade da NE',
          p: [
            [
              'Proteger os dados que custodia com medidas de segurança administrativas, técnicas e físicas razoáveis, e tratá-los só para as finalidades do aviso de privacidade.',
              'Prestar o serviço como descrito e cobrar apenas o que está publicado.',
              'Avisar você sem demora se ocorrer um incidente de segurança que afete de forma significativa seus direitos.',
              'Atender seus direitos ARCO e suas solicitações de esclarecimento.',
              'Responder pelos danos que cause por dolo ou negligência próprios, nos termos da lei.',
            ],
          ],
        },
        {
          id: 'limite',
          t: '6. Limite de responsabilidade',
          p: [
            'Na medida em que a lei permitir, a responsabilidade total da NE perante uma conta se limita ao valor que essa conta pagou nos doze meses anteriores ao fato que a originou, e a NE não responde por danos indiretos, lucros cessantes nem perda de oportunidades.',
            'Nada do acima limita os direitos que a lei concede a você como consumidor nem a responsabilidade que legalmente não possa ser excluída.',
          ],
        },
        {
          id: 'fuerza',
          t: '7. Caso fortuito e força maior',
          p: [
            'A NE não responde por descumprimentos causados por fatos fora de seu controle razoável, como desastres naturais, falhas gerais de internet ou de energia, atos de autoridade ou falhas dos serviços de terceiros descritos acima.',
          ],
        },
        {
          id: 'indemnidad',
          t: '8. Reclamações de terceiros',
          p: [
            'Se um terceiro reclamar contra a NE por conteúdo que você registrou sem direito ou por um uso da Zaelyn contrário à lei ou aos termos, na medida permitida pela lei você responderá perante esse terceiro e manterá a NE isenta de responsabilidade.',
          ],
        },
      ],
    },
  },
}
