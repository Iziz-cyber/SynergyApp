/* ==========================================================================
   ESTADO DE LA APLICACIÓN
   Todo se guarda en memoria (variables JS) durante la sesión. En una versión
   real esto se conectaría a una base de datos / API en el backend.
   ========================================================================== */
const state = {
  user: null,          // { nombre, correo, password, emprendimiento, categoria }
  insumos: [],         // { id, nombre, costo, unidad }
  productos: [],       // { id, nombre, precio, usos:[{insumoId, cantidad}], stock }
  nextId: 1,
};

// Insumos que se están agregando al producto que se está armando ahora mismo
let usosTemp = [];
let editingProductId = null; // id del producto en edición (null = creando uno nuevo)

const iconsSvg = {
  inventario:'<svg class="icon" viewBox="0 0 24 24"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>',
  insumos:'<svg class="icon" viewBox="0 0 24 24"><path d="M9 3h6M10 3v5.2L5.5 17a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 8.2V3"/></svg>',
  finanzas:'<svg class="icon" viewBox="0 0 24 24"><path d="M4 20V10M11 20V4M18 20v-7"/></svg>',
};

/* ==========================================================================
   1. ONBOARDING
   ========================================================================== */
const tourSteps = [
  {
    icon:'<svg class="icon" viewBox="0 0 24 24" style="stroke:#fff"><path d="M12 3 4 8v13h16V8Z"/><path d="M9 21v-6h6v6"/></svg>',
    bg:'var(--primary)',
    title:'Bienvenido/a a Micuenta',
    text:'En pocos minutos vas a poder controlar tu inventario, tus costos y saber exactamente cuánto ganas por cada producto que vendes. Te mostramos rápido las 3 secciones más importantes.'
  },
  {
    icon: iconsSvg.inventario.replace('class="icon"','class="icon" style="stroke:#fff"'),
    bg:'var(--primary-light)',
    title:'Inventario',
    text:'Aquí gestionas el stock de tus productos terminados: cuántas unidades tienes listas para vender en este momento.'
  },
  {
    icon: iconsSvg.insumos.replace('class="icon"','class="icon" style="stroke:#fff"'),
    bg:'var(--accent-dark)',
    title:'Materias primas / Materiales',
    text:'Aquí registras los insumos que compras y sus precios, por ejemplo tus ingredientes o materiales, para saber cuánto te cuesta producir.'
  },
  {
    icon: iconsSvg.finanzas.replace('class="icon"','class="icon" style="stroke:#fff"'),
    bg:'var(--profit)',
    title:'Finanzas y ganancias',
    text:'Aquí analizas tus ingresos, costos y margen de rentabilidad, producto por producto, para tomar mejores decisiones.'
  },
];
let tourIndex = 0;

function renderTourStep(){
  const step = tourSteps[tourIndex];
  document.getElementById('tour-icon-wrap').style.background = step.bg;
  document.getElementById('tour-icon-wrap').innerHTML = step.icon;
  document.getElementById('tour-title').textContent = step.title;
  document.getElementById('tour-text').textContent = step.text;
  document.getElementById('tour-dots').innerHTML = tourSteps.map((_,i)=>
    `<span class="${i===tourIndex?'active':''}"></span>`).join('');
  document.getElementById('tour-next').textContent = tourIndex === tourSteps.length-1 ? 'Comenzar' : 'Siguiente';
}
document.getElementById('tour-next').addEventListener('click', ()=>{
  if(tourIndex < tourSteps.length-1){ tourIndex++; renderTourStep(); }
  else finishOnboarding();
});
document.getElementById('tour-skip').addEventListener('click', finishOnboarding);

function finishOnboarding(){
  document.getElementById('onboarding-overlay').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
}
renderTourStep();

/* ==========================================================================
   2. REGISTRO / LOGIN (simulado)
   ========================================================================== */
function showAuthCard(name){
  ['registro-card','login-card','loading-card'].forEach(id=>{
    document.getElementById(id).classList.toggle('hidden', id!==name);
  });
}
document.getElementById('go-to-login').addEventListener('click', ()=> showAuthCard('login-card'));
document.getElementById('go-to-registro').addEventListener('click', ()=> showAuthCard('registro-card'));

// Utilidad genérica de validación de campos con mensajes en línea
function validate(rules){
  let ok = true;
  rules.forEach(({field, valid})=>{
    const el = document.querySelector(`[data-field="${field}"]`);
    if(!el) return;
    if(valid){ el.classList.remove('invalid'); }
    else { el.classList.add('invalid'); ok = false; }
  });
  return ok;
}

