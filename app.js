'use strict';

/* ---------- Audio ---------- */
let ctx;
function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur = 0.6, type = 'sine', vol = 0.35, when = 0, dest = null) {
  const a = audio(), t = a.currentTime + when;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest || a.destination);
  o.start(t); o.stop(t + dur + 0.05);
}

// Klavierähnlicher Ton: Grundton + Obertöne mit Ausklingen
function pianoNote(freq, when = 0, dest = null, vol = 0.5) {
  const a = audio(), t = a.currentTime + when;
  [[1, 1], [2, 0.35], [3, 0.15], [4, 0.06]].forEach(([h, v]) => {
    const o = a.createOscillator(), g = a.createGain();
    o.frequency.value = freq * h;
    const len = 1.8 / h + 0.3;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol * v * 0.5, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g).connect(dest || a.destination);
    o.start(t); o.stop(t + len + 0.05);
  });
}

// Notenname -> Frequenz, z. B. 'C4', 'F#4', 'G3'
function freq(name) {
  const m = /^([A-G])(#?)(\d)$/.exec(name);
  const semi = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] ? 1 : 0);
  const midi = 12 * (+m[3] + 1) + semi;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function flyNote(x, y, color) {
  const n = document.createElement('div');
  n.className = 'note-fly';
  n.textContent = Math.random() < 0.5 ? '♪' : '♫';
  n.style.color = color || `hsl(${Math.random() * 360}, 90%, 60%)`;
  n.style.left = x + 'px'; n.style.top = y + 'px';
  n.style.setProperty('--dx', (Math.random() * 60 - 30) + 'px');
  n.addEventListener('animationend', () => n.remove());
  document.getElementById(current).appendChild(n);
}

function popSound() {
  const a = audio(), t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.frequency.setValueAtTime(700, t);
  o.frequency.exponentialRampToValueAtTime(120, t + 0.15);
  g.gain.setValueAtTime(0.4, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + 0.2);
}

let germanVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  germanVoice = vs.find(v => v.lang === 'de-DE') || vs.find(v => v.lang.startsWith('de')) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}
let lastUtterance = null;
// Spricht text; ruft done() auf, wenn fertig (mit Zeit-Notbremse, falls der Browser kein Ende meldet)
function say(text, { pitch = 1.25, rate = 0.85, done = null } = {}) {
  let called = false;
  const finish = () => { if (!called) { called = true; done && done(); } };
  if (done) setTimeout(finish, Math.min(6000, 1200 + text.length * 85));
  if (!('speechSynthesis' in window)) { if (done) setTimeout(finish, 800); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE'; u.rate = rate; u.pitch = pitch;
  if (germanVoice) u.voice = germanVoice;
  u.onend = () => setTimeout(finish, 250);
  lastUtterance = u; // Chrome: Referenz halten, sonst feuert onend manchmal nicht
  speechSynthesis.speak(u);
}

function vibrate(ms = 30) { if (navigator.vibrate) navigator.vibrate(ms); }

/* ---------- Navigation ---------- */
const screens = {};
let current = 'start';
function go(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === name));
  document.body.classList.toggle('in-menu', name === 'start');
  if (screens[current]?.leave) screens[current].leave();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  current = name;
  if (screens[name]?.enter) screens[name].enter();
}
document.querySelectorAll('[data-go]').forEach(b =>
  b.addEventListener('pointerdown', () => { audio(); tone(660, 0.25, 'triangle'); go(b.dataset.go); }));

// Wohin führt "Zurück"? Spiele der 2-Jährigen -> Menü, Menüs -> Startseite
const PARENT = { menu: 'start', menu7: 'start', menu17: 'start', game7: 'menu7', game17: 'menu17' };
function parentOf(n) { return PARENT[n] || 'menu'; }
function isToddlerArea(n) { return n === 'menu' || parentOf(n) === 'menu'; }

// Zurück: Im Bereich der 2-Jährigen mit Bestätigung (⬅️ antippen -> "Zum Menü" erscheint 4 s),
// bei 7 und 17 Jahren direkt. Am PC zusätzlich Esc.
const home = document.getElementById('home');
const toMenu = document.getElementById('toMenu');
let confirmTimer;
function hideConfirm() { clearTimeout(confirmTimer); toMenu.classList.remove('show'); }
home.addEventListener('click', () => {
  if (!isToddlerArea(current)) { go(parentOf(current)); return; }
  if (toMenu.classList.contains('show')) { hideConfirm(); return; }
  toMenu.textContent = current === 'menu' ? '👪 Zur Startseite' : '🏠 Zum Menü';
  toMenu.classList.add('show');
  clearTimeout(confirmTimer);
  confirmTimer = setTimeout(hideConfirm, 4000);
});
toMenu.addEventListener('click', () => { hideConfirm(); go(parentOf(current)); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && current !== 'start') { hideConfirm(); go(parentOf(current)); } });

document.querySelectorAll('.modeSwitch').forEach(b =>
  b.addEventListener('click', () => { tone(660, 0.2, 'triangle'); go(b.dataset.mode); }));

document.addEventListener('contextmenu', e => e.preventDefault());

