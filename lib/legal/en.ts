import type { TextosLegales } from './tipos'

/**
 * English translation of the legal texts. The Spanish version governs; if
 * they differ, Spanish prevails. Preliminary version, October 23, 2026.
 */
export const legalEn: TextosLegales | null = {
  ui: {
    etq: 'Legal',
    indice: 'Legal documents',
    version: 'Last updated: October 23, 2026',
    preliminar: 'Preliminary version. This is a translation for convenience: the Spanish version governs, and it prevails if the two differ.',
    contenido: 'In this document',
    otros: 'Other documents',
    volver: 'All documents',
  },
  docs: {
    // ═════════════════════════════════════════════════ PRIVACY NOTICE
    privacidad: {
      titulo: 'Privacy notice',
      resumen:
        'Who handles your personal data when you use Zaelyn, for what purpose, who it’s shared with, and how you exercise your rights.',
      secciones: [
        {
          id: 'responsable',
          t: '1. Who is responsible for your data',
          p: [
            'Zaelyn is a service of NE National Expertise («NE»). The data controller of your personal data is NE National Expertise Mexico, S.C. («NE Mexico»), domiciled at [MISSING: NE Mexico address], which you can contact at [MISSING: privacy email].',
            'When Zaelyn is provided to people outside Mexico, the controller will be NE National Expertise America, Inc., and this notice will say so.',
            'This notice is issued under Mexico’s Ley Federal de Protección de Datos Personales en Posesión de los Particulares (Federal Law on the Protection of Personal Data Held by Private Parties), in force since March 21, 2025, and its regulations.',
          ],
        },
        {
          id: 'datos',
          t: '2. What data we handle',
          p: [
            'We handle only the data needed to provide the service:',
            [
              'Channel identification: your Telegram ID and username and, when available, your WhatsApp number.',
              'Profile: the name you introduce yourself with, your city or time zone, and your language.',
              'Content you record: messages, reminders, notes, habits, voice notes, photos, documents, plans, activities, chores and dates.',
              'Data about other people that you record: members of your family —including minors in your care— or of your team, with their name, their role and their activities.',
              'Payment data: Stripe processes the charge. NE receives the payment confirmation, the amount, the currency and a customer identifier; it never receives or stores your card number.',
              'Tax data, only if you request an invoice: RFC (Mexican tax ID), legal name, tax regime, postal code, CFDI use and email.',
              'Portal technical data: session and preference cookies and access logs.',
              'Services you choose to connect, such as your calendar: only what you authorize in that connection and only to show it to you in Zaelyn.',
            ],
            'Zaelyn does not ask for sensitive personal data. If you choose to write some —for example, about your health or your mood—, by recording it you give us your express consent to handle it for the sole purpose of providing the service to you. You can delete it whenever you want.',
          ],
        },
        {
          id: 'finalidades',
          t: '3. What we use it for',
          p: [
            'Purposes necessary for the service:',
            [
              'Understanding what you write or say and saving it where it belongs.',
              'Reminding you, alerting you and alerting members of your groups to what’s theirs, according to the roles you define.',
              'Showing you your information in the portal.',
              'Charging, invoicing and keeping the accounting of what was charged.',
              'Protecting your account and the service, preventing abuse and handling failures.',
              'Supporting you and complying with legal and tax obligations.',
            ],
            'Additional purposes, which you can refuse without losing the service: sending you Zaelyn news and producing aggregate statistics that don’t identify you to improve the product. To refuse, write to us at [MISSING: privacy email].',
            'We don’t sell your data. We don’t use it for advertising. We don’t use your content to train artificial intelligence models, ours or anyone else’s.',
          ],
        },
        {
          id: 'encargados',
          t: '4. Who it’s shared with',
          p: [
            'To run Zaelyn we use providers that process data on NE’s behalf, under contract and only to provide the service:',
            [
              'Database and hosting: Supabase (United States).',
              'Application servers: Fly.io (United States).',
              'Website and web portal: Vercel (United States).',
              'Artificial intelligence interpretation: Anthropic (United States), which does not use this data to train its models.',
              'Voice note transcription: [MISSING: voice transcription provider].',
              'Encryption key management: Google Cloud KMS.',
              'Sending WhatsApp messages: Twilio.',
              'Payment processing: Stripe.',
            ],
            'Some of these providers are outside Mexico, so your data is transferred to other countries with the safeguards the law requires.',
            'Telegram and WhatsApp (Meta) are not NE’s providers: they are services you choose, and they handle your messages under their own privacy notices.',
            'What you write inside a group is seen by its members according to their role: that is the nature of a group, and you decide it when you invite them.',
            'We will only hand data over to an authority when a law or a duly grounded order requires it.',
          ],
        },
        {
          id: 'derechos',
          t: '5. Your rights',
          p: [
            'You can access your data, rectify it, cancel it or object to its processing (ARCO rights: access, rectification, cancellation and objection), revoke your consent and limit its use. You can also object to decisions made solely by automated means that significantly affect you.',
            'To exercise them, write to [MISSING: privacy email] with your name, the channel you use Zaelyn with, the right you want to exercise and a way to reply to you. The full procedure is in «Your personal data».',
            'If you believe your right was not honored, you may go to the Secretaría Anticorrupción y Buen Gobierno (Mexico’s Ministry of Anti-Corruption and Good Governance), the authority in charge of personal data protection.',
          ],
        },
        {
          id: 'cookies',
          t: '6. Cookies',
          p: [
            'The website and the portal use only necessary cookies: one session cookie to keep you signed in to the portal and two preference cookies to remember your language and your theme. We don’t use advertising or third-party tracking cookies.',
          ],
        },
        {
          id: 'menores',
          t: '7. Minors',
          p: [
            'Zaelyn is intended for adults. A minor may appear in a family group registered by their mother, father or guardian, who declares that they hold parental authority or guardianship and is responsible for that information. A minor may only have their own account with authorization from whoever holds parental authority or guardianship.',
          ],
        },
        {
          id: 'cambios',
          t: '8. Changes to this notice',
          p: [
            'Any change will be published on this page with its date. If the change is significant, we’ll also tell you through the Zaelyn chat.',
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ YOUR PERSONAL DATA
    datos: {
      titulo: 'Your personal data',
      resumen: 'Where your data lives, how long it’s kept, how you protect it and how you exercise your rights step by step.',
      secciones: [
        {
          id: 'donde',
          t: '1. Where it lives',
          p: [
            'Everything you tell Zaelyn lives in a single database. The chat and the portal read from it; the portal keeps no copy of its own. Group content is encrypted with per-group keys, which are in turn protected by a master key managed by Google Cloud KMS.',
          ],
        },
        {
          id: 'tiempo',
          t: '2. How long it’s kept',
          p: [
            [
              'Your history is kept according to your plan: 15 days on Kickoff, one year on Sprint and Tribu, and unlimited on PMO while your account is active.',
              'Payment and invoicing data is kept for five years, because tax laws require it.',
              'When you cancel your account, your data is deleted or anonymized, except what the law requires us to keep.',
            ],
          ],
        },
        {
          id: 'control',
          t: '3. What you can do yourself',
          p: [
            [
              'See your things: ask Zaelyn or open them in your portal.',
              'Download a plan’s status: «mándame el estatus en Excel» (send me the status in Excel).',
              'Correct: tell Zaelyn the right information, or change it in your portal where possible.',
              'Delete reminders, notes or activities: ask Zaelyn.',
              'Leave a group or remove someone, depending on your role.',
              'Review and close your portal sessions: «mis sesiones» (my sessions), «cierra todas» (close all).',
            ],
          ],
        },
        {
          id: 'arco',
          t: '4. How to exercise your ARCO rights',
          p: [
            'Write to [MISSING: privacy email] and include:',
            [
              'Your name and the channel you use Zaelyn with (your Telegram username or your WhatsApp number).',
              'The right you want to exercise and, if applicable, what data you want to correct or delete.',
              'A way to reply to you.',
              'If you act on behalf of someone else, the document proving your authority to represent them.',
            ],
            'To confirm it’s you, we’ll ask you to verify it from the same Zaelyn chat. We’ll reply within the time limits set by law and, if appropriate, make the change at no cost.',
          ],
        },
        {
          id: 'terceros',
          t: '5. Other people’s data',
          p: [
            'If you record someone else —your family, your team, a client—, you are responsible for having their consent or the right to do so, and for what you record being accurate. In that case NE processes that data on your behalf and only to provide the service to you. If that person asks us to exercise their rights, we’ll respond and let you know.',
          ],
        },
        {
          id: 'seguridad',
          t: '6. Security',
          p: [
            [
              'Communication with the portal and with our servers is encrypted in transit.',
              'Each person can only see the groups they belong to; that isolation is checked with automated tests.',
              'You enter the portal with a single-use link you request from your chat; the session lasts 14 days and you can close it from the chat.',
              'The browser never receives your session credential: only our server uses it.',
            ],
            'No system is invulnerable. If a breach occurs that significantly affects your rights, we’ll inform you without delay.',
          ],
        },
        {
          id: 'cookies',
          t: '7. Cookies we use',
          p: [
            [
              'zpt — portal session. Necessary. Lasts 14 days.',
              'zl — chosen language. Preference. Lasts one year.',
              'zt — chosen theme (day, night or auto). Preference. Lasts one year.',
            ],
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ TERMS
    terminos: {
      titulo: 'Terms and conditions',
      resumen: 'The rules for using Zaelyn: the service, plans and payments, your content, permitted use and how disagreements are resolved.',
      secciones: [
        {
          id: 'quien',
          t: '1. Who provides the service',
          p: [
            'Zaelyn is a service of NE National Expertise. In Mexico it is provided and billed by NE National Expertise Mexico, S.C.; outside Mexico it will be NE National Expertise America, Inc. In these terms, «NE» means the entity providing the service to you.',
          ],
        },
        {
          id: 'aceptacion',
          t: '2. Acceptance',
          p: [
            'By using Zaelyn —through the chat or the portal— you accept these terms, the privacy notice and the disclaimer and responsibilities document. If you sign up on behalf of a company, you represent that you can bind it.',
          ],
        },
        {
          id: 'servicio',
          t: '3. The service',
          p: [
            'Zaelyn is a personal, family and project organization assistant that works through chat (Telegram and, when available, WhatsApp) and a web portal. It is currently in testing: some features may change, be added or be removed. We’ll let you know of changes that affect what you signed up for.',
          ],
        },
        {
          id: 'cuenta',
          t: '4. Your account and access',
          p: [
            'Your identity in Zaelyn is your account on the channel you use it with. Protecting access to your phone, your Telegram or WhatsApp account and your portal sessions is your responsibility. If you lose a device, close your sessions from the chat.',
          ],
        },
        {
          id: 'pagos',
          t: '5. Plans, prices and payments',
          p: [
            [
              'Published prices are in US dollars and include VAT (IVA). In Mexico they’re charged in pesos at Banxico’s FIX exchange rate on the day of the charge.',
              'Paid plans renew automatically every month or every year, as you choose, until you cancel them.',
              'Add-ons can be added or removed at any time and are billed on a prorated basis.',
              'You can cancel whenever you want from your portal. The plan stays active until the end of the paid period, and then your account returns to Kickoff.',
              'Payments are processed by Stripe under its own terms.',
              'A price change is announced at least 30 days in advance and never affects a period already paid.',
              'If a charge can’t be made, the account may return to Kickoff until it’s settled.',
            ],
          ],
        },
        {
          id: 'factura',
          t: '6. Invoicing',
          p: [
            'If you need an invoice, enter your tax details in your portal before the month closes. What was charged and not invoiced in time is included in the month’s global invoice, under current tax rules.',
          ],
        },
        {
          id: 'uso',
          t: '7. Permitted use',
          p: [
            'You may not use Zaelyn to:',
            [
              'Engage in illegal activity, fraud, harassment, threats or discrimination.',
              'Record or disclose other people’s data without the right to do so.',
              'Send mass or unwanted alerts through groups.',
              'Try to access other people’s information, breach the service or automate its use abusively.',
              'Resell the service without NE’s written authorization.',
            ],
            'If we detect such use, we may limit or suspend the account.',
          ],
        },
        {
          id: 'contenido',
          t: '8. Your content',
          p: [
            'What you record in Zaelyn is yours. You give us permission to store, process and display it only to provide the service to you, including alerting the members of your groups. You are responsible for what you record and for having the right to record other people’s data.',
          ],
        },
        {
          id: 'ia',
          t: '9. Artificial intelligence',
          p: [
            'Zaelyn uses artificial intelligence to understand what you write or say; what gets saved, calculated and notified is decided by code. Even so, it may misunderstand a sentence. Check what matters. Zaelyn does not give medical, legal, tax or financial advice.',
          ],
        },
        {
          id: 'disponibilidad',
          t: '10. Availability',
          p: [
            'We work to keep Zaelyn always available, but there may be interruptions due to maintenance, failures or third-party services. During testing we don’t offer a guaranteed service level.',
          ],
        },
        {
          id: 'propiedad',
          t: '11. Intellectual property',
          p: [
            'The Zaelyn brand, the software, the design and the service’s content belong to NE. Using Zaelyn gives you no rights over them beyond using the service under these terms.',
          ],
        },
        {
          id: 'responsabilidad',
          t: '12. Liability',
          p: [
            'What NE is responsible for and what you are responsible for is detailed in the «Disclaimer and responsibilities» document, which is part of these terms.',
          ],
        },
        {
          id: 'terminacion',
          t: '13. Suspension and termination',
          p: [
            'You can stop using Zaelyn and cancel your account at any time. NE may suspend or terminate an account that breaches these terms; when possible, we’ll let you know in advance and tell you why.',
          ],
        },
        {
          id: 'cambios',
          t: '14. Changes to these terms',
          p: [
            'We’ll publish any change on this page with its date and let you know through the chat when it’s significant. If you disagree, you can cancel before it takes effect.',
          ],
        },
        {
          id: 'ley',
          t: '15. Governing law',
          p: [
            'These terms are governed by the federal laws of the United Mexican States. For any dispute, the parties submit to the courts of [MISSING: city of jurisdiction], without prejudice to the rights the law grants you as a consumer, including going to the Procuraduría Federal del Consumidor (PROFECO, Mexico’s Federal Consumer Protection Agency).',
          ],
        },
      ],
    },

    // ═════════════════════════════════════════════════ DISCLAIMER
    deslinde: {
      titulo: 'Disclaimer and responsibilities',
      resumen:
        'What Zaelyn is and isn’t, what NE is responsible for, what the subscriber is responsible for, and what depends on third-party services such as Telegram, WhatsApp or Stripe.',
      secciones: [
        {
          id: 'que-es',
          t: '1. What Zaelyn is and isn’t',
          p: [
            'Zaelyn is an organization tool: it remembers, alerts, sorts and shows what you and your groups tell it. It is not:',
            [
              'An emergency service. In an emergency, call 911 or your local number.',
              'Medical, psychological, legal, tax, accounting or financial advice.',
              'Someone who looks after a minor. Zaelyn remembers who drops off and who picks up; people do the dropping off and picking up.',
              'An official, accounting or regulatory compliance record system for your company.',
            ],
          ],
        },
        {
          id: 'usuario',
          t: '2. What the user of Zaelyn is responsible for',
          p: [
            'The use of Zaelyn and the information recorded in it are the responsibility of the person or company that subscribes to the service, and of each user with respect to what they record. In particular:',
            [
              'The accuracy, legality and timeliness of what you record.',
              'Having the consent or the right to record other people’s data, including minors in your care.',
              'Whom you invite to your groups and what role you give them: what’s written in a group is seen by its members according to that role.',
              'The decisions you make based on what Zaelyn shows or reminds you of, and verifying what’s critical before acting.',
              'Protecting your devices, your Telegram or WhatsApp accounts and your portal sessions.',
              'Using Zaelyn in accordance with the law and the terms.',
            ],
          ],
        },
        {
          id: 'terceros',
          t: '3. Third-party services',
          p: [
            'Telegram, WhatsApp (Meta), Twilio, Google, Microsoft, Stripe and the other services Zaelyn connects to are independent of NE and are governed by their own terms and privacy notices. NE does not control them, so it is not responsible for:',
            [
              'Their availability, failures, delays or security.',
              'How they store, encrypt or handle the messages that travel through their platforms.',
              'Changes to their policies —for example, Meta restrictions on artificial intelligence assistants on WhatsApp— or suspensions or blocks of your account on those services.',
              'Messages not delivered or delivered late due to those services or your network.',
            ],
            'When a third party changes its conditions in a way that affects Zaelyn, we’ll do what’s reasonable to offer you an alternative and let you know.',
          ],
        },
        {
          id: 'ia',
          t: '4. Artificial intelligence and alerts',
          p: [
            'Zaelyn interprets natural language and may misunderstand a sentence; that’s why it asks when in doubt and shows you what it understood before applying large changes. An alert depends on the channel delivering it: don’t use Zaelyn as the only reminder for something whose omission could cause serious harm.',
          ],
        },
        {
          id: 'ne',
          t: '5. What NE is responsible for',
          p: [
            [
              'Protecting the data in its custody with reasonable administrative, technical and physical security measures, and handling it only for the purposes in the privacy notice.',
              'Providing the service as described and charging only what’s published.',
              'Notifying you without delay if a security breach occurs that significantly affects your rights.',
              'Honoring your ARCO rights and your inquiries.',
              'Being liable for damages caused by its own willful misconduct or negligence, under the terms of the law.',
            ],
          ],
        },
        {
          id: 'limite',
          t: '6. Limitation of liability',
          p: [
            'To the extent permitted by law, NE’s total liability to an account is limited to the amount that account paid in the twelve months before the event giving rise to it, and NE is not liable for indirect damages, lost profits or lost opportunities.',
            'Nothing above limits the rights the law grants you as a consumer or any liability that legally cannot be excluded.',
          ],
        },
        {
          id: 'fuerza',
          t: '7. Acts of God and force majeure',
          p: [
            'NE is not liable for failures caused by events beyond its reasonable control, such as natural disasters, general internet or power outages, acts of authority, or failures of the third-party services described above.',
          ],
        },
        {
          id: 'indemnidad',
          t: '8. Third-party claims',
          p: [
            'If a third party makes a claim against NE over content you recorded without the right to do so or over a use of Zaelyn contrary to the law or the terms, to the extent permitted by law you will answer to that third party and hold NE harmless.',
          ],
        },
      ],
    },
  },
}
