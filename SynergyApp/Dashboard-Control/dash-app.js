const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const mesesCortos = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const datosMensuales = [
  { ganancia:1200000, perdida:150000, gananciaPct:8,  perdidaPct:-3 },
  { ganancia:1350000, perdida:180000, gananciaPct:12, perdidaPct:-4 },
  { ganancia:1100000, perdida:220000, gananciaPct:-6, perdidaPct:-8 },
  { ganancia:1600000, perdida:140000, gananciaPct:18, perdidaPct:-2 },
  { ganancia:1750000, perdida:160000, gananciaPct:10, perdidaPct:-3 },
  { ganancia:1500000, perdida:250000, gananciaPct:-5, perdidaPct:-9 },
  { ganancia:2100000, perdida:190000, gananciaPct:20, perdidaPct:-5 },
  { ganancia:1900000, perdida:210000, gananciaPct:-4, perdidaPct:-6 },
  { ganancia:2000000, perdida:170000, gananciaPct:9,  perdidaPct:-4 },
  { ganancia:1850000, perdida:230000, gananciaPct:-3, perdidaPct:-7 },
  { ganancia:2200000, perdida:180000, gananciaPct:14, perdidaPct:-4 },
  { ganancia:2650000, perdida:200000, gananciaPct:22, perdidaPct:-5 },
];

const notasPorMes = {
  0: [ {fecha:'15/Ene/2026', hora:'10:00 AM', motivo:'Se hizo el primer pedido grande del año para un evento.'} ],
  2: [ {fecha:'22/Mar/2026', hora:'04:15 PM', motivo:'Aumentó el precio del empaque, subió el costo por unidad.'} ],
  5: [ {fecha:'09/Jun/2026', hora:'11:40 AM', motivo:'Se dañaron insumos por falla de refrigeración, pérdida no planeada.'} ],
  6: [
    {fecha:'20/Jul/2026', hora:'02:30 PM', motivo:'Se compró fresas adicionales fuera del presupuesto contemplado.'},
    {fecha:'28/Jul/2026', hora:'09:05 AM', motivo:'Cliente frecuente hizo un pedido triple para una fiesta.'}
  ],
  10:[ {fecha:'12/Nov/2026', hora:'06:20 PM', motivo:'Campaña de descuentos por Black Friday aumentó las ventas.'} ],
};

const colaboradores = [
  { nombre:'María Torres', rol:'Fundadora / Repostera', correo:'maria@dulceantojo.co', estado:'Activo' },
  { nombre:'Camilo Ruiz', rol:'Encargado de despachos', correo:'camilo@dulceantojo.co', estado:'Activo' },
  { nombre:'Laura Gómez', rol:'Redes sociales', correo:'laura@dulceantojo.co', estado:'Activo' },
  { nombre:'Andrés Pardo', rol:'Ventas y clientes', correo:'andres@dulceantojo.co', estado:'Inactivo' },
];

let mesSeleccionado = 0; 
let temaActual = 'auto';
let paletaActual = 'bosque';


function cargarDatosDelUsuario(){
  const params = new URLSearchParams(window.location.search);
  const nombre = params.get('nombre') || 'Mi cuenta';
  const negocio = params.get('negocio');
  const categoria = params.get('categoria');
  const correo = params.get('correo') || '';
  const tema = params.get('tema') || 'auto';
  const paleta = params.get('paleta') || 'bosque';

  if(negocio){
    document.getElementById('sidebar-biz').innerHTML = `${escapeHtml(negocio)}<br>${escapeHtml(categoria || '')}`;
    document.title = `${negocio} — Micuenta`;
    document.getElementById('config-negocio').value = negocio;
  }
  if(categoria) document.getElementById('config-categoria').value = categoria;
  if(params.get('nombre')){
    document.getElementById('view-sub').textContent = `Hola ${nombre}, aquí tienes el resumen del año y las novedades del mes.`;
  }

  const inicial = nombre.trim().split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase() || 'U';
  document.getElementById('profile-avatar').textContent = inicial;
  document.getElementById('profile-name').textContent = nombre;
  document.getElementById('profile-menu-name').textContent = nombre;
  document.getElementById('profile-menu-email').textContent = correo || 'Sin correo registrado';

  aplicarTema(tema);
  aplicarPaleta(paleta);
}

function calcularTemaVisible(tema){
  if(tema === 'auto'){
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return tema;
}

function aplicarTema(tema){
  temaActual = tema;
  document.documentElement.setAttribute('data-theme', calcularTemaVisible(tema));
  document.querySelectorAll('.theme-opt').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.theme === tema);
  });
}

