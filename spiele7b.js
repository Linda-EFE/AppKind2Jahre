'use strict';
/* =====================================================================
   7 JAHRE – drei weitere Spiele (eigene Spiele, keine Nachbauten):
   🧱 Klötzchen-Welt · 🔴 Vier in einer Reihe · 💡 Wusstest du? (Quiz)
   Nutzt h(), put(), store, shuffle(), sayKid(), cheer(), softFail(), timers aus kids7.js
   und tone(), pianoNote(), freq() aus app.js.
   ===================================================================== */
(function () {
  /* Schieberegler Leicht → Schwer (für alle 7er-Spiele mit Schwierigkeit).
     o = { min, max, value, label(v) → Text, onChange(v) } */
  function diffSlider(o) {
    const lbl = h('b', { class: 'dsval' });
    const inp = h('input', { type: 'range', min: String(o.min), max: String(o.max), step: '1', value: String(o.value), 'aria-label': 'Schwierigkeit' });
    const paint = () => {
      const v = +inp.value, t = (v - o.min) / (o.max - o.min || 1);
      lbl.textContent = o.label ? o.label(v) : `Stufe ${v - o.min + 1} von ${o.max - o.min + 1}`;
      inp.style.setProperty('--p', (t * 100) + '%');
    };
    let last = +inp.value;
    inp.addEventListener('input', () => { paint(); if (+inp.value !== last) { last = +inp.value; tone(330 + (last - o.min) * 50, 0.05, 'triangle', 0.12); } });
    inp.addEventListener('change', () => o.onChange && o.onChange(+inp.value));
    paint();
    return h('div', { class: 'dslider' }, h('div', { class: 'dsrow' }, h('span', { class: 'dsend' }, o.lo || '😊 Leicht'), inp, h('span', { class: 'dsend' }, o.hi || '😎 Schwer')), lbl);
  }
  window.diffSlider = diffSlider;

  /* ======================= 🧱 Klötzchen-Welt ======================= */
  const COLS = 40, ROWS = 22;
  // [Name, Grundfarbe, Musterfarbe, fest?]
  const BLOCKS = {
    gras: ['Gras', '#7a5230', '#5fbf4a', true], erde: ['Erde', '#7a5230', '#6a4528', true], stein: ['Stein', '#8b8f96', '#74787e', true],
    holz: ['Holz', '#9a6a3a', '#7d522a', true], blatt: ['Blätter', '#3f9a3a', '#2f7d2c', true], sand: ['Sand', '#f2dd9b', '#e2c97e', true],
    wasser: ['Wasser', '#3b82f6', '#60a5fa', false], glas: ['Glas', '#dff6ff', '#a5dcf0', true], ziegel: ['Ziegel', '#c2493a', '#e8d9c9', true],
    schnee: ['Schnee', '#f8fafc', '#dbeafe', true], gold: ['Gold', '#f6c945', '#fff1a8', true], diamant: ['Diamant', '#8b8f96', '#5ef0e8', true],
    blume: ['Blume', null, '#ff4f8b', false], wolle: ['Wolle', '#ff70a6', '#ff9cc2', true], lampe: ['Lampe', '#ffe066', '#fff7c2', true],
  };
  const PALETTE = Object.keys(BLOCKS);
  function genWorld() {
    const g = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
    const base = ROWS - 8, ph = Math.random() * 6;
    const heights = [];
    for (let x = 0; x < COLS; x++) {
      const hgt = Math.round(base + Math.sin(x / 5 + ph) * 2 + Math.sin(x / 2.3 + ph * 2) * 1);
      heights.push(hgt);
      for (let y = hgt; y < ROWS; y++) g[y][x] = y === hgt ? 'gras' : y < hgt + 3 ? 'erde' : (Math.random() < 0.06 ? (Math.random() < 0.4 ? 'diamant' : 'gold') : 'stein');
    }
    // See
    const lx = 6 + Math.floor(Math.random() * 20);
    for (let x = lx; x < lx + 6; x++) { const y0 = heights[x]; for (let y = y0; y < y0 + 2; y++) g[y][x] = 'wasser'; g[y0 + 2][x] = 'sand'; }
    // Bäume und Blumen
    for (let x = 2; x < COLS - 2; x++) {
      const y0 = heights[x];
      if (g[y0][x] !== 'gras') continue;
      if (x > 8 && Math.random() < 0.12 && x % 3 === 0) { // keine Bäume am Startplatz
        for (let t = 1; t <= 3; t++) g[y0 - t][x] = 'holz';
        for (let dy = -5; dy <= -3; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.abs(dx) + Math.abs(dy + 4) < 4 && !g[y0 + dy][x + dx]) g[y0 + dy][x + dx] = 'blatt';
      } else if (Math.random() < 0.15) g[y0 - 1][x] = 'blume';
    }
    // 5 versteckte Sterne
    const stars = [];
    while (stars.length < 5) {
      const x = 1 + Math.floor(Math.random() * (COLS - 2)), y = heights[x] - 1 - Math.floor(Math.random() * 3);
      if (!g[y][x] && !stars.some(s => s.x === x && s.y === y)) stars.push({ x, y });
    }
    // Startplatz: Spalte ohne Baum, Luft über dem Boden freiräumen
    const sx = [2, 4, 5, 7, 8, 10].find(x => g[heights[x] - 1][x] !== 'holz') ?? 2;
    for (let y = 0; y < heights[sx]; y++) g[y][sx] = '';
    return { g, stars, px: sx, py: heights[sx] - 2 };
  }
  function drawBlock(c, k, x, y, s) {
    const [, base, pat] = BLOCKS[k];
    if (k === 'blume') {
      c.fillStyle = '#2f9e44'; c.fillRect(x + s * 0.45, y + s * 0.4, s * 0.1, s * 0.6);
      c.fillStyle = pat; [[0.5, 0.25], [0.32, 0.38], [0.68, 0.38], [0.5, 0.5]].forEach(([a, b]) => { c.beginPath(); c.arc(x + s * a, y + s * b, s * 0.13, 0, 7); c.fill(); });
      c.fillStyle = '#ffd43b'; c.beginPath(); c.arc(x + s * 0.5, y + s * 0.38, s * 0.1, 0, 7); c.fill(); return;
    }
    c.fillStyle = base; c.fillRect(x, y, s, s);
    c.fillStyle = pat;
    if (k === 'gras') { c.fillRect(x, y, s, s * 0.3); for (let i = 0; i < 4; i++) c.fillRect(x + i * s / 4, y + s * 0.3, s / 8, s * 0.12); }
    else if (k === 'ziegel') { c.fillRect(x, y + s * 0.47, s, s * 0.06); c.fillRect(x + s * 0.5, y, s * 0.06, s * 0.47); c.fillRect(x + s * 0.2, y + s * 0.53, s * 0.06, s * 0.47); }
    else if (k === 'holz') { c.fillRect(x + s * 0.2, y, s * 0.08, s); c.fillRect(x + s * 0.65, y, s * 0.08, s); }
    else if (k === 'glas') { c.fillRect(x + s * 0.15, y + s * 0.15, s * 0.1, s * 0.4); c.strokeStyle = '#7cc4dd'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, s - 2, s - 2); }
    else if (k === 'diamant' || k === 'gold') { [[0.2, 0.25], [0.6, 0.2], [0.35, 0.6], [0.7, 0.65]].forEach(([a, b]) => c.fillRect(x + s * a, y + s * b, s * 0.16, s * 0.16)); }
    else if (k === 'lampe') { c.fillRect(x + s * 0.15, y + s * 0.15, s * 0.7, s * 0.7); }
    else if (k === 'wasser') { c.globalAlpha = 0.5; c.fillRect(x, y + s * 0.2, s, s * 0.08); c.fillRect(x, y + s * 0.6, s, s * 0.08); c.globalAlpha = 1; }
    else { [[0.15, 0.2], [0.55, 0.15], [0.3, 0.55], [0.7, 0.6], [0.1, 0.8]].forEach(([a, b]) => c.fillRect(x + s * a, y + s * b, s * 0.14, s * 0.14)); }
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1; c.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
  }
  const KLOETZE = {
    id: 'kloetze', icon: '🧱', color: '#2a9d4a', skill: 'Bauen & Entdecken', title: 'Klötzchen-Welt',
    intro: 'Baue deine eigene Welt aus Blöcken! Wähle unten einen Block und tippe in die Welt. Mit den Pfeilen läuft deine Figur. Findest du die 5 Sterne?',
    render(body) {
      let W = store.get('kloetze_welt', null) || genWorld();
      let tool = 'ziegel', night = false, found = 0;
      const save = () => store.set('kloetze_welt', W);
      const wrap = h('div', { class: 'kw' });
      const cv = h('canvas', { class: 'kwc' });
      const info = h('div', { class: 'kwinfo' });
      const pal = h('div', { class: 'kwpal' });
      const pad = h('div', { class: 'kwpad' });
      put(body, info, wrap, pad, pal);
      put(wrap, cv);
      const c = cv.getContext('2d');
      let S = 20, vy = 0, onGround = false, keys = {}, VIS = COLS, camX = 0;
      function resize() {
        VIS = wrap.clientWidth < 700 ? 18 : COLS; // auf kleinen Bildschirmen nur ein Ausschnitt mit großen Blöcken
        S = Math.max(8, Math.floor(Math.min(wrap.clientWidth / VIS, (window.innerHeight * (VIS < COLS ? 0.5 : 0.6)) / ROWS)));
        cv.width = S * VIS; cv.height = S * ROWS; render();
      }
      function cam() { camX = Math.max(0, Math.min(COLS - VIS, Math.round((W.px + 0.5 - VIS / 2) * 4) / 4)); }
      const solid = (x, y) => x < 0 || x >= COLS || y >= ROWS || (y >= 0 && W.g[y][x] && BLOCKS[W.g[y][x]][3]);
      function render() {
        const sky = c.createLinearGradient(0, 0, 0, cv.height);
        if (night) { sky.addColorStop(0, '#0b1d51'); sky.addColorStop(1, '#3b4b8a'); } else { sky.addColorStop(0, '#7cc7ff'); sky.addColorStop(1, '#d9f1ff'); }
        c.fillStyle = sky; c.fillRect(0, 0, cv.width, cv.height);
        c.fillStyle = night ? '#f8fafc' : '#ffd43b'; c.beginPath(); c.arc(cv.width * 0.85, S * 2.5, S * 1.3, 0, 7); c.fill();
        cam(); c.save(); c.translate(-camX * S, 0);
        for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (W.g[y][x]) drawBlock(c, W.g[y][x], x * S, y * S, S);
        if (night) { c.fillStyle = 'rgba(5,10,40,.45)'; c.fillRect(camX * S, 0, cv.width, cv.height); for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (W.g[y][x] === 'lampe') { const g = c.createRadialGradient(x * S + S / 2, y * S + S / 2, 0, x * S + S / 2, y * S + S / 2, S * 3); g.addColorStop(0, 'rgba(255,230,120,.6)'); g.addColorStop(1, 'rgba(255,230,120,0)'); c.fillStyle = g; c.fillRect(x * S - S * 3, y * S - S * 3, S * 7, S * 7); } }
        c.font = `${S * 0.9}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
        W.stars.forEach(s => c.fillText('⭐', s.x * S + S / 2, s.y * S + S / 2 + Math.sin(Date.now() / 300 + s.x) * S * 0.08));
        // Spielfigur
        const x = W.px * S, y = W.py * S;
        c.fillStyle = '#1d4ed8'; c.fillRect(x + S * 0.2, y + S * 1.1, S * 0.25, S * 0.9); c.fillRect(x + S * 0.55, y + S * 1.1, S * 0.25, S * 0.9);
        c.fillStyle = '#e63946'; c.fillRect(x + S * 0.15, y + S * 0.55, S * 0.7, S * 0.65);
        c.fillStyle = '#f5c9a5'; c.fillRect(x + S * 0.2, y, S * 0.6, S * 0.6);
        c.fillStyle = '#5b3a1e'; c.fillRect(x + S * 0.2, y, S * 0.6, S * 0.15);
        c.fillStyle = '#222'; c.fillRect(x + S * 0.32, y + S * 0.25, S * 0.1, S * 0.1); c.fillRect(x + S * 0.58, y + S * 0.25, S * 0.1, S * 0.1);
        c.strokeStyle = '#222'; c.lineWidth = 1.5; c.strokeRect(x + S * 0.15, y, S * 0.7, S * 2);
        c.restore();
      }
      // Figur bewegen (2 Felder hoch, 1 breit)
      function blockedAt(px, py) { const x0 = Math.floor(px + 0.15), x1 = Math.floor(px + 0.85), y0 = Math.floor(py), y1 = Math.floor(py + 1.99); for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) if (solid(x, y)) return true; return false; }
      function step() {
        if (blockedAt(W.px, W.py)) { W.py -= 1; vy = 0; }
        const dir = (keys.l ? -1 : 0) + (keys.r ? 1 : 0);
        const nx = W.px + dir * 0.18;
        if (dir && !blockedAt(nx, W.py)) W.px = nx;
        else if (dir && onGround && !blockedAt(nx, W.py - 1)) { W.py -= 1; W.px = nx; } // eine Stufe hochsteigen
        vy = Math.min(vy + 0.05, 0.6);
        const ny = W.py + vy;
        if (!blockedAt(W.px, ny)) { W.py = ny; onGround = false; } else { if (vy > 0) { W.py = Math.floor(ny + 1.99) - 2; onGround = true; } vy = 0; }
        if (W.py > ROWS) { W.py = 0; }
        W.stars = W.stars.filter(s => {
          const hit = Math.abs(s.x + 0.5 - (W.px + 0.5)) < 0.8 && s.y >= Math.floor(W.py) - 0.5 && s.y <= W.py + 2;
          if (hit) { found++; ['C5', 'E5', 'G5'].forEach((n, i) => pianoNote(freq(n), i * 0.08, null, 0.3)); }
          return !hit;
        });
        if (found && !W.stars.length && !W.done) { W.done = true; cheer(); sayKid('Super! Du hast alle Sterne gefunden!'); }
        paintInfo(); render();
      }
      function jump() { if (onGround) { vy = -0.55; onGround = false; tone(500, 0.1, 'square', 0.08); } }
      function paintInfo() { info.innerHTML = `<span class="pill">⭐ noch ${W.stars.length} von 5 Sternen</span><span class="pill">Werkzeug: ${tool === 'weg' ? '⛏️ Abbauen' : BLOCKS[tool][0]}</span>`; }
      // Bauen per Antippen/Ziehen
      let painting = false;
      const cellAt = e => { const r = cv.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) / r.width * VIS + camX), Math.floor((e.clientY - r.top) / r.height * ROWS)]; };
      function paint(e) {
        const [x, y] = cellAt(e); if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return;
        const onPlayer = x >= Math.floor(W.px + 0.15) && x <= Math.floor(W.px + 0.85) && y >= Math.floor(W.py) && y <= Math.floor(W.py + 1.99);
        if (tool === 'weg') { if (W.g[y][x]) { W.g[y][x] = ''; tone(160, 0.07, 'square', 0.12); } }
        else if (!onPlayer && W.g[y][x] !== tool) { W.g[y][x] = tool; tone(320 + PALETTE.indexOf(tool) * 30, 0.06, 'triangle', 0.15); }
        render();
      }
      cv.addEventListener('pointerdown', e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); painting = true; paint(e); });
      cv.addEventListener('pointermove', e => { if (painting) paint(e); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => cv.addEventListener(ev, () => { if (painting) { painting = false; save(); } }));
      // Palette
      function drawPal() {
        pal.innerHTML = '';
        [...PALETTE, 'weg'].forEach(k => {
          const b = h('button', { class: 'kwb' + (tool === k ? ' on' : ''), 'aria-label': k === 'weg' ? 'Abbauen' : BLOCKS[k][0], onclick: () => { tool = k; drawPal(); paintInfo(); } });
          if (k === 'weg') b.textContent = '⛏️';
          else { const m = h('canvas', { width: '40', height: '40' }); const mc = m.getContext('2d'); mc.fillStyle = '#d9f1ff'; mc.fillRect(0, 0, 40, 40); drawBlock(mc, k, 0, 0, 40); put(b, m); }
          put(b, h('small', {}, k === 'weg' ? 'Abbauen' : BLOCKS[k][0])); put(pal, b);
        });
      }
      // Steuerkreuz
      const hold = (lbl, k, aria) => { const b = h('button', { class: 'kwdir', 'aria-label': aria }, lbl); b.addEventListener('pointerdown', e => { e.preventDefault(); keys[k] = true; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => { keys[k] = false; })); return b; };
      put(pad, hold('◀', 'l', 'Links'), h('button', { class: 'kwdir', 'aria-label': 'Springen', onclick: jump }, '⤒'), hold('▶', 'r', 'Rechts'),
        h('button', { class: 'btn alt', onclick: () => { night = !night; render(); } }, '🌗 Tag/Nacht'),
        h('button', { class: 'btn alt', onclick: () => { if (confirm('Eine ganz neue Welt erzeugen? Deine alte Welt ist dann weg.')) { W = genWorld(); found = 0; save(); render(); paintInfo(); sayKid('Eine neue Welt! Finde die 5 Sterne!'); } } }, '🌍 Neue Welt'));
      const kd = e => { if (e.key === 'ArrowLeft') keys.l = true; if (e.key === 'ArrowRight') keys.r = true; if (e.key === 'ArrowUp' || e.key === ' ') { e.preventDefault(); jump(); } };
      const ku = e => { if (e.key === 'ArrowLeft') keys.l = false; if (e.key === 'ArrowRight') keys.r = false; };
      document.addEventListener('keydown', kd); document.addEventListener('keyup', ku);
      const ro = new ResizeObserver(resize); ro.observe(wrap);
      drawPal(); paintInfo(); save();
      const loop = timers.every(step, 33);
      const autosave = timers.every(save, 4000);
      return () => { clearInterval(loop); clearInterval(autosave); save(); ro.disconnect(); document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); };
    },
  };

  /* ======================= 🔴 Vier in einer Reihe ======================= */
  const VIER = {
    id: 'vier', icon: '🔴', color: '#e63946', skill: 'Taktik & Denken', title: 'Vier in einer Reihe',
    intro: 'Wirf abwechselnd Steine in das Gitter. Wer zuerst vier in einer Reihe hat – waagrecht, senkrecht oder schräg – gewinnt!',
    render(body) {
      const C = 7, R = 6;
      let b, turn, over, vsPc = store.get('vier_pc', true), level = store.get('vier_lv10', [1, 5, 9][store.get('vier_lv', 1)] ?? 3), busy = false;
      const score = store.get('vier_score', { du: 0, pc: 0, rot: 0, gelb: 0 });
      const top = h('div', { class: 'vtop' }), board = h('div', { class: 'vboard' }), msg = h('p', { class: 'big' });
      put(body, top, msg, board, h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: neu }, '🔁 Neues Spiel')));
      const NAME = { 1: '🔴 Rot', 2: '🟡 Gelb' };
      function drawTop() {
        top.innerHTML = '';
        put(top,
          h('div', { class: 'seg7' }, h('button', { class: vsPc ? 'on' : '', onclick: () => { vsPc = true; store.set('vier_pc', true); neu(); } }, '🤖 Gegen den Computer'), h('button', { class: vsPc ? '' : 'on', onclick: () => { vsPc = false; store.set('vier_pc', false); neu(); } }, '👫 Zu zweit')),
          vsPc ? diffSlider({ min: 0, max: 10, value: level, label: v => `Computer-Stärke ${v + 1} von 11 ${['🐣', '🐣', '🐣', '🙂', '🙂', '🙂', '🙂', '🤓', '🤓', '😎', '🏆'][v]}`, onChange: v => { level = v; store.set('vier_lv10', v); sayKid(v < 4 ? 'Leicht' : v < 8 ? 'Mittel' : 'Schwer'); } }) : null,
          h('span', { class: 'pill' }, vsPc ? `Du ${score.du} : ${score.pc} Computer` : `🔴 ${score.rot} : ${score.gelb} 🟡`));
      }
      function neu() { b = Array.from({ length: R }, () => Array(C).fill(0)); turn = 1; over = false; busy = false; drawTop(); draw(); msg.textContent = vsPc ? 'Du bist 🔴 Rot. Tippe auf eine Spalte!' : '🔴 Rot fängt an!'; }
      const drop = (bb, col) => { for (let r = R - 1; r >= 0; r--) if (!bb[r][col]) return r; return -1; };
      function wins(bb, p) {
        const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
        for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) for (const [dr, dc] of dirs) {
          const cells = [0, 1, 2, 3].map(i => [r + dr * i, c + dc * i]);
          if (cells.every(([y, x]) => y >= 0 && y < R && x >= 0 && x < C && bb[y][x] === p)) return cells;
        }
        return null;
      }
      function draw(line) {
        board.innerHTML = '';
        for (let col = 0; col < C; col++) {
          const colEl = h('button', { class: 'vcol', 'aria-label': 'Spalte ' + (col + 1), onclick: () => human(col) });
          for (let r = 0; r < R; r++) {
            const v = b[r][col];
            const isWin = line && line.some(([y, x]) => y === r && x === col);
            put(colEl, h('span', { class: 'vcell' + (v ? ' p' + v : '') + (isWin ? ' win' : '') }));
          }
          put(board, colEl);
        }
      }
      function play(col, p) {
        const r = drop(b, col); if (r < 0) return false;
        b[r][col] = p; tone(p === 1 ? 520 : 390, 0.12, 'triangle', 0.2);
        const line = wins(b, p);
        draw(line);
        const cell = board.children[col].children[r]; cell.classList.add('fall'); cell.style.setProperty('--fall', (r + 1) * 100 + '%');
        if (line) {
          over = true;
          if (vsPc) { if (p === 1) { score.du++; msg.textContent = '🎉 Du hast gewonnen!'; cheer(); sayKid('Du hast gewonnen! Super!'); } else { score.pc++; msg.textContent = '🤖 Der Computer hat gewonnen. Nochmal?'; softFail(); sayKid('Der Computer hat gewonnen. Probier es nochmal!'); } }
          else { score[p === 1 ? 'rot' : 'gelb']++; msg.textContent = `🎉 ${NAME[p]} gewinnt!`; cheer(); sayKid((p === 1 ? 'Rot' : 'Gelb') + ' gewinnt!'); }
          store.set('vier_score', score); drawTop(); return true;
        }
        if (b[0].every(Boolean)) { over = true; msg.textContent = 'Unentschieden! Das Gitter ist voll.'; sayKid('Unentschieden!'); return true; }
        turn = 3 - p;
        msg.textContent = vsPc ? (turn === 1 ? 'Du bist dran! 🔴' : '🤖 Der Computer überlegt …') : `${NAME[turn]} ist dran!`;
        return true;
      }
      function human(col) {
        if (over || busy || (vsPc && turn !== 1)) return;
        if (!play(col, turn)) { softFail(); return; }
        if (vsPc && !over) { busy = true; timers.set(() => { play(pcMove(), 2); busy = false; }, 650); }
      }
      // Computer-Stärke 0–10 (Schieber): je stärker, desto öfter gewinnt/blockt er,
      // vermeidet Fallen und spielt in die Mitte
      function pcMove() {
        const k = level / 10, chance = x => Math.random() < x;
        const valid = [...Array(C).keys()].filter(c => drop(b, c) >= 0);
        const tryMove = (c, p) => { const bb = b.map(r => r.slice()); bb[drop(bb, c)][c] = p; return bb; };
        const winNow = p => valid.find(c => wins(tryMove(c, p), p));
        const w = winNow(2); if (w !== undefined && chance(0.1 + 1.2 * k)) return w;
        const block = winNow(1); if (block !== undefined && chance(0.05 + 1.1 * k)) return block;
        let pool = valid;
        if (chance(k * 1.25 - 0.25)) {
          // keine Züge, nach denen der Mensch sofort gewinnen kann
          const safe = valid.filter(c => { const bb = tryMove(c, 2); return ![...Array(C).keys()].some(c2 => { const r2 = drop(bb, c2); if (r2 < 0) return false; const b2 = bb.map(r => r.slice()); b2[r2][c2] = 1; return wins(b2, 1); }); });
          if (safe.length) pool = safe;
        }
        if (chance(0.7 * k)) { const center = [3, 2, 4, 1, 5, 0, 6].filter(c => pool.includes(c)).slice(0, level >= 8 ? 1 : 3); if (center.length) return center[Math.floor(Math.random() * center.length)]; }
        return pool[Math.floor(Math.random() * pool.length)];
      }
      neu();
    },
  };

  /* ======================= 💡 Wusstest du? – Quiz ======================= */
  // [Frage, [Antworten], richtiger Index, spannender Fakt]
  const QUIZ = {
    '🐾 Tiere': [
      ['Wie viele Herzen hat ein Oktopus?', ['Eins', 'Drei', 'Fünf'], 1, 'Ein Oktopus hat drei Herzen – und sein Blut ist blau!'],
      ['Welches ist das größte Tier der Welt?', ['Elefant', 'Blauwal', 'Giraffe'], 1, 'Der Blauwal ist so lang wie zwei Busse hintereinander.'],
      ['Was fressen Pandas fast nur?', ['Bambus', 'Fisch', 'Bananen'], 0, 'Ein Panda frisst jeden Tag viele Kilo Bambus.'],
      ['Welches Landtier ist am schnellsten?', ['Pferd', 'Löwe', 'Gepard'], 2, 'Ein Gepard ist kurz so schnell wie ein Auto auf der Landstraße.'],
      ['Können Pinguine fliegen?', ['Ja', 'Nein'], 1, 'Pinguine können nicht fliegen – aber unter Wasser „fliegen“ sie super schnell.'],
      ['Welche Farbe hat die Haut eines Eisbären?', ['Weiß', 'Schwarz', 'Rosa'], 1, 'Unter dem hellen Fell hat der Eisbär schwarze Haut – die speichert Wärme.'],
      ['Wie viele Stunden am Tag kann ein Koala schlafen?', ['Etwa 5', 'Etwa 10', 'Bis zu 20'], 2, 'Koalas schlafen fast den ganzen Tag, weil ihr Futter wenig Energie gibt.'],
      ['Wie heißt ein Känguru-Baby?', ['Joey', 'Kalb', 'Welpe'], 0, 'Ein Joey wohnt im Beutel seiner Mama.'],
    ],
    '🚀 Weltall': [
      ['Welcher Planet ist der größte?', ['Erde', 'Jupiter', 'Mars'], 1, 'In den Jupiter würden über tausend Erden hineinpassen.'],
      ['Wie viele Planeten hat unser Sonnensystem?', ['Sechs', 'Acht', 'Zwölf'], 1, 'Merkur, Venus, Erde, Mars, Jupiter, Saturn, Uranus und Neptun.'],
      ['Welcher Planet heißt „der rote Planet“?', ['Mars', 'Venus', 'Neptun'], 0, 'Der Mars ist rot, weil sein Boden viel rostigen Staub hat.'],
      ['Was ist die Sonne?', ['Ein Planet', 'Ein Stern', 'Ein Mond'], 1, 'Die Sonne ist ein Stern – der Stern, der uns am nächsten ist.'],
      ['Welcher Planet hat besonders große, schöne Ringe?', ['Saturn', 'Merkur', 'Erde'], 0, 'Die Ringe des Saturn bestehen aus Eis und Gestein.'],
      ['Wie lange braucht die Erde einmal um die Sonne?', ['Einen Tag', 'Einen Monat', 'Ein Jahr'], 2, 'Einmal um die Sonne dauert ein Jahr – also von Geburtstag zu Geburtstag.'],
      ['Wie hieß der erste Mensch auf dem Mond?', ['Neil Armstrong', 'Albert Einstein', 'Juri Gagarin'], 0, 'Neil Armstrong betrat 1969 als Erster den Mond.'],
    ],
    '🫀 Mein Körper': [
      ['Welches Organ pumpt das Blut durch den Körper?', ['Lunge', 'Herz', 'Magen'], 1, 'Dein Herz schlägt jeden Tag etwa hunderttausendmal.'],
      ['Was ist das größte Organ des Menschen?', ['Die Haut', 'Das Herz', 'Die Leber'], 0, 'Die Haut schützt deinen ganzen Körper wie ein Mantel.'],
      ['Wie viele Milchzähne haben Kinder?', ['10', '20', '32'], 1, 'Kinder haben 20 Milchzähne – die fallen nach und nach aus.'],
      ['Wo sitzt der kleinste Knochen des Körpers?', ['Im Ohr', 'Im Finger', 'Im Zeh'], 0, 'Der Steigbügel im Ohr ist kleiner als ein Reiskorn.'],
      ['Wie viele Knochen hat ein Erwachsener ungefähr?', ['Etwa 50', 'Etwa 206', 'Etwa 1000'], 1, 'Babys haben sogar mehr Knochen – einige wachsen später zusammen.'],
      ['Was holt die Lunge aus der Luft?', ['Sauerstoff', 'Zucker', 'Wasser'], 0, 'Den Sauerstoff braucht jede Zelle in deinem Körper.'],
    ],
    '🦖 Dinosaurier': [
      ['Was bedeutet das Wort „Dinosaurier“?', ['Schreckliche Echse', 'Großer Vogel', 'Starker Fisch'], 0, 'Das Wort kommt aus dem Griechischen: „deinos“ heißt schrecklich.'],
      ['Welcher Dino hatte drei Hörner?', ['Triceratops', 'Stegosaurus', 'Diplodocus'], 0, '„Tri“ heißt drei – drei Hörner am Kopf!'],
      ['Welcher Dino hatte große Platten auf dem Rücken?', ['Tyrannosaurus', 'Stegosaurus', 'Velociraptor'], 1, 'Die Platten des Stegosaurus standen wie ein Zackenkamm hoch.'],
      ['Welcher berühmte Fleischfresser hatte ganz kurze Arme?', ['Tyrannosaurus rex', 'Brachiosaurus', 'Triceratops'], 0, 'Der T. rex hatte riesige Zähne, aber winzige Ärmchen.'],
      ['Welche Tiere sind heute die Nachfahren der Dinosaurier?', ['Vögel', 'Katzen', 'Fische'], 0, 'Jedes Huhn ist ein entfernter Verwandter des T. rex!'],
      ['Haben Menschen und Dinosaurier gleichzeitig gelebt?', ['Ja', 'Nein'], 1, 'Die großen Dinos starben vor etwa 66 Millionen Jahren aus – lange vor den Menschen.'],
    ],
    '🌍 Erde & Natur': [
      ['Welcher Berg ist der höchste der Welt?', ['Zugspitze', 'Mount Everest', 'Mont Blanc'], 1, 'Der Mount Everest ist fast 9 Kilometer hoch.'],
      ['Wie viel der Erde ist mit Wasser bedeckt?', ['Ein Zehntel', 'Die Hälfte', 'Etwa zwei Drittel'], 2, 'Von oben sieht die Erde deshalb blau aus – der blaue Planet.'],
      ['Welcher Ozean ist der größte?', ['Atlantik', 'Pazifik', 'Indischer Ozean'], 1, 'Der Pazifik ist größer als alle Kontinente zusammen.'],
      ['Wodurch entsteht ein Regenbogen?', ['Sonnenlicht und Regentropfen', 'Wind und Wolken', 'Mond und Sterne'], 0, 'Die Tropfen teilen das Sonnenlicht in alle Farben auf.'],
      ['Warum werfen viele Bäume im Herbst die Blätter ab?', ['Sie sind krank', 'Sie sparen im Winter Kraft und Wasser', 'Der Wind ist zu stark'], 1, 'Im Frühling wachsen dann frische, grüne Blätter nach.'],
      ['Welcher Fluss fließt durch Köln?', ['Elbe', 'Rhein', 'Donau'], 1, 'Der Rhein ist einer der längsten Flüsse in Deutschland.'],
    ],
  };
  const WISSEN = {
    id: 'wissen', icon: '💡', color: '#f59e0b', skill: 'Lesen & Fakten', title: 'Wusstest du?',
    intro: 'Teste dein Wissen! Wähle ein Thema. Jede Frage wird vorgelesen – und danach gibt es einen spannenden Fakt.',
    render(body) {
      const view = h('div'); put(body, view);
      const stars = () => store.get('wissen_sterne', 0);
      function themen() {
        view.innerHTML = '';
        put(view, h('p', { class: 'big' }, `Deine Wissens-Sterne: ${'⭐'.repeat(Math.min(stars(), 10))}${stars() > 10 ? ' +' + (stars() - 10) : ''} (${stars()})`),
          h('div', { class: 'choices' }, Object.keys(QUIZ).map(t => h('button', { class: 'choice', onclick: () => quiz(t) }, h('span', { class: 'ce' }, t.split(' ')[0]), t.split(' ').slice(1).join(' ')))),
          h('div', { class: 'btnrow' }, h('button', { class: 'btn alt', onclick: () => quiz(null) }, '🎲 Gemischt')));
      }
      function quiz(topic) {
        const pool = topic ? QUIZ[topic] : Object.values(QUIZ).flat();
        const qs = shuffle(pool).slice(0, 6);
        let i = 0, right = 0;
        const show = () => {
          view.innerHTML = '';
          if (i >= qs.length) {
            const n = stars() + right; store.set('wissen_sterne', n);
            cheer();
            const t = `Du hast ${right} von ${qs.length} richtig!` + (right ? ` Dafür bekommst du ${right === 1 ? 'einen Stern' : right + ' Sterne'}.` : ' Beim nächsten Mal klappt es bestimmt!');
            put(view, h('div', { class: 'celebrate' }, right >= 5 ? '🏆' : right >= 3 ? '🌟' : '💪'), h('p', { class: 'big' }, t),
              h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => quiz(topic) }, 'Nochmal 🔁'), h('button', { class: 'btn alt', onclick: themen }, 'Anderes Thema')));
            sayKid(t); return;
          }
          const [q, opts, a, fact] = qs[i];
          const order = shuffle(opts.map((o, k) => k));
          put(view, h('div', { class: 'progress' }, `${topic || '🎲 Gemischt'} · Frage ${i + 1} / ${qs.length}`),
            h('p', { class: 'big' }, q, ' ', h('button', { class: 'speak inline', 'aria-label': 'Vorlesen', onclick: () => sayKid(q + ' ' + opts.join(', oder ')) }, '🔊')));
          const box = h('div', { class: 'choices col' }, order.map(k => h('button', {
            class: 'choice wide', onclick: e => {
              box.querySelectorAll('button').forEach(b => { b.disabled = true; });
              const ok = k === a;
              if (ok) { right++; cheer(); } else softFail();
              e.currentTarget.classList.add(ok ? 'qok' : 'qno');
              if (!ok) box.children[order.indexOf(a)].classList.add('qok');
              const res = h('div', { class: 'result ' + (ok ? 'ok' : 'meh') }, h('b', {}, ok ? '✅ Richtig! ' : `🤔 Die Antwort ist: ${opts[a]}. `), '💡 ' + fact);
              put(view, res, h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { i++; show(); } }, i < qs.length - 1 ? 'Nächste Frage ➜' : 'Ergebnis ➜')));
              sayKid((ok ? 'Richtig! ' : 'Die Antwort ist: ' + opts[a] + '. ') + fact);
              res.scrollIntoView({ behavior: 'smooth', block: 'center' });
            },
          }, opts[k])));
          put(view, box);
          timers.set(() => sayKid(q + ' ' + opts.join(', oder ') + '?'), 300);
        };
        show();
      }
      themen();
    },
  };


  /* ======================= ⚡ Blitz-Lesen ======================= */
  // Silben mit „-“ getrennt (für die farbigen Silben nach dem Vorlesen), Leerzeichen trennt Wörter
  const BLITZ = [
    { de: '🔤 Silben', w: ['Ma', 'Mo', 'Mi', 'Mu', 'La', 'Lo', 'Li', 'Le', 'Sa', 'So', 'Si', 'Ra', 'Ro', 'Ri', 'Na', 'No', 'Ni', 'Fa', 'Fi', 'Fo', 'Pa', 'Po', 'Ha', 'Ho', 'Ba', 'Bo', 'Wa', 'Wi'].map(x => [x, '']) },
    { de: '🐣 Ganz kurz', w: [['Ei', '🥚'], ['Eis', '🍦'], ['O-ma', '👵'], ['O-pa', '👴'], ['Uhr', '⌚'], ['Rad', '🚲'], ['Bus', '🚌'], ['Zug', '🚆'], ['Hut', '🎩'], ['Kuh', '🐄'], ['Reh', '🦌'], ['Ma-ma', '👩'], ['Pa-pa', '👨'], ['Au-to', '🚗'], ['So-fa', '🛋️'], ['La-ma', '🦙'], ['Ho-se', '👖'], ['Na-se', '👃'], ['Ro-se', '🌹'], ['I-gel', '🦔'], ['E-sel', '🫏'], ['Mo-fa', '🛵'], ['Ki-wi', '🥝'], ['Piz-za', '🍕']] },
    { de: '🙂 Ein Klang', w: [['Hund', '🐕'], ['Maus', '🐭'], ['Haus', '🏠'], ['Baum', '🌳'], ['Ball', '⚽'], ['Bett', '🛏️'], ['Brot', '🍞'], ['Mond', '🌙'], ['Fisch', '🐟'], ['Tisch', '🍽️'], ['Kind', '🧒'], ['Bein', '🦵'], ['Hand', '✋'], ['Fuß', '🦶'], ['Buch', '📖'], ['Stern', '⭐'], ['Schaf', '🐑'], ['Pferd', '🐴'], ['Zelt', '⛺'], ['Herz', '❤️'], ['Milch', '🥛'], ['Schuh', '👟'], ['Bär', '🐻'], ['Frosch', '🐸']] },
    { de: '📗 Zwei Silben', w: [['Kat-ze', '🐱'], ['Ap-fel', '🍎'], ['Blu-me', '🌸'], ['Son-ne', '☀️'], ['Tas-se', '☕'], ['Bir-ne', '🍐'], ['En-te', '🦆'], ['Ha-se', '🐰'], ['Wol-ke', '☁️'], ['Pup-pe', '🪆'], ['Ker-ze', '🕯️'], ['Gei-ge', '🎻'], ['Schu-le', '🏫'], ['Fe-der', '🪶'], ['Rau-pe', '🐛'], ['Ku-chen', '🍰'], ['Zwie-bel', '🧅'], ['Ta-xi', '🚕'], ['Pin-sel', '🖌️'], ['Kro-ne', '👑'], ['Dra-chen', '🐉'], ['Ze-bra', '🦓'], ['Lö-we', '🦁'], ['Af-fe', '🐒']] },
    { de: '📘 Drei Silben', w: [['Ba-na-ne', '🍌'], ['To-ma-te', '🍅'], ['Ka-rot-te', '🥕'], ['Gi-raf-fe', '🦒'], ['Ra-ke-te', '🚀'], ['Ka-nin-chen', '🐇'], ['E-le-fant', '🐘'], ['Schmet-ter-ling', '🦋'], ['Pa-pa-gei', '🦜'], ['Pin-gu-in', '🐧'], ['Gi-tar-re', '🎸'], ['Kro-ko-dil', '🐊'], ['Te-le-fon', '☎️'], ['Schild-krö-te', '🐢'], ['Erd-bee-re', '🍓'], ['Fla-min-go', '🦩'], ['Pi-ra-ten', '🏴‍☠️'], ['Zi-tro-ne', '🍋'], ['Ham-bur-ger', '🍔'], ['Ro-bo-ter', '🤖']] },
    { de: '📙 Lange Wörter', w: [['Feu-er-wehr', '🚒'], ['Schnee-mann', '⛄'], ['Fuß-ball', '⚽'], ['Eis-bär', '🐻‍❄️'], ['Hub-schrau-ber', '🚁'], ['Re-gen-schirm', '☂️'], ['Weih-nachts-baum', '🎄'], ['Schul-ran-zen', '🎒'], ['Zahn-bürs-te', '🪥'], ['Son-nen-blu-me', '🌻'], ['Kran-ken-wa-gen', '🚑'], ['Po-li-zei-au-to', '🚓'], ['Ein-horn', '🦄'], ['Flug-zeug', '✈️'], ['Spiel-platz', '🛝'], ['Re-gen-bo-gen', '🌈'], ['Ma-ri-en-kä-fer', '🐞'], ['Scho-ko-la-de', '🍫'], ['Ge-burts-tag', '🎂'], ['Fahr-rad-helm', '🚴']] },
    { de: '🦕 Riesen-Wörter', w: [['Eich-hörn-chen', '🐿️'], ['Ach-ter-bahn', '🎢'], ['Wasch-ma-schi-ne', '🧺'], ['Hams-ter-kä-fig', '🐹'], ['Feu-er-wehr-schlauch', '🚒'], ['Ge-burts-tags-tor-te', '🎂'], ['Fuß-ball-tor-wart', '⚽'], ['Weih-nachts-mann', '🎅'], ['Os-ter-ha-se', '🐰'], ['Bus-hal-te-stel-le', '🚏'], ['Bau-stel-len-fahr-zeug', '🚧'], ['Ku-schel-tier', '🧸'], ['Di-no-sau-ri-er', '🦖'], ['Erd-beer-mar-me-la-de', '🍓'], ['Tisch-ten-nis-schlä-ger', '🏓'], ['Re-gen-bo-gen-far-ben', '🌈'], ['Zahn-pas-ten-tu-be', '🪥'], ['Lö-wen-zahn-blü-te', '🌼'], ['Ei-sen-bahn-brü-cke', '🌉'], ['Schmet-ter-lings-flü-gel', '🦋'], ['Kin-der-gar-ten-fest', '🎉'], ['Pa-pa-gei-en-fe-der', '🦜']] },
    { de: '📚 Kleine Sätze', w: [['Der Hund bellt.', '🐕'], ['Die Son-ne scheint.', '☀️'], ['Ich es-se ein Eis.', '🍦'], ['Ma-ma liest ein Buch.', '📖'], ['Das Au-to ist rot.', '🚗'], ['Die Kat-ze schläft.', '🐱'], ['Wir spie-len Fuß-ball.', '⚽'], ['Der Mond ist rund.', '🌙'], ['O-ma backt Ku-chen.', '🍰'], ['Es reg-net heu-te.', '🌧️'], ['Ich ma-le ein Haus.', '🏠'], ['Der Zug fährt schnell.', '🚆'], ['Das Ba-by lacht.', '👶'], ['Pa-pa kocht Nu-deln.', '🍝'], ['Die En-te schwimmt.', '🦆'], ['Im Gar-ten blüht ei-ne Blu-me.', '🌸'], ['Der Bus ist gelb.', '🚌'], ['Ich ha-be ei-nen Ball.', '⚽']] },
    { de: '📖 Lange Sätze', w: [['Der klei-ne Hund spielt im Gar-ten mit dem Ball.', '🐕'], ['Am Mor-gen scheint die Son-ne durch das Fens-ter.', '☀️'], ['Mei-ne O-ma backt heu-te ei-nen le-cke-ren Ku-chen.', '🍰'], ['Die Feu-er-wehr löscht das Feu-er mit viel Was-ser.', '🚒'], ['Im Win-ter bau-en wir ei-nen gro-ßen Schnee-mann.', '⛄'], ['Der E-le-fant trinkt Was-ser mit sei-nem Rüs-sel.', '🐘'], ['Nach der Schu-le spie-le ich mit mei-nen Freun-den.', '🧒'], ['Die Kat-ze schläft ge-müt-lich auf dem So-fa.', '🐱'], ['Im Zoo ha-ben wir ei-ne Gi-raf-fe ge-se-hen.', '🦒'], ['Der Pi-rat sucht ei-nen Schatz auf der In-sel.', '🏴‍☠️'], ['Die Ra-ke-te fliegt ganz schnell zum Mond.', '🚀'], ['Wir fah-ren mit dem Zug zu O-ma und O-pa.', '🚆'], ['Der Bä-cker backt am Mor-gen fri-sches Brot.', '🍞'], ['Im Herbst fal-len bun-te Blät-ter von den Bäu-men.', '🍂'], ['Die En-te schwimmt mit ih-ren Kü-ken im Teich.', '🦆'], ['Heu-te A-bend le-sen wir ein span-nen-des Buch.', '📖']] },
  ];
  // Tempo 1–15: so lange bleibt ein Wort sichtbar (Grundzeit, längere Wörter etwas länger) – 9 s bis 0,3 s
  const TEMPO_MAX = 15;
  const tempoBase = t => 9000 * Math.pow(0.035, (t - 1) / (TEMPO_MAX - 1));
  const TEMPO_ICON = ['🐌', '🐌', '🐢', '🐢', '🐢', '🚶', '🚶', '🚲', '🚲', '🚗', '🚗', '🚂', '✈️', '🚀', '⚡'];
  const plain = w => w.replace(/-/g, '');
  const BLITZ_GAME = {
    id: 'blitzlesen', icon: '⚡', color: '#7c3aed', skill: 'Lesen üben', title: 'Blitz-Lesen',
    intro: 'Lies das Wort! Dann drück auf ▶️ – und hör, ob du richtig gelesen hast. Mit ➜ kommt das nächste Wort.',
    render(body) {
      // alte Einstellungen (vor der Erweiterung) passend übernehmen
      const oldLv = store.get('blitz_lv', null), oldT = store.get('blitz_tempo', null);
      const nearestT = ms => { let b = 1; for (let t = 1; t <= TEMPO_MAX; t++) if (Math.abs(tempoBase(t) - ms) < Math.abs(tempoBase(b) - ms)) b = t; return b; };
      let lv = store.get('blitz_lv2', oldLv == null ? 1 : [1, 2, 3, 4, 5, 7][oldLv] ?? 1), blitz = store.get('blitz_mode', false),
        tempo = store.get('blitz_tempo2', oldT == null ? 6 : nearestT(4200 - (oldT - 1) * 390));
      // Tempo 1 (langsam) … 10 (blitzschnell): so lange bleibt das Wort sichtbar (längere Wörter etwas länger)
      const showMs = () => { const w = plain(deck[i][0]).replace(/\s/g, '').length; return Math.round(tempoBase(tempo) * (0.55 + w * 0.06)); };
      const sec = ms => (ms / 1000).toLocaleString('de-DE', { maximumFractionDigits: 1 });
      let deck = [], i = 0, shown = false, hideT = null;
      const card = h('button', { class: 'bzcard', 'aria-label': 'Wort' });
      const count = h('span', { class: 'pill' });
      const total = h('span', { class: 'pill' });
      const modeBtn = h('button', { class: 'btn alt bzmode', onclick: () => { blitz = !blitz; store.set('blitz_mode', blitz); paintMode(); show(); } });
      const prevB = h('button', { class: 'btn alt bznav', 'aria-label': 'Wort davor', onclick: () => go(-1) }, '◀ Davor');
      const playB = h('button', { class: 'bzplay', 'aria-label': 'Vorlesen', onclick: play }, '▶');
      const nextB = h('button', { class: 'btn bznav', 'aria-label': 'Nächstes Wort', onclick: () => go(1) }, 'Weiter ➜');
      const slider = window.diffSlider({ min: 0, max: BLITZ.length - 1, value: lv, label: v => BLITZ[v].de, onChange: v => { lv = v; store.set('blitz_lv2', v); neu(); sayKid(BLITZ[v].de.replace(/^\S+\s/, '')); } });
      const speed = window.diffSlider({ min: 1, max: TEMPO_MAX, value: tempo, lo: '🐌 Langsam', hi: '⚡ Schnell',
        label: v => `Tempo ${v} von ${TEMPO_MAX} ${TEMPO_ICON[v - 1]} · ein kurzes Wort ist ca. ${sec(tempoBase(v) * 0.85)} Sekunden zu sehen`,
        onChange: v => { tempo = v; store.set('blitz_tempo2', v); if (!blitz) { blitz = true; store.set('blitz_mode', true); paintMode(); } show(); } });
      speed.classList.add('bzspeed');
      const bar = h('span', { class: 'bzbar' });
      put(body, slider, h('div', { class: 'row bzinfo' }, count, total, modeBtn), speed, card, h('div', { class: 'bzctl' }, prevB, playB, nextB));
      card.addEventListener('click', () => { if (blitz && card.classList.contains('hide')) { card.classList.remove('hide'); flash(); } });
      function paintMode() { modeBtn.textContent = blitz ? '⚡ Blitz: an' : '⚡ Blitz: aus'; modeBtn.classList.toggle('on', blitz); speed.classList.toggle('off', !blitz); }
      function neu() { deck = shuffle(BLITZ[lv].w.slice()); i = 0; show(); }
      function flash() {
        clearTimeout(hideT);
        // Blitz: Wort ist nur kurz zu sehen (längere Wörter etwas länger)
        if (blitz && !shown) {
          const ms = showMs();
          // Zeitbalken läuft leer, dann verschwindet das Wort
          card.appendChild(bar); bar.style.transition = 'none'; bar.style.width = 'calc(100% - 32px)'; void bar.offsetWidth;
          bar.style.transition = `width ${ms}ms linear`; bar.style.width = '0%';
          hideT = setTimeout(() => { if (!shown) card.classList.add('hide'); }, ms);
        }
      }
      function show() {
        const [w] = deck[i]; shown = false;
        card.className = 'bzcard' + (plain(w).length > 14 ? ' long' : '') + (plain(w).length > 24 ? ' xlong' : '');
        card.innerHTML = `<span class="bzword">${plain(w)}</span><span class="bzhint">${blitz ? '👆 Antippen = nochmal zeigen' : ''}</span>`;
        card.classList.remove('bzin'); void card.offsetWidth; card.classList.add('bzin');
        count.textContent = `Wort ${i + 1} von ${deck.length}`;
        total.textContent = `📖 ${store.get('blitz_total', 0)} gelesen`;
        prevB.disabled = i === 0;
        playB.classList.add('pulse');
        tone(880, 0.06, 'triangle', 0.12);
        flash();
      }
      function play() {
        const [w, emo] = deck[i];
        clearTimeout(hideT);
        // Silben farbig (blau/rot wie in der Schule) + Bild
        const syl = w.split(' ').map(word => word.split('-').map((s, k) => `<span class="s${k % 2}">${s}</span>`).join('')).join(' ');
        card.className = 'bzcard open' + (plain(w).length > 14 ? ' long' : '') + (plain(w).length > 24 ? ' xlong' : '');
        card.innerHTML = `<span class="bzword">${syl}</span>${emo ? `<span class="bzemo">${emo}</span>` : ''}`;
        playB.classList.remove('pulse');
        say(plain(w), { lang: 'de', rate: 0.75, pitch: 1.1 });
        if (!shown) { shown = true; store.set('blitz_total', store.get('blitz_total', 0) + 1); total.textContent = `📖 ${store.get('blitz_total', 0)} gelesen`; }
      }
      function go(d) {
        const n = i + d;
        if (n < 0) return;
        if (n >= deck.length) { cheer(); sayKid(`Super! Du hast ${deck.length} Wörter gelesen! Jetzt kommen neue.`); neu(); return; }
        i = n; show();
      }
      paintMode(); neu();
      return () => clearTimeout(hideT);
    },
  };

  window.EXTRA7 = [BLITZ_GAME, KLOETZE, VIER, WISSEN];
})();
