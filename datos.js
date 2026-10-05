// Datos del planificador: casillas de la plantilla, recetas y alimentos.
// Un alimento nuevo se añade a "alimentos"; una receta, a "recetas" apuntando a su casilla.
window.DATOS = {
 "casillas": [
  {
   "id": "s01",
   "dia": 1,
   "diaNombre": "Lunes",
   "momento": "cena",
   "tipo": "Carne roja a la plancha",
   "tiempo": "25 min"
  },
  {
   "id": "s02",
   "dia": 2,
   "diaNombre": "Martes",
   "momento": "comida",
   "tipo": "Legumbre con verdura",
   "tiempo": "30 min"
  },
  {
   "id": "s03",
   "dia": 2,
   "diaNombre": "Martes",
   "momento": "cena",
   "tipo": "Ensalada de patata y conserva",
   "tiempo": "10 min"
  },
  {
   "id": "s04",
   "dia": 3,
   "diaNombre": "Miércoles",
   "momento": "comida",
   "tipo": "Ave guisada",
   "tiempo": "35 min"
  },
  {
   "id": "s05",
   "dia": 3,
   "diaNombre": "Miércoles",
   "momento": "cena",
   "tipo": "Pescado blanco al horno",
   "tiempo": "30 min"
  },
  {
   "id": "s06",
   "dia": 4,
   "diaNombre": "Jueves",
   "momento": "comida",
   "tipo": "Arroz de marisco",
   "tiempo": "35 min"
  },
  {
   "id": "s07",
   "dia": 4,
   "diaNombre": "Jueves",
   "momento": "cena",
   "tipo": "Tortilla de patata y cebolla",
   "tiempo": "30 min"
  },
  {
   "id": "s08",
   "dia": 5,
   "diaNombre": "Viernes",
   "momento": "comida",
   "tipo": "Asado al horno",
   "tiempo": "55 min · 10 de trabajo"
  },
  {
   "id": "s09",
   "dia": 5,
   "diaNombre": "Viernes",
   "momento": "cena",
   "tipo": "Sopa fría y picoteo",
   "tiempo": "15 min"
  },
  {
   "id": "s10",
   "dia": 6,
   "diaNombre": "Sábado",
   "momento": "comida",
   "tipo": "Pasta con carne",
   "tiempo": "25 min"
  },
  {
   "id": "s11",
   "dia": 6,
   "diaNombre": "Sábado",
   "momento": "cena",
   "tipo": "Verdura guisada con huevo",
   "tiempo": "30 min"
  },
  {
   "id": "s12",
   "dia": 0,
   "diaNombre": "Domingo",
   "momento": "comida",
   "tipo": "Potaje de vigilia",
   "tiempo": "30 min"
  },
  {
   "id": "s13",
   "dia": 0,
   "diaNombre": "Domingo",
   "momento": "cena",
   "tipo": "Cerdo a la plancha",
   "tiempo": "20 min"
  },
  {
   "id": "s14",
   "dia": 1,
   "diaNombre": "Lunes",
   "momento": "comida",
   "tipo": "Carne picada en salsa",
   "tiempo": "35 min"
  }
 ],
 "recetas": [
  {
   "id": "s01-0",
   "slot": "s01",
   "nombre": "Filetes de ternera con pimientos",
   "ing": [
    "ternera",
    "patata",
    "pimiento"
   ],
   "sug": true,
   "metodo": "Patata en rodajas finas a fuego medio en aceite abundante hasta que esté tierna, y en los últimos minutos el pimiento verde en tiras. Aparta, sube el fuego al máximo y marca los filetes un minuto por cara en la misma sartén. Sal gorda al sacarlos, nunca antes.",
   "tiempo": "25 min"
  },
  {
   "id": "s01-1",
   "slot": "s01",
   "nombre": "Entrecot al ajillo",
   "ing": [
    "ternera",
    "ajo",
    "patata"
   ],
   "sug": false
  },
  {
   "id": "s01-2",
   "slot": "s01",
   "nombre": "Filetes empanados",
   "ing": [
    "ternera",
    "huevo",
    "pan",
    "patata"
   ],
   "sug": false
  },
  {
   "id": "s01-3",
   "slot": "s01",
   "nombre": "Churrasco con chimichurri",
   "ing": [
    "ternera",
    "ajo",
    "lechuga"
   ],
   "sug": false
  },
  {
   "id": "s02-0",
   "slot": "s02",
   "nombre": "Lentejas con verduras y comino",
   "ing": [
    "lenteja",
    "zanahoria",
    "cebolla"
   ],
   "sug": true,
   "metodo": "Arranca del sofrito de ayer, sin embutido esta vez: añade zanahoria y calabacín en dados, las lentejas, laurel y una cucharadita de comino. Agua a dos dedos por encima y veinticinco minutos a fuego medio, casi sin remover. El pimentón de la Vera va al final, fuera del fuego.",
   "tiempo": "30 min"
  },
  {
   "id": "s02-1",
   "slot": "s02",
   "nombre": "Garbanzos con calabaza y comino",
   "ing": [
    "garbanzo",
    "calabaza"
   ],
   "sug": false
  },
  {
   "id": "s02-2",
   "slot": "s02",
   "nombre": "Lentejas con espinacas",
   "ing": [
    "lenteja",
    "espinacas"
   ],
   "sug": false
  },
  {
   "id": "s02-3",
   "slot": "s02",
   "nombre": "Alubias con pisto y pimentón",
   "ing": [
    "alubia",
    "tomate",
    "pimiento",
    "calabacin"
   ],
   "sug": false
  },
  {
   "id": "s03-0",
   "slot": "s03",
   "nombre": "Ensaladilla con ventresca",
   "ing": [
    "patata",
    "atun",
    "huevo",
    "zanahoria"
   ],
   "sug": true,
   "metodo": "La patata, la zanahoria y los huevos ya están cocidos desde el lunes. Trocea, añade guisantes, aceite y un golpe de vinagre, y remueve con cuidado para no hacer puré. La ventresca encima, en lascas enteras.",
   "tiempo": "10 min"
  },
  {
   "id": "s03-1",
   "slot": "s03",
   "nombre": "Patatas aliñadas con atún",
   "ing": [
    "patata",
    "atun",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s03-2",
   "slot": "s03",
   "nombre": "Ensalada campera",
   "ing": [
    "patata",
    "atun",
    "huevo",
    "pimiento",
    "tomate"
   ],
   "sug": false
  },
  {
   "id": "s03-3",
   "slot": "s03",
   "nombre": "Pimientos rellenos de atún",
   "ing": [
    "pimiento",
    "atun",
    "tomate"
   ],
   "sug": false
  },
  {
   "id": "s04-0",
   "slot": "s04",
   "nombre": "Pollo al chilindrón",
   "ing": [
    "pollo",
    "pimiento",
    "tomate",
    "cebolla"
   ],
   "sug": true,
   "metodo": "Dora los trozos de pollo con la piel hacia abajo hasta que estén tostados de verdad; ese fondo es la salsa. Añade el sofrito, pimiento rojo en tiras y medio vaso de vino blanco, y deja veinticinco minutos tapado a fuego suave.",
   "tiempo": "35 min"
  },
  {
   "id": "s04-1",
   "slot": "s04",
   "nombre": "Pollo al ajillo con patatas",
   "ing": [
    "pollo",
    "ajo",
    "patata"
   ],
   "sug": false
  },
  {
   "id": "s04-2",
   "slot": "s04",
   "nombre": "Pollo a la cerveza",
   "ing": [
    "pollo",
    "cebolla",
    "zanahoria"
   ],
   "sug": false
  },
  {
   "id": "s04-3",
   "slot": "s04",
   "nombre": "Pollo en salsa con champiñones",
   "ing": [
    "pollo",
    "champinon",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s05-0",
   "slot": "s05",
   "nombre": "Merluza con patata panadera",
   "ing": [
    "merluza",
    "patata",
    "cebolla"
   ],
   "sug": true,
   "metodo": "Patata en rodajas finas y cebolla al horno, quince minutos a 200°. Encima los lomos —descongelados en la nevera desde anoche— con ajo laminado y un chorro de vino blanco: diez minutos más y fuera, que se seca en nada.",
   "tiempo": "30 min"
  },
  {
   "id": "s05-1",
   "slot": "s05",
   "nombre": "Merluza a la marinera",
   "ing": [
    "merluza",
    "cebolla",
    "guisantes"
   ],
   "sug": false
  },
  {
   "id": "s05-2",
   "slot": "s05",
   "nombre": "Bacalao con tomate",
   "ing": [
    "bacalao",
    "tomate",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s05-3",
   "slot": "s05",
   "nombre": "Lomos rebozados con pimientos",
   "ing": [
    "merluza",
    "huevo",
    "pimiento"
   ],
   "sug": false
  },
  {
   "id": "s06-0",
   "slot": "s06",
   "nombre": "Arroz con gambas y pimiento",
   "ing": [
    "gambas",
    "arroz",
    "pimiento"
   ],
   "sug": true,
   "metodo": "Sofríe las gambas un minuto y resérvalas, que solo cojan color. En el mismo aceite, calienta el sofrito y nacara el arroz redondo un minuto. Caldo caliente al doble de volumen y dieciocho minutos sin tocarlo: diez fuertes, ocho flojos. Las gambas vuelven al arroz en el último minuto, con el fuego ya apagado.",
   "tiempo": "35 min"
  },
  {
   "id": "s06-1",
   "slot": "s06",
   "nombre": "Arroz a banda con calamar",
   "ing": [
    "calamar",
    "arroz",
    "tomate"
   ],
   "sug": false
  },
  {
   "id": "s06-2",
   "slot": "s06",
   "nombre": "Fideuá con gambas",
   "ing": [
    "gambas",
    "fideo",
    "tomate"
   ],
   "sug": false
  },
  {
   "id": "s06-3",
   "slot": "s06",
   "nombre": "Arroz con mejillones y pimiento",
   "ing": [
    "mejillon",
    "arroz",
    "pimiento"
   ],
   "sug": false
  },
  {
   "id": "s07-0",
   "slot": "s07",
   "nombre": "Tortilla jugosa con cebolla pochada",
   "ing": [
    "huevo",
    "patata",
    "cebolla"
   ],
   "sug": true,
   "metodo": "Patata en láminas finas y cebolla en juliana, confitadas veinte minutos en aceite a fuego bajo hasta que estén blandas, no doradas. Escurre bien, mezcla con seis huevos batidos y sal, y cuaja en una sartén pequeña cuatro minutos por cada lado. Se le da la vuelta con un plato, sin prisa.",
   "tiempo": "30 min"
  },
  {
   "id": "s07-1",
   "slot": "s07",
   "nombre": "Tortilla de calabacín y cebolla",
   "ing": [
    "huevo",
    "calabacin",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s07-2",
   "slot": "s07",
   "nombre": "Tortilla paisana con guisantes",
   "ing": [
    "huevo",
    "patata",
    "guisantes",
    "pimiento"
   ],
   "sug": false
  },
  {
   "id": "s07-3",
   "slot": "s07",
   "nombre": "Revuelto de patata y pimientos",
   "ing": [
    "huevo",
    "patata",
    "pimiento"
   ],
   "sug": false
  },
  {
   "id": "s08-0",
   "slot": "s08",
   "nombre": "Pollo asado con patatas y cebolla",
   "ing": [
    "pollo",
    "patata",
    "cebolla"
   ],
   "sug": true,
   "metodo": "Cama de patata en rodajas y cebolla en el fondo de la bandeja, con un dedo de agua y vino. Los cuartos de pollo encima, untados con ajo, pimentón, aceite y sal. Cincuenta minutos a 190° sin abrir el horno. Único plato del día que pasa de media hora, y casi todo es esperar.",
   "tiempo": "55 min · 10 de trabajo"
  },
  {
   "id": "s08-1",
   "slot": "s08",
   "nombre": "Pollo al limón",
   "ing": [
    "pollo",
    "patata",
    "limon"
   ],
   "sug": false
  },
  {
   "id": "s08-2",
   "slot": "s08",
   "nombre": "Muslos adobados al pimentón",
   "ing": [
    "pollo",
    "patata",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s08-3",
   "slot": "s08",
   "nombre": "Costillar de cerdo a la miel",
   "ing": [
    "cerdo",
    "patata",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s09-0",
   "slot": "s09",
   "nombre": "Salmorejo con huevo y atún",
   "ing": [
    "tomate",
    "pan",
    "huevo",
    "atun"
   ],
   "sug": true,
   "metodo": "Tomate maduro, un buen trozo de pan del día anterior, ajo, vinagre y aceite en la batidora hasta que emulsione y palidezca. Muy frío, con huevo duro picado y atún en lascas por encima, en vez del jamón de siempre. Al lado, lo que haya sobrado del asado y unos taquitos de queso fresco.",
   "tiempo": "15 min"
  },
  {
   "id": "s09-1",
   "slot": "s09",
   "nombre": "Gazpacho con guarnición de atún",
   "ing": [
    "tomate",
    "pepino",
    "pimiento",
    "atun",
    "pan"
   ],
   "sug": false
  },
  {
   "id": "s09-2",
   "slot": "s09",
   "nombre": "Crema de calabacín con huevo duro",
   "ing": [
    "calabacin",
    "huevo",
    "cebolla",
    "patata"
   ],
   "sug": false
  },
  {
   "id": "s09-3",
   "slot": "s09",
   "nombre": "Ajoblanco con uvas (en verano)",
   "ing": [
    "almendra",
    "pan",
    "uva"
   ],
   "sug": false
  },
  {
   "id": "s10-0",
   "slot": "s10",
   "nombre": "Macarrones con carne picada y verdura",
   "ing": [
    "pasta",
    "picada",
    "tomate",
    "cebolla"
   ],
   "sug": true,
   "metodo": "Descongela una bolsa de picada y dórala fuerte, deshaciéndola con la cuchara. Añade el sofrito, zanahoria rallada y calabacín en dados pequeños para que rinda más con menos carne, tomate triturado y quince minutos a fuego lento mientras cuece la pasta. Una pizca de comino y otra de pimentón lo cambian todo.",
   "tiempo": "25 min"
  },
  {
   "id": "s10-1",
   "slot": "s10",
   "nombre": "Espaguetis con albóndigas",
   "ing": [
    "pasta",
    "picada",
    "huevo",
    "tomate"
   ],
   "sug": false
  },
  {
   "id": "s10-2",
   "slot": "s10",
   "nombre": "Macarrones con atún y tomate",
   "ing": [
    "pasta",
    "atun",
    "tomate"
   ],
   "sug": false
  },
  {
   "id": "s10-3",
   "slot": "s10",
   "nombre": "Pasta al horno gratinada",
   "ing": [
    "pasta",
    "picada",
    "tomate",
    "queso"
   ],
   "sug": false
  },
  {
   "id": "s11-0",
   "slot": "s11",
   "nombre": "Pisto con huevos rotos",
   "ing": [
    "huevo",
    "tomate",
    "pimiento",
    "calabacin",
    "cebolla"
   ],
   "sug": true,
   "metodo": "Calabacín, pimiento, cebolla y tomate en dados pequeños, tapados veinte minutos a fuego medio hasta que suelten el agua y se la vuelvan a beber. Rompe dos huevos encima, tapa cuatro minutos y sirve en la misma sartén. Ligera y sin carne ni pescado, para descansar de las dos cosas a mitad de semana.",
   "tiempo": "30 min"
  },
  {
   "id": "s11-1",
   "slot": "s11",
   "nombre": "Patatas a lo pobre con huevo",
   "ing": [
    "patata",
    "huevo",
    "pimiento",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s11-2",
   "slot": "s11",
   "nombre": "Huevos a la flamenca",
   "ing": [
    "huevo",
    "tomate",
    "pimiento",
    "guisantes"
   ],
   "sug": false
  },
  {
   "id": "s11-3",
   "slot": "s11",
   "nombre": "Revuelto de calabacín y champiñón",
   "ing": [
    "huevo",
    "calabacin",
    "champinon"
   ],
   "sug": false
  },
  {
   "id": "s12-0",
   "slot": "s12",
   "nombre": "Garbanzos con espinacas y huevo duro",
   "ing": [
    "garbanzo",
    "espinacas",
    "huevo"
   ],
   "sug": true,
   "metodo": "Sofrito, garbanzos escurridos, espinacas frescas o congeladas y un cazo de caldo; comino y, fuera del fuego, el pimentón para que no amargue. Quince minutos moviendo la cazuela en vez de remover, hasta que la espinaca esté hecha y el caldo haya espesado un poco. Huevo duro en cuartos por encima al servir.",
   "tiempo": "30 min"
  },
  {
   "id": "s12-1",
   "slot": "s12",
   "nombre": "Lentejas con verduras de invierno",
   "ing": [
    "lenteja",
    "zanahoria",
    "calabaza"
   ],
   "sug": false
  },
  {
   "id": "s12-2",
   "slot": "s12",
   "nombre": "Alubias con calabaza y comino",
   "ing": [
    "alubia",
    "calabaza"
   ],
   "sug": false
  },
  {
   "id": "s12-3",
   "slot": "s12",
   "nombre": "Garbanzos con bacalao y espinacas",
   "ing": [
    "garbanzo",
    "bacalao",
    "espinacas"
   ],
   "sug": false
  },
  {
   "id": "s13-0",
   "slot": "s13",
   "nombre": "Magro al ajillo con champiñones",
   "ing": [
    "cerdo",
    "ajo",
    "champinon"
   ],
   "sug": true,
   "metodo": "Magro en dados a fuego fuerte con cuatro ajos laminados, sin tocarlo hasta que agarre color. Los champiñones en cuartos después, que sueltan agua, y un chorro de vino blanco al final para arrastrar el fondo de la sartén.",
   "tiempo": "20 min"
  },
  {
   "id": "s13-1",
   "slot": "s13",
   "nombre": "Solomillo a la mostaza",
   "ing": [
    "cerdo",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s13-2",
   "slot": "s13",
   "nombre": "Lomo a la plancha con pimientos",
   "ing": [
    "cerdo",
    "pimiento"
   ],
   "sug": false
  },
  {
   "id": "s13-3",
   "slot": "s13",
   "nombre": "Magro con tomate",
   "ing": [
    "cerdo",
    "tomate",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s14-0",
   "slot": "s14",
   "nombre": "Albóndigas con guisantes",
   "ing": [
    "picada",
    "guisantes",
    "huevo",
    "cebolla",
    "pan"
   ],
   "sug": true,
   "metodo": "La picada que queda, con un huevo, ajo y pan mojado en leche; bolas del tamaño de una nuez, enharinadas y selladas en la sartén. Fuera, y en ese aceite el resto del tomate y un poco de caldo. Vuelven a la salsa con los guisantes, quince minutos a fuego suave.",
   "tiempo": "35 min"
  },
  {
   "id": "s14-1",
   "slot": "s14",
   "nombre": "Albóndigas en salsa de almendra",
   "ing": [
    "picada",
    "almendra",
    "cebolla"
   ],
   "sug": false
  },
  {
   "id": "s14-2",
   "slot": "s14",
   "nombre": "Pimientos rellenos de carne",
   "ing": [
    "picada",
    "pimiento",
    "tomate"
   ],
   "sug": false
  },
  {
   "id": "s14-3",
   "slot": "s14",
   "nombre": "Rollo de carne al horno",
   "ing": [
    "picada",
    "huevo",
    "zanahoria"
   ],
   "sug": false
  }
 ],
 "alimentos": {
  "ternera": {
   "nombre": "Ternera",
   "grupo": "vacuno"
  },
  "picada": {
   "nombre": "Carne picada",
   "grupo": "vacuno"
  },
  "pollo": {
   "nombre": "Pollo",
   "grupo": "ave"
  },
  "cerdo": {
   "nombre": "Cerdo magro",
   "grupo": "cerdo"
  },
  "atun": {
   "nombre": "Atún / ventresca",
   "grupo": "pescado azul"
  },
  "merluza": {
   "nombre": "Merluza",
   "grupo": "pescado blanco"
  },
  "bacalao": {
   "nombre": "Bacalao",
   "grupo": "pescado blanco"
  },
  "gambas": {
   "nombre": "Gambas",
   "grupo": "marisco"
  },
  "calamar": {
   "nombre": "Calamar",
   "grupo": "marisco"
  },
  "mejillon": {
   "nombre": "Mejillones",
   "grupo": "marisco"
  },
  "lenteja": {
   "nombre": "Lentejas",
   "grupo": "legumbre"
  },
  "garbanzo": {
   "nombre": "Garbanzos",
   "grupo": "legumbre"
  },
  "alubia": {
   "nombre": "Alubias",
   "grupo": "legumbre"
  },
  "huevo": {
   "nombre": "Huevo",
   "grupo": "huevo"
  },
  "patata": {
   "nombre": "Patata",
   "grupo": "patata"
  },
  "arroz": {
   "nombre": "Arroz",
   "grupo": "cereal"
  },
  "pasta": {
   "nombre": "Pasta",
   "grupo": "cereal"
  },
  "fideo": {
   "nombre": "Fideos",
   "grupo": "cereal"
  },
  "pan": {
   "nombre": "Pan",
   "grupo": "cereal"
  },
  "pimiento": {
   "nombre": "Pimiento",
   "grupo": "verdura"
  },
  "cebolla": {
   "nombre": "Cebolla",
   "grupo": "verdura"
  },
  "ajo": {
   "nombre": "Ajo",
   "grupo": "verdura"
  },
  "tomate": {
   "nombre": "Tomate",
   "grupo": "verdura"
  },
  "calabacin": {
   "nombre": "Calabacín",
   "grupo": "verdura"
  },
  "calabaza": {
   "nombre": "Calabaza",
   "grupo": "verdura"
  },
  "espinacas": {
   "nombre": "Espinacas",
   "grupo": "verdura"
  },
  "champinon": {
   "nombre": "Champiñón",
   "grupo": "verdura"
  },
  "guisantes": {
   "nombre": "Guisantes",
   "grupo": "verdura"
  },
  "zanahoria": {
   "nombre": "Zanahoria",
   "grupo": "verdura"
  },
  "lechuga": {
   "nombre": "Lechuga",
   "grupo": "verdura"
  },
  "pepino": {
   "nombre": "Pepino",
   "grupo": "verdura"
  },
  "almendra": {
   "nombre": "Almendra",
   "grupo": "fruto seco"
  },
  "uva": {
   "nombre": "Uvas",
   "grupo": "fruta"
  },
  "limon": {
   "nombre": "Limón",
   "grupo": "fruta"
  },
  "queso": {
   "nombre": "Queso",
   "grupo": "lácteo"
  }
 }
};