document.getElementById('registro-form').addEventListener('submit', function(e){
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value.trim();
  const correo = document.getElementById('reg-correo').value.trim();
  const password = document.getElementById('reg-password').value;
  const emprendimiento = document.getElementById('reg-emprendimiento').value.trim();
  const categoria = document.getElementById('reg-categoria').value;

  const ok = validate([
    {field:'nombre', valid: nombre.length>0},
    {field:'correo', valid: /^\S+@\S+\.\S+$/.test(correo)},
    {field:'password', valid: password.length>=6},
    {field:'emprendimiento', valid: emprendimiento.length>0},
    {field:'categoria', valid: categoria.length>0},
  ]);
  if(!ok) return;

  // Guardamos el "usuario" en memoria — simula el registro en backend
  state.user = { nombre, correo, password, emprendimiento, categoria };

  // Pre-llenamos el login para simular la transición natural registro -> login
  document.getElementById('log-correo').value = correo;
  showAuthCard('login-card');
  showToast('Cuenta creada. Ahora inicia sesión para continuar.');
});

document.getElementById('login-form').addEventListener('submit', function(e){
  e.preventDefault();
  const correo = document.getElementById('log-correo').value.trim();
  const password = document.getElementById('log-password').value;

  const correoOk = state.user && correo === state.user.correo;
  const passOk = state.user && password === state.user.password;

  const ok = validate([
    {field:'correo', valid: correoOk},
    {field:'password', valid: passOk},
  ]);
  if(!ok) return;

  // Simulamos el proceso de inicio de sesión con una breve carga
  showAuthCard('loading-card');
  setTimeout(()=>{
    document.getElementById('auth-screen').classList.add('hidden');
    launchDashboard();
  }, 900);
});

function showToast(msg){
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> t.classList.remove('show'), 2600);
}

/* ==========================================================================
   3. DASHBOARD — navegación y datos del negocio
   ========================================================================== */
function launchDashboard(){
  document.getElementById('app').classList.add('active');
  document.getElementById('sidebar-biz-name').textContent = state.user.emprendimiento;
  document.getElementById('sidebar-biz-tag').textContent = state.user.categoria;
  renderAll();
}

const sectionTitles = {
  resumen:['Resumen','Así va tu negocio hoy.'],
  inventario:['Inventario','Controla el stock de tus productos terminados.'],
  insumos:['Materias primas','Tus insumos y lo que cuestan.'],
  productos:['Productos y ganancias','Arma productos y calcula su rentabilidad.'],
  finanzas:['Finanzas','El panorama completo de tu rentabilidad.'],
};

document.querySelectorAll('.nav-link[data-section]').forEach(btn=>{
  btn.addEventListener('click', ()=> goToSection(btn.dataset.section));
});
document.querySelectorAll('[data-goto]').forEach(btn=>{
  btn.addEventListener('click', ()=> goToSection(btn.dataset.goto));
});

function goToSection(name){
  document.querySelectorAll('.section').forEach(s=> s.classList.toggle('active', s.id===`section-${name}`));
  document.querySelectorAll('.nav-link[data-section]').forEach(b=> b.classList.toggle('active', b.dataset.section===name));
  document.getElementById('page-title').textContent = sectionTitles[name][0];
  document.getElementById('page-sub').textContent = sectionTitles[name][1];
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-scrim').classList.remove('show');
}

// Menú hamburguesa en móvil
document.getElementById('menu-toggle').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-scrim').classList.add('show');
});
document.getElementById('sidebar-scrim').addEventListener('click', ()=>{
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-scrim').classList.remove('show');
});

document.getElementById('btn-logout').addEventListener('click', ()=>{
  document.getElementById('app').classList.remove('active');
  document.getElementById('login-password') // no-op, kept for clarity
  document.getElementById('log-password').value = '';
  document.getElementById('auth-screen').classList.remove('hidden');
  showAuthCard('login-card');
});

/* ==========================================================================
   4. MÓDULO DE MATERIAS PRIMAS (insumos)
   ========================================================================== */
document.getElementById('insumo-form').addEventListener('submit', function(e){
  e.preventDefault();
  const nombre = document.getElementById('insumo-nombre').value.trim();
  const costo = parseFloat(document.getElementById('insumo-costo').value);
  const unidad = document.getElementById('insumo-unidad').value.trim();

  const ok = validate([
    {field:'nombre', valid: nombre.length>0},
    {field:'costo', valid: !isNaN(costo) && costo>=0},
    {field:'unidad', valid: unidad.length>0},
  ]);
  if(!ok) return;

  state.insumos.push({ id: state.nextId++, nombre, costo, unidad });
  this.reset();
  renderAll();
  showToast(`"${nombre}" agregado a materias primas.`);
});

