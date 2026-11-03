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

// Sprache der 2-Jährigen-Spiele: 'de' oder 'ru' (die Bereiche 7 und 17 Jahre bleiben Deutsch)
let LANG = 'de';
try { LANG = localStorage.getItem('fe_lang') === 'ru' ? 'ru' : 'de'; } catch { /* egal */ }
const voices = { de: null, ru: null };
// Alle installierten Stimmen einer Sprache
function voicesFor(l) {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices().filter(v => v.lang.replace('_', '-').toLowerCase().startsWith(l));
}
// Natürliche Stimmen bevorzugen (Edge: „Online (Natural)“, Chrome: „Google“, Apple: „Premium/Erweitert“)
function rankVoice(v, l) {
  let s = 0;
  if (/natural|neural/i.test(v.name)) s += 6;
  if (/online/i.test(v.name)) s += 2;
  if (/google/i.test(v.name)) s += 4;
  if (/premium|enhanced|erweitert|siri/i.test(v.name)) s += 4;
  if (v.lang.replace('_', '-').toLowerCase() === (l === 'ru' ? 'ru-ru' : 'de-de')) s += 1;
  return s;
}
function pickVoice() {
  ['de', 'ru'].forEach(l => {
    const list = voicesFor(l);
    let chosen = null;
    try { const k = localStorage.getItem('fe_voice_' + l); chosen = list.find(v => v.voiceURI === k) || null; } catch { /* egal */ }
    voices[l] = chosen || list.slice().sort((a, b) => rankVoice(b, l) - rankVoice(a, l))[0] || null;
  });
}
// Text in der aktuellen Sprache (nur im Bereich der 2-Jährigen wird übersetzt)
function speechLang() { return isToddlerArea(current) ? LANG : 'de'; }
function T(de, ru) { return speechLang() === 'ru' ? ru : de; }
function ruFloors(n) {
  const w = n % 10 === 1 && n % 100 !== 11 ? 'этаж' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'этажа' : 'этажей';
  return n === 1 ? 'Один этаж!' : `${n} ${w}!`;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}