/* ---------- Tiere ---------- */
// 3D-Tierbilder: Microsoft Fluent Emoji (MIT-Lizenz, siehe img/tiere/LICENSE-fluentui-emoji.txt)
const ANIMALS = [
  ['kuh', 'Die Kuh macht Muuuh!', [130, 110], '#c7f0bd'],
  ['hund', 'Der Hund macht Wau wau!', [400, 300], '#ffe0b3'],
  ['katze', 'Die Katze macht Miau!', [700, 900, 600], '#ffd6e0'],
  ['schwein', 'Das Schwein macht Oink oink!', [220, 180], '#ffe5ec'],
  ['schaf', 'Das Schaf macht Määäh!', [320, 330, 320], '#d7ecff'],
  ['huhn', 'Das Huhn macht Gack gack!', [800, 650], '#fff3b0'],
  ['ente', 'Die Ente macht Quak quak!', [500, 450], '#bde0fe'],
  ['pferd', 'Das Pferd macht Hüüü!', [500, 700, 400], '#e9dcc9'],
  ['frosch', 'Der Frosch macht Quak!', [180, 220], '#d8f3dc'],
  ['loewe', 'Der Löwe brüllt ganz laut!', 'roar', '#ffe8a3'],
  ['biene', 'Die Biene macht Summ summ!', [240, 245], '#fdf0c4'],
  ['elefant', 'Der Elefant macht Törööö!', [300, 450, 350], '#e0e7ff'],
];
// Löwengebrüll: tiefes, knurrendes Rauschen mit anschwellender Lautstärke
function roar() {
  const a = audio(), t = a.currentTime, dur = 1.4;
  const out = a.createGain();
  out.gain.setValueAtTime(0.0001, t);
  out.gain.exponentialRampToValueAtTime(0.9, t + 0.25);
  out.gain.setValueAtTime(0.9, t + 0.7);
  out.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const comp = a.createDynamicsCompressor();
  out.connect(comp).connect(a.destination);
  // Rauschen (Atem/Rachen), tiefpassgefiltert
  const buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const noise = a.createBufferSource(); noise.buffer = buf;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass';
  lp.frequency.setValueAtTime(300, t);
  lp.frequency.linearRampToValueAtTime(900, t + 0.4);
  lp.frequency.linearRampToValueAtTime(250, t + dur);
  lp.Q.value = 4;
  // Knurren: schnelles Flattern der Lautstärke
  const growl = a.createGain(); growl.gain.value = 0.6;
  const lfo = a.createOscillator(); lfo.frequency.value = 28;
  const lfoAmt = a.createGain(); lfoAmt.gain.value = 0.4;
  lfo.connect(lfoAmt).connect(growl.gain);
  noise.connect(lp).connect(growl).connect(out);
  // tiefe Stimme darunter
  const v = a.createOscillator(); v.type = 'sawtooth';
  v.frequency.setValueAtTime(110, t);
  v.frequency.linearRampToValueAtTime(150, t + 0.35);
  v.frequency.linearRampToValueAtTime(75, t + dur);
  const vf = a.createBiquadFilter(); vf.type = 'lowpass'; vf.frequency.value = 500;
  const vg = a.createGain(); vg.gain.value = 0.35;
  v.connect(vf).connect(vg).connect(growl);
  [noise, lfo, v].forEach(n => { n.start(t); n.stop(t + dur + 0.05); });
}

const grid = document.getElementById('animalGrid');
ANIMALS.forEach(([img, text, notes, bg], i) => {
  const b = document.createElement('button');
  b.className = 'animal';
  b.style.setProperty('--bg', bg);
  b.style.setProperty('--delay', (i * 0.27 % 2.4) + 's');
  b.setAttribute('aria-label', text);
  b.innerHTML = `<img src="img/tiere/${img}.png" alt="" draggable="false">`;
  b.addEventListener('pointerdown', () => {
    b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump');
    if (notes === 'roar') { roar(); setTimeout(() => say(text), 1500); return; }
    notes.forEach((f, i) => setTimeout(() => tone(f, 0.18, 'square', 0.12), i * 140));
    setTimeout(() => say(text), notes.length * 140);
    vibrate();
  });
  grid.appendChild(b);
});

/* ---------- Farben / Ballons ---------- */
const COLORS = [
  ['#e63946', 'Rot'], ['#1d4ed8', 'Blau'], ['#ffd60a', 'Gelb'], ['#2a9d4a', 'Grün'],
  ['#ff8c00', 'Orange'], ['#9b5de5', 'Lila'], ['#ff70a6', 'Rosa'],
];
const balloonArea = document.getElementById('balloonArea');
let balloonTimer;
function spawnBalloon() {
  if (balloonArea.childElementCount > 8) return;
  const [c, name] = COLORS[Math.floor(Math.random() * COLORS.length)];
  const b = document.createElement('div');
  b.className = 'balloon';
  b.style.setProperty('--c', c);
  b.style.left = (Math.random() * 75) + 'vw';
  b.style.top = '100vh';
  b.style.animationDuration = (7 + Math.random() * 4) + 's';
  b.addEventListener('animationend', () => b.remove());
  b.addEventListener('pointerdown', e => {
    popSound(); vibrate(40);
    say(name + '!');
    const p = document.createElement('div');
    p.className = 'pop'; p.textContent = '✨';
    p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
    p.addEventListener('animationend', () => p.remove());
    balloonArea.appendChild(p);
    b.remove();
  });
  balloonArea.appendChild(b);
}
screens.farben = {
  enter() { for (let i = 0; i < 3; i++) setTimeout(spawnBalloon, i * 500); balloonTimer = setInterval(spawnBalloon, 1300); },
  leave() { clearInterval(balloonTimer); balloonArea.innerHTML = ''; },
};

