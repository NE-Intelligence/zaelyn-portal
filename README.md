# zaelyn-portal

El sitio de **zaelyn.ai** y el portal de proyectos. Next 16 + React 19, sin
Tailwind: dos hojas de estilo con tokens propios.

## Los dos registros

Son dos marcas dentro de la misma página, y no se pisan porque cada una vive
bajo su clase:

- **El sitio** (`app/(sitio)/`, `app/sitio.css`, prefijo `.st-`) va oscuro
  siempre. El logotipo es blanco sobre negro y no existe otra versión, así que
  el sitio se diseñó alrededor de eso en vez de pelearse con ello.
- **El portal** (`app/(portal)/`, `app/portal.css`, prefijo `.pt-`) va claro y
  oscuro, con el sistema de diseño: cobalto `#2f55f4` y coral `#c2410c`. El
  degradado morado→cian de la marca aparece una vez, en el logotipo, y nunca
  como estado de una interfaz.

## Las rutas

| Ruta | Qué es |
|---|---|
| `/` | La portada. Proyectos, familia y personal. |
| `/proyectos`, `/familia`, `/personal` | Las tres áreas. |
| `/demo` | El portal completo con datos inventados, y lo dice. |
| `/entrar?pase=…` | Canjea el pase por una sesión. No es una página: pone una cookie y redirige. |
| `/app` | Los grupos de la persona. Exige sesión. |
| `/app/g/<grupo>/<plan>?v=<vista>` | El plan, en una de seis vistas. |
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
