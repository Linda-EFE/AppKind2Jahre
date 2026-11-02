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
function say(text) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'de-DE'; u.rate = 0.85; u.pitch = 1.25;
  if (germanVoice) u.voice = germanVoice;
  speechSynthesis.speak(u);
}

function vibrate(ms = 30) { if (navigator.vibrate) navigator.vibrate(ms); }

/* ---------- Navigation ---------- */
const screens = {};
let current = 'menu';
function go(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === name));
  document.body.classList.toggle('in-menu', name === 'menu');
  if (screens[current]?.leave) screens[current].leave();
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  current = name;
  if (screens[name]?.enter) screens[name].enter();
}
document.querySelectorAll('[data-go]').forEach(b =>
  b.addEventListener('pointerdown', () => { audio(); tone(660, 0.25, 'triangle'); go(b.dataset.go); }));

// Home-Knopf: 1,2 Sekunden gedrückt halten
const home = document.getElementById('home');
let holdTimer;
home.addEventListener('pointerdown', e => {
  e.preventDefault();
  home.classList.add('holding');
  holdTimer = setTimeout(() => { home.classList.remove('holding'); go('menu'); }, 1200);
});
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev =>
  home.addEventListener(ev, () => { clearTimeout(holdTimer); home.classList.remove('holding'); }));

document.addEventListener('contextmenu', e => e.preventDefault());