/* ---------- Musik / Xylophon ---------- */
const NOTES = [
  [261.63, '#e63946'], [293.66, '#ff8c00'], [329.63, '#ffd60a'], [349.23, '#2a9d4a'],
  [392.0, '#2ec4b6'], [440.0, '#1d4ed8'], [493.88, '#9b5de5'], [523.25, '#ff70a6'],
];
const xylo = document.getElementById('xylophone');
NOTES.forEach(([f, c], i) => {
  const bar = document.createElement('button');
  bar.className = 'bar';
  bar.style.setProperty('--c', c);
  bar.style.height = (95 - i * 6) + '%';
  bar.setAttribute('aria-label', 'Ton ' + (i + 1));
  const hit = () => {
    tone(f, 1.2, 'sine', 0.4); tone(f * 4, 0.3, 'sine', 0.06);
    bar.classList.add('hit'); setTimeout(() => bar.classList.remove('hit'), 120);
  };
  bar.addEventListener('pointerdown', e => { bar.releasePointerCapture?.(e.pointerId); hit(); });
  // Mit dem Finger über die Stäbe "wischen"
  bar.addEventListener('pointerenter', e => { if (e.buttons || e.pointerType === 'touch') hit(); });
  xylo.appendChild(bar);
});

/* ---------- Seifenblasen ---------- */
const bubbleArea = document.getElementById('bubbleArea');
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
let lastBubble = 0;
function bubble(x, y, throttle) {
  const now = performance.now();
  if (throttle && now - lastBubble < 60) return;
  lastBubble = now;
  const size = 8 + Math.random() * 14;
  const el = document.createElement('div');
  el.className = 'bubble';
  el.style.width = el.style.height = size + 'vmin';
  el.style.left = x + 'px'; el.style.top = y + 'px';
  el.style.setProperty('--c', `hsla(${Math.random() * 360}, 90%, 65%, .45)`);
  el.style.setProperty('--dx', (Math.random() * 20 - 10) + 'vw');
  el.addEventListener('animationend', () => el.remove());
  bubbleArea.appendChild(el);
  const idx = Math.floor((1 - y / innerHeight) * SCALE.length);
  tone(SCALE[Math.max(0, Math.min(SCALE.length - 1, idx))], 0.5, 'triangle', 0.2);
}
bubbleArea.addEventListener('pointerdown', e => bubble(e.clientX, e.clientY));
bubbleArea.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') bubble(e.clientX, e.clientY, true); });

/* ---------- Bauen mit Magnetplatten ---------- */
const BUILD_COLORS = [
  ['#e63946', 'Rotes'], ['#1d4ed8', 'Blaues'], ['#ffc300', 'Gelbes'],
  ['#2a9d4a', 'Grünes'], ['#ff8c00', 'Oranges'], ['#9b5de5', 'Lila'],
];
// [Form, Spalte, Reihe (0 = unten), Breite bei Dreiecken]
function building(width, floors, roof) {
  const parts = [];
  for (let y = 0; y < floors; y++) for (let x = 0; x < width; x++) parts.push(['sq', x, y]);
  if (roof === 'zack') for (let x = 0; x < width; x++) parts.push(['tri', x, floors, 1]);
  else parts.push(['tri', 0, floors, width]);
  return parts;
}
const HOUSES = [
  building(2, 3),          // Haus mit 3 Stockwerken
  building(1, 6),          // Turm mit 6 Stockwerken
  building(2, 5),          // 5 Stockwerke
  building(3, 4, 'zack'),  // breites Haus mit Zackendach
  building(2, 8),          // Hochhaus mit 8 Stockwerken
  building(3, 7),          // großes Hochhaus mit 7 Stockwerken
];
const SHAPE_NAME = { sq: 'Viereck', tri: 'Dreieck' };
const bauen = document.getElementById('bauen');
const zone = document.getElementById('buildZone');
const pals = [...bauen.querySelectorAll('.pal')];
let houseIdx = 0, slots = [], colorIdx = 0, houseDone = false, busy = false, sunEl = null;

function triH(w) { return w === 1 ? 0.9 : 0.6 + 0.3 * w; }