let lastUtterance = null;
// Spricht text; ruft done() auf, wenn fertig (mit Zeit-Notbremse, falls der Browser kein Ende meldet)
function say(text, { pitch = 1.25, rate = 0.85, done = null, lang = null } = {}) {
  const L = lang || speechLang();
  let called = false;
  const finish = () => { if (!called) { called = true; done && done(); } };
  if (done) setTimeout(finish, Math.min(6000, 1200 + text.length * 85));
  if (!('speechSynthesis' in window)) { if (done) setTimeout(finish, 800); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = L === 'ru' ? 'ru-RU' : 'de-DE'; u.rate = rate; u.pitch = pitch;
  if (voices[L]) u.voice = voices[L];
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
  document.body.classList.toggle('toddler', isToddlerArea(name));
  document.body.classList.toggle('toddler-menu', name === 'menu');
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
function isToddlerArea(n) { return n !== 'start' && (n === 'menu' || parentOf(n) === 'menu'); }

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
  ['kuh', 'Die Kuh macht Muuuh!', [130, 110], '#c7f0bd', 'Корова говорит: му-у!'],
  ['hund', 'Der Hund macht Wau wau!', [400, 300], '#ffe0b3', 'Собака говорит: гав-гав!'],
  ['katze', 'Die Katze macht Miau!', [700, 900, 600], '#ffd6e0', 'Кошка говорит: мяу!'],
  ['schwein', 'Das Schwein macht Oink oink!', [220, 180], '#ffe5ec', 'Свинья говорит: хрю-хрю!'],
  ['schaf', 'Das Schaf macht Määäh!', [320, 330, 320], '#d7ecff', 'Овечка говорит: бе-е!'],
  ['huhn', 'Das Huhn macht Gack gack!', [800, 650], '#fff3b0', 'Курочка говорит: ко-ко-ко!'],
  ['ente', 'Die Ente macht Quak quak!', [500, 450], '#bde0fe', 'Утка говорит: кря-кря!'],
  ['pferd', 'Das Pferd macht Hüüü!', [500, 700, 400], '#e9dcc9', 'Лошадка говорит: иго-го!'],
  ['frosch', 'Der Frosch macht Quak!', [180, 220], '#d8f3dc', 'Лягушка говорит: ква-ква!'],
  ['loewe', 'Der Löwe brüllt ganz laut!', 'roar', '#ffe8a3', 'Лев громко рычит!'],
  ['biene', 'Die Biene macht Summ summ!', 'buzz', '#fdf0c4', 'Пчёлка жужжит: ж-ж-ж!'],
  ['elefant', 'Der Elefant macht Törööö!', [300, 450, 350], '#e0e7ff', 'Слон трубит: ту-ту-у!'],
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
// Echte Tieraufnahmen (Wikimedia Commons, Quellen: sounds/tiere/QUELLEN.md).
// Werden beim Öffnen des Spiels geladen; fehlt eine Datei, gibt es den künstlichen Ersatzton.
const animalSounds = {};
function loadAnimalSounds() {
  ANIMALS.forEach(([name, , notes]) => {
    if (name in animalSounds) return;
    if (notes === 'buzz') { animalSounds[name] = false; return; } // Biene: keine Aufnahme, künstliches Summen
    animalSounds[name] = null;
    fetch(`sounds/tiere/${name}.mp3`)
      .then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then(ab => new Promise((ok, fail) => audio().decodeAudioData(ab, ok, fail)))
      .then(buf => { animalSounds[name] = buf; })
      .catch(() => { animalSounds[name] = false; });
  });
}
function playAnimalSound(name) {
  const buf = animalSounds[name];
  if (!buf) return 0;
  const a = audio(), src = a.createBufferSource();
  src.buffer = buf; src.connect(a.destination); src.start();
  return buf.duration;
}
// Bienensummen (Ersatz, falls keine Aufnahme da ist)
function buzz() {
  const a = audio(), t = a.currentTime, dur = 1.3;
  const o = a.createOscillator(), g = a.createGain(), f = a.createBiquadFilter();
  o.type = 'sawtooth'; o.frequency.setValueAtTime(220, t);
  const lfo = a.createOscillator(), amt = a.createGain();
  lfo.frequency.value = 9; amt.gain.value = 12; lfo.connect(amt).connect(o.frequency);
  f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 1.2;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.15);
  g.gain.setValueAtTime(0.35, t + dur - 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(a.destination);
  [o, lfo].forEach(n => { n.start(t); n.stop(t + dur + 0.05); });
}
let animalTalk = null;
ANIMALS.forEach(([img, text, notes, bg, textRu], i) => {
  const b = document.createElement('button');
  b.className = 'animal';
  b.style.setProperty('--bg', bg);
  b.style.setProperty('--delay', (i * 0.27 % 2.4) + 's');
  b.setAttribute('aria-label', text);
  b.innerHTML = `<img src="img/tiere/${img}.png" alt="" draggable="false">`;
  b.addEventListener('pointerdown', () => {
    b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump');
    vibrate();
    clearTimeout(animalTalk);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
    let dur = playAnimalSound(img);
    if (!dur) { // Ersatz: künstlicher Ton
      if (notes === 'roar') { roar(); dur = 1.4; }
      else if (notes === 'buzz') { buzz(); dur = 1.3; }
      else { notes.forEach((f, k) => setTimeout(() => tone(f, 0.18, 'square', 0.12), k * 140)); dur = notes.length * 0.14; }
    }
    animalTalk = setTimeout(() => say(T(text, textRu)), dur * 1000 + 150);
  });
  grid.appendChild(b);
});
screens.tiere = { enter: loadAnimalSounds, leave() { clearTimeout(animalTalk); } };

/* ---------- Farben / Ballons ---------- */
const COLORS = [
  ['#e63946', 'Rot', 'Красный'], ['#1d4ed8', 'Blau', 'Синий'], ['#ffd60a', 'Gelb', 'Жёлтый'], ['#2a9d4a', 'Grün', 'Зелёный'],
  ['#ff8c00', 'Orange', 'Оранжевый'], ['#9b5de5', 'Lila', 'Фиолетовый'], ['#ff70a6', 'Rosa', 'Розовый'],
];
const balloonArea = document.getElementById('balloonArea');
let balloonTimer;
function spawnBalloon() {
  if (balloonArea.childElementCount > 8) return;
  const [c, name, nameRu] = COLORS[Math.floor(Math.random() * COLORS.length)];
  const b = document.createElement('div');
  b.className = 'balloon';
  b.style.setProperty('--c', c);
  b.style.left = (Math.random() * 75) + 'vw';
  b.style.top = '100vh';
  b.style.animationDuration = (7 + Math.random() * 4) + 's';
  b.addEventListener('animationend', () => b.remove());
  b.addEventListener('pointerdown', e => {
    popSound(); vibrate(40);
    say(T(name, nameRu) + '!');
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
// [Farbe, Adjektiv sächlich (das Viereck), Adjektiv männlich (der Halbkreis)]
const BUILD_COLORS = [
  ['#e63946', 'Rotes', 'Roter', 'Красный'], ['#1d4ed8', 'Blaues', 'Blauer', 'Синий'], ['#ffc300', 'Gelbes', 'Gelber', 'Жёлтый'],
  ['#2a9d4a', 'Grünes', 'Grüner', 'Зелёный'], ['#ff8c00', 'Oranges', 'Oranger', 'Оранжевый'], ['#9b5de5', 'Lila', 'Lila', 'Фиолетовый'],
];
const SHAPE_NAME = { sq: 'Viereck', tri: 'Dreieck', rect: 'Rechteck', semi: 'Halbkreis' };
const SHAPE_NAME_RU = { sq: 'квадрат', tri: 'треугольник', rect: 'прямоугольник', semi: 'полукруг' };
const SHAPES = ['sq', 'rect', 'tri', 'semi'];
// Seitenverhältnis der Formen (Breite, Höhe) – für Palette und Ziehen
const SHAPE_DIM = { sq: [1, 1], tri: [1, 0.9], rect: [2, 1], semi: [2, 1], door: [0.65, 1], win: [1, 1], stairs: [1.3, 0.6], chim: [0.5, 1] };
// Ausstattung: kommt nach Wänden und Dach dran
const EXTRA = {
  door: ['Die Tür!', 'Дверь!'], stairs: ['Die Treppe!', 'Лестница!'],
  win: ['Ein Fenster!', 'Окно!'], chim: ['Der Schornstein!', 'Труба!'],
};
function extrasIntro(types) {
  say(T('Jetzt kommen Tür, Treppe und Fenster' + (types.has('chim') ? ' – und der Schornstein!' : '!'),
        'Теперь дверь, лестница и окна' + (types.has('chim') ? ' – и труба!' : '!')));
}
// Fenster gleichmäßig verteilen (höchstens n Stück)
function spread(list, n) {
  if (list.length <= n) return list.slice();
  const out = new Set();
  for (let i = 0; i < n; i++) out.add(list[Math.round(i * (list.length - 1) / (n - 1))]);
  return [...out];
}
function colorWord(c, type) { return type === 'semi' ? c[2] : c[1]; }

const EXTRA_SVG = {
  door: `<path d="M10 98V34A40 30 0 0 1 90 34V98Z" fill="#8d5524" stroke="#5c3317" stroke-width="5"/>
    <path d="M24 92V40A26 18 0 0 1 76 40V92Z" fill="none" stroke="#b07040" stroke-width="4"/><circle cx="70" cy="64" r="6" fill="#ffd166"/>`,
  win: `<rect x="6" y="6" width="88" height="80" rx="6" fill="#bde0fe" stroke="#fff" stroke-width="9"/>
    <path d="M50 8V84M8 46H92" stroke="#fff" stroke-width="7"/><path d="M18 18L34 34" stroke="#fff" stroke-width="5" opacity=".7"/>
    <rect x="0" y="86" width="100" height="12" rx="4" fill="#d9a066"/>`,
  stairs: `<g fill="#b0b7c3" stroke="#6b7280" stroke-width="4"><rect x="3" y="66" width="94" height="31" rx="3"/>
    <rect x="15" y="35" width="70" height="31" rx="3"/><rect x="27" y="4" width="46" height="31" rx="3"/></g>`,
  chim: `<rect x="10" y="14" width="80" height="84" fill="#b5523b" stroke="#7a2e1f" stroke-width="5"/>
    <path d="M10 36H90M10 58H90M10 80H90M50 14V36M30 36V58M70 36V58M50 58V80M30 80V98M70 80V98" stroke="#e8a28f" stroke-width="3"/>
    <rect x="2" y="2" width="96" height="16" rx="3" fill="#5c3317"/>`,
};
const EXTRA_GHOST = {
  door: 'M10 98V34A40 30 0 0 1 90 34V98Z', win: 'M6 6H94V94H6Z',
  stairs: 'M3 97V66H15V35H27V4H73V35H85V66H97V97Z', chim: 'M10 98V2H90V98Z',
};
function shapeSVG(type, color, ghost) {
  if (EXTRA_SVG[type]) {
    return ghost
      ? `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path d="${EXTRA_GHOST[type]}" fill="rgba(255,255,255,.45)" stroke="#fff" stroke-width="4" stroke-dasharray="8 6" vector-effect="non-scaling-stroke"/></svg>`
      : `<svg viewBox="0 0 100 100" preserveAspectRatio="none">${EXTRA_SVG[type]}</svg>`;
  }
  const shapes = {
    sq: i => `<rect x="${i}" y="${i}" width="${100 - 2 * i}" height="${100 - 2 * i}" rx="${ghost ? 4 : 8}"/>`,
    rect: i => `<rect x="${i / 2}" y="${i}" width="${100 - i}" height="${100 - 2 * i}" rx="${ghost ? 3 : 5}"/>`,
    tri: i => `<polygon points="50,${i * 1.6} ${100 - i},${100 - i} ${i},${100 - i}"/>`,
    semi: i => `<path d="M${i / 2},${100 - i} A${50 - i / 2} ${100 - 2 * i} 0 0 1 ${100 - i / 2},${100 - i} Z"/>`,
  };
  const shape = shapes[type];
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
function setRect(el, r) {
  el.style.left = r.left + 'px'; el.style.top = r.top + 'px';
  el.style.width = r.width + 'px'; el.style.height = r.height + 'px';
}
function updatePalette() {
  const c = BUILD_COLORS[colorIdx % BUILD_COLORS.length][0];
  document.querySelectorAll('.pal').forEach(p => { p.innerHTML = shapeSVG(p.dataset.shape, c, false); });
}
// Nur die Formen zeigen, die für dieses Gebäude gebraucht werden
function showPalette(palList, types) {
  palList.forEach(p => { p.hidden = !types.has(p.dataset.shape); });
  palList[0].parentNode.classList.toggle('few', types.size <= 2);
}
// Schmuck oben auf dem Gebäude: Kreuz als Zeichnung (das Emoji sieht je nach Gerät wie ein lila Kästchen aus)
const CROSS_SVG = '<svg viewBox="0 0 40 60"><path d="M16 0h8v16h14v8H24v36h-8V24H2v-8h14z" fill="#f4c430" stroke="#b8860b" stroke-width="2"/></svg>';
function topHTML(top) { return top === '✝️' ? CROSS_SVG : top; }
function magnetClick() {
  tone(1500, 0.05, 'square', 0.12);
  tone(2200, 0.08, 'square', 0.08, 0.04);
}
function landedSpeech(list, target, colorEntry, isWall, level) {
  const walls = list.filter(s => isWall(s) && level(s) === level(target));
  if (isWall(target) && walls.every(s => s.landed)) {
    const n = level(target) + 1;
    say(T(n === 1 ? 'Ein Stockwerk!' : n + ' Stockwerke!', ruFloors(n)));
    [0, 1].forEach(i => pianoNote(freq(['C5', 'G5'][i]), i * 0.1, null, 0.3));
  } else {
    say(T(colorWord(colorEntry, target.type) + ' ' + SHAPE_NAME[target.type], colorEntry[3] + ' ' + SHAPE_NAME_RU[target.type]) + '!');
  }
}
function celebrate(h) {
  ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pianoNote(freq(n), i * 0.15));
  say(T('Juhu! ' + h.done + ' ist fertig!', 'Ура! ' + h.doneRu + '!'));
}
function announce(h) { say(T('Wir bauen ' + h.say + '!', 'Строим ' + h.sayRu + '!')); }
function bumm() {
  [0, 1, 2, 3, 4].forEach(i => tone(600 - i * 90, 0.15, 'triangle', 0.25, i * 0.09));
  say(T('Bumm!', 'Бум!'));
}

/* ----- 2D ----- */
// Teile: [Form, Spalte, Reihe (0 = unten), Breite, Höhe]  (Breite/Höhe in Plattengrößen)
function P(type, x, y, w, h) {
  const [dw, dh] = { sq: [1, 1], rect: [2, 1], tri: [1, null], semi: [1, null] }[type];
  w = w || dw;
  if (h == null) h = dh != null ? dh : type === 'semi' ? w / 2 : (w === 1 ? 0.9 : 0.6 + 0.3 * w);
  return { type, x, y, w, h };
}
function stack(x, from, to) { const o = []; for (let y = from; y < to; y++) o.push(P('sq', x, y)); return o; }
const HOUSES = [
  { say: 'ein Haus', done: 'Das Haus', sayRu: 'дом', doneRu: 'Дом готов', chim: true, parts: [P('rect', 0, 0), P('sq', 0, 1), P('sq', 1, 1), P('tri', 0, 2, 2)] },
  { say: 'einen Turm mit Kuppel', done: 'Der Turm', sayRu: 'башню с куполом', doneRu: 'Башня готова', parts: [...stack(0, 0, 4), P('semi', 0, 4)] },
  { say: 'eine Kirche', done: 'Die Kirche', sayRu: 'церковь', doneRu: 'Церковь готова', top: '✝️', parts: [
    P('rect', 0, 0), P('rect', 0, 1), P('tri', 0, 2, 2),
    ...stack(2, 0, 4), P('tri', 2, 4, 1, 1.8)] },
  { say: 'ein Hochhaus', done: 'Das Hochhaus', sayRu: 'высокий дом', doneRu: 'Высокий дом готов', chim: true, parts: [...stack(0, 0, 5), ...stack(1, 0, 5), P('tri', 0, 5, 2)] },
  { say: 'eine Burg', done: 'Die Burg', sayRu: 'крепость', doneRu: 'Крепость готова', top: '🚩', parts: [
    ...stack(0, 0, 3), P('tri', 0, 3), P('rect', 1, 0), P('rect', 1, 1), P('semi', 1, 2, 2),
    ...stack(3, 0, 3), P('tri', 3, 3)] },
  { say: 'ein Schloss', done: 'Das Schloss', sayRu: 'замок', doneRu: 'Замок готов', top: '👑', parts: [
    P('rect', 0, 0), P('rect', 2, 0), P('rect', 0, 1), P('rect', 2, 1),
    P('tri', 0, 2), P('semi', 1, 2, 2), P('tri', 3, 2)] },
  { say: 'eine große Kirche', done: 'Die große Kirche', sayRu: 'большую церковь', doneRu: 'Большая церковь готова', top: '✝️', parts: [
    ...stack(0, 0, 5), P('tri', 0, 5, 1, 1.8),
    P('rect', 1, 0), P('rect', 1, 1), P('rect', 1, 2), P('semi', 1, 3, 2),
    ...stack(3, 0, 5), P('tri', 3, 5, 1, 1.8)] },
  { say: 'ein großes Hochhaus', done: 'Das große Hochhaus', sayRu: 'очень высокий дом', doneRu: 'Очень высокий дом готов', parts: [...stack(0, 0, 8), ...stack(1, 0, 8), P('semi', 0, 8, 2)] },
];
const bauen = document.getElementById('bauen');
const zone = document.getElementById('buildZone');
const pals = [...bauen.querySelectorAll('.pal')];
let houseIdx = 0, slots = [], colorIdx = 0, houseDone = false, busy = false, sunEl = null, topEl = null, phase2 = false;
const isWall2 = s => s.type === 'sq' || s.type === 'rect';
function house2() { return HOUSES[houseIdx % HOUSES.length]; }

function makePiece(type, color, ghost) {
  const el = document.createElement('div');
  el.className = 'piece' + (ghost ? ' ghost' : '') + (EXTRA[type] ? ' extra' : '');
  el.innerHTML = shapeSVG(type, color, ghost);
  bauen.appendChild(el);
  return el;
}
let unit = 100, originX = 0, groundY = 0;
function layoutHouse() {
  const z = zone.getBoundingClientRect();
  const struct = slots.filter(s => !s.host);
  const cols = Math.max(...struct.map(s => s.x + s.w));
  const rows = Math.max(...struct.map(s => s.y + s.h)) + (house2().top ? 0.7 : 0);
  unit = Math.min(z.width * 0.8 / cols, (z.height - 30) * 0.95 / rows, z.width * 0.3);
  originX = z.left + (z.width - cols * unit) / 2;
  groundY = z.bottom - 14;
  slots.forEach(s => {
    s.rect = s.host ? extraRect(s) : { left: originX + s.x * unit, top: groundY - s.y * unit - s.h * unit, width: s.w * unit, height: s.h * unit };
    setRect(s.ghost, s.rect);
    if (s.piece && s.landed) setRect(s.piece, s.rect);
    s.piece?.style.setProperty('--fs', unit * 0.55 + 'px');
  });
  if (topEl) placeTop2();
  placeSmoke2();
}
// Lage von Tür, Treppe, Fenster und Schornstein (relativ zur Wand bzw. zum Dach)
function extraRect(s) {
  const r = s.host.rect, u = unit, cx = r.left + r.width / 2;
  const box = (w, h, top, x = cx) => ({ left: x - w / 2, top, width: w, height: h });
  if (s.type === 'door') return box(0.42 * u, 0.6 * u, r.top + r.height - 0.6 * u - 0.18 * u);
  if (s.type === 'stairs') return box(0.78 * u, 0.2 * u, r.top + r.height - 0.2 * u);
  if (s.type === 'win') return s.host.type === 'rect' ? box(0.9 * u, 0.48 * u, r.top + r.height / 2 - 0.27 * u) : box(0.5 * u, 0.5 * u, r.top + r.height / 2 - 0.28 * u);
  // Schornstein: auf der rechten Dachschräge
  const x = r.left + r.width * 0.75, bottom = r.top + r.height * 0.5 + 0.12 * u;
  return box(0.26 * u, 0.62 * u, bottom - 0.62 * u, x);
}
function extras2(struct, h) {
  const walls = struct.filter(isWall2);
  const bottom = walls.filter(s => s.y === 0).sort((a, b) => a.x - b.x);
  const door = bottom[Math.floor((bottom.length - 1) / 2)];
  const out = [{ type: 'door', host: door }, { type: 'stairs', host: door }];
  spread(walls.filter(w => w !== door), 6).forEach(w => out.push({ type: 'win', host: w }));
  const roof = struct.find(s => s.type === 'tri' && s.w >= 2);
  if (h.chim && roof) out.push({ type: 'chim', host: roof });
  return out.map(e => ({ ...e, phase: 2, filled: false, landed: false }));
}
let smokeEl = null;
function placeSmoke2() {
  if (!smokeEl) return;
  const c = slots.find(s => s.type === 'chim');
  smokeEl.style.left = (c.rect.left + c.rect.width / 2) + 'px';
  smokeEl.style.top = c.rect.top + 'px';
  smokeEl.style.fontSize = unit * 0.4 + 'px';
}
function startExtras2() {
  phase2 = true;
  const ex = slots.filter(s => s.phase === 2);
  ex.forEach(s => { s.ghost.style.display = ''; });
  const types = new Set(ex.map(s => s.type));
  showPalette(pals, types);
  updatePalette();
  setTimeout(() => extrasIntro(types), 1300);
}
function newHouse(doAnnounce = true) {
  bauen.querySelectorAll('.piece, .topdeco, .smoke').forEach(p => p.remove());
  sunEl?.remove(); sunEl = null; topEl = null; smokeEl = null;
  bauen.classList.remove('house-done');
  houseDone = false; phase2 = false;
  const struct = house2().parts.map(p => ({ ...p, filled: false, landed: false }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  slots = [...struct, ...extras2(struct, house2())];
  slots.forEach(s => { s.ghost = makePiece(s.type, null, true); if (s.phase === 2) s.ghost.style.display = 'none'; });
  showPalette(pals, new Set(struct.map(s => s.type)));
  layoutHouse();
  updatePalette();
  if (doAnnounce) announce(house2());
}
function hintShape(type) {
  slots.filter(s => !s.filled && s.type === type).forEach(s => {
    s.ghost.classList.remove('hint'); void s.ghost.offsetWidth; s.ghost.classList.add('hint');
  });
}
function wiggle(pal) { pal.classList.remove('wiggle'); void pal.offsetWidth; pal.classList.add('wiggle'); }
// Platte zur Lücke fliegen lassen. from = Startrechteck, point = Ablagepunkt (beim Ziehen)
function place(type, from, point, dragEl) {
  if (houseDone) return;
  const free = slots.filter(s => !s.filled && s.type === type && (s.phase === 2) === phase2);
  if (!free.length) {
    tone(200, 0.25, 'sine', 0.25);
    Object.keys(SHAPE_DIM).filter(t => t !== type).forEach(hintShape);
    wiggle(pals.find(p => p.dataset.shape === type));
    dragEl?.remove();
    return;
  }
  let target = free[0];
  if (point) { // Magnet: nächstgelegene passende Lücke
    const d = s => Math.hypot(s.rect.left + s.rect.width / 2 - point.x, s.rect.top + s.rect.height / 2 - point.y);
    target = free.reduce((a, b) => (d(b) < d(a) ? b : a));
  }
  const ce = EXTRA[type] ? BUILD_COLORS[0] : BUILD_COLORS[colorIdx++ % BUILD_COLORS.length];
  updatePalette();
  const el = dragEl || makePiece(type, ce[0], false);
  if (dragEl && EXTRA[type]) dragEl.classList.add('extra');
  if (!dragEl) setRect(el, from);
  target.filled = true; target.piece = el;
  void el.offsetWidth;
  el.classList.add('fly');
  setRect(el, target.rect);
  vibrate(20);
  setTimeout(() => {
    el.classList.remove('fly');
    target.landed = true;
    target.ghost.style.opacity = 0;
    magnetClick();
    if (EXTRA[type]) say(T(...EXTRA[type]));
    else landedSpeech(slots, target, ce, isWall2, s => s.y);
    if (!phase2 && slots.filter(s => s.phase !== 2).every(s => s.landed)) startExtras2();
    else if (slots.every(s => s.landed)) finishHouse();
  }, 360);
}
function placeTop2() {
  const hi = slots.filter(s => !s.host).reduce((a, b) => (b.y + b.h > a.y + a.h ? b : a));
  topEl.style.left = (hi.rect.left + hi.rect.width / 2) + 'px';
  topEl.style.top = (hi.rect.top - unit * 0.35) + 'px';
  topEl.style.fontSize = unit * 0.6 + 'px';
}
function finishHouse() {
  houseDone = true;
  if (slots.some(s => s.type === 'chim')) {
    smokeEl = document.createElement('div'); smokeEl.className = 'smoke';
    smokeEl.innerHTML = '<i></i><i></i><i></i>';
    bauen.appendChild(smokeEl); placeSmoke2();
  }
  if (house2().top) {
    topEl = document.createElement('div'); topEl.className = 'topdeco'; topEl.innerHTML = topHTML(house2().top);
    bauen.appendChild(topEl); placeTop2();
  }
  sunEl = document.createElement('div'); sunEl.className = 'sun'; sunEl.textContent = '☀️';
  zone.appendChild(sunEl);
  setTimeout(() => { bauen.classList.add('house-done'); celebrate(house2()); }, 500);
}
function tumble() {
  if (!houseDone || busy) return;
  busy = true;
  bumm();
  topEl?.remove(); topEl = null; smokeEl?.remove(); smokeEl = null;
  slots.forEach(s => {
    const p = s.piece;
    p.classList.add('tumble');
    p.style.transform = `translate(${Math.random() * 300 - 150}px, ${100 + Math.random() * 150}px) rotate(${Math.random() * 360 - 180}deg)`;
    s.ghost.style.opacity = 0;
  });
  setTimeout(() => { houseIdx++; newHouse(); busy = false; }, 950);
}
zone.addEventListener('pointerdown', tumble);
// Vor/Zurück: anderes Bauwerk auswählen
function switchHouse(dir) {
  if (busy) return;
  houseIdx = (houseIdx + dir + HOUSES.length) % HOUSES.length;
  tone(dir > 0 ? 760 : 560, 0.15, 'triangle', 0.2);
  newHouse();
}

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
    const [dw, dh] = SHAPE_DIM[pal.dataset.shape];
    if (!dragEl && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 15) {
      const c = BUILD_COLORS[colorIdx % BUILD_COLORS.length][0];
      dragEl = document.createElement('div');
      dragEl.className = 'piece';
      dragEl.innerHTML = shapeSVG(pal.dataset.shape, c, false);
      host.appendChild(dragEl);
      size = o.size();
    }
    if (dragEl) setRect(dragEl, { left: e.clientX - size * dw / 2, top: e.clientY - size * dh / 2, width: size * dw, height: size * dh });
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
  enter() { if (!slots.length) newHouse(); else { layoutHouse(); announce(house2()); } },
};
addEventListener('resize', () => { if (current === 'bauen' && slots.length) layoutHouse(); });

/* ----- 3D: Gebäude aus mehreren Blöcken ----- */
const b3 = document.getElementById('bauen3d');
const scene = document.getElementById('scene3d');
const stage = document.getElementById('stage3d');
const pals3 = [...b3.querySelectorAll('.pal')];
// Block: x/z = Lage (in Plattengrößen), W = Länge, D = Tiefe, F = Stockwerke,
// roof: pyramid | spire (Kirchturmspitze) | gable (Satteldach) | dome (Kuppel aus Halbkreisen) | none,
// rect: lange Wände aus Rechtecken
const HOUSES3D = [
  { say: 'ein Haus', done: 'Das Haus', sayRu: 'дом', doneRu: 'Дом готов', chim: true, blocks: [{ W: 1, D: 1, F: 1, roof: 'pyramid' }] },
  { say: 'ein langes Haus', done: 'Das lange Haus', sayRu: 'длинный дом', doneRu: 'Длинный дом готов', chim: true, blocks: [{ W: 2, D: 1, F: 2, roof: 'gable', rect: true }] },
  { say: 'einen Turm mit Kuppel', done: 'Der Turm', sayRu: 'башню с куполом', doneRu: 'Башня готова', blocks: [{ W: 1, D: 1, F: 3, roof: 'dome' }] },
  { say: 'eine Kirche', done: 'Die Kirche', sayRu: 'церковь', doneRu: 'Церковь готова', top: '✝️', blocks: [
    { x: 0, W: 3, D: 1, F: 1, roof: 'gable', rect: true },     // Kirchenschiff
    { x: 3, W: 1, D: 1, F: 3, roof: 'spire', top: true },      // Kirchturm
    { x: -1, W: 1, D: 1, F: 1, roof: 'dome' }] },              // runde Apsis
  { say: 'ein großes Haus', done: 'Das große Haus', sayRu: 'большой дом', doneRu: 'Большой дом готов', chim: true, blocks: [{ W: 2, D: 2, F: 2, roof: 'pyramid' }] },
  { say: 'eine Burg', done: 'Die Burg', sayRu: 'крепость', doneRu: 'Крепость готова', top: '🚩', blocks: [
    { x: 0, z: 0, W: 2, D: 2, F: 1, roof: 'none' },
    { x: -1, z: -1, W: 1, D: 1, F: 2, roof: 'spire', top: true },
    { x: 2, z: 2, W: 1, D: 1, F: 2, roof: 'spire', top: true }] },
  { say: 'ein Schloss', done: 'Das Schloss', sayRu: 'замок', doneRu: 'Замок готов', top: '👑', blocks: [
    { x: 0, W: 2, D: 1, F: 1, roof: 'gable', rect: true },
    { x: -1, W: 1, D: 1, F: 2, roof: 'dome', top: true },
    { x: 2, W: 1, D: 1, F: 2, roof: 'dome', top: true }] },
  { say: 'ein Hochhaus', done: 'Das Hochhaus', sayRu: 'высокий дом', doneRu: 'Высокий дом готов', chim: true, blocks: [{ W: 3, D: 1, F: 5, roof: 'gable', rect: true }] },
  { say: 'einen hohen Turm', done: 'Der Turm', sayRu: 'высокую башню', doneRu: 'Башня готова', blocks: [{ W: 1, D: 1, F: 6, roof: 'spire' }] },
];
let h3Idx = 0, slots3 = [], done3 = false, busy3 = false, S3 = 100, angle = -30, spin = 0.012, phase3 = false;
let raf3 = null, lastT = 0, dragRot = null, plate = null, topEls3 = [];
function house3() { return HOUSES3D[h3Idx % HOUSES3D.length]; }
function blocks3() { return house3().blocks.map(b => ({ x: 0, z: 0, ...b })); }
function roofH(b) { return { pyramid: b.W / Math.SQRT2, spire: b.W * 1.9, gable: b.D * 0.87, dome: b.W / 2, none: 0 }[b.roof]; }
const sideLen = (b, side) => (side % 2 === 0 ? b.W : b.D);
const sideDist = (b, side) => (side % 2 === 0 ? b.D : b.W) / 2;
// Liegt ein Teil an der Wand eines anderen Blocks an? Dann wird es weggelassen.
function hiddenBy(b, all, side, lx, level) {
  const d = sideDist(b, side);
  const rot = [[lx, d], [d, -lx], [-lx, -d], [-d, lx]][side];
  const px = b.x + b.W / 2 + rot[0], pz = b.z + b.D / 2 + rot[1], e = 1e-6;
  return all.some(c => c !== b && level < c.F &&
    px >= c.x - e && px <= c.x + c.W + e && pz >= c.z - e && pz <= c.z + c.D + e);
}
function wallPieces(n, useRect) {
  const out = []; let x = 0;
  while (x < n) { if (useRect && n - x >= 2) { out.push([x, 2]); x += 2; } else { out.push([x, 1]); x += 1; } }
  return out;
}
function buildSlots3(bs) {
  const out = [];
  bs.forEach(b => {
    for (let f = 0; f < b.F; f++) for (let side = 0; side < 4; side++) {
      const n = sideLen(b, side);
      wallPieces(n, b.rect && side % 2 === 0).forEach(([x, w]) => {
        if (!hiddenBy(b, bs, side, x + w / 2 - n / 2, f)) out.push({ kind: 'wall', type: w === 2 ? 'rect' : 'sq', b, side, x, w, f, lvl: f });
      });
    }
    const L = b.F + 0.5;
    if (b.roof === 'pyramid' || b.roof === 'spire') for (let side = 0; side < 4; side++) out.push({ kind: 'pyr', type: 'tri', b, side, lvl: L });
    if (b.roof === 'gable') {
      [0, 2].forEach(side => { for (let x = 0; x < b.W; x++) out.push({ kind: 'slope', type: 'sq', b, side, x, lvl: L }); });
      [1, 3].forEach(side => { if (!hiddenBy(b, bs, side, 0, b.F)) out.push({ kind: 'gtri', type: 'tri', b, side, lvl: L }); });
    }
    if (b.roof === 'dome') for (let k = 0; k < 4; k++) out.push({ kind: 'dome', type: 'semi', b, k, lvl: L });
  });
  out.sort((a, c) => a.lvl - c.lvl);
  // Ausstattung: Tür + Treppe vorne am ersten Block, Fenster verteilt, Schornstein auf dem Dach
  const walls = out.filter(s => s.kind === 'wall');
  const front = walls.filter(s => s.b === bs[0] && s.side === 0 && s.f === 0);
  const door = front[Math.floor((front.length - 1) / 2)];
  const ex = [{ kind: 'ov', type: 'door', host: door }, { kind: 'ov', type: 'stairs', host: door }];
  spread(walls.filter(w => w !== door), 8).forEach(w => ex.push({ kind: 'ov', type: 'win', host: w }));
  const rb = bs.find(b => b.roof === 'gable' || b.roof === 'pyramid');
  if (house3().chim && rb) ex.push({ kind: 'chim', type: 'chim', b: rb });
  ex.forEach(e => { e.phase = 2; e.lvl = 99; e.b = e.b || e.host.b; });
  return [...out, ...ex];
}
function geom3(s, r = 0) {
  const b = s.b, S = S3;
  if (s.kind === 'ov') { // auf der Wand, leicht davor
    const g = geom3(s.host);
    const [w, h, dy] = s.type === 'door' ? [0.42 * S, 0.6 * S, S / 2 - 0.3 * S - 0.18 * S]
      : s.type === 'stairs' ? [0.78 * S, 0.2 * S, S / 2 - 0.1 * S]
      : s.host.type === 'rect' ? [0.9 * S, 0.48 * S, -0.03 * S] : [0.5 * S, 0.5 * S, -0.03 * S];
    return { w, h, tf: g.tf + ` translate3d(0, ${dy}px, ${s.type === 'stairs' ? 4 : 2}px)` };
  }
  if (s.kind === 'chim') { // zwei gekreuzte Flächen auf der Dachschräge
    const h = 0.62 * S, base = -(b.F * S + roofH(b) * S / 2) + 0.12 * S;
    return { w: 0.26 * S, h, tf: `translate3d(${b.ox + 0.25 * b.W * S}px, ${base - h / 2}px, ${b.oz + 0.25 * b.D * S}px) rotateY(${r}deg)` };
  }
  const at = `translate3d(${b.ox}px, 0, ${b.oz}px) `;
  const rot = `rotateY(${(s.side || 0) * 90}deg) `;
  if (s.kind === 'wall') {
    const n = sideLen(b, s.side);
    return { w: s.w * S, h: S, tf: at + rot + `translate3d(${(s.x + s.w / 2 - n / 2) * S}px, ${-(s.f + 0.5) * S}px, ${sideDist(b, s.side) * S}px)` };
  }
  if (s.kind === 'pyr') {
    const L = b.W * S, H = roofH(b) * S, hs = Math.hypot(H, L / 2);
    const tilt = Math.atan((L / 2) / H) * 180 / Math.PI;
    return { w: L, h: hs, tf: at + rot + `translate3d(0, ${-b.F * S}px, ${L / 2}px) rotateX(${tilt}deg) translateY(${-hs / 2}px)` };
  }
  if (s.kind === 'gtri') {
    const G = b.D * S, hs = G * Math.sqrt(3) / 2;
    return { w: G, h: hs, tf: at + rot + `translate3d(0, ${-b.F * S - hs / 2}px, ${b.W * S / 2}px)` };
  }
  if (s.kind === 'slope') {
    const G = b.D * S;
    return { w: S, h: G, tf: at + rot + `translate3d(${(s.x - (b.W - 1) / 2) * S}px, ${-b.F * S}px, ${G / 2}px) rotateX(30deg) translateY(${-G / 2}px)` };
  }
  const R = b.W * S / 2; // Kuppel: 4 Halbkreise, im Stern angeordnet
  return { w: 2 * R, h: R, tf: at + `rotateY(${s.k * 45}deg) translate3d(0, ${-b.F * S - R / 2}px, 0)` };
}
function applyGeom(el, g, extra = '') {
  el.style.width = g.w + 'px'; el.style.height = g.h + 'px';
  el.style.marginLeft = -g.w / 2 + 'px'; el.style.marginTop = -g.h / 2 + 'px';
  el.style.transform = extra + g.tf;
}
function face3(type, color, ghost) {
  const el = document.createElement('div');
  el.className = 'face' + (ghost ? ' ghost' : '') + (EXTRA[type] ? ' extra' : '');
  el.innerHTML = shapeSVG(type, color, ghost);
  stage.appendChild(el);
  return el;
}
let bs3 = [];
function layout3d() {
  const z = scene.getBoundingClientRect();
  const x0 = Math.min(...bs3.map(b => b.x)), x1 = Math.max(...bs3.map(b => b.x + b.W));
  const z0 = Math.min(...bs3.map(b => b.z)), z1 = Math.max(...bs3.map(b => b.z + b.D));
  const maxH = Math.max(...bs3.map(b => b.F + roofH(b))) + (house3().top ? 0.6 : 0);
  S3 = Math.min(z.height * 0.62 / maxH, z.width * 0.72 / Math.hypot(x1 - x0, z1 - z0), 170);
  bs3.forEach(b => { b.ox = (b.x + b.W / 2 - (x0 + x1) / 2) * S3; b.oz = (b.z + b.D / 2 - (z0 + z1) / 2) * S3; });
  stage.style.top = (z.height * 0.44 + maxH * S3 / 2) + 'px';
  slots3.forEach(s => {
    const g = geom3(s);
    applyGeom(s.ghost, g);
    if (s.piece && s.landed) applyGeom(s.piece, g);
    if (s.cross) applyGeom(s.cross, geom3(s, 90));
    s.piece?.style.setProperty('--fs', S3 * 0.5 + 'px');
  });
  applyGeom(plate, { w: (x1 - x0 + 0.8) * S3, h: (z1 - z0 + 0.8) * S3, tf: 'rotateX(90deg)' });
  topEls3.forEach(t => {
    const b = t.b, y = -(b.F + roofH(b)) * S3 - S3 * 0.35;
    applyGeom(t.el, { w: S3 * 0.7, h: S3 * 0.7, tf: `translate3d(${b.ox}px, ${y}px, ${b.oz}px) rotateY(${t.r}deg)` });
    t.el.style.fontSize = S3 * 0.55 + 'px';
  });
}
function newHouse3d(doAnnounce = true) {
  stage.innerHTML = '';
  topEls3 = [];
  b3.classList.remove('house-done');
  done3 = false; phase3 = false;
  bs3 = blocks3();
  plate = document.createElement('div'); plate.className = 'plate'; stage.appendChild(plate);
  slots3 = buildSlots3(bs3);
  slots3.forEach(s => { s.ghost = face3(s.type, null, true); if (s.phase === 2) s.ghost.style.display = 'none'; });
  showPalette(pals3, new Set(slots3.filter(s => s.phase !== 2).map(s => s.type)));
  layout3d();
  updatePalette();
  if (doAnnounce) announce(house3());
}
function place3d(type, point, dragEl) {
  dragEl?.remove();
  if (done3) return;
  const free = slots3.filter(s => !s.filled && s.type === type && (s.phase === 2) === phase3);
  if (!free.length) {
    tone(200, 0.25, 'sine', 0.25);
    wiggle(pals3.find(p => p.dataset.shape === type));
    return;
  }
  let target = free[0];
  if (point) {
    const d = s => { const r = s.ghost.getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - point.x, r.top + r.height / 2 - point.y); };
    target = free.reduce((a, b) => (d(b) < d(a) ? b : a));
  }
  const ce = EXTRA[type] ? BUILD_COLORS[0] : BUILD_COLORS[colorIdx++ % BUILD_COLORS.length];
  updatePalette();
  const el = face3(type, ce[0], false);
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
    if (type === 'chim') { target.cross = face3('chim', null, false); applyGeom(target.cross, geom3(target, 90)); }
    if (EXTRA[type]) say(T(...EXTRA[type]));
    else landedSpeech(slots3, target, ce, s => s.kind === 'wall', s => s.lvl);
    if (!phase3 && slots3.filter(s => s.phase !== 2).every(s => s.landed)) startExtras3();
    else if (slots3.every(s => s.landed)) finish3d();
  }, 480);
}
function startExtras3() {
  phase3 = true;
  const ex = slots3.filter(s => s.phase === 2);
  ex.forEach(s => { s.ghost.style.display = ''; });
  const types = new Set(ex.map(s => s.type));
  showPalette(pals3, types);
  updatePalette();
  setTimeout(() => extrasIntro(types), 1300);
}
function finish3d() {
  done3 = true;
  // Kreuz, Fahne oder Krone oben auf den Türmen (zwei gekreuzte Ebenen, damit man es von allen Seiten sieht)
  if (house3().top) bs3.filter(b => b.top || bs3.length === 1).forEach(b => [0, 90].forEach(r => {
    const el = document.createElement('div');
    el.className = 'face topdeco3'; el.innerHTML = topHTML(house3().top);
    stage.appendChild(el); topEls3.push({ el, b, r });
  }));
  layout3d();
  setTimeout(() => {
    b3.classList.add('house-done');
    celebrate(house3());
    spin = 0.09; setTimeout(() => { spin = 0.012; }, 1500);
  }, 500);
}
function tumble3d() {
  if (!done3 || busy3) return;
  busy3 = true;
  bumm();
  topEls3.forEach(t => t.el.remove()); topEls3 = [];
  slots3.forEach(s => {
    const g = geom3(s);
    s.piece.classList.add('tumble3d');
    s.piece.style.transform = `translate3d(${Math.random() * 400 - 200}px, ${150 + Math.random() * 150}px, ${Math.random() * 300 - 100}px) rotateX(${Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg) ` + g.tf;
    s.piece.style.opacity = 0;
    s.ghost.style.opacity = 0;
    s.cross?.remove();
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
    if (!slots3.length) newHouse3d(); else { layout3d(); announce(house3()); }
    lastT = 0; raf3 = requestAnimationFrame(tick3d);
  },
  leave() { cancelAnimationFrame(raf3); },
};
addEventListener('resize', () => { if (current === 'bauen3d' && slots3.length) layout3d(); });
function switchHouse3d(dir) {
  if (busy3) return;
  h3Idx = (h3Idx + dir + HOUSES3D.length) % HOUSES3D.length;
  tone(dir > 0 ? 760 : 560, 0.15, 'triangle', 0.2);
  newHouse3d();
}
document.querySelectorAll('.navBuild button').forEach(btn => btn.addEventListener('click', e => {
  e.stopPropagation();
  const dir = +btn.dataset.dir;
  if (current === 'bauen3d') switchHouse3d(dir); else switchHouse(dir);
}));

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
  { car: '🚒', call: 'Hilfe! Feuer! Es brennt! Hilfe!', callRu: 'Помогите! Пожар! Горит! Помогите!', nameRu: 'Та-ту, та-та! Едут пожарные!', need: '🔥', solved: '💨',
    name: 'Ta tü, ta ta! Die Feuerwehr kommt!', siren: ['G4', 'C5'], song: 'jakob', title: 'Bruder Jakob' },
  { car: '🚑', call: 'Aua! Ich bin verletzt. Ich brauche ein Pflaster!', callRu: 'Ай! Мне больно. Мне нужен пластырь!', nameRu: 'Едет скорая помощь!', need: '🤕', solved: '🩹',
    name: 'Der Krankenwagen kommt!', siren: ['A4', 'D5'], song: 'entchen', title: 'Alle meine Entchen' },
  { car: '🚓', call: 'Hilfe! Ich brauche Hilfe!', callRu: 'Помогите! Мне нужна помощь!', nameRu: 'Едет полиция!', need: '😟', solved: '😊',
    name: 'Die Polizei kommt!', siren: ['B4', 'E5'], song: 'haenschen', title: 'Hänschen klein' },
  { car: THW_SVG, call: 'Hilfe! Wasser kommt!', callRu: 'Помогите! Вода прибывает!', nameRu: 'Едет служба спасения!', need: '🌊', solved: '☀️',
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
  say(T(v.call, v.callRu), { pitch: 1.6, rate: 0.95, done: () => { if (id === playId) rescue(v, btn, need); } });
}
function rescue(v, btn, need) {
  btn.classList.remove('calling'); btn.classList.add('playing');
  // 2) Tatü-tata, fährt weg (zum Einsatz) und kommt zurück
  const car = btn.querySelector('.car');
  car.classList.remove('drive'); void car.offsetWidth; car.classList.add('drive');
  for (let i = 0; i < 4; i++) sirenTone(freq(v.siren[i % 2]), i * 0.5, 0.48, songBus);
  songTimers.push(setTimeout(() => say(T(v.name, v.nameRu)), 2050));
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

/* ---------- Wer ist das? Tiernamen nach Lebensräumen ---------- */
// [Bild, deutscher Name mit Artikel, russischer Name]
const HABITATS = [
  { icon: '🚜', de: 'Auf dem Bauernhof', ru: 'На ферме', bg: 'linear-gradient(#bde0fe, #d8f3dc 55%, #b7e4c7)', animals: [
    ['kuh', 'die Kuh', 'Корова'], ['schwein', 'das Schwein', 'Свинья'], ['schaf', 'das Schaf', 'Овца'], ['widder', 'der Widder', 'Баран'],
    ['huhn', 'das Huhn', 'Курица'], ['hahn', 'der Hahn', 'Петух'], ['kueken', 'das Küken', 'Цыплёнок'], ['pferd', 'das Pferd', 'Лошадь'],
    ['esel', 'der Esel', 'Ослик'], ['ente', 'die Ente', 'Утка'], ['gans', 'die Gans', 'Гусь'], ['truthahn', 'der Truthahn', 'Индюк'],
    ['ziege', 'die Ziege', 'Коза'], ['ochse', 'der Ochse', 'Бык'], ['lama', 'das Lama', 'Лама']] },
  { icon: '🏠', de: 'Unsere Haustiere', ru: 'Домашние питомцы', bg: 'linear-gradient(#ffe5ec, #fff1e6 60%, #fde2e4)', animals: [
    ['hund', 'der Hund', 'Собака'], ['katze', 'die Katze', 'Кошка'], ['pudel', 'der Pudel', 'Пудель'],
    ['hamster', 'der Hamster', 'Хомяк'], ['hase', 'der Hase', 'Заяц']] },
  { icon: '🌲', de: 'Im Wald', ru: 'В лесу', bg: 'linear-gradient(#cdeac0, #95d5b2 60%, #74c69d)', animals: [
    ['fuchs', 'der Fuchs', 'Лиса'], ['baer', 'der Bär', 'Медведь'], ['wolf', 'der Wolf', 'Волк'], ['hirsch', 'der Hirsch', 'Олень'],
    ['elch', 'der Elch', 'Лось'], ['wildschwein', 'das Wildschwein', 'Кабан'], ['eule', 'die Eule', 'Сова'], ['igel', 'der Igel', 'Ёжик'],
    ['eichhoernchen', 'das Eichhörnchen', 'Белка'], ['maus', 'die Maus', 'Мышка'], ['biber', 'der Biber', 'Бобр'], ['dachs', 'der Dachs', 'Барсук'],
    ['waschbaer', 'der Waschbär', 'Енот'], ['fledermaus', 'die Fledermaus', 'Летучая мышь'], ['stinktier', 'das Stinktier', 'Скунс'], ['eidechse', 'die Eidechse', 'Ящерица']] },
  { icon: '🦁', de: 'In Afrika', ru: 'В Африке', bg: 'linear-gradient(#ffe8a3, #ffd6a5 60%, #f4c27a)', animals: [
    ['loewe', 'der Löwe', 'Лев'], ['elefant', 'der Elefant', 'Слон'], ['giraffe', 'die Giraffe', 'Жираф'], ['zebra', 'das Zebra', 'Зебра'],
    ['nilpferd', 'das Nilpferd', 'Бегемот'], ['nashorn', 'das Nashorn', 'Носорог'], ['leopard', 'der Leopard', 'Леопард'], ['krokodil', 'das Krokodil', 'Крокодил'],
    ['bueffel', 'der Büffel', 'Буйвол'], ['affe', 'der Affe', 'Обезьяна'], ['gorilla', 'der Gorilla', 'Горилла'], ['kamel', 'das Kamel', 'Верблюд']] },
  { icon: '🐼', de: 'Im Zoo', ru: 'В зоопарке', bg: 'linear-gradient(#e9ecef, #dee2e6 50%, #c7d2fe)', animals: [
    ['tiger', 'der Tiger', 'Тигр'], ['panda', 'der Panda', 'Панда'], ['kaenguru', 'das Känguru', 'Кенгуру'], ['koala', 'der Koala', 'Коала'],
    ['eisbaer', 'der Eisbär', 'Белый медведь'], ['faultier', 'das Faultier', 'Ленивец'], ['orangutan', 'der Orang-Utan', 'Орангутан'],
    ['bison', 'der Bison', 'Бизон'], ['schlange', 'die Schlange', 'Змея']] },
  { icon: '🌊', de: 'Im Wasser', ru: 'В воде', bg: 'linear-gradient(#caf0f8, #90e0ef 50%, #48cae4)', animals: [
    ['fisch', 'der Fisch', 'Рыбка'], ['delfin', 'der Delfin', 'Дельфин'], ['wal', 'der Wal', 'Кит'], ['hai', 'der Hai', 'Акула'],
    ['schildkroete', 'die Schildkröte', 'Черепаха'], ['pinguin', 'der Pinguin', 'Пингвин'], ['robbe', 'die Robbe', 'Тюлень'], ['otter', 'der Otter', 'Выдра'],
    ['krake', 'der Krake', 'Осьминог'], ['tintenfisch', 'der Tintenfisch', 'Кальмар'], ['qualle', 'die Qualle', 'Медуза'], ['krebs', 'die Krabbe', 'Краб'],
    ['hummer', 'der Hummer', 'Омар'], ['garnele', 'die Garnele', 'Креветка'], ['kugelfisch', 'der Kugelfisch', 'Рыба-ёж'], ['frosch', 'der Frosch', 'Лягушка']] },
  { icon: '🕊️', de: 'Die Vögel', ru: 'Птицы', bg: 'linear-gradient(#e0f2fe, #bae6fd 60%, #a5f3fc)', animals: [
    ['adler', 'der Adler', 'Орёл'], ['taube', 'die Taube', 'Голубь'], ['schwan', 'der Schwan', 'Лебедь'], ['pfau', 'der Pfau', 'Павлин'],
    ['flamingo', 'der Flamingo', 'Фламинго'], ['papagei', 'der Papagei', 'Попугай'], ['vogel', 'der Vogel', 'Птичка']] },
  { icon: '🐞', de: 'Kleine Krabbeltiere', ru: 'Букашки', bg: 'linear-gradient(#fff3b0, #d8f3dc 70%)', animals: [
    ['biene', 'die Biene', 'Пчела'], ['schmetterling', 'der Schmetterling', 'Бабочка'], ['marienkaefer', 'der Marienkäfer', 'Божья коровка'],
    ['kaefer', 'der Käfer', 'Жук'], ['grille', 'der Grashüpfer', 'Кузнечик'], ['fliege', 'die Fliege', 'Муха'], ['spinne', 'die Spinne', 'Паук'],
    ['raupe', 'die Raupe', 'Гусеница'], ['wurm', 'der Wurm', 'Червяк'], ['schnecke', 'die Schnecke', 'Улитка'], ['ameise', 'die Ameise', 'Муравей']] },
  { icon: '🦕', de: 'Dinos und Fabelwesen', ru: 'Динозавры и сказочные звери', bg: 'linear-gradient(#e9d5ff, #fbcfe8 60%, #fde68a)', animals: [
    ['trex', 'der Tyrannosaurus', 'Тираннозавр'], ['langhals', 'der Langhals-Dino', 'Диплодок'], ['mammut', 'das Mammut', 'Мамонт'],
    ['dodo', 'der Dodo', 'Додо'], ['einhorn', 'das Einhorn', 'Единорог'], ['drache', 'der Drache', 'Дракон']] },
];
// Bilder-Spiel mit Kategorien (für Tiere und Fahrzeuge): Antippen liest den Namen vor
function makePicker(section, bar, grid, cats, dir) {
  let idx = 0;
  function show(i, speak = true) {
    idx = i;
    const C = cats[i];
    section.style.background = C.bg;
    [...bar.children].forEach((b, k) => b.classList.toggle('on', k === i));
    grid.innerHTML = '';
    if (C.extra) grid.appendChild(C.extra());
    C.items.forEach(([img, de, ru, html], k) => {
      const b = document.createElement('button');
      b.className = 'nameCard';
      b.style.animationDelay = (k * 0.04) + 's';
      b.setAttribute('aria-label', de);
      b.innerHTML = html || `<img src="${dir}/${img}.png" alt="" draggable="false">`;
      b.addEventListener('pointerdown', () => {
        b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump');
        tone(660 + k * 20, 0.12, 'triangle', 0.15);
        vibrate();
        say(T(de.charAt(0).toUpperCase() + de.slice(1), ru) + '!', { rate: 0.8 });
      });
      grid.appendChild(b);
    });
    if (speak) say(T(C.de, C.ru));
  }
  cats.forEach((C, i) => {
    const b = document.createElement('button');
    b.className = 'hab'; b.textContent = C.icon; b.setAttribute('aria-label', C.de);
    b.addEventListener('pointerdown', () => { tone(520, 0.12, 'sine', 0.2); show(i); });
    bar.appendChild(b);
  });
  return { enter() { show(idx); }, show };
}
HABITATS.forEach(H => { H.items = H.animals; });
const namenGame = makePicker(document.getElementById('namen'), document.getElementById('habitats'), document.getElementById('nameGrid'), HABITATS, 'img/tiere');
screens.namen = { enter: namenGame.enter };

/* ---------- Fahrzeuge: Kategorien + Martinshorn ---------- */
// Martinshorn: zwei Töne im Wechsel (Quarte), etwas rau wie ein echtes Horn
let hornBus = null, hornTimer = null;
function martinshorn() {
  const a = audio(), t = a.currentTime;
  if (hornBus) { hornBus.gain.setTargetAtTime(0, t, 0.02); const old = hornBus; setTimeout(() => old.disconnect(), 200); }
  hornBus = a.createGain(); hornBus.gain.value = 0.5;
  const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  hornBus.connect(lp).connect(a.destination);
  const tones = [440, 587.33];
  for (let i = 0; i < 8; i++) {
    const st = t + i * 0.62, f = tones[i % 2];
    [1, 1.005].forEach(det => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = 'sawtooth'; o.frequency.value = f * det;
      g.gain.setValueAtTime(0.0001, st);
      g.gain.exponentialRampToValueAtTime(0.18, st + 0.04);
      g.gain.setValueAtTime(0.18, st + 0.56);
      g.gain.exponentialRampToValueAtTime(0.0001, st + 0.61);
      o.connect(g).connect(hornBus);
      o.start(st); o.stop(st + 0.63);
    });
  }
  document.body.classList.add('blaulicht');
  clearTimeout(hornTimer);
  hornTimer = setTimeout(() => document.body.classList.remove('blaulicht'), 8 * 620);
  vibrate(200);
}
function hornCard() {
  const b = document.createElement('button');
  b.className = 'nameCard hornCard';
  b.setAttribute('aria-label', 'Martinshorn');
  b.innerHTML = '<img src="img/fahrzeuge/blaulicht.png" alt="" draggable="false"><b>Tatütata</b>';
  b.addEventListener('pointerdown', () => { b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump'); martinshorn(); });
  return b;
}
const VEHICLE_CATS = [
  { icon: '🚗', de: 'Die Autos', ru: 'Легковые машины', bg: 'linear-gradient(#e0f2fe, #f1f5f9 60%, #cbd5e1)', items: [
    ['auto', 'das Auto', 'Машина'], ['gelaendewagen', 'der Geländewagen', 'Внедорожник'], ['taxi', 'das Taxi', 'Такси'],
    ['rennwagen', 'der Rennwagen', 'Гоночная машина'], ['pickup', 'der Pick-up', 'Пикап'], ['kleinbus', 'der Kleinbus', 'Микроавтобус']] },
  { icon: '🚚', de: 'Lastwagen und Busse', ru: 'Грузовики и автобусы', bg: 'linear-gradient(#fef3c7, #fde68a 60%, #d6d3d1)', items: [
    ['lastwagen', 'der Lastwagen', 'Грузовик'], ['sattelzug', 'der Sattelzug', 'Фура'], ['traktor', 'der Traktor', 'Трактор'],
    ['bus', 'der Bus', 'Автобус'], ['obus', 'der Oberleitungsbus', 'Троллейбус']] },
  { icon: '✈️', de: 'In der Luft', ru: 'В небе', bg: 'linear-gradient(#bae6fd, #e0f2fe 70%, #fff)', items: [
    ['flugzeug', 'das Flugzeug', 'Самолёт'], ['kleinflugzeug', 'das kleine Flugzeug', 'Маленький самолёт'], ['hubschrauber', 'der Hubschrauber', 'Вертолёт'],
    ['rakete', 'die Rakete', 'Ракета'], ['satellit', 'der Satellit', 'Спутник'], ['ufo', 'das Ufo', 'Летающая тарелка']] },
  { icon: '🚢', de: 'Auf dem Wasser', ru: 'На воде', bg: 'linear-gradient(#e0f2fe, #90e0ef 55%, #0096c7)', items: [
    ['schiff', 'das Schiff', 'Корабль'], ['kreuzfahrtschiff', 'das Kreuzfahrtschiff', 'Лайнер'], ['faehre', 'die Fähre', 'Паром'],
    ['motorboot', 'das Motorboot', 'Моторная лодка'], ['schnellboot', 'das Schnellboot', 'Катер'], ['segelboot', 'das Segelboot', 'Парусная лодка'], ['kanu', 'das Kanu', 'Каноэ']] },
  { icon: '🏍️', de: 'Die Motorräder', ru: 'Мотоциклы', bg: 'linear-gradient(#fee2e2, #fecaca 60%, #e5e7eb)', items: [
    ['motorrad', 'das Motorrad', 'Мотоцикл'], ['motorroller', 'der Motorroller', 'Мотороллер'], ['rikscha', 'die Rikscha', 'Тук-тук']] },
  { icon: '🚲', de: 'Fahrräder und Roller', ru: 'Велосипеды и самокаты', bg: 'linear-gradient(#dcfce7, #bbf7d0 60%, #86efac)', items: [
    ['fahrrad', 'das Fahrrad', 'Велосипед'], ['radfahrer', 'der Radfahrer', 'Велосипедист'], ['mountainbike', 'das Mountainbike', 'Горный велосипед'],
    ['tretroller', 'der Tretroller', 'Самокат'], ['skateboard', 'das Skateboard', 'Скейтборд'], ['rollschuh', 'der Rollschuh', 'Ролики']] },
  { icon: '🚨', de: 'Die Einsatzfahrzeuge', ru: 'Спецмашины', bg: 'linear-gradient(#dbeafe, #fee2e2 70%)', extra: hornCard, items: [
    ['feuerwehr', 'die Feuerwehr', 'Пожарная машина'], ['krankenwagen', 'der Krankenwagen', 'Скорая помощь'],
    ['polizei', 'das Polizeiauto', 'Полицейская машина'], ['thw', 'das Auto vom THW', 'Машина службы спасения', THW_SVG],
    ['hubschrauber', 'der Rettungshubschrauber', 'Вертолёт спасателей']] },
];
const fzGame = makePicker(document.getElementById('fahrzeuge'), document.getElementById('fzBar'), document.getElementById('fzGrid'), VEHICLE_CATS, 'img/fahrzeuge');
screens.fahrzeuge = { enter: fzGame.enter, leave() { document.body.classList.remove('blaulicht'); } };

/* ---------- Sprach-Knopf Deutsch / Russisch (in allen Spielen der 2-Jährigen) ---------- */
const langBtn = document.getElementById('lang');
const toast = document.getElementById('toast');
function paintLang() {
  langBtn.dataset.lang = LANG;
  langBtn.querySelector('b').textContent = LANG === 'ru' ? 'RU' : 'DE';
  langBtn.setAttribute('aria-label', LANG === 'ru' ? 'Sprache: Russisch – umschalten auf Deutsch' : 'Sprache: Deutsch – umschalten auf Russisch');
}
function showToast(text) {
  toast.textContent = text; toast.classList.add('show');
  clearTimeout(showToast.t); showToast.t = setTimeout(() => toast.classList.remove('show'), 5000);
}
langBtn.addEventListener('click', () => {
  LANG = LANG === 'ru' ? 'de' : 'ru';
  try { localStorage.setItem('fe_lang', LANG); } catch { /* egal */ }
  paintLang();
  if ('speechSynthesis' in window) pickVoice();
  say(LANG === 'ru' ? 'Русский' : 'Deutsch');
  if (LANG === 'ru' && 'speechSynthesis' in window && !voices.ru)
    showToast('Auf diesem Gerät ist keine russische Stimme installiert – die Aussprache kann falsch klingen. Russisch in den Spracheinstellungen des Geräts hinzufügen.');
});
paintLang();

// Stimme auswählen und probehören
const voiceBtn = document.getElementById('voiceBtn');
const voicePanel = document.getElementById('voicePanel');
function buildVoicePanel() {
  pickVoice();
  const box = voicePanel.querySelector('.vlist');
  box.innerHTML = '';
  [['ru', 'Русский (Russisch)', 'Привет! Корова, собака, кошка. Строим дом!'], ['de', 'Deutsch', 'Hallo! Die Kuh, der Hund, die Katze. Wir bauen ein Haus!']].forEach(([l, title, sample]) => {
    const sec = document.createElement('div');
    sec.innerHTML = `<h3>${title}</h3>`;
    const list = voicesFor(l).sort((a, b) => rankVoice(b, l) - rankVoice(a, l));
    if (!list.length) sec.innerHTML += '<p class="vnone">Keine Stimme installiert.</p>';
    list.forEach(v => {
      const row = document.createElement('div');
      row.className = 'vrow' + (voices[l] === v ? ' on' : '');
      const good = rankVoice(v, l) >= 4 ? ' <span class="vgood">natürlich</span>' : '';
      row.innerHTML = `<button class="vsel">${voices[l] === v ? '✅' : '⚪'} ${v.name}${good}</button><button class="vtry" aria-label="Probehören">▶</button>`;
      row.querySelector('.vsel').addEventListener('click', () => {
        try { localStorage.setItem('fe_voice_' + l, v.voiceURI); } catch { /* egal */ }
        pickVoice(); buildVoicePanel();
        say(sample, { lang: l });
      });
      row.querySelector('.vtry').addEventListener('click', () => {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(sample); u.voice = v; u.lang = v.lang; u.rate = 0.85; u.pitch = 1.1;
        speechSynthesis.speak(u);
      });
      sec.appendChild(row);
    });
    box.appendChild(sec);
  });
}
voiceBtn.addEventListener('click', () => { buildVoicePanel(); voicePanel.hidden = false; });
voicePanel.querySelector('.vclose').addEventListener('click', () => { voicePanel.hidden = true; });
if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', () => { if (!voicePanel.hidden) buildVoicePanel(); });

/* ---------- Start ---------- */
document.body.classList.add('in-menu');
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
