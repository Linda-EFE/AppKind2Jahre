'use strict';
/* =====================================================================
   17 JAHRE – Skills Lab
   Nutzt die Helfer aus kids7.js (h, store, shuffle, timers, openGame …)
   ===================================================================== */
const eur = n => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const pct = n => n.toLocaleString('de-DE', { maximumFractionDigits: 1 }) + ' %';

function card(title, ...kids) { return h('div', { class: 'card' }, title ? h('h3', {}, title) : null, ...kids); }
function field(label, input, hint) { return h('label', { class: 'field' }, h('span', {}, label), input, hint ? h('small', {}, hint) : null); }
function numIn(value, attrs = {}) { return h('input', { type: 'number', inputmode: 'decimal', value: String(value), ...attrs }); }
function ul(items) { return h('ul', {}, items.map(i => h('li', { html: i }))); }

// Mehrere Unterseiten in einem Modul
function tabs(body, list) {
  const bar = h('div', { class: 'tabs' });
  const pane = h('div', { class: 'pane' });
  put(body, bar, pane);
  let cleanup = null;
  const sel = i => {
    if (cleanup) { cleanup(); cleanup = null; }
    [...bar.children].forEach((b, k) => b.classList.toggle('on', k === i));
    pane.innerHTML = '';
    const c = list[i][1](pane);
    if (typeof c === 'function') cleanup = c;
  };
  list.forEach(([label], i) => put(bar, h('button', { class: 'tab', onclick: () => sel(i) }, label)));
  sel(0);
  return () => { if (cleanup) cleanup(); };
}

// Einfaches Liniendiagramm als SVG
function lineChart(series, { xFmt = x => x, yFmt = y => y, w = 640, ht = 260 } = {}) {
  const P = { l: 64, r: 12, t: 12, b: 30 };
  const all = series.flatMap(s => s.pts);
  if (!all.length) return h('div');
  const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y1 = Math.max(...ys, 1);
  const X = x => P.l + (x - x0) / ((x1 - x0) || 1) * (w - P.l - P.r);
  const Y = y => ht - P.b - y / y1 * (ht - P.t - P.b);
  let g = '';
  for (let k = 0; k <= 4; k++) {
    const yv = y1 * k / 4;
    g += `<line x1="${P.l}" x2="${w - P.r}" y1="${Y(yv)}" y2="${Y(yv)}" class="grid"/><text x="${P.l - 6}" y="${Y(yv) + 4}" text-anchor="end">${yFmt(yv)}</text>`;
  }
  for (let k = 0; k <= 4; k++) {
    const xv = x0 + (x1 - x0) * k / 4;
    g += `<text x="${X(xv)}" y="${ht - 8}" text-anchor="middle">${xFmt(Math.round(xv))}</text>`;
  }
  const dots = series.map(s => s.pts.length <= 40 ? s.pts.map(p => `<circle cx="${X(p[0]).toFixed(1)}" cy="${Y(p[1]).toFixed(1)}" r="4" fill="${s.color}"/>`).join('') : '').join('');
  const lines = dots + series.map(s => `<polyline fill="none" stroke="${s.color}" stroke-width="3" stroke-linejoin="round" points="${s.pts.map(p => `${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)}`).join(' ')}"/>`).join('');
  const legend = h('div', { class: 'legend' }, series.map(s => h('span', {}, h('i', { style: `background:${s.color}` }), s.name)));
  return h('div', { class: 'chart' }, h('div', { html: `<svg viewBox="0 0 ${w} ${ht}" class="lc">${g}${lines}</svg>` }), series.length > 1 ? legend : null);
}

function quizRunner(view, items, { onDone }) {
  // items: {q, o:[...], a, ex}
  let i = 0, right = 0;
  const show = () => {
    view.innerHTML = '';
    if (i >= items.length) { onDone(right, items.length); return; }
    const it = items[i];
    put(view, h('div', { class: 'progress' }, `${i + 1} / ${items.length}`), h('p', { class: 'q' }, it.q), it.extra ? it.extra() : null);
    const opts = h('div', { class: 'opts' }, it.o.map((t, k) => h('button', {
      class: 'opt', onclick: () => {
        opts.querySelectorAll('button').forEach((b, j) => { b.disabled = true; if (j === it.a) b.classList.add('right'); });
        const ok = k === it.a;
        if (ok) right++; else opts.children[k].classList.add('wrong');
        tone(ok ? 880 : 240, 0.15, 'sine', 0.15);
        put(view, h('div', { class: 'result ' + (ok ? 'ok' : 'meh') }, h('b', {}, ok ? '✓ Richtig. ' : '✗ Nicht ganz. '), h('span', { html: it.ex })),
          h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { i++; show(); } }, i < items.length - 1 ? 'Weiter →' : 'Auswertung →')));
      },
    }, t)));
    put(view, opts);
  };
  show();
}