function shapeSVG(type, color, ghost) {
  const shape = type === 'sq'
    ? (inset) => `<rect x="${inset}" y="${inset}" width="${100 - 2 * inset}" height="${100 - 2 * inset}" rx="${ghost ? 4 : 8}"/>`
    : (inset) => `<polygon points="50,${inset * 1.6} ${100 - inset},${100 - inset} ${inset},${100 - inset}"/>`;
  if (ghost) {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="rgba(255,255,255,.35)" stroke="#fff"
      stroke-width="4" stroke-dasharray="10 8" vector-effect="non-scaling-stroke">${shape(3)}</g></svg>`;
  }
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none">
    <g fill="${color}" fill-opacity=".55" stroke="${color}" stroke-width="7" stroke-linejoin="round"
       vector-effect="non-scaling-stroke">${shape(3)}</g>
    <g fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="3" vector-effect="non-scaling-stroke">${shape(16)}</g>
  </svg>`;
}

function makePiece(type, color, ghost) {
  const el = document.createElement('div');
  el.className = 'piece' + (ghost ? ' ghost' : '');
  el.innerHTML = shapeSVG(type, color, ghost);
  bauen.appendChild(el);
  return el;
}

function setRect(el, r) {
  el.style.left = r.left + 'px'; el.style.top = r.top + 'px';
  el.style.width = r.width + 'px'; el.style.height = r.height + 'px';
}

let unit = 100, originX = 0, groundY = 0;
function layoutHouse() {
  const z = zone.getBoundingClientRect();
  const cols = Math.max(...slots.map(s => s.x + (s.w || 1)));
  const rows = Math.max(...slots.map(s => s.y + (s.type === 'tri' ? triH(s.w) : 1)));
  unit = Math.min(z.width * 0.8 / cols, (z.height - 30) * 0.95 / rows, z.width * 0.3);
  originX = z.left + (z.width - cols * unit) / 2;
  groundY = z.bottom - 14;
  slots.forEach(s => {
    s.rect = slotRect(s);
    setRect(s.ghost, s.rect);
    if (s.piece && s.landed) setRect(s.piece, s.rect);
    s.piece?.style.setProperty('--fs', unit * 0.55 + 'px');
  });
}
function slotRect(s) {
  const w = (s.type === 'tri' ? s.w : 1) * unit;
  const h = (s.type === 'tri' ? triH(s.w) : 1) * unit;
  return { left: originX + s.x * unit, top: groundY - s.y * unit - h, width: w, height: h };
}

function updatePalette() {
  const [c] = BUILD_COLORS[colorIdx % BUILD_COLORS.length];
  document.querySelectorAll('.pal').forEach(p => { p.innerHTML = shapeSVG(p.dataset.shape, c, false); });
}

function newHouse() {
  bauen.querySelectorAll('.piece').forEach(p => p.remove());
  sunEl?.remove(); sunEl = null;
  bauen.classList.remove('house-done');
  houseDone = false;
  slots = HOUSES[houseIdx % HOUSES.length]
    .map(([type, x, y, w]) => ({ type, x, y, w, filled: false, landed: false }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  slots.forEach(s => { s.ghost = makePiece(s.type, null, true); });
  layoutHouse();
  updatePalette();
}

function magnetClick() {
  tone(1500, 0.05, 'square', 0.12);
  tone(2200, 0.08, 'square', 0.08, 0.04);
}

function hintShape(type) {
  slots.filter(s => !s.filled && s.type === type).forEach(s => {
    s.ghost.classList.remove('hint'); void s.ghost.offsetWidth; s.ghost.classList.add('hint');
  });
}

// Platte zur Lücke fliegen lassen. from = Startrechteck, point = Ablagepunkt (beim Ziehen)
function place(type, from, point, dragEl) {
  if (houseDone) return;
  const free = slots.filter(s => !s.filled && s.type === type);
  if (!free.length) {
    tone(200, 0.25, 'sine', 0.25);
    const other = type === 'sq' ? 'tri' : 'sq';
    hintShape(other);
    const pal = pals.find(p => p.dataset.shape === type);
    pal.classList.remove('wiggle'); void pal.offsetWidth; pal.classList.add('wiggle');
    dragEl?.remove();
    return;
  }
  let target = free[0];
  if (point) { // Magnet: nächstgelegene passende Lücke
    const d = s => Math.hypot(s.rect.left + s.rect.width / 2 - point.x, s.rect.top + s.rect.height / 2 - point.y);
    target = free.reduce((a, b) => (d(b) < d(a) ? b : a));
  }
  const [color, colorName] = BUILD_COLORS[colorIdx++ % BUILD_COLORS.length];
  updatePalette();
  const el = dragEl || makePiece(type, color, false);
  if (!dragEl) setRect(el, from);
  target.filled = true; target.piece = el;
  void el.offsetWidth;
  el.classList.add('fly');
  setRect(el, target.rect);
  vibrate(20);
  setTimeout(() => {
    el.classList.remove('fly');
    target.landed = true;
    magnetClick();
    const row = slots.filter(s => s.type === 'sq' && s.y === target.y);
    if (type === 'sq' && row.every(s => s.landed)) {
      const n = target.y + 1;
      say(n === 1 ? 'Ein Stockwerk!' : n + ' Stockwerke!');
      [0, 1].forEach(i => pianoNote(freq(['C5', 'G5'][i]), i * 0.1, null, 0.3));
    } else {
      say(colorName + ' ' + SHAPE_NAME[type] + '!');
    }
    if (slots.every(s => s.landed)) finishHouse();
  }, 360);
}

function finishHouse() {
  houseDone = true;
  const bottom = slots.filter(s => s.type === 'sq' && s.y === 0);
  const door = bottom[Math.floor((bottom.length - 1) / 2)];
  slots.filter(s => s.type === 'sq').forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'deco'; d.textContent = s === door ? '🚪' : '🪟';
    d.style.animationDelay = (i * 0.06) + 's';
    s.piece.style.setProperty('--fs', unit * 0.55 + 'px');
    s.piece.appendChild(d);
  });
  sunEl = document.createElement('div'); sunEl.className = 'sun'; sunEl.textContent = '☀️';
  zone.appendChild(sunEl);
  setTimeout(() => {
    bauen.classList.add('house-done');
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pianoNote(freq(n), i * 0.15));
    say('Juhu! Das Haus ist fertig!');
  }, 500);
}

