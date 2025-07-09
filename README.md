# astro-ephemeris
# 🌟 Astro-Newsletter System

Ein personalisierter Newsletter, der individuelle astrologische Wochenprognosen basierend auf dem Geburtshoroskop 
versendet – automatisch, reflektiert und stilvoll.  

> 🧠 Zielgruppe: moderne, offene Frauen zwischen 20 und 45 Jahren, die sich selbst besser verstehen und ihr Leben 
bewusster gestalten möchten.

---

## 🚀 Features

- ✨ **Geburtshoroskop-Erstellung** mit Swiss Ephemeris
- 🔭 **Wöchentliche Transite** ab jeweils Sonntag (inkl. Langzeitzyklen)
- 🧘 **GPT-generierte Texte** mit psychologischer Tiefe
- 💌 **HTML- oder PDF-Versand** via Gmail-SMTP
- 📊 **Dashboard** mit Versandstatus & Öffnungsstatistik
- 🔄 **Rückblicksfunktion** mit GPT-Vergleich zur Vorwoche
- 🎭 **Psychologische Archetypen** (Beta)

---

## 🧱 Systemarchitektur

```plaintext
                             🌐 Nutzer:in
                                 │
                         📝 Tally-Formular
                 (Name, Geburtsdaten, E-Mail, Formatwahl)
                                 │
                    📄 parseUsers.js → users.json
                    (inkl. Geodaten & Formatpräferenz)
                                 │
      
┌────────────────────────────┬─────────────────────────────┐
      ▼                            ▼                             ▼
generateHoroscope.js     generateTransits.js          calculate_cycles.py
(Planeten, Häuser, AC)   (Wöchentliche Transite)      (Langzeitzyklen)
      │                        │                             │
      └──────┬─────────────────┴──────────────┬──────────────┘
             ▼                                ▼
     createWeekly.js                    prepareWeekly.js
     (GPT-Basistexte)                  (Rückblick, Stil, Export)
             │                                │
       weekly/NAME.json           weekly_archive/NAME.json
             │                                │
             ▼                                ▼
      📤 sendWeekly.js  ──────→ 📬 HTML-Mail oder PDF-Link
                              └────→ opened.json (Tracking)

---

## 📁 Projektstruktur

| Datei                    | Zweck                                                      |
|--------------------------|-------------------------------------------------------------|
| `parseUsers.js`          | Liest Tally-Daten ein, ermittelt Geodaten & speichert in `users.json` |
| `generateHoroscope.js`   | Erstellt Geburtshoroskop (Planeten, Häuser, Aszendent)     |
| `generateTransits.js`    | Erstellt wöchentliche Transite auf Basis Swiss Ephemeris   |
| `calculate_cycles.py`    | Berechnet Langzeitzyklen (z. B. Saturn-Rückkehr)           |
| `createWeekly.js`        | Erstellt GPT-Text auf Basis der Transite                   |
| `prepareWeekly.js`       | Fügt Rückblick hinzu, exportiert HTML, Markdown & PDF      |
| `sendWeekly.js`          | Versendet HTML-Mail oder PDF-Link, trackt Öffnungen        |
| `sendHoroscope.js`       | Versendet Geburtshoroskop als Willkommensmail              |
| `dashboard/`             | Lokales HTML-Dashboard zur Anzeige von Versanddaten        |
| `weekly/`                | Aktuelle Wochenprognosen pro Nutzer:in                     |
| `weekly_archive/`        | Archivierte Wochenprognosen zur GPT-Reflexion              |
| `sent.json`              | Log mit Versandzeitpunkten je Nutzer:in                    |
| `opened.json`            | Log für E-Mail-Öffnungen (per Tracking-Pixel)              |

---

## 🛠 Setup-Anleitung

### 1. Vorbereitung

- Lege eine `.env` Datei mit folgenden Feldern an:

```env
EMAIL=dein.email@gmail.com
SMTP_PASS=dein_app_passwort
OPENAI_API_KEY=sk-...

