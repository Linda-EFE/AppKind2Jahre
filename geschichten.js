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
    sub: 'Eine Eiszeit-Abenteuer-Geschichte in 16 Kapiteln (ca. 35 Minuten) – und Oma ist immer dabei!',
    cover: '🦣🦥👵🐯☄️',
    cast: [['🦣', 'Manni', 'das große Mammut und der Chef der Herde'], ['🦣', 'Ellie', 'Mannis Frau, mutig und klug'], ['🦣', 'Peaches', 'die Tochter von Manni und Ellie'],
      ['🦣', 'Julian', 'Peaches’ fröhlicher Verlobter'], ['🦥', 'Sid', 'das tollpatschige Faultier'], ['👵', 'Oma', 'Sids Oma – frech, mutig und immer mittendrin'],
      ['🐯', 'Diego', 'der Säbelzahntiger'], ['🐯', 'Shira', 'Diegos Frau, eine flinke Tigerin'], ['🐭', 'Crash und Eddie', 'die zwei Opossum-Brüder und Spaßmacher'],
      ['🦦', 'Buck', 'das Wiesel mit der Augenklappe, ein Abenteurer'], ['🦙', 'Brooke', 'eine liebe Lama-Dame aus dem Kristalltal'], ['🦙', 'Shangri Lama', 'der Anführer im Kristalltal'],
      ['🐿️', 'Scrat', 'das Eichhörnchen, das immer seiner Eichel hinterherjagt'], ['🦅', 'Gavin, Gertie und Roger', 'drei Flug-Dinos, die erst frech sind']],
    pages: [
      { t: 'Ein Stern mit Schweif', pic: '🌌☄️🦣🦣🦥👵', bg: 'linear-gradient(#1e1b4b, #4338ca)', p: [
        'Es war ein warmer Abend in der Eiszeit. Der Schnee war ein bisschen geschmolzen, und auf der großen Wiese wuchsen saftige Gräser und kleine blaue Blumen. Manni, das große Mammut, lag mit seiner Frau Ellie im Gras. Heute war ihr Hochzeitstag, und Manni hatte extra einen riesigen Haufen süßer Beeren gesammelt. Ein paar davon hatte er allerdings schon unterwegs genascht.',
        '„Für dich, Ellie“, sagte Manni stolz und schob ihr die Beeren hin. „Die schönsten Beeren im ganzen Tal.“ Ellie lachte. „Manni, du hast ja ganz blaue Lippen! Du hast doch die Hälfte schon selbst gegessen.“ Manni wurde ein bisschen rot unter seinem dicken Fell. „Nur zum Probieren“, brummte er. „Ein Chef muss doch wissen, ob die Beeren gut sind.“',
        'Ein Stück weiter saß ihre Tochter Peaches mit ihrem Verlobten Julian. Julian war ein junges, fröhliches Mammut mit einer wilden Haartolle auf dem Kopf. Er konnte keine Minute stillsitzen. „Peaches, schau mal, ich kann auf einem Bein stehen!“, rief er und wackelte hin und her, bis er umfiel. Bumm! Die Erde zitterte, und ein paar Vögel flatterten erschrocken davon.',
        'Da zischte plötzlich ein heller Stern mit einem langen, leuchtenden Schweif über den Himmel. Dann noch einer. Und noch einer! „Schaut mal, Sternschnuppen!“, rief Peaches. „Schnell, wir müssen uns etwas wünschen!“ Alle machten die Augen zu. Julian wünschte sich eine große Hochzeit. Ellie wünschte sich, dass ihre Familie immer zusammenbleibt. Und Manni wünschte sich, dass Peaches niemals weit wegzieht.',
        'Doch dann plumpste ein kleiner, heißer Stein direkt neben Sid ins Gras. Sid, das Faultier, hatte gerade ein Nickerchen gemacht. „Aua, aua, heiß!“, rief er, hüpfte auf einem Bein herum und pustete auf seinen Zeh. Ein Stück weiter landete noch ein Stein. Pling! Und noch einer. Plong! Kleine Rauchwölkchen stiegen aus dem Gras auf.',
        'Da kam Oma angehumpelt, mit ihrem knorrigen Stock in der Hand und ihrer kleinen Tasche über der Schulter. Oma war Sids Oma. Sie war sehr alt, sehr klein, hatte nur noch einen einzigen Zahn – und sie war die frechste Oma der ganzen Eiszeit. „Was ist denn hier los?“, krächzte sie. „Regnet es jetzt Steine? Na, wenn hier etwas Spannendes passiert, dann bin ich dabei. Ich habe schon viel Schlimmeres erlebt – zum Beispiel Sids Kochkünste!“ Alle mussten lachen, sogar Sid.',
      ] },
      { t: 'Scrat und die Eichel', pic: '🐿️🌰🛸🧊✨', bg: 'linear-gradient(#0c4a6e, #38bdf8)', p: [
        'Weit weg, hoch oben in den eisigen Bergen, wohnte ein kleines Eichhörnchen mit großen Augen und noch größeren Zähnen: Scrat. Scrat hatte in seinem ganzen Leben nur einen einzigen Wunsch. Er wollte seine Eichel vergraben. Nur eine einzige Eichel! Aber jedes Mal, wenn er es versuchte, ging irgendetwas schief.',
        'An diesem Tag hüpfte Scrat über einen gefrorenen See. Er klopfte mit seiner Eichel auf das Eis. Tock, tock. Genau hier wollte er sie vergraben! Er hackte und hackte, bis das Eis knackte. Doch unter dem Eis lag etwas Seltsames: ein großes, rundes, glänzendes Ding, wie ein riesiger Teller aus Silber mit kleinen bunten Lichtern.',
        'Scrat kletterte neugierig hinein. Drinnen gab es lauter blinkende Knöpfe. Scrat steckte seine Eichel in ein kleines Loch, weil es genau die richtige Größe hatte. Klick! Plötzlich summte und brummte das silberne Ding, die Lichter blinkten wild, und – WUSCH – schoss es mit Scrat hoch in den Himmel, immer höher, bis ganz hinauf zu den Sternen.',
        'Im Weltall war es still und dunkel, und überall funkelten Sterne. Scrat drückte panisch auf alle Knöpfe gleichzeitig. Das silberne Ding wirbelte herum wie ein Kreisel und stieß dabei gegen einen großen, grauen Stein, der durch das Weltall schwebte. Bonk! Der Stein drehte sich langsam um und flog los – genau in Richtung Erde.',
        'Scrat schaute dem Stein hinterher und kratzte sich am Kopf. Dann sah er seine Eichel, die aus dem Loch gefallen war und durch das Raumschiff schwebte. Er streckte die Pfoten aus. Fast hatte er sie! Aber die Eichel schwebte immer ein kleines Stück weiter. Und während Scrat seiner Eichel hinterherjagte, flog der große Stein immer näher an die Erde heran.',
      ] },
      { t: 'Buck und die Steintafel', pic: '🦦🪨📜☄️👵', bg: 'linear-gradient(#78350f, #d97706)', p: [
        'Am nächsten Morgen wachte die Herde früh auf, weil es im Gebüsch laut raschelte. Diego, der Säbelzahntiger, spitzte sofort die Ohren und duckte sich. Neben ihm machte sich auch Shira bereit, Diegos Frau, die schnellste Tigerin weit und breit. Doch aus dem Gebüsch sprang kein Feind, sondern ein kleines Wiesel mit einer Augenklappe und einem Messer aus Zahn am Gürtel.',
        '„Buck!“, riefen alle gleichzeitig. Buck war ein alter Freund der Herde. Er war ein Abenteurer, der schon die gefährlichsten Orte der Welt gesehen hatte. „Freunde, wir haben ein riesiges Problem!“, rief Buck außer Atem und hielt eine alte, schwere Steintafel hoch. „Ein Problem, so groß wie ein Berg. Nein – so groß wie hundert Berge!“',
        'Alle versammelten sich um ihn. Auf der Steintafel waren seltsame Bilder eingeritzt: ein Himmel voller Sterne, ein riesiger runder Stein mit einem Feuerschweif, und darunter ein Tal mit spitzen, glitzernden Dingern. „Das hier“, erklärte Buck und tippte auf den großen Stein, „ist ein Meteorit. Ein Stein aus dem Weltall. Und er fliegt direkt auf uns zu!“',
        '„Die kleinen Steine von gestern Abend waren nur seine Krümel“, sagte Buck. „Der richtige Meteorit kommt erst noch. Aber hier steht auch, wie man ihn wegschubsen kann!“ Er zeigte auf die glitzernden Dinger. „Mit den Zauber-Kristallen aus dem Kristalltal. Sie ziehen den Meteoriten an wie ein Magnet – oder schubsen ihn weg, wenn man es richtig macht.“',
        'Die zwei Opossum-Brüder Crash und Eddie hängten sich kopfüber an einen Ast und riefen: „Abenteuer! Abenteuer! Abenteuer!“ Manni aber runzelte die Stirn. „Das klingt nach einem weiten und schwierigen Weg. Oma, vielleicht bleibst du lieber hier und passt auf unser Zuhause auf?“',
        'Oma kniff die Augen zusammen und klopfte mit ihrem Stock auf Mannis Rüssel. Tock! „Pah! Ich bin älter als alle Berge hier zusammen. Ich bleibe doch nicht allein zu Hause und strick Socken, während ihr die Welt rettet! Ich komme mit. Und ich gehe vorne!“ Manni seufzte, aber er lächelte dabei. Gegen Oma konnte man einfach nicht gewinnen.',
      ] },
      { t: 'Oma packt ihre Tasche', pic: '👜👵🦷🍓🧶', bg: 'linear-gradient(#9d174d, #f472b6)', p: [
        'Bevor es losging, packte jeder seine Sachen. Manni nahm einen Vorrat an Beeren mit, Ellie ein paar weiche Blätter zum Schlafen, und Sid packte drei Kissen ein, ein Kuscheltier aus Moos und einen Stock zum Rösten von Marshmallows – obwohl es in der Eiszeit gar keine Marshmallows gab.',
        'Oma packte ihre kleine Tasche ganz besonders sorgfältig. Hinein kamen: eine Handvoll getrocknete Beeren, ein glatter Stein für schlechte Laune, eine Feder zum Kitzeln, ein Knäuel Wolle, ein Ersatz-Zahn aus Holz und eine kleine Pfeife aus Schilfrohr. „Wozu brauchst du denn das alles?“, fragte Sid. Oma zwinkerte. „Das wirst du schon sehen, mein Junge. Eine kluge Oma ist auf alles vorbereitet.“',
        'Peaches und Julian standen ein bisschen abseits und flüsterten. Ellie ging zu ihnen. „Was ist los, ihr zwei?“ Peaches schaute zu Boden. „Mama, nach diesem Abenteuer wollten Julian und ich eigentlich weit weg ziehen. In ein eigenes Tal. Aber ich weiß nicht, wie ich es Papa sagen soll.“',
        'Ellie nahm Peaches in den Rüssel. „Papa liebt dich sehr. Darum macht er sich Sorgen. Aber er wird es verstehen – irgendwann.“ Manni hatte natürlich alles gehört, denn Mammuts haben sehr große Ohren. Er tat aber so, als hätte er nichts gehört, und sortierte schnell seine Beeren. Doch sein Herz war ganz schwer.',
        'Dann standen alle bereit. Buck vorneweg mit der Steintafel, Diego und Shira an den Seiten, die Mammuts in der Mitte, Sid und die Opossums dahinter. Und Oma? Oma drängelte sich ganz nach vorne, direkt neben Buck. „Na los, worauf wartet ihr? Der Meteorit wartet nicht auf uns!“ Und so zog die ganze Herde los, hinaus in das große Abenteuer.',
      ] },
      { t: 'Im Nebelwald', pic: '🌫️🌲🌲🐭🐭👵', bg: 'linear-gradient(#374151, #9ca3af)', q: { text: 'Crash und Eddie sind verschwunden! Wie soll die Herde sie suchen?', a: [['📣 Laut rufen', 'Alle rufen so laut sie können: „Crash! Eddie!“ Aber der Nebel schluckt jedes Geräusch. Da hebt Oma die Hand: „Psst! Seid alle mal leise!“'], ['👂 Leise lauschen', 'Oma sagt: „Psst! Wer laut ruft, hört nichts. Wir müssen ganz leise sein und lauschen.“ Alle halten den Atem an.']] }, p: [
        'Nach einem langen Tag kam die Herde in einen dichten Wald. Zwischen den hohen Bäumen hing ein dicker, weißer Nebel, so dicht wie Watte. Man konnte kaum die eigenen Füße sehen. „Bleibt dicht zusammen!“, rief Manni. „Wer verloren geht, bleibt stehen und ruft!“',
        'Crash und Eddie fanden den Nebel großartig. Sie spielten Verstecken und sprangen von Baum zu Baum. „Huhu, findet uns doch!“, kicherten sie. Doch plötzlich wurde es still. Kein Kichern mehr. Kein Rascheln. „Crash? Eddie?“, rief Ellie. Keine Antwort. Die beiden waren verschwunden!',
        'Alle wurden ganz still. Und in der Stille hörte Oma etwas, das niemand sonst hörte: ein leises, klägliches Piepsen, irgendwo links, hinter einem umgestürzten Baum. „Da!“, flüsterte Oma. „Meine Ohren sind alt, aber sie funktionieren noch prima.“',
        'Mit ihrem Stock tastete sich Oma durch den Nebel, Schritt für Schritt. Die anderen folgten ihr. Hinter dem Baum fanden sie Crash und Eddie – sie hingen kopfüber in einem Dornenbusch fest und konnten sich nicht befreien. „Wir wollten nur ein bisschen spielen“, jammerten sie. „Und dann war alles weiß, und wir wussten nicht mehr, wo wir sind.“',
        'Oma holte das Knäuel Wolle aus ihrer Tasche. Sie band das eine Ende an Crash, das andere an Eddie und die Mitte an ihren eigenen Stock. „So“, sagte sie, „jetzt seid ihr an Oma festgebunden, bis wir aus dem Nebel raus sind.“ Crash und Eddie maulten ein bisschen, aber eigentlich waren sie sehr froh. Und Sid flüsterte: „Darum hat Oma die Wolle eingepackt!“',
      ] },
      { t: 'Über die blubbernden Quellen', pic: '♨️🌋👵🦯🦣🐯', bg: 'linear-gradient(#7f1d1d, #f97316)', q: { text: 'Wer soll über die blubbernden Steine vorangehen?', a: [['🐯 Diego', 'Diego springt los – aber der erste Stein wackelt gefährlich! Schnell ruft Oma: „Stopp! Erst klopfen, dann hüpfen!“ Diego springt zurück, gerade noch rechtzeitig.'], ['👵 Oma', 'Oma geht los und klopft vor jedem Schritt mit dem Stock auf den Boden. Tock, tock – der Stein hält! Tock, tock – der Stein wackelt! Den lässt sie lieber aus.']] }, p: [
        'Hinter dem Nebelwald wurde es plötzlich warm, dann heiß. Die Herde stand vor einem Tal voller heißer Quellen. Überall blubberte und zischte es, und warmer Dampf stieg auf wie aus einem riesigen Kochtopf. Es roch ein bisschen nach faulen Eiern. „Igitt“, sagte Sid und hielt sich die Nase zu. „Wer hat hier gepupst?“',
        'Nur ein schmaler Weg aus flachen Steinen führte hinüber auf die andere Seite. Rechts und links davon brodelte heißes Wasser. „Manche dieser Steine sind fest“, sagte Buck und studierte seine Tafel, „und manche wackeln und kippen um. Aber welche sind welche? Das steht hier leider nicht.“',
        'Am Ende zeigte Oma allen den Weg. Mit ihrem Stock klopfte sie auf jeden einzelnen Stein. „Der hier ist gut. Der da nicht. Der hier auch. Hopp, hopp, Herde! Schön in meine Fußstapfen treten!“ Einer nach dem anderen folgten sie ihr: erst die Tiger, dann Sid, dann die Opossums. Zum Schluss die schweren Mammuts, ganz vorsichtig, Fuß vor Fuß.',
        'Als Julian an der Reihe war, rutschte er fast aus, weil er wieder einmal herumgehüpft war. Manni packte ihn blitzschnell mit dem Rüssel und zog ihn hinüber. „Danke, Schwiegerpapa!“, rief Julian und umarmte ihn stürmisch. Manni brummte: „Nicht so stürmisch, Junge.“ Aber er musste dabei ein bisschen lächeln.',
        'Als alle sicher auf der anderen Seite standen, umarmte Sid seine Oma ganz fest. „Oma, du bist die Beste!“ – „Das weiß ich doch“, sagte Oma und grinste mit ihrem einzigen Zahn. „Und jetzt lass mich los, du zerdrückst mir ja den Zahn!“',
      ] },
      { t: 'Geschichten am Lagerfeuer', pic: '🔥🌙⭐👵🦥🐯', bg: 'linear-gradient(#1c1917, #92400e)', p: [
        'Am Abend machten sie Rast an einem kleinen See. Diego und Shira sammelten trockene Äste, und Manni rieb zwei Steine aneinander, bis ein Funke entstand. Bald knisterte ein gemütliches Lagerfeuer. Alle saßen im Kreis, und das Feuer warf tanzende Schatten auf ihre Gesichter.',
        'Über ihnen am Himmel leuchtete ein neuer Stern, heller als alle anderen. Er hatte einen kleinen Schweif und wurde jeden Abend ein bisschen größer. „Ist das der Meteorit?“, fragte Peaches leise. Buck nickte. „Ja. Wir haben noch ein paar Tage Zeit. Aber nicht viele.“',
        'Weil alle ein bisschen Angst hatten, klopfte Oma mit ihrem Stock auf den Boden. „Wisst ihr was? Ich erzähle euch eine Geschichte. Als ich jung war – ja, ich war auch mal jung, da staunt ihr! – da gab es einen Winter, der war so kalt, dass sogar die Fische im See Mützen getragen haben.“ Crash und Eddie kicherten.',
        '„Und in diesem Winter“, erzählte Oma weiter, „habe ich mich ganz allein durch einen Schneesturm gekämpft, um meiner kleinen Schwester warme Beeren zu bringen. Ich hatte Angst. Aber wisst ihr, was ich gelernt habe? Mut bedeutet nicht, keine Angst zu haben. Mut bedeutet, trotzdem weiterzugehen. Am besten mit Freunden.“',
        'Es wurde ganz still am Feuer. Dann legte Diego seinen großen Tigerkopf neben Oma. „Das hast du schön gesagt, Oma.“ Shira nickte. Und Sid wischte sich heimlich eine Träne aus dem Auge. Dann schliefen alle nacheinander ein. Oma blieb als Letzte wach. Sie schaute zu dem hellen Stern hinauf und flüsterte: „Na warte, du Stein. Mit meiner Herde legst du dich besser nicht an.“',
      ] },
      { t: 'Das funkelnde Kristalltal', pic: '💎🦙🦙✨👵🦥', bg: 'linear-gradient(#6d28d9, #ec4899)', p: [
        'Am nächsten Tag kletterte die Herde über einen hohen, steilen Berg. Die Mammuts schnauften, Sid jammerte, und Crash und Eddie ließen sich die meiste Zeit auf Mannis Rücken tragen. Nur Oma marschierte vorne weg, als wäre es ein Spaziergang. „Na, ihr jungen Hüpfer? Schon müde?“',
        'Oben auf dem Gipfel blieben alle mit offenem Mund stehen. Unter ihnen lag ein Tal, das in allen Farben glitzerte: rot, blau, grün, lila und golden. Riesige Kristalle wuchsen dort wie Bäume aus dem Boden, und wenn die Sonne darauf schien, tanzten bunte Lichtflecken über die Wiesen. Die Luft roch nach Blumen und Honig. „Das Kristalltal“, flüsterte Buck. „Es gibt es wirklich!“',
        'Im Tal wohnten fröhliche Lamas mit langem, weichem Fell. Sie machten Yoga auf den Wiesen, flochten sich Blumen ins Haar und sangen leise Lieder. Ihr Anführer war der Shangri Lama, ein sehr altes Lama mit einem langen Bart, der so ruhig sprach, als hätte er alle Zeit der Welt. „Willkommen, Reisende“, sagte er. „Im Kristalltal ist jeder willkommen, der in Frieden kommt.“',
        'Und dann kam eine Lama-Dame angehüpft. Sie hatte große, freundliche Augen und eine Blume hinter dem Ohr. Ihr Name war Brooke. Als sie Sid sah, lächelte sie. Sid wurde knallrot, wollte etwas Schlaues sagen, sagte aber nur: „Hallo, ich bin … äh … Sid … ich mag … äh … Blätter.“ Dann stolperte er über seine eigenen Füße und plumpste ins Gras.',
        'Brooke lachte – aber nicht gemein, sondern freundlich. Sie half Sid wieder auf. „Ich mag auch Blätter“, sagte sie. „Vor allem die mit Tau drauf.“ Sid strahlte über das ganze Gesicht. Oma stupste Manni an und flüsterte: „Na, da hat sich mein Enkel aber verguckt.“',
      ] },
      { t: 'Oma bleibt nicht!', pic: '💎👵🦙❤️🦣', bg: 'linear-gradient(#7c3aed, #c084fc)', p: [
        'Der Shangri Lama führte die Herde durch das Tal. Überall standen Lamas, die eigentlich schon sehr alt waren – aber sie sahen frisch und munter aus. „Das liegt an den Kristallen“, erklärte der Shangri Lama. „Ihr Licht macht müde Knochen wieder beweglich. Hier fühlt sich jeder jung.“',
        'Er schaute Oma lange an. Dann sagte er sanft: „Liebe Oma. Du bist schon so weit gewandert. Deine Knochen sind müde, das sehe ich. Bleib doch hier bei uns, für immer. Hier musst du nie wieder wandern. Du kannst jeden Tag in der Sonne liegen, und die Kristalle machen dich wieder ganz jung.“',
        'Alle wurden still und schauten Oma an. Sid schluckte. Er wollte, dass es seiner Oma gut geht. Aber er wollte auch nicht, dass sie hierbleibt. Oma stützte sich auf ihren Stock und schaute über das glitzernde Tal. Es war wirklich wunderschön. Sie dachte einen kleinen Moment nach.',
        'Dann schüttelte sie den Kopf. „Danke, lieber Shangri Lama. Das ist sehr lieb von dir. Aber meine Herde braucht mich. Wer soll denn sonst auf Sid aufpassen? Und wisst ihr was?“ Sie hob ihren Stock in die Luft. „Abenteuer halten mich jung – nicht Kristalle! Ich bleibe bei meiner Familie. Bis zum Schluss.“',
        'Sid fiel seiner Oma um den Hals. Manni nickte ihr anerkennend zu, und Ellie hatte Tränen in den Augen. Der Shangri Lama lächelte weise. „Dann nimm wenigstens das hier mit“, sagte er und gab Oma einen kleinen, funkelnden Kristall, nicht größer als eine Beere. „Als Glücksbringer.“ Oma steckte ihn in ihre Tasche – zwischen den Ersatz-Zahn und die Feder.',
        'Und Brooke? Brooke trat vor und sagte: „Ich komme auch mit! Ich wollte schon immer ein echtes Abenteuer erleben.“ Sid war so glücklich, dass er einen kleinen Freudentanz aufführte, bei dem er natürlich wieder umfiel.',
      ] },
      { t: 'Der große Plan', pic: '📜🗺️🦦🦣🐯👵', bg: 'linear-gradient(#0f766e, #22c55e)', p: [
        'Am Abend saßen alle zusammen, und Buck breitete die Steintafel auf dem Boden aus. „Hört gut zu! Die Kristalle ziehen den Meteoriten an wie ein Magnet. Wenn wir aber ganz viele Kristalle mit einem riesigen Wasserstrahl hoch in den Himmel schießen, dann schubsen sie den Meteoriten von der Erde weg.“',
        '„Und wo kriegen wir so einen riesigen Wasserstrahl her?“, fragte Ellie. Buck zeigte auf die Karte. „Hinter dem Kristalltal liegt ein großer Krater. Ganz unten darin schläft eine Riesen-Quelle. Wenn wir die Kristalle in den Krater bringen, wacht sie auf und spritzt alles in den Himmel. So hoch, wie noch nie etwas gespritzt ist!“',
        'Jeder bekam eine Aufgabe. Manni, Ellie, Peaches und Julian sollten die schweren Kristalle schieben, denn Mammuts sind sehr stark. Diego und Shira sollten den schnellsten Weg zum Krater auskundschaften. Crash und Eddie sollten auf den höchsten Baum klettern und Ausschau halten. Sid und Brooke sollten die kleinen Kristalle in Körben tragen.',
        '„Und ich?“, fragte Oma und stemmte die Hände in die Hüften. Buck salutierte. „Du, Oma, bist die Chef-Kommandantin! Du sagst allen, wann sie loslegen.“ Oma holte die kleine Pfeife aus Schilfrohr aus ihrer Tasche. Trrrillll! „Alle Mann an die Arbeit!“ Und Sid flüsterte zu Brooke: „Darum hat Oma die Pfeife eingepackt.“',
        'In dieser Nacht konnte Manni nicht schlafen. Julian setzte sich neben ihn. „Manni, ich weiß, dass du Angst hast, Peaches zu verlieren“, sagte Julian leise. „Aber ich verspreche dir: Ich passe immer gut auf sie auf. Und wir kommen euch ganz oft besuchen.“ Manni schaute Julian lange an. Dann legte er ihm den Rüssel auf die Schulter. „Ich weiß, Junge. Ich weiß.“',
      ] },
      { t: 'Die drei Flug-Dinos', pic: '🦅🦅🦅🫐👵', bg: 'linear-gradient(#0369a1, #7dd3fc)', q: { text: 'Die Flug-Dinos wollen die Kristalle stibitzen. Was soll Oma tun?', a: [['🫐 Beeren teilen', 'Oma hält dem kleinen Roger eine Handvoll süßer Beeren hin. „Hier, du siehst hungrig aus, mein Junge. Wer hungrig ist, ist schlecht gelaunt.“'], ['😠 Schimpfen', 'Oma schimpft los: „Ihr frechen Federbälle!“ Doch dann sieht sie, dass der kleine Roger ganz traurig guckt und sein Bauch laut knurrt. Da holt sie ein paar Beeren aus ihrer Tasche.']] }, p: [
        'Am nächsten Morgen ging die Arbeit los. Die Mammuts schoben die großen Kristalle, die anderen trugen die kleinen. Doch plötzlich verdunkelte sich der Himmel. Drei große Flug-Dinos kreisten über ihnen: der grummelige Gavin, die schlaue Gertie und der kleine, etwas tollpatschige Roger. „Diese Kristalle gehören jetzt uns!“, krächzte Gavin und stürzte herab.',
        'Die Herde rückte eng zusammen. Diego und Shira fauchten, und Manni stellte sich schützend vor die Kristalle. Gertie schnappte sich einen kleinen Kristall aus Sids Korb. Roger versuchte es auch, verhedderte sich aber in einem Ast und baumelte hilflos herum. Was sollte jetzt passieren?',
        'Roger knabberte an den Beeren und machte große Augen. „So nett war noch nie jemand zu mir“, piepste er. „Die anderen sagen immer, ich bin zu klein und zu ungeschickt.“ Oma tätschelte seinen Schnabel. „Ach was. Klein sein ist prima. Ich bin auch klein. Und schau, was ich alles schaffe!“',
        'Gavin und Gertie landeten verwirrt. „Roger! Was machst du da?“ Roger flatterte zu ihnen. „Die sind gar nicht böse! Und wisst ihr was? Die wollen den Meteoriten wegschubsen! Den, vor dem wir solche Angst haben!“ Gavin blinzelte. „Ihr wollt … den Meteoriten wegschubsen? Wir wollten die Kristalle doch nur, weil wir dachten, sie beschützen uns.“',
        '„Dann helft uns doch!“, sagte Oma. „Zusammen schaffen wir es schneller.“ Gavin und Gertie schauten sich an. Dann nickten sie langsam. Mit ihren großen Flügeln trugen die drei Dinos die Kristalle durch die Luft – viel schneller, als die Herde es je geschafft hätte. Und Roger flog stolz ganz vorne.',
      ] },
      { t: 'Der Weg zum Krater', pic: '⛰️💎🛷🦥🦙🦣', bg: 'linear-gradient(#1e3a8a, #60a5fa)', p: [
        'Der Weg zum Krater führte über einen langen, steilen Hang. Die großen Kristalle waren schwer, und die Mammuts schwitzten trotz der Kälte. „Schieben! Und schieben! Und schieben!“, rief Oma im Takt und pfiff dazu auf ihrer Pfeife. Trill, trill, trill!',
        'Da hatte Sid eine Idee. „Wartet mal! Was rollt den Berg hinunter, ohne dass man schieben muss? Ein Schneeball!“ Er nahm ein großes, flaches Stück Rinde und legte einen Kristall darauf. Dann gab er einen kleinen Schubs. Wuuuusch! Der Kristall sauste auf der Rinde den Hang hinunter wie auf einem Schlitten – genau in Richtung Krater.',
        '„Sid, das ist genial!“, rief Brooke. Sid wurde wieder rot. Bald sausten überall Kristalle auf Rinden-Schlitten den Berg hinab. Crash und Eddie fuhren natürlich selbst mit und kreischten vor Vergnügen. „Juhuuu! Noch mal! Noch mal!“',
        'Doch dann fuhr Sid selbst auf einem Schlitten mit, um zu zeigen, wie gut seine Idee war. Leider wusste er nicht, wie man bremst. „Wie hält man dieses Ding an?“, schrie er, während er immer schneller wurde. Er sauste an einem Baum vorbei, über einen Hügel, durch einen Schneehaufen – und landete kopfüber in einem weichen Moospolster. Plumps!',
        'Alle rannten zu ihm. Sid schaute aus dem Moos heraus, mit Blättern auf dem Kopf und einer Schnecke auf der Nase. „Alles gut“, sagte er. „Ich wollte genau hier landen.“ Oma lachte so laut, dass ihr fast der Zahn herausfiel. „Mein Enkel, der Schlittenkönig!“, rief sie. Und alle lachten mit, sogar die Dinos.',
      ] },
      { t: 'Der riesige Wasserstrahl', pic: '🌋💧💎☄️👵🦯', bg: 'linear-gradient(#111827, #7c3aed)', p: [
        'Endlich standen alle am Rand des großen Kraters. Er war so tief, dass man den Boden kaum sehen konnte. Ganz unten blubberte leise das Wasser der Riesen-Quelle. Und am Himmel war der Meteorit jetzt riesig geworden, so groß wie der Mond, und er leuchtete orange und rot.',
        'Nach und nach rollten sie alle Kristalle in den Krater. Es klirrte und funkelte. Doch das Wasser blubberte nur weiter leise vor sich hin. Nichts geschah. „Warum funktioniert es nicht?“, rief Ellie. Buck studierte hektisch seine Steintafel. „Es fehlt noch etwas! Ein letzter Kristall! Er muss ganz genau in die Mitte, sonst wacht die Quelle nicht auf!“',
        'Alle suchten überall. Die Mammuts schauten unter Steinen, die Tiger rannten den Kraterrand entlang, die Dinos flogen über das ganze Gelände. Aber es war kein einziger Kristall mehr übrig. Der Meteorit kam immer näher. Es wurde warm, und der Himmel färbte sich orange.',
        'Da griff Oma in ihre Tasche. Zwischen dem Ersatz-Zahn und der Feder holte sie ihren kleinen Glücksbringer-Kristall hervor – den Kristall vom Shangri Lama. „Hier ist euer letzter Kristall!“, rief sie. Sie steckte ihn oben auf ihren Stock, nahm Anlauf, so gut eine alte Oma Anlauf nehmen kann, und warf den Stock wie einen Speer in den Krater.',
        'Der Stock flog und flog, drehte sich in der Luft – und landete genau in der Mitte. Treffer! Einen Moment war es ganz still. Dann begann es zu rumpeln und zu brummen. Der Boden zitterte. Und dann – WUUUSCH! – schoss ein gigantischer Wasserstrahl in den Himmel, voller funkelnder Kristalle, höher als jeder Berg, höher als jede Wolke.',
        'Der Strahl traf den Meteoriten mit voller Wucht. Die Kristalle leuchteten auf, und ganz langsam wurde der Meteorit zur Seite geschubst. Ein Stückchen. Und noch ein Stückchen. Und dann flog er an der Erde vorbei, weit, weit weg. Unten am Krater jubelten alle so laut, dass man es bis ins Kristalltal hören konnte.',
      ] },
      { t: 'Scrat rettet den Tag (aus Versehen)', pic: '🐿️🌰☄️✨🌠', bg: 'linear-gradient(#020617, #1d4ed8)', p: [
        'Und was war mit Scrat? Der war die ganze Zeit oben im Weltall gewesen und hatte seiner Eichel hinterhergejagt. Sein silbernes Raumschiff war inzwischen auf dem Meteoriten gelandet, und Scrat hüpfte auf dem großen Stein herum, immer der schwebenden Eichel hinterher.',
        'Gerade als der Wasserstrahl den Meteoriten traf, hatte Scrat seine Eichel endlich gefangen! Er drückte sie fest an sich und lächelte glücklich. Er suchte eine schöne Stelle, um sie zu vergraben, und fand einen kleinen Riss im Meteoriten. Perfekt! Er steckte die Eichel hinein und klopfte einmal fest darauf. Tock!',
        'Krrrrk. Der Riss wurde größer. Krrrrrrrk. Und noch größer. Scrat schaute erschrocken. Und dann zerplatzte der ganze Meteorit in tausend kleine, glitzernde Stückchen – ganz harmlos, wie Funken bei einem Feuerwerk. Scrat schwebte mitten im Glitzer, mit seiner Eichel in der Hand.',
        'Unten auf der Erde sahen alle, wie der Himmel sich in ein Meer aus Sternschnuppen verwandelte. Tausende funkelnde Lichter zogen über den Nachthimmel, in allen Farben, so schön, wie es noch niemand je gesehen hatte. „Was ist das?“, fragte Peaches staunend. Oma grinste. „Ich glaube, da hat uns jemand geholfen.“',
        'Scrat aber purzelte mit seinem Raumschiff zurück zur Erde und landete – plumps! – in einem weichen Schneehaufen, ganz in der Nähe der Herde. Er kroch heraus, schüttelte sich, schaute auf seine Pfoten – und seine Eichel war wieder weg. Scrat seufzte tief. Und dann rannte er los, um eine neue zu suchen.',
      ] },
      { t: 'Ein Fest unter Sternschnuppen', pic: '🎉💍🦣🦣🦥🦙👵💃', bg: 'linear-gradient(#be185d, #f59e0b)', p: [
        'In dieser Nacht regnete es Sternschnuppen, so viele wie noch nie. Und weil alle so glücklich waren, beschlossen Peaches und Julian, gleich hier und jetzt zu heiraten. Unter dem funkelnden Himmel! Die Lamas schmückten alles mit Blumen, die Dinos brachten Früchte, und Crash und Eddie bauten aus Ästen einen Torbogen, der nur ein bisschen schief war.',
        'Ellie hatte Tränen der Freude in den Augen. Und Manni? Manni führte Peaches zum Torbogen. Er räusperte sich. „Peaches“, sagte er leise, „ich habe auf dieser Reise etwas gelernt. Von Oma. Familie bleibt Familie, auch wenn man nicht im gleichen Tal wohnt. Ihr dürft wohnen, wo ihr wollt. Ich bin trotzdem immer für euch da.“',
        'Peaches umarmte ihren Papa. Dann sagte sie: „Weißt du was, Papa? Nach diesem Abenteuer haben Julian und ich gemerkt, dass wir gar nicht weit weg wollen. Wir bauen uns ein Zuhause gleich hinter dem Hügel. Dann können wir jeden Tag zum Frühstück kommen!“ Manni strahlte so sehr, dass er fast leuchtete wie eine Sternschnuppe.',
        'Dann wurde gefeiert. Julian tanzte so wild, dass die Erde wackelte und alle mittanzen mussten. Diego und Shira tanzten einen eleganten Tiger-Tanz. Crash und Eddie machten Purzelbäume. Buck erzählte allen von seinen Abenteuern, ob sie es hören wollten oder nicht. Und Sid und Brooke tanzten zusammen – Sid trat Brooke dabei nur dreimal auf die Füße.',
        'Und Oma? Oma tanzte mit Roger, dem kleinen Flug-Dino. Sie wirbelte herum, als wäre sie wieder ein junges Faultier. „Siehst du“, rief sie lachend, „Abenteuer halten jung!“',
      ] },
      { t: 'Wieder zu Hause', pic: '🏡🌟👵🦯💎🦥', bg: 'linear-gradient(#065f46, #34d399)', p: [
        'Am nächsten Morgen kam der Shangri Lama zu Oma. Er hielt etwas hinter seinem Rücken versteckt. „Liebe Oma“, sagte er feierlich, „du hast deinen Stock für uns alle geopfert. Darum habe ich dir einen neuen gemacht.“ Er überreichte ihr einen wunderschönen Stock aus hellem Holz, mit einem großen, funkelnden Kristall oben drauf.',
        '„Für die mutigste Oma der ganzen Eiszeit“, sagte der Shangri Lama. Oma drehte den Stock hin und her, und der Kristall warf bunte Lichtflecken auf alle Gesichter. „Na, der ist ja viel schöner als mein alter“, sagte sie. „Aber ich warne euch: Damit klopfe ich jetzt noch lieber auf eure Rüssel!“ Alle lachten.',
        'Dann verabschiedeten sie sich von den Lamas und den drei Dinos. „Besucht uns mal!“, rief Roger und winkte mit beiden Flügeln. Brooke aber kam mit, denn sie wollte bei Sid bleiben. Und so machte sich die Herde auf den Heimweg – diesmal ohne Eile, mit vielen Pausen, mit Liedern und Geschichten.',
        'Als sie endlich wieder zu Hause auf ihrer Wiese ankamen, legten sich alle ins weiche Gras. Über ihnen funkelten die Sterne, ganz friedlich und still. Manni legte den Rüssel um Ellie. Peaches und Julian kuschelten sich aneinander. Diego und Shira schnurrten leise. Crash und Eddie schliefen schon, kopfüber an ihrem Lieblingsast.',
        'Sid lag neben Brooke und schaute in den Himmel. „Weißt du“, sagte er leise, „das Beste an Abenteuern ist, dass man sie zusammen erlebt.“ Und Oma, die eigentlich schon schlafen sollte, öffnete noch einmal ein Auge und sagte: „Genau, mein Junge. Und das nächste Abenteuer kommt bestimmt. Gute Nacht, Herde.“ Und dann schliefen alle ein. Ende.',
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
  let readTok = 0, cur = null, rState = 'idle';
  const rListeners = new Set();
  const setState = st => { rState = st; rListeners.forEach(f => f(st)); };
  function stopReading() { readTok++; cur = null; if ('speechSynthesis' in window) speechSynthesis.cancel(); setState('idle'); }
  // Pause: merkt sich den Absatz; Weiter: liest ab diesem Absatz weiter
  function pauseReading() { if (rState !== 'reading' || !cur) return; readTok++; if ('speechSynthesis' in window) speechSynthesis.cancel(); setState('paused'); }
  function resumeReading() { if (rState !== 'paused' || !cur) return; const c = cur; readAll(c.texts, c.onPart, c.onDone, c.i); }
  // Liest Texte nacheinander; onPart(i) markiert den aktuellen Absatz
  function readAll(texts, onPart, onDone, start = 0) {
    stopReading(); const tok = readTok;
    if (!('speechSynthesis' in window)) { if (onDone) onDone(); return; }
    const v = storyVoice();
    cur = { texts, onPart, onDone, i: start }; setState('reading');
    const next = i => {
      if (tok !== readTok) return;
      if (i >= texts.length) { cur = null; setState('idle'); if (onPart) onPart(-1); if (onDone) onDone(); return; }
      cur.i = i;
      if (onPart) onPart(i);
      const u = new SpeechSynthesisUtterance(texts[i]);
      u.lang = 'de-DE'; try { if (v) u.voice = v; } catch (e) { /* Stimme nicht setzbar: Standard */ } u.rate = 0.92; u.pitch = 1.05;
      u.onend = () => setTimeout(() => next(i + 1), 250); u.onerror = () => next(i + 1);
      speechSynthesis.speak(u);
    };
    next(start);
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
      // Schwebender Pause-Knopf: beim Vorlesen immer sichtbar, auch beim Scrollen
      const fab = h('button', { class: 'stfab', hidden: true, onclick: () => { if (rState === 'reading') pauseReading(); else if (rState === 'paused') resumeReading(); } });
      put(body, fab);
      const paintFab = st => { if (!fab.isConnected && fab.dataset.shown) { rListeners.delete(paintFab); return; } fab.hidden = st === 'idle'; fab.textContent = st === 'reading' ? '⏸️ Pause' : '▶️ Weiter'; fab.classList.toggle('paused', st === 'paused'); };
      rListeners.add(paintFab); paintFab(rState); setTimeout(() => { fab.dataset.shown = '1'; }, 0);
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
        // Ein Knopf: ▶ Vorlesen · ⏸ Pause · ▶ Weiter vorlesen
        function playBtn() {
          const icon = h('span', { class: 'stpi' }), cap = h('small', { class: 'stpcap' });
          const b = h('button', { class: 'stplay', onclick: () => {
            if (rState === 'reading') { pauseReading(); return; }
            if (rState === 'paused') { resumeReading(); return; }
            if (!voiceOn) { voiceOn = true; store.set('story_voice_on', true); const vb = view.querySelector('.stvoicebtn'); if (vb) { vb.className = 'btn stvoicebtn'; vb.textContent = '🔊 Vorlesen: an'; } }
            readPage();
          } }, icon);
          const paint = st => {
            if (!b.isConnected && b.dataset.shown) { rListeners.delete(paint); return; }
            icon.textContent = st === 'reading' ? '⏸️' : '▶';
            cap.textContent = st === 'reading' ? 'Pause' : st === 'paused' ? 'Weiter vorlesen' : 'Vorlesen';
            b.setAttribute('aria-label', cap.textContent); b.classList.toggle('pausing', st === 'reading'); b.classList.toggle('paused', st === 'paused');
          };
          paint(rState); rListeners.add(paint); setTimeout(() => { b.dataset.shown = '1'; }, 0);
          return h('div', { class: 'stplaywrap' }, b, cap);
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
            playBtn(),
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