function deleteInsumo(id){
  const enUso = state.productos.some(p => p.usos.some(u=>u.insumoId===id));
  if(enUso){
    showToast('No puedes eliminar: está siendo usado en un producto.');
    return;
  }
  state.insumos = state.insumos.filter(i=>i.id!==id);
  renderAll();
}

function renderInsumos(){
  const list = document.getElementById('insumos-list');
  const empty = document.getElementById('insumos-empty');
  empty.classList.toggle('hidden', state.insumos.length>0);
  list.innerHTML = state.insumos.map(i => `
    <div class="list-row">
      <div class="li-main">
        <span class="li-title">${escapeHtml(i.nombre)}</span>
        <span class="li-sub">${escapeHtml(i.unidad)}</span>
      </div>
      <div class="li-actions">
        <span class="badge cost">${money(i.costo)}</span>
        <button class="icon-btn" onclick="deleteInsumo(${i.id})" aria-label="Eliminar insumo">
          <svg class="icon" viewBox="0 0 24 24" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>
    </div>`).join('');

  // refresca el selector del formulario de productos
  const picker = document.getElementById('picker-insumo');
  const current = picker.value;
  picker.innerHTML = '<option value="">Selecciona un insumo…</option>' +
    state.insumos.map(i=>`<option value="${i.id}">${escapeHtml(i.nombre)} (${money(i.costo)} / ${escapeHtml(i.unidad)})</option>`).join('');
  picker.value = current;
}

/* ==========================================================================
   5. MÓDULO DE PRODUCTOS + CÁLCULO DINÁMICO DE GANANCIAS
   ========================================================================== */
document.getElementById('btn-add-insumo-uso').addEventListener('click', ()=>{
  const insumoId = parseInt(document.getElementById('picker-insumo').value);
  const cantidad = parseFloat(document.getElementById('picker-cantidad').value);
  if(!insumoId || isNaN(cantidad) || cantidad<=0){
    showToast('Elige un insumo y una cantidad válida.');
    return;
  }
  const existente = usosTemp.find(u=>u.insumoId===insumoId);
  if(existente){ existente.cantidad += cantidad; }
  else { usosTemp.push({ insumoId, cantidad }); }
  document.getElementById('picker-cantidad').value = 1;
  renderUsosTemp();
});

function quitarUso(insumoId){
  usosTemp = usosTemp.filter(u=>u.insumoId!==insumoId);
  renderUsosTemp();
}

function renderUsosTemp(){
  const list = document.getElementById('used-list');
  const empty = document.getElementById('used-empty');
  empty.classList.toggle('hidden', usosTemp.length>0);
  list.innerHTML = usosTemp.map(u=>{
    const insumo = state.insumos.find(i=>i.id===u.insumoId);
    if(!insumo) return '';
    const subtotal = insumo.costo * u.cantidad;
    return `<div class="used-row">
      <span>${escapeHtml(insumo.nombre)} <span class="um">× ${u.cantidad}</span></span>
      <span style="display:flex;align-items:center;gap:10px;">
        <span class="mono">${money(subtotal)}</span>
        <button class="icon-btn" onclick="quitarUso(${insumo.id})" aria-label="Quitar">
          <svg class="icon" viewBox="0 0 24 24" width="14" height="14"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </span>
    </div>`;
  }).join('');
  updateReceipt();
}