function aplicarPaleta(paleta){
  paletaActual = paleta;
  document.documentElement.setAttribute('data-palette', paleta);
  document.querySelectorAll('.palette-opt').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.palette === paleta);
  });
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', ()=>{
  if(temaActual === 'auto') aplicarTema('auto');
});

document.querySelectorAll('.theme-opt').forEach(btn=>{
  btn.addEventListener('click', ()=> aplicarTema(btn.dataset.theme));
});
document.querySelectorAll('.palette-opt').forEach(btn=>{
  btn.addEventListener('click', ()=> aplicarPaleta(btn.dataset.palette));
});


const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const sidebarScrim = document.getElementById('sidebar-scrim');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');

function esMovil(){ return window.matchMedia('(max-width: 880px)').matches; }

sidebarToggle.addEventListener('click', ()=>{
  sidebar.classList.toggle('collapsed');
});
mobileMenuBtn.addEventListener('click', ()=>{
  sidebar.classList.add('open');
  sidebarScrim.classList.add('show');
});
sidebarScrim.addEventListener('click', ()=>{
  sidebar.classList.remove('open');
  sidebarScrim.classList.remove('show');
});

const viewTitles = {
  inicio:['Inicio','Resumen del año y novedades del mes.'],
  inventario:['Inventario','Stock de tus productos terminados.'],
  ventas:['Análisis de Ventas','Cómo se comportan tus ventas.'],
  ganancias:['Ganancias','Rentabilidad general del negocio.'],
  grupo:['Grupo','Colaboradores de tu emprendimiento.'],
  configuracion:['Configuración','Ajustes de tu cuenta y negocio.'],
};

document.querySelectorAll('.nav-item[data-view]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const view = btn.dataset.view;
    document.querySelectorAll('.nav-item[data-view]').forEach(b=> b.classList.toggle('active', b===btn));
    document.querySelectorAll('.view').forEach(v=> v.classList.toggle('active', v.id === `view-${view}`));
    document.getElementById('view-title').textContent = viewTitles[view][0];
    document.getElementById('view-sub').textContent = viewTitles[view][1];
    if(esMovil()){ sidebar.classList.remove('open'); sidebarScrim.classList.remove('show'); }
  });
});


const profileChip = document.getElementById('profile-chip');
const profileMenu = document.getElementById('profile-menu');

profileChip.addEventListener('click', (e)=>{
  e.stopPropagation();
  const abierto = profileMenu.classList.toggle('open');
  profileChip.setAttribute('aria-expanded', abierto ? 'true' : 'false');
});

document.addEventListener('click', ()=>{
  profileMenu.classList.remove('open');
  profileChip.setAttribute('aria-expanded', 'false');
});

document.getElementById('btn-logout').addEventListener('click', ()=>{
  const params = new URLSearchParams(window.location.search);
  const salida = new URLSearchParams({
    correo: params.get('correo') || '',
    nombre: params.get('nombre') || '',
    negocio: params.get('negocio') || '',
    categoria: params.get('categoria') || '',
    tema: temaActual,
    paleta: paletaActual,
  });
  window.location.href = `../Index.html?${salida.toString()}`;
});


function money(n){ return '$' + Math.round(n).toLocaleString('es-CO'); }
function escapeHtml(str){ const d=document.createElement('div'); d.textContent=str; return d.innerHTML; }


const ctx = document.getElementById('chart-ganancias').getContext('2d');

function coloresGanancia(){
  return datosMensuales.map((_,i)=> i===mesSeleccionado ? '#1B4332' : '#2D8659');
}
function coloresPerdida(){
  return datosMensuales.map((_,i)=> i===mesSeleccionado ? '#8C3B4A' : '#C97F8D');
}

