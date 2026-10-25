const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const paints = [
  { name: 'TORCH RED', color: '#d91f2b', light: '#ff8581' },
  { name: 'VOLT YELLOW', color: '#d7a925', light: '#ffe47a' },
  { name: 'ARCTIC WHITE', color: '#bfc9ca', light: '#ffffff' },
  { name: 'MIDNIGHT BLUE', color: '#164c81', light: '#84c6ff' },
  { name: 'ACID LIME', color: '#739a28', light: '#d5fb78' },
  { name: 'GRAPHITE', color: '#55585b', light: '#c4c8cb' },
  { name: 'AMETHYST', color: '#702f79', light: '#ec9cff' },
];
const wheelTypes = { five: 'FORGED / 5-SPOKE', mesh: 'RACE / MESH', disc: 'AERO / DISC' };
const wheelPrices = { five: 0, mesh: 2400, disc: 1800 };
const views = ['side', 'front', 'rear'];
const viewAngles = { side: 0, front: -13, rear: 13 };
const state = { paint: 0, finish: 'gloss', wheel: 'five', glow: true, light: '#ee4843', stance: 72, view: 'side' };
const bodyPaint = $('#bodyPaint');
let toastTimer;

paints.forEach((paint, i) => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = `swatch${i === state.paint ? ' selected' : ''}`;
  button.style.background = `linear-gradient(135deg, ${paint.light}, ${paint.color} 48%, #17191c)`;
  button.title = paint.name; button.setAttribute('aria-label', `${paint.name} paint`);
  button.addEventListener('click', () => { state.paint = i; updatePaint(); });
  $('#swatches').append(button);
});

