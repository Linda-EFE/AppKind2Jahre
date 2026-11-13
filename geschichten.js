'use strict';
/* =====================================================================
   7 JAHRE – 📚 Geschichten
   Selbst erfundene Vorlese-Geschichten mit Frauenstimme (abschaltbar)
   und einem Gesprächsfenster („Mit Claude reden“).
   Nutzt h(), put(), store, sayKid(), cheer(), tone() aus kids7.js / app.js.
   ===================================================================== */
(function () {
  /* ---------------- Die Geschichten ---------------- */
  // Jede Seite: Bild (Emoji-Szene), Hintergrund, Absätze, optional eine Frage mit zwei Antworten
  const STORIES = [{
    id: 'sternenstein',
    title: 'Die Herde und der Sternen-Stein',
    sub: 'Eine Eiszeit-Abenteuer-Geschichte – und Oma ist immer dabei!',
    cover: '🦣🦥👵🐯☄️',
    cast: [['🦣', 'Manni', 'das große Mammut und der Chef der Herde'], ['🦣', 'Ellie', 'Mannis Frau, mutig und klug'], ['🦣', 'Peaches', 'die Tochter von Manni und Ellie'],
      ['🦣', 'Julian', 'Peaches’ fröhlicher Verlobter'], ['🦥', 'Sid', 'das tollpatschige Faultier'], ['👵', 'Oma', 'Sids Oma – frech, mutig und immer mittendrin'],
      ['🐯', 'Diego', 'der Säbelzahntiger'], ['🐯', 'Shira', 'Diegos Frau, eine flinke Tigerin'], ['🐭', 'Crash und Eddie', 'die zwei Opossum-Brüder und Spaßmacher'],
      ['🦦', 'Buck', 'das Wiesel mit der Augenklappe, ein Abenteurer'], ['🦙', 'Brooke', 'eine liebe Lama-Dame aus dem Kristalltal'], ['🦙', 'Shangri Lama', 'der Anführer im Kristalltal'],
      ['🐿️', 'Scrat', 'das Eichhörnchen, das immer seiner Eichel hinterherjagt'], ['🦅', 'Gavin, Gertie und Roger', 'drei Flug-Dinos, die erst frech sind']],
    pages: [
      { t: 'Ein Stern mit Schweif', pic: '🌌☄️🦣🦣🦥👵', bg: 'linear-gradient(#1e1b4b, #4338ca)', p: [
        'Es war ein warmer Abend in der Eiszeit. Manni und Ellie lagen im Gras und schauten in den Himmel. Heute war ihr Hochzeitstag, und Manni hatte extra einen Haufen süßer Beeren gesammelt.',
        'Plötzlich zischte ein heller Stern mit einem langen Schweif über den Himmel. Dann noch einer. Und noch einer! „Schaut mal, Sternschnuppen!“, rief Peaches. Ihr Verlobter Julian hüpfte vor Freude so hoch, dass die Erde wackelte.',
        'Doch dann plumpste ein kleiner, heißer Stein direkt neben Sid ins Gras. „Aua, aua, heiß!“, rief Sid und pustete auf seinen Zeh. Ein Stück weiter landete noch einer. Pling! Plong!',
        'Da kam Oma angehumpelt, mit ihrem Stock in der Hand. „Was ist denn hier los? Regnet es jetzt Steine? Na, dann komme ich mit, egal wohin ihr geht. Ich habe schon viel Schlimmeres erlebt – zum Beispiel Sids Kochkünste!“ Alle mussten lachen. Und von diesem Moment an war klar: Oma ist bei jedem Abenteuer dabei.',
      ] },
      { t: 'Buck und die Steintafel', pic: '🦦🪨📜☄️👵', bg: 'linear-gradient(#78350f, #d97706)', p: [
        'Am nächsten Morgen raschelte es im Gebüsch. Heraus sprang ein kleines Wiesel mit einer Augenklappe: Buck! „Freunde, wir haben ein riesiges Problem!“, rief er und hielt eine alte Steintafel hoch.',
        'Auf der Tafel war ein riesiger Stern-Stein gemalt. „Ein großer Meteorit fliegt auf uns zu“, erklärte Buck. „Die kleinen Steine von gestern waren nur seine Krümel. Aber hier steht auch, wie man ihn wegschubsen kann: mit den Zauber-Kristallen aus dem Kristalltal!“',
        'Diego und Shira spitzten die Ohren. Crash und Eddie, die beiden Opossums, hängten sich kopfüber an einen Ast und riefen: „Abenteuer! Abenteuer!“',
        'Manni runzelte die Stirn. „Das ist ein weiter und gefährlicher Weg. Oma, vielleicht bleibst du besser hier?“ Oma klopfte mit ihrem Stock auf seinen Rüssel. „Pah! Ich bin älter als alle Berge hier. Ich gehe vorne!“ Und so zog die ganze Herde los – Oma ganz vorne.',
      ] },
      { t: 'Über die blubbernden Quellen', pic: '♨️🌋👵🦯🦣🐯', bg: 'linear-gradient(#7f1d1d, #f97316)', q: { text: 'Wer soll über die blubbernden Steine vorangehen?', a: [['🐯 Diego', 'Diego springt los – aber der erste Stein wackelt! Schnell ruft Oma: „Stopp! Erst klopfen, dann hüpfen!“'], ['👵 Oma', 'Oma geht los und klopft vor jedem Schritt mit dem Stock auf den Boden. Tock, tock – hält! Tock, tock – wackelt!']] }, p: [
        'Bald kamen sie an ein Tal voller heißer Quellen. Überall blubberte und zischte es, und warmer Dampf stieg auf wie aus einem riesigen Kochtopf.',
        'Nur ein Weg aus Steinen führte hinüber. Aber welche Steine waren fest, und welche wackelten?',
        'Am Ende zeigte Oma allen den Weg. Mit ihrem Stock klopfte sie auf jeden Stein: „Der hier ist gut. Der da nicht. Der hier auch. Hopp, hopp, Herde!“ Einer nach dem anderen kamen sie trocken und sicher auf die andere Seite.',
        'Sid umarmte seine Oma. „Oma, du bist die Beste!“ – „Das weiß ich doch“, sagte Oma und grinste mit ihrem einzigen Zahn.',
      ] },
      { t: 'Das funkelnde Kristalltal', pic: '💎🦙🦙✨👵🦥', bg: 'linear-gradient(#6d28d9, #ec4899)', p: [
        'Hinter einem hohen Berg lag ein Tal, das glitzerte in allen Farben: das Kristalltal! Riesige Kristalle wuchsen dort wie Bäume, und die Luft roch nach Blumen.',
        'Dort wohnten fröhliche Lamas. Ihr Anführer, der Shangri Lama, begrüßte die Herde. Und eine Lama-Dame namens Brooke lächelte Sid an. Sid wurde ganz rot und stolperte vor Aufregung über seine eigenen Füße. Brooke lachte – aber freundlich. Die beiden wurden sofort Freunde.',
        'Der Shangri Lama schaute Oma an. „Die Kristalle machen müde Knochen wieder frisch. Bleib doch für immer hier, liebe Oma. Hier musst du nie wieder wandern!“',
        'Oma überlegte nur ganz kurz. Dann sagte sie: „Danke, das ist lieb. Aber meine Herde braucht mich. Und wisst ihr was? Abenteuer halten mich jung – nicht Kristalle!“ Sie nahm nur einen kleinen Kristall als Glücksbringer mit, und weiter ging es.',
      ] },
      { t: 'Der große Plan', pic: '📜🗺️🦦🦣🐯👵', bg: 'linear-gradient(#0f766e, #22c55e)', p: [
        'Buck breitete die Steintafel auf dem Boden aus. „Hört gut zu! Die Kristalle ziehen den Meteoriten an wie ein Magnet. Wenn wir sie mit einem riesigen Wasserstrahl hoch in den Himmel schießen, schubsen sie den Meteoriten von der Erde weg.“',
        '„Und wo kriegen wir so einen riesigen Wasserstrahl her?“, fragte Ellie. Buck zeigte auf einen großen Krater. „Da unten ist eine Riesen-Quelle! Wir müssen die Kristalle in den Krater bringen, bevor der Meteorit kommt.“',
        'Jeder bekam eine Aufgabe: Manni, Ellie, Peaches und Julian sollten die schweren Kristalle schieben. Diego und Shira sollten den schnellsten Weg finden. Crash und Eddie sollten Ausschau halten. Sid und Brooke sollten die kleinen Kristalle tragen.',
        '„Und ich?“, fragte Oma. Buck salutierte. „Du, Oma, bist die Chef-Kommandantin!“ Oma bekam eine Pfeife aus Schilfrohr. Trrrillll! „Alle Mann an die Arbeit!“',
      ] },
      { t: 'Die drei Flug-Dinos', pic: '🦅🦅🦅🫐👵', bg: 'linear-gradient(#0369a1, #7dd3fc)', q: { text: 'Die Flug-Dinos wollen die Kristalle stibitzen. Was soll Oma tun?', a: [['🫐 Beeren teilen', 'Oma hält Roger eine Handvoll süßer Beeren hin. „Hier, du siehst hungrig aus, mein Junge.“'], ['😠 Schimpfen', 'Oma schimpft los: „Ihr frechen Federbälle!“ – doch dann sieht sie, dass der kleine Roger ganz traurig guckt, und holt ein paar Beeren heraus.']] }, p: [
        'Plötzlich verdunkelte sich der Himmel. Drei Flug-Dinos kreisten über ihnen: der grummelige Gavin, die schlaue Gertie und der kleine Roger. „Diese Kristalle gehören jetzt uns!“, krächzte Gavin.',
        'Die Herde rückte eng zusammen. Was sollte jetzt passieren?',
        'Roger knabberte an den Beeren und machte große Augen. „So nett war noch nie jemand zu mir“, piepste er. „Wir wollten die Kristalle doch nur, weil wir auch Angst vor dem Meteoriten haben.“',
        '„Dann helft uns doch!“, sagte Oma. Gavin und Gertie schauten sich an. Dann nickten sie. Mit ihren großen Flügeln trugen die drei Dinos die Kristalle viel schneller zum Krater, als die Herde es je geschafft hätte.',
      ] },
      { t: 'Der riesige Wasserstrahl', pic: '🌋💧💎☄️🐿️🌰', bg: 'linear-gradient(#111827, #7c3aed)', p: [
        'Der Meteorit war jetzt so groß wie der Mond. Alle Kristalle lagen im Krater. Doch das Wasser blubberte nur leise vor sich hin. „Es fehlt noch etwas!“, rief Buck. „Ein letzter Kristall, ganz genau in der Mitte!“',
        'Alle suchten. Kein Kristall mehr da! Da hob Oma ihren kleinen Glücksbringer-Kristall hoch. Sie steckte ihn oben an ihren Stock – und warf den Stock wie einen Speer genau in die Mitte des Kraters. Treffer!',
        'Es rumpelte und brummte. Und dann – WUSCH! – schoss ein gigantischer Wasserstrahl in den Himmel, voller funkelnder Kristalle. Er traf den Meteoriten und schubste ihn zur Seite, weit, weit weg.',
        'Und ganz da oben im Weltall? Da hüpfte Scrat, das Eichhörnchen, auf dem Meteoriten herum, weil er seiner Eichel hinterhergejagt war. Er stolperte, die Eichel kullerte – und der Meteorit zerplatzte in tausend harmlose, glitzernde Sternschnuppen.',
      ] },
      { t: 'Ein Fest unter Sternschnuppen', pic: '🎉💍🦣🦣🦥🦙👵💃', bg: 'linear-gradient(#be185d, #f59e0b)', p: [
        'In dieser Nacht regnete es Sternschnuppen, so viele wie noch nie. Und weil alle so glücklich waren, feierten Peaches und Julian gleich ihre Hochzeit. Julian tanzte so wild, dass alle mittanzen mussten.',
        'Peaches und Julian wollten erst weit wegziehen. Aber nach diesem Abenteuer sagten sie: „Wir bleiben in der Nähe. Eine Herde gehört zusammen!“ Manni und Ellie strahlten.',
        'Der Shangri Lama schenkte Oma zum Dank einen neuen Stock mit einem glitzernden Kristall oben drauf. „Für die mutigste Oma der Eiszeit!“ Oma schwang den Stock wie eine Tanzpartnerin und tanzte mit Roger, dem kleinen Flug-Dino.',
        'Sid und Brooke saßen nebeneinander und schauten in den funkelnden Himmel. „Weißt du“, sagte Sid, „das Beste an Abenteuern ist, dass man sie zusammen erlebt.“ Und Oma rief: „Genau! Und das nächste Abenteuer kommt bestimmt!“ Ende.',
      ] },
    ],
  }];

  /* ---------------- Vorlesen mit Frauenstimme ---------------- */
  const FEMALE = ['katja', 'hedda', 'anna', 'petra', 'marlene', 'vicki', 'helena', 'sabine', 'katrin', 'lena', 'amala', 'seraphina', 'louisa', 'elke', 'ingrid', 'leonie', 'female', 'frau', 'google deutsch'];
  const MALE = ['stefan', 'markus', 'conrad', 'hans', 'yannick', 'killian', 'florian', 'daniel', 'günther', 'gunther', 'jonas', 'ralf', 'klaus', 'michael', 'male', 'mann', 'bernd'];
  const deVoices = () => ('speechSynthesis' in window ? speechSynthesis.getVoices() : []).filter(v => /^de/i.test(v.lang));
  const isFemale = v => FEMALE.some(n => v.name.toLowerCase().includes(n));
  const isMale = v => MALE.some(n => v.name.toLowerCase().includes(n));
  function storyVoice() {
    const list = deVoices(), want = store.get('story_voice', '');
    return list.find(v => v.voiceURI === want) || list.find(isFemale) || list.find(v => !isMale(v)) || list[0] || null;
  }
  let readTok = 0;
  function stopReading() { readTok++; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  // Liest Texte nacheinander; onPart(i) markiert den aktuellen Absatz
  function readAll(texts, onPart, onDone) {
    stopReading(); const tok = readTok;
    if (!('speechSynthesis' in window)) { if (onDone) onDone(); return; }
    const v = storyVoice();
    const next = i => {
      if (tok !== readTok) return;
      if (i >= texts.length) { if (onPart) onPart(-1); if (onDone) onDone(); return; }
      if (onPart) onPart(i);
      const u = new SpeechSynthesisUtterance(texts[i]);
      u.lang = 'de-DE'; try { if (v) u.voice = v; } catch (e) { /* Stimme nicht setzbar: Standard */ } u.rate = 0.92; u.pitch = 1.05;
      u.onend = () => setTimeout(() => next(i + 1), 250); u.onerror = () => next(i + 1);
      speechSynthesis.speak(u);
    };
    next(0);
  }

  /* ---------------- Gespräch: Claude (im Claude-Link) oder Geschichten-Hilfe ---------------- */
  let samplePromise = null;
  const getSample = () => samplePromise || (samplePromise = (window.claude && window.claude.use) ? window.claude.use('sample').catch(() => null) : Promise.resolve(null));
  let dictPromise = null;
  const getDictation = () => dictPromise || (dictPromise = (window.claude && window.claude.use) ? window.claude.use('dictation').catch(() => null) : Promise.resolve(null));
  // Antworten ohne Internet-KI: Stichwörter aus der Geschichte
  function offlineAnswer(q, story, page) {
    const s = q.toLowerCase();
    const hit = story.cast.find(([, n]) => n.toLowerCase().split(/ und |, /).some(part => s.includes(part.trim().toLowerCase())));
    if (/oma/.test(s) && /bleib|kristalltal|warum/.test(s)) return 'Oma bleibt nicht im Kristalltal, weil ihre Herde sie braucht! Sie sagt: Abenteuer halten mich jung – nicht Kristalle. Darum ist sie bei allen Abenteuern dabei.';
    if (/oma/.test(s)) return 'Oma ist Sids Oma. Sie ist frech, mutig und bei jedem Abenteuer dabei! Sie findet mit ihrem Stock den Weg über die heißen Quellen und wirft am Ende den letzten Kristall in den Krater.';
    if (hit) return `${hit[1]} ist ${hit[2]}. Was möchtest du noch über ${hit[1].split(' ')[0]} wissen?`;
    if (/meteor|stern-stein|sternenstein|stein vom himmel/.test(s)) return 'Ein Meteorit ist ein Stein aus dem Weltall. Wenn kleine Stücke davon in der Luft verglühen, sehen wir sie als Sternschnuppen. In unserer Geschichte schubst die Herde den großen Meteoriten mit einem Wasserstrahl voller Kristalle weg!';
    if (/kristall/.test(s)) return 'Die Kristalle im Kristalltal funkeln in allen Farben. In der Geschichte ziehen sie den Meteoriten an wie ein Magnet – darum können sie ihn wegschubsen.';
    if (/wie geht.*weiter|was passiert|nächst/.test(s)) return 'Das verrate ich nicht! Tippe auf „Weiter“ – dann erfährst du es.';
    if (/lieblings|magst du/.test(s)) return 'Ich mag Oma am liebsten, weil sie so mutig ist und immer einen frechen Spruch hat. Und wen magst du am liebsten?';
    if (/hallo|hi\b|guten/.test(s)) return 'Hallo! Schön, dass du da bist. Frag mich etwas über die Geschichte – zum Beispiel: Wer ist Buck?';
    if (/danke/.test(s)) return 'Gern geschehen! Du bist ein super Zuhörer.';
    return `Gute Frage! Gerade sind wir beim Kapitel „${story.pages[page].t}“. Frag mich zum Beispiel: Wer ist Oma? Was ist ein Meteorit? Wer ist Scrat?`;
  }
  function claudePrompt(history, story, page) {
    const sum = story.pages.map((pg, i) => `Kapitel ${i + 1} „${pg.t}“: ${pg.p.join(' ')}`).join('\n');
    const intro = `Du bist Claude und sprichst in einer Lern-App mit einem 7-jährigen Kind über eine Vorlese-Geschichte. Antworte auf Deutsch, freundlich, warm und kindgerecht, in höchstens 3 kurzen Sätzen mit einfachen Wörtern. Keine Gewalt, nichts Gruseliges, keine persönlichen Daten erfragen. Wenn das Kind nach etwas fragt, das nicht in die Geschichte passt, antworte kurz und lieb und lenke zurück zur Geschichte. Verrate nicht, was in späteren Kapiteln passiert, wenn das Kind sie noch nicht gelesen hat.\n\nDie Geschichte „${story.title}“:\n${sum}\n\nDas Kind liest gerade Kapitel ${page + 1}.\n\nGespräch bisher:`;
    const turns = history.slice(-8);
    const msgs = turns.map(m => ({ role: m.who === 'kid' ? 'user' : 'assistant', content: m.text }));
    if (msgs.length && msgs[0].role === 'user') msgs[0] = { role: 'user', content: intro + '\n\nKind: ' + msgs[0].content };
    else msgs.unshift({ role: 'user', content: intro + '\n\n(Das Gespräch beginnt.)' });
    return msgs;
  }

  /* ---------------- Das Spiel ---------------- */
  const GESCHICHTEN = {
    id: 'geschichten', ownVoice: true, icon: '📚', color: '#be185d', skill: 'Zuhören & Lesen', title: 'Geschichten',
    intro: 'Such dir eine Geschichte aus. Du kannst selbst lesen oder sie dir vorlesen lassen – und mit mir darüber reden!',
    render(body) {
      let voiceOn = store.get('story_voice_on', true);
      const view = h('div'); put(body, view);
      if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', () => { const sel = view.querySelector('.stvoice'); if (sel) fillVoices(sel); });
      function fillVoices(sel) {
        const list = deVoices(), cur = storyVoice();
        sel.innerHTML = '';
        if (!list.length) { put(sel, h('option', { value: '' }, 'Standard-Stimme')); return; }
        list.sort((a, b) => (isFemale(b) - isFemale(a)) || (isMale(a) - isMale(b))).forEach(v => {
          const o = h('option', { value: v.voiceURI }, (isFemale(v) ? '👩 ' : isMale(v) ? '👨 ' : '🙂 ') + v.name.replace(/Microsoft |Google /, '').replace(/ - .*/, ''));
          if (cur && v.voiceURI === cur.voiceURI) o.selected = true; put(sel, o);
        });
      }
      function voiceBar(onToggle) {
        const btn = h('button', { class: 'btn stvoicebtn' + (voiceOn ? '' : ' alt'), onclick: () => { voiceOn = !voiceOn; store.set('story_voice_on', voiceOn); if (!voiceOn) stopReading(); btn.className = 'btn stvoicebtn' + (voiceOn ? '' : ' alt'); btn.textContent = voiceOn ? '🔊 Vorlesen: an' : '🔇 Vorlesen: aus'; if (onToggle) onToggle(); } }, voiceOn ? '🔊 Vorlesen: an' : '🔇 Vorlesen: aus');
        const sel = h('select', { class: 'stvoice', 'aria-label': 'Stimme' }); fillVoices(sel);
        sel.addEventListener('change', () => { store.set('story_voice', sel.value); readAll(['Hallo! So klinge ich.']); });
        return h('div', { class: 'stbar' }, btn, h('label', { class: 'stvlabel' }, 'Stimme: ', sel));
      }
      function shelf() {
        stopReading(); view.innerHTML = '';
        put(view, voiceBar(), h('div', { class: 'stshelf' }, STORIES.map(st => {
          const done = store.get('story_done_' + st.id, false), at = store.get('story_page_' + st.id, 0);
          return h('button', { class: 'stbook', onclick: () => open(st) },
            h('span', { class: 'stcover' }, st.cover), h('b', {}, st.title), h('small', {}, st.sub),
            h('span', { class: 'pill' }, done ? '⭐ Fertig gelesen' : at ? `📖 Weiter bei Kapitel ${at + 1}` : '✨ Neu'));
        })), h('p', { class: 'center stmore' }, '📚 Bald kommen weitere Geschichten dazu.'));
      }
      function open(st) {
        let page = Math.min(store.get('story_page_' + st.id, 0), st.pages.length - 1);
        const history = [];
        view.innerHTML = '';
        const pageBox = h('div', { class: 'stpage' });
        const chat = h('div', { class: 'stchat' });
        const castBtn = h('button', { class: 'btn alt', onclick: showCast }, '👥 Wer ist wer?');
        put(view, h('div', { class: 'row stnavtop' }, h('button', { class: 'btn alt', onclick: shelf }, '📚 Alle Geschichten'), castBtn), voiceBar(() => { if (voiceOn) readPage(); }), pageBox, chat);
        function showCast() {
          stopReading();
          pageBox.innerHTML = '';
          put(pageBox, h('h3', {}, '👥 Wer ist wer?'), h('div', { class: 'stcast' }, st.cast.map(([e, n, d]) => h('div', { class: 'stperson' }, h('span', {}, e), h('div', {}, h('b', {}, n), h('small', {}, d))))),
            h('div', { class: 'btnrow' }, h('button', { class: 'btn', onclick: draw }, '📖 Zurück zur Geschichte')));
        }
        function readPage() {
          if (!voiceOn) return;
          const pg = st.pages[page], paras = [...pageBox.querySelectorAll('.stp')];
          readAll([`Kapitel ${page + 1}: ${pg.t}.`, ...pg.p.slice(0, pg.q ? 2 : undefined)], i => { paras.forEach(x => x.classList.remove('reading')); if (i > 0 && paras[i - 1]) paras[i - 1].classList.add('reading'); },
            () => { if (pg.q && !pageBox.querySelector('.stq.answered')) readAll([pg.q.text]); });
        }
        function draw() {
          stopReading();
          const pg = st.pages[page];
          store.set('story_page_' + st.id, page);
          pageBox.innerHTML = '';
          const paras = pg.p.map(t => h('p', { class: 'stp' }, t));
          const head = h('div', { class: 'stpic', style: `background:${pg.bg}` }, h('span', {}, pg.pic));
          put(pageBox, head, h('small', { class: 'stchap' }, `Kapitel ${page + 1} von ${st.pages.length}`), h('h3', { class: 'stt' }, pg.t));
          if (pg.q) {
            // Mitmach-Frage: die Geschichte geht danach weiter
            put(pageBox, paras[0], paras[1]);
            const rest = h('div', { class: 'strest', hidden: true }, ...paras.slice(2));
            const qb = h('div', { class: 'stq' }, h('b', {}, '🤔 ' + pg.q.text), h('div', { class: 'choices' }, pg.q.a.map(([lbl, txt]) => h('button', { class: 'choice', onclick: () => {
              qb.classList.add('answered'); qb.querySelectorAll('button').forEach(b => { b.disabled = true; });
              const ans = h('p', { class: 'stp stans' }, txt); qb.after(ans); rest.hidden = false; tone(880, 0.1, 'triangle', 0.15);
              if (voiceOn) { const all = [txt, ...pg.p.slice(2)]; const els = [ans, ...rest.querySelectorAll('.stp')]; readAll(all, i => { pageBox.querySelectorAll('.stp').forEach(x => x.classList.remove('reading')); if (i >= 0 && els[i]) els[i].classList.add('reading'); }); }
            } }, lbl))));
            put(pageBox, qb, rest);
          } else put(pageBox, ...paras);
          const last = page === st.pages.length - 1;
          put(pageBox, h('div', { class: 'stctl' },
            h('button', { class: 'btn alt', disabled: page === 0 ? true : null, onclick: () => { page--; draw(); } }, '◀ Zurück'),
            h('button', { class: 'stplay', 'aria-label': 'Vorlesen', onclick: () => { if (!voiceOn) { voiceOn = true; store.set('story_voice_on', true); const b = view.querySelector('.stvoicebtn'); if (b) { b.className = 'btn stvoicebtn'; b.textContent = '🔊 Vorlesen: an'; } } readPage(); } }, '▶'),
            last ? h('button', { class: 'btn', onclick: () => { store.set('story_done_' + st.id, true); store.set('story_page_' + st.id, 0); cheer(); shelf(); if (voiceOn) readAll(['Super, du hast die ganze Geschichte gelesen!']); } }, '⭐ Fertig!')
              : h('button', { class: 'btn', onclick: () => { page++; draw(); view.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, 'Weiter ▶')));
          readPage();
        }
        // Gesprächsfenster
        const log = h('div', { class: 'stlog' });
        const input = h('input', { class: 'stin', placeholder: 'Frag mich etwas … z. B. Wer ist Buck?', maxlength: '200' });
        const send = h('button', { class: 'btn', onclick: ask }, 'Senden');
        const mic = h('button', { class: 'btn alt stmic', hidden: true, 'aria-label': 'Sprechen' }, '🎤');
        const note = h('small', { class: 'stnote' });
        put(chat, h('h3', {}, '💬 Mit Claude reden'), log, h('div', { class: 'strow' }, mic, input, send), note);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') ask(); });
        function bubble(who, text) { const b = h('div', { class: 'stmsg ' + who }, text); put(log, b); log.scrollTop = log.scrollHeight; return b; }
        bubble('ai', 'Hallo! Ich bin Claude. Frag mich alles über die Geschichte – oder erzähl mir, wer dein Liebling ist!');
        getSample().then(s => { note.textContent = s ? 'Hier antwortet Claude.' : 'Im Claude-Link antwortet Claude selbst. Hier hilft dir die Geschichten-Hilfe.'; });
        let busy = false;
        async function ask() {
          const q = input.value.trim(); if (!q || busy) return;
          input.value = ''; busy = true; send.disabled = true;
          history.push({ who: 'kid', text: q }); bubble('kid', q);
          const out = bubble('ai', '💭 …');
          let answer = '';
          const sample = await getSample();
          if (sample) {
            try { const r = await sample(claudePrompt(history, st, page), { modelTier: 'quick', cache: false, onText: ({ text }) => { out.textContent = text; } }); answer = r.text.trim(); }
            catch (e) { answer = offlineAnswer(q, st, page); }
          } else answer = offlineAnswer(q, st, page);
          out.textContent = answer; history.push({ who: 'ai', text: answer });
          if (voiceOn) readAll([answer]);
          busy = false; send.disabled = false;
        }
        // Sprechen statt Tippen: im Claude-Link per Diktat, sonst (Chrome) per Spracherkennung des Browsers
        (async () => {
          const d = await getDictation();
          const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (!d && !SR) return;
          mic.hidden = false;
          if (d) {
            d.onFinal(({ text }) => { input.value = (input.value + ' ' + text).trim(); });
            d.onState(({ state }) => { mic.classList.toggle('on', state === 'listening'); if (state === 'idle' && input.value.trim()) ask(); });
            mic.onclick = () => { stopReading(); d.start({ language: 'de' }).catch(() => {}); };
          } else {
            mic.onclick = () => {
              stopReading();
              const r = new SR(); r.lang = 'de-DE'; r.interimResults = false;
              r.onresult = e => { input.value = e.results[0][0].transcript; ask(); };
              r.onend = () => mic.classList.remove('on');
              mic.classList.add('on'); try { r.start(); } catch (e) { mic.classList.remove('on'); }
            };
          }
        })();
        draw();
      }
      shelf();
      // Begrüßung ebenfalls mit der Geschichten-Stimme (statt der allgemeinen App-Stimme)
      const introT = setTimeout(() => { if (voiceOn && !view.querySelector('.stpage')) readAll([GESCHICHTEN.intro]); }, 350);
      return () => { clearTimeout(introT); stopReading(); };
    },
  };
  GESCHICHTEN.speak = t => readAll([t]); // 🔊-Knopf oben: ebenfalls Frauenstimme
  const ex = window.EXTRA7 || (window.EXTRA7 = []);
  ex.splice(Math.min(1, ex.length), 0, GESCHICHTEN);
})();
