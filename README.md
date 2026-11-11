# zaelyn-portal

El sitio de **zaelyn.ai** y el portal de proyectos. Next 16 + React 19 y
Tailwind v4. Todos los valores de diseño (color, radios, sombras, tipografía)
viven en `app/zaelyn.css`, el sistema de diseño v2: la misma familia visual
que la app de conversación (decisiones/2026-11-10-rediseno-del-portal).

## Los dos registros

Dos registros de la misma marca, cada uno bajo su clase, con los mismos tokens:

- **El sitio** (`app/(sitio)/`, prefijo `.st-`) y **el portal** (`app/(portal)/`,
  prefijo `.pt-`) van en día y en noche, con la tipografía del sistema, como la
  app: blanco, gris y negro, y el color solo para el módulo y el estado.
- La barra superior es **negra siempre**: ahí vive el logotipo, que solo va
  sobre negro. En el resto, el nombre se compone en tipografía con la æ en
  degradado.
- El degradado morado→cian aparece en el logotipo y en el orbe de Zaelyn, y
  nunca como estado de una interfaz.

## Las rutas

| Ruta | Qué es |
|---|---|
| `/` | La portada. Proyectos, familia y personal. |
| `/personal`, `/familia`, `/pmo` | Las landings de cada solución (`/proyectos` lleva a `/pmo`). |
| `/precios`, `/nosotros`, `/legal`, `/empezar` | Precios, quiénes somos, avisos legales y arranque. |
| `/demo`, `/demo/familia`, `/demo/personal` | Los portales completos con datos inventados, y lo dicen. |
| `/entrar` | La puerta web (passkey, correo o Telegram). Con `?pase=` canjea por POST. |
| `/app` | Los grupos de la persona. Exige sesión. |
| `/app/g/<grupo>/<plan>?v=<vista>` | El plan: Resumen, Tablero, Kanban, Gantt, Calendario, Ruta crítica, Equipo, Bitácora, General. |
| `…?p=<persona>&a=<actividad>&m=<AAAA-MM>` | Ver por persona, abrir el detalle de una actividad, cambiar de mes. Zaelyn puede mandar aquí con `portal.ir`. |
| `/app/g/<grupo>/<plan>/obra`, `/app/g/<grupo>/horas`, `/presupuesto`, `/ajustes`, `/editor` | Obra, horas, presupuesto, ajustes del grupo y editor de planes. |
| `/app/f/<grupo>`, `/app/personal` | Familia y Personal. |
| `/app/apps`, `/app/configuracion` | Las apps conectadas (Kore, TCGBusters) y la configuración (en el teléfono, también «Más»). |
| `/app/mensajes`, `/app/cuenta`, `/app/plan`, `/app/organizacion` | Mensajes, cuenta, plan y organización. |
| `/admin` | Administración (solo el dueño). |
| `/salir` | Entrega el token. **Solo POST**. |

## Cómo entra alguien

No hay registro ni contraseña. La identidad ya existe y ya está verificada: es
la cuenta de Telegram o WhatsApp de la persona. Montarle encima un alta con
correo crearía una segunda identidad que habría que casar con la primera, y el
día que discrepen no habría forma de saber cuál manda.

Así que el flujo es:

1. La persona le dice a Zaelyn **«ábreme el portal»** por el chat donde ya está
   autenticada.
2. Zaelyn contesta con `https://www.zaelyn.ai/entrar?pase=…`. El pase vale
   **una vez** y **quince minutos**: viaja por un chat, y lo que viaja por un
   chat se reenvía y queda en el historial de un teléfono prestado.
3. `/entrar` lo canjea contra la API y lo cambia por una cookie `httpOnly` de
   catorce días. El pase no llega nunca a una pantalla.

**El navegador nunca ve el token.** Quien llama a la API es el servidor de
Next, no la página: por eso no hace falta CORS y un XSS no se lleva la sesión.

## El portal no calcula

Ni un número. Zaelyn devuelve el estado del plan **ya medido** —avance,
esperado, criticidad, holgura, la curva, el avance por fase y hasta el párrafo
de arriba— y estas pantallas lo pintan. Si el chat dice 34%, la pantalla dice
34%, porque las dos leen lo mismo.

Es la decisión que sostiene todo lo demás. Una pantalla que agrega por su
cuenta elige qué significa «atrasado», y entonces hay dos verdades sobre el
mismo plan y nadie puede decir cuál está mal. `lib/plan.ts` es un espejo
literal de los tipos del motor, y donde falta un dato la pantalla lo dice en
vez de rellenarlo.

`lib/demo.ts` es la excepción, y a propósito: ahí **sí** se calcula, porque ese
módulo ocupa el lugar del servidor y no el de la vista. Que el mismo componente
pinte el ejemplo y los datos reales sin cambiar una línea es la prueba.

## Correr esto

```bash
npm install
cp .env.example .env.local     # y pon ZAELYN_API
npm run dev
```

Sin `ZAELYN_API` el portal lo dice y ofrece `/demo`. Las fuentes están
vendorizadas en `lib/fuentes/` —MuseoModerno, Prompt y JetBrains Mono, las tres
OFL— porque `next/font/google` las baja en tiempo de compilación y un sitio que
solo se puede compilar con acceso a Google Fonts no se compila.

## Chat de Zaelyn (fase 1)

`components/portal/Chat.tsx` + `app/api/chat/{mensaje,voz,recibir}`. Ver `docs/DECISIONS.md` P-0002.

## Zaelyn al lado (el riel)

Con sesión, el borde derecho lleva el riel: el orbe de Zaelyn arriba y las
conversaciones apiladas (Alt+1 Zaelyn, Alt+2…9 cada conversación). Abre una
columna de 400 px que empuja el contenido. Con `ZAELYN_APP_URL` esa columna es
la app de conversación embebida en modo `?embebido=1`; sin ella, el chat y la
conversación propios del portal. Ver `components/portal/Riel.tsx`.
