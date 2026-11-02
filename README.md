# Kleine Entdecker 🐮🎈🎵🫧

Eine einfache Spiel-App für Kinder ab ca. 2 Jahren. Ohne Lesen, ohne Werbung, ohne Internet (nach dem ersten Laden).

## Spiele
| | Spiel | Was passiert |
|---|---|---|
| 🏡 | **Häuser bauen** | Magnetplatten (Vierecke & Dreiecke) antippen oder auf die Baustelle ziehen – sie „klicken“ magnetisch in die Lücke. Fertiges Haus antippen → es purzelt um, das nächste Haus kommt. Häuser mit 3 bis 8 Stockwerken, die Stockwerke werden mitgezählt |
| 🏰 | **3D bauen** | Häuser aus Magnetplatten, die sich langsam drehen (mit dem Finger wischen zum Drehen): Würfelhäuser mit Pyramidendach und lange Häuser mit Satteldach, 1 bis 6 Stockwerke |
| 🚒 | **Autos & Lieder** | Feuerwehr, Krankenwagen, Polizei oder THW antippen → jemand ruft um Hilfe (🔥 „Feuer, es brennt!“, 🤕 „Ich brauche ein Pflaster!“, 😟 „Ich brauche Hilfe!“, 🌊 „Wasser kommt!“), dann Tatü-tata, Blaulicht, das Fahrzeug fährt zum Einsatz, kommt zurück, das Problem ist gelöst und es spielt ein Kinderlied (Bruder Jakob, Alle meine Entchen, Hänschen klein, Funkel funkel kleiner Stern) |
| 🎹 | **Klavier** | Klavier mit weißen und schwarzen Tasten, farbige Punkte, Noten fliegen hoch |
| 🐮 | **Tiere** | 12 Tiere als 3D-Bilder. Tier antippen → es springt und dreht sich und sagt z. B. „Die Kuh macht Muuuh!“ |
| 🎈 | **Farben** | Luftballons steigen auf; antippen → Plopp! und die Farbe wird gesagt |
| 🎵 | **Xylophon** | Bunte Xylophon-Stäbe, antippen oder mit dem Finger drüberwischen |
| 🫧 | **Seifenblasen** | Überall tippen/malen → Blasen und Töne (oben = hoch, unten = tief) |

**Zurück zum Menü:** Den ⬅️-Knopf oben links antippen, dann auf den gelben Knopf **„🏠 Zum Menü“** tippen (verschwindet nach 4 Sekunden wieder). Am PC geht auch die **Esc**-Taste. So landet das Kind nicht aus Versehen im Menü.

## Starten
Es ist eine reine Web-App (HTML/CSS/JS), ohne Build-Schritt:

```bash
python3 -m http.server 8000
```

Dann `http://localhost:8000` im Browser öffnen. Auf Tablet/Handy über „Zum Home-Bildschirm hinzufügen“ installieren – dann läuft sie im Vollbild und offline.

Tipp: Am iPhone/iPad den **Geführten Zugriff**, unter Android die **App-Fixierung** aktivieren, damit das Kind die App nicht verlassen kann.

Die Sprachausgabe nutzt die eingebaute deutsche Stimme des Geräts.

## Bildnachweis
Die 3D-Tierbilder in `img/tiere/` stammen aus [Fluent Emoji](https://github.com/microsoft/fluentui-emoji) von Microsoft (MIT-Lizenz, siehe `img/tiere/LICENSE-fluentui-emoji.txt`).