const chart = new Chart(ctx, {
  type:'bar',
  data:{
    labels: mesesCortos,
    datasets:[
      {
        label:'Ganancias',
        data: datosMensuales.map(m=>m.ganancia),
        backgroundColor: coloresGanancia(),
        borderRadius:6,
        maxBarThickness:22,
      },
      {
        label:'Pérdidas',
        data: datosMensuales.map(m=>m.perdida),
        backgroundColor: coloresPerdida(),
        borderRadius:6,
        maxBarThickness:22,
      }
    ]
  },
  options:{
    responsive:true,
    maintainAspectRatio:false,
    animation:{ duration:500, easing:'easeOutQuart' },
    interaction:{ mode:'index', intersect:false },
    plugins:{
      legend:{
        position:'top', align:'end',
        labels:{ usePointStyle:true, pointStyle:'circle', font:{ family:"'Plus Jakarta Sans'", size:12 }, color:'#4B5D51' }
      },
      tooltip:{
        backgroundColor:'#152318', padding:10, cornerRadius:8,
        titleFont:{ family:"'Plus Jakarta Sans'", weight:'700' },
        bodyFont:{ family:"'JetBrains Mono'" },
        callbacks:{ label: (c)=> `${c.dataset.label}: ${money(c.raw)}` }
      }
    },
    scales:{
      x:{ grid:{ display:false }, ticks:{ font:{ family:"'Plus Jakarta Sans'", size:12 }, color:'#4B5D51' } },
      y:{
        grid:{ color:'#EAEFE5' },
        ticks:{ font:{ family:"'JetBrains Mono'", size:11 }, color:'#4B5D51', callback:(v)=> '$'+ (v/1000000).toFixed(1)+'M' }
      }
    },
    onClick:(evt, elements)=>{
      if(elements.length){
        seleccionarMes(elements[0].index);
      }
    },
    onHover:(evt, elements)=>{
      evt.native.target.style.cursor = elements.length ? 'pointer' : 'default';
    }
  }
});

function actualizarColoresGrafica(){
  chart.data.datasets[0].backgroundColor = coloresGanancia();
  chart.data.datasets[1].backgroundColor = coloresPerdida();
  chart.update();
}

function seleccionarMes(index){
  mesSeleccionado = index;
  actualizarColoresGrafica();
  renderDetalleMes();
  renderNotas();
  document.getElementById('selected-month-hint').textContent = `Mes seleccionado: ${meses[index]}`;
}

function renderDetalleMes(){
  const d = datosMensuales[mesSeleccionado];
  document.getElementById('det-ganancia').textContent = money(d.ganancia);
  document.getElementById('det-perdida').textContent = money(d.perdida);
  document.getElementById('det-balance').textContent = money(d.ganancia - d.perdida);

  const gp = document.getElementById('det-ganancia-pct');
  gp.textContent = (d.gananciaPct>=0?'+':'') + d.gananciaPct + '%';
  gp.className = 'pct-badge ' + (d.gananciaPct>=0 ? 'up':'down');

  const pp = document.getElementById('det-perdida-pct');
  pp.textContent = (d.perdidaPct>=0?'+':'') + d.perdidaPct + '%';
  pp.className = 'pct-badge down';

  document.getElementById('notes-title').textContent = `Bitácora — ${meses[mesSeleccionado]}`;
}


function renderNotas(){
  const notas = notasPorMes[mesSeleccionado] || [];
  const list = document.getElementById('notes-list');
  const empty = document.getElementById('notes-empty');
  empty.classList.toggle('hidden', notas.length>0);

  list.innerHTML = notas.slice().reverse().map(n=>`
    <div class="note-card">
      <div class="note-dot"></div>
      <div>
        <div class="note-meta"><span>Fecha: ${escapeHtml(n.fecha)}</span><span>Hora: ${escapeHtml(n.hora)}</span></div>
        <div class="note-motivo">${escapeHtml(n.motivo)}</div>
      </div>
    </div>`).join('');
}

document.getElementById('note-form').addEventListener('submit', function(e){
  e.preventDefault();
  const input = document.getElementById('note-motivo');
  const motivo = input.value.trim();
  if(!motivo) return;

  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-CO', { day:'2-digit', month:'short', year:'numeric' }).replace('.', '');
  const hora = ahora.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', hour12:true });

  if(!notasPorMes[mesSeleccionado]) notasPorMes[mesSeleccionado] = [];
  notasPorMes[mesSeleccionado].push({ fecha, hora, motivo });

  input.value = '';
  renderNotas();
});


const avatarColores = ['#1B4332','#2D6A4F','#C67F1F','#B5566B','#2D8659'];
function iniciales(nombre){
  return nombre.split(' ').map(p=>p[0]).slice(0,2).join('').toUpperCase();
}
function renderColaboradores(){
  const grid = document.getElementById('collab-grid');
  grid.innerHTML = colaboradores.map((c,i)=>`
    <div class="card collab-card">
      <div class="avatar" style="background:${avatarColores[i % avatarColores.length]}">${iniciales(c.nombre)}</div>
      <div>
        <div class="collab-name">${escapeHtml(c.nombre)}</div>
        <div class="collab-role">${escapeHtml(c.rol)}</div>
        <div class="collab-email">${escapeHtml(c.correo)}</div>
        <span class="status-badge ${c.estado==='Activo'?'activo':'inactivo'}">${c.estado}</span>
      </div>
    </div>`).join('');
}

cargarDatosDelUsuario();
renderDetalleMes();
renderNotas();
renderColaboradores();