function tumble() {
  if (!houseDone || busy) return;
  busy = true;
  [0, 1, 2, 3, 4].forEach(i => tone(600 - i * 90, 0.15, 'triangle', 0.25, i * 0.09));
  say('Bumm!');
  slots.forEach(s => {
    const p = s.piece;
    p.classList.add('tumble');
    p.style.transform = `translate(${Math.random() * 300 - 150}px, ${100 + Math.random() * 150}px) rotate(${Math.random() * 360 - 180}deg)`;
    s.ghost.style.opacity = 0;
  });
  setTimeout(() => { houseIdx++; newHouse(); busy = false; }, 950);
}
zone.addEventListener('pointerdown', tumble);

// Palette: antippen ODER auf die Baustelle ziehen (für 2D und 3D)
function setupPalette(pal, host, o) {
  let start = null, dragEl = null, size = 0;
  pal.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (o.isDone()) { o.onDone(); return; }
    pal.setPointerCapture(e.pointerId);
    start = { x: e.clientX, y: e.clientY }; dragEl = null;
  });
  pal.addEventListener('pointermove', e => {
    if (!start) return;
    if (!dragEl && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 15) {
      const [c] = BUILD_COLORS[colorIdx % BUILD_COLORS.length];
      dragEl = document.createElement('div');
      dragEl.className = 'piece';
      dragEl.innerHTML = shapeSVG(pal.dataset.shape, c, false);
      host.appendChild(dragEl);
      size = o.size();
    }
    if (dragEl) setRect(dragEl, { left: e.clientX - size / 2, top: e.clientY - size / 2, width: size, height: size * (pal.dataset.shape === 'tri' ? 0.9 : 1) });
  });
  const end = e => {
    if (!start) return;
    if (e.type === 'pointercancel') dragEl?.remove();
    else if (dragEl) o.drop(pal.dataset.shape, { x: e.clientX, y: e.clientY }, dragEl);
    else o.tap(pal.dataset.shape, pal.getBoundingClientRect());
    start = null; dragEl = null;
  };
  pal.addEventListener('pointerup', end);
  pal.addEventListener('pointercancel', end);
}
pals.forEach(pal => setupPalette(pal, bauen, {
  isDone: () => houseDone, onDone: tumble, size: () => unit,
  tap: (type, from) => place(type, from),
  drop: (type, point, el) => place(type, null, point, el),
}));

screens.bauen = {
  enter() { if (!slots.length) newHouse(); else layoutHouse(); say('Wir bauen ein Haus!'); },
};
addEventListener('resize', () => { if (current === 'bauen' && slots.length) layoutHouse(); });

/* ---------- 3D bauen (Würfelhaus mit Pyramidendach) ---------- */
const b3 = document.getElementById('bauen3d');
const scene = document.getElementById('scene3d');
const stage = document.getElementById('stage3d');
const pals3 = [...b3.querySelectorAll('.pal')];
// [Länge, Tiefe, Stockwerke] – quadratisch = Pyramidendach, länglich = Satteldach
const HOUSES3D = [[1, 1, 1], [2, 1, 2], [1, 1, 3], [3, 1, 2], [2, 2, 2], [2, 1, 4], [4, 1, 3], [1, 1, 6], [3, 1, 5]];
let h3Idx = 0, slots3 = [], done3 = false, busy3 = false, S3 = 100, angle = -30, spin = 0.012;
let raf3 = null, lastT = 0, dragRot = null, plate = null;

