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
function pickVoice() {
  const vs = speechSynthesis.getVoices();
  const find = (full, short) => vs.find(v => v.lang.replace('_', '-') === full) || vs.find(v => v.lang.startsWith(short)) || null;
  voices.de = find('de-DE', 'de');
  voices.ru = find('ru-RU', 'ru');
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
const SHAPE_DIM = { sq: [1, 1], tri: [1, 0.9], rect: [2, 1], semi: [2, 1] };
function colorWord(c, type) { return type === 'semi' ? c[2] : c[1]; }

function shapeSVG(type, color, ghost) {
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
  { say: 'ein Haus', done: 'Das Haus', sayRu: 'дом', doneRu: 'Дом готов', parts: [P('rect', 0, 0), P('sq', 0, 1), P('sq', 1, 1), P('tri', 0, 2, 2)] },
  { say: 'einen Turm mit Kuppel', done: 'Der Turm', sayRu: 'башню с куполом', doneRu: 'Башня готова', parts: [...stack(0, 0, 4), P('semi', 0, 4)] },
  { say: 'eine Kirche', done: 'Die Kirche', sayRu: 'церковь', doneRu: 'Церковь готова', top: '✝️', parts: [
    P('rect', 0, 0), P('rect', 0, 1), P('tri', 0, 2, 2),
    ...stack(2, 0, 4), P('tri', 2, 4, 1, 1.8)] },
  { say: 'ein Hochhaus', done: 'Das Hochhaus', sayRu: 'высокий дом', doneRu: 'Высокий дом готов', parts: [...stack(0, 0, 5), ...stack(1, 0, 5), P('tri', 0, 5, 2)] },
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
let houseIdx = 0, slots = [], colorIdx = 0, houseDone = false, busy = false, sunEl = null, topEl = null;
const isWall2 = s => s.type === 'sq' || s.type === 'rect';
function house2() { return HOUSES[houseIdx % HOUSES.length]; }

function makePiece(type, color, ghost) {
  const el = document.createElement('div');
  el.className = 'piece' + (ghost ? ' ghost' : '');
  el.innerHTML = shapeSVG(type, color, ghost);
  bauen.appendChild(el);
  return el;
}
let unit = 100, originX = 0, groundY = 0;
function layoutHouse() {
  const z = zone.getBoundingClientRect();
  const cols = Math.max(...slots.map(s => s.x + s.w));
  const rows = Math.max(...slots.map(s => s.y + s.h)) + (house2().top ? 0.7 : 0);
  unit = Math.min(z.width * 0.8 / cols, (z.height - 30) * 0.95 / rows, z.width * 0.3);
  originX = z.left + (z.width - cols * unit) / 2;
  groundY = z.bottom - 14;
  slots.forEach(s => {
    s.rect = { left: originX + s.x * unit, top: groundY - s.y * unit - s.h * unit, width: s.w * unit, height: s.h * unit };
    setRect(s.ghost, s.rect);
    if (s.piece && s.landed) setRect(s.piece, s.rect);
    s.piece?.style.setProperty('--fs', unit * 0.55 + 'px');
  });
  if (topEl) placeTop2();
}
function newHouse(doAnnounce = true) {
  bauen.querySelectorAll('.piece, .topdeco').forEach(p => p.remove());
  sunEl?.remove(); sunEl = null; topEl = null;
  bauen.classList.remove('house-done');
  houseDone = false;
  slots = house2().parts.map(p => ({ ...p, filled: false, landed: false }))
    .sort((a, b) => a.y - b.y || a.x - b.x);
  slots.forEach(s => { s.ghost = makePiece(s.type, null, true); });
  showPalette(pals, new Set(slots.map(s => s.type)));
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
  const free = slots.filter(s => !s.filled && s.type === type);
  if (!free.length) {
    tone(200, 0.25, 'sine', 0.25);
    SHAPES.filter(t => t !== type).forEach(hintShape);
    wiggle(pals.find(p => p.dataset.shape === type));
    dragEl?.remove();
    return;
  }
  let target = free[0];
  if (point) { // Magnet: nächstgelegene passende Lücke
    const d = s => Math.hypot(s.rect.left + s.rect.width / 2 - point.x, s.rect.top + s.rect.height / 2 - point.y);
    target = free.reduce((a, b) => (d(b) < d(a) ? b : a));
  }
  const ce = BUILD_COLORS[colorIdx++ % BUILD_COLORS.length];
  updatePalette();
  const el = dragEl || makePiece(type, ce[0], false);
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
    landedSpeech(slots, target, ce, isWall2, s => s.y);
    if (slots.every(s => s.landed)) finishHouse();
  }, 360);
}
function placeTop2() {
  const hi = slots.reduce((a, b) => (b.y + b.h > a.y + a.h ? b : a));
  topEl.style.left = (hi.rect.left + hi.rect.width / 2) + 'px';
  topEl.style.top = (hi.rect.top - unit * 0.35) + 'px';
  topEl.style.fontSize = unit * 0.6 + 'px';
}
function finishHouse() {
  houseDone = true;
  const walls = slots.filter(isWall2);
  const bottom = walls.filter(s => s.y === 0).sort((a, b) => a.x - b.x);
  const door = bottom[Math.floor((bottom.length - 1) / 2)];
  walls.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'deco'; d.textContent = s === door ? '🚪' : '🪟';
    d.style.animationDelay = (i * 0.05) + 's';
    s.piece.style.setProperty('--fs', unit * 0.55 + 'px');
    s.piece.appendChild(d);
  });
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
  topEl?.remove(); topEl = null;
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
  { say: 'ein Haus', done: 'Das Haus', sayRu: 'дом', doneRu: 'Дом готов', blocks: [{ W: 1, D: 1, F: 1, roof: 'pyramid' }] },
  { say: 'ein langes Haus', done: 'Das lange Haus', sayRu: 'длинный дом', doneRu: 'Длинный дом готов', blocks: [{ W: 2, D: 1, F: 2, roof: 'gable', rect: true }] },
  { say: 'einen Turm mit Kuppel', done: 'Der Turm', sayRu: 'башню с куполом', doneRu: 'Башня готова', blocks: [{ W: 1, D: 1, F: 3, roof: 'dome' }] },
  { say: 'eine Kirche', done: 'Die Kirche', sayRu: 'церковь', doneRu: 'Церковь готова', top: '✝️', blocks: [
    { x: 0, W: 3, D: 1, F: 1, roof: 'gable', rect: true },     // Kirchenschiff
    { x: 3, W: 1, D: 1, F: 3, roof: 'spire', top: true },      // Kirchturm
    { x: -1, W: 1, D: 1, F: 1, roof: 'dome' }] },              // runde Apsis
  { say: 'ein großes Haus', done: 'Das große Haus', sayRu: 'большой дом', doneRu: 'Большой дом готов', blocks: [{ W: 2, D: 2, F: 2, roof: 'pyramid' }] },
  { say: 'eine Burg', done: 'Die Burg', sayRu: 'крепость', doneRu: 'Крепость готова', top: '🚩', blocks: [
    { x: 0, z: 0, W: 2, D: 2, F: 1, roof: 'none' },
    { x: -1, z: -1, W: 1, D: 1, F: 2, roof: 'spire', top: true },
    { x: 2, z: 2, W: 1, D: 1, F: 2, roof: 'spire', top: true }] },
  { say: 'ein Schloss', done: 'Das Schloss', sayRu: 'замок', doneRu: 'Замок готов', top: '👑', blocks: [
    { x: 0, W: 2, D: 1, F: 1, roof: 'gable', rect: true },
    { x: -1, W: 1, D: 1, F: 2, roof: 'dome', top: true },
    { x: 2, W: 1, D: 1, F: 2, roof: 'dome', top: true }] },
  { say: 'ein Hochhaus', done: 'Das Hochhaus', sayRu: 'высокий дом', doneRu: 'Высокий дом готов', blocks: [{ W: 3, D: 1, F: 5, roof: 'gable', rect: true }] },
  { say: 'einen hohen Turm', done: 'Der Turm', sayRu: 'высокую башню', doneRu: 'Башня готова', blocks: [{ W: 1, D: 1, F: 6, roof: 'spire' }] },
];
let h3Idx = 0, slots3 = [], done3 = false, busy3 = false, S3 = 100, angle = -30, spin = 0.012;
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
  return out.sort((a, c) => a.lvl - c.lvl);
}
function geom3(s) {
  const b = s.b, S = S3;
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
  el.className = 'face' + (ghost ? ' ghost' : '');
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
  done3 = false;
  bs3 = blocks3();
  plate = document.createElement('div'); plate.className = 'plate'; stage.appendChild(plate);
  slots3 = buildSlots3(bs3);
  slots3.forEach(s => { s.ghost = face3(s.type, null, true); });
  showPalette(pals3, new Set(slots3.map(s => s.type)));
  layout3d();
  updatePalette();
  if (doAnnounce) announce(house3());
}
function place3d(type, point, dragEl) {
  dragEl?.remove();
  if (done3) return;
  const free = slots3.filter(s => !s.filled && s.type === type);
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
  const ce = BUILD_COLORS[colorIdx++ % BUILD_COLORS.length];
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
    landedSpeech(slots3, target, ce, s => s.kind === 'wall', s => s.lvl);
    if (slots3.every(s => s.landed)) finish3d();
  }, 480);
}
function finish3d() {
  done3 = true;
  const walls = slots3.filter(s => s.kind === 'wall');
  const front = walls.filter(s => s.b === bs3[0] && s.side === 0 && s.f === 0);
  const door = front[Math.floor((front.length - 1) / 2)];
  walls.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'deco';
    d.textContent = s === door ? '🚪' : (s.b.top && s.f === s.b.F - 1 && house3().top === '✝️' ? '🔔' : '🪟');
    d.style.animationDelay = (i * 0.04) + 's';
    s.piece.appendChild(d);
  });
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
    ['kuh', 'die Kuh', 'Корова'], ['schwein', 'das Schwein', 'Свинья'], ['schaf', 'das Schaf', 'Овца'], ['huhn', 'das Huhn', 'Курица'],
    ['pferd', 'das Pferd', 'Лошадь'], ['ente', 'die Ente', 'Утка'], ['hund', 'der Hund', 'Собака'], ['katze', 'die Katze', 'Кошка'],
    ['ziege', 'die Ziege', 'Коза'], ['esel', 'der Esel', 'Ослик'], ['hase', 'der Hase', 'Заяц']] },
  { icon: '🌲', de: 'Im Wald', ru: 'В лесу', bg: 'linear-gradient(#cdeac0, #95d5b2 60%, #74c69d)', animals: [
    ['fuchs', 'der Fuchs', 'Лиса'], ['baer', 'der Bär', 'Медведь'], ['eule', 'die Eule', 'Сова'], ['igel', 'der Igel', 'Ёжик'],
    ['eichhoernchen', 'das Eichhörnchen', 'Белка'], ['hirsch', 'der Hirsch', 'Олень'], ['wolf', 'der Wolf', 'Волк'],
    ['maus', 'die Maus', 'Мышка'], ['vogel', 'der Vogel', 'Птичка']] },
  { icon: '🦁', de: 'Im Zoo', ru: 'В зоопарке', bg: 'linear-gradient(#ffe8a3, #ffd6a5 60%, #f4c27a)', animals: [
    ['loewe', 'der Löwe', 'Лев'], ['elefant', 'der Elefant', 'Слон'], ['giraffe', 'die Giraffe', 'Жираф'], ['zebra', 'das Zebra', 'Зебра'],
    ['affe', 'der Affe', 'Обезьяна'], ['tiger', 'der Tiger', 'Тигр'], ['nilpferd', 'das Nilpferd', 'Бегемот'], ['nashorn', 'das Nashorn', 'Носорог'],
    ['kamel', 'das Kamel', 'Верблюд'], ['krokodil', 'das Krokodil', 'Крокодил'], ['panda', 'der Panda', 'Панда'], ['kaenguru', 'das Känguru', 'Кенгуру'],
    ['koala', 'der Koala', 'Коала'], ['gorilla', 'der Gorilla', 'Горилла'], ['papagei', 'der Papagei', 'Попугай'], ['schlange', 'die Schlange', 'Змея']] },
  { icon: '🌊', de: 'Im Wasser', ru: 'В воде', bg: 'linear-gradient(#caf0f8, #90e0ef 50%, #48cae4)', animals: [
    ['fisch', 'der Fisch', 'Рыбка'], ['delfin', 'der Delfin', 'Дельфин'], ['wal', 'der Wal', 'Кит'], ['schildkroete', 'die Schildkröte', 'Черепаха'],
    ['pinguin', 'der Pinguin', 'Пингвин'], ['krake', 'der Krake', 'Осьминог'], ['krebs', 'die Krabbe', 'Краб'], ['robbe', 'die Robbe', 'Тюлень'],
    ['frosch', 'der Frosch', 'Лягушка']] },
  { icon: '🐞', de: 'Kleine Krabbeltiere', ru: 'Букашки', bg: 'linear-gradient(#fff3b0, #d8f3dc 70%)', animals: [
    ['biene', 'die Biene', 'Пчела'], ['schmetterling', 'der Schmetterling', 'Бабочка'], ['marienkaefer', 'der Marienkäfer', 'Божья коровка'],
    ['schnecke', 'die Schnecke', 'Улитка'], ['ameise', 'die Ameise', 'Муравей']] },
];
const namen = document.getElementById('namen');
const habBar = document.getElementById('habitats');
const nameGrid = document.getElementById('nameGrid');
let habIdx = 0;
function showHabitat(i, speak = true) {
  habIdx = i;
  const H = HABITATS[i];
  namen.style.background = H.bg;
  [...habBar.children].forEach((b, k) => b.classList.toggle('on', k === i));
  nameGrid.innerHTML = '';
  nameGrid.style.setProperty('--n', H.animals.length);
  H.animals.forEach(([img, de, ru], k) => {
    const b = document.createElement('button');
    b.className = 'nameCard';
    b.style.animationDelay = (k * 0.04) + 's';
    b.setAttribute('aria-label', de);
    b.innerHTML = `<img src="img/tiere/${img}.png" alt="" draggable="false">`;
    b.addEventListener('pointerdown', () => {
      b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump');
      tone(660 + k * 20, 0.12, 'triangle', 0.15);
      vibrate();
      say(T(de.charAt(0).toUpperCase() + de.slice(1), ru) + '!', { rate: 0.8 });
    });
    nameGrid.appendChild(b);
  });
  if (speak) say(T(H.de, H.ru));
}
HABITATS.forEach((H, i) => {
  const b = document.createElement('button');
  b.className = 'hab'; b.textContent = H.icon; b.setAttribute('aria-label', H.de);
  b.addEventListener('pointerdown', () => { tone(520, 0.12, 'sine', 0.2); showHabitat(i); });
  habBar.appendChild(b);
});
screens.namen = { enter() { showHabitat(habIdx); } };

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

/* ---------- Start ---------- */
document.body.classList.add('in-menu');
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
