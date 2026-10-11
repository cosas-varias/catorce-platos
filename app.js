// Interfaz del planificador: ahora, plan, reparto, compra, registro y grafo.
(function () {
  const M = window.MOTOR, D = window.DATOS;
  const CLAVE = 'catorce-platos-v1';
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const hoyISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const FAM_CSS = { carne: 'carne', pescado: 'pescado', legumbre: 'legumbre', huevo: 'huevo', verdura: 'otro', otro: 'otro' };
  const NOMBRE_FAM = { carne: 'Carne', pescado: 'Pescado', legumbre: 'Legumbre', huevo: 'Huevo', verdura: 'Verdura' };
  const NOMBRE_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const ddmm = (iso) => iso.slice(8) + '/' + iso.slice(5, 7);
  const cuando = (fecha, momento) => {
    const d = M.idxToma(fecha, 'comida') / 2 - M.idxToma(hoyISO(), 'comida') / 2;
    const dia = d === 0 ? 'hoy' : d === 1 ? 'mañana' : d === -1 ? 'ayer' : NOMBRE_DIA[M.diaSemana(fecha)].toLowerCase() + ' ' + ddmm(fecha);
    return (momento === 'cena' ? 'Cena' : 'Comida') + ' de ' + dia;
  };
  const nuevo = () => ({ historial: [], propios: { alimentos: {}, recetas: [] }, pins: {}, modo: 'plantilla', comprado: [] });

  let estado = cargar();
  let ingsForm = [];

  function cargar() {
    try { return Object.assign(nuevo(), JSON.parse(localStorage.getItem(CLAVE) || '{}')); } catch (e) { return nuevo(); }
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ } }

  // Cambio con aviso y opción de deshacer.
  let copia = null, temporizador = 0;
  function cambiar(txt, f) {
    copia = JSON.stringify(estado); f(); guardar(); pintar();
    $('aviso-txt').textContent = txt; $('aviso').hidden = false;
    clearTimeout(temporizador); temporizador = setTimeout(() => { $('aviso').hidden = true; copia = null; }, 6000);
  }
  $('aviso-deshacer').addEventListener('click', () => {
    if (copia) { estado = JSON.parse(copia); copia = null; guardar(); pintar(); }
    $('aviso').hidden = true;
  });

  // ---- Formulario ----
  function pintarFormulario(g) {
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
    $('f-etiquetas').innerHTML = ingsForm.map((i) => `<li>${esc(g.alimentos[i].nombre)}<button type="button" data-q="${i}" aria-label="Quitar ${esc(g.alimentos[i].nombre)}">×</button></li>`).join('');
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
    $('f-ing').value = ''; guardar(); pintarFormulario(M.construirGrafo(estado));
  }

  const apuntarEntrada = (e) => { estado.historial = estado.historial.filter((h) => !(h.fecha === e.fecha && h.momento === e.momento)).concat(e); };
  function apuntar(ev) {
    ev.preventDefault();
    const fecha = $('f-fecha').value, momento = $('f-momento').value, sel = $('f-receta').value;
    if (!fecha) return;
    if (sel === '__otro' && !ingsForm.length) { $('f-ing').focus(); return; }
    const nombre = sel === '__otro' ? $('f-nombre').value.trim() || 'Plato propio' : M.construirGrafo(estado).porId[sel].nombre;
    cambiar(`Apuntado: ${nombre}`, () => {
      if (sel === '__otro') {
        const rid = 'p-' + slug(nombre) + '-' + ingsForm.slice().sort().join('');
        if (!estado.propios.recetas.some((r) => r.id === rid)) estado.propios.recetas.push({ id: rid, slot: null, nombre, ing: ingsForm.slice() });
        apuntarEntrada({ fecha, momento, receta: rid });
        ingsForm = []; $('f-nombre').value = '';
      } else apuntarEntrada({ fecha, momento, receta: sel });
    });
  }
  function marcarComida(p, receta) {
    const rec = receta || p.elegido.receta;
    cambiar(`Apuntado: ${rec.nombre}`, () => { apuntarEntrada({ fecha: p.fecha, momento: p.momento, receta: rec.id }); $('f-fecha').value = p.fecha; });
  }
  function otraCosa(p) {
    $('f-fecha').value = p.fecha; $('f-momento').value = p.momento; $('f-receta').value = '__otro';
    $('bloque-otro').hidden = false;
    $('s-registro').scrollIntoView({ behavior: 'smooth' }); $('f-nombre').focus({ preventScroll: true });
  }
  const fijar = (p, rec) => cambiar(`Fijado: ${rec.nombre}`, () => { estado.pins[p.idx] = rec.id; });
  const soltar = (p) => cambiar('Fijación quitada', () => { delete estado.pins[p.idx]; });

  // ---- Ahora ----
  function pintarAhora(r) {
    const p = r.plan[0], rec = p.elegido.receta, c = p.casilla;
    const caja = $('ahora');
    caja.className = 'ahora ahora--' + p.momento;
    caja.innerHTML = `<div class="ahora-principal">` +
      `<p class="ahora-cuando"><span class="marca"></span>${esc(cuando(p.fecha, p.momento))} · ${esc(c.tipo)}<span class="reloj">${esc(rec.tiempo || c.tiempo)}</span></p>` +
      `<h2>${esc(rec.nombre)}</h2>` + (rec.metodo ? `<p class="metodo">${esc(rec.metodo)}</p>` : '') +
      `<ul class="chips">${rec.ing.map((i) => `<li>${esc(r.grafo.alimentos[i].nombre)}</li>`).join('')}</ul>` +
      `<div class="acciones"></div></div>` +
      `<div class="ahora-despues"><h3>Después</h3><ol>${r.plan.slice(1, 5).map((q) =>
        `<li><span>${esc(cuando(q.fecha, q.momento))}</span><b class="fam-${FAM_CSS[q.elegido.fam]}">${esc(q.elegido.receta.nombre)}</b></li>`).join('')}</ol>` +
      `<a href="#s-plan">Ver las catorce →</a></div>`;
    const ac = caja.querySelector('.acciones');
    ac.append(boton('Lo hemos comido', 'app-btn', () => marcarComida(p)), boton('Comimos otra cosa', 'app-btn sec', () => otraCosa(p)));
    if (p.alternativas.length) {
      const alts = document.createElement('div'); alts.className = 'alts';
      alts.innerHTML = '<span class="alts-rotulo">Mejor otra:</span>';
      for (const a of p.alternativas) alts.appendChild(boton(a.receta.nombre, '', () => fijar(p, a.receta), a.razones.map((x) => x.s + ' ' + x.t).join('\n')));
      caja.querySelector('.ahora-principal').appendChild(alts);
    }
  }
  function boton(txt, clase, f, titulo) {
    const b = document.createElement('button'); b.type = 'button'; b.className = clase; b.textContent = txt; b.onclick = f;
    if (titulo) b.title = titulo;
    return b;
  }

  // ---- Registro ----
  function pintarHistorial(r) {
    const ul = $('historial');
    if (!r.historial.length) { ul.innerHTML = '<li class="vacio">Todavía no hay nada apuntado. Sin registro, el plan sale tal cual la plantilla.</li>'; return; }
    ul.innerHTML = r.historial.slice().reverse().map((h) => {
      const rec = r.grafo.porId[h.receta];
      const ings = M.ingsDe(h, r.grafo).map((i) => (r.grafo.alimentos[i] || {}).nombre).filter(Boolean).join(', ');
      const fam = M.familiaDe(M.ingsDe(h, r.grafo), r.grafo.alimentos);
      return `<li class="fam-${FAM_CSS[fam]}"><span class="cuando">${NOMBRE_DIA[M.diaSemana(h.fecha)].slice(0, 3)} ${ddmm(h.fecha)} · ${h.momento}</span>` +
        `<span class="nombre">${esc(rec ? rec.nombre : 'Plato')} <span class="ings">${esc(ings)}</span></span>` +
        `<button class="app-btn sec mini" data-del="${h.fecha}|${h.momento}" aria-label="Borrar ${esc(rec ? rec.nombre : 'plato')}">Borrar</button></li>`;
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
    const hoy = hoyISO();
    for (const d of porDia) {
      const art = document.createElement('article'); art.className = 'dia' + (d.fecha === hoy ? ' dia--hoy' : '');
      const nom = NOMBRE_DIA[M.diaSemana(d.fecha)];
      art.innerHTML = `<div class="fecha"><div class="azulejo" aria-hidden="true">${nom[0]}</div><span>${nom} ${ddmm(d.fecha)}</span>${d.fecha === hoy ? '<span class="hoy">Hoy</span>' : ''}</div>`;
      if (d.tomas[0].momento === 'cena') { // la comida de ese día ya quedó atrás
        const h = r.historial.find((x) => x.fecha === d.fecha && x.momento === 'comida'), rec = h && r.grafo.porId[h.receta];
        art.insertAdjacentHTML('beforeend', `<div class="toma toma--pasada"><div class="toma-cab"><span class="marca"></span>Comida</div><p>${rec ? 'Comisteis ' + esc(rec.nombre) : 'Ya pasó'}</p></div>`);
      }
      for (const p of d.tomas) art.appendChild(nodoToma(p, r));
      cont.appendChild(art);
    }
    $('b-soltar').hidden = !Object.keys(estado.pins).length;
  }
  function nodoToma(p, r) {
    const el = document.createElement('div');
    const rec = p.elegido.receta, c = p.casilla;
    el.className = 'toma toma--' + p.momento + (p.idx === r.inicio ? ' toma--siguiente' : '');
    const metodo = rec.metodo ? `<p>${esc(rec.metodo)}</p>` : '';
    const ings = rec.ing.map((i) => `<li${r.calor[i] > 0.35 ? ' class="destaca" title="Comido hace poco"' : ''}>${esc(r.grafo.alimentos[i].nombre)}</li>`).join('');
    const rz = p.elegido.razones.map((x) => `<li data-s="${x.s}">${esc(x.t)}</li>`).join('');
    el.innerHTML = `<div class="toma-cab"><span class="marca"></span>${p.momento === 'cena' ? 'Cena' : 'Comida'}<span class="fam fam-${FAM_CSS[p.elegido.fam]}">${NOMBRE_FAM[p.elegido.fam]}</span><span class="reloj">${esc(rec.tiempo || c.tiempo)}</span></div>` +
      `<h3>${esc(c.tipo)}</h3>` +
      `<p class="sug"><em>${p.fijada ? 'Fijado' : 'Sugerencia'}</em><b>${esc(rec.nombre)}</b></p>${metodo}` +
      `<ul class="chips">${ings}</ul>` + (rz ? `<ul class="porque">${rz}</ul>` : '');
    if (p.fijada) el.querySelector('.sug').appendChild(boton('soltar', 'soltar', () => soltar(p)));
    if (p.alternativas.length) {
      const alts = document.createElement('div'); alts.className = 'alts';
      alts.innerHTML = '<span class="alts-rotulo">Cambiar por</span>';
      for (const a of p.alternativas) alts.appendChild(boton(a.receta.nombre, '', () => fijar(p, a.receta), a.razones.map((x) => x.s + ' ' + x.t).join('\n')));
      el.appendChild(alts);
    }
    if (p.idx === r.inicio) {
      const ac = document.createElement('div'); ac.className = 'acciones';
      ac.appendChild(boton('Lo hemos comido', 'app-btn sec mini', () => marcarComida(p)));
      el.appendChild(ac);
    }
    return el;
  }

  // ---- Reparto y compra ----
  function pintarBalance(r) {
    $('tira').innerHTML = r.plan.map((p) => `<li class="fam-${FAM_CSS[p.elegido.fam]}" title="${esc(cuando(p.fecha, p.momento) + ': ' + p.elegido.receta.nombre)}">` +
      `<span class="celda"></span><span class="dia-ini">${NOMBRE_DIA[M.diaSemana(p.fecha)].slice(0, 2)}<br>${p.momento === 'cena' ? 'cena' : 'com.'}</span></li>`).join('');
    const b = M.balance(r.plan.map((p) => ({ fam: p.elegido.fam })));
    const O = M.OBJETIVO;
    const celdas = [
      ['carne', b.carne, 'Con carne', 'máx. ' + O.carneMax, b.carne <= O.carneMax],
      ['pescado', b.pescado, 'Pescado y marisco', 'mín. ' + O.pescadoMin, b.pescado >= O.pescadoMin],
      ['legumbre', b.legumbre, 'Legumbre', 'mín. ' + O.legumbreMin, b.legumbre >= O.legumbreMin],
      ['huevo', b.huevo, 'Huevo y verdura', 'el resto', true],
    ];
    $('balance').innerHTML = celdas.map(([f, v, k, obj, ok]) => `<div class="fam-${f} ${ok ? 'ok' : 'mal'}"><p class="valor">${v}</p>` +
      `<p class="clave">${esc(k)}</p><p class="objetivo">${ok ? '✓' : '✗'} ${esc(obj)}</p></div>`).join('');
  }
  function pintarCompra(r) {
    const g = M.compra(r.plan, r.grafo), hay = new Set(estado.comprado);
    const todos = Object.values(g).flat();
    $('compra').innerHTML = Object.keys(g).sort().map((k) =>
      `<div class="puesto"><h4>${esc(k)}</h4><ul>${g[k].map((i) => `<li${hay.has(i.id) ? ' class="hecho"' : ''}><label><input type="checkbox" data-c="${i.id}"${hay.has(i.id) ? ' checked' : ''}>${esc(i.nombre)}</label><span>×${i.tomas}</span></li>`).join('')}</ul></div>`).join('');
    const n = todos.filter((i) => hay.has(i.id)).length;
    $('compra-cuenta').textContent = n ? `${n} de ${todos.length} en el carro` : `${todos.length} alimentos para esas tomas`;
    $('b-desmarcar').hidden = !n;
    return todos;
  }

  // ---- Grafo (SVG, tres columnas) ----
  function pintarGrafo(r) {
    const svg = $('grafo'); svg.innerHTML = '';
    const comidas = r.historial.slice(-8).map((h) => ({ id: 'h:' + h.fecha + h.momento, nombre: (r.grafo.porId[h.receta] || {}).nombre || 'Plato', ing: M.ingsDe(h, r.grafo), sub: ddmm(h.fecha) + ' ' + h.momento }));
    const sugs = r.plan.slice(0, 6).map((p) => ({ id: 's:' + p.idx, nombre: p.elegido.receta.nombre, ing: p.elegido.receta.ing, sub: NOMBRE_DIA[M.diaSemana(p.fecha)].slice(0, 3) + ' ' + p.momento }));
    const ids = new Set(); comidas.concat(sugs).forEach((n) => n.ing.forEach((i) => ids.add(i)));
    const alims = [...ids].sort((a, b) => (r.calor[b] || 0) - (r.calor[a] || 0) || r.grafo.alimentos[a].nombre.localeCompare(r.grafo.alimentos[b].nombre));
    const paso = 34, H = Math.max(comidas.length, alims.length, sugs.length, 3) * paso + 56, W = 900;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const X = [20, 350, 700], AN = [180, 200, 180];
    const pos = {};
    const col = (lista, c, y0) => lista.forEach((n, k) => { pos[n.id] = { x: X[c], y: y0 + k * paso, w: AN[c] }; });
    col(comidas, 0, 44); col(alims.map((i) => ({ id: 'a:' + i })), 1, 44); col(sugs, 2, 44);
    const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); (p || svg).appendChild(e); return e; };
    ['Comido', 'Alimentos', 'Sugerido'].forEach((t, c) => { const e = el('text', { x: X[c], y: 24, class: 'col' }); e.textContent = t; });
    if (!comidas.length) {
      const e = el('text', { x: X[0], y: 60, class: 'vacio-svg' }); e.textContent = 'Nada apuntado todavía.';
      const e2 = el('text', { x: X[0], y: 78, class: 'vacio-svg' }); e2.textContent = 'Lo que apuntéis aparece aquí.';
    }
    const aristas = [];
    const unir = (n, lado) => n.ing.forEach((i) => {
      const a = pos[n.id], b = pos['a:' + i], x1 = lado === 0 ? a.x + a.w : b.x + b.w, x2 = lado === 0 ? b.x : a.x;
      const y1 = (lado === 0 ? a.y : b.y) + 12, y2 = (lado === 0 ? b.y : a.y) + 12, mx = (x1 + x2) / 2;
      const p = el('path', { d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, class: 'arista' });
      aristas.push({ p, n: n.id, a: 'a:' + i });
    });
    comidas.forEach((n) => unir(n, 0)); sugs.forEach((n) => unir(n, 1));
    const nodos = [];
    const caja = (id, clase, txt, sub, estilo, familia) => {
      const q = pos[id], g = el('g', { class: 'nodo ' + clase, transform: `translate(${q.x},${q.y})`, tabindex: 0 });
      const rc = el('rect', { width: q.w, height: 24, rx: 0 }, g); if (estilo) Object.keys(estilo).forEach((k) => rc.style[k] = estilo[k]);
      const t = el('text', { x: familia ? 10 : 8, y: 16 }, g); t.textContent = txt.length > 24 ? txt.slice(0, 23) + '…' : txt;
      if (familia) el('rect', { width: 4, height: 24, class: 'fam-barra fam-' + familia }, g);
      const tt = el('title', {}, g); tt.textContent = txt + (sub ? ' · ' + sub : '');
      nodos.push({ id, g }); return g;
    };
    comidas.forEach((n) => caja(n.id, 'n-comida', n.nombre, n.sub));
    sugs.forEach((n) => caja(n.id, 'n-sug', n.nombre, n.sub));
    alims.forEach((i) => {
      const c = Math.min(1, r.calor[i] || 0), pct = Math.round(c * 80);
      caja('a:' + i, 'n-alim', r.grafo.alimentos[i].nombre, r.grafo.alimentos[i].grupo,
        { fill: `color-mix(in srgb, var(--pimenton) ${pct}%, var(--anil-tinte))`, stroke: 'var(--linea)' },
        FAM_CSS[M.FAMILIA[r.grafo.alimentos[i].grupo]] || 'otro');
    });
    let activo = null;
    const resaltar = (id) => {
      activo = id;
      const vecinos = new Set([id]);
      aristas.forEach((e) => { const on = e.n === id || e.a === id; e.p.classList.toggle('on', on); if (on) { vecinos.add(e.n); vecinos.add(e.a); } });
      nodos.forEach((o) => o.g.classList.toggle('atenuado', !vecinos.has(o.id)));
      aristas.forEach((e) => e.p.classList.toggle('atenuado', !(e.n === id || e.a === id)));
    };
    const apagar = () => { activo = null; aristas.forEach((e) => e.p.classList.remove('on', 'atenuado')); nodos.forEach((o) => o.g.classList.remove('atenuado')); };
    nodos.forEach(({ id, g }) => {
      g.addEventListener('mouseenter', () => resaltar(id));
      g.addEventListener('mouseleave', apagar);
      g.addEventListener('focus', () => resaltar(id));
      g.addEventListener('blur', apagar);
      g.addEventListener('click', (e) => { e.stopPropagation(); if (activo === id) apagar(); else resaltar(id); }); // pantallas táctiles
    });
    svg.onclick = apagar;
  }

  let compraActual = [];
  function pintar() {
    let r = M.planificar(estado, { hoy: hoyISO() });
    const vivos = Object.keys(estado.pins).filter((k) => +k >= r.inicio);
    if (vivos.length !== Object.keys(estado.pins).length) { // fijaciones de tomas que ya pasaron
      estado.pins = Object.fromEntries(vivos.map((k) => [k, estado.pins[k]])); guardar(); r = M.planificar(estado, { hoy: hoyISO() });
    }
    pintarFormulario(r.grafo); pintarAhora(r); pintarHistorial(r); pintarPlan(r); pintarBalance(r); compraActual = pintarCompra(r); pintarGrafo(r);
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
    const [f, m] = d.split('|');
    cambiar('Borrado del registro', () => { estado.historial = estado.historial.filter((h) => !(h.fecha === f && h.momento === m)); });
  });
  $('c-libre').addEventListener('change', (e) => { estado.modo = e.target.checked ? 'libre' : 'plantilla'; estado.pins = {}; guardar(); pintar(); });
  $('b-soltar').addEventListener('click', () => cambiar('Fijaciones quitadas', () => { estado.pins = {}; }));
  $('b-vaciar').addEventListener('click', () => { if (confirm('¿Vaciar todo el registro?')) cambiar('Registro vaciado', () => { estado.historial = []; estado.pins = {}; }); });
  $('compra').addEventListener('change', (e) => {
    const id = e.target.dataset.c; if (!id) return;
    estado.comprado = estado.comprado.filter((x) => x !== id).concat(e.target.checked ? [id] : []);
    guardar(); pintarCompra(M.planificar(estado, { hoy: hoyISO() }));
  });
  $('b-desmarcar').addEventListener('click', () => cambiar('Lista desmarcada', () => { estado.comprado = []; }));
  $('b-copiar').addEventListener('click', async () => {
    const hay = new Set(estado.comprado);
    const txt = compraActual.filter((i) => !hay.has(i.id)).map((i) => '- ' + i.nombre).join('\n');
    try { await navigator.clipboard.writeText(txt); $('b-copiar').textContent = 'Copiado'; } catch (e) { $('b-copiar').textContent = 'No se pudo copiar'; }
    setTimeout(() => { $('b-copiar').textContent = 'Copiar lo que falta'; }, 2000);
  });
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
      cambiar('Registro importado', () => { estado = Object.assign(nuevo(), j); });
    } catch (err) { alert('El archivo no es un registro válido.'); }
    e.target.value = '';
  });

  pintar();
})();
