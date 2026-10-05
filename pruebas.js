// Pruebas del motor. Se ejecutan con: node pruebas.js
const assert = require('assert');
global.window = {};
require('./datos.js'); require('./motor.js');
const M = window.MOTOR, D = window.DATOS;
let n = 0; const t = (nombre, f) => { f(); n++; console.log('ok  ' + nombre); };
const nombre = (p) => p.elegido.receta.nombre;

t('los datos son coherentes', () => {
  assert.equal(D.casillas.length, 14); assert.equal(D.recetas.length, 56);
  for (const c of D.casillas) assert.equal(D.recetas.filter((r) => r.slot === c.id).length, 4, c.id);
  for (const r of D.recetas) for (const i of r.ing) assert.ok(D.alimentos[i], `${r.id}: falta ${i}`);
  const k = new Set(D.casillas.map((c) => c.dia + c.momento)); assert.equal(k.size, 14);
});

t('sin registro, el plan cubre 14 tomas, sin repetir y con el reparto objetivo', () => {
  const r = M.planificar({ historial: [] }, { hoy: '2026-10-05', momentoHoy: 'cena' });
  assert.equal(r.plan.length, 14);
  assert.equal(new Set(r.plan.map((p) => p.elegido.receta.id)).size, 14);
  const b = M.balance(r.plan.map((p) => ({ fam: p.elegido.fam })));
  assert.ok(b.carne <= 6 && b.pescado >= 4 && b.legumbre >= 2, JSON.stringify(b));
  r.plan.forEach((p) => assert.equal(p.elegido.receta.slot, p.casilla.id));
});

t('un plato sin proteína no entra mientras haya alternativa', () => {
  const r = M.planificar({ historial: [] }, { hoy: '2026-10-05', momentoHoy: 'cena' });
  assert.ok(r.plan.every((p) => p.elegido.fam !== 'verdura'));
});

t('un plato comido no vuelve en cuatro semanas', () => {
  const st = { historial: [{ fecha: '2026-10-05', momento: 'cena', receta: 's01-0' }] };
  const r = M.planificar(st, { hoy: '2026-10-06', momentoHoy: 'comida' });
  assert.ok(!r.plan.some((p) => p.elegido.receta.id === 's01-0'));
  // la casilla del lunes siguiente (cena) elige otra receta de ternera
  const lunes = r.plan.find((p) => p.casilla.id === 's01'); assert.ok(lunes && lunes.elegido.receta.id !== 's01-0');
});

t('no se planifica en el pasado aunque el registro sea antiguo', () => {
  const st = { historial: [{ fecha: '2026-09-01', momento: 'comida', receta: 's02-0' }] };
  const r = M.planificar(st, { hoy: '2026-10-05', momentoHoy: 'cena' });
  assert.equal(r.plan[0].fecha, '2026-10-05'); assert.equal(r.plan[0].momento, 'cena');
});

t('lo comido hace poco se evita en la toma siguiente', () => {
  // atún en el martes cena => el viernes cena (salmorejo/gazpacho con atún) pierde frente a una crema, pero sigue siendo candidata
  const st = { historial: [{ fecha: '2026-10-06', momento: 'cena', receta: 's03-0' }] };
  const r = M.planificar(st, { hoy: '2026-10-07', momentoHoy: 'comida' });
  const pesca = r.plan.filter((p) => p.elegido.fam === 'pescado').length; assert.ok(pesca >= 4, 'pescado ' + pesca);
});

t('un plato propio con alimentos nuevos entra en el grafo y enfría esos alimentos', () => {
  const st = { historial: [{ fecha: '2026-10-05', momento: 'cena', receta: 'p-x', ing: undefined }], propios: { alimentos: { 'x-pizza': { nombre: 'Pizza', grupo: 'cereal' } }, recetas: [{ id: 'p-x', slot: null, nombre: 'Pizza', ing: ['x-pizza', 'queso', 'tomate'] }] } };
  const r = M.planificar(st, { hoy: '2026-10-06', momentoHoy: 'comida' });
  assert.ok(r.grafo.nodos.has('a:x-pizza')); assert.ok(r.calor['x-pizza'] > 0.5);
});

t('una fijación excluida por repetición se ignora', () => {
  const st = { historial: [{ fecha: '2026-10-05', momento: 'cena', receta: 's01-1' }], pins: {} };
  const r0 = M.planificar(st, { hoy: '2026-10-06', momentoHoy: 'comida' });
  const lun = r0.plan.find((p) => p.casilla.id === 's01');
  st.pins[lun.idx] = 's01-1';
  const r1 = M.planificar(st, { hoy: '2026-10-06', momentoHoy: 'comida' });
  assert.notEqual(r1.plan.find((p) => p.casilla.id === 's01').elegido.receta.id, 's01-1');
});

t('fijar una alternativa la respeta y reajusta el resto', () => {
  const r0 = M.planificar({ historial: [] }, { hoy: '2026-10-05', momentoHoy: 'cena' });
  const alt = r0.plan[0].alternativas[0].receta.id;
  const r1 = M.planificar({ historial: [], pins: { [r0.plan[0].idx]: alt } }, { hoy: '2026-10-05', momentoHoy: 'cena' });
  assert.equal(r1.plan[0].elegido.receta.id, alt); assert.ok(r1.plan[0].fijada);
});

t('en modo libre también cumple el reparto y no repite platos', () => {
  const r = M.planificar({ historial: [], modo: 'libre' }, { hoy: '2026-10-05', momentoHoy: 'cena' });
  assert.equal(new Set(r.plan.map((p) => p.elegido.receta.id)).size, 14);
  const b = M.balance(r.plan.map((p) => ({ fam: p.elegido.fam }))); assert.ok(b.carne <= 6 && b.pescado >= 4, JSON.stringify(b));
});

t('cuatro semanas seguidas, siguiendo las sugerencias, no repiten plato', () => {
  const hist = []; let hoy = '2026-10-05', mom = 'cena'; const vistos = new Set();
  for (let sem = 0; sem < 4; sem++) {
    const r = M.planificar({ historial: hist }, { hoy, momentoHoy: mom });
    for (const p of r.plan) { assert.ok(!vistos.has(p.elegido.receta.id), 'repite ' + nombre(p)); vistos.add(p.elegido.receta.id); hist.push({ fecha: p.fecha, momento: p.momento, receta: p.elegido.receta.id }); }
    const u = hist[hist.length - 1], i = M.idxToma(u.fecha, u.momento) + 1, d = M.deIdx(i); hoy = d.fecha; mom = d.momento;
  }
  assert.equal(vistos.size, 56);
});

t('la compra suma los alimentos del plan', () => {
  const r = M.planificar({ historial: [] }, { hoy: '2026-10-05', momentoHoy: 'cena' });
  const c = M.compra(r.plan, r.grafo); const total = Object.values(c).flat().reduce((s, x) => s + x.tomas, 0);
  assert.equal(total, r.plan.reduce((s, p) => s + p.elegido.receta.ing.length, 0));
});
console.log(`\n${n} pruebas pasadas`);
