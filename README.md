# zaelyn-portal

El sitio público de Zaelyn y el portal de proyectos. Vive en `zaelyn.ai`.

## Qué hay aquí

```
app/(sitio)/        el sitio público, oscuro siempre
  page.tsx            portada: los tres productos
  proyectos/          Zaelyn Proyectos, el producto que ya existe
  familia/            área marcada: qué funciona hoy, qué falta
  personal/           área marcada
app/app/            el portal, claro y oscuro
  page.tsx            los grupos y planes de la persona
  [plan]/             un plan: resumen, tablero, gantt, ruta crítica, equipo, bitácora
components/sitio/   el marco y las piezas del sitio
components/portal/  los átomos y las vistas del portal
lib/plan.ts         EL CONTRATO: la forma de EstadoPlan
lib/demo.ts         datos de ejemplo, mientras no exista el endpoint
lib/copy.ts         el texto por idioma
```

## Dos registros, una marca

El **sitio** es oscuro siempre y todo cuelga de `.st`. No es una preferencia:
el logotipo es luz sobre negro y sobre blanco no sobrevive.

El **portal** trae el sistema de diseño «Zaelyn Proyectos» —cobalto y coral,
claro y oscuro— y todo cuelga de `.pt`. Los dos juegos de tokens no se tocan.

El degradado morado→cian del logotipo es el momento de marca y **nunca** se usa
como estado de interfaz.

## La regla que no se negocia

**El portal no tiene consultas propias.** Cada vista recibe un `EstadoPlan` ya
medido: avance, avance esperado, criticidad, holgura y atraso vienen hechos
desde Zaelyn. Ninguna vista abre una consulta ni vuelve a calcular. Si el chat
dice 34%, la pantalla dice 34%, porque las dos leen el mismo objeto.

Mientras el endpoint no exista, `lib/demo.ts` arma ese objeto con datos
inventados y la pantalla lo dice en voz alta. Cambiar a datos reales es cambiar
de dónde sale el objeto; ningún componente se entera.

## Correr

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

Las fuentes (MuseoModerno, Prompt, JetBrains Mono) viven en `lib/fuentes/`, no
se piden a Google al compilar. Las tres son OFL y sus licencias están al lado.