const GAMES17 = [
  /* ---------- 1. Neuroplastizität ---------- */
  {
    id: 'gym', icon: '🧠', color: '#ff006e', skill: 'Neuroplastizität', title: 'Gehirn-Gym',
    render(body) {
      return tabs(body, [
        ['Zahlen-Merken', pane => {
          const hist = store.get('span17', []);
          const view = h('div');
          put(pane, card('Wie viele Ziffern kannst du dir merken?',
            h('p', {}, 'Eine Zahl erscheint kurz. Tippe sie danach ein. Jede Runde wird sie eine Ziffer länger. Dein Ergebnis wird gespeichert – trainiere ein paar Tage und schau, ob du besser wirst.'),
            h('p', { class: 'muted' }, 'Profi-Trick: Chunking – 4 9 1 7 2 3 als „49 – 17 – 23“ merken.')), view);
          let n = 3;
          const intro = (top = null) => {
            view.innerHTML = '';
            put(view, top, h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { n = 3; round(); } }, 'Test starten')));
            if (hist.length) {
              put(view, card(`Dein Verlauf (Bestwert: ${Math.max(...hist.map(x => x.s))} Ziffern)`,
                lineChart([{ name: 'Ziffern', color: '#ff4d8d', pts: hist.map((x, k) => [k + 1, x.s]) }], { xFmt: x => '#' + x })));
            }
          };
          const round = () => {
            view.innerHTML = '';
            const num = Array.from({ length: n }, (_, k) => (k === 0 ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10))).join('');
            const disp = h('div', { class: 'digits' }, num);
            put(view, h('p', { class: 'muted center' }, `${n} Ziffern – merken!`), disp);
            timers.set(() => {
              disp.textContent = '• • •';
              const inp = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', class: 'bigin', placeholder: 'Zahl eingeben' });
              const check = () => {
                if (inp.value.replace(/\D/g, '') === num) { tone(880, 0.12, 'sine', 0.2); n++; round(); }
                else finish(n - 1, num, inp.value);
              };
              inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
              put(view, inp, h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: check }, 'Prüfen')));
              inp.focus();
            }, 600 + n * 700);
          };
          const finish = (score, num, typed) => {
            hist.push({ d: today(), s: score });
            while (hist.length > 40) hist.shift();
            store.set('span17', hist);
            intro(card(`Ergebnis: ${score} Ziffern`,
              h('p', {}, `Richtig wäre gewesen: ${num} · Deine Eingabe: ${typed || '–'}`),
              h('p', { class: 'muted' }, 'Typisch sind etwa 7 ± 2 Ziffern. Mit Strategien wie Chunking schaffen Geübte deutlich mehr.')));
          };
          intro();
        }],
        ['Wie das Gehirn lernt', pane => {
          put(pane, 
            card('Neuroplastizität in 30 Sekunden', ul([
              '<b>Was zusammen feuert, verdrahtet sich.</b> Nervenzellen, die oft gleichzeitig aktiv sind, verstärken ihre Verbindung (Hebb’sche Regel).',
              '<b>Übung macht schnell.</b> Häufig genutzte Bahnen werden besser isoliert (Myelin) – Signale laufen schneller.',
              '<b>Schlaf speichert.</b> Im Schlaf wird Gelerntes gefestigt. Durchmachen vor der Prüfung schadet dem Gedächtnis.',
              '<b>Verteilt schlägt gebündelt.</b> 4 × 15 Minuten an verschiedenen Tagen bringen mehr als 1 × 60 Minuten.',
              '<b>Es ist nie zu spät.</b> Das Gehirn bleibt ein Leben lang formbar – im Teenageralter besonders stark.',
            ])),
            card('Ehrlicher Hinweis', h('p', {}, 'Gehirntraining-Spiele machen dich vor allem in genau diesem Spiel besser. Dass sie die allgemeine Intelligenz steigern, ist wissenschaftlich kaum belegt. Das Prinzip gilt aber für jede Fähigkeit: Sprache, Instrument, Sport, Programmieren – gezielt üben verändert das Gehirn.')),
            card('Challenge für 30 Tage', h('p', {}, 'Such dir eine Fähigkeit aus und übe sie täglich 15 Minuten. Notiere am Tag 1 und Tag 30, was du kannst. Du wirst den Unterschied sehen.')));
        }],
      ]);
    },
  },

  /* ---------- 2. Finanzen ---------- */
  {
    id: 'finanzen', icon: '💰', color: '#ff9f1c', skill: 'Finanzwissen', title: 'Geld-Labor',
    render(body) {
      const note = h('p', { class: 'muted small' }, 'Beispielrechnungen, keine Anlageberatung. Renditen schwanken – die Vergangenheit garantiert nichts für die Zukunft.');
      const c = tabs(body, [
        ['Zinseszins', pane => {
          const rate = numIn(50, { min: 0, step: 10 }), ret = numIn(5, { min: 0, max: 15, step: 0.5 }), age = numIn(17, { min: 10, max: 60 }), endAge = numIn(67, { min: 20, max: 90 });
          const out = h('div');
          put(pane, card('Was wird aus deinem Sparplan?',
            h('div', { class: 'form' }, field('Sparrate pro Monat (€)', rate), field('Rendite pro Jahr (%)', ret, 'Zum Vergleich: Ein breiter Aktien-ETF hatte langfristig im Schnitt mehrere Prozent pro Jahr – mit starken Schwankungen.'), field('Start mit Alter', age), field('Bis Alter', endAge))), out);
          const sim = (m, r, a0, a1) => {
            const rm = Math.pow(1 + r / 100, 1 / 12) - 1;
            let v = 0, paid = 0; const pts = [[a0, 0]];
            for (let a = a0; a < a1; a++) { for (let k = 0; k < 12; k++) { v = v * (1 + rm) + m; paid += m; } pts.push([a + 1, v]); }
            return { v, paid, pts };
          };
          const calc = () => {
            const m = +rate.value || 0, r = +ret.value || 0, a0 = +age.value || 17, a1 = Math.max(a0 + 1, +endAge.value || 67);
            const A = sim(m, r, a0, a1), B = sim(m, r, a0 + 10, a1);
            out.innerHTML = '';
            put(out, card('Ergebnis',
              h('div', { class: 'stats' },
                h('div', {}, h('small', {}, 'Endwert'), h('b', {}, eur(A.v))),
                h('div', {}, h('small', {}, 'Selbst eingezahlt'), h('b', {}, eur(A.paid))),
                h('div', {}, h('small', {}, 'Davon Zinsen & Erträge'), h('b', {}, eur(A.v - A.paid)))),
              lineChart([{ name: `Start mit ${a0}`, color: '#ffb703', pts: A.pts }, { name: `Start mit ${a0 + 10}`, color: '#8ecae6', pts: B.pts }], { xFmt: x => x + ' J.', yFmt: y => y >= 1000 ? Math.round(y / 1000) + 'k' : Math.round(y) }),
              h('p', {}, `Wer 10 Jahre früher anfängt, zahlt ${eur(A.paid - B.paid)} mehr ein – hat am Ende aber ${eur(A.v - B.v)} mehr. Das ist der Zinseszins: Erträge bringen selbst wieder Erträge.`)), note);
          };
          [rate, ret, age, endAge].forEach(i => i.addEventListener('input', calc));
          calc();
        }],
        ['Budget 50/30/20', pane => {
          const net = numIn(1000, { min: 0, step: 50 });
          const out = h('div');
          put(pane, card('Dein erstes eigenes Geld', h('p', {}, 'Die 50/30/20-Regel ist ein einfacher Startpunkt: 50 % für Fixes (Miete, Handyvertrag, Fahrkarte), 30 % für Wünsche (Ausgehen, Klamotten), 20 % fürs Sparen.'),
            field('Netto pro Monat (€), z. B. Ausbildungsvergütung oder Nebenjob', net)), out);
          const calc = () => {
            const n = +net.value || 0;
            out.innerHTML = '';
            put(out, card(null, h('div', { class: 'split' },
              h('div', { style: 'flex:50;background:#3a86ff' }, h('b', {}, eur(n * 0.5)), h('small', {}, '50 % Fixkosten')),
              h('div', { style: 'flex:30;background:#ff006e' }, h('b', {}, eur(n * 0.3)), h('small', {}, '30 % Wünsche')),
              h('div', { style: 'flex:20;background:#2a9d4a' }, h('b', {}, eur(n * 0.2)), h('small', {}, '20 % Sparen'))),
              ul(['<b>Zuerst sparen, dann ausgeben:</b> Dauerauftrag am Monatsanfang aufs Sparkonto.',
                '<b>Notgroschen:</b> Ziel sind 3 Monatsausgaben auf einem Tagesgeldkonto.',
                '<b>Kleinvieh macht Mist:</b> 4 € am Tag für Snacks sind rund 1.460 € im Jahr.',
                '<b>Vorsicht:</b> Ratenkäufe, „Buy now, pay later“ und Dispo sind teure Schulden.'])));
          };
          net.addEventListener('input', calc);
          calc();
        }],
        ['Inflation', pane => {
          const amt = numIn(100, { min: 0 }), inf = numIn(2.5, { min: 0, max: 20, step: 0.5 }), yrs = numIn(20, { min: 1, max: 60 });
          const out = h('div');
          put(pane, card('Was ist dein Geld später wert?', h('div', { class: 'form' }, field('Betrag (€)', amt), field('Inflation pro Jahr (%)', inf), field('Jahre', yrs))), out);
          const calc = () => {
            const a = +amt.value || 0, i = +inf.value || 0, y = +yrs.value || 1;
            const real = a / Math.pow(1 + i / 100, y);
            out.innerHTML = '';
            put(out, card(null, h('p', { class: 'q' }, `${eur(a)} unterm Kopfkissen kaufen in ${y} Jahren nur noch so viel wie heute ${eur(real)}.`),
              h('p', {}, 'Geld, das nur herumliegt, verliert jedes Jahr an Kaufkraft. Darum lohnt es sich zu verstehen, wie Zinsen, Sparpläne und Investieren funktionieren.')));
          };
          [amt, inf, yrs].forEach(x => x.addEventListener('input', calc));
          calc();
        }],
      ]);
      return c;
    },
  },

  /* ---------- 3. Entscheiden ---------- */
  {
    id: 'decide', icon: '⚖️', color: '#3a86ff', skill: 'Entscheidungen treffen', title: 'Entscheidungs-Matrix',
    render(body) {
      const st = store.get('matrix17', {
        opts: ['Ferienjob im Café', 'Nachhilfe geben'],
        crit: [['Verdienst', 4], ['Spaß', 3], ['Zeitaufwand', 2], ['Lerneffekt', 3]],
        sc: [[3, 4], [4, 3], [2, 4], [2, 4]],
      });
      const box = h('div'), out = h('div');
      put(body, card('So geht’s', h('p', {}, '1. Optionen eintragen. 2. Kriterien festlegen und gewichten (1 = unwichtig, 5 = sehr wichtig). 3. Jede Option pro Kriterium bewerten (1–5). Die Matrix rechnet aus, was am besten zu deinen Prioritäten passt.')), box, out,
        card('Denk-Werkzeuge für große Entscheidungen', ul([
          '<b>10-10-10:</b> Wie fühle ich mich mit der Entscheidung in 10 Minuten, 10 Monaten und 10 Jahren?',
          '<b>Pre-Mortem:</b> Stell dir vor, es ist ein Jahr später und die Entscheidung ist schiefgegangen. Warum? Was kannst du jetzt dagegen tun?',
          '<b>Umkehrbar oder nicht?</b> Umkehrbare Entscheidungen schnell treffen und ausprobieren. Nicht umkehrbare gründlich prüfen.',
          '<b>Bauchgefühl-Check:</b> Wenn das Ergebnis der Matrix dich enttäuscht, sagt dir das etwas – vielleicht fehlt ein Kriterium.',
        ])));
      const sel = (val, onch) => h('select', { onchange: e => onch(+e.target.value) }, [1, 2, 3, 4, 5].map(v => h('option', { value: String(v), selected: v === val }, String(v))));
      const save = () => store.set('matrix17', st);
      const render = () => {
        box.innerHTML = '';
        const t = h('table', { class: 'matrix' });
        put(t, h('tr', {}, h('th', {}, 'Kriterium'), h('th', {}, 'Gewicht'), st.opts.map((o, j) => h('th', {}, h('div', { class: 'cell' },
          h('input', { value: o, oninput: e => { st.opts[j] = e.target.value; save(); calc(); } }),
          st.opts.length > 2 ? h('button', { class: 'x', title: 'Option löschen', onclick: () => { st.opts.splice(j, 1); st.sc.forEach(r => r.splice(j, 1)); save(); render(); } }, '×') : null)))));
        st.crit.forEach((c, i) => put(t, h('tr', {},
          h('td', {}, h('div', { class: 'cell' }, h('input', { value: c[0], oninput: e => { c[0] = e.target.value; save(); } }),
            st.crit.length > 1 ? h('button', { class: 'x', title: 'Kriterium löschen', onclick: () => { st.crit.splice(i, 1); st.sc.splice(i, 1); save(); render(); } }, '×') : null)),
          h('td', {}, sel(c[1], v => { c[1] = v; save(); calc(); })),
          st.opts.map((_, j) => h('td', {}, sel(st.sc[i][j], v => { st.sc[i][j] = v; save(); calc(); }))))));
        put(box, card('Deine Matrix', h('div', { class: 'tablewrap' }, t), h('div', { class: 'btnrow' },
          st.opts.length < 4 ? h('button', { class: 'btn alt', onclick: () => { st.opts.push('Option ' + (st.opts.length + 1)); st.sc.forEach(r => r.push(3)); save(); render(); } }, '+ Option') : null,
          st.crit.length < 7 ? h('button', { class: 'btn alt', onclick: () => { st.crit.push(['Neues Kriterium', 3]); st.sc.push(st.opts.map(() => 3)); save(); render(); } }, '+ Kriterium') : null)));
        calc();
      };
      const calc = () => {
        const max = st.crit.reduce((s, c) => s + c[1] * 5, 0) || 1;
        const tot = st.opts.map((_, j) => st.crit.reduce((s, c, i) => s + c[1] * st.sc[i][j], 0));
        const best = Math.max(...tot);
        out.innerHTML = '';
        put(out, card('Ergebnis', st.opts.map((o, j) => h('div', { class: 'hbar' + (tot[j] === best ? ' best' : '') },
          h('span', {}, (tot[j] === best ? '🏆 ' : '') + (o || `Option ${j + 1}`)), h('i', { style: `width:${tot[j] / max * 100}%` }), h('b', {}, `${Math.round(tot[j] / max * 100)} %`)))));
      };
      render();
    },
  },

  /* ---------- 4. Prokrastination ---------- */
  {
    id: 'fokus', icon: '⏱️', color: '#8338ec', skill: 'Prokrastination besiegen', title: 'Fokus-Timer',
    render(body) {
      let iv = null, endAt = 0, left = 25 * 60, mode = 'work', running = false, workMin = 25;
      const STATS = 'pomo17';
      const stats = () => { const s = store.get(STATS, {}); return s[today()] || 0; };
      const frog = h('input', { placeholder: 'z. B. Bewerbung anfangen, Referat Folie 1', value: store.get('frog17', '') });
      frog.addEventListener('input', () => store.set('frog17', frog.value));
      const clock = h('div', { class: 'clock17' });
      const label = h('div', { class: 'muted center' });
      const count = h('div', { class: 'center' });
      const startBtn = h('button', { class: 'btn' }, 'Start');
      const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      const paint = () => {
        clock.textContent = fmt(Math.max(0, Math.round(left)));
        label.textContent = mode === 'work' ? '🎯 Fokus-Phase – Handy weg, nur diese eine Aufgabe.' : '☕ Pause – aufstehen, trinken, nicht scrollen.';
        count.textContent = `Heute geschafft: ${'🍅'.repeat(Math.min(stats(), 12)) || '–'} (${stats()})`;
        startBtn.textContent = running ? 'Pause' : 'Start';
        clock.classList.toggle('brk', mode !== 'work');
      };
      const stop = () => { if (iv) { clearInterval(iv); iv = null; } running = false; };
      const tick = () => {
        left = (endAt - Date.now()) / 1000;
        if (left <= 0) {
          stop();
          ['C5', 'E5', 'G5'].forEach((n, i) => pianoNote(freq(n), i * 0.15, null, 0.4));
          if (mode === 'work') {
            const s = store.get(STATS, {}); s[today()] = (s[today()] || 0) + 1; store.set(STATS, s);
            mode = 'break'; left = (stats() % 4 === 0 ? 15 : 5) * 60;
          } else { mode = 'work'; left = workMin * 60; }
        }
        paint();
      };
      startBtn.addEventListener('click', () => {
        audio();
        if (running) { stop(); paint(); return; }
        running = true; endAt = Date.now() + left * 1000;
        iv = setInterval(tick, 250); paint();
      });
      const dur = h('div', { class: 'seg' }, [15, 25, 50].map(m => h('button', {
        class: m === 25 ? 'on' : '', onclick: e => {
          stop(); workMin = m; mode = 'work'; left = m * 60;
          dur.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === e.currentTarget)); paint();
        },
      }, `${m} min`)));
      const why = h('div');
      const REASONS = [
        ['😵 Zu groß', 'Zerlege die Aufgabe in einen Schritt, der höchstens 5 Minuten dauert – z. B. „Datei anlegen und Überschrift schreiben“. Anfangen ist der schwerste Teil.'],
        ['😨 Angst, es nicht gut genug zu machen', 'Erlaube dir einen schlechten ersten Entwurf. Perfektionismus ist einer der häufigsten Gründe fürs Aufschieben. Überarbeiten kannst du später.'],
        ['🥱 Langweilig', 'Kopple die Aufgabe an etwas Angenehmes (Lieblingsmusik nur beim Lernen) oder belohne dich nach dem Timer.'],
        ['📱 Ständig abgelenkt', 'Handy in einen anderen Raum, nicht nur umdrehen. Schon ein sichtbares Handy kann die Konzentration verringern.'],
        ['❓ Unklar, was zu tun ist', 'Schreib den nächsten konkreten Schritt auf – als Tätigkeit mit Verb: „3 Quellen für das Referat suchen“.'],
      ];
      put(body, 
        card('Dein „Frosch“ für heute', h('p', { class: 'muted' }, '„Eat the frog“: Erledige die unangenehmste Aufgabe zuerst – danach wird der Tag leichter.'), frog),
        card('Pomodoro-Timer', dur, clock, label, h('div', { class: 'btnrow' }, startBtn,
          h('button', { class: 'btn alt', onclick: () => { stop(); mode = 'work'; left = workMin * 60; paint(); } }, 'Zurücksetzen')), count),
        card('Warum schiebe ich gerade auf?', h('p', { class: 'muted' }, 'Aufschieben ist meistens keine Faulheit, sondern ein Gefühlsproblem: Wir weichen etwas Unangenehmem aus. Wähle, was passt:'),
          h('div', { class: 'chips' }, REASONS.map(([t, a]) => h('button', { class: 'chip', onclick: () => { why.innerHTML = ''; put(why, h('div', { class: 'result ok' }, h('b', {}, t + ': '), a)); } }, t))), why),
        card('Die 2-Minuten-Regel', h('p', {}, 'Was weniger als 2 Minuten dauert, sofort erledigen. Und für große Aufgaben: Nimm dir vor, nur 2 Minuten anzufangen. Meistens machst du dann weiter.')));
      paint();
      return stop;
    },
  },

  /* ---------- 5. Metakognition ---------- */
  {
    id: 'meta', icon: '🪞', color: '#06aed5', skill: 'Metakognition', title: 'Wie gut kennst du dein Wissen?',
    render(body) {
      return tabs(body, [
        ['Kalibrierungs-Test', function test(pane) {
          const Q = [
            ['Welcher Planet ist größer?', ['Saturn', 'Neptun'], 0],
            ['Welches Land hat mehr Einwohner?', ['Brasilien', 'Indonesien'], 1],
            ['Welcher Berg ist höher?', ['Zugspitze', 'Mont Blanc'], 1],
            ['Was war zuerst?', ['Gutenbergs Buchdruck', 'Kolumbus erreicht Amerika'], 0],
            ['Kocht Wasser auf dem Mount Everest …', ['unter 100 °C', 'über 100 °C'], 0],
            ['Wer hat mehr Knochen?', ['Ein Neugeborenes', 'Ein Erwachsener'], 0],
            ['Welches Land hat die größere Fläche?', ['Australien', 'USA'], 1],
            ['Wie lange braucht Sonnenlicht bis zur Erde?', ['etwa 8 Sekunden', 'etwa 8 Minuten'], 1],
            ['Was hat mehr Kalorien pro Gramm?', ['Zucker', 'Fett'], 1],
            ['Hauptstadt von Australien?', ['Sydney', 'Canberra'], 1],
            ['Größtes Organ des Menschen?', ['Leber', 'Haut'], 1],
            ['Welcher Ozean ist größer?', ['Atlantik', 'Pazifik'], 1],
          ];
          const qs = shuffle(Q).slice(0, 10);
          const ans = [];
          const view = h('div');
          put(pane, card('So funktioniert’s', h('p', {}, 'Beantworte 10 Fragen und gib jeweils an, wie sicher du dir bist. Am Ende siehst du, ob du dich über- oder unterschätzt. Das nennt man Kalibrierung – eine Kernfähigkeit guter Lerner und Entscheider.')), view);
          let i = 0, pick = null;
          const show = () => {
            view.innerHTML = '';
            if (i >= qs.length) return result();
            const [q, o] = qs[i];
            pick = null;
            const conf = h('div', { class: 'seg conf' }, [50, 60, 70, 80, 90, 100].map(c => h('button', { disabled: true, onclick: () => { ans.push({ ok: pick === qs[i][2], c }); i++; show(); } }, c + ' %')));
            put(view, h('div', { class: 'progress' }, `${i + 1} / ${qs.length}`), h('p', { class: 'q' }, q),
              h('div', { class: 'opts' }, o.map((t, k) => h('button', {
                class: 'opt', onclick: e => {
                  pick = k;
                  e.currentTarget.parentNode.querySelectorAll('button').forEach(b => b.classList.toggle('sel', b === e.currentTarget));
                  conf.querySelectorAll('button').forEach(b => { b.disabled = false; });
                },
              }, t))),
              h('p', { class: 'muted' }, 'Wie sicher bist du? (50 % = geraten)'), conf);
          };
          const result = () => {
            const acc = ans.filter(a => a.ok).length / ans.length * 100;
            const avg = ans.reduce((s, a) => s + a.c, 0) / ans.length;
            const diff = avg - acc;
            const verdict = diff > 10 ? 'Du überschätzt dich etwas – du bist sicherer, als dein Wissen es hergibt. Das ist der häufigste Denkfehler überhaupt.'
              : diff < -10 ? 'Du unterschätzt dich – du weißt mehr, als du denkst. Trau dir mehr zu!'
              : 'Sehr gut kalibriert! Deine Sicherheit passt zu deinem Wissen.';
            const buckets = [[50, 60], [70, 80], [90, 100]].map(([a, b]) => {
              const xs = ans.filter(x => x.c >= a && x.c <= b);
              return h('tr', {}, h('td', {}, `${a}–${b} %`), h('td', {}, String(xs.length)), h('td', {}, xs.length ? pct(xs.filter(x => x.ok).length / xs.length * 100) : '–'));
            });
            put(view, card('Auswertung',
              h('div', { class: 'stats' }, h('div', {}, h('small', {}, 'Richtig'), h('b', {}, pct(acc))), h('div', {}, h('small', {}, 'Ø Sicherheit'), h('b', {}, pct(avg)))),
              h('p', { class: 'q' }, verdict),
              h('table', { class: 'matrix' }, h('tr', {}, h('th', {}, 'Sicherheit'), h('th', {}, 'Fragen'), h('th', {}, 'Davon richtig')), buckets),
              h('p', { class: 'muted' }, 'Gut kalibriert heißt: Bei „80 % sicher“ liegst du in etwa 8 von 10 Fällen richtig.'),
              h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { pane.innerHTML = ''; test(pane); } }, 'Neuer Test'))));
          };
          show();
        }],
        ['Besser lernen', pane => {
          put(pane, 
            card('Was nachweislich wirkt', ul([
              '<b>Abfragen statt Wiederlesen:</b> Buch zu, aufschreiben was du noch weißt, dann prüfen. Das Erinnern selbst festigt das Wissen.',
              '<b>Verteilt lernen:</b> Heute, morgen, in 3 Tagen, in einer Woche wiederholen – statt alles am Abend vorher.',
              '<b>Mischen:</b> Verschiedene Aufgabentypen abwechseln, statt 20 gleiche hintereinander.',
              '<b>Erklären:</b> Erkläre den Stoff einem anderen (oder einem Kuscheltier). Wo du stockst, ist deine Lücke.',
            ])),
            card('Was sich gut anfühlt, aber wenig bringt', ul([
              '<b>Mehrfaches Durchlesen:</b> Der Text wirkt vertraut – das ist aber nicht dasselbe wie können.',
              '<b>Viel Markieren:</b> Fühlt sich produktiv an, bringt allein kaum etwas.',
              '<b>Multitasking:</b> Lernen mit Social Media nebenbei kostet mehr Zeit und bringt weniger.',
            ])),
            card('Die 3 Metakognitions-Fragen', ul(['<b>Vorher:</b> Was ist mein Ziel? Welche Strategie nutze ich?', '<b>Währenddessen:</b> Verstehe ich das wirklich? Woran merke ich das?', '<b>Danach:</b> Was hat funktioniert? Was mache ich nächstes Mal anders?'])));
        }],
      ]);
    },
  },

  /* ---------- 6. Denkfehler ---------- */
  {
    id: 'bias', icon: '🎭', color: '#5e60ce', skill: 'Kognitive Verzerrungen', title: 'Denkfallen-Quiz',
    render(body) {
      const items = [
        { q: 'Ein Schläger und ein Ball kosten zusammen 1,10 €. Der Schläger kostet 1 € mehr als der Ball. Was kostet der Ball?', o: ['10 Cent', '5 Cent', '1 Cent'], a: 1,
          ex: 'Bei 10 Cent würde der Schläger 1,10 € kosten – zusammen 1,20 €. Richtig sind 5 Cent (Schläger 1,05 €). <b>Schnelles Denken</b> liefert eine Antwort, die sich richtig anfühlt. Bei wichtigen Fragen: kurz nachrechnen.' },
        { q: 'Ein Händler sagt: „Normalerweise 500 €, nur heute 300 €!“ Warum fühlt sich 300 € so günstig an?', o: ['Weil 300 € objektiv billig ist', 'Weil die 500 € als Anker im Kopf hängen bleiben', 'Weil Händler nie lügen'], a: 1,
          ex: 'Das ist der <b>Ankereffekt</b>: Die erste Zahl prägt unser Urteil, auch wenn sie willkürlich ist. Frag dich: Was wäre mir das Ding wert, wenn ich die 500 € nie gesehen hätte?' },
        { q: 'Du hast 12 € fürs Kino bezahlt. Nach 30 Minuten ist der Film furchtbar. Was ist rational?', o: ['Bleiben – sonst sind die 12 € verschwendet', 'Gehen, wenn du die restliche Zeit lieber anders nutzt'], a: 1,
          ex: 'Die 12 € sind in beiden Fällen weg. Das nennt man <b>versunkene Kosten</b>. Entscheide nur danach, was ab jetzt besser ist. Gilt auch für Beziehungen, Projekte und Spiele, in die man „schon so viel investiert hat“.' },
        { q: 'Regel: „Hat eine Karte vorne eine gerade Zahl, ist sie hinten rot.“ Vor dir liegen: 3 · 8 · rot · braun. Welche Karten musst du umdrehen, um die Regel zu prüfen?', o: ['8 und rot', '8 und braun', 'nur die 8', '3 und rot'], a: 1,
          ex: 'Die 8 (ist sie hinten rot?) und die braune Karte (steht vorne etwa eine gerade Zahl?). Die rote Karte kann die Regel nicht widerlegen. Die meisten wählen „rot“ – wir suchen lieber <b>Bestätigung</b> als Widerlegung (Bestätigungsfehler).' },
        { q: 'Eine Krankheit hat 1 von 10.000 Menschen. Ein Test erkennt sie fast immer, schlägt aber bei 1 % der Gesunden fälschlich an. Dein Test ist positiv. Wie wahrscheinlich bist du krank?', o: ['ca. 99 %', 'ca. 50 %', 'ca. 1 %'], a: 2,
          ex: 'Von 10.000 Menschen ist 1 krank (positiv). Von den 9.999 Gesunden testen aber rund 100 falsch positiv. Also ist nur etwa 1 von 101 Positiven wirklich krank. Wer die <b>Basisrate</b> ignoriert, liegt komplett daneben – auch viele Ärzte.' },
        { q: 'Was ist pro zurückgelegtem Kilometer sicherer?', o: ['Autofahren', 'Fliegen'], a: 1,
          ex: 'Fliegen ist pro Kilometer um ein Vielfaches sicherer. Flugzeugabstürze sind aber spektakulär und in den Nachrichten – deshalb überschätzen wir sie. Das ist die <b>Verfügbarkeitsheuristik</b>: Was uns leicht einfällt, halten wir für häufiger.' },
        { q: 'Im 2. Weltkrieg zeigten zurückgekehrte Flugzeuge viele Einschusslöcher an den Flügeln, kaum am Motor. Wo sollte man Panzerung anbringen?', o: ['An den Flügeln – dort sind die Löcher', 'Am Motor – dort, wo keine Löcher sind'], a: 1,
          ex: 'Flugzeuge mit Treffern am Motor kamen gar nicht zurück. Man sah nur die „Überlebenden“. Das ist der <b>Survivorship Bias</b>. Er steckt auch in „Er hat die Schule abgebrochen und ist Milliardär geworden“ – die vielen anderen sieht man nicht.' },
        { q: 'Eine Münze zeigte 6-mal hintereinander „Kopf“. Wie wahrscheinlich ist beim nächsten Wurf „Zahl“?', o: ['Mehr als 50 % – „Zahl“ ist jetzt dran', 'Genau 50 %', 'Weniger als 50 % – „Kopf“ hat einen Lauf'], a: 1,
          ex: 'Die Münze hat kein Gedächtnis: 50 %. Der Glaube, etwas sei „jetzt dran“, heißt <b>Spielerfehlschluss</b> – er kostet Menschen im Casino und bei Sportwetten viel Geld.' },
        { q: 'Arzt A: „90 % überleben die OP.“ Arzt B: „10 % sterben bei der OP.“ Welche OP ist sicherer?', o: ['Die von Arzt A', 'Die von Arzt B', 'Beide gleich'], a: 2,
          ex: 'Es ist dieselbe Information, nur anders verpackt. Trotzdem stimmen viel mehr Menschen bei „90 % überleben“ zu. Das ist der <b>Framing-Effekt</b> – Werbung und Politik nutzen ihn ständig.' },
      ];
      const view = h('div');
      put(body, view);
      const run = () => quizRunner(view, shuffle(items), {
        onDone: (r, n) => {
          put(view, card(`Du hast ${r} von ${n} Denkfallen erkannt`,
            h('p', {}, r >= 7 ? 'Stark! Du denkst schon sehr bewusst.' : r >= 4 ? 'Guter Anfang. Die meisten Menschen tappen in mehr als die Hälfte dieser Fallen.' : 'Völlig normal – genau dafür ist das Quiz da. Jetzt kennst du die Fallen.'),
            h('p', { class: 'muted' }, 'Wichtig: Diese Denkfehler hat jeder. Klug ist nicht, wer sie nie macht, sondern wer sie kennt und bei wichtigen Entscheidungen kurz innehält.'),
            h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: run }, 'Nochmal'))));
        },
      });
      run();
    },
  },

  /* ---------- 7. Geopolitik ---------- */
  {
    id: 'geo', icon: '🌍', color: '#2a9d4a', skill: 'Geopolitik', title: 'Weltlage verstehen',
    render(body) {
      return tabs(body, [
        ['Berater-Spiel', pane => {
          const EVENTS = [
            { t: '⛽ Energie', q: 'Ein großer Nachbarstaat bietet billiges Gas an – aber er wäre fast euer einziger Lieferant.', o: [
              ['Alles von dort kaufen – billig ist gut', { W: 2, S: -2, E: -1 }, 'Kurzfristig billig, aber gefährlich abhängig. Deutschland bezog bis 2022 einen großen Teil seines Gases aus Russland – nach dem Angriff auf die Ukraine wurde das zum Problem.'],
              ['Mehrere Lieferanten, auch wenn es teurer ist', { W: -1, S: 1, E: 1 }, 'Diversifizieren kostet Geld, macht aber weniger erpressbar.'],
              ['Massiv in eigene erneuerbare Energie investieren', { W: -2, E: 2, S: 1 }, 'Teuer am Anfang, langfristig unabhängiger.']] },
            { t: '🌊 Katastrophe', q: 'Ein Nachbarland wird von einer Flut getroffen und bittet um Hilfe.', o: [
              ['Großzügig helfen', { W: -1, P: 2 }, 'Hilfe kostet, schafft aber Vertrauen und Freunde, die später auch dir helfen.'],
              ['Ablehnen – wir haben eigene Probleme', { P: -2 }, 'Spart Geld, aber Partner erinnern sich daran.']] },
            { t: '🏗️ Investition', q: 'Eine Großmacht will euren wichtigsten Hafen modernisieren – und dafür Mitspracherecht.', o: [
              ['Annehmen – kostenlose Modernisierung!', { W: 2, S: -2 }, 'Wirtschaftlich attraktiv, aber kritische Infrastruktur gerät unter fremden Einfluss.'],
              ['Mit verbündeten Partnern selbst bauen', { W: 1, P: 1, S: 1 }, 'Langsamer, aber ihr behaltet die Kontrolle.'],
              ['Ablehnen und nichts tun', { W: -1 }, 'Kein Risiko, aber auch kein Fortschritt.']] },
            { t: '🚗 Handelsstreit', q: 'Ein großes Land erhebt plötzlich hohe Zölle auf eure Autos.', o: [
              ['Sofort Gegenzölle', { W: -1, P: -1 }, 'Zeigt Stärke, aber Handelskriege schaden meist beiden Seiten.'],
              ['Verhandeln und Kompromiss suchen', { P: 1, W: 0 }, 'Dauert, bewahrt aber die Beziehung.'],
              ['Neue Absatzmärkte in anderen Ländern suchen', { W: 1, P: 1 }, 'Macht euch weniger abhängig von einem einzigen Markt.']] },
            { t: '💾 Chips', q: 'Weltweit fehlen Computerchips. Eure Fabriken stehen still.', o: [
              ['Eine eigene Chipfabrik mit viel Steuergeld bauen', { W: -2, S: 2 }, 'Sehr teuer, dauert Jahre – macht aber unabhängiger.'],
              ['Mit Partnerländern gemeinsam Lieferketten absichern', { P: 1, S: 1, W: -1 }, 'Geteilte Kosten, geteiltes Risiko.'],
              ['Abwarten, bis der Markt es regelt', { W: -2 }, 'Billig, aber die Fabriken stehen weiter still.']] },
            { t: '📱 Desinformation', q: 'Vor einer Wahl verbreiten sich im Netz massenhaft gefälschte Nachrichten aus dem Ausland.', o: [
              ['Medienbildung in Schulen stärken', { S: 1, W: -1 }, 'Wirkt langsam, aber nachhaltig: Menschen erkennen Fakes selbst.'],
              ['Plattformen zur Löschung verpflichten', { S: 1, P: 0 }, 'Schnell, aber heikel: Wer entscheidet, was falsch ist?'],
              ['Ignorieren', { S: -2 }, 'Vertrauen in Wahlen und Medien kann dauerhaft leiden.']] },
          ];
          const NAMES = { W: '💶 Wohlstand', S: '🛡️ Sicherheit', P: '🤝 Partner', E: '⚡ Energie' };
          let m, i;
          const meters = h('div', { class: 'meters' });
          const view = h('div');
          put(pane, card('Du bist Berater*in von „Nordland“', h('p', {}, 'Ein kleines Land mit Industrie, aber wenig Rohstoffen. Triff 6 Entscheidungen. Es gibt keine perfekten Antworten – nur Abwägungen. Genau darum geht es in der Geopolitik.')), meters, view);
          const paint = () => {
            meters.innerHTML = '';
            Object.keys(NAMES).forEach(k => put(meters, h('div', { class: 'meter' }, h('span', {}, NAMES[k]), h('div', { class: 'mbar' }, h('i', { style: `width:${m[k] * 10}%;background:${m[k] <= 3 ? '#e63946' : m[k] >= 7 ? '#2a9d4a' : '#ffb703'}` })), h('b', {}, String(m[k])))));
          };
          const show = () => {
            view.innerHTML = '';
            if (i >= EVENTS.length) {
              const sum = Object.values(m).reduce((a, b) => a + b, 0);
              const low = Object.keys(m).filter(k => m[k] <= 3).map(k => NAMES[k]);
              put(view, card('Bilanz deiner Amtszeit', h('p', { class: 'q' }, sum >= 24 ? 'Nordland steht stabil da. Du hast Risiken gestreut und Partner gewonnen.' : sum >= 18 ? 'Nordland kommt durch – mit ein paar Schwachstellen.' : 'Nordland ist angeschlagen. Kurzfristige Vorteile haben langfristig Probleme gebracht.'),
                low.length ? h('p', {}, 'Schwachstellen: ' + low.join(', ')) : null,
                h('p', { class: 'muted' }, 'Merke: Abhängigkeit ist bequem und billig – bis sie zur Waffe wird. Länder mit vielen Partnern und gestreuten Lieferanten sind schwerer zu erpressen.'),
                h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: start }, 'Neue Amtszeit'))));
              return;
            }
            const ev = EVENTS[i];
            put(view, card(`${i + 1}/${EVENTS.length} · ${ev.t}`, h('p', { class: 'q' }, ev.q),
              h('div', { class: 'opts' }, ev.o.map(([t, eff, ex]) => h('button', {
                class: 'opt', onclick: e => {
                  e.currentTarget.parentNode.querySelectorAll('button').forEach(b => { b.disabled = true; });
                  e.currentTarget.classList.add('sel');
                  Object.entries(eff).forEach(([k, v]) => { m[k] = Math.max(0, Math.min(10, m[k] + v)); });
                  paint(); tone(600, 0.1, 'triangle', 0.15);
                  const ch = Object.entries(eff).filter(([, v]) => v).map(([k, v]) => `${NAMES[k]} ${v > 0 ? '+' : ''}${v}`).join(' · ');
                  put(view, h('div', { class: 'result ok' }, h('b', {}, ch ? ch + ' — ' : ''), ex),
                    h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: () => { i++; show(); } }, 'Weiter →')));
                },
              }, t)))));
          };
          const start = () => { m = { W: 5, S: 5, P: 5, E: 5 }; i = 0; paint(); show(); };
          start();
        }],
        ['Nadelöhre der Welt', pane => {
          const CP = [
            ['Straße von Hormus', 'zwischen Iran und Oman', 'Rund ein Fünftel des weltweit verbrauchten Öls wird hier per Tanker transportiert. Spannungen in der Region lassen sofort den Ölpreis steigen.'],
            ['Straße von Malakka', 'zwischen Malaysia und Indonesien', 'Kürzester Seeweg zwischen Indischem Ozean und Pazifik. Ein großer Teil der Öl-Importe Chinas, Japans und Südkoreas fährt hier durch.'],
            ['Suezkanal', 'Ägypten', 'Verbindet Mittelmeer und Rotes Meer. 2021 blockierte das Containerschiff „Ever Given“ den Kanal sechs Tage lang – weltweit stockten Lieferungen.'],
            ['Panamakanal', 'Panama', 'Verbindet Atlantik und Pazifik. 2023 musste wegen Dürre die Zahl der Durchfahrten begrenzt werden – auch das Klima ist ein geopolitischer Faktor.'],
            ['Bosporus', 'Türkei', 'Einziger Seeweg vom Schwarzen Meer ins Mittelmeer – wichtig für Getreide aus der Ukraine und Russland.'],
            ['Taiwanstraße', 'zwischen China und Taiwan', 'Eine der meistbefahrenen Schifffahrtsrouten. Taiwan stellt einen großen Teil der modernsten Computerchips der Welt her – ein Konflikt hätte weltweite Folgen.'],
          ];
          put(pane, card('Warum ein paar Meerengen die Welt bewegen', h('p', {}, 'Der Großteil des Welthandels läuft über das Meer. An einigen engen Stellen ballt sich der Verkehr – wer sie kontrolliert oder blockiert, beeinflusst Preise auf der ganzen Welt.')),
            ...CP.map(([n, w, t]) => h('details', { class: 'card det' }, h('summary', {}, h('b', {}, '⚓ ' + n), h('small', {}, ' · ' + w)), h('p', {}, t))),
            h('p', { class: 'muted small' }, 'Zahlen gerundet; aktuelle Werte schwanken je nach Jahr und Quelle.'));
        }],
        ['Grundbegriffe', pane => {
          put(pane, card('Die Werkzeugkiste der Geopolitik', ul([
            '<b>Geografie:</b> Lage, Küsten, Gebirge und Nachbarn prägen die Interessen eines Landes seit Jahrhunderten.',
            '<b>Rohstoffe:</b> Öl, Gas, Lithium, seltene Erden – wer sie hat oder verarbeitet, hat Einfluss.',
            '<b>Abhängigkeiten:</b> Handel verbindet und schafft Wohlstand – kann aber auch als Druckmittel genutzt werden.',
            '<b>Bündnisse:</b> Zusammenschlüsse wie NATO oder EU machen kleine Länder gemeinsam stark.',
            '<b>Sanktionen:</b> Wirtschaftliche Strafmaßnahmen statt Militär – wirken oft langsam und treffen auch den, der sie verhängt.',
            '<b>Soft Power:</b> Einfluss durch Anziehungskraft: Kultur, Universitäten, Filme, Werte.',
          ])), card('Nachrichten besser verstehen', h('p', {}, 'Frag bei jeder Weltnachricht: Wer will was? Wer ist von wem abhängig? Welche Rolle spielen Geografie und Rohstoffe? Und: Aus wessen Sicht wird berichtet?')));
        }],
      ]);
    },
  },

  /* ---------- 8. Epigenetik ---------- */
  {
    id: 'epi', icon: '🧬', color: '#80b918', skill: 'Epigenetik', title: 'Gene & Lebensstil',
    render(body) {
      return tabs(body, [
        ['Wie funktioniert das?', pane => {
          const genes = ['Gen A', 'Gen B', 'Gen C', 'Gen D', 'Gen E', 'Gen F'];
          const on = genes.map(() => true);
          const strip = h('div', { class: 'genes' });
          const paint = () => {
            strip.innerHTML = '';
            genes.forEach((g, k) => put(strip, h('button', {
              class: 'gene' + (on[k] ? ' on' : ''), onclick: () => { on[k] = !on[k]; tone(on[k] ? 800 : 300, 0.1, 'sine', 0.15); paint(); },
            }, h('b', {}, g), h('small', {}, on[k] ? '💡 aktiv' : '🏷️ stumm'))));
          };
          paint();
          put(pane, 
            card('Die DNA ist das Buch – Epigenetik sind die Lesezeichen', h('p', {}, 'Fast jede Zelle deines Körpers hat dieselbe DNA. Trotzdem ist eine Hautzelle keine Nervenzelle. Der Unterschied: Welche Gene gelesen werden. Chemische Markierungen (z. B. Methylgruppen) an der DNA und an ihren „Verpackungs-Proteinen“ schalten Gene leiser oder lauter – ohne den Text zu verändern.')),
            card('Probier’s aus: Gene stumm schalten', h('p', { class: 'muted' }, 'Tippe auf ein Gen, um eine Markierung anzuhängen oder zu entfernen. (Vereinfachte Darstellung)'), strip),
            card('Was beeinflusst die Markierungen?', ul([
              '<b>Gut belegt:</b> Rauchen hinterlässt deutlich messbare epigenetische Spuren. Auch Alter verändert die Muster so regelmäßig, dass man daraus eine „epigenetische Uhr“ ablesen kann.',
              '<b>Zusammenhänge gefunden:</b> Bewegung, Ernährung, Schlaf und chronischer Stress stehen in Studien mit epigenetischen Veränderungen in Verbindung.',
              '<b>Zwillinge:</b> Eineiige Zwillinge haben fast identische DNA – ihre epigenetischen Muster werden im Laufe des Lebens aber unterschiedlicher.',
              '<b>Noch offen:</b> Wie stark das beim Menschen an Kinder weitervererbt wird, ist umstritten. Die meisten Markierungen werden bei der Entstehung neuen Lebens weitgehend gelöscht.',
            ])));
        }],
        ['Mythos oder Fakt?', pane => {
          const items = [
            { q: 'Epigenetik verändert die Buchstabenfolge der DNA.', o: ['Mythos', 'Fakt'], a: 0, ex: 'Die DNA-Sequenz bleibt gleich. Epigenetik bestimmt, welche Abschnitte abgelesen werden.' },
            { q: 'Rauchen hinterlässt messbare epigenetische Spuren.', o: ['Mythos', 'Fakt'], a: 1, ex: 'Gut belegt – an bestimmten Genorten kann man Raucher sogar ziemlich zuverlässig erkennen. Nach dem Aufhören bilden sich viele Veränderungen über Jahre teilweise zurück.' },
            { q: 'Eineiige Zwillinge haben ihr Leben lang exakt gleiche epigenetische Muster.', o: ['Mythos', 'Fakt'], a: 0, ex: 'Die Muster driften mit dem Alter auseinander – je unterschiedlicher der Lebensstil, desto stärker.' },
            { q: 'Mit positivem Denken kann man über Epigenetik jede Krankheit heilen.', o: ['Mythos', 'Fakt'], a: 0, ex: 'Klingt gut, ist aber unseriös. Vorsicht bei Produkten und Coaches, die mit „Epigenetik“ Heilsversprechen machen.' },
            { q: 'Das Alter lässt sich an epigenetischen Mustern ziemlich genau ablesen.', o: ['Mythos', 'Fakt'], a: 1, ex: 'Sogenannte epigenetische Uhren schätzen das Alter oft auf wenige Jahre genau.' },
            { q: 'Alle epigenetischen Veränderungen werden an die eigenen Kinder vererbt.', o: ['Mythos', 'Fakt'], a: 0, ex: 'Die meisten Markierungen werden bei Ei- und Samenzellen weitgehend zurückgesetzt. Ob und wie viel beim Menschen weitergegeben wird, wird noch erforscht.' },
          ];
          const view = h('div');
          put(pane, view);
          const run = () => quizRunner(view, shuffle(items), {
            onDone: (r, n) => put(view, card(`${r} von ${n} richtig`, h('p', {}, 'Faustregel: Deine Gene sind kein Schicksal, aber auch kein Wunschkonzert. Schlaf, Bewegung, Ernährung und nicht rauchen sind die gut belegten Stellschrauben.'),
              h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: run }, 'Nochmal')))),
          });
          run();
        }],
      ]);
    },
  },
];

buildMenu('menu17', 'game17', '🧑 Skills Lab', '8 Fähigkeiten, die in der Schule oft zu kurz kommen – zum Ausprobieren, Rechnen und Nachdenken.', GAMES17,
  'Alle Eingaben bleiben nur auf diesem Gerät gespeichert.');