// Recalcula el recibo de ganancia en vivo cada vez que algo cambia
function updateReceipt(){
  const nombre = document.getElementById('producto-nombre').value.trim() || 'Nuevo producto';
  const precio = parseFloat(document.getElementById('producto-precio').value) || 0;
  const costoTotal = usosTemp.reduce((sum,u)=>{
    const insumo = state.insumos.find(i=>i.id===u.insumoId);
    return sum + (insumo ? insumo.costo * u.cantidad : 0);
  },0);
  const ganancia = precio - costoTotal;
  const margen = precio>0 ? (ganancia/precio)*100 : 0;

  document.getElementById('receipt-nombre').textContent = nombre;
  document.getElementById('receipt-costo').textContent = money(costoTotal);
  document.getElementById('receipt-precio').textContent = money(precio);
  document.getElementById('receipt-ganancia').textContent = money(ganancia);

  const insumosBox = document.getElementById('receipt-insumos');
  if(usosTemp.length===0){
    insumosBox.innerHTML = '<div style="color:var(--ink-soft); font-size:0.85rem; text-align:center;">— sin insumos —</div>';
  } else {
    insumosBox.innerHTML = usosTemp.map(u=>{
      const insumo = state.insumos.find(i=>i.id===u.insumoId);
      if(!insumo) return '';
      return `<div class="receipt-line"><span>${escapeHtml(insumo.nombre)} × ${u.cantidad}</span><span>${money(insumo.costo*u.cantidad)}</span></div>`;
    }).join('');
  }

  const margenEl = document.getElementById('receipt-margen');
  margenEl.textContent = `Margen: ${margen.toFixed(1)}%`;
  margenEl.className = 'receipt-margin ' + marginClass(margen);

  // Habilita "Guardar" solo si hay datos mínimos válidos
  document.getElementById('btn-guardar-producto').disabled = !(nombre.length>0 && precio>0 && usosTemp.length>0 && document.getElementById('producto-nombre').value.trim().length>0);
}
document.getElementById('producto-nombre').addEventListener('input', updateReceipt);
document.getElementById('producto-precio').addEventListener('input', updateReceipt);

function marginClass(margen){
  if(margen >= 40) return 'good';
  if(margen >= 15) return 'mid';
  return 'low';
}
function marginBadgeClass(margen){
  if(margen >= 40) return 'margin-good';
  if(margen >= 15) return 'margin-mid';
  return 'margin-low';
}

document.getElementById('producto-form').addEventListener('submit', function(e){
  e.preventDefault();
  const nombre = document.getElementById('producto-nombre').value.trim();
  const precio = parseFloat(document.getElementById('producto-precio').value);

  const ok = validate([
    {field:'nombre', valid: nombre.length>0},
    {field:'precio', valid: !isNaN(precio) && precio>0},
  ]);
  if(!ok || usosTemp.length===0) {
    if(usosTemp.length===0) showToast('Agrega al menos un insumo al producto.');
    return;
  }

  if(editingProductId){
    const p = state.productos.find(p=>p.id===editingProductId);
    p.nombre = nombre; p.precio = precio; p.usos = [...usosTemp];
    showToast(`"${nombre}" actualizado.`);
  } else {
    state.productos.push({ id: state.nextId++, nombre, precio, usos:[...usosTemp], stock:0 });
    showToast(`"${nombre}" creado con éxito.`);
  }

  cancelarEdicionProducto();
  renderAll();
});

function cancelarEdicionProducto(){
  editingProductId = null;
  usosTemp = [];
  document.getElementById('producto-form').reset();
  document.getElementById('btn-guardar-producto').textContent = 'Guardar producto';
  document.getElementById('btn-cancelar-producto').style.display = 'none';
  renderUsosTemp();
}
document.getElementById('btn-cancelar-producto').addEventListener('click', cancelarEdicionProducto);

function editarProducto(id){
  const p = state.productos.find(p=>p.id===id);
  if(!p) return;
  editingProductId = id;
  usosTemp = p.usos.map(u=>({...u}));
  document.getElementById('producto-nombre').value = p.nombre;
  document.getElementById('producto-precio').value = p.precio;
  document.getElementById('btn-guardar-producto').textContent = 'Guardar cambios';
  document.getElementById('btn-cancelar-producto').style.display = 'inline-block';
  renderUsosTemp();
  goToSection('productos');
  window.scrollTo({top:0, behavior:'smooth'});
}

function eliminarProducto(id){
  state.productos = state.productos.filter(p=>p.id!==id);
  renderAll();
}

function calcularCosto(producto){
  return producto.usos.reduce((sum,u)=>{
    const insumo = state.insumos.find(i=>i.id===u.insumoId);
    return sum + (insumo ? insumo.costo*u.cantidad : 0);
  },0);
}

