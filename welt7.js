'use strict';
/* =====================================================================
   7 JAHRE – „Meine Spielwelt“: Figuren gestalten, Kleider entwerfen,
   Haustiere, Haus / Tierheim / Eisberg-Haus einrichten, Musik wählen.
   Eigenes Spiel (keine Inhalte anderer Apps). Nutzt h(), put(), store,
   sayKid() aus kids7.js und audio(), tone(), pianoNote(), freq() aus app.js.
   ===================================================================== */
(function () {
  const W = {};
  let uid = 0;
  const id = () => Date.now().toString(36) + (uid++).toString(36);
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------------- Figuren (SVG) ---------------- */
  const SKIN = ['#ffe0c7', '#f5c9a5', '#e0a77e', '#c68654', '#8d5a3b', '#5c3a24'];
  const HAIRC = ['#2b1d14', '#6b3e26', '#c58b46', '#f2d27a', '#d9531e', '#ff6fb5', '#5b8cff', '#9b5de5', '#2ec4b6', '#eeeeee'];
  const HAIR = [['kurz', 'Kurz'], ['lang', 'Lang'], ['zopf', 'Zopf'], ['locken', 'Locken'], ['dutt', 'Zwei Dutts'], ['iro', 'Irokese'], ['glatze', 'Ohne']];
  const EYES = [['rund', '👀'], ['froh', '😊'], ['gross', '🤩'], ['zwinker', '😉']];
  const MOUTH = [['laecheln', '🙂'], ['grinsen', '😁'], ['oh', '😮'], ['zunge', '😛']];
  const BOTTOM = [['hose', 'Hose'], ['shorts', 'Shorts'], ['rock', 'Rock']];
  const ACC = [['', '–'], ['brille', '👓'], ['sonnenbrille', '🕶️'], ['kappe', '🧢'], ['krone', '👑'], ['kopfhoerer', '🎧'], ['schleife', '🎀'], ['blume', '🌸']];
  const COLORS = ['#e63946', '#ff8c00', '#ffd60a', '#2a9d4a', '#2ec4b6', '#1d4ed8', '#9b5de5', '#ff70a6', '#ffffff', '#222222', '#8d6e63', '#a3e635'];
  const PATTERNS = [['', 'Uni'], ['streifen', 'Streifen'], ['punkte', 'Punkte'], ['sterne', 'Sterne'], ['herzen', 'Herzen'], ['karo', 'Karo']];
  const SHAPES = [['shirt', 'T-Shirt'], ['pulli', 'Pulli'], ['kleid', 'Kleid'], ['top', 'Top']];
  const STICKERS = ['', '⭐', '❤️', '🌈', '🦄', '⚡', '🐱', '🌸', '🚀', '🍓', '😎', '🔥'];

  const defTop = () => ({ shape: 'shirt', color: '#1d4ed8', pattern: '', pc: '#ffffff', sticker: '' });
  const PRESETS = [
    { name: 'Mia', skin: 1, hair: 'zopf', hc: 5, eyes: 'froh', mouth: 'grinsen', top: { shape: 'shirt', color: '#9b5de5', pattern: 'sterne', pc: '#ffd60a', sticker: '' }, bottom: 'rock', bc: '#222222', shoes: '#ff70a6', acc: 'kopfhoerer' },
    { name: 'Leo', skin: 3, hair: 'iro', hc: 7, eyes: 'zwinker', mouth: 'laecheln', top: { shape: 'pulli', color: '#222222', pattern: '', pc: '#fff', sticker: '⚡' }, bottom: 'hose', bc: '#1d4ed8', shoes: '#e63946', acc: 'sonnenbrille' },
    { name: 'Emma', skin: 0, hair: 'lang', hc: 3, eyes: 'gross', mouth: 'laecheln', top: { shape: 'kleid', color: '#ff70a6', pattern: 'punkte', pc: '#ffffff', sticker: '' }, bottom: 'shorts', bc: '#ff70a6', shoes: '#ffffff', acc: 'krone' },
    { name: 'Ben', skin: 4, hair: 'locken', hc: 0, eyes: 'rund', mouth: 'grinsen', top: { shape: 'shirt', color: '#2a9d4a', pattern: 'streifen', pc: '#ffffff', sticker: '' }, bottom: 'shorts', bc: '#8d6e63', shoes: '#ffd60a', acc: 'kappe' },
    { name: 'Zoe', skin: 2, hair: 'dutt', hc: 8, eyes: 'froh', mouth: 'zunge', top: { shape: 'top', color: '#2ec4b6', pattern: 'herzen', pc: '#ff70a6', sticker: '' }, bottom: 'hose', bc: '#ffffff', shoes: '#9b5de5', acc: 'blume' },
    { name: 'Max', skin: 5, hair: 'kurz', hc: 0, eyes: 'rund', mouth: 'laecheln', top: { shape: 'pulli', color: '#e63946', pattern: 'karo', pc: '#222222', sticker: '' }, bottom: 'hose', bc: '#222222', shoes: '#ffffff', acc: 'brille' },
  ];

  let pid = 0;
  function patternDef(t, pidx) {
    const b = t.color, c = t.pc;
    const P = {
      streifen: `<rect width="16" height="16" fill="${b}"/><rect width="16" height="6" fill="${c}"/>`,
      punkte: `<rect width="16" height="16" fill="${b}"/><circle cx="8" cy="8" r="3.2" fill="${c}"/>`,
      sterne: `<rect width="16" height="16" fill="${b}"/><text x="8" y="12" font-size="11" text-anchor="middle" fill="${c}">★</text>`,
      herzen: `<rect width="16" height="16" fill="${b}"/><text x="8" y="12" font-size="10" text-anchor="middle" fill="${c}">♥</text>`,
      karo: `<rect width="16" height="16" fill="${b}"/><rect width="8" height="8" fill="${c}" opacity=".8"/><rect x="8" y="8" width="8" height="8" fill="${c}" opacity=".8"/>`,
    }[t.pattern];
    return P ? `<pattern id="pt${pidx}" width="16" height="16" patternUnits="userSpaceOnUse">${P}</pattern>` : '';
  }
  function charSVG(c, opts = {}) {
    const k = ++pid, skin = SKIN[c.skin] || SKIN[1], hc = HAIRC[c.hc] || HAIRC[0], t = c.top || defTop();
    const fillTop = t.pattern ? `url(#pt${k})` : t.color;
    const dress = t.shape === 'kleid';
    const longSleeve = t.shape === 'pulli';
    let back = '', front = '';
    switch (c.hair) {
      case 'lang': back = `<path d="M52 70 Q50 150 70 170 L130 170 Q150 150 148 70 Z" fill="${hc}"/>`; front = `<path d="M56 72 Q60 26 100 28 Q140 26 144 72 Q130 52 100 50 Q72 52 56 72Z" fill="${hc}"/>`; break;
      case 'zopf': back = `<path d="M140 64 Q172 86 160 140 Q152 160 146 140 Q156 100 136 80Z" fill="${hc}"/><circle cx="141" cy="62" r="7" fill="#ff70a6"/>`; front = `<path d="M56 72 Q58 26 100 28 Q142 26 144 72 Q128 50 100 50 Q72 52 56 72Z" fill="${hc}"/>`; break;
      case 'locken': front = `<g fill="${hc}">${[[60, 52], [72, 38], [88, 30], [106, 28], [124, 34], [138, 46], [146, 62], [54, 68]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15"/>`).join('')}</g>`; break;
      case 'dutt': front = `<circle cx="66" cy="32" r="15" fill="${hc}"/><circle cx="134" cy="32" r="15" fill="${hc}"/><path d="M56 72 Q58 30 100 30 Q142 30 144 72 Q128 52 100 52 Q72 52 56 72Z" fill="${hc}"/>`; break;
      case 'iro': front = `<path d="M88 50 L92 10 L100 30 L104 6 L110 30 L118 12 L114 52 Z" fill="${hc}"/>`; break;
      case 'kurz': front = `<path d="M58 66 Q58 30 100 30 Q142 30 142 66 Q132 48 100 46 Q70 48 58 66Z" fill="${hc}"/>`; break;
      default: break;
    }
    const eye = {
      rund: `<circle cx="84" cy="78" r="6" fill="#222"/><circle cx="116" cy="78" r="6" fill="#222"/><circle cx="86" cy="76" r="2" fill="#fff"/><circle cx="118" cy="76" r="2" fill="#fff"/>`,
      froh: `<path d="M76 80 Q84 70 92 80 M108 80 Q116 70 124 80" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>`,
      gross: `<circle cx="84" cy="78" r="10" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="116" cy="78" r="10" fill="#fff" stroke="#222" stroke-width="2"/><circle cx="85" cy="79" r="6" fill="#3a86ff"/><circle cx="117" cy="79" r="6" fill="#3a86ff"/><circle cx="87" cy="77" r="2" fill="#fff"/><circle cx="119" cy="77" r="2" fill="#fff"/>`,
      zwinker: `<circle cx="84" cy="78" r="6" fill="#222"/><path d="M108 79 Q116 73 124 79" stroke="#222" stroke-width="4" fill="none" stroke-linecap="round"/>`,
    }[c.eyes] || '';
    const mouth = {
      laecheln: `<path d="M86 98 Q100 110 114 98" stroke="#7a2e1f" stroke-width="4" fill="none" stroke-linecap="round"/>`,
      grinsen: `<path d="M84 96 Q100 116 116 96 Z" fill="#7a2e1f"/><path d="M88 97 L112 97 L110 101 L90 101Z" fill="#fff"/>`,
      oh: `<ellipse cx="100" cy="102" rx="6" ry="8" fill="#7a2e1f"/>`,
      zunge: `<path d="M86 98 Q100 110 114 98" stroke="#7a2e1f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M98 104 Q104 116 110 104Z" fill="#ff6b8b"/>`,
    }[c.mouth] || '';
    const acc = {
      brille: `<g fill="none" stroke="#222" stroke-width="3"><circle cx="84" cy="78" r="12"/><circle cx="116" cy="78" r="12"/><path d="M96 78 L104 78"/></g>`,
      sonnenbrille: `<g fill="#111"><rect x="70" y="68" width="26" height="18" rx="6"/><rect x="104" y="68" width="26" height="18" rx="6"/><rect x="94" y="72" width="12" height="4"/></g>`,
      kappe: `<path d="M56 58 Q60 22 100 22 Q140 22 144 58 Z" fill="#e63946"/><path d="M60 56 L32 62 Q40 52 62 50Z" fill="#b91c1c"/>`,
      krone: `<path d="M68 38 L72 12 L86 28 L100 8 L114 28 L128 12 L132 38 Z" fill="#ffd60a" stroke="#d4a017" stroke-width="2"/><circle cx="100" cy="24" r="4" fill="#e63946"/>`,
      kopfhoerer: `<path d="M58 74 Q58 26 100 26 Q142 26 142 74" stroke="#222" stroke-width="6" fill="none"/><rect x="48" y="66" width="16" height="26" rx="6" fill="#e63946"/><rect x="136" y="66" width="16" height="26" rx="6" fill="#e63946"/>`,
      schleife: `<path d="M100 34 L80 22 L80 46 Z M100 34 L120 22 L120 46Z" fill="#ff70a6"/><circle cx="100" cy="34" r="6" fill="#e0457b"/>`,
      blume: `<g transform="translate(132 40)">${[0, 72, 144, 216, 288].map(a => `<circle cx="${Math.cos(a * Math.PI / 180) * 7}" cy="${Math.sin(a * Math.PI / 180) * 7}" r="6" fill="#ff8fab"/>`).join('')}<circle r="5" fill="#ffd60a"/></g>`,
    }[c.acc] || '';
    const bc = c.bc || '#1d4ed8', shoes = c.shoes || '#222';
    const legsSkin = (dress || c.bottom !== 'hose');
    const legs = `
      ${legsSkin ? `<rect x="74" y="${dress ? 240 : 230}" width="20" height="${dress ? 46 : 56}" fill="${skin}"/><rect x="106" y="${dress ? 240 : 230}" width="20" height="${dress ? 46 : 56}" fill="${skin}"/>` : ''}
      ${!dress && c.bottom === 'hose' ? `<path d="M68 200 L132 200 L130 286 L104 286 L100 230 L96 286 L70 286 Z" fill="${bc}"/>` : ''}
      ${!dress && c.bottom === 'shorts' ? `<path d="M68 200 L132 200 L132 238 L104 238 L100 222 L96 238 L68 238 Z" fill="${bc}"/>` : ''}
      ${!dress && c.bottom === 'rock' ? `<path d="M70 200 L130 200 L146 250 L54 250 Z" fill="${bc}"/>` : ''}
      <ellipse cx="82" cy="290" rx="16" ry="9" fill="${shoes}" stroke="#0003" stroke-width="2"/><ellipse cx="118" cy="290" rx="16" ry="9" fill="${shoes}" stroke="#0003" stroke-width="2"/>`;
    const armsTop = longSleeve
      ? `<path d="M64 124 L42 196 L56 200 L74 140Z M136 124 L158 196 L144 200 L126 140Z" fill="${fillTop}"/>`
      : t.shape === 'top' ? '' : `<path d="M64 124 L48 156 L62 162 L74 140Z M136 124 L152 156 L138 162 L126 140Z" fill="${fillTop}"/>`;
    const arms = `<path d="M62 126 L42 196 L54 200 L72 138Z M138 126 L158 196 L146 200 L128 138Z" fill="${skin}"/><circle cx="48" cy="200" r="9" fill="${skin}"/><circle cx="152" cy="200" r="9" fill="${skin}"/>`;
    const body = dress
      ? `<path d="M66 118 Q100 110 134 118 L136 160 L156 250 L44 250 L64 160 Z" fill="${fillTop}"/>`
      : t.shape === 'top' ? `<path d="M72 120 Q100 114 128 120 L132 206 L68 206 Z" fill="${fillTop}"/><path d="M80 120 L80 110 M120 120 L120 110" stroke="${fillTop}" stroke-width="5"/>`
      : `<path d="M64 120 Q100 110 136 120 L134 206 L66 206 Z" fill="${fillTop}"/>`;
    const sticker = t.sticker ? `<text x="100" y="${dress ? 172 : 170}" font-size="30" text-anchor="middle">${t.sticker}</text>` : '';
    return `<svg viewBox="0 0 200 300" class="figur" ${opts.attrs || ''}><defs>${patternDef(t, k)}</defs>
      ${back}${legs}${arms}${armsTop}${body}${sticker}
      <rect x="90" y="108" width="20" height="16" fill="${skin}"/>
      <circle cx="100" cy="75" r="44" fill="${skin}"/>
      <circle cx="74" cy="94" r="7" fill="#ff8fab" opacity=".45"/><circle cx="126" cy="94" r="7" fill="#ff8fab" opacity=".45"/>
      ${front}${eye}${mouth}${acc}</svg>`;
  }
  W.charSVG = charSVG;

  /* ---------------- Speicher ---------------- */
  const S = {
    chars: () => store.get('welt_chars', PRESETS.map(p => ({ ...p, id: id() }))),
    setChars: v => store.set('welt_chars', v),
    clothes: () => store.get('welt_clothes', []),
    setClothes: v => store.set('welt_clothes', v),
    pets: () => store.get('welt_pets', [{ id: id(), a: 'hund', name: 'Bello', acc: '🎀' }, { id: id(), a: 'katze', name: 'Mimi', acc: '' }]),
    setPets: v => store.set('welt_pets', v),
  };

  /* ---------------- Musik ---------------- */
  let musBus = null, musTimer = null, musStep = 0;
  const TRACKS = [
    ['', '🔇', 'Aus'],
    ['froh', '😄', 'Fröhlich'],
    ['disco', '🪩', 'Disco'],
    ['chill', '😌', 'Gemütlich'],
    ['winter', '❄️', 'Winter'],
    ['abenteuer', '🗺️', 'Abenteuer'],
  ];
  function noiseHit(t, dur, vol, hp) {
    const a = audio(), n = a.createBufferSource(), buf = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = buf;
    const f = a.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = a.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f).connect(g).connect(musBus); n.start(t); n.stop(t + dur);
  }
  function kick(t) {
    const a = audio(), o = a.createOscillator(), g = a.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.14);
    g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g).connect(musBus); o.start(t); o.stop(t + 0.2);
  }
  const mk = n => 440 * Math.pow(2, (n - 69) / 12);
  const PROG = {
    froh: [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]],
    disco: [[57, 60, 64], [57, 60, 64], [53, 57, 60], [55, 59, 62]],
    chill: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]],
    winter: [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]],
    abenteuer: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],
  };
  const BPM = { froh: 116, disco: 122, chill: 76, winter: 92, abenteuer: 108 };
  function musicStep(track) {
    const a = audio(), t = a.currentTime + 0.05, s = musStep % 16, bar = Math.floor(musStep / 16) % 4;
    const ch = PROG[track][bar], root = ch[0] - 24;
    const T2 = (f, d, ty, v) => tone(f, d, ty, v, t - a.currentTime, musBus);
    if (track === 'froh') {
      if (s % 8 === 0) T2(mk(root), 0.5, 'sine', 0.35);
      if (s % 4 === 2) ch.forEach(n => T2(mk(n), 0.18, 'triangle', 0.07));
      if (s % 2 === 0) T2(mk(ch[(s / 2) % ch.length] + 12), 0.2, 'triangle', 0.1);
      if (s % 4 === 0) kick(t);
      if (s % 2 === 1) noiseHit(t, 0.04, 0.08, 7000);
    } else if (track === 'disco') {
      if (s % 4 === 0) kick(t);
      if (s % 4 === 2) noiseHit(t, 0.08, 0.14, 6000);
      if (s % 8 === 4) noiseHit(t, 0.15, 0.12, 1500);
      T2(mk(root + (s % 2 ? 12 : 0)), 0.14, 'sawtooth', 0.06);
      if (s === 0 || s === 6 || s === 10) ch.forEach(n => T2(mk(n + 12), 0.25, 'square', 0.025));
    } else if (track === 'chill') {
      if (s === 0) ch.forEach(n => T2(mk(n), 2.2, 'sine', 0.06));
      if (s === 0 || s === 8) T2(mk(root), 1.2, 'sine', 0.25);
      if ([3, 6, 11, 14].includes(s)) pianoNote(mk(ch[(s + bar) % ch.length] + 12), t - a.currentTime, musBus, 0.25);
    } else if (track === 'winter') {
      if (s % 2 === 0) pianoNote(mk(ch[(s / 2) % 3] + 24), t - a.currentTime, musBus, 0.18);
      if (s % 8 === 0) T2(mk(root + 12), 0.8, 'sine', 0.25);
      if (s % 4 === 0) noiseHit(t, 0.05, 0.05, 9000);
    } else if (track === 'abenteuer') {
      if (s % 4 === 0 || s === 14) { kick(t); T2(mk(root), 0.3, 'triangle', 0.3); }
      if (s % 4 === 2) T2(mk(root + 7), 0.15, 'triangle', 0.15);
      if ([0, 3, 6, 8, 12].includes(s)) T2(mk(ch[s % 3] + 12), 0.25, 'square', 0.04);
      if (s % 2) noiseHit(t, 0.03, 0.05, 8000);
    }
    musStep++;
  }
  function musicStop() { clearInterval(musTimer); musTimer = null; if (musBus) { const b = musBus; b.gain.setTargetAtTime(0, audio().currentTime, 0.05); setTimeout(() => b.disconnect(), 400); musBus = null; } }
  function musicPlay(track) {
    musicStop();
    if (!track) return;
    const a = audio(); musBus = a.createGain(); musBus.gain.value = store.get('welt_vol', 0.6); musBus.connect(a.destination);
    musStep = 0;
    musTimer = setInterval(() => musicStep(track), 60000 / BPM[track] / 4);
  }

  /* ---------------- Szenen (Haus, Tierheim, Eisberg) ---------------- */
  const BG = {
    haus: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9bd7ff"/><stop offset="1" stop-color="#e3f6ff"/></linearGradient></defs>
      <rect width="160" height="100" fill="url(#hs)"/><rect y="90" width="160" height="10" fill="#7cc46a"/>
      <path d="M14 30 L80 4 L146 30 Z" fill="#e76f51"/><rect x="18" y="30" width="124" height="61" fill="#fff"/>
      <rect x="20" y="32" width="59" height="27" fill="#ffe5ec"/><rect x="81" y="32" width="59" height="27" fill="#e0f2fe"/>
      <rect x="20" y="61" width="59" height="28" fill="#fef3c7"/><rect x="81" y="61" width="59" height="28" fill="#dcfce7"/>
      <rect x="18" y="58" width="124" height="3" fill="#a16207"/><rect x="18" y="88" width="124" height="3" fill="#a16207"/>
      <rect x="79" y="30" width="2" height="61" fill="#d6d3d1"/>
      <path d="M124 88 L124 84 L128 84 L128 80 L132 80 L132 76 L136 76 L136 72 L140 72 L140 88Z" fill="#c08457"/></svg>`,
    tierheim: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><rect width="160" height="100" fill="#bde0fe"/><rect y="70" width="160" height="30" fill="#86c76f"/>
      <rect x="10" y="22" width="90" height="52" fill="#fde68a"/><path d="M6 24 L55 6 L104 24Z" fill="#e76f51"/>
      <rect x="30" y="10" width="50" height="10" rx="3" fill="#fff"/><text x="55" y="17.5" font-size="6" text-anchor="middle" font-family="Arial" font-weight="bold" fill="#b45309">TIERHEIM ♥</text>
      ${[16, 44, 72].map(x => `<rect x="${x}" y="40" width="22" height="34" fill="#fff7ed" stroke="#b45309" stroke-width="1.2"/><path d="M${x} 40 L${x + 11} 34 L${x + 22} 40" fill="#e76f51"/>`).join('')}
      ${Array.from({ length: 12 }, (_, i) => `<rect x="${104 + i * 5}" y="62" width="2" height="14" fill="#fff"/>`).join('')}<rect x="104" y="65" width="56" height="2" fill="#fff"/><rect x="104" y="71" width="56" height="2" fill="#fff"/>
      <circle cx="140" cy="16" r="9" fill="#ffd60a"/></svg>`,
    eisberg: `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="es" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset=".6" stop-color="#7dd3fc"/></linearGradient>
      <linearGradient id="ew" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#0c4a6e"/></linearGradient></defs>
      <rect width="160" height="100" fill="url(#es)"/>${[[12, 8], [40, 14], [70, 6], [120, 10], [150, 18], [96, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8" fill="#fff"/>`).join('')}
      <path d="M8 22 Q40 18 70 28 Q100 20 152 26" stroke="#86efac" stroke-width="3" fill="none" opacity=".5"/>
      <path d="M18 66 L36 30 L54 38 L72 14 L92 34 L110 24 L140 66 Z" fill="#f0f9ff"/><path d="M72 14 L92 34 L110 24 L140 66 L104 66Z" fill="#bae6fd"/>
      <path d="M40 66 Q40 52 52 52 Q64 52 64 66Z M78 66 Q78 46 94 46 Q110 46 110 66Z" fill="#7dd3fc" opacity=".8"/>
      <rect y="64" width="160" height="36" fill="url(#ew)" opacity=".92"/><path d="M28 66 L132 66 L116 92 L46 92Z" fill="#e0f2fe" opacity=".35"/></svg>`,
  };
  const IGLU = `<svg viewBox="0 0 100 60"><path d="M6 58 Q6 6 50 6 Q94 6 94 58Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <g stroke="#cbd5e1" stroke-width="1.6" fill="none"><path d="M10 44 L90 44 M14 30 L86 30 M26 18 L74 18 M30 44 L30 58 M60 44 L60 58 M44 30 L44 44 M72 30 L72 44 M50 18 L50 30"/></g>
    <path d="M38 58 Q38 40 50 40 Q62 40 62 58Z" fill="#334155"/></svg>`;
  const CATALOG = {
    haus: { 'Möbel': '🛏️ 🛋️ 🪑 🚪 🪟 🖼️ 🪴 🛁 🚽 📺 💡 🕯️ 🪞 🧺 📚 🎹 🧸 🎮 🎨 ⚽ 🍳 🧁 🎂 🍕 🍎 🎈 🎁 🌈'.split(' ') },
    tierheim: { 'Für Tiere': '🦴 🥣 🍖 🥕 🐟 🧶 🎾 🪀 🧸 🛏️ 🧺 🏠 🪵 🌳 🌼 🚿 🧼 🩹 💉 ❤️ 🎀 ⚽ 🪴 💧'.split(' ') },
    eisberg: { 'Eis & Schnee': ['IGLU', ...'🧊 ❄️ ⛄ 🏔️ 🛷 ⛸️ 🎿 🧣 🧤 🔦 🕯️ 🛋️ 🛏️ 🍵 🐟 🎣 ⛺ 🌌 ⭐ 🌙 🎄'.split(' ')] },
  };
  const SCENE_ANIMALS = {
    haus: ['hund', 'katze', 'hamster', 'hase', 'papagei', 'fisch', 'schildkroete', 'pudel'],
    tierheim: ['hund', 'katze', 'hase', 'hamster', 'pudel', 'kueken', 'schwein', 'ziege', 'esel', 'pferd', 'igel', 'ente', 'schildkroete', 'papagei', 'maus', 'lama'],
    eisberg: ['pinguin', 'eisbaer', 'robbe', 'wal', 'fisch', 'otter', 'krake', 'delfin', 'mammut', 'einhorn'],
  };
  const SCENE_DEF = {
    haus: { de: 'Mein Haus', start: [{ t: 'e', v: '🛏️', x: 30, y: 47 }, { t: 'e', v: '🛋️', x: 35, y: 78 }, { t: 'e', v: '🪴', x: 68, y: 80 }] },
    tierheim: { de: 'Mein Tierheim', start: [{ t: 'img', v: 'hund', x: 23, y: 66 }, { t: 'img', v: 'katze', x: 51, y: 66 }, { t: 'e', v: '🥣', x: 70, y: 70 }] },
    eisberg: { de: 'Mein Eisberg-Haus', start: [{ t: 'iglu', x: 58, y: 56, s: 1.4 }, { t: 'img', v: 'pinguin', x: 32, y: 58 }, { t: 'e', v: '⛄', x: 76, y: 56 }] },
  };

  function sceneEditor(pane, sid) {
    const key = 'welt_scene_' + sid;
    let items = store.get(key, null) || SCENE_DEF[sid].start.map(i => ({ s: 1, f: 1, ...i, id: id() }));
    let sel = null;
    const save = () => store.set(key, items);
    const stage = h('div', { class: 'wstage', html: BG[sid] });
    const layer = h('div', { class: 'wlayer' });
    put(stage, layer);
    const tools = h('div', { class: 'wtools' });
    const pal = h('div', { class: 'wpal' });
    const catBar = h('div', { class: 'wcats' });
    put(pane, stage, tools, catBar, pal);

    function itemHTML(it) {
      if (it.t === 'e') return `<span class="we">${it.v}</span>`;
      if (it.t === 'img') return `<img src="img/tiere/${it.v}.png" alt="" draggable="false">`;
      if (it.t === 'iglu') return IGLU;
      if (it.t === 'char') return charSVG(it.c);
      if (it.t === 'pet') return `<span class="wpet"><img src="img/tiere/${it.p.a}.png" alt="" draggable="false">${it.p.acc ? `<i>${it.p.acc}</i>` : ''}<b>${it.p.name}</b></span>`;
      return '';
    }
    function size(it) {
      const w = stage.clientWidth;
      const k = w < 500 ? 1.35 : 1; // auf dem Handy etwas größer
      return k * ({ e: w * 0.075, img: w * 0.1, iglu: w * 0.22, char: w * 0.11, pet: w * 0.1 }[it.t] || w * 0.08);
    }
    function draw() {
      layer.innerHTML = '';
      items.forEach(it => {
        const el = h('div', { class: 'witem wt-' + it.t + (sel === it.id ? ' sel' : ''), html: itemHTML(it) });
        const sz = size(it);
        el.style.left = it.x + '%'; el.style.top = it.y + '%';
        el.style.width = (it.t === 'char' ? sz : it.t === 'iglu' ? sz : sz) + 'px';
        el.style.height = (it.t === 'char' ? sz * 1.5 : it.t === 'iglu' ? sz * 0.6 : sz) + 'px';
        el.style.fontSize = sz * 0.85 + 'px';
        el.style.transform = `translate(-50%, -50%) scale(${it.s || 1}) scaleX(${it.f || 1})`;
        el.addEventListener('pointerdown', e => {
          e.preventDefault(); e.stopPropagation();
          sel = it.id; el.setPointerCapture(e.pointerId);
          layer.querySelectorAll('.witem').forEach(x => x.classList.remove('sel')); el.classList.add('sel');
          drawTools();
          const r = stage.getBoundingClientRect(); const ox = e.clientX, oy = e.clientY, sx = it.x, sy = it.y;
          const mv = ev => {
            it.x = Math.max(0, Math.min(100, sx + (ev.clientX - ox) / r.width * 100));
            it.y = Math.max(0, Math.min(100, sy + (ev.clientY - oy) / r.height * 100));
            el.style.left = it.x + '%'; el.style.top = it.y + '%';
          };
          const up = () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); save(); };
          el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        });
        put(layer, el);
      });
    }
    stage.addEventListener('pointerdown', () => { sel = null; draw(); drawTools(); });
    function drawTools() {
      tools.innerHTML = '';
      const it = items.find(i => i.id === sel);
      if (!it) { put(tools, h('span', { class: 'whint' }, '👆 Tippe unten etwas an – dann kannst du es in der Szene herumschieben.')); return; }
      const act = (lbl, aria, fn) => h('button', { class: 'wtb', 'aria-label': aria, onclick: () => { fn(); save(); draw(); } }, lbl);
      put(tools,
        act('➕', 'Größer', () => { it.s = Math.min(3, (it.s || 1) * 1.2); }),
        act('➖', 'Kleiner', () => { it.s = Math.max(0.4, (it.s || 1) / 1.2); }),
        act('↔️', 'Spiegeln', () => { it.f = -(it.f || 1); }),
        act('⬆️', 'Nach vorne', () => { items = items.filter(i => i !== it); items.push(it); }),
        act('📄', 'Kopieren', () => { const c = { ...it, id: id(), x: it.x + 4, y: it.y + 3 }; items.push(c); sel = c.id; }),
        act('🗑️', 'Löschen', () => { items = items.filter(i => i !== it); sel = null; drawTools(); }));
    }
    function add(item) {
      const it = { s: 1, f: 1, x: 40 + Math.random() * 20, y: 45 + Math.random() * 15, id: id(), ...item };
      items.push(it); sel = it.id; save(); draw(); drawTools();
      tone(700 + Math.random() * 300, 0.1, 'triangle', 0.15);
    }
    const cats = {
      ...CATALOG[sid],
      '🐾 Tiere': 'animals', '👫 Leute': 'chars', '🐶 Meine Tiere': 'pets',
    };
    function showCat(name) {
      [...catBar.children].forEach(b => b.classList.toggle('on', b.textContent === name));
      pal.innerHTML = '';
      const v = cats[name];
      if (Array.isArray(v)) v.forEach(e => put(pal, h('button', { class: 'wp', onclick: () => add(e === 'IGLU' ? { t: 'iglu', s: 1.2 } : { t: 'e', v: e }), html: e === 'IGLU' ? IGLU : e })));
      else if (v === 'animals') SCENE_ANIMALS[sid].forEach(a => put(pal, h('button', { class: 'wp', onclick: () => add({ t: 'img', v: a }), html: `<img src="img/tiere/${a}.png" alt="">` })));
      else if (v === 'chars') { const cs = S.chars(); if (!cs.length) put(pal, h('span', { class: 'whint' }, 'Gestalte zuerst Leute bei 👫!')); cs.forEach(c => put(pal, h('button', { class: 'wp wpc', onclick: () => add({ t: 'char', c }), html: charSVG(c) }))); }
      else if (v === 'pets') { const ps = S.pets(); if (!ps.length) put(pal, h('span', { class: 'whint' }, 'Such dir zuerst Tiere bei 🐾 aus!')); ps.forEach(p => put(pal, h('button', { class: 'wp', onclick: () => add({ t: 'pet', p }), html: `<img src="img/tiere/${p.a}.png" alt="">` }))); }
    }
    Object.keys(cats).forEach(n => put(catBar, h('button', { class: 'wcat', onclick: () => showCat(n) }, n)));
    put(pane, h('div', { class: 'btnrow' }, h('button', { class: 'btn alt', onclick: () => { if (confirm('Alles wegräumen und neu anfangen?')) { items = []; sel = null; save(); draw(); drawTools(); } } }, '🧹 Alles wegräumen')));
    const ro = new ResizeObserver(draw); ro.observe(stage);
    showCat(Object.keys(cats)[0]); drawTools();
    return () => ro.disconnect();
  }

  /* ---------------- Leute gestalten ---------------- */
  function peopleEditor(pane) {
    let chars = S.chars();
    let cur = JSON.parse(JSON.stringify(chars[0] || { ...PRESETS[0], id: id() }));
    const gallery = h('div', { class: 'wgal' });
    const prev = h('div', { class: 'wprev' });
    const opts = h('div', { class: 'wopts' });
    const name = h('input', { class: 'wname', maxlength: '14', placeholder: 'Name' });
    put(pane, h('h3', { class: 'wh' }, 'Meine Leute – tippe jemanden an'), gallery,
      h('div', { class: 'wedit' }, h('div', { class: 'wleft' }, prev, name,
        h('div', { class: 'btnrow' },
          h('button', { class: 'btn alt', onclick: zufall }, '🎲 Zufall'),
          h('button', { class: 'btn', onclick: speichern }, '💾 Speichern'),
          h('button', { class: 'btn alt', onclick: neu }, '➕ Neu'))), opts));
    function drawGallery() {
      gallery.innerHTML = '';
      chars.forEach(c => put(gallery, h('div', { class: 'wg' + (c.id === cur.id ? ' on' : '') },
        h('button', { class: 'wgb', 'aria-label': c.name, onclick: () => { cur = JSON.parse(JSON.stringify(c)); draw(); sayKid('Hallo, ich bin ' + c.name + '!'); }, html: charSVG(c) + `<b>${c.name}</b>` }),
        h('button', { class: 'wdel', 'aria-label': 'Löschen', onclick: () => { chars = chars.filter(x => x.id !== c.id); S.setChars(chars); if (cur.id === c.id) cur = { ...PRESETS[0], id: id() }; draw(); } }, '✖'))));
    }
    function row(label, items, isOn, set, swatch) {
      const r = h('div', { class: 'wrow' }, h('small', {}, label));
      const bx = h('div', { class: 'wsw' });
      items.forEach(it => put(bx, h('button', {
        class: 'wo' + (isOn(it) ? ' on' : '') + (swatch ? ' swatch' : ''), style: swatch ? `background:${swatch(it)}` : null,
        onclick: () => { set(it); draw(); tone(820, 0.06, 'sine', 0.12); },
      }, swatch ? '' : (it[1] ?? it))));
      put(r, bx); return r;
    }
    function draw() {
      prev.innerHTML = charSVG(cur); name.value = cur.name || '';
      opts.innerHTML = '';
      const wardrobe = [defTop(), { shape: 'pulli', color: '#e63946', pattern: '', pc: '#fff', sticker: '' }, { shape: 'kleid', color: '#ffd60a', pattern: 'punkte', pc: '#ffffff', sticker: '' }, ...S.clothes()];
      put(opts,
        row('Haut', SKIN.map((c, i) => i), i => cur.skin === i, i => { cur.skin = i; }, i => SKIN[i]),
        row('Frisur', HAIR, x => cur.hair === x[0], x => { cur.hair = x[0]; }),
        row('Haarfarbe', HAIRC.map((c, i) => i), i => cur.hc === i, i => { cur.hc = i; }, i => HAIRC[i]),
        row('Augen', EYES, x => cur.eyes === x[0], x => { cur.eyes = x[0]; }),
        row('Mund', MOUTH, x => cur.mouth === x[0], x => { cur.mouth = x[0]; }));
      const tr = h('div', { class: 'wrow' }, h('small', {}, 'Oberteil (eigene Kleider aus dem 👗 Atelier!)'));
      const tb = h('div', { class: 'wsw' });
      wardrobe.forEach(t => put(tb, h('button', { class: 'wo wtop' + (JSON.stringify(cur.top) === JSON.stringify(t) ? ' on' : ''), onclick: () => { cur.top = { ...t }; draw(); }, html: clothesSVG(t) })));
      put(tr, tb); put(opts, tr);
      put(opts,
        row('Unten', BOTTOM, x => cur.bottom === x[0], x => { cur.bottom = x[0]; }),
        row('Farbe unten', COLORS, c => cur.bc === c, c => { cur.bc = c; }, c => c),
        row('Schuhe', COLORS, c => cur.shoes === c, c => { cur.shoes = c; }, c => c),
        row('Extra', ACC, x => cur.acc === x[0], x => { cur.acc = x[0]; }));
      drawGallery();
    }
    function zufall() {
      cur = { ...cur, skin: Math.floor(Math.random() * SKIN.length), hair: pick(HAIR)[0], hc: Math.floor(Math.random() * HAIRC.length), eyes: pick(EYES)[0], mouth: pick(MOUTH)[0],
        top: { shape: pick(SHAPES)[0], color: pick(COLORS), pattern: pick(PATTERNS)[0], pc: pick(COLORS), sticker: pick(STICKERS) }, bottom: pick(BOTTOM)[0], bc: pick(COLORS), shoes: pick(COLORS), acc: pick(ACC)[0] };
      draw(); tone(600, 0.1, 'triangle', 0.15); tone(900, 0.12, 'triangle', 0.15, 0.08);
    }
    function speichern() {
      cur.name = (name.value || '').trim() || pick(['Lina', 'Tom', 'Ella', 'Finn', 'Nora', 'Paul', 'Lia', 'Noah']);
      const i = chars.findIndex(c => c.id === cur.id);
      if (i >= 0) chars[i] = JSON.parse(JSON.stringify(cur)); else chars.push(JSON.parse(JSON.stringify(cur)));
      S.setChars(chars); draw(); cheer(); sayKid(cur.name + ' ist gespeichert!');
    }
    function neu() { cur = { ...PRESETS[Math.floor(Math.random() * PRESETS.length)], id: id(), name: '' }; zufall(); }
    name.addEventListener('input', () => { cur.name = name.value; });
    draw();
  }

  /* ---------------- Mode-Atelier ---------------- */
  function clothesSVG(t) {
    const c = { skin: 1, hair: 'glatze', hc: 0, eyes: '', mouth: '', top: t, bottom: 'hose', bc: '#e5e7eb', shoes: '#e5e7eb', acc: '' };
    // nur den Oberkörper zeigen (Ausschnitt statt ganzer Figur)
    return charSVG(c).replace('viewBox="0 0 200 300"', 'viewBox="34 104 132 154"');
  }
  function atelier(pane) {
    let t = defTop();
    const prev = h('div', { class: 'wprev big' });
    const opts = h('div', { class: 'wopts' });
    const shelf = h('div', { class: 'wgal' });
    put(pane, h('div', { class: 'wedit' }, h('div', { class: 'wleft' }, prev,
      h('div', { class: 'btnrow' }, h('button', { class: 'btn alt', onclick: () => { t = { shape: pick(SHAPES)[0], color: pick(COLORS), pattern: pick(PATTERNS)[0], pc: pick(COLORS), sticker: pick(STICKERS) }; draw(); } }, '🎲 Zufall'),
        h('button', { class: 'btn', onclick: () => { const cl = S.clothes(); cl.push({ ...t }); S.setClothes(cl.slice(-24)); draw(); cheer(); sayKid('Super! Dein Kleidungsstück hängt jetzt im Schrank.'); } }, '🧵 In den Schrank'))), opts),
      h('h3', { class: 'wh' }, '🚪 Mein Kleiderschrank (zum Anziehen bei 👫 Leute)'), shelf);
    const row = (label, items, isOn, set, sw) => {
      const r = h('div', { class: 'wrow' }, h('small', {}, label)), bx = h('div', { class: 'wsw' });
      items.forEach(it => put(bx, h('button', { class: 'wo' + (isOn(it) ? ' on' : '') + (sw ? ' swatch' : ''), style: sw ? `background:${it}` : null, onclick: () => { set(it); draw(); tone(820, 0.06, 'sine', 0.12); } }, sw ? '' : (Array.isArray(it) ? it[1] : it))));
      put(r, bx); return r;
    };
    function draw() {
      prev.innerHTML = clothesSVG(t);
      opts.innerHTML = '';
      const own = h('input', { type: 'color', value: t.color, class: 'wcolor', 'aria-label': 'Eigene Farbe' });
      own.addEventListener('input', () => { t.color = own.value; prev.innerHTML = clothesSVG(t); });
      put(opts,
        row('Was nähen wir?', SHAPES, x => t.shape === x[0], x => { t.shape = x[0]; }),
        row('Stoff-Farbe', COLORS, c => t.color === c, c => { t.color = c; }, true),
        h('div', { class: 'wrow' }, h('small', {}, 'Eigene Farbe mischen'), own),
        row('Muster', PATTERNS, x => t.pattern === x[0], x => { t.pattern = x[0]; }),
        row('Muster-Farbe', COLORS, c => t.pc === c, c => { t.pc = c; }, true),
        row('Aufnäher', STICKERS.map(s => [s, s || '–']), x => t.sticker === x[0], x => { t.sticker = x[0]; }));
      shelf.innerHTML = '';
      const cl = S.clothes();
      if (!cl.length) put(shelf, h('p', { class: 'whint' }, 'Noch leer – nähe dein erstes Teil!'));
      cl.forEach((c, i) => put(shelf, h('div', { class: 'wg' }, h('button', { class: 'wgb', onclick: () => { t = { ...c }; draw(); }, html: clothesSVG(c) }),
        h('button', { class: 'wdel', 'aria-label': 'Löschen', onclick: () => { const x = S.clothes(); x.splice(i, 1); S.setClothes(x); draw(); } }, '✖'))));
    }
    draw();
  }

  /* ---------------- Haustiere ---------------- */
  const PET_CHOICES = ['hund', 'katze', 'hase', 'hamster', 'pudel', 'pferd', 'einhorn', 'panda', 'pinguin', 'fuchs', 'igel', 'kueken', 'schwein', 'lama', 'eisbaer', 'drache', 'papagei', 'schildkroete', 'maus', 'koala', 'otter', 'robbe', 'ziege', 'eule'];
  const PET_NAMES = ['Bello', 'Mimi', 'Flocke', 'Keks', 'Luna', 'Sunny', 'Pünktchen', 'Rocky', 'Bella', 'Momo', 'Wuschel', 'Krümel', 'Sternchen', 'Toffee', 'Nala'];
  const PET_ACC = ['', '🎀', '👑', '🎩', '🕶️', '🧣', '🌸', '⭐'];
  function petsEditor(pane) {
    let sel = 'hund', acc = '';
    const name = h('input', { class: 'wname', maxlength: '14', placeholder: 'Name' });
    const prev = h('div', { class: 'wpetprev' });
    const choose = h('div', { class: 'wsw wpets' });
    const accs = h('div', { class: 'wsw' });
    const list = h('div', { class: 'wgal' });
    put(pane, h('div', { class: 'wedit' }, h('div', { class: 'wleft' }, prev, name,
      h('div', { class: 'btnrow' }, h('button', { class: 'btn alt', onclick: () => { name.value = pick(PET_NAMES); } }, '🎲 Name'),
        h('button', { class: 'btn', onclick: adopt }, '❤️ Aufnehmen'))),
      h('div', { class: 'wopts' }, h('div', { class: 'wrow' }, h('small', {}, 'Welches Tier?'), choose), h('div', { class: 'wrow' }, h('small', {}, 'Schmuck'), accs))),
      h('h3', { class: 'wh' }, '🏠 Meine Tiere (kommen mit ins Haus, Tierheim und Eisberg-Haus)'), list);
    function drawPrev() { prev.innerHTML = `<img src="img/tiere/${sel}.png" alt="">${acc ? `<i>${acc}</i>` : ''}`; }
    function draw() {
      choose.innerHTML = ''; accs.innerHTML = ''; list.innerHTML = '';
      PET_CHOICES.forEach(a => put(choose, h('button', { class: 'wo wani' + (a === sel ? ' on' : ''), onclick: () => { sel = a; draw(); tone(760, 0.08, 'triangle', 0.15); }, html: `<img src="img/tiere/${a}.png" alt="">` })));
      PET_ACC.forEach(a => put(accs, h('button', { class: 'wo' + (a === acc ? ' on' : ''), onclick: () => { acc = a; draw(); } }, a || '–')));
      S.pets().forEach(p => put(list, h('div', { class: 'wg' }, h('div', { class: 'wgb wpet', html: `<img src="img/tiere/${p.a}.png" alt="">${p.acc ? `<i>${p.acc}</i>` : ''}<b>${p.name}</b>` }),
        h('button', { class: 'wdel', 'aria-label': 'Löschen', onclick: () => { S.setPets(S.pets().filter(x => x.id !== p.id)); draw(); } }, '✖'))));
      drawPrev();
    }
    function adopt() {
      const n = (name.value || '').trim() || pick(PET_NAMES);
      const ps = S.pets(); ps.push({ id: id(), a: sel, name: n, acc }); S.setPets(ps.slice(-30));
      name.value = ''; draw(); cheer(); sayKid(n + ' wohnt jetzt bei dir!');
    }
    draw();
  }

  /* ---------------- Musik-Auswahl ---------------- */
  function musikPane(pane) {
    const curT = store.get('welt_music', 'froh');
    const vol = h('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(store.get('welt_vol', 0.6)), class: 'wvol', 'aria-label': 'Lautstärke' });
    vol.addEventListener('input', () => { store.set('welt_vol', +vol.value); if (musBus) musBus.gain.value = +vol.value; });
    const grid = h('div', { class: 'wmus' });
    TRACKS.forEach(([k, ic, de]) => put(grid, h('button', {
      class: 'wmb' + (k === curT ? ' on' : ''), onclick: e => {
        store.set('welt_music', k); musicPlay(k);
        grid.querySelectorAll('.wmb').forEach(b => b.classList.toggle('on', b === e.currentTarget));
      },
    }, h('span', {}, ic), de)));
    put(pane, h('p', { class: 'big' }, 'Welche Musik soll in deiner Spielwelt laufen?'), grid, h('div', { class: 'wrow center' }, h('small', {}, '🔈 Lautstärke 🔊'), vol));
  }

  /* ---------------- Das Spiel ---------------- */
  window.SPIELWELT = {
    id: 'spielwelt', icon: '🌍', color: '#ff006e', skill: 'Gestalten & Spielen', title: 'Meine Spielwelt',
    intro: 'Gestalte coole Leute, nähe Kleider, such dir Tiere aus und richte dein Haus, das Tierheim und das Eisberg-Haus ein!',
    render(body) {
      const TABS = [
        ['👫', 'Leute', peopleEditor], ['👗', 'Atelier', atelier], ['🐾', 'Tiere', petsEditor],
        ['🏡', 'Haus', p => sceneEditor(p, 'haus')], ['🐶', 'Tierheim', p => sceneEditor(p, 'tierheim')],
        ['🧊', 'Eisberg-Haus', p => sceneEditor(p, 'eisberg')], ['🎵', 'Musik', musikPane],
      ];
      const bar = h('div', { class: 'wtabs' }), pane = h('div', { class: 'wpane' });
      put(body, bar, pane);
      let cleanup = null;
      TABS.forEach(([ic, de, fn], i) => put(bar, h('button', {
        class: 'wtab', onclick: () => {
          if (cleanup) { cleanup(); cleanup = null; }
          bar.querySelectorAll('.wtab').forEach((b, k) => b.classList.toggle('on', k === i));
          pane.innerHTML = ''; const c = fn(pane); if (typeof c === 'function') cleanup = c;
          sayKid(de);
        },
      }, h('span', {}, ic), de)));
      bar.firstChild.classList.add('on'); peopleEditor(pane);
      musicPlay(store.get('welt_music', 'froh'));
      return () => { musicStop(); if (cleanup) cleanup(); };
    },
  };
})();