/* ---------- Tiere ---------- */
const ANIMALS = [
  ['🐮', 'Die Kuh macht Muuuh!', [130, 110]],
  ['🐶', 'Der Hund macht Wau wau!', [400, 300]],
  ['🐱', 'Die Katze macht Miau!', [700, 900, 600]],
  ['🐷', 'Das Schwein macht Oink oink!', [220, 180]],
  ['🐑', 'Das Schaf macht Määäh!', [320, 330, 320]],
  ['🐔', 'Das Huhn macht Gack gack!', [800, 650]],
  ['🦆', 'Die Ente macht Quak quak!', [500, 450]],
  ['🐴', 'Das Pferd macht Hüüü!', [500, 700, 400]],
  ['🐸', 'Der Frosch macht Quak!', [180, 220]],
  ['🦁', 'Der Löwe macht Roaaar!', [90, 70]],
  ['🐝', 'Die Biene macht Summ summ!', [240, 245]],
  ['🐘', 'Der Elefant macht Törööö!', [300, 450, 350]],
];
const grid = document.getElementById('animalGrid');
ANIMALS.forEach(([emoji, text, notes]) => {
  const b = document.createElement('button');
  b.className = 'animal'; b.textContent = emoji; b.setAttribute('aria-label', text);
  b.addEventListener('pointerdown', () => {
    b.classList.remove('bounce'); void b.offsetWidth; b.classList.add('bounce');
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
const HOUSES = [
  [['sq', 0, 0], ['sq', 1, 0], ['tri', 0, 1, 2]],
  [['sq', 0, 0], ['sq', 0, 1], ['sq', 0, 2], ['tri', 0, 3, 1]],
  [['sq', 0, 0], ['sq', 1, 0], ['sq', 2, 0], ['tri', 0, 1, 1], ['tri', 1, 1, 1], ['tri', 2, 1, 1]],
  [['sq', 0, 0], ['sq', 1, 0], ['sq', 2, 0], ['sq', 0, 1], ['sq', 1, 1], ['sq', 2, 1], ['tri', 0, 2, 3]],
];
const SHAPE_NAME = { sq: 'Viereck', tri: 'Dreieck' };
const bauen = document.getElementById('bauen');
const zone = document.getElementById('buildZone');
const pals = [...document.querySelectorAll('.pal')];
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
  unit = Math.min(z.width * 0.8 / cols, (z.height - 40) * 0.9 / rows, z.width * 0.3);
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
  pals.forEach(p => { p.innerHTML = shapeSVG(p.dataset.shape, c, false); });
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
    say(colorName + ' ' + SHAPE_NAME[type] + '!');
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
    d.style.animationDelay = (i * 0.12) + 's';
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

// Palette: antippen ODER auf die Baustelle ziehen
pals.forEach(pal => {
  let start = null, dragEl = null, size = 0;
  pal.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (houseDone) { tumble(); return; }
    pal.setPointerCapture(e.pointerId);
    start = { x: e.clientX, y: e.clientY }; dragEl = null;
  });
  pal.addEventListener('pointermove', e => {
    if (!start) return;
    if (!dragEl && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 15) {
      const [c] = BUILD_COLORS[colorIdx % BUILD_COLORS.length];
      dragEl = makePiece(pal.dataset.shape, c, false);
      size = unit;
    }
    if (dragEl) setRect(dragEl, { left: e.clientX - size / 2, top: e.clientY - size / 2, width: size, height: size * (pal.dataset.shape === 'tri' ? 0.9 : 1) });
  });
  const end = e => {
    if (!start) return;
    if (e.type === 'pointercancel') { dragEl?.remove(); }
    else if (dragEl) place(pal.dataset.shape, null, { x: e.clientX, y: e.clientY }, dragEl);
    else place(pal.dataset.shape, pal.getBoundingClientRect());
    start = null; dragEl = null;
  };
  pal.addEventListener('pointerup', end);
  pal.addEventListener('pointercancel', end);
});

screens.bauen = {
  enter() { if (!slots.length) newHouse(); else layoutHouse(); say('Wir bauen ein Haus!'); },
};
addEventListener('resize', () => { if (current === 'bauen' && slots.length) layoutHouse(); });

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
const VEHICLES = [
  { car: '🚒', name: 'Tatü tata, die Feuerwehr!', siren: ['G4', 'C5'], song: 'jakob', title: 'Bruder Jakob' },
  { car: '🚑', name: 'Der Krankenwagen!', siren: ['A4', 'D5'], song: 'entchen', title: 'Alle meine Entchen' },
  { car: '🚓', name: 'Die Polizei!', siren: ['B4', 'E5'], song: 'haenschen', title: 'Hänschen klein' },
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
  playingBtn?.classList.remove('playing'); playingBtn = null;
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

function playVehicle(v, btn) {
  stopSong();
  const a = audio();
  songBus = a.createGain(); songBus.connect(a.destination);
  playingBtn = btn; btn.classList.add('playing');
  vibrate(40);
  // Tatü-tata (2x)
  for (let i = 0; i < 4; i++) sirenTone(freq(v.siren[i % 2]), i * 0.5, 0.48, songBus);
  songTimers.push(setTimeout(() => say(v.name), 2050));
  // danach das Lied
  const beat = 0.36;
  let t = 3.6;
  const r = btn.getBoundingClientRect();
  SONGS[v.song].trim().split(/\s+/).forEach(tok => {
    const [n, b] = tok.split(':');
    pianoNote(freq(n), t, songBus, 0.55);
    songTimers.push(setTimeout(() => flyNote(r.left + r.width * (0.2 + Math.random() * 0.6), r.top + r.height * 0.3), t * 1000));
    t += +b * beat;
  });
  songTimers.push(setTimeout(() => { btn.classList.remove('playing'); if (playingBtn === btn) playingBtn = null; }, t * 1000 + 600));
}

VEHICLES.forEach(v => {
  const b = document.createElement('button');
  b.className = 'vehicle';
  b.setAttribute('aria-label', v.name + ' – ' + v.title);
  b.innerHTML = `<span class="light"></span><span class="car">${v.car}</span>`;
  b.addEventListener('pointerdown', () => playVehicle(v, b));
  garage.appendChild(b);
});
screens.autos = { leave: stopSong };

/* ---------- Start ---------- */
document.body.classList.add('in-menu');
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