function renderProductos(){
  const list = document.getElementById('productos-list');
  const empty = document.getElementById('productos-empty');
  empty.classList.toggle('hidden', state.productos.length>0);
  list.innerHTML = state.productos.map(p=>{
    const costo = calcularCosto(p);
    const ganancia = p.precio - costo;
    const margen = p.precio>0 ? (ganancia/p.precio)*100 : 0;
    return `<div class="list-row">
      <div class="li-main">
        <span class="li-title">${escapeHtml(p.nombre)}</span>
        <span class="li-sub">Costo ${money(costo)} · Venta ${money(p.precio)} · Stock: ${p.stock}</span>
      </div>
      <div class="li-actions">
        <span class="badge ${marginBadgeClass(margen)}">${margen.toFixed(0)}%</span>
        <button class="icon-btn edit" onclick="editarProducto(${p.id})" aria-label="Editar">
          <svg class="icon" viewBox="0 0 24 24" width="16" height="16"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
        </button>
        <button class="icon-btn" onclick="eliminarProducto(${p.id})" aria-label="Eliminar">
          <svg class="icon" viewBox="0 0 24 24" width="16" height="16"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

/* ==========================================================================
   6. MÓDULO DE INVENTARIO (stock de productos terminados)
   ========================================================================== */
function cambiarStock(id, delta){
  const p = state.productos.find(p=>p.id===id);
  if(!p) return;
  p.stock = Math.max(0, p.stock + delta);
  renderAll();
}

function renderInventario(){
  const list = document.getElementById('inventario-list');
  const empty = document.getElementById('inventario-empty');
  empty.classList.toggle('hidden', state.productos.length>0);
  list.innerHTML = state.productos.map(p=>{
    const costo = calcularCosto(p);
    return `<div class="list-row">
      <div class="li-main">
        <span class="li-title">${escapeHtml(p.nombre)}</span>
        <span class="li-sub">Valor en inventario: ${money(costo*p.stock)}</span>
      </div>
      <div class="li-actions">
        <button class="icon-btn edit" onclick="cambiarStock(${p.id}, -1)" aria-label="Restar unidad">
          <svg class="icon" viewBox="0 0 24 24" width="16" height="16"><path d="M5 12h14"/></svg>
        </button>
        <span class="badge profit mono" style="min-width:44px; text-align:center;">${p.stock}</span>
        <button class="icon-btn edit" onclick="cambiarStock(${p.id}, 1)" aria-label="Sumar unidad">
          <svg class="icon" viewBox="0 0 24 24" width="16" height="16"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>`;
  }).join('');
}

/* ==========================================================================
   7. MÓDULO DE FINANZAS (vista agregada de rentabilidad)
   ========================================================================== */
function renderFinanzas(){
  const empty = document.getElementById('finanzas-empty');
  const list = document.getElementById('finanzas-list');
  empty.classList.toggle('hidden', state.productos.length>0);

  let ingresos = 0, costos = 0, margenSum = 0;

  const rows = state.productos.map(p=>{
    const costoUnit = calcularCosto(p);
    const gananciaUnit = p.precio - costoUnit;
    const margen = p.precio>0 ? (gananciaUnit/p.precio)*100 : 0;
    ingresos += p.precio * p.stock;
    costos += costoUnit * p.stock;
    margenSum += margen;
    return { nombre:p.nombre, costoUnit, precio:p.precio, gananciaUnit, margen };
  });

  list.innerHTML = rows.map(r=>`
    <div class="list-row" style="flex-direction:column; align-items:stretch; gap:8px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="li-title">${escapeHtml(r.nombre)}</span>
        <span class="badge ${marginBadgeClass(r.margen)}">${r.margen.toFixed(0)}% margen</span>
      </div>
      <div class="li-sub mono">Costo ${money(r.costoUnit)} · Venta ${money(r.precio)} · Ganancia por unidad ${money(r.gananciaUnit)}</div>
      <div class="margin-bar-track"><div class="margin-bar-fill" style="width:${Math.max(0,Math.min(100,r.margen))}%; background:${r.margen>=40?'var(--profit)':(r.margen>=15?'var(--accent)':'var(--cost)')}"></div></div>
    </div>`).join('');

  const margenProm = rows.length ? (margenSum/rows.length) : 0;
  document.getElementById('fin-ingresos').textContent = money(ingresos);
  document.getElementById('fin-costos').textContent = money(costos);
  document.getElementById('fin-ganancia').textContent = money(ingresos-costos);
  document.getElementById('fin-margen-prom').textContent = margenProm.toFixed(1)+'%';

  // Resumen general (sección Resumen)
  document.getElementById('stat-insumos').textContent = state.insumos.length;
  document.getElementById('stat-productos').textContent = state.productos.length;
  document.getElementById('stat-margen').textContent = margenProm.toFixed(1)+'%';
  document.getElementById('resumen-empty').classList.toggle('hidden', state.productos.length>0 || state.insumos.length>0);
}

/* ==========================================================================
   UTILIDADES
   ========================================================================== */
function money(n){
  n = isNaN(n) ? 0 : n;
  return '$' + Math.round(n).toLocaleString('es-CO');
}
function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
function renderAll(){
  renderInsumos();
  renderProductos();
  renderInventario();
  renderFinanzas();
  updateReceipt();
}