function house3() { return HOUSES3D[h3Idx % HOUSES3D.length]; }
function geom3(s) {
  const [W, D, F] = house3();
  const sideLen = s.side % 2 === 0 ? W : D;          // Anzahl Platten auf dieser Seite
  const dist = (s.side % 2 === 0 ? D : W) * S3 / 2;   // Abstand der Seite zur Mitte
  const rot = `rotateY(${s.side * 90}deg)`;
  if (s.type === 'sq' && !s.roof) {
    return { w: S3, h: S3, tf: `${rot} translate3d(${(s.x - (sideLen - 1) / 2) * S3}px, ${-(s.f + 0.5) * S3}px, ${dist}px)` };
  }
  if (W === D) { // Pyramidendach aus 4 Dreiecken
    const L = W * S3, H = L / Math.SQRT2, hs = L * Math.sqrt(3) / 2;
    const tilt = Math.atan((L / 2) / H) * 180 / Math.PI;
    return { w: L, h: hs, tf: `${rot} translate3d(0, ${-F * S3}px, ${L / 2}px) rotateX(${tilt}deg) translateY(${-hs / 2}px)` };
  }
  // Satteldach: Dreiecke als Giebel, Vierecke als Dachschrägen
  const G = D * S3, hs = G * Math.sqrt(3) / 2;
  if (s.type === 'tri') {
    return { w: G, h: hs, tf: `${rot} translate3d(0, ${-F * S3 - hs / 2}px, ${dist}px)` };
  }
  return { w: S3, h: G, tf: `${rot} translate3d(${(s.x - (W - 1) / 2) * S3}px, ${-F * S3}px, ${dist}px) rotateX(30deg) translateY(${-G / 2}px)` };
}
function applyGeom(el, g, extra = '') {
  el.style.width = g.w + 'px'; el.style.height = g.h + 'px';
  el.style.marginLeft = -g.w / 2 + 'px'; el.style.marginTop = -g.h / 2 + 'px';
  el.style.transform = extra + g.tf;
}
function face3(type, color, ghost) {
  const el = document.createElement('div');
  el.className = 'face' + (ghost ? ' ghost' : '');
  el.innerHTML = shapeSVG(type, color, ghost);
  stage.appendChild(el);
  return el;
}
function layout3d() {
  const [W, D, F] = house3();
  const z = scene.getBoundingClientRect();
  const roofH = W === D ? W * 0.71 : D * 0.87;
  S3 = Math.min(z.height * 0.62 / (F + roofH), z.width * 0.72 / Math.hypot(W, D), 170);
  const totalH = (F + roofH) * S3;
  stage.style.top = (z.height * 0.44 + totalH / 2) + 'px';
  slots3.forEach(s => {
    const g = geom3(s);
    applyGeom(s.ghost, g);
    if (s.piece && s.landed) applyGeom(s.piece, g);
    s.piece?.style.setProperty('--fs', S3 * 0.55 + 'px');
  });
  const pw = (W + 0.8) * S3, pd = (D + 0.8) * S3;
  applyGeom(plate, { w: pw, h: pd, tf: 'rotateX(90deg)' });
}
function newHouse3d() {
  stage.innerHTML = '';
  b3.classList.remove('house-done');
  done3 = false;
  const [W, D, F] = house3();
  plate = document.createElement('div'); plate.className = 'plate'; stage.appendChild(plate);
  slots3 = [];
  for (let f = 0; f < F; f++) for (let side = 0; side < 4; side++)
    for (let x = 0; x < (side % 2 === 0 ? W : D); x++) slots3.push({ type: 'sq', f, side, x });
  if (W === D) {
    for (let side = 0; side < 4; side++) slots3.push({ type: 'tri', f: F, side, x: 0 });
  } else {
    [0, 2].forEach(side => { for (let x = 0; x < W; x++) slots3.push({ type: 'sq', roof: true, f: F, side, x }); });
    [1, 3].forEach(side => slots3.push({ type: 'tri', f: F, side, x: 0 }));
  }
  slots3.forEach(s => { s.ghost = face3(s.type, null, true); });
  layout3d();
  updatePalette();
}
function place3d(type, point, dragEl) {
  dragEl?.remove();
  if (done3) return;
  const free = slots3.filter(s => !s.filled && s.type === type);
  if (!free.length) {
    tone(200, 0.25, 'sine', 0.25);
    const pal = pals3.find(p => p.dataset.shape === type);
    pal.classList.remove('wiggle'); void pal.offsetWidth; pal.classList.add('wiggle');
    return;
  }
  let target = free[0];
  if (point) {
    const d = s => { const r = s.ghost.getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - point.x, r.top + r.height / 2 - point.y); };
    target = free.reduce((a, b) => (d(b) < d(a) ? b : a));
  }
  const [color, colorName] = BUILD_COLORS[colorIdx++ % BUILD_COLORS.length];
  updatePalette();
  const el = face3(type, color, false);
  target.filled = true; target.piece = el;
  const g = geom3(target);
  el.style.opacity = 0;
  applyGeom(el, g, `translate3d(0, ${S3 * 2.5}px, ${S3 * 2}px) scale(.3) `);
  void el.offsetWidth;
  el.classList.add('fly');
  el.style.opacity = 1;
  applyGeom(el, g, `translate3d(0, 0, 0) scale(1) `);
  vibrate(20);
  setTimeout(() => {
    el.classList.remove('fly');
    applyGeom(el, g);
    target.landed = true;
    target.ghost.style.opacity = 0;
    magnetClick();
    const floor = slots3.filter(s => s.type === 'sq' && !s.roof && s.f === target.f);
    if (type === 'sq' && !target.roof && floor.every(s => s.landed)) {
      const n = target.f + 1;
      say(n === 1 ? 'Ein Stockwerk!' : n + ' Stockwerke!');
      [0, 1].forEach(i => pianoNote(freq(['C5', 'G5'][i]), i * 0.1, null, 0.3));
    } else {
      say(colorName + ' ' + SHAPE_NAME[type] + '!');
    }
    if (slots3.every(s => s.landed)) finish3d();
  }, 480);
}
function finish3d() {
  done3 = true;
  const [W] = house3();
  slots3.filter(s => s.type === 'sq' && !s.roof).forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'deco';
    d.textContent = (s.f === 0 && s.side === 0 && s.x === Math.floor((W - 1) / 2)) ? '🚪' : '🪟';
    d.style.animationDelay = (i * 0.05) + 's';
    s.piece.appendChild(d);
  });
  setTimeout(() => {
    b3.classList.add('house-done');
    ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pianoNote(freq(n), i * 0.15));
    say('Juhu! Das Haus ist fertig!');
    spin = 0.09; setTimeout(() => { spin = 0.012; }, 1500);
  }, 500);
}
function tumble3d() {
  if (!done3 || busy3) return;
  busy3 = true;
  [0, 1, 2, 3, 4].forEach(i => tone(600 - i * 90, 0.15, 'triangle', 0.25, i * 0.09));
  say('Bumm!');
  slots3.forEach(s => {
    const g = geom3(s);
    s.piece.classList.add('tumble3d');
    s.piece.style.transform = `translate3d(${Math.random() * 400 - 200}px, ${150 + Math.random() * 150}px, ${Math.random() * 300 - 100}px) rotateX(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg) ` + g.tf;
    s.piece.style.opacity = 0;
    s.ghost.style.opacity = 0;
  });
  setTimeout(() => { h3Idx++; newHouse3d(); busy3 = false; }, 950);
}
function tick3d(t) {
  const dt = lastT ? Math.min(t - lastT, 50) : 16;
  lastT = t;
  if (!dragRot) angle += dt * spin;
  stage.style.transform = `rotateX(-16deg) rotateY(${angle}deg)`;
  raf3 = requestAnimationFrame(tick3d);
}
// Wischen auf der Baustelle dreht das Haus
scene.addEventListener('pointerdown', e => {
  if (done3) { tumble3d(); return; }
  scene.setPointerCapture(e.pointerId);
  dragRot = { x: e.clientX, a: angle };
});
scene.addEventListener('pointermove', e => { if (dragRot) angle = dragRot.a + (e.clientX - dragRot.x) * 0.5; });
['pointerup', 'pointercancel'].forEach(ev => scene.addEventListener(ev, () => { dragRot = null; }));

