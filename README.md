# Catorce Platos

Menú de catorce tomas seguidas de cocina española para dos personas, del
lunes por la noche al lunes a mediodía. Seis de las catorce llevan
carne; el resto reparte pescado y marisco, legumbre y huevo con verdura. Cada
toma dice primero de qué va —legumbre con verdura, arroz de marisco, tortilla
de patata— y debajo lleva una receta concreta como sugerencia y otras tres
para las semanas siguientes. Ningún plato pasa de 35 minutos salvo el asado
del domingo, y la compra entera son 35 artículos.

**Página:** https://cosas-varias.github.io/catorce-platos/

## Qué es ahora

Antes era una landing fija con una semana de menú. Ahora esa landing es la
**plantilla** (`plantilla.html`) y la página principal es un **planificador**
que se adapta a lo que habéis comido:

1. Apuntáis cada comida y cena (un plato del menú, o «otra cosa» con sus
   alimentos; los alimentos nuevos se añaden al grafo).
2. Cada alimento, receta y grupo (vacuno, pescado azul, legumbre…) es un nodo
   de un grafo: receta → alimentos → grupo → familia (carne, pescado…).
3. El planificador recorre ese grafo y propone las próximas 14 tomas,
   manteniendo las casillas de la plantilla (carne a la plancha el lunes,
   legumbre el martes…) pero eligiendo, de las cuatro recetas de cada casilla,
   la que menos repite lo comido hace poco.
4. Cada propuesta explica el porqué, ofrece alternativas para fijar otra a
   mano y genera el reparto semanal y la lista de la compra.

## Cómo decide

Puntuación de cada receta candidata en cada toma:

- **Plato exacto:** excluido si se comió en las últimas cuatro semanas (56 tomas).
- **Alimentos:** cada alimento comido antes resta con un peso según su grupo
  (proteínas 1, huevo 0,7, cereal y patata 0,5, verdura 0,15) y decae con la
  distancia; el vacuno tarda más en «enfriarse» que el huevo o la verdura.
- **Familia contigua:** carne, pescado o legumbre dos tomas seguidas penaliza.
- **Reparto de 14 tomas:** máximo 6 con carne, mínimo 4 de pescado y 2 de
  legumbre; se empuja hacia ello.
- **Proteína:** un plato sin carne, pescado, legumbre ni huevo (el ajoblanco)
  solo se propone si no queda otra opción en la casilla.
- **Rotación:** a igualdad, gana lo que hace más que no se come y lo que nunca
  se ha comido.
- **Casilla:** en modo plantilla solo compiten las 4 recetas de la casilla; en
  modo libre compite cualquier receta, con prioridad para las de la casilla.

El plan no se calcula toma a toma sino con una búsqueda en haz: mantiene los 24
mejores planes parciales y al final se queda con el de mejor puntuación total,
descontando lo que se aleje del reparto objetivo. Así una elección de hoy tiene
en cuenta lo que dejaría sin sitio dentro de unos días (no acabar la semana con
tres carnes seguidas). El plan nunca empieza en el pasado: si el registro va
atrasado, arranca en la toma actual.

El registro se guarda en el navegador (`localStorage`) y se puede exportar e
importar como JSON.

## Archivos

- `index.html`, `app.js`, `app.css` — la interfaz del planificador.
- `motor.js` — grafo y planificador, sin dependencias del DOM.
- `pruebas.js` — pruebas del motor (`node pruebas.js`).
- `datos.js` — casillas, 56 recetas (14 × 4) y alimentos. Para ampliar el
  menú, se añade aquí: un alimento a `alimentos`, una receta a `recetas`.
- `plantilla.html` + `estilos.css` — la landing original, intacta, como plantilla.

Sigue siendo estático: sin build ni dependencias, salvo las tipografías de
Google Fonts.

## La plantilla

`plantilla.html` es una página estática; el CSS está en `estilos.css`.

## Qué hay dentro

- **Lo que no cambia** — desayuno, almuerzo y postre de cena están fijos y
  fuera del menú: leche y fruta, pan con embutido, y un yogur cada noche.
- **La semana** — catorce tomas en orden, de la cena del lunes a la comida
  del lunes siguiente. De cada una: el tipo de plato, la receta sugerida,
  el método en una frase, el tiempo real de cocina, tres recetas de rotación
  para las semanas siguientes y los grupos de alimentos.
- **Lunes por la tarde** — 45 minutos tras la compra: el sofrito grande que
  alimenta cinco tomas, la carne y el pescado partidos y congelados, la olla
  de cocidos y la verdura lavada.
- **La compra** — 35 artículos para dos y catorce tomas, por puesto de mercado.
- **La nevera pequeña** — qué se congela el mismo día, qué se queda fresco y en
  qué orden se gasta para que no se estropee nada.
- **El reparto** — cuántas de las catorce tomas caen en cada grupo.
- **Semana tras semana** — cómo se repite el esquema sin cansar y sin cambiar
  la lista de la compra.
- **Notas** — dónde está el listón de la carne roja, el pescado de la semana,
  el embutido de los almuerzos y los rangos calóricos.

## Por qué empieza un lunes

Porque la semana la marca la compra, no el calendario. Se compra el lunes
por la tarde, se prepara en el mismo rato y la primera toma es esa noche: así
la carne fresca y el sofrito se gastan cuando están en su punto, lo demás pasa
por el congelador y la nevera queda vacía justo al llegar a la siguiente
compra.

## Por qué se repite

Está pensado para usarse varias semanas seguidas. Las catorce casillas son
siempre las mismas; lo que cambia es la receta de dentro, y cada toma trae tres
alternativas que caen dentro de la misma lista de la compra. Cuatro semanas
antes de repetir un plato exacto.

Pensado para dos adultos sanos sin alergias ni intolerancias. No sustituye a una
pauta ajustada con datos concretos delante.
