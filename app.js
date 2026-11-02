'use strict';

/* ---------- Audio ---------- */
let ctx;
function audio() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur = 0.6, type = 'sine', vol = 0.35) {
  const a = audio(), t = a.currentTime;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t); o.stop(t + dur + 0.05);
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

/* ---------- Start ---------- */
document.body.classList.add('in-menu');
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