pals3.forEach(pal => setupPalette(pal, b3, {
  isDone: () => done3, onDone: tumble3d, size: () => S3 * 0.8,
  tap: type => place3d(type),
  drop: (type, point, el) => place3d(type, point, el),
}));
screens.bauen3d = {
  enter() {
    if (!slots3.length) newHouse3d(); else layout3d();
    lastT = 0; raf3 = requestAnimationFrame(tick3d);
    say('Wir bauen ein Haus in 3 D!');
  },
  leave() { cancelAnimationFrame(raf3); },
};
addEventListener('resize', () => { if (current === 'bauen3d' && slots3.length) layout3d(); });

/* ---------- Klavier ---------- */
const piano = document.getElementById('piano');
const WHITE = [['C4', '#e63946'], ['D4', '#ff8c00'], ['E4', '#ffd60a'], ['F4', '#2a9d4a'],
               ['G4', '#2ec4b6'], ['A4', '#1d4ed8'], ['B4', '#9b5de5'], ['C5', '#ff70a6']];
const BLACK = [[0, 'C#4'], [1, 'D#4'], [3, 'F#4'], [4, 'G#4'], [5, 'A#4']];
function pianoKey(el, note, color) {
  el.setAttribute('aria-label', 'Taste ' + note);
  const hit = () => {
    pianoNote(freq(note));
    el.classList.add('down'); setTimeout(() => el.classList.remove('down'), 150);
    const r = el.getBoundingClientRect();
    flyNote(r.left + r.width / 2, r.top - 10, color);
  };
  el.addEventListener('pointerdown', e => { e.stopPropagation(); el.releasePointerCapture?.(e.pointerId); hit(); });
  el.addEventListener('pointerenter', e => { if (e.buttons || e.pointerType === 'touch') hit(); });
}
WHITE.forEach(([note, c]) => {
  const k = document.createElement('div');
  k.className = 'wkey'; k.style.setProperty('--c', c);
  pianoKey(k, note, c);
  piano.appendChild(k);
});
BLACK.forEach(([after, note]) => {
  const k = document.createElement('div');
  k.className = 'bkey';
  k.style.left = `calc(4px + (100% - 8px) / 8 * ${after + 1} - (100% - 8px) / 8 * .3)`;
  pianoKey(k, note, '#fff');
  piano.appendChild(k);
});

/* ---------- Autos mit Kinderliedern ---------- */
// Melodien traditioneller (gemeinfreier) Kinderlieder: "Note:Schläge"
const SONGS = {
  entchen: 'C4:1 D4:1 E4:1 F4:1 G4:2 G4:2 A4:1 A4:1 A4:1 A4:1 G4:4 A4:1 A4:1 A4:1 A4:1 G4:4 ' +
           'F4:1 F4:1 F4:1 F4:1 E4:2 E4:2 D4:1 D4:1 D4:1 D4:1 C4:4',
  jakob:   'C4:1 D4:1 E4:1 C4:1 C4:1 D4:1 E4:1 C4:1 E4:1 F4:1 G4:2 E4:1 F4:1 G4:2 ' +
           'G4:.5 A4:.5 G4:.5 F4:.5 E4:1 C4:1 G4:.5 A4:.5 G4:.5 F4:.5 E4:1 C4:1 ' +
           'C4:1 G3:1 C4:2 C4:1 G3:1 C4:2',
  haenschen: 'G4:1 E4:1 E4:2 F4:1 D4:1 D4:2 C4:1 D4:1 E4:1 F4:1 G4:1 G4:1 G4:2 ' +
             'G4:1 E4:1 E4:2 F4:1 D4:1 D4:2 C4:1 E4:1 G4:1 G4:1 C4:4 ' +
             'D4:1 D4:1 D4:1 D4:1 D4:1 E4:1 F4:2 E4:1 E4:1 E4:1 E4:1 E4:1 F4:1 G4:2 ' +
             'G4:1 E4:1 E4:2 F4:1 D4:1 D4:2 C4:1 E4:1 G4:1 G4:1 C4:4',
};
SONGS.funkel = 'C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2 ' +
               'G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 ' +
               'C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2';