function updatePaint() {
  const p = paints[state.paint];
  window.dispatchEvent(new CustomEvent('atelier:paint', { detail: { color: p.color, finish: state.finish } }));
  const upper = p.light;
  bodyPaint.children[0].setAttribute('stop-color', upper);
  bodyPaint.children[1].setAttribute('stop-color', p.color);
  bodyPaint.children[2].setAttribute('stop-color', shade(p.color, -.38));
  bodyPaint.children[3].setAttribute('stop-color', shade(p.color, -.68));
  bodyPaint.children[4].setAttribute('stop-color', p.color);
  bodyPaint.children[5].setAttribute('stop-color', shade(p.color, -.78));
  const upperGradient = $('#bodyUpper');
  upperGradient.children[0].setAttribute('stop-color', p.light);
  upperGradient.children[1].setAttribute('stop-color', p.color);
  upperGradient.children[2].setAttribute('stop-color', shade(p.color, -.5));
  upperGradient.children[3].setAttribute('stop-color', shade(p.color, -.76));
  $('#paintName').textContent = p.name;
  $$('.swatch').forEach((el, i) => el.classList.toggle('selected', i === state.paint));
  updateFinish();
}
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  return `#${[n >> 16, n >> 8 & 255, n & 255].map(v => Math.round(Math.max(0, Math.min(255, v * (1 + amount)))).toString(16).padStart(2, '0')).join('')}`;
}
function updateFinish() {
  const p = paints[state.paint];
  window.dispatchEvent(new CustomEvent('atelier:paint', { detail: { color: p.color, finish: state.finish } }));
  const gloss = state.finish === 'gloss';
  const metallic = state.finish === 'metallic';
  bodyPaint.children[0].setAttribute('stop-color', metallic ? '#e8e5d5' : gloss ? p.light : shade(p.light, -.18));
  bodyPaint.children[0].setAttribute('stop-opacity', state.finish === 'satin' ? '.65' : '1');
  bodyPaint.children[4].setAttribute('stop-color', metallic ? p.light : p.color);
  bodyPaint.children[4].setAttribute('stop-opacity', metallic ? '.86' : '1');
  $('#finishReadout').textContent = `${p.name} / ${state.finish.toUpperCase()}`;
}
function updateLight() {
  window.dispatchEvent(new CustomEvent('atelier:glow', { detail: { enabled: state.glow, color: state.light } }));
  $('#stage').style.setProperty('--glow-color', state.light);
  $('.stage-glow').style.background = state.light;
  $('.stage-glow').style.opacity = state.glow ? '.11' : '0';
  const carArt = $('#carArt');
  const floor = $('ellipse[fill="url(#floor)"]', carArt);
  floor.setAttribute('fill', state.glow ? state.light : 'url(#floor)');
  floor.setAttribute('opacity', state.glow ? '.2' : '.1');
  $('#lightLabel').textContent = ({ '#ee4843': 'EMBER RED', '#4389ff': 'ION BLUE', '#b047ff': 'ULTRAVIOLET', '#54e3bd': 'TURBO MINT' })[state.light] || 'CUSTOM';
  $('#glowToggle').classList.toggle('on', state.glow);
  $('#glowToggle').setAttribute('aria-checked', String(state.glow));
}
function updatePrice() {
  const base = 84900 + wheelPrices[state.wheel] + (state.finish === 'metallic' ? 1600 : state.finish === 'satin' ? 900 : 0) + (state.glow ? 750 : 0) + (state.paint ? 450 : 0);
  $('#buildPrice').textContent = `$ ${base.toLocaleString('en-US')}`;
}
function updateView() {
  window.dispatchEvent(new CustomEvent('atelier:view', { detail: { view: state.view } }));
  const index = views.indexOf(state.view);
  $$('.view-pill').forEach(b => b.classList.toggle('active', b.dataset.view === state.view));
  $('#viewCount').textContent = `0${index + 1}`;
}
function changeView(direction) { state.view = views[(views.indexOf(state.view) + direction + views.length) % views.length]; updateView(); }
function notify(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

$$('[data-finish]').forEach(button => button.addEventListener('click', () => {
  state.finish = button.dataset.finish;
  $$('[data-finish]').forEach(b => b.classList.toggle('selected', b === button));
  updateFinish(); updatePrice();
}));
$$('[data-wheel]').forEach(button => button.addEventListener('click', () => {
  state.wheel = button.dataset.wheel;
  $$('[data-wheel]').forEach(b => b.classList.toggle('selected', b === button));
  $('#wheelLabel').textContent = wheelTypes[state.wheel];
  window.dispatchEvent(new CustomEvent('atelier:wheels', { detail: { type: state.wheel } }));
  $$('.wheel .spokes').forEach(g => {
    const isDisc = state.wheel === 'disc';
    g.style.opacity = isDisc ? '.13' : '1';
    g.style.transform = state.wheel === 'mesh' ? 'scale(.92)' : '';
  });
  $$('.wheel circle:nth-child(3)').forEach(c => c.setAttribute('fill', state.wheel === 'disc' ? '#a9afb1' : '#15191e'));
  updatePrice();
}));
$('#glowToggle').addEventListener('click', () => { state.glow = !state.glow; updateLight(); updatePrice(); });
$$('[data-light]').forEach(button => {
  button.style.setProperty('--swatch', button.dataset.light);
  button.addEventListener('click', () => { state.light = button.dataset.light; $$('.light-swatch').forEach(b => b.classList.toggle('active', b === button)); updateLight(); });
});
$('#stanceSlider').addEventListener('input', event => {
  state.stance = Number(event.target.value);
  const mm = Math.round((50 - state.stance) * .55);
  $('#stanceValue').textContent = `${mm > 0 ? '+' : '−'}${Math.abs(mm)} MM`;
  window.dispatchEvent(new CustomEvent('atelier:stance', { detail: { value: state.stance } }));
  $('#carWrap').style.marginTop = `${(50 - state.stance) * .25}px`;
});
$$('[data-view]').forEach(button => button.addEventListener('click', () => { state.view = button.dataset.view; updateView(); }));
$('#prevView').addEventListener('click', () => changeView(-1));
$('#nextView').addEventListener('click', () => changeView(1));
$('#resetBtn').addEventListener('click', () => {
  state.paint = 0; state.finish = 'gloss'; state.wheel = 'five'; state.glow = true; state.light = '#ee4843'; state.stance = 72; state.view = 'side';
  $$('[data-finish]').forEach(b => b.classList.toggle('selected', b.dataset.finish === 'gloss'));
  $$('[data-wheel]').forEach(b => b.classList.toggle('selected', b.dataset.wheel === 'five'));
  $$('.wheel .spokes').forEach(g => { g.style.opacity = '1'; g.style.transform = ''; });
  window.dispatchEvent(new CustomEvent('atelier:wheels', { detail: { type: 'five' } }));
  $$('.wheel circle:nth-child(3)').forEach(c => c.setAttribute('fill', '#15191e'));
  $('#stanceSlider').value = 72; $('#stanceValue').textContent = '−12 MM'; $('#carWrap').style.marginTop = '0px';
  window.dispatchEvent(new CustomEvent('atelier:stance', { detail: { value: 72 } }));
  window.dispatchEvent(new CustomEvent('atelier:reset-view'));
  $$('.light-swatch').forEach(b => b.classList.toggle('active', b.dataset.light === '#ee4843'));
  updatePaint(); updateFinish(); updateLight(); updatePrice(); updateView(); notify('BUILD RESET TO FACTORY SPEC');
});
$('#expandBtn').addEventListener('click', () => $('.atelier').classList.toggle('clean-preview'));
$('#saveBtn').addEventListener('click', () => {
  const build = { model: 'NIGHTRUN GT', paint: paints[state.paint].name, finish: state.finish, wheels: wheelTypes[state.wheel], underglow: state.glow ? state.light : 'OFF', stance: $('#stanceValue').textContent, estimate: $('#buildPrice').textContent };
  const file = new Blob([JSON.stringify(build, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(file); link.download = 'nightrun-gt-build.json'; link.click(); URL.revokeObjectURL(link.href); notify('BUILD CARD SAVED');
});
$('#completeBtn').addEventListener('click', () => notify('BUILD LOCKED IN — NICE TASTE.'));
$('#soundBtn').addEventListener('click', event => { event.currentTarget.classList.toggle('active'); notify('STUDIO AUDIO IS A VISUAL DEMO'); });
let dragging = false, dragX = 0;
$('#stage').addEventListener('pointerdown', event => { if (event.target.closest('button')) return; dragging = true; dragX = event.clientX; $('#stage').setPointerCapture?.(event.pointerId); });
$('#stage').addEventListener('pointermove', event => {
  if (!dragging) return;
  const delta = event.clientX - dragX;
  if (Math.abs(delta) > 48) { changeView(delta > 0 ? -1 : 1); dragX = event.clientX; }
});
$('#stage').addEventListener('pointerup', () => { dragging = false; });
$('#stage').addEventListener('pointercancel', () => { dragging = false; });
$('#stage').addEventListener('wheel', event => {
  if (event.target.closest('button')) return;
  $('#carArt').style.transform = `scale(${event.deltaY < 0 ? 1.06 : 1})`;
}, { passive: true });
updatePaint(); updateLight(); updatePrice(); updateView();
