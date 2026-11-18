# Inicio = centro de comando del día (simple, sin repetir)

**Fecha:** 2026-11-18 · **Frente:** portal

**Contexto.** Con el PR #31, JJR vio el Inicio y la barra lateral desarmados:
- botones negros que antes no estaban;
- tarjetas de dos estilos (arena y verde);
- filtros, chips y acciones amontonados;
- «Agenda de hoy» repitiendo lo que ya estaba en «Hoy»;
- en la barra, letras y sangrías distintas entre secciones.

Pidió un Inicio simple: todo lo del día, de cualquier módulo, en lista, calendario o tarjetas, organizado y con las acciones más relevantes. Un centro de comando que Zaelyn también ve.

**Decisión.**
- **Arriba, una sola caja de Zaelyn.** Lleva:
  - el día en una frase (cuántas cosas, cuántas vencidas, el primer evento y lo primero que toca), más el foco y los avisos del motor;
  - la barra «Dile a Zaelyn»;
  - cuatro acciones en texto: Organiza mi día, ¿Qué sigue?, Recuérdame… y Nueva actividad….
- **Una barra de herramientas:**
  - alcance: Hoy · Semana · Mes;
  - un solo botón «Filtrar» (espacios, tipo y estado, en un panel);
  - vista: Lista · Calendario · Tarjetas.

  Lo elegido se marca con superficie y sombra, nunca con negro, y se recuerda en el navegador.
- **Cada cosa aparece una sola vez:**
  - **Lista:** el día se parte en Vencido, En la mañana, En la tarde, En la noche y Cuando puedas; en semana y mes, por día. Cada renglón lleva hora, círculo, título, espacio con su punto, quién, traslado, avance y tipo.
  - **Tarjetas:** una por espacio, con renglones compactos.
  - **Calendario:** semana, o mes cuando el alcance es Mes.
  - Lo que se repite se junta: «y N veces más».
- **A la derecha, solo lo que no es una cosa por hacer:** hábitos, fechas que vienen, proyectos y módulos. Salen «Agenda de hoy» y la caja de la familia: el quién lleva y quién trae va en el renglón de la actividad.
- **Un solo estilo de tarjeta** (`cr-vidrio`) en todo el Inicio. Se quitan los chips de plan contratado; el plan se ve en Cuenta.
- **Barra lateral:**
  - todas las filas iguales: hueco de 20 px para ícono o punto, la misma letra (14.5 px) y la misma altura;
  - títulos de sección uniformes; «Proyectos» es el enlace a todos;
  - Perfil en el nombre de abajo;
  - la lista se desvanece al final en vez de cortarse.

**Alternativa descartada.** Conservar las cuatro vistas y los filtros a la vista: es lo que se veía amontonado.