// THW-Fahrzeug (dafür gibt es kein Emoji): blau mit weißem Streifen, fährt nach links
const THW_SVG = `<svg class="thw" viewBox="0 0 130 100" aria-hidden="true">
  <rect x="45" y="18" width="80" height="58" rx="6" fill="#1d4ed8"/>
  <rect x="45" y="54" width="80" height="8" fill="#fff"/>
  <text x="85" y="45" fill="#fff" font-size="21" font-weight="800" text-anchor="middle" font-family="Arial, sans-serif">THW</text>
  <path d="M8 76 L8 46 L20 28 L48 28 L48 76 Z" fill="#1e40af"/>
  <path d="M14 48 L23 35 L42 35 L42 48 Z" fill="#aee3ff"/>
  <rect x="8" y="54" width="40" height="8" fill="#fff"/>
  <rect x="24" y="20" width="16" height="8" rx="3" fill="#60a5fa"/>
  <rect x="3" y="68" width="12" height="8" rx="2" fill="#9ca3af"/>
  <circle cx="28" cy="78" r="13" fill="#333"/><circle cx="28" cy="78" r="5" fill="#bbb"/>
  <circle cx="102" cy="78" r="13" fill="#333"/><circle cx="102" cy="78" r="5" fill="#bbb"/>
</svg>`;
const VEHICLES = [
  { car: '🚒', call: 'Hilfe! Feuer! Es brennt! Hilfe!', need: '🔥', solved: '💨',
    name: 'Ta tü, ta ta! Die Feuerwehr kommt!', siren: ['G4', 'C5'], song: 'jakob', title: 'Bruder Jakob' },
  { car: '🚑', call: 'Aua! Ich bin verletzt. Ich brauche ein Pflaster!', need: '🤕', solved: '🩹',
    name: 'Der Krankenwagen kommt!', siren: ['A4', 'D5'], song: 'entchen', title: 'Alle meine Entchen' },
  { car: '🚓', call: 'Hilfe! Ich brauche Hilfe!', need: '😟', solved: '😊',
    name: 'Die Polizei kommt!', siren: ['B4', 'E5'], song: 'haenschen', title: 'Hänschen klein' },
  { car: THW_SVG, call: 'Hilfe! Wasser kommt!', need: '🌊', solved: '☀️',
    name: 'Das Technische Hilfswerk kommt!', siren: ['F4', 'B4'], song: 'funkel', title: 'Funkel, funkel, kleiner Stern' },
];
const garage = document.getElementById('garage');
let songBus = null, songTimers = [], playingBtn = null;

function stopSong() {
  if (songBus) {
    const bus = songBus, a = audio();
    bus.gain.setTargetAtTime(0, a.currentTime, 0.03);
    setTimeout(() => bus.disconnect(), 300);
    songBus = null;
  }
  songTimers.forEach(clearTimeout); songTimers = [];
  playId++;
  if (playingBtn) {
    playingBtn.classList.remove('playing', 'calling');
    playingBtn.querySelector('.need')?.classList.remove('show', 'solved');
    playingBtn.querySelector('.car')?.classList.remove('drive');
  }
  playingBtn = null;
}

function sirenTone(f, when, dur, dest) {
  const a = audio(), t = a.currentTime + when;
  const o = a.createOscillator(), g = a.createGain();
  o.type = 'triangle'; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.22, t + 0.03);
  g.gain.setValueAtTime(0.22, t + dur - 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(dest);
  o.start(t); o.stop(t + dur + 0.05);
}

let playId = 0;
function playVehicle(v, btn) {
  stopSong();
  const id = ++playId;
  const a = audio();
  songBus = a.createGain(); songBus.connect(a.destination);
  playingBtn = btn; btn.classList.add('calling');
  const need = btn.querySelector('.need');
  need.textContent = v.need;
  need.classList.remove('show', 'solved'); void need.offsetWidth; need.classList.add('show');
  vibrate(40);
  // 1) Jemand ruft um Hilfe – danach kommt das Fahrzeug
  say(v.call, { pitch: 1.6, rate: 0.95, done: () => { if (id === playId) rescue(v, btn, need); } });
}
function rescue(v, btn, need) {
  btn.classList.remove('calling'); btn.classList.add('playing');
  // 2) Tatü-tata, fährt weg (zum Einsatz) und kommt zurück
  const car = btn.querySelector('.car');
  car.classList.remove('drive'); void car.offsetWidth; car.classList.add('drive');
  for (let i = 0; i < 4; i++) sirenTone(freq(v.siren[i % 2]), i * 0.5, 0.48, songBus);
  songTimers.push(setTimeout(() => say(v.name), 2050));
  // 3) Geholfen! Problem gelöst
  songTimers.push(setTimeout(() => {
    need.textContent = v.solved; need.classList.add('solved');
    ['C5', 'E5', 'G5'].forEach((n, i) => pianoNote(freq(n), i * 0.1, songBus, 0.35));
  }, 3950));
  // 4) danach das Lied
  const beat = 0.36;
  let t = 4.6;
  const r = btn.getBoundingClientRect();
  SONGS[v.song].trim().split(/\s+/).forEach(tok => {
    const [n, b] = tok.split(':');
    pianoNote(freq(n), t, songBus, 0.55);
    songTimers.push(setTimeout(() => flyNote(r.left + r.width * (0.2 + Math.random() * 0.6), r.top + r.height * 0.3), t * 1000));
    t += +b * beat;
  });
  songTimers.push(setTimeout(() => {
    btn.classList.remove('playing'); need.classList.remove('show', 'solved');
    if (playingBtn === btn) playingBtn = null;
  }, t * 1000 + 600));
}

VEHICLES.forEach(v => {
  const b = document.createElement('button');
  b.className = 'vehicle';
  b.setAttribute('aria-label', v.name + ' – ' + v.title);
  b.innerHTML = `<span class="need"></span><span class="car"><span class="light"></span><span class="body">${v.car}</span></span>`;
  b.addEventListener('pointerdown', () => playVehicle(v, b));
  garage.appendChild(b);
});
screens.autos = { leave: stopSong };

/* ---------- Start ---------- */
document.body.classList.add('in-menu');
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
