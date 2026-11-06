'use strict';
/* =====================================================================
   Gemeinsame Helfer für die Bereiche 7 und 17 Jahre
   ===================================================================== */
// wie el.append(…), überspringt aber null/false (sonst stünde "null" im Text)
function put(el, ...kids) { el.append(...kids.flat(Infinity).filter(k => k != null && k !== false)); return el; }
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v);
  }
  for (const c of kids.flat(Infinity)) {
    if (c == null || c === false) continue;
    put(el, c.nodeType ? c : document.createTextNode(String(c)));
  }
  return el;
}
const store = {
  get(k, d) { try { const v = localStorage.getItem('fe_' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('fe_' + k, JSON.stringify(v)); } catch { /* privat/blockiert */ } },
};
function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function today() { return new Date().toISOString().slice(0, 10); }
function sayKid(t) { say(t, { pitch: 1.15, rate: 0.95 }); }
function cheer() { ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => pianoNote(freq(n), i * 0.12, null, 0.35)); }
function softFail() { tone(260, 0.18, 'sine', 0.2); tone(200, 0.3, 'sine', 0.2, 0.15); }
function clickSound() { tone(700, 0.08, 'triangle', 0.15); }

// Timer, die beim Verlassen eines Spiels automatisch gestoppt werden
const timers = {
  ids: [],
  set(fn, ms) { const id = setTimeout(fn, ms); this.ids.push(id); return id; },
  every(fn, ms) { const id = setInterval(fn, ms); this.ids.push(id); return id; },
  clear() { this.ids.forEach(id => { clearTimeout(id); clearInterval(id); }); this.ids = []; },
};

let gameCleanup = null;
function closeGame() { if (gameCleanup) { const c = gameCleanup; gameCleanup = null; c(); } }
function openGame(screenId, game) {
  closeGame();
  const kid = screenId === 'game7';
  const root = document.getElementById(screenId);
  root.innerHTML = '';
  const head = h('header', { class: 'ghead', style: `--c:${game.color}` },
    h('span', { class: 'gicon' }, game.icon),
    h('div', { class: 'gtitle' }, h('small', {}, game.skill), h('h2', {}, game.title)),
    kid && game.intro ? h('button', { class: 'speak', 'aria-label': 'Vorlesen', onclick: () => sayKid(game.intro) }, '🔊') : null);
  const body = h('div', { class: 'gbody' });
  put(root, ...[head, kid && game.intro ? h('p', { class: 'intro' }, game.intro) : null, body].filter(Boolean));
  go(screenId);
  root.scrollTop = 0;
  const c = game.render(body);
  gameCleanup = () => { timers.clear(); if (typeof c === 'function') c(); };
  if (kid && game.intro) timers.set(() => sayKid(game.intro), 350);
}
screens.game7 = { leave: closeGame };
screens.game17 = { leave: closeGame };

function buildMenu(menuId, screenId, title, sub, games, foot) {
  const root = document.getElementById(menuId);
  put(root, ...[
    h('header', { class: 'mhead' }, h('h1', {}, title), h('p', {}, sub)),
    h('div', { class: 'mgrid' }, games.map(g => h('button', {
      class: 'mcard', style: `--c:${g.color}`,
      onclick: () => { audio(); clickSound(); openGame(screenId, g); },
    }, h('span', { class: 'micon' }, g.icon), h('b', {}, g.title), h('small', {}, g.skill)))),
    foot ? h('footer', { class: 'mfoot' }, foot) : null].filter(Boolean));
}

/* =====================================================================
   7 JAHRE – Entdecker-Akademie
   ===================================================================== */
const ANIMAL_IMGS = ['kuh', 'hund', 'katze', 'schwein', 'schaf', 'huhn', 'ente', 'pferd', 'frosch', 'loewe', 'biene', 'elefant'];

