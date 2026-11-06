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
  const EYES = [['rund', '👀'], ['wimpern', '👁️'], ['gross', '🤩'], ['froh', '😊'], ['zwinker', '😉']];
  const EYEC = ['#6b3e26', '#3a86ff', '#2a9d4a', '#5f6b7a', '#9b5de5', '#d4a017'];
  const MOUTH = [['laecheln', '🙂'], ['grinsen', '😁'], ['oh', '😮'], ['zunge', '😛']];
  const BOTTOM = [['hose', 'Hose'], ['shorts', 'Shorts'], ['rock', 'Rock']];
  const ACC = [['', '–'], ['brille', '👓'], ['sonnenbrille', '🕶️'], ['kappe', '🧢'], ['krone', '👑'], ['kopfhoerer', '🎧'], ['schleife', '🎀'], ['blume', '🌸']];
  const COLORS = ['#e63946', '#ff8c00', '#ffd60a', '#2a9d4a', '#2ec4b6', '#1d4ed8', '#9b5de5', '#ff70a6', '#ffffff', '#222222', '#8d6e63', '#a3e635'];
  const PATTERNS = [['', 'Uni'], ['streifen', 'Streifen'], ['punkte', 'Punkte'], ['sterne', 'Sterne'], ['herzen', 'Herzen'], ['karo', 'Karo']];
  const SHAPES = [['shirt', 'T-Shirt'], ['pulli', 'Pulli'], ['kleid', 'Kleid'], ['top', 'Top']];
  const STICKERS = ['', '⭐', '❤️', '🌈', '🦄', '⚡', '🐱', '🌸', '🚀', '🍓', '😎', '🔥'];

  const defTop = () => ({ shape: 'shirt', color: '#1d4ed8', pattern: '', pc: '#ffffff', sticker: '' });
  const PRESETS = [
    { name: 'Mia', ec: 4, skin: 1, hair: 'zopf', hc: 5, eyes: 'wimpern', mouth: 'grinsen', top: { shape: 'shirt', color: '#9b5de5', pattern: 'sterne', pc: '#ffd60a', sticker: '' }, bottom: 'rock', bc: '#222222', shoes: '#ff70a6', acc: 'kopfhoerer' },
    { name: 'Leo', ec: 0, skin: 3, hair: 'iro', hc: 7, eyes: 'zwinker', mouth: 'laecheln', top: { shape: 'pulli', color: '#222222', pattern: '', pc: '#fff', sticker: '⚡' }, bottom: 'hose', bc: '#1d4ed8', shoes: '#e63946', acc: 'sonnenbrille' },
    { name: 'Emma', ec: 1, skin: 0, hair: 'lang', hc: 3, eyes: 'gross', mouth: 'laecheln', top: { shape: 'kleid', color: '#ff70a6', pattern: 'punkte', pc: '#ffffff', sticker: '' }, bottom: 'shorts', bc: '#ff70a6', shoes: '#ffffff', acc: 'krone' },
    { name: 'Ben', ec: 2, skin: 4, hair: 'locken', hc: 0, eyes: 'rund', mouth: 'grinsen', top: { shape: 'shirt', color: '#2a9d4a', pattern: 'streifen', pc: '#ffffff', sticker: '' }, bottom: 'shorts', bc: '#8d6e63', shoes: '#ffd60a', acc: 'kappe' },
    { name: 'Zoe', ec: 5, skin: 2, hair: 'dutt', hc: 8, eyes: 'froh', mouth: 'zunge', top: { shape: 'top', color: '#2ec4b6', pattern: 'herzen', pc: '#ff70a6', sticker: '' }, bottom: 'hose', bc: '#ffffff', shoes: '#9b5de5', acc: 'blume' },
    { name: 'Max', ec: 3, skin: 5, hair: 'kurz', hc: 0, eyes: 'rund', mouth: 'laecheln', top: { shape: 'pulli', color: '#e63946', pattern: 'karo', pc: '#222222', sticker: '' }, bottom: 'hose', bc: '#222222', shoes: '#ffffff', acc: 'brille' },
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
  // Neue, schönere Figuren: großer Kopf, Konturen, glänzende Augen, Brauen, Nase, Ohren, Haarglanz
  const OL = '#3d2b2b';
  function shade(hex, f) { // Farbe abdunkeln (f<1) oder aufhellen (f>1)
    const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1)))));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function charSVG(c) {
    const k = ++pid, skin = SKIN[c.skin] || SKIN[1], hc = HAIRC[c.hc] || HAIRC[0], t = c.top || defTop();
    const ec = EYEC[c.ec ?? 0] || EYEC[0];
    const top = t.pattern ? `url(#pt${k})` : t.color;
    const dress = t.shape === 'kleid', bc = c.bc || '#1d4ed8', shoes = c.shoes || '#222';
    const st = `stroke="${OL}" stroke-width="3" stroke-linejoin="round"`;
    const limb = (d, col, w) => `<path d="${d}" stroke="${OL}" stroke-width="${w + 6}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
    // Haare hinten / vorne
    let back = '', front = '';
    const fringe = `<path d="M44 96 Q40 34 100 30 Q160 34 156 96 Q150 66 130 58 Q114 72 88 60 Q62 66 44 96Z" fill="${hc}" ${st}/>`;
    switch (c.hair) {
      case 'lang': back = `<path d="M40 92 Q28 236 70 250 L130 250 Q172 236 160 92Z" fill="${hc}" ${st}/>`; front = fringe; break;
      case 'zopf': back = `<path d="M150 62 Q190 90 176 168 Q170 188 160 168 Q170 120 146 86Z" fill="${hc}" ${st}/><circle cx="152" cy="62" r="9" fill="#ff70a6" ${st}/>`; front = fringe; break;
      case 'locken': back = `<g fill="${hc}" ${st}>${[[46, 120], [154, 120], [40, 96], [160, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17"/>`).join('')}</g>`;
        front = `<g fill="${hc}" ${st}>${[[50, 70], [64, 48], [84, 36], [106, 32], [128, 38], [146, 52], [156, 74]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20"/>`).join('')}</g><path d="M50 74 Q100 58 152 76 Q100 48 50 74Z" fill="${hc}"/>`; break;
      case 'dutt': back = `<circle cx="56" cy="40" r="20" fill="${hc}" ${st}/><circle cx="144" cy="40" r="20" fill="${hc}" ${st}/>`; front = fringe; break;
      case 'iro': front = `<path d="M84 52 L82 4 L96 26 L102 0 L110 26 L122 8 L118 54 Z" fill="${hc}" ${st}/>`; break;
      case 'kurz': front = `<path d="M44 92 Q42 32 100 30 Q158 32 156 92 Q148 62 120 56 Q96 66 70 58 Q52 66 44 92Z" fill="${hc}" ${st}/>`; break;
      default: break;
    }
    const shine = front && c.hair !== 'iro' && c.hair !== 'locken' ? `<path d="M70 46 Q96 36 120 42" stroke="#fff" stroke-opacity=".45" stroke-width="6" stroke-linecap="round" fill="none"/>` : '';
    const eyeOpen = (x, big) => {
      const rx = big ? 12 : 10, ry = big ? 13 : 11;
      return `<ellipse cx="${x}" cy="102" rx="${rx}" ry="${ry}" fill="#fff" ${st}/><circle cx="${x + 1}" cy="104" r="${big ? 8 : 7}" fill="${ec}"/>
        <circle cx="${x + 1}" cy="104" r="${big ? 4.5 : 4}" fill="#1b1b1b"/><circle cx="${x + 4}" cy="99" r="3.2" fill="#fff"/><circle cx="${x - 2}" cy="108" r="1.6" fill="#fff"/>`;
    };
    const eyeShut = x => `<path d="M${x - 10} 104 Q${x} 94 ${x + 10} 104" stroke="${OL}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    const lashes = x => `<path d="M${x - 11} 92 l-4 -4 M${x - 6} 89 l-2 -5 M${x + 11} 92 l4 -4" stroke="${OL}" stroke-width="2.5" stroke-linecap="round"/>`;
    const eyes = {
      rund: eyeOpen(80) + eyeOpen(120),
      gross: eyeOpen(80, 1) + eyeOpen(120, 1) + lashes(80) + lashes(120),
      froh: eyeShut(80) + eyeShut(120),
      zwinker: eyeOpen(80) + eyeShut(120),
      wimpern: eyeOpen(80) + eyeOpen(120) + lashes(80) + lashes(120),
    }[c.eyes] || eyeOpen(80) + eyeOpen(120);
    const brows = c.hair === 'glatze' && !c.hc ? '' : `<path d="M68 82 Q80 76 90 81 M110 81 Q120 76 132 82" stroke="${shade(hc, 0.7)}" stroke-width="4" stroke-linecap="round" fill="none"/>`;
    const mouth = {
      laecheln: `<path d="M88 126 Q100 136 112 126" stroke="${OL}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      grinsen: `<path d="M84 122 Q100 144 116 122 Z" fill="#8b2c2c" ${st}/><path d="M89 124 L111 124 L109 128 L91 128Z" fill="#fff"/><path d="M93 135 Q100 139 107 135" stroke="#ff8fa3" stroke-width="4" fill="none"/>`,
      oh: `<ellipse cx="100" cy="130" rx="7" ry="9" fill="#8b2c2c" ${st}/>`,
      zunge: `<path d="M88 126 Q100 136 112 126" stroke="${OL}" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M98 131 Q105 146 112 130Z" fill="#ff7b9c" ${st}/>`,
    }[c.mouth] || '';
    const acc = {
      brille: `<g fill="none" stroke="${OL}" stroke-width="3.5"><circle cx="80" cy="102" r="15"/><circle cx="120" cy="102" r="15"/><path d="M95 100 L105 100"/></g>`,
      sonnenbrille: `<g fill="#1b1b1b" ${st}><rect x="62" y="90" width="34" height="22" rx="8"/><rect x="104" y="90" width="34" height="22" rx="8"/></g><path d="M96 96 L104 96" stroke="${OL}" stroke-width="4"/><path d="M68 95 L78 95" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>`,
      kappe: `<path d="M44 74 Q46 26 100 26 Q154 26 156 74 Z" fill="#e63946" ${st}/><path d="M48 72 L14 80 Q20 64 52 62Z" fill="#b91c1c" ${st}/><circle cx="100" cy="28" r="5" fill="#b91c1c"/>`,
      krone: `<path d="M64 52 L66 16 L84 36 L100 10 L116 36 L134 16 L136 52 Z" fill="#ffd60a" ${st}/><circle cx="100" cy="34" r="5" fill="#e63946"/><circle cx="78" cy="44" r="3.5" fill="#3a86ff"/><circle cx="122" cy="44" r="3.5" fill="#2a9d4a"/>`,
      kopfhoerer: `<path d="M44 96 Q44 30 100 30 Q156 30 156 96" stroke="${OL}" stroke-width="12" fill="none"/><path d="M44 96 Q44 30 100 30 Q156 30 156 96" stroke="#3a86ff" stroke-width="7" fill="none"/><rect x="30" y="84" width="22" height="34" rx="9" fill="#e63946" ${st}/><rect x="148" y="84" width="22" height="34" rx="9" fill="#e63946" ${st}/>`,
      schleife: `<g ${st}><path d="M134 46 L112 30 L112 62 Z M134 46 L156 30 L156 62Z" fill="#ff70a6"/><circle cx="134" cy="46" r="7" fill="#e0457b"/></g>`,
      blume: `<g transform="translate(140 50)" ${st}>${[0, 72, 144, 216, 288].map(a => `<circle cx="${(Math.cos(a * Math.PI / 180) * 9).toFixed(1)}" cy="${(Math.sin(a * Math.PI / 180) * 9).toFixed(1)}" r="8" fill="#ff8fab"/>`).join('')}<circle r="6" fill="#ffd60a"/></g>`,
    }[c.acc] || '';
    // Körper wie bei einem Kind von 7–8 Jahren: Kopf etwa ein Fünftel der Größe, lange Beine
    const legY = dress ? 220 : 190;
    let legs = limb(`M89 ${legY} L89 272`, skin, 15) + limb(`M111 ${legY} L111 272`, skin, 15);
    if (!dress && c.bottom === 'hose') legs = limb('M89 196 L89 272', bc, 19) + limb('M111 196 L111 272', bc, 19) + `<path d="M70 184 L130 184 L132 206 L68 206Z" fill="${bc}" ${st}/>`;
    if (!dress && c.bottom === 'shorts') legs += `<path d="M69 184 L131 184 L134 222 L104 222 L100 208 L96 222 L66 222 Z" fill="${bc}" ${st}/>`;
    if (!dress && c.bottom === 'rock') legs += `<path d="M70 184 L130 184 L146 230 Q100 238 54 230 Z" fill="${bc}" ${st}/>`;
    const shoe = x => `<path d="M${x - 13} 288 Q${x - 13} 274 ${x} 274 Q${x + 16} 274 ${x + 16} 288 Z" fill="${shoes}" ${st}/><path d="M${x - 13} 288 L${x + 16} 288" stroke="${OL}" stroke-width="3"/>`;
    const armL = 'M74 120 Q60 152 58 184', armR = 'M126 120 Q140 152 142 184';
    const arms = limb(armL, skin, 12) + limb(armR, skin, 12) + `<circle cx="58" cy="188" r="7.5" fill="${skin}" ${st}/><circle cx="142" cy="188" r="7.5" fill="${skin}" ${st}/>`;
    const sleeve = t.shape === 'pulli' ? [armL, armR] : t.shape === 'top' ? [] : ['M74 120 Q68 132 65 144', 'M126 120 Q132 132 135 144'];
    const sleeves = sleeve.map(d => limb(d, top, 16)).join('');
    const body = dress
      ? `<path d="M73 114 Q100 106 127 114 L148 224 Q100 234 52 224 Z" fill="${top}" ${st}/>`
      : t.shape === 'top' ? `<path d="M78 116 Q100 110 122 116 L128 192 Q100 198 72 192 Z" fill="${top}" ${st}/>`
      : `<path d="M71 116 Q100 106 129 116 L132 192 Q100 200 68 192 Z" fill="${top}" ${st}/>`;
    const sticker = t.sticker ? `<text x="100" y="166" font-size="22" text-anchor="middle">${t.sticker}</text>` : '';
    const HEAD = 'translate(100 64) scale(0.7) translate(-100 -94)';
    return `<svg viewBox="0 0 200 300" class="figur"><defs>${patternDef(t, k)}</defs>
      <ellipse cx="100" cy="292" rx="44" ry="6" fill="#000" opacity=".12"/>
      <g transform="${HEAD}">${back}</g>${legs}${shoe(86)}${shoe(114)}${arms}${body}${sleeves}${sticker}
      <rect x="92" y="98" width="16" height="18" fill="${skin}" ${st}/>
      <g transform="${HEAD}">
      <circle cx="44" cy="104" r="11" fill="${skin}" ${st}/><circle cx="156" cy="104" r="11" fill="${skin}" ${st}/>
      <ellipse cx="100" cy="94" rx="56" ry="56" fill="${skin}" ${st}/>
      <circle cx="70" cy="122" r="8" fill="#ff8fab" opacity=".35"/><circle cx="130" cy="122" r="8" fill="#ff8fab" opacity=".35"/>
      ${front}${shine}${brows}${eyes}
      <path d="M96 110 Q100 118 104 110" stroke="${shade(skin, 0.68)}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      ${mouth}${acc}</g></svg>`;
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
  // Gespeicherte Figur (gleiche id) aktualisieren – so passt alles in Leute und im Haus zusammen
  function storeChar(c) {
    const cs = S.chars(), i = cs.findIndex(x => x.id === c.id);
    if (i >= 0) { cs[i] = JSON.parse(JSON.stringify(c)); S.setChars(cs); return true; }
    return false;
  }
  // Freier Platz für die k-te Figur im Haus (4 Plätze oben, 4 unten, dann leicht versetzt)
  const SPOTS = [[18, 46], [42, 46], [64, 46], [84, 46], [18, 78], [42, 78], [64, 78], [84, 78]];
  const spot = k => { const [x, y] = SPOTS[k % 8]; const r = Math.floor(k / 8); return { x: x + r * 6, y: y - r * 3 }; };
  // Figur direkt ins Haus setzen (oder dort aktualisieren)
  function placeInHouse(c) {
    const key = 'welt_scene_haus';
    const items = store.get(key, null) || SCENE_DEF.haus.start.map(i => ({ s: 1, f: 1, ...i, id: id() }));
    const ex = items.find(i => i.t === 'char' && i.c.id === c.id);
    if (ex) ex.c = JSON.parse(JSON.stringify(c));
    else { items.push({ t: 'char', c: JSON.parse(JSON.stringify(c)), s: 1, f: 1, ...spot(items.filter(i => i.t === 'char').length), id: id() }); }
    store.set(key, items); return !ex;
  }

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
  /* ---------------- Szenen: verschiedene Hausarten zum Aussuchen ---------------- */
  const SV = inner => `<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;
  const sky = (id, a, b) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="160" height="100" fill="url(#${id})"/>`;
  const sun = (x, y) => `<circle cx="${x}" cy="${y}" r="8" fill="#ffd60a"/><circle cx="${x}" cy="${y}" r="11" fill="#ffd60a" opacity=".25"/>`;
  const cloud = (x, y) => `<g fill="#fff" opacity=".9"><circle cx="${x}" cy="${y}" r="4"/><circle cx="${x + 5}" cy="${y - 2}" r="5"/><circle cx="${x + 10}" cy="${y}" r="4"/></g>`;
  const grass = y => `<rect y="${y}" width="160" height="${100 - y}" fill="#7cc46a"/><rect y="${y}" width="160" height="1.5" fill="#5fa64f"/>`;
  const STYLES = {
    haus: [
      { id: 'stadthaus', de: 'Stadthaus', svg: SV(`${sky('g1', '#9bd7ff', '#e3f6ff')}${cloud(14, 14)}${cloud(120, 10)}${grass(90)}
        <path d="M14 30 L80 4 L146 30 Z" fill="#e76f51"/><rect x="18" y="30" width="124" height="61" fill="#fff"/>
        <rect x="20" y="32" width="59" height="27" fill="#ffe5ec"/><rect x="81" y="32" width="59" height="27" fill="#e0f2fe"/>
        <rect x="20" y="61" width="59" height="28" fill="#fef3c7"/><rect x="81" y="61" width="59" height="28" fill="#dcfce7"/>
        <rect x="18" y="58" width="124" height="3" fill="#a16207"/><rect x="18" y="88" width="124" height="3" fill="#a16207"/><rect x="79" y="30" width="2" height="61" fill="#d6d3d1"/>
        <path d="M124 88 L124 84 L128 84 L128 80 L132 80 L132 76 L136 76 L136 72 L140 72 L140 88Z" fill="#c08457"/>`) },
      { id: 'bauernhaus', de: 'Bauernhaus', svg: SV(`${sky('g2', '#a7dcff', '#f0faff')}${sun(140, 14)}${cloud(20, 12)}${grass(88)}
        <circle cx="8" cy="70" r="12" fill="#4d9a3f"/><rect x="6" y="74" width="4" height="16" fill="#8d5524"/>
        <path d="M8 42 L80 6 L152 42 Z" fill="#a0652e"/><path d="M8 42 L80 6 L152 42" stroke="#6b3e1d" stroke-width="2" fill="none"/>
        <path d="M30 42 L80 17 L130 42 Z" fill="#fde2b8"/><rect x="74" y="24" width="12" height="9" fill="#bfe3ff" stroke="#6b3e1d" stroke-width="1.2"/>
        <rect x="14" y="42" width="132" height="47" fill="#fffbeb"/>
        <rect x="16" y="44" width="63" height="20" fill="#fef3c7"/><rect x="81" y="44" width="63" height="20" fill="#ffe4e6"/>
        <rect x="16" y="67" width="63" height="21" fill="#ecfccb"/><rect x="81" y="67" width="63" height="21" fill="#e0f2fe"/>
        <g stroke="#6b3e1d" stroke-width="2.2"><path d="M14 42 L14 89 M146 42 L146 89 M80 42 L80 89 M14 65.5 L146 65.5 M14 89 L146 89 M8 42 L152 42"/></g>
        ${Array.from({ length: 6 }, (_, i) => `<rect x="${124 + i * 5}" y="80" width="1.6" height="10" fill="#fff"/>`).join('')}`) },
      { id: 'baumhaus', de: 'Baumhaus', svg: SV(`${sky('g3', '#8fd3ff', '#e8f8ff')}${cloud(120, 8)}${grass(92)}
        <g fill="#3f8f3a"><circle cx="80" cy="18" r="30"/><circle cx="42" cy="26" r="22"/><circle cx="120" cy="30" r="24"/><circle cx="60" cy="8" r="18"/><circle cx="104" cy="8" r="18"/></g>
        <g fill="#56b04d"><circle cx="70" cy="14" r="12"/><circle cx="112" cy="22" r="10"/><circle cx="40" cy="20" r="9"/></g>
        <path d="M70 100 L72 30 L88 30 L90 100Z" fill="#8d5524"/><path d="M72 46 L40 40 M88 58 L124 52" stroke="#8d5524" stroke-width="5" stroke-linecap="round"/>
        ${Array.from({ length: 7 }, (_, i) => `<rect x="74" y="${88 - i * 8}" width="12" height="1.8" fill="#d4a373"/>`).join('')}
        <rect x="16" y="26" width="46" height="22" fill="#e9c58b" stroke="#8d5524" stroke-width="1.5"/><path d="M12 27 L39 12 L66 27Z" fill="#c2410c"/><rect x="12" y="47" width="54" height="3" fill="#8d5524"/>
        <rect x="98" y="40" width="50" height="24" fill="#f3d9a4" stroke="#8d5524" stroke-width="1.5"/><path d="M94 41 L123 26 L152 41Z" fill="#c2410c"/><rect x="94" y="63" width="58" height="3" fill="#8d5524"/>
        <path d="M118 66 L118 82 M128 66 L128 82" stroke="#a16207" stroke-width=".8"/><rect x="115" y="81" width="16" height="2" fill="#8d5524"/>`) },
      { id: 'modern', de: 'Modernes Haus', svg: SV(`${sky('g4', '#bfe7ff', '#f8fdff')}${sun(20, 14)}${grass(90)}
        <rect x="4" y="86" width="36" height="8" rx="2" fill="#38bdf8"/><rect x="4" y="86" width="36" height="2" fill="#e0f2fe"/>
        <rect x="44" y="20" width="108" height="36" fill="#f1f5f9" stroke="#475569" stroke-width="1.5"/><rect x="44" y="17" width="108" height="4" fill="#334155"/>
        <rect x="47" y="23" width="49" height="31" fill="#e0f2fe"/><rect x="99" y="23" width="50" height="31" fill="#fae8ff"/>
        <rect x="14" y="56" width="138" height="34" fill="#ffffff" stroke="#475569" stroke-width="1.5"/><rect x="17" y="59" width="64" height="29" fill="#ecfdf5"/><rect x="84" y="59" width="65" height="29" fill="#fff7ed"/>
        <rect x="44" y="55" width="108" height="3" fill="#94a3b8"/><path d="M124 58 L124 88" stroke="#cbd5e1"/>
        <g fill="#16a34a"><circle cx="54" cy="14" r="4"/><circle cx="142" cy="14" r="4"/></g>`) },
      { id: 'schloss', de: 'Schloss', svg: SV(`${sky('g5', '#c4b5fd', '#fdf4ff')}${cloud(60, 8)}${grass(90)}
        <rect x="26" y="30" width="108" height="60" fill="#cbd5e1"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${28 + i * 12}" y="25" width="7" height="6" fill="#cbd5e1"/>`).join('')}
        <rect x="6" y="20" width="22" height="70" fill="#b6c2d1"/><path d="M3 21 L17 0 L31 21Z" fill="#7c3aed"/><rect x="132" y="20" width="22" height="70" fill="#b6c2d1"/><path d="M129 21 L143 0 L157 21Z" fill="#7c3aed"/>
        <path d="M17 1 L17 -6 L24 -3 L17 0" fill="#e63946"/><path d="M143 1 L143 -6 L150 -3 L143 0" fill="#e63946"/>
        <rect x="29" y="33" width="50" height="26" fill="#f5e1ff"/><rect x="81" y="33" width="50" height="26" fill="#fef9c3"/>
        <rect x="29" y="62" width="102" height="26" fill="#ede9fe"/><rect x="26" y="59" width="108" height="3" fill="#94a3b8"/>
        <rect x="70" y="80" width="20" height="8" fill="#b91c1c" opacity=".7"/>
        <path d="M10 40 Q17 34 24 40 L24 50 L10 50Z M136 40 Q143 34 150 40 L150 50 L136 50Z" fill="#334155"/>`) },
    ],
    tierheim: [
      { id: 'tierheim', de: 'Tierheim', svg: SV(`<rect width="160" height="100" fill="#bde0fe"/>${grass(70)}
        <rect x="10" y="22" width="90" height="52" fill="#fde68a"/><path d="M6 24 L55 6 L104 24Z" fill="#e76f51"/>
        <rect x="30" y="10" width="50" height="10" rx="3" fill="#fff"/><text x="55" y="17.5" font-size="6" text-anchor="middle" font-family="Arial" font-weight="bold" fill="#b45309">TIERHEIM ♥</text>
        ${[16, 44, 72].map(x => `<rect x="${x}" y="40" width="22" height="34" fill="#fff7ed" stroke="#b45309" stroke-width="1.2"/><path d="M${x} 40 L${x + 11} 34 L${x + 22} 40" fill="#e76f51"/>`).join('')}
        ${Array.from({ length: 12 }, (_, i) => `<rect x="${104 + i * 5}" y="62" width="2" height="14" fill="#fff"/>`).join('')}<rect x="104" y="65" width="56" height="2" fill="#fff"/><rect x="104" y="71" width="56" height="2" fill="#fff"/>${sun(140, 16)}`) },
      { id: 'tierhof', de: 'Tierhof', svg: SV(`${sky('t2', '#a5d8ff', '#effaff')}${sun(20, 12)}${cloud(100, 10)}${grass(66)}
        <rect x="8" y="30" width="62" height="56" fill="#c0392b"/><path d="M4 32 L39 8 L74 32Z" fill="#7f1d1d"/><path d="M28 86 L28 56 L50 56 L50 86Z" fill="#fde68a"/>
        <path d="M28 56 L50 86 M50 56 L28 86" stroke="#fff" stroke-width="2"/><rect x="28" y="56" width="22" height="30" fill="none" stroke="#fff" stroke-width="2"/>
        <rect x="30" y="18" width="18" height="10" fill="#fde68a" stroke="#fff" stroke-width="1.5"/>
        <ellipse cx="128" cy="90" rx="24" ry="7" fill="#38bdf8"/><ellipse cx="128" cy="89" rx="18" ry="3" fill="#7dd3fc"/>
        ${Array.from({ length: 16 }, (_, i) => `<rect x="${78 + i * 5}" y="62" width="1.8" height="14" fill="#fff"/>`).join('')}<rect x="78" y="65" width="80" height="1.8" fill="#fff"/><rect x="78" y="71" width="80" height="1.8" fill="#fff"/>
        <g fill="#eab308"><rect x="84" y="78" width="12" height="8" rx="2"/><rect x="98" y="80" width="10" height="6" rx="2"/></g>`) },
      { id: 'tierklinik', de: 'Tierklinik', svg: SV(`${sky('t3', '#c7f9ff', '#f0fdff')}${grass(88)}
        <rect x="12" y="20" width="136" height="69" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/><rect x="12" y="16" width="136" height="5" fill="#16a34a"/>
        <rect x="52" y="6" width="56" height="10" rx="3" fill="#16a34a"/><text x="80" y="13.5" font-size="6" text-anchor="middle" font-family="Arial" font-weight="bold" fill="#fff">✚ TIERKLINIK 🐾</text>
        <rect x="15" y="23" width="62" height="30" fill="#dcfce7"/><rect x="83" y="23" width="62" height="30" fill="#e0f2fe"/>
        <rect x="15" y="56" width="130" height="31" fill="#f1f5f9"/>${Array.from({ length: 13 }, (_, i) => `<path d="M${15 + i * 10} 56 L${15 + i * 10} 87" stroke="#e2e8f0"/>`).join('')}
        <rect x="12" y="53" width="136" height="3" fill="#94a3b8"/><rect x="80" y="20" width="3" height="33" fill="#cbd5e1"/>`) },
    ],
    eisberg: [
      { id: 'eisberg', de: 'Eisberg', svg: SV(`${sky('e1', '#1e3a8a', '#7dd3fc')}${[[12, 8], [40, 14], [70, 6], [120, 10], [150, 18], [96, 20]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8" fill="#fff"/>`).join('')}
        <path d="M8 22 Q40 18 70 28 Q100 20 152 26" stroke="#86efac" stroke-width="3" fill="none" opacity=".5"/>
        <path d="M18 66 L36 30 L54 38 L72 14 L92 34 L110 24 L140 66 Z" fill="#f0f9ff"/><path d="M72 14 L92 34 L110 24 L140 66 L104 66Z" fill="#bae6fd"/>
        <path d="M40 66 Q40 52 52 52 Q64 52 64 66Z M78 66 Q78 46 94 46 Q110 46 110 66Z" fill="#7dd3fc" opacity=".8"/>
        <rect y="64" width="160" height="36" fill="#0e7490" opacity=".9"/><path d="M28 66 L132 66 L116 92 L46 92Z" fill="#e0f2fe" opacity=".35"/>`) },
      { id: 'eispalast', de: 'Eispalast', svg: SV(`${sky('e2', '#0f172a', '#3b82f6')}
        <path d="M0 26 Q40 10 80 24 Q120 36 160 18" stroke="#a78bfa" stroke-width="5" fill="none" opacity=".45"/><path d="M0 18 Q50 30 90 16 Q130 6 160 12" stroke="#34d399" stroke-width="4" fill="none" opacity=".5"/>
        <rect y="84" width="160" height="16" fill="#f8fafc"/>
        <g fill="#dbeafe" stroke="#93c5fd" stroke-width="1"><rect x="30" y="38" width="100" height="47"/><rect x="18" y="26" width="18" height="59"/><rect x="124" y="26" width="18" height="59"/><rect x="66" y="18" width="28" height="22"/></g>
        <g fill="#bfdbfe"><path d="M15 27 L27 6 L39 27Z"/><path d="M121 27 L133 6 L145 27Z"/><path d="M63 19 L80 0 L97 19Z"/></g>
        <path d="M42 85 L42 58 Q54 46 66 58 L66 85Z M94 85 L94 58 Q106 46 118 58 L118 85Z" fill="#eff6ff"/><path d="M70 85 L70 52 Q80 40 90 52 L90 85Z" fill="#e0e7ff"/>
        <rect x="30" y="56" width="100" height="2" fill="#93c5fd"/>`) },
      { id: 'eishoehle', de: 'Eishöhle unter Wasser', svg: SV(`${sky('e3', '#0ea5e9', '#0c4a6e')}
        <path d="M0 0 L160 0 L160 16 Q140 22 120 14 Q100 24 80 14 Q60 22 40 14 Q20 22 0 14Z" fill="#e0f2fe"/>
        ${[10, 30, 52, 74, 96, 118, 140].map(x => `<path d="M${x} 14 L${x + 3} 26 L${x + 6} 14Z" fill="#e0f2fe"/>`).join('')}
        <path d="M0 100 L0 84 Q30 76 60 84 Q90 76 120 84 Q140 78 160 84 L160 100Z" fill="#bae6fd"/>
        <path d="M14 84 Q14 40 46 40 Q78 40 78 84Z M90 84 Q90 46 120 46 Q150 46 150 84Z" fill="#7dd3fc" opacity=".55"/>
        <g fill="#16a34a" opacity=".8"><path d="M8 84 Q4 70 10 60 Q6 72 12 84Z"/><path d="M84 82 Q80 66 88 56 Q84 70 90 82Z"/></g>
        <g fill="#fff" opacity=".6">${[[30, 60], [34, 52], [110, 64], [113, 56], [70, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g>
        <path d="M40 0 L60 80 L70 80 L54 0Z" fill="#fff" opacity=".08"/>`) },
    ],
  };
  const IGLU = `<svg viewBox="0 0 100 60"><path d="M6 58 Q6 6 50 6 Q94 6 94 58Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
    <g stroke="#cbd5e1" stroke-width="1.6" fill="none"><path d="M10 44 L90 44 M14 30 L86 30 M26 18 L74 18 M30 44 L30 58 M60 44 L60 58 M44 30 L44 44 M72 30 L72 44 M50 18 L50 30"/></g>
    <path d="M38 58 Q38 40 50 40 Q62 40 62 58Z" fill="#334155"/></svg>`;
  const CATALOG = {
    haus: { '🛋️ Möbel': ['SCHRANK', ...'🛏️ 🛋️ 🪑 🚪 🪟 🖼️ 🪴 🛁 🚿 🚽 📺 💡 🕯️ 🪞 🧺 📚 🎹 🕰️'.split(' ')], '🧸 Spielzeug': '🧸 🎮 🎨 ⚽ 🎈 🎁 🪀 🪁 🎸 🥁 🛝 🌈'.split(' '), '🍕 Essen': '🍳 🧁 🎂 🍕 🍎 🍌 🍓 🍦 🥨 🥛 🍫'.split(' ') },
    tierheim: { '🦴 Für Tiere': '🦴 🥣 🍖 🥕 🐟 🧶 🎾 🪀 🧸 🛏️ 🧺 🏠 🪵 🚿 🧼 🩹 💉 🎀 💧'.split(' '), '🌳 Draußen': '🌳 🌼 🌻 🪴 ⛲ 🪨 🌈 ☀️'.split(' ') },
    eisberg: { '❄️ Eis & Schnee': ['IGLU', ...'🧊 ❄️ ⛄ 🏔️ 🛷 ⛸️ 🎿 🧣 🧤 🔦 🕯️ 🛋️ 🛏️ 🍵 🐟 🎣 ⛺ 🌌 ⭐ 🌙 🎄 🐚 🪸'.split(' ')] },
  };
  const SCENE_ANIMALS = {
    haus: ['hund', 'katze', 'hamster', 'hase', 'papagei', 'fisch', 'schildkroete', 'pudel'],
    tierheim: ['hund', 'katze', 'hase', 'hamster', 'pudel', 'kueken', 'schwein', 'ziege', 'esel', 'pferd', 'igel', 'ente', 'schildkroete', 'papagei', 'maus', 'lama'],
    eisberg: ['pinguin', 'eisbaer', 'robbe', 'wal', 'fisch', 'otter', 'krake', 'delfin', 'mammut', 'einhorn'],
  };
  const SCENE_DEF = {
    haus: { start: [{ t: 'e', v: '🛏️', x: 30, y: 47 }, { t: 'e', v: '🛋️', x: 35, y: 78 }, { t: 'e', v: '📺', x: 60, y: 76 }, { t: 'e', v: '💡', x: 70, y: 40 }, { t: 'e', v: '🍕', x: 80, y: 80 }] },
    tierheim: { start: [{ t: 'img', v: 'hund', x: 23, y: 66 }, { t: 'img', v: 'katze', x: 51, y: 66 }, { t: 'e', v: '🥣', x: 70, y: 70 }, { t: 'e', v: '🎾', x: 80, y: 82 }] },
    eisberg: { start: [{ t: 'iglu', x: 58, y: 56, s: 1.4 }, { t: 'img', v: 'pinguin', x: 32, y: 58 }, { t: 'e', v: '⛄', x: 76, y: 56 }, { t: 'e', v: '❄️', x: 20, y: 20 }] },
  };

  /* ----- Spiel-Modus: was passiert beim Antippen? ----- */
  const FOOD = '🍕🍎🍌🍓🍦🥨🥛🍫🧁🎂🍳🍖🥕🐟🦴🍵';
  const SAYINGS = ['Hallo!', 'Juhu!', 'Mir ist langweilig.', 'Lass uns spielen!', 'Ich hab Hunger!', 'Toll hier!', 'Komm mit!', 'Hihi!', 'Wie schön!', 'Ich bin müde.'];
  const PET_SOUND = { hund: 'Wau wau!', pudel: 'Wau!', katze: 'Miau!', hase: 'Schnupper!', hamster: 'Fiep fiep!', maus: 'Piep!', schwein: 'Oink!', kueken: 'Piep piep!', ente: 'Quak!', pferd: 'Hüüü!', esel: 'I-ah!', ziege: 'Mäh!', papagei: 'Hallo! Hallo!', pinguin: 'Quiek!', eisbaer: 'Brumm!', robbe: 'Ö-ö-ö!', wal: 'Huuuu!', delfin: 'Ki-ki-ki!', einhorn: 'Glitzer!', drache: 'Fauch!', eule: 'Uhu!', lama: 'Mmmh!', fuchs: 'Hatschi!', panda: 'Mampf!' };
  function bubble(layer, it, text) {
    const b = h('div', { class: 'wbub' }, text);
    b.style.left = it.x + '%'; b.style.top = `calc(${it.y}% - 8%)`;
    put(layer, b); setTimeout(() => b.remove(), 1900);
  }
  function anim(el, cls, ms = 900) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); }
  // Hunde und Katzen (Fotos-Bilder + Emoji-Varianten) fürs Haus
  const DOGCAT_IMG = ['hund', 'pudel', 'katze'];
  const DOGCAT_EMO = { '🐕': 'hund', '🦮': 'hund', '🐕‍🦺': 'hund', '🐩': 'pudel', '🐶': 'hund', '🐈': 'katze', '🐈‍⬛': 'katze', '🐱': 'katze' };
  function playTap(it, el, ctx) {
    const v = it.v;
    if (it.t === 'e' && DOGCAT_EMO[v]) it = { ...it, t: 'img', v: DOGCAT_EMO[v] };
    if (it.t === 'char') { anim(el, 'whop', 700); const nm = (ctx.liveChar ? ctx.liveChar(it) : it.c).name; const s = nm && Math.random() < 0.35 ? 'Ich heiße ' + nm + '!' : pick(SAYINGS); bubble(ctx.layer, it, s); sayKid(s); return; }
    if (it.t === 'pet' || it.t === 'img') {
      const a = it.t === 'pet' ? it.p.a : it.v; anim(el, 'whop', 700);
      const snd = PET_SOUND[a] || 'Hallo!'; bubble(ctx.layer, it, snd);
      if (window.loadAnimalSounds) loadAnimalSounds();
      if (!(window.playAnimalSound && playAnimalSound(a))) sayKid(snd);
      return;
    }
    if (it.t === 'iglu') { anim(el, 'wwig'); bubble(ctx.layer, it, 'Schön warm hier drin!'); tone(500, 0.3, 'sine', 0.2); return; }
    if (it.t === 'schrank') { ctx.wardrobe(it); return; }
    if (FOOD.includes(v)) { el.classList.add('weaten'); bubble(ctx.layer, it, 'Mampf! Lecker!'); [0, 1, 2].forEach(i => tone(300 + i * 60, 0.08, 'square', 0.08, i * 0.12)); setTimeout(() => el.classList.remove('weaten'), 4000); return; }
    if ('💡🕯️🔦'.includes(v)) { it.on = !it.on; el.classList.toggle('won', it.on); tone(it.on ? 1200 : 600, 0.06, 'square', 0.1); ctx.save(); return; }
    if (v === '📺') { it.on = !it.on; el.classList.toggle('wtv', it.on); if (it.on) ['C5', 'E5', 'G5'].forEach((n, i) => pianoNote(freq(n), i * 0.15, null, 0.25)); ctx.save(); return; }
    if ('🎹🎸🥁'.includes(v)) { anim(el, 'wwig'); ['C4', 'E4', 'G4', 'C5', 'G4', 'E4'].forEach((n, i) => (v === '🥁' ? tone(90, 0.12, 'sine', 0.4, i * 0.18) : pianoNote(freq(n), i * 0.16, null, 0.35))); return; }
    if ('⚽🎾🪀'.includes(v)) { anim(el, 'wbounce', 1000); tone(220, 0.1, 'sine', 0.3); tone(260, 0.1, 'sine', 0.25, 0.4); return; }
    if ('🎈🪁'.includes(v)) { anim(el, 'wfloat', 2000); return; }
    if (v === '🎁') { anim(el, 'wwig'); bubble(ctx.layer, it, pick(['🧸', '⭐', '🍭', '🦄', '🚗', '💎', '🎉'])); [0, 1, 2, 3].forEach(i => tone(600 + i * 150, 0.1, 'triangle', 0.15, i * 0.08)); return; }
    if (v === '🚪') { anim(el, 'wwig'); bubble(ctx.layer, it, 'Klopf, klopf!'); tone(180, 0.08, 'square', 0.3); tone(180, 0.08, 'square', 0.3, 0.22); return; }
    if ('🛁🚿🧼'.includes(v)) { anim(el, 'wwig'); bubble(ctx.layer, it, '🫧🫧🫧'); [0, 1, 2, 3, 4].forEach(i => tone(800 + Math.random() * 600, 0.05, 'sine', 0.1, i * 0.1)); return; }
    if (v === '🚽') { anim(el, 'wwig'); bubble(ctx.layer, it, 'Wuuusch!'); return; }
    if ('❄️🌨️'.includes(v)) { ctx.snow(); return; }
    if ('🌙⭐🌌'.includes(v)) { ctx.night(); return; }
    if (v === '🛷') { anim(el, 'wslide', 1600); return; }
    if ('🪴🌳🌼🌻'.includes(v)) { it.s = Math.min(2.4, (it.s || 1) * 1.15); ctx.save(); ctx.draw(); bubble(ctx.layer, it, 'Ich wachse!'); return; }
    if (v === '🛏️') { bubble(ctx.layer, it, 'Zieh jemanden aufs Bett!'); return; }
    if (v === '🕰️') { bubble(ctx.layer, it, 'Tick tack!'); tone(1000, 0.04, 'square', 0.1); tone(800, 0.04, 'square', 0.1, 0.5); return; }
    anim(el, 'wwig'); tone(500 + Math.random() * 400, 0.1, 'triangle', 0.12);
  }

  function sceneEditor(pane, sid) {
    const key = 'welt_scene_' + sid, skey = 'welt_style_' + sid;
    let items = store.get(key, null) || SCENE_DEF[sid].start.map(i => ({ s: 1, f: 1, ...i, id: id() }));
    let sel = null, mode = 'bauen', isNight = false;
    const styleOf = () => STYLES[sid].find(s => s.id === store.get(skey, STYLES[sid][0].id)) || STYLES[sid][0];
    const save = () => store.set(key, items);
    const wrap = h('div', { class: 'wscene' });
    const modeBar = h('div', { class: 'wmode' });
    const styleBar = h('div', { class: 'wstyles' });
    const stage = h('div', { class: 'wstage' });
    const bgEl = h('div', { class: 'wbg', html: styleOf().svg });
    const layer = h('div', { class: 'wlayer' });
    const nightEl = h('div', { class: 'wnight' });
    const snowEl = h('div', { class: 'wsnow' });
    put(stage, bgEl, layer, nightEl, snowEl);
    const tools = h('div', { class: 'wtools' });
    const pal = h('div', { class: 'wpal' });
    const catBar = h('div', { class: 'wcats' });
    const clearRow = h('div', { class: 'btnrow wbuild' }, h('button', { class: 'btn alt', onclick: () => { if (confirm('Alles wegräumen und neu anfangen?')) { items = []; sel = null; save(); draw(); drawTools(); } } }, '🧹 Alles wegräumen'));
    put(wrap, modeBar, styleBar, stage, tools, catBar, pal, clearRow);
    put(pane, wrap);

    function itemHTML(it) {
      if (it.t === 'e') return `<span class="we">${it.v}</span>`;
      if (it.t === 'img') return `<img src="img/tiere/${it.v}.png" alt="" draggable="false">`;
      if (it.t === 'iglu') return IGLU;
      if (it.t === 'schrank') return SCHRANK_SVG;
      if (it.t === 'char') { const c = liveChar(it); return charSVG(c) + (c.name ? `<span class="wcn">${c.name}</span>` : ''); }
      if (it.t === 'pet') return `<span class="wpet"><img src="img/tiere/${it.p.a}.png" alt="" draggable="false">${it.p.acc ? `<i>${it.p.acc}</i>` : ''}<b>${it.p.name}</b></span>`;
      return '';
    }
    function size(it) {
      const w = stage.clientWidth;
      const k = w < 500 ? 1.35 : 1; // auf dem Handy etwas größer
      return k * ({ e: w * 0.075, img: w * 0.1, iglu: w * 0.22, char: w * 0.11, pet: w * 0.1, schrank: w * 0.08 }[it.t] || w * 0.08);
    }
    // Figuren immer so zeigen, wie sie bei 👫 Leute zuletzt angezogen wurden
    let live = S.chars();
    const liveChar = it => live.find(c => c.id === it.c.id) || it.c;
    const isBed = i => i.t === 'e' && '🛏️🛋️'.includes(i.v);
    function draw() {
      layer.innerHTML = ''; live = S.chars();
      items.forEach(it => {
        const el = h('div', { class: 'witem wt-' + it.t + (sel === it.id && mode === 'bauen' ? ' sel' : '') + (it.on && '💡🕯️🔦'.includes(it.v) ? ' won' : '') + (it.on && it.v === '📺' ? ' wtv' : '') + (it.lie ? ' wlie' : ''), html: itemHTML(it) });
        const sz = size(it);
        el.style.left = it.x + '%'; el.style.top = it.y + '%';
        el.style.width = sz + 'px';
        el.style.height = (it.t === 'char' ? sz * 1.5 : it.t === 'iglu' ? sz * 0.6 : it.t === 'schrank' ? sz * 1.25 : sz) + 'px';
        el.style.fontSize = sz * 0.85 + 'px';
        el.style.setProperty('--tf', `translate(-50%, -50%) scale(${it.s || 1}) scaleX(${it.f || 1})`);
        el.addEventListener('pointerdown', e => {
          e.preventDefault(); e.stopPropagation();
          el.setPointerCapture(e.pointerId);
          if (mode === 'bauen') { sel = it.id; layer.querySelectorAll('.witem').forEach(x => x.classList.remove('sel')); el.classList.add('sel'); drawTools(); }
          const r = stage.getBoundingClientRect(); const ox = e.clientX, oy = e.clientY, sx = it.x, sy = it.y;
          let moved = false;
          const mv = ev => {
            if (Math.hypot(ev.clientX - ox, ev.clientY - oy) > 6) { moved = true; if (mode === 'spielen') el.classList.add('wwalk'); }
            it.x = Math.max(0, Math.min(100, sx + (ev.clientX - ox) / r.width * 100));
            it.y = Math.max(0, Math.min(100, sy + (ev.clientY - oy) / r.height * 100));
            el.style.left = it.x + '%'; el.style.top = it.y + '%';
          };
          const up = () => {
            el.removeEventListener('pointermove', mv); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
            el.classList.remove('wwalk');
            if (mode === 'spielen') {
              if (!moved) playTap(it, el, ctx);
              else if (it.t === 'char' || it.t === 'pet' || it.t === 'img') {
                // Aufs Bett/Sofa gezogen? Dann hinlegen und schlafen
                const bed = items.find(b => isBed(b) && Math.abs(b.x - it.x) < 7 && Math.abs(b.y - it.y) < 10);
                const was = it.lie; it.lie = !!bed;
                el.classList.toggle('wlie', it.lie);
                if (it.lie && !was) { bubble(layer, it, 'Zzz …'); tone(300, 0.5, 'sine', 0.15); tone(250, 0.6, 'sine', 0.12, 0.5); }
              }
            }
            save();
          };
          el.addEventListener('pointermove', mv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
        });
        put(layer, el);
      });
    }
    stage.addEventListener('pointerdown', () => { if (mode === 'bauen') { sel = null; draw(); drawTools(); } });
    function drawTools() {
      tools.innerHTML = '';
      if (mode !== 'bauen') return;
      const it = items.find(i => i.id === sel);
      if (!it) { put(tools, h('span', { class: 'whint' }, '👆 Tippe unten etwas an – dann kannst du es herumschieben. Fertig? Dann drück auf ▶️ Spielen!')); return; }
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
    const cats = sid === 'haus'
      ? { '👫 Meine Leute': 'chars', '🐶 Hunde & Katzen': 'dogcats', '🐾 Meine Tiere': 'pets', ...CATALOG[sid], '🐹 Andere Tiere': 'animals' }
      : { '👫 Meine Leute': 'chars', '🐾 Meine Tiere': 'pets', ...CATALOG[sid], '🐾 Tiere': 'animals' };
    const charBtn = c => h('button', { class: 'wp wpc', 'aria-label': c.name, onclick: () => { add({ t: 'char', c: JSON.parse(JSON.stringify(c)) }); sayKid((c.name || 'Ich') + ' ist im Haus!'); }, html: charSVG(c) + `<b>${c.name || ''}</b>` });
    function allIn() {
      const cs = S.chars(); let n = 0;
      cs.forEach((c, i) => { if (!items.some(it => it.t === 'char' && it.c.id === c.id)) { items.push({ t: 'char', c: JSON.parse(JSON.stringify(c)), s: 1, f: 1, ...spot(items.filter(it => it.t === 'char').length), id: id() }); n++; } });
      save(); draw(); drawTools();
      if (n) { cheer(); sayKid(n === 1 ? 'Ein Kind ist eingezogen!' : n + ' Kinder sind eingezogen!'); } else sayKid('Alle deine Leute sind schon da!');
    }
    function showCat(name) {
      [...catBar.children].forEach(b => b.classList.toggle('on', b.textContent === name));
      pal.innerHTML = '';
      const v = cats[name];
      if (Array.isArray(v)) v.forEach(e => put(pal, h('button', { class: 'wp', onclick: () => add(e === 'IGLU' ? { t: 'iglu', s: 1.2 } : e === 'SCHRANK' ? { t: 'schrank', s: 1.3 } : { t: 'e', v: e }), html: e === 'IGLU' ? IGLU : e === 'SCHRANK' ? SCHRANK_SVG : e })));
      else if (v === 'animals') SCENE_ANIMALS[sid].forEach(a => put(pal, h('button', { class: 'wp', onclick: () => add({ t: 'img', v: a }), html: `<img src="img/tiere/${a}.png" alt="">` })));
      else if (v === 'chars') {
        const cs = S.chars();
        if (!cs.length) put(pal, h('span', { class: 'whint' }, 'Gestalte zuerst Leute bei 👫!'));
        else put(pal, h('button', { class: 'btn wallin', onclick: allIn }, '👫 Alle ins Haus'));
        cs.forEach(c => put(pal, charBtn(c)));
      }
      else if (v === 'dogcats') {
        DOGCAT_IMG.forEach(a => put(pal, h('button', { class: 'wp', 'aria-label': a, onclick: () => add({ t: 'img', v: a }), html: `<img src="img/tiere/${a}.png" alt="">` })));
        Object.keys(DOGCAT_EMO).forEach(e => put(pal, h('button', { class: 'wp', onclick: () => add({ t: 'e', v: e }) }, e)));
        S.pets().filter(p => DOGCAT_IMG.includes(p.a)).forEach(p => put(pal, h('button', { class: 'wp wpn', 'aria-label': p.name, onclick: () => add({ t: 'pet', p }), html: `<img src="img/tiere/${p.a}.png" alt=""><b>${p.name}</b>` })));
      }
      else if (v === 'pets') { const ps = S.pets(); if (!ps.length) put(pal, h('span', { class: 'whint' }, 'Such dir zuerst Tiere bei 🐾 aus!')); ps.forEach(p => put(pal, h('button', { class: 'wp wpn', 'aria-label': p.name, onclick: () => add({ t: 'pet', p }), html: `<img src="img/tiere/${p.a}.png" alt=""><b>${p.name}</b>` }))); }
    }
    Object.keys(cats).forEach(n => put(catBar, h('button', { class: 'wcat', onclick: () => showCat(n) }, n)));
    // Hausart auswählen
    function drawStyles() {
      styleBar.innerHTML = '';
      put(styleBar, h('small', {}, 'Welches Haus?'));
      STYLES[sid].forEach(st => put(styleBar, h('button', {
        class: 'wstyle' + (st.id === styleOf().id ? ' on' : ''), 'aria-label': st.de,
        onclick: () => { store.set(skey, st.id); bgEl.innerHTML = st.svg; drawStyles(); sayKid(st.de); tone(660, 0.12, 'triangle', 0.15); },
      }, h('span', { class: 'wsth', html: st.svg }), st.de)));
    }
    // Bauen ↔ Spielen
    function setMode(m) {
      mode = m; sel = null;
      wrap.classList.toggle('playing', m === 'spielen');
      modeBar.innerHTML = '';
      if (m === 'bauen') {
        put(modeBar, h('button', { class: 'wplay', onclick: () => { setMode('spielen'); sayKid('Los geht\'s! Tippe auf alles und probier es aus!'); [0, 1, 2, 3].forEach(i => pianoNote(freq(['C5', 'E5', 'G5', 'C6'][i]), i * 0.1, null, 0.3)); } }, '▶️ Spielen'));
      } else {
        put(modeBar,
          h('button', { class: 'wbuildbtn', onclick: () => { setMode('bauen'); if (isNight) toggleNight(); sayKid('Bauen'); } }, '🔨 Bauen'),
          h('button', { class: 'wnightbtn', onclick: toggleNight }, isNight ? '☀️ Tag' : '🌙 Nacht'),
          h('span', { class: 'whint' }, '👆 Tippe auf Leute, Tiere und Sachen! Zieh Leute aufs Bett zum Schlafen.'));
      }
      draw(); drawTools();
      if (m === 'spielen') setTimeout(() => wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
    function toggleNight() {
      isNight = !isNight; stage.classList.toggle('isnight', isNight);
      const b = modeBar.querySelector('.wnightbtn'); if (b) b.textContent = isNight ? '☀️ Tag' : '🌙 Nacht';
      if (isNight) { tone(400, 0.4, 'sine', 0.15); tone(300, 0.5, 'sine', 0.12, 0.3); }
    }
    function letItSnow() {
      snowEl.innerHTML = Array.from({ length: 40 }, () => `<i style="left:${Math.random() * 100}%;animation-delay:${(Math.random() * 2).toFixed(2)}s;animation-duration:${(2 + Math.random() * 2).toFixed(2)}s">❄</i>`).join('');
      clearTimeout(letItSnow.t); letItSnow.t = setTimeout(() => { snowEl.innerHTML = ''; }, 5000);
    }
    // Schrank im Spiel: das Kind, das am nächsten steht, zieht sich um
    function wardrobeFor(sch) {
      const kids = items.filter(i => i.t === 'char');
      if (!kids.length) { bubble(layer, sch, 'Setz zuerst ein Kind ins Haus!'); return; }
      const kid = kids.reduce((a, b) => (Math.hypot(b.x - sch.x, b.y - sch.y) < Math.hypot(a.x - sch.x, a.y - sch.y) ? b : a));
      openWardrobe(liveChar(kid), nc => { kid.c = nc; storeChar(nc); save(); draw(); });
    }
    const ctx = { layer, save, draw, snow: letItSnow, night: toggleNight, wardrobe: wardrobeFor, liveChar };
    const ro = new ResizeObserver(draw); ro.observe(stage);
    drawStyles(); showCat(Object.keys(cats)[0]); setMode('bauen');
    return () => ro.disconnect();
  }

  // Name fehlt: Feld wackelt, wird rot umrandet und vorgelesen
  function needName(input, text) {
    input.classList.remove('wneed'); void input.offsetWidth; input.classList.add('wneed');
    input.focus(); softFail(); sayKid(text);
  }
  /* ---------------- Kleiderschrank (zum Anziehen) ---------------- */
  const SCHRANK_SVG = `<svg viewBox="0 0 80 100"><rect x="4" y="4" width="72" height="90" rx="4" fill="#b07a45" stroke="#5c3a1e" stroke-width="3"/>
    <rect x="9" y="9" width="30" height="70" rx="2" fill="#c98f55" stroke="#5c3a1e" stroke-width="2"/><rect x="41" y="9" width="30" height="70" rx="2" fill="#c98f55" stroke="#5c3a1e" stroke-width="2"/>
    <circle cx="35" cy="44" r="2.5" fill="#ffd60a"/><circle cx="45" cy="44" r="2.5" fill="#ffd60a"/><rect x="9" y="82" width="62" height="9" rx="2" fill="#a66b38" stroke="#5c3a1e" stroke-width="2"/>
    <rect x="34" y="85" width="12" height="3" rx="1.5" fill="#ffd60a"/></svg>`;
  const BASIC_TOPS = [defTop(), { shape: 'pulli', color: '#e63946', pattern: '', pc: '#fff', sticker: '' }, { shape: 'kleid', color: '#ffd60a', pattern: 'punkte', pc: '#ffffff', sticker: '' },
    { shape: 'shirt', color: '#ffffff', pattern: 'streifen', pc: '#1d4ed8', sticker: '⚓' }, { shape: 'top', color: '#ff70a6', pattern: '', pc: '#fff', sticker: '🌸' }, { shape: 'pulli', color: '#2a9d4a', pattern: 'karo', pc: '#14532d', sticker: '' }];
  // Öffnet den Schrank als großes Fenster. onChange(char) wird bei jeder Änderung aufgerufen.
  function openWardrobe(char, onChange) {
    const c = JSON.parse(JSON.stringify(char));
    const ov = h('div', { class: 'wardov' });
    const prev = h('div', { class: 'wardprev' });
    const inner = h('div', { class: 'wardin' });
    const doors = h('div', { class: 'warddoors' }, h('div', { class: 'wdoor l' }, h('i')), h('div', { class: 'wdoor r' }, h('i')));
    const box = h('div', { class: 'wardbox' },
      h('div', { class: 'wardtop' }, h('b', {}, `🚪 ${c.name ? c.name + 's ' : ''}Kleiderschrank`), h('button', { class: 'btn', onclick: close }, '✅ Fertig')),
      h('div', { class: 'wardbody' }, prev, h('div', { class: 'wardcab' }, inner, doors)));
    put(ov, box); document.body.appendChild(ov);
    const ch = () => { prev.innerHTML = charSVG(c) + (c.name ? `<b>${c.name}</b>` : ''); onChange(JSON.parse(JSON.stringify(c))); };
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    function draw() {
      inner.innerHTML = '';
      // Kleiderstange mit Bügeln
      const rail = h('div', { class: 'wrail' });
      [...BASIC_TOPS, ...S.clothes()].forEach(t => put(rail, h('button', { class: 'whang' + (same(c.top, t) ? ' on' : ''), 'aria-label': 'Anziehen', onclick: () => { c.top = { ...t }; tone(880, 0.08, 'triangle', 0.15); ch(); draw(); }, html: `<span class="hook"></span>${clothesSVG(t)}` })));
      // Regal: Hosen & Röcke
      const shelf = (title, kids) => h('div', { class: 'wshelf' }, h('small', {}, title), h('div', { class: 'wshelfin' }, kids));
      const bottomBtn = (b, col) => h('button', { class: 'wfold' + (c.bottom === b[0] && c.bc === col ? ' on' : ''), 'aria-label': b[1], onclick: () => { c.bottom = b[0]; c.bc = col; tone(700, 0.07, 'triangle', 0.15); ch(); draw(); },
        html: `<svg viewBox="0 0 40 30">${b[0] === 'rock' ? `<path d="M10 4 L30 4 L36 26 L4 26Z" fill="${col}" stroke="${OL}" stroke-width="2"/>` : b[0] === 'shorts' ? `<path d="M8 4 L32 4 L34 20 L22 20 L20 12 L18 20 L6 20Z" fill="${col}" stroke="${OL}" stroke-width="2"/>` : `<path d="M10 2 L30 2 L32 28 L23 28 L20 10 L17 28 L8 28Z" fill="${col}" stroke="${OL}" stroke-width="2"/>`}</svg>` });
      const bcols = ['#1d4ed8', '#222222', '#8d6e63', '#e63946', '#ff70a6', '#2a9d4a', '#ffffff', '#9b5de5'];
      const shoeBtn = col => h('button', { class: 'wfold' + (c.shoes === col ? ' on' : ''), 'aria-label': 'Schuhe', onclick: () => { c.shoes = col; tone(600, 0.07, 'triangle', 0.15); ch(); draw(); },
        html: `<svg viewBox="0 0 40 24"><path d="M4 20 Q4 8 14 8 Q22 8 24 14 L36 16 Q38 20 36 21Z" fill="${col}" stroke="${OL}" stroke-width="2"/></svg>` });
      put(inner, h('small', { class: 'wlabel' }, '👕 Oberteile & Kleider – tippe zum Anziehen'), rail,
        shelf('👖 Hosen, Shorts & Röcke', BOTTOM.flatMap(b => bcols.slice(0, b[0] === 'rock' ? 8 : 6).map(col => bottomBtn(b, col)))),
        shelf('👟 Schuhe', COLORS.map(shoeBtn)),
        shelf('🎀 Schublade mit Extras', ACC.map(a => h('button', { class: 'wfold emo' + (c.acc === a[0] ? ' on' : ''), onclick: () => { c.acc = a[0]; tone(1000, 0.07, 'sine', 0.15); ch(); draw(); } }, a[1]))));
    }
    function close() { ov.classList.add('closing'); setTimeout(() => ov.remove(), 300); }
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    draw(); ch();
    tone(220, 0.25, 'sawtooth', 0.05); setTimeout(() => doors.classList.add('open'), 60);
    sayKid('Der Kleiderschrank! Such dir etwas zum Anziehen aus.');
  }

  /* ---------------- Leute gestalten ---------------- */
  function peopleEditor(pane) {
    let chars = S.chars();
    let cur = JSON.parse(JSON.stringify(chars[0] || { ...PRESETS[0], id: id() }));
    const gallery = h('div', { class: 'wgal' });
    const prev = h('div', { class: 'wprev' });
    const opts = h('div', { class: 'wopts' });
    const name = h('input', { class: 'wname', maxlength: '14', placeholder: '✏️ Name eintragen' });
    put(pane, h('h3', { class: 'wh' }, 'Meine Leute – tippe jemanden an'), gallery,
      h('div', { class: 'wedit' }, h('div', { class: 'wleft' }, prev, name,
        h('div', { class: 'btnrow' },
          h('button', { class: 'btn alt', onclick: zufall }, '🎲 Zufall'),
          h('button', { class: 'btn', onclick: speichern }, '💾 Speichern'),
          h('button', { class: 'btn alt', onclick: neu }, '➕ Neu')),
        h('button', { class: 'btn winhaus', onclick: insHaus }, '🏡 Ins Haus setzen')), opts));
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
        row('Augenfarbe', EYEC.map((c, i) => i), i => (cur.ec ?? 0) === i, i => { cur.ec = i; }, i => EYEC[i]),
        row('Mund', MOUTH, x => cur.mouth === x[0], x => { cur.mouth = x[0]; }));
      put(opts, h('div', { class: 'wrow center' }, h('small', {}, 'Anziehen'),
        h('button', { class: 'wschrankbtn', onclick: () => openWardrobe(cur, nc => { cur = { ...nc, name: (name.value || '').trim() || nc.name }; prev.innerHTML = charSVG(cur); if (cur.name && storeChar(cur)) { chars = S.chars(); drawGallery(); } }), html: SCHRANK_SVG + '<b>Kleiderschrank öffnen</b>' })));
      drawGallery();
    }
    function zufall() {
      cur = { ...cur, skin: Math.floor(Math.random() * SKIN.length), hair: pick(HAIR)[0], hc: Math.floor(Math.random() * HAIRC.length), eyes: pick(EYES)[0], ec: Math.floor(Math.random() * EYEC.length), mouth: pick(MOUTH)[0],
        top: { shape: pick(SHAPES)[0], color: pick(COLORS), pattern: pick(PATTERNS)[0], pc: pick(COLORS), sticker: pick(STICKERS) }, bottom: pick(BOTTOM)[0], bc: pick(COLORS), shoes: pick(COLORS), acc: pick(ACC)[0] };
      draw(); tone(600, 0.1, 'triangle', 0.15); tone(900, 0.12, 'triangle', 0.15, 0.08);
    }
    function speichern() {
      cur.name = (name.value || '').trim();
      if (!cur.name) { needName(name, 'Wie heißt dein Kind? Schreib zuerst einen Namen hinein.'); return; }
      const i = chars.findIndex(c => c.id === cur.id);
      if (i >= 0) chars[i] = JSON.parse(JSON.stringify(cur)); else chars.push(JSON.parse(JSON.stringify(cur)));
      S.setChars(chars); draw(); cheer(); sayKid(cur.name + ' ist gespeichert!');
      return true;
    }
    function insHaus() {
      cur.name = (name.value || '').trim();
      if (!cur.name) { needName(name, 'Wie heißt dein Kind? Schreib zuerst einen Namen hinein.'); return; }
      const i = chars.findIndex(c => c.id === cur.id);
      if (i >= 0) chars[i] = JSON.parse(JSON.stringify(cur)); else chars.push(JSON.parse(JSON.stringify(cur)));
      S.setChars(chars);
      const neuIn = placeInHouse(cur); draw(); cheer();
      sayKid(neuIn ? cur.name + ' zieht ins Haus ein!' : cur.name + ' hat sich im Haus umgezogen!');
    }
    function neu() { cur = { ...PRESETS[Math.floor(Math.random() * PRESETS.length)], id: id(), name: '' }; zufall(); name.focus(); sayKid('Ein neues Kind! Wie soll es heißen?'); }
    name.addEventListener('input', () => { cur.name = name.value; });
    draw();
  }

  /* ---------------- Mode-Atelier ---------------- */
  function clothesSVG(t) {
    const c = { skin: 1, hair: 'glatze', hc: 0, eyes: '', mouth: '', top: t, bottom: 'hose', bc: '#e5e7eb', shoes: '#e5e7eb', acc: '' };
    // nur den Oberkörper zeigen (Ausschnitt statt ganzer Figur)
    return charSVG(c).replace('viewBox="0 0 200 300"', 'viewBox="40 98 120 136"');
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
    const name = h('input', { class: 'wname', maxlength: '14', placeholder: '✏️ Name eintragen' });
    const prev = h('div', { class: 'wpetprev' });
    const choose = h('div', { class: 'wsw wpets' });
    const accs = h('div', { class: 'wsw' });
    const list = h('div', { class: 'wgal' });
    put(pane, h('div', { class: 'wedit' }, h('div', { class: 'wleft' }, prev, name,
      h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: adopt }, '❤️ Aufnehmen'))),
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
      const n = (name.value || '').trim();
      if (!n) { needName(name, 'Wie soll dein Tier heißen? Schreib zuerst einen Namen hinein.'); return; }
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
