// Motor: grafo de alimentos y recetas, y planificador que evita repetir.
(function () {
  const PESO = {
    vacuno: 1, ave: 1, cerdo: 1, 'pescado azul': 1, 'pescado blanco': 1, marisco: 1,
    legumbre: 1, huevo: 0.7, cereal: 0.5, patata: 0.5, 'fruto seco': 0.4, 'lácteo': 0.4,
    verdura: 0.15, fruta: 0.15,
  };
  // Cuántas tomas tarda un alimento en "enfriarse" (constante de decaimiento).
  const VIDA = {
    vacuno: 8, ave: 6, cerdo: 8, 'pescado azul': 5, 'pescado blanco': 5, marisco: 6,
    legumbre: 6, huevo: 3, cereal: 3, patata: 3, 'fruto seco': 4, 'lácteo': 3, verdura: 2.5, fruta: 2.5,
  };
  const FAMILIA = {
    vacuno: 'carne', ave: 'carne', cerdo: 'carne',
    'pescado azul': 'pescado', 'pescado blanco': 'pescado', marisco: 'pescado',
    legumbre: 'legumbre', huevo: 'huevo',
  };
  const PRIORIDAD = ['carne', 'pescado', 'legumbre', 'huevo'];
  const OBJETIVO = { carneMax: 6, pescadoMin: 4, legumbreMin: 2 };
  const VENTANA = 14;          // tomas de una semana
  const SIN_REPETIR = 56;      // cuatro semanas
  const NOMBRES_DIA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  // ---- Tiempo: cada toma es un índice entero (2 por día: comida=0, cena=1) ----
  const diaUTC = (iso) => Math.floor(Date.parse(iso + 'T00:00:00Z') / 86400000);
  const idxToma = (iso, momento) => diaUTC(iso) * 2 + (momento === 'cena' ? 1 : 0);
  const deIdx = (idx) => ({
    fecha: new Date(Math.floor(idx / 2) * 86400000).toISOString().slice(0, 10),
    momento: idx % 2 ? 'cena' : 'comida',
  });
  const diaSemana = (iso) => new Date(iso + 'T00:00:00Z').getUTCDay();

  // ---- Grafo ----
  // Nodos: receta, alimento, grupo, familia. Aristas: usa, es, pertenece.
  function construirGrafo(estado) {
    const alimentos = Object.assign({}, window.DATOS.alimentos, (estado.propios || {}).alimentos);
    const recetas = window.DATOS.recetas.concat((estado.propios || {}).recetas || []);
    const nodos = new Map(), aristas = [];
    const nodo = (id, o) => { if (!nodos.has(id)) nodos.set(id, Object.assign({ id }, o)); return nodos.get(id); };
    for (const [id, a] of Object.entries(alimentos)) {
      nodo('a:' + id, { tipo: 'alimento', nombre: a.nombre, grupo: a.grupo });
      nodo('g:' + a.grupo, { tipo: 'grupo', nombre: a.grupo });
      aristas.push({ de: 'a:' + id, a: 'g:' + a.grupo, rel: 'es' });
      const fam = FAMILIA[a.grupo];
      if (fam) { nodo('f:' + fam, { tipo: 'familia', nombre: fam }); aristas.push({ de: 'g:' + a.grupo, a: 'f:' + fam, rel: 'pertenece' }); }
    }
    const porId = {};
    for (const r of recetas) {
      porId[r.id] = r;
      nodo('r:' + r.id, { tipo: 'receta', nombre: r.nombre });
      for (const i of r.ing) if (alimentos[i]) aristas.push({ de: 'r:' + r.id, a: 'a:' + i, rel: 'usa' });
    }
    return { alimentos, recetas, porId, nodos, aristas };
  }

  function familiaDe(ings, alimentos) {
    const fams = new Set(ings.map((i) => FAMILIA[(alimentos[i] || {}).grupo]).filter(Boolean));
    for (const f of PRIORIDAD) if (fams.has(f)) return f;
    return 'verdura';
  }

  // Alimentos, historial -> "calor": cuánto se ha comido hace poco (0..~1+).
  function calor(historial, desdeIdx, grafo) {
    const c = {};
    for (const h of historial) {
      const d = Math.max(0, desdeIdx - idxToma(h.fecha, h.momento));
      for (const i of ingsDe(h, grafo)) {
        const g = (grafo.alimentos[i] || {}).grupo;
        c[i] = (c[i] || 0) + Math.exp(-d / (VIDA[g] || 3));
      }
    }
    return c;
  }

  const ingsDe = (h, grafo) => h.receta && grafo.porId[h.receta] ? grafo.porId[h.receta].ing : (h.ing || []);

  // ---- Puntuación ----
  function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; }
  const hace = (d) => d <= 1 ? 'la toma anterior' : d < 4 ? `hace ${d} tomas` : `hace ${Math.round(d / 2)} días`;

  function puntuar(r, idx, previas, grafo, casilla, libre) {
    let score = 0; const razones = [];
    // 1. receta exacta ya comida en las últimas cuatro semanas
    for (const t of previas) {
      if (t.receta === r.id && idx - t.idx < SIN_REPETIR) {
        return { score: -1000 + (idx - t.idx), razones: [{ s: '-', t: `Se comió ${hace(idx - t.idx)}: no repite hasta pasadas cuatro semanas` }], excluida: true };
      }
    }
    // 2. alimentos principales comidos hace poco
    const contrib = {};
    for (const i of r.ing) {
      const g = (grafo.alimentos[i] || {}).grupo; if (!g) continue;
      for (const t of previas) {
        const d = idx - t.idx; if (d <= 0 || d > 24 || !t.ing.includes(i)) continue;
        const v = (PESO[g] || 0.3) * Math.exp(-d / (VIDA[g] || 3));
        contrib[i] = contrib[i] || { v: 0, d };
        contrib[i].v += v; contrib[i].d = Math.min(contrib[i].d, d);
      }
    }
    const lista = Object.entries(contrib).sort((a, b) => b[1].v - a[1].v);
    for (const [, c] of lista) score -= 3 * c.v;
    for (const [i, c] of lista.slice(0, 2)) if (c.v > 0.12) razones.push({ s: '-', t: `${grafo.alimentos[i].nombre.toLowerCase()} ${hace(c.d)}` });
    // 3. misma familia en tomas contiguas
    const fam = familiaDe(r.ing, grafo.alimentos);
    for (const [d, p] of [[1, 2], [2, 0.8]]) {
      const t = previas.find((x) => x.idx === idx - d);
      if (t && t.fam === fam && fam !== 'verdura' && fam !== 'huevo') { score -= p; razones.push({ s: '-', t: `${fam} también ${hace(d)}` }); }
    }
    // 4. reparto de la semana (ventana de 14 tomas hasta esta)
    const ven = previas.filter((t) => t.idx > idx - VENTANA);
    const n = (f) => ven.filter((t) => t.fam === f).length;
    if (fam === 'carne') {
      const c = n('carne');
      if (c >= OBJETIVO.carneMax) { score -= 4; razones.push({ s: '-', t: `ya hay ${c} tomas con carne en la semana` }); }
      else if (c >= 4) score -= (c - 3) * 0.6;
    }
    if (fam === 'pescado' && n('pescado') < OBJETIVO.pescadoMin) { score += 0.8 + 0.4 * (OBJETIVO.pescadoMin - n('pescado')); razones.push({ s: '+', t: `faltan tomas de pescado (${n('pescado')} de ${OBJETIVO.pescadoMin})` }); }
    if (fam === 'legumbre' && n('legumbre') < OBJETIVO.legumbreMin) { score += 0.8 + 0.6 * (OBJETIVO.legumbreMin - n('legumbre')); razones.push({ s: '+', t: `faltan legumbres (${n('legumbre')} de ${OBJETIVO.legumbreMin})` }); }
    // 5. casilla de la plantilla
    if (r.slot === casilla.id) { if (libre) { score += 2; razones.push({ s: '+', t: 'encaja en la casilla ' + casilla.tipo.toLowerCase() }); } if (r.sug) score += 0.3; }
    score += hash(r.id + ':' + idx) * 0.05;
    return { score, razones, fam };
  }

  // ---- Planificador ----
  function planificar(estado, opc = {}) {
    const grafo = construirGrafo(estado);
    const libre = estado.modo === 'libre';
    const hist = (estado.historial || []).slice().sort((a, b) => idxToma(a.fecha, a.momento) - idxToma(b.fecha, b.momento));
    const previas = hist.map((h) => { const ing = ingsDe(h, grafo); return { idx: idxToma(h.fecha, h.momento), receta: h.receta || null, ing, fam: familiaDe(ing, grafo.alimentos) }; });
    const hoy = opc.hoy || new Date().toISOString().slice(0, 10);
    const ultimo = previas.length ? previas[previas.length - 1].idx : null;
    const inicio = ultimo !== null ? ultimo + 1 : idxToma(hoy, new Date().getHours() < 16 ? 'comida' : 'cena');
    const casillas = window.DATOS.casillas;
    const plan = [];
    for (let k = 0; k < VENTANA; k++) {
      const idx = inicio + k, { fecha, momento } = deIdx(idx);
      const casilla = casillas.find((c) => c.dia === diaSemana(fecha) && c.momento === momento);
      const cands = grafo.recetas.filter((r) => libre || r.slot === casilla.id);
      const ranking = cands.map((r) => Object.assign({ receta: r }, puntuar(r, idx, previas, grafo, casilla, libre)))
        .sort((a, b) => b.score - a.score);
      const pin = (estado.pins || {})[idx];
      const elegido = ranking.find((x) => x.receta.id === pin) || ranking[0];
      plan.push({ idx, fecha, momento, casilla, elegido, fijada: elegido.receta.id === pin, alternativas: ranking.filter((x) => x !== elegido && !x.excluida).slice(0, 3) });
      previas.push({ idx, receta: elegido.receta.id, ing: elegido.receta.ing, fam: elegido.fam });
    }
    return { plan, grafo, inicio, calor: calor(hist, inicio, grafo), historial: hist };
  }

  function balance(tomas) { // tomas: [{fam}]
    const n = (f) => tomas.filter((t) => t.fam === f).length;
    return { carne: n('carne'), pescado: n('pescado'), legumbre: n('legumbre'), huevo: n('huevo'), total: tomas.length };
  }

  function compra(plan, grafo) {
    const cuenta = {};
    for (const p of plan) for (const i of p.elegido.receta.ing) cuenta[i] = (cuenta[i] || 0) + 1;
    const grupos = {};
    for (const [i, n] of Object.entries(cuenta)) {
      const g = grafo.alimentos[i].grupo;
      (grupos[g] = grupos[g] || []).push({ id: i, nombre: grafo.alimentos[i].nombre, tomas: n });
    }
    for (const g of Object.values(grupos)) g.sort((a, b) => b.tomas - a.tomas);
    return grupos;
  }

  window.MOTOR = { PESO, FAMILIA, OBJETIVO, VENTANA, NOMBRES_DIA, idxToma, deIdx, diaSemana, construirGrafo, familiaDe, calor, ingsDe, planificar, balance, compra };
})();