// Gehirn-Bild: Mit jedem Üben kommen Verbindungen dazu und werden dicker
function brainSVG(plays) {
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  const nodes = Array.from({ length: 18 }, () => {
    const a = rnd() * Math.PI * 2, r = 0.25 + Math.sqrt(rnd()) * 0.75;
    return [100 + Math.cos(a) * r * 82, 72 + Math.sin(a) * r * 52];
  });
  const edges = Math.min(70, 4 + plays * 4);
  let lines = '';
  for (let i = 0; i < edges; i++) {
    const a = nodes[Math.floor(rnd() * 18)], b = nodes[Math.floor(rnd() * 18)];
    lines += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/>`;
  }
  const w = Math.min(4.5, 1 + plays * 0.35).toFixed(1);
  return h('div', { class: 'brain', html: `<svg viewBox="0 0 200 145" role="img" aria-label="Gehirn mit Verbindungen">
    <path d="M100 12 C150 8 196 35 194 78 C192 118 150 140 100 136 C50 140 6 118 6 78 C4 35 50 8 100 12Z" fill="#ffd6e7" stroke="#ff8fb8" stroke-width="3"/>
    <path d="M100 14 L100 134" stroke="#ff8fb8" stroke-width="2" stroke-dasharray="5 5"/>
    <g stroke="#7b2cbf" stroke-width="${w}" stroke-linecap="round" opacity=".65">${lines}</g>
    <g fill="#ff006e">${nodes.map(n => `<circle cx="${n[0].toFixed(1)}" cy="${n[1].toFixed(1)}" r="4"/>`).join('')}</g></svg>` });
}

const GAMES7 = [
  /* ---------- 1. Neuroplastizität: Memory + wachsendes Gehirn ---------- */
  {
    id: 'memory', icon: '🧠', color: '#ff006e', skill: 'Gehirn trainieren', title: 'Gehirn-Trainer',
    intro: 'Finde immer zwei gleiche Tiere! Jedes Mal, wenn du übst, baut dein Gehirn neue Wege.',
    render(body) {
      // Anzahl Paare: Schieber von leicht (3 Paare) bis schwer (10 Paare)
      let n = store.get('mem7_pairs', 4);
      const mkSlider = () => window.diffSlider({ min: 3, max: 10, value: n, label: v => `${v} Paare · ${v * 2} Karten`, onChange: v => { n = v; store.set('mem7_pairs', v); start(); } });
      let slider = mkSlider();
      put(body, slider);
      const info = h('div', { class: 'row' });
      const grid = h('div', { class: 'memory' });
      const after = h('div');
      put(body, info, grid, after);
      function start() {
        after.innerHTML = '';
        const pics = shuffle(ANIMAL_IMGS).slice(0, n);
        let first = null, lock = false, moves = 0, found = 0;
        const movesEl = h('span', { class: 'pill' }, 'Züge: 0');
        info.innerHTML = '';
        put(info, h('span', { class: 'pill' }, `${n} Paare`), movesEl);
        grid.style.gridTemplateColumns = `repeat(${{ 3: 3, 4: 4, 5: 5, 6: 4, 7: 5, 8: 4, 9: 6, 10: 5 }[n]}, 1fr)`;
        grid.innerHTML = '';
        shuffle([...pics, ...pics]).forEach(p => {
          const c = h('button', { class: 'mem', 'aria-label': 'Karte' },
            h('span', { class: 'back' }, '❓'), h('img', { src: `img/tiere/${p}.png`, alt: '', draggable: 'false' }));
          c.addEventListener('click', () => {
            if (lock || c.classList.contains('open')) return;
            c.classList.add('open');
            tone(520 + Math.random() * 200, 0.1, 'triangle', 0.15);
            if (!first) { first = c; return; }
            moves++; movesEl.textContent = 'Züge: ' + moves;
            if (first.dataset.p === c.dataset.p) {
              first.classList.add('ok'); c.classList.add('ok'); first = null; found++;
              tone(880, 0.2, 'sine', 0.25);
              if (found === n) timers.set(win, 600);
            } else {
              lock = true;
              const f = first; first = null;
              timers.set(() => { f.classList.remove('open'); c.classList.remove('open'); lock = false; }, 950);
            }
          });
          c.dataset.p = p;
          put(grid, c);
        });
        function win() {
          const key = 'mem7_best_' + n, best = store.get(key, null);
          store.set(key, best == null ? moves : Math.min(best, moves));
          const plays = store.get('mem7_plays', 0) + 1;
          store.set('mem7_plays', plays);
          cheer();
          const msg = best == null ? `Geschafft in ${moves} Zügen!`
            : moves < best ? `Super! ${moves} Züge – besser als dein Rekord von ${best}!`
            : `Geschafft in ${moves} Zügen. Dein Rekord: ${best}.`;
          put(after, h('div', { class: 'card' },
            h('h3', {}, '🎉 ' + msg),
            brainSVG(plays),
            h('p', {}, `Du hast schon ${plays}-mal geübt. Jedes Mal werden die Wege in deinem Gehirn stärker – wie ein Trampelpfad im Gras, der immer breiter wird, je öfter man ihn geht.`),
            h('div', { class: 'btnrow' },
              n < 10 ? h('button', { class: 'btn', onclick: () => { n++; store.set('mem7_pairs', n); const s2 = mkSlider(); slider.replaceWith(s2); slider = s2; start(); } }, 'Schwerer ➜') : null,
              h('button', { class: 'btn alt', onclick: start }, 'Nochmal 🔁'))));
          sayKid(msg + ' Dein Gehirn ist wieder ein bisschen stärker geworden!');
          after.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      start();
    },
  },

  /* ---------- 2. Finanzen: Drei Spardosen ---------- */
  {
    id: 'geld', icon: '🐷', color: '#ff9f1c', skill: 'Mit Geld umgehen', title: 'Drei Spardosen',
    intro: 'Jede Woche bekommst du drei Münzen Taschengeld. Verteile sie auf drei Gläser: Sparen, Ausgeben und Teilen. Schaffst du es, dir deinen Wunsch zu erfüllen?',
    render(body) {
      const GOALS = [['🎈', 'Luftballon', 3], ['⚽', 'Ball', 8], ['🧸', 'Teddy', 12]];
      let goal, week, pile, jars, treats, gifts;
      const view = h('div');
      put(body, view);
      function reset() { week = 0; pile = 0; jars = { spar: 0, aus: 0, teil: 0 }; treats = 0; gifts = 0; chooseGoal(); }
      function chooseGoal() {
        view.innerHTML = '';
        put(view, h('p', { class: 'big' }, 'Was wünschst du dir?'),
          h('div', { class: 'choices' }, GOALS.map(g => h('button', {
            class: 'choice', onclick: () => { goal = g; sayKid(`Du sparst auf einen ${g[1]}. Der kostet ${g[2]} Münzen.`); nextWeek(); },
          }, h('span', { class: 'ce' }, g[0]), g[1], h('small', {}, `${g[2]} 🪙`)))));
      }
      function nextWeek() { week++; pile += 3; board(); }
      function board() {
        const [ge, gn, cost] = goal;
        view.innerHTML = '';
        const jar = (key, icon, name) => h('button', {
          class: 'jar', onclick: () => {
            if (!pile) return;
            pile--; jars[key]++;
            tone(1300, 0.06, 'square', 0.08); tone(1800, 0.1, 'sine', 0.1, 0.05);
            board();
          },
        }, h('span', { class: 'jicon' }, icon), h('b', {}, name), h('span', { class: 'coins' }, jars[key] ? '🪙'.repeat(jars[key]) : '–'));
        put(view, 
          h('p', { class: 'big' }, `Woche ${week}`),
          h('div', { class: 'pile' }, pile ? '🪙 '.repeat(pile) : '✔️ Alle Münzen verteilt'),
          pile ? h('p', { class: 'center' }, 'Tippe auf ein Glas, um eine Münze hineinzulegen.') : null,
          h('div', { class: 'jars' }, jar('spar', '🐷', 'Sparen'), jar('aus', '🍭', 'Ausgeben'), jar('teil', '💝', 'Teilen')),
          h('p', { class: 'center' }, `Dein Wunsch: ${ge} ${gn} – ${jars.spar} von ${cost} Münzen gespart`),
          h('div', { class: 'bar' }, h('i', { style: `width:${Math.min(100, jars.spar / cost * 100)}%` })));
        const acts = h('div', { class: 'btnrow' });
        if (jars.aus > 0) put(acts, h('button', { class: 'btn alt', onclick: () => { jars.aus--; treats++; sayKid('Mmh, lecker!'); board(); } }, '🍭 Süßigkeit kaufen (1 🪙)'));
        if (jars.teil >= 3) put(acts, h('button', { class: 'btn alt', onclick: () => { jars.teil -= 3; gifts++; cheer(); sayKid('Du hast jemandem eine Freude gemacht!'); board(); } }, '💝 Geschenk für jemanden (3 🪙)'));
        if (jars.spar >= cost) put(acts, h('button', { class: 'btn', onclick: win }, `🎉 ${gn} kaufen!`));
        else if (!pile) put(acts, h('button', { class: 'btn', onclick: nextWeek }, 'Nächste Woche ➜'));
        put(view, acts);
      }
      function win() {
        const [ge, gn] = goal;
        cheer();
        const t = `Juhu! Nach ${week} Wochen hast du deinen ${gn} gekauft!`;
        view.innerHTML = '';
        put(view, h('div', { class: 'celebrate' }, ge), h('p', { class: 'big' }, t),
          h('p', { class: 'center' }, `Unterwegs hast du dir ${treats} Süßigkeit${treats === 1 ? '' : 'en'} gegönnt und ${gifts} Geschenk${gifts === 1 ? '' : 'e'} gemacht.`),
          h('div', { class: 'tip' }, '💡 Sparen heißt: jetzt ein bisschen warten, später etwas Größeres bekommen. Ein guter Trick: einen Teil sparen, einen Teil ausgeben und einen Teil teilen.'),
          h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: reset }, 'Nochmal spielen 🔁')));
        sayKid(t + ' Sparen lohnt sich!');
      }
      reset();
    },
  },

  /* ---------- 3. Entscheidungen: Was passiert dann? ---------- */
  {
    id: 'entscheiden', icon: '🤔', color: '#3a86ff', skill: 'Gut entscheiden', title: 'Was passiert dann?',
    intro: 'Bevor du dich entscheidest: Stopp! Denk nach, was dann passiert. Und dann entscheide.',
    render(body) {
      const SCEN = [
        { e: '🌧️', q: 'Es regnet, aber du willst draußen spielen. Was ziehst du an?', o: [
          ['🥾 Gummistiefel und Regenjacke', 'Du bleibst trocken und kannst sogar in Pfützen springen!', true],
          ['🩴 Sandalen und T-Shirt', 'Deine Füße werden nass und kalt. Bald willst du wieder rein.', false]] },
        { e: '🍪', q: 'Du hast zwei Kekse. Deine Freundin hat keinen. Was machst du?', o: [
          ['🤝 Ich gebe ihr einen ab', 'Ihr freut euch beide. Teilen macht Freunde froh.', true],
          ['😋 Ich esse beide', 'Lecker – aber deine Freundin ist traurig.', false]] },
        { e: '📚', q: 'Du hast Hausaufgaben auf und willst spielen. Was machst du zuerst?', o: [
          ['✏️ Erst Hausaufgaben, dann spielen', 'Danach kannst du ganz entspannt spielen – nichts drückt mehr.', true],
          ['🎮 Erst spielen', 'Abends bist du müde und die Hausaufgaben fallen dir schwer.', false]] },
        { e: '🧱', q: 'Dein Turm ist umgefallen. Was machst du?', o: [
          ['🔁 Nochmal bauen – unten breiter', 'Der neue Turm hält viel besser! Aus Fehlern lernt man.', true],
          ['😠 Wütend weggehen', 'Dann gibt es heute keinen Turm.', false]] },
        { e: '🛝', q: 'Ein anderes Kind möchte auch schaukeln. Was machst du?', o: [
          ['🔄 Wir wechseln uns ab', 'Ihr habt beide Spaß – und vielleicht einen neuen Freund.', true],
          ['🙅 Ich bleibe sitzen', 'Es gibt Streit und keiner hat mehr richtig Spaß.', false]] },
        { e: '🍦', q: 'Du darfst wählen: ein kleines Eis jetzt oder ein großes Eis am Wochenende.', o: [
          ['🍦 Kleines Eis jetzt', 'Auch okay! Dafür musst du nicht warten. Es gibt nicht immer eine falsche Antwort.', true],
          ['🍨 Großes Eis am Wochenende', 'Auch okay! Wer warten kann, bekommt manchmal mehr.', true]] },
        { e: '🚲', q: 'Du willst Fahrrad fahren. Was ist wichtig?', o: [
          ['⛑️ Helm aufsetzen', 'Wenn du hinfällst, ist dein Kopf geschützt.', true],
          ['💨 Schnell los, ohne Helm', 'Das kann gefährlich werden, wenn du hinfällst.', false]] },
        { e: '😢', q: 'Dein Freund sitzt traurig in der Ecke. Was machst du?', o: [
          ['💬 Ich frage, was los ist', 'Er freut sich, dass du an ihn denkst. Das tröstet.', true],
          ['⚽ Ich spiele einfach weiter', 'Er bleibt allein und traurig.', false]] },
      ];
      const list = shuffle(SCEN);
      let i = 0, good = 0;
      const view = h('div');
      put(body, view);
      function show() {
        view.innerHTML = '';
        if (i >= list.length) return end();
        const s = list[i];
        put(view, h('div', { class: 'progress' }, `${i + 1} / ${list.length}`),
          h('div', { class: 'scene' }, s.e), h('p', { class: 'big' }, s.q),
          h('p', { class: 'hint' }, '🛑 Stopp  ·  🤔 Was passiert dann?  ·  ✅ Entscheide'));
        const opts = h('div', { class: 'choices col' });
        shuffle(s.o).forEach(([t, r, ok]) => put(opts, h('button', {
          class: 'choice wide', onclick: () => {
            opts.querySelectorAll('button').forEach(b => { b.disabled = true; });
            if (ok) { good++; cheer(); } else softFail();
            const res = h('div', { class: 'result ' + (ok ? 'ok' : 'meh') }, h('b', {}, ok ? '👍 Gute Idee! ' : '🤔 Hmm … '), r);
            put(view, res, h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { i++; show(); } }, 'Weiter ➜')));
            sayKid((ok ? 'Gute Idee! ' : 'Hmm. ') + r);
            res.scrollIntoView({ behavior: 'smooth', block: 'center' });
          },
        }, t)));
        put(view, opts);
        if (i > 0) sayKid(s.q);
      }
      function end() {
        cheer();
        const t = `Du hast ${good} von ${list.length} Situationen richtig gut gelöst!`;
        put(view, h('div', { class: 'celebrate' }, '🏅'), h('p', { class: 'big' }, t),
          h('div', { class: 'tip' }, '💡 Der Trick für gute Entscheidungen: Stopp! Kurz nachdenken, was dann passiert. Dann entscheiden.'),
          h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { i = 0; good = 0; show(); } }, 'Nochmal 🔁')));
        sayKid(t);
      }
      show();
    },
  },

  /* ---------- 4. Aufschieben: Warte-Keks + Aufräum-Rakete ---------- */
  {
    id: 'warten', icon: '🍪', color: '#8d6e63', skill: 'Nicht aufschieben', title: 'Warte-Keks & Rakete',
    intro: 'Wenn du wartest, ohne den Keks anzutippen, bekommst du zwei Kekse! Und mit der Rakete schaffst du Aufgaben, ohne sie aufzuschieben.',
    render(body) {
      const LV = [5, 10, 15, 20];
      const TIPS = ['🎵 Sing ein Lied', '🔢 Zähl langsam bis zehn', '🦶 Wackel mit den Zehen', '🙈 Halte dir die Augen zu', '🌬️ Atme tief ein und aus'];
      let lv = 0, rocketIv = null;
      const view = h('div');
      put(body, view);
      const stopRocket = () => { if (rocketIv) { clearInterval(rocketIv); rocketIv = null; } };
      function round() {
        stopRocket();
        view.innerHTML = '';
        const secs = LV[lv];
        let total = store.get('keks7', 0), ended = false, ti = 0;
        const cookie = h('button', { class: 'cookie', 'aria-label': 'Keks' }, '🍪');
        const fill = h('i');
        const tip = h('p', { class: 'big' }, 'Warte … dann bekommst du zwei!');
        put(view, h('p', { class: 'center' }, `Warte ${secs} Sekunden, ohne zu tippen → 2 Kekse. Tippst du vorher → 1 Keks.`),
          cookie, h('div', { class: 'bar' }, fill), tip, h('p', { class: 'center' }, `Deine Keksdose: ${total} 🍪`));
        const t0 = performance.now();
        const iv = timers.every(() => {
          const el = (performance.now() - t0) / 1000;
          fill.style.width = Math.min(100, el / secs * 100) + '%';
          if (el >= secs) finish(true);
        }, 100);
        const tv = timers.every(() => { tip.textContent = TIPS[ti++ % TIPS.length]; }, 2500);
        cookie.addEventListener('click', () => finish(false));
        function finish(waited) {
          if (ended) return;
          ended = true; clearInterval(iv); clearInterval(tv);
          total += waited ? 2 : 1; store.set('keks7', total);
          cookie.textContent = waited ? '🍪🍪' : '🍪'; cookie.disabled = true;
          const t = waited ? 'Super gewartet! Du bekommst zwei Kekse!' : 'Ein Keks für dich. Beim nächsten Mal schaffst du das Warten bestimmt!';
          tip.textContent = t; sayKid(t);
          if (waited) cheer();
          const more = waited && lv < LV.length - 1;
          put(view, h('div', { class: 'tip' }, '💡 Warten fällt leichter, wenn man sich ablenkt: singen, zählen, an etwas Schönes denken. Und: Erst die Arbeit, dann das Vergnügen – dann macht das Vergnügen doppelt Spaß!'),
            h('div', { class: 'btnrow' },
              h('button', { class: 'btn', onclick: () => { if (more) lv++; round(); } }, more ? 'Länger warten ➜' : 'Nochmal 🔁'),
              h('button', { class: 'btn alt', onclick: rocket }, '🚀 Aufräum-Rakete')));
        }
      }
      function rocket() {
        stopRocket();
        view.innerHTML = '';
        put(view, h('p', { class: 'big' }, 'Gibt es eine Aufgabe, die du gern aufschiebst? Starte die Rakete und fang sofort an! Wenn sie oben ist, bist du fertig.'),
          h('div', { class: 'choices' }, [2, 5, 10].map(m => h('button', { class: 'choice', onclick: () => launch(m) }, h('span', { class: 'ce' }, '⏱️'), `${m} Minuten`))),
          h('p', { class: 'center' }, 'Ideen: 🧸 Zimmer aufräumen · 🎒 Ranzen packen · ✏️ Hausaufgaben · 🦷 Zähne putzen'),
          h('div', { class: 'btnrow' }, h('button', { class: 'btn alt', onclick: round }, '🍪 Zum Warte-Keks')));
      }
      function launch(m) {
        stopRocket();
        view.innerHTML = '';
        const r = h('div', { class: 'rocket' }, '🚀');
        const clock = h('p', { class: 'big clock' });
        put(view, h('div', { class: 'sky' }, h('div', { class: 'moon' }, '🌙'), r), clock,
          h('div', { class: 'btnrow' }, h('button', { class: 'btn alt', onclick: rocket }, 'Abbrechen')));
        sayKid('Drei, zwei, eins, los! Die Rakete startet. Fang jetzt an!');
        const end = performance.now() + m * 60000;
        const step = () => {
          const left = Math.max(0, end - performance.now());
          const pct = 1 - left / (m * 60000);
          r.style.bottom = (pct * 78) + '%';
          clock.textContent = `${Math.floor(left / 60000)}:${String(Math.floor(left / 1000) % 60).padStart(2, '0')}`;
          if (left <= 0) {
            stopRocket(); cheer();
            clock.textContent = '🎉 Geschafft! Die Rakete ist am Mond!';
            sayKid('Geschafft! Du hast nicht aufgeschoben. Toll gemacht!');
          }
        };
        step();
        rocketIv = timers.every(step, 250);
      }
      round();
      return stopRocket;
    },
  },

  /* ---------- 5. Metakognition: Schätzen, merken, nachdenken ---------- */
  {
    id: 'merken', icon: '🪞', color: '#06aed5', skill: 'Wie lerne ich?', title: 'Farben merken',
    intro: 'Schätze zuerst, wie viele Farben du dir merken kannst. Dann spielst du. Danach überlegen wir, was dir geholfen hat.',
    render(body) {
      const COLS = [['#e63946', 'Rot', 'C4'], ['#1d4ed8', 'Blau', 'E4'], ['#ffd60a', 'Gelb', 'G4'], ['#2a9d4a', 'Grün', 'C5']];
      const TRICKS = [
        ['🗣️', 'Laut mitsagen', 'Sag die Farben laut mit: Rot, Blau, Gelb … Das Gehirn merkt sich Gehörtes besser.'],
        ['🎵', 'Wie ein Lied', 'Sing die Farben wie ein Lied. Melodien bleiben gut im Kopf.'],
        ['👉', 'Mit dem Finger zeigen', 'Zeig mit dem Finger mit. Bewegung hilft beim Merken.'],
        ['👀', 'Nur geschaut', 'Probier nächstes Mal einen Trick: laut mitsagen oder mitsingen. Mal sehen, ob du dann mehr schaffst!'],
      ];
      let guess = 0, seq = [], pos = 0, accepting = false, status, pads;
      const view = h('div');
      put(body, view);
      function ask() {
        view.innerHTML = '';
        const best = store.get('farben7_best', 0);
        put(view, h('p', { class: 'big' }, 'Wie viele Farben kannst du dir merken? Schätze!'),
          best ? h('p', { class: 'center' }, `Dein Rekord bisher: ${best}`) : null,
          h('div', { class: 'choices' }, [2, 3, 4, 5, 6, 7, 8].map(n => h('button', { class: 'choice num', onclick: () => { guess = n; start(); } }, String(n)))));
      }
      function start() {
        view.innerHTML = '';
        seq = [];
        status = h('p', { class: 'big' }, 'Schau genau hin …');
        pads = h('div', { class: 'pads' }, COLS.map((c, i) => h('button', { class: 'pad', style: `--c:${c[0]}`, 'aria-label': c[1], onclick: () => press(i) })));
        put(view, h('p', { class: 'center' }, `Deine Schätzung: ${guess}`), status, pads);
        timers.set(next, 900);
      }
      function flash(i) {
        const p = pads.children[i];
        p.classList.add('lit'); pianoNote(freq(COLS[i][2]), 0, null, 0.4);
        timers.set(() => p.classList.remove('lit'), 380);
      }
      function next() {
        seq.push(Math.floor(Math.random() * 4));
        accepting = false;
        status.textContent = `Merke dir ${seq.length} Farbe${seq.length > 1 ? 'n' : ''} …`;
        seq.forEach((c, k) => timers.set(() => flash(c), 650 * k));
        timers.set(() => { accepting = true; pos = 0; status.textContent = '👉 Jetzt du! Tippe nach.'; }, 650 * seq.length);
      }
      function press(i) {
        if (!accepting) return;
        flash(i);
        if (i !== seq[pos]) { accepting = false; softFail(); timers.set(() => result(seq.length - 1), 700); return; }
        pos++;
        if (pos === seq.length) { accepting = false; status.textContent = 'Richtig! 👍'; tone(880, 0.15, 'sine', 0.2, 0.2); timers.set(next, 1000); }
      }
      function result(reached) {
        const best = store.get('farben7_best', 0);
        if (reached > best) store.set('farben7_best', reached);
        const t = reached > guess ? `Du hast ${reached} geschafft – mehr als du gedacht hast! Trau dir ruhig mehr zu.`
          : reached === guess ? `Du hast ${reached} geschafft – genau richtig geschätzt! Du kennst dich gut.`
          : `Du hast ${reached} geschafft. Geschätzt hattest du ${guess}. Mit Übung schaffst du mehr!`;
        view.innerHTML = '';
        put(view, h('p', { class: 'big' }, t), h('p', { class: 'center' }, 'Was hat dir beim Merken geholfen?'),
          h('div', { class: 'choices' }, TRICKS.map(([e, n, tipp]) => h('button', {
            class: 'choice', onclick: () => {
              put(view, h('div', { class: 'tip' }, '💡 ' + tipp + ' Wer weiß, wie er am besten lernt, lernt schneller!'),
                h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: ask }, 'Nochmal mit Trick 🔁')));
              sayKid(tipp);
              view.querySelectorAll('.choice').forEach(b => { b.disabled = true; });
            },
          }, h('span', { class: 'ce' }, e), n))));
        sayKid(t + ' Was hat dir beim Merken geholfen?');
      }
      ask();
    },
  },

  /* ---------- 6. Denkfehler: Trick-Detektiv ---------- */
  {
    id: 'detektiv', icon: '🕵️', color: '#5e60ce', skill: 'Denkfallen erkennen', title: 'Trick-Detektiv',
    intro: 'Manchmal lässt sich unser Gehirn austricksen. Bist du ein guter Detektiv und findest die Tricks?',
    render(body) {
      const PUZ = [
        { q: 'Welche Linie ist länger?', svg: `<svg viewBox="0 0 300 160"><g class="fins" stroke="#333" stroke-width="5" stroke-linecap="round" fill="none">
            <path d="M70 25 L50 45 L70 65 M230 25 L250 45 L230 65"/><path d="M30 95 L50 115 L30 135 M270 95 L250 115 L270 135"/></g>
            <g stroke="#333" stroke-width="5" stroke-linecap="round"><line x1="50" y1="45" x2="250" y2="45"/><line x1="50" y1="115" x2="250" y2="115"/></g>
            <g class="ruler" stroke="#e63946" stroke-width="3" stroke-dasharray="7 5"><line x1="50" y1="8" x2="50" y2="152"/><line x1="250" y1="8" x2="250" y2="152"/></g>
            <text x="8" y="52" font-size="22">A</text><text x="8" y="122" font-size="22">B</text></svg>`,
          o: ['A ist länger', 'B ist länger', 'Beide gleich lang'], a: 2,
          ex: 'Beide Linien sind genau gleich lang! Die Pfeil-Enden tricksen dein Gehirn aus. Die roten Hilfslinien zeigen es.' },
        { q: 'Welcher orange Kreis ist größer?', svg: (() => {
            const ring = (cx, n, d, r) => Array.from({ length: n }, (_, k) => `<circle cx="${(cx + Math.cos(k / n * 6.283) * d).toFixed(1)}" cy="${(80 + Math.sin(k / n * 6.283) * d).toFixed(1)}" r="${r}"/>`).join('');
            return `<svg viewBox="0 0 300 160"><g class="fins" fill="#a0aec0">${ring(80, 6, 52, 22)}${ring(222, 8, 32, 8)}</g>
              <circle cx="80" cy="80" r="17" fill="#ff8c00"/><circle cx="222" cy="80" r="17" fill="#ff8c00"/>
              <text x="70" y="155" font-size="20">A</text><text x="212" y="155" font-size="20">B</text></svg>`;
          })(),
          o: ['A ist größer', 'B ist größer', 'Beide gleich groß'], a: 2,
          ex: 'Beide orangen Kreise sind gleich groß! Neben großen Kreisen wirkt etwas klein, neben kleinen wirkt es groß.' },
        { q: 'In welcher Kiste sind mehr Bonbons?', html: `<div class="boxes"><div class="box big"><span class="lid">🎁</span><span class="in">🍬🍬</span><b>A</b></div><div class="box small"><span class="lid">🎁</span><span class="in">🍬🍬🍬🍬🍬</span><b>B</b></div></div>`,
          o: ['In der großen Kiste A', 'In der kleinen Kiste B', 'Kann man nicht wissen, ohne nachzuschauen'], a: 2,
          ex: 'Ein echter Detektiv schaut nach! Die große Kiste hat nur 2 Bonbons, die kleine hat 5. Groß heißt nicht automatisch viel.' },
        { q: 'In welchem Glas ist mehr Saft?', svg: `<svg viewBox="0 0 300 170"><g fill="none" stroke="#555" stroke-width="4">
            <path d="M60 20 L60 150 L100 150 L100 20"/><path d="M170 90 L170 150 L280 150 L280 90"/></g>
            <rect x="62" y="50" width="36" height="98" fill="#ff8c00" opacity=".8"/><rect x="172" y="117" width="106" height="31" fill="#ff8c00" opacity=".8"/>
            <text x="72" y="168" font-size="18">A</text><text x="218" y="168" font-size="18">B</text></svg>`,
          o: ['Im hohen Glas A', 'Im breiten Glas B', 'In beiden gleich viel'], a: 2,
          ex: 'Beide haben gleich viel Saft! Im schmalen Glas steht er höher, im breiten Glas ist er dafür breiter. Hoch heißt nicht mehr.' },
        { q: 'Drei Kinder sagen: „Die Banane ist blau!“ Welche Farbe hat sie?', html: `<div class="crowd"><span>🧒<i>blau!</i></span><span>👧<i>blau!</i></span><span>👦<i>blau!</i></span><b class="banana">🍌</b></div>`,
          o: ['Blau – wenn alle das sagen', 'Gelb – das sehe ich doch', 'Ich weiß nicht'], a: 1,
          ex: 'Die Banane ist gelb! Auch wenn viele etwas anderes sagen: Trau deinen eigenen Augen und denk selbst nach.' },
      ];
      let i = 0, right = 0;
      const view = h('div');
      put(body, view);
      function show() {
        view.innerHTML = '';
        if (i >= PUZ.length) {
          cheer();
          const t = `Du hast ${right} von ${PUZ.length} Tricks durchschaut!`;
          put(view, h('div', { class: 'celebrate' }, '🕵️'), h('p', { class: 'big' }, t),
            h('div', { class: 'tip' }, '💡 Detektiv-Regel: Nicht nur schätzen – nachmessen, nachschauen und selbst nachdenken!'),
            h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { i = 0; right = 0; show(); } }, 'Nochmal 🔁')));
          sayKid(t + ' Super Detektiv!');
          return;
        }
        const p = PUZ[i];
        const pic = h('div', { class: 'puzzle', html: p.svg || p.html });
        put(view, h('div', { class: 'progress' }, `Fall ${i + 1} / ${PUZ.length}`), h('p', { class: 'big' }, p.q), pic);
        const opts = h('div', { class: 'choices col' }, p.o.map((t, k) => h('button', {
          class: 'choice wide', onclick: () => {
            opts.querySelectorAll('button').forEach(b => { b.disabled = true; });
            pic.classList.add('reveal');
            const ok = k === p.a;
            if (ok) { right++; cheer(); } else softFail();
            const res = h('div', { class: 'result ' + (ok ? 'ok' : 'meh') }, h('b', {}, ok ? '🔍 Richtig erkannt! ' : '😮 Reingelegt! '), p.ex);
            put(view, res, h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { i++; show(); } }, 'Nächster Fall ➜')));
            sayKid((ok ? 'Richtig erkannt! ' : 'Reingelegt! ') + p.ex);
            res.scrollIntoView({ behavior: 'smooth', block: 'center' });
          },
        }, t)));
        put(view, opts);
        if (i > 0) sayKid(p.q);
      }
      show();
    },
  },

  /* ---------- 7. Geopolitik: Weltreise der Zutaten ---------- */
  {
    id: 'welt', icon: '🌍', color: '#2a9d4a', skill: 'Die Welt verstehen', title: 'Weltreise der Zutaten',
    intro: 'Viele Dinge bestehen aus Teilen aus der ganzen Welt. Tippe auf die Länder und schicke die Zutaten zur Fabrik!',
    render(body) {
      // [Emoji, Zutat, Land, Kontinent, vorgelesener Satz]
      const PRODUCTS = [
        { e: '🍫', n: 'Schokolade', der: 'Die Schokolade', miss: 'Wenn die Elfenbeinküste keine Kakaobohnen mehr schickt, gibt es keine Schokolade!', parts: [
          ['🌰', 'Kakaobohnen', 'Elfenbeinküste', 'Afrika', 'Die Kakaobohnen kommen aus der Elfenbeinküste in Afrika.'],
          ['🌾', 'Zucker', 'Brasilien', 'Südamerika', 'Der Zucker kommt aus Brasilien in Südamerika.'],
          ['🥛', 'Milch', 'Deutschland', 'Europa', 'Die Milch kommt aus Deutschland.'],
          ['🌼', 'Vanille', 'Madagaskar', 'Afrika', 'Die Vanille kommt aus Madagaskar, einer Insel bei Afrika.']] },
        { e: '🚲', n: 'Fahrrad', der: 'Das Fahrrad', miss: 'Wenn Thailand kein Gummi mehr schickt, bekommt das Fahrrad keine Reifen!', parts: [
          ['🌳', 'Gummi für die Reifen', 'Thailand', 'Asien', 'Das Gummi für die Reifen kommt aus Thailand in Asien.'],
          ['⛏️', 'Eisenerz für den Stahl', 'Australien', 'Australien', 'Das Eisenerz für den Stahl kommt aus Australien.'],
          ['⚙️', 'Gangschaltung', 'Japan', 'Asien', 'Die Gangschaltung kommt aus Japan.'],
          ['🔧', 'Zusammenbauen', 'Deutschland', 'Europa', 'Zusammengebaut wird das Fahrrad in Deutschland.']] },
        { e: '📱', n: 'Handy', der: 'Das Handy', miss: 'Wenn Taiwan keine Computer-Chips mehr schickt, funktioniert kein Handy!', parts: [
          ['🔋', 'Lithium für den Akku', 'Chile', 'Südamerika', 'Das Lithium für den Akku kommt aus Chile in Südamerika.'],
          ['💎', 'Kobalt', 'DR Kongo', 'Afrika', 'Das Kobalt kommt aus dem Kongo in Afrika.'],
          ['🔲', 'Computer-Chips', 'Taiwan', 'Asien', 'Die Computer-Chips kommen aus Taiwan in Asien.'],
          ['🏭', 'Zusammenbau', 'China', 'Asien', 'Zusammengebaut wird das Handy in China.']] },
      ];
      let pi = 0;
      const view = h('div');
      put(body, view);
      function show() {
        const P = PRODUCTS[pi];
        let got = 0;
        view.innerHTML = '';
        const slots = h('div', { class: 'slots' }, P.parts.map(p => h('span', { class: 'slot' }, '❔')));
        const factory = h('div', { class: 'factory' }, h('span', { class: 'fe' }, '🏭'), h('div', {}, h('b', {}, `Wir bauen: ${P.n} ${P.e}`), slots));
        const cards = h('div', { class: 'countries' }, P.parts.map((p, k) => {
          const c = h('button', { class: 'country' }, h('span', { class: 'ce' }, p[0]), h('b', {}, p[2]), h('small', {}, `${p[3]} · ${p[1]}`));
          c.addEventListener('click', () => {
            if (c.disabled) return;
            c.disabled = true; c.classList.add('sent');
            tone(300, 0.4, 'sawtooth', 0.06); tone(250, 0.5, 'sawtooth', 0.05, 0.1);
            const ship = h('span', { class: 'ship' }, '🚢');
            put(c, ship);
            sayKid(p[4]);
            timers.set(() => {
              slots.children[k].textContent = p[0]; slots.children[k].classList.add('in');
              tone(900, 0.12, 'sine', 0.2);
              if (++got === P.parts.length) timers.set(done, 500);
            }, 900);
          });
          return c;
        }));
        put(view, factory, h('p', { class: 'center' }, 'Tippe auf jedes Land!'), cards);
        function done() {
          cheer();
          const t = `Hurra! ${P.der} ist fertig. Dafür haben ${P.parts.length} Länder zusammengearbeitet!`;
          put(view, h('div', { class: 'celebrate' }, P.e), h('p', { class: 'big' }, t),
            h('div', { class: 'btnrow' }, h('button', { class: 'btn alt', onclick: whatIf }, '🤔 Was, wenn ein Land nicht liefert?')));
          sayKid(t);
          view.lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        function whatIf() {
          const t = P.miss + ' Länder brauchen einander. Darum ist es wichtig, dass sie fair miteinander handeln und sich gut verstehen.';
          put(view, h('div', { class: 'tip' }, '🌍 ' + t),
            h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { pi = (pi + 1) % PRODUCTS.length; show(); } }, 'Nächste Weltreise ➜')));
          sayKid(t);
          view.lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      show();
    },
  },

  /* ---------- 8. Epigenetik: Gesund wachsen ---------- */
  {
    id: 'gesund', icon: '🌱', color: '#80b918', skill: 'Gesund wachsen', title: 'Mein Zell-Kochbuch',
    intro: 'In jeder deiner Zellen steckt ein Kochbuch: deine Gene. Was du tust, entscheidet mit, welche Rezepte gekocht werden. Plane einen Tag und schau, wie deine Pflanze wächst!',
    render(body) {
      const DAY = [
        ['🌅 Frühstück', ['🍓', 'Müsli mit Obst', 1], ['🍬', 'Süßigkeiten', 0]],
        ['🏫 Pause', ['🏃', 'Draußen toben', 1], ['📱', 'Am Handy spielen', 0]],
        ['🥤 Durst', ['💧', 'Wasser', 1], ['🧃', 'Limo', 0]],
        ['🌤️ Nachmittag', ['🤝', 'Mit Freunden spielen', 1], ['📺', 'Allein fernsehen', 0]],
        ['🍽️ Abendessen', ['🥦', 'Gemüse und Nudeln', 1], ['🍟', 'Pommes und Cola', 0]],
        ['🌙 Abend', ['😴', 'Früh ins Bett', 1], ['🎮', 'Lange wach bleiben', 0]],
      ];
      let i = 0, score = 0;
      const plant = h('div', { class: 'plant' }, '🌱');
      const book = h('div', { class: 'book' }, DAY.map(() => h('span', {}, '📕')));
      const view = h('div');
      put(body, h('div', { class: 'garden' }, plant, h('div', {}, h('small', {}, 'Gesund-Rezepte an:'), book)), view);
      function show() {
        view.innerHTML = '';
        if (i >= DAY.length) return end();
        const [when, a, b] = DAY[i];
        put(view, h('p', { class: 'big' }, when + ': Was machst du?'),
          h('div', { class: 'choices' }, shuffle([a, b]).map(([e, t, good]) => h('button', {
            class: 'choice', onclick: () => {
              if (good) { score++; book.children[i].textContent = '📗'; book.children[i].classList.add('on'); tone(700 + score * 80, 0.2, 'sine', 0.25); }
              else tone(300, 0.15, 'triangle', 0.15);
              plant.textContent = score >= 5 ? '🌳' : score >= 3 ? '🌿' : '🌱';
              plant.style.fontSize = (60 + score * 14) + 'px';
              i++; show();
            },
          }, h('span', { class: 'ce' }, e), t))));
      }
      function end() {
        cheer();
        const t = `Du hast ${score} von ${DAY.length} gesunden Sachen gewählt!`;
        put(view, h('p', { class: 'big' }, t),
          h('div', { class: 'tip' }, '💡 Schlafen, Bewegung, gutes Essen und Freunde sind wie Sonne und Wasser für deine Zellen. Mal eine Süßigkeit ist völlig okay – es kommt darauf an, was du meistens machst.'),
          h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => {
            i = 0; score = 0; plant.textContent = '🌱'; plant.style.fontSize = '';
            [...book.children].forEach(s => { s.textContent = '📕'; s.classList.remove('on'); });
            show();
          } }, 'Neuer Tag 🔁')));
        sayKid(t + ' Mal eine Süßigkeit ist völlig okay. Es kommt darauf an, was du meistens machst.');
      }
      show();
    },
  },
];

buildMenu('menu7', 'game7', '🧒 Entdecker-Akademie', 'Spiele, die dein Gehirn stark machen. Tippe auf 🔊, dann wird vorgelesen.', [window.SPIELWELT, ...(window.EXTRA7 || []), ...GAMES7].filter(Boolean),
  'Für Eltern: Am meisten lernen Kinder, wenn ihr gemeinsam spielt und danach darüber sprecht.');
