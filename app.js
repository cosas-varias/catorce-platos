// Interfaz del planificador: registro, grafo, plan, reparto y compra.
(function () {
  const M = window.MOTOR, D = window.DATOS;
  const CLAVE = 'catorce-platos-v1';
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const hoyISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const NOMBRE_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  let estado = cargar();
  let ingsForm = [];

  function cargar() {
    const base = { historial: [], propios: { alimentos: {}, recetas: [] }, pins: {}, modo: 'plantilla' };
    try { return Object.assign(base, JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch (e) { return base; }
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } }

  // ---- Formulario ----
  function pintarFormulario() {
    const g = M.construirGrafo(estado);
    const sel = $('f-receta');
    let h = '';
    for (const c of D.casillas) {
      h += `<optgroup label="${esc(c.diaNombre + ' ' + c.momento + ' · ' + c.tipo)}">` +
        g.recetas.filter((r) => r.slot === c.id).map((r) => `<option value="${r.id}">${esc(r.nombre)}</option>`).join('') + '</optgroup>';
    }
    const propias = g.recetas.filter((r) => !r.slot);
    if (propias.length) h += '<optgroup label="Platos propios">' + propias.map((r) => `<option value="${r.id}">${esc(r.nombre)}</option>`).join('') + '</optgroup>';
    h += '<option value="__otro">Otra cosa…</option>';
    const previo = sel.value;
    sel.innerHTML = h; if (previo) sel.value = previo;
    $('lista-alimentos').innerHTML = Object.values(g.alimentos).map((a) => `<option value="${esc(a.nombre)}">`).join('');
    const grupos = [...new Set(Object.values(g.alimentos).map((a) => a.grupo))];
    $('f-grupo').innerHTML = grupos.map((x) => `<option>${esc(x)}</option>`).join('');
    pintarEtiquetas();
  }
  function pintarEtiquetas() {
    const g = M.construirGrafo(estado);
    $('f-etiquetas').innerHTML = ingsForm.map((i) => `<li>${esc(g.alimentos[i].nombre)}<button type="button" data-q="${i}" aria-label="Quitar">×</button></li>`).join('');
  }
  function anadirIng() {
    const txt = $('f-ing').value.trim(); if (!txt) return;
    const g = M.construirGrafo(estado);
    let id = Object.keys(g.alimentos).find((k) => g.alimentos[k].nombre.toLowerCase() === txt.toLowerCase());
    if (!id) {
      if ($('bloque-grupo').hidden) { $('bloque-grupo').hidden = false; $('f-grupo').focus(); return; } // pide el grupo antes
      id = 'x-' + slug(txt);
      estado.propios.alimentos[id] = { nombre: txt, grupo: $('f-grupo').value };
      $('bloque-grupo').hidden = true;
    }
    if (!ingsForm.includes(id)) ingsForm.push(id);
    $('f-ing').value = ''; guardar(); pintarFormulario();
  }

  function apuntar(ev) {
    ev.preventDefault();
    const fecha = $('f-fecha').value, momento = $('f-momento').value, sel = $('f-receta').value;
    if (!fecha) return;
    let entrada;
    if (sel === '__otro') {
      if (!ingsForm.length) { $('f-ing').focus(); return; }
      const nombre = $('f-nombre').value.trim() || 'Plato propio';
      const rid = 'p-' + slug(nombre) + '-' + ingsForm.slice().sort().join('');
      if (!estado.propios.recetas.some((r) => r.id === rid)) estado.propios.recetas.push({ id: rid, slot: null, nombre, ing: ingsForm.slice() });
      entrada = { fecha, momento, receta: rid };
      ingsForm = []; $('f-nombre').value = '';
    } else entrada = { fecha, momento, receta: sel };
    estado.historial = estado.historial.filter((h) => !(h.fecha === fecha && h.momento === momento)).concat(entrada);
    guardar(); pintar();
  }
  function marcarComida(p) {
    estado.historial = estado.historial.filter((h) => !(h.fecha === p.fecha && h.momento === p.momento)).concat({ fecha: p.fecha, momento: p.momento, receta: p.elegido.receta.id });
    $('f-fecha').value = p.fecha; guardar(); pintar();
  }

  // ---- Registro ----
  function pintarHistorial(r) {
    const ul = $('historial');
    if (!r.historial.length) { ul.innerHTML = '<li class="vacio">Todavía no hay nada apuntado. Sin registro, el plan sale tal cual la plantilla.</li>'; return; }
    ul.innerHTML = r.historial.slice().reverse().map((h) => {
      const rec = r.grafo.porId[h.receta];
      const ings = M.ingsDe(h, r.grafo).map((i) => (r.grafo.alimentos[i] || {}).nombre).filter(Boolean).join(', ');
      return `<li><span class="cuando">${NOMBRE_DIA[M.diaSemana(h.fecha)].slice(0, 3)} ${h.fecha.slice(5).split('-').reverse().join('/')} · ${h.momento}</span>` +
        `<span class="nombre">${esc(rec ? rec.nombre : 'Plato')} <span class="ings">${esc(ings)}</span></span>` +
        `<button class="app-btn sec mini" data-del="${h.fecha}|${h.momento}" aria-label="Borrar">Borrar</button></li>`;
    }).join('');
  }

  // ---- Plan ----
  function pintarPlan(r) {
    const porDia = [];
    for (const p of r.plan) {
      let d = porDia[porDia.length - 1];
      if (!d || d.fecha !== p.fecha) { d = { fecha: p.fecha, tomas: [] }; porDia.push(d); }
      d.tomas.push(p);
    }
    const cont = $('plan'); cont.innerHTML = '';
    for (const d of porDia) {
      const art = document.createElement('article'); art.className = 'dia';
      const nom = NOMBRE_DIA[M.diaSemana(d.fecha)];
      art.innerHTML = `<div class="fecha"><div class="azulejo" aria-hidden="true">${nom[0]}</div><span>${nom} ${d.fecha.slice(8)}/${d.fecha.slice(5, 7)}</span></div>`;
      for (const p of d.tomas) art.appendChild(nodoToma(p, r));
      cont.appendChild(art);
    }
  }
  function nodoToma(p, r) {
    const el = document.createElement('div');
    const rec = p.elegido.receta, c = p.casilla;
    el.className = 'toma toma--' + p.momento;
    const metodo = rec.metodo ? `<p>${esc(rec.metodo)}</p>` : '';
    const ings = rec.ing.map((i) => `<li${r.calor[i] > 0.35 ? ' class="destaca"' : ''}>${esc(r.grafo.alimentos[i].nombre)}</li>`).join('');
    const rz = p.elegido.razones.map((x) => `<li data-s="${x.s}">${esc(x.t)}</li>`).join('');
    el.innerHTML = `<div class="toma-cab"><span class="marca"></span>${p.momento === 'cena' ? 'Cena' : 'Comida'}<span class="reloj">${esc(rec.tiempo || c.tiempo)}</span></div>` +
      `<h3>${esc(c.tipo)}</h3>` +
      `<p class="sug"><em>${p.fijada ? 'Fijado' : 'Sugerencia'}</em><b>${esc(rec.nombre)}</b></p>${metodo}` +
      `<ul class="chips">${ings}</ul>` + (rz ? `<ul class="porque">${rz}</ul>` : '');
    if (p.alternativas.length) {
      const alts = document.createElement('div'); alts.className = 'alts';
      for (const a of p.alternativas) {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = a.receta.nombre; b.title = a.razones.map((x) => x.s + ' ' + x.t).join('\n');
        b.onclick = () => { estado.pins[p.idx] = a.receta.id; guardar(); pintar(); };
        alts.appendChild(b);
      }
      el.appendChild(alts);
    }
    const ac = document.createElement('div'); ac.className = 'acciones';
    const b = document.createElement('button'); b.type = 'button'; b.className = 'app-btn sec mini'; b.textContent = 'Lo hemos comido'; b.onclick = () => marcarComida(p);
    ac.appendChild(b); el.appendChild(ac);
    return el;
  }

  // ---- Reparto y compra ----
  function pintarBalance(r) {
    const b = M.balance(r.plan.map((p) => ({ fam: p.elegido.fam })));
    const O = M.OBJETIVO;
    const celdas = [
      [b.carne, 'Con carne (máx. ' + O.carneMax + ')', b.carne <= O.carneMax],
      [b.pescado, 'Pescado y marisco (mín. ' + O.pescadoMin + ')', b.pescado >= O.pescadoMin],
      [b.legumbre, 'Legumbre (mín. ' + O.legumbreMin + ')', b.legumbre >= O.legumbreMin],
      [b.huevo, 'Huevo y verdura', true],
    ];
    $('balance').innerHTML = celdas.map(([v, k, ok]) => `<div class="${ok ? 'ok' : 'mal'}"><p class="valor">${v}</p><p class="clave">${esc(k)}</p></div>`).join('');
  }
  function pintarCompra(r) {
    const g = M.compra(r.plan, r.grafo);
    $('compra').innerHTML = Object.keys(g).sort().map((k) =>
      `<div class="puesto"><h4>${esc(k)}</h4><ul>${g[k].map((i) => `<li>${esc(i.nombre)}<span>×${i.tomas}</span></li>`).join('')}</ul></div>`).join('');
  }

  // ---- Grafo (SVG, tres columnas) ----
  function pintarGrafo(r) {
    const svg = $('grafo'); svg.innerHTML = '';
    const comidas = r.historial.slice(-8).map((h) => ({ id: 'h:' + h.fecha + h.momento, nombre: (r.grafo.porId[h.receta] || {}).nombre || 'Plato', ing: M.ingsDe(h, r.grafo), sub: h.fecha.slice(5).split('-').reverse().join('/') + ' ' + h.momento }));
    const sugs = r.plan.slice(0, 6).map((p) => ({ id: 's:' + p.idx, nombre: p.elegido.receta.nombre, ing: p.elegido.receta.ing, sub: NOMBRE_DIA[M.diaSemana(p.fecha)].slice(0, 3) + ' ' + p.momento }));
    const ids = new Set(); comidas.concat(sugs).forEach((n) => n.ing.forEach((i) => ids.add(i)));
    const alims = [...ids].sort((a, b) => (r.calor[b] || 0) - (r.calor[a] || 0) || r.grafo.alimentos[a].nombre.localeCompare(r.grafo.alimentos[b].nombre));
    const paso = 34, H = Math.max(comidas.length, alims.length, sugs.length, 3) * paso + 56, W = 900;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const X = [20, 350, 700], AN = [180, 200, 180];
    const pos = {};
    const col = (lista, c, y0) => lista.forEach((n, k) => { pos[n.id] = { x: X[c], y: y0 + k * paso, w: AN[c] }; });
    col(comidas, 0, 44 + (alims.length - comidas.length) * paso / 2 * 0); col(alims.map((i) => ({ id: 'a:' + i })), 1, 44); col(sugs, 2, 44);
    const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; };
    ['Comido', 'Alimentos', 'Sugerido'].forEach((t, c) => { const e = el('text', { x: X[c], y: 24, class: 'col' }); e.textContent = t; });
    const aristas = [];
    const unir = (n, lado) => n.ing.forEach((i) => {
      const a = pos[n.id], b = pos['a:' + i], x1 = lado === 0 ? a.x + a.w : b.x + b.w, x2 = lado === 0 ? b.x : a.x;
      const y1 = (lado === 0 ? a.y : b.y) + 12, y2 = (lado === 0 ? b.y : a.y) + 12, mx = (x1 + x2) / 2;
      const p = el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, class: 'arista' });
      aristas.push({ p, n: n.id, a: 'a:' + i });
    });
    comidas.forEach((n) => unir(n, 0)); sugs.forEach((n) => unir(n, 1));
    const nodos = [];
    const caja = (id, clase, txt, sub, estilo) => {
      const q = pos[id], g = el('g', { class: 'nodo ' + clase, transform: `translate(${q.x},${q.y})` });
      const rc = el('rect', { width: q.w, height: 24, rx: 0 }, g); if (estilo) Object.keys(estilo).forEach((k) => rc.style[k] = estilo[k]);
      const t = el('text', { x: 8, y: 16 }, g); t.textContent = txt.length > 24 ? txt.slice(0, 23) + '…' : txt;
      const tt = el('title', {}, g); tt.textContent = txt + (sub ? ' · ' + sub : '');
      nodos.push({ id, g }); return g;
    };
    comidas.forEach((n) => caja(n.id, 'n-comida', n.nombre, n.sub));
    sugs.forEach((n) => caja(n.id, 'n-sug', n.nombre, n.sub));
    alims.forEach((i) => {
      const c = Math.min(1, r.calor[i] || 0), pct = Math.round(c * 80);
      caja('a:' + i, 'n-alim', r.grafo.alimentos[i].nombre, r.grafo.alimentos[i].grupo,
        { fill: `color-mix(in srgb, var(--pimenton) ${pct}%, var(--anil-tinte))`, stroke: 'var(--linea)' });
    });
    nodos.forEach(({ id, g }) => {
      g.addEventListener('mouseenter', () => {
        const vecinos = new Set([id]);
        aristas.forEach((e) => { const on = e.n === id || e.a === id; e.p.classList.toggle('on', on); if (on) { vecinos.add(e.n); vecinos.add(e.a); } });
        nodos.forEach((o) => o.g.classList.toggle('atenuado', !vecinos.has(o.id)));
        aristas.forEach((e) => e.p.classList.toggle('atenuado', !(e.n === id || e.a === id)));
      });
      g.addEventListener('mouseleave', () => { aristas.forEach((e) => e.p.classList.remove('on', 'atenuado')); nodos.forEach((o) => o.g.classList.remove('atenuado')); });
    });
  }

  function pintar() {
    const r = M.planificar(estado, { hoy: hoyISO() });
    pintarFormulario(); pintarHistorial(r); pintarGrafo(r); pintarPlan(r); pintarBalance(r); pintarCompra(r);
    $('c-libre').checked = estado.modo === 'libre';
    $('bloque-otro').hidden = $('f-receta').value !== '__otro';
  }

  // ---- Eventos ----
  $('f-fecha').value = hoyISO();
  $('f-momento').value = new Date().getHours() < 16 ? 'comida' : 'cena';
  $('form-registro').addEventListener('submit', apuntar);
  $('f-receta').addEventListener('change', () => { $('bloque-otro').hidden = $('f-receta').value !== '__otro'; });
  $('f-ing').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); anadirIng(); } });
  $('f-ing').addEventListener('change', () => { if ($('f-ing').value.trim()) anadirIng(); });
  $('bloque-grupo').addEventListener('change', () => { if ($('f-ing').value.trim()) anadirIng(); });
  $('f-etiquetas').addEventListener('click', (e) => { const q = e.target.dataset.q; if (q) { ingsForm = ingsForm.filter((i) => i !== q); pintarEtiquetas(); } });
  $('historial').addEventListener('click', (e) => {
    const d = e.target.dataset.del; if (!d) return;
    const [f, m] = d.split('|'); estado.historial = estado.historial.filter((h) => !(h.fecha === f && h.momento === m)); guardar(); pintar();
  });
  $('c-libre').addEventListener('change', (e) => { estado.modo = e.target.checked ? 'libre' : 'plantilla'; estado.pins = {}; guardar(); pintar(); });
  $('b-soltar').addEventListener('click', () => { estado.pins = {}; guardar(); pintar(); });
  $('b-vaciar').addEventListener('click', () => { if (confirm('¿Vaciar todo el registro?')) { estado.historial = []; estado.pins = {}; guardar(); pintar(); } });
  $('b-exportar').addEventListener('click', () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(estado, null, 1)], { type: 'application/json' }));
    a.download = 'catorce-platos.json'; a.click(); URL.revokeObjectURL(a.href);
  });
  $('b-importar').addEventListener('click', () => $('f-archivo').click());
  $('f-archivo').addEventListener('change', async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const j = JSON.parse(await f.text());
      if (!Array.isArray(j.historial)) throw new Error('formato');
      estado = Object.assign({ historial: [], propios: { alimentos: {}, recetas: [] }, pins: {}, modo: 'plantilla' }, j); guardar(); pintar();
    } catch (err) { alert('El archivo no es un registro válido.'); }
    e.target.value = '';
  });

  pintar();
})();
