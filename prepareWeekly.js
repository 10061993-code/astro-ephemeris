const fs = require('fs');
const path = require('path');
const { getTransitsForUser } = require('./getTransits');
const { getPromptStyle } = require('./promptStyle');
const { OpenAI } = require('openai');
const createPdf = require('./utils/createPdf'); // ✅ PDF-Erstellung einbinden

require('dotenv').config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// 📅 Nächsten Sonntag berechnen
const currentDate = new Date();
const nextSunday = new Date(currentDate);
nextSunday.setDate(currentDate.getDate() + ((7 - currentDate.getDay()) % 7));
nextSunday.setHours(0, 0, 0, 0);

// 📁 Nutzer:innen laden
const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));

// ✨ Stiltext laden
const promptStyle = getPromptStyle();

// 🧠 Funktion zur GPT-Vorhersage + PDF-Erstellung
async function generateForecast(user) {
  try {
    // Transite berechnen
    const astroUser = {
      name: user.name,
      birthdate: user.geburtsdatum,
      birthtime: user.geburtszeit,
      birthplace: user.geburtsort,
      lat: user.lat,
      lon: user.lon,
      email: user.email
    };

    const transits = getTransitsForUser(astroUser, nextSunday);

    // Vorwoche laden
    const lastWeekPath = path.join(__dirname, 'weekly_archive', `${user.name.toLowerCase()}_last.json`);
    const lastWeek = fs.existsSync(lastWeekPath)
      ? JSON.parse(fs.readFileSync(lastWeekPath, 'utf8'))
      : { gptText: '' };

    // Prompt vorbereiten
    const prompt = {
      user: astroUser,
      transits,
      lastWeek: { gptText: lastWeek.gptText },
      instruction: `Falls sich relevante Themen aus der Vorwoche fortsetzen – z. B. durch wiederkehrende Transite,
längerfristige Entwicklungen oder emotionale Prozesse – kannst du zu Beginn einen kurzen Rückblick einbauen. Wenn
sich die Themen jedoch deutlich verändern oder kein Bezug besteht, beginne direkt mit der neuen Woche.`,
      style: promptStyle
    };

    // GPT anfragen
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Du bist eine reflektierte astrologische Begleiterin mit psychologischer Tiefe.' },
        { role: 'user', content: JSON.stringify(prompt) }
      ]
    });

    const gptText = completion.choices[0].message.content.trim();

    // Ergebnis als JSON speichern
    const filename = `${user.name.toLowerCase()}_weekly.json`;
    const outputPath = path.join(__dirname, 'weekly', filename);
    fs.writeFileSync(outputPath, JSON.stringify({ gptText }, null, 2));

    console.log(`✅ Wochenprognose gespeichert für ${user.name}`);

    // PDF-Export vorbereiten
    const htmlContent = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: sans-serif; line-height: 1.6; padding: 2rem; }
            h1 { font-size: 1.5rem; }
          </style>
        </head>
        <body>
          <h1>Wochenprognose für ${user.name}</h1>
          <p>${gptText.replace(/\n/g, '<br>')}</p>
        </body>
      </html>
    `;

    const today = new Date().toISOString().split("T")[0];
    const pdfPath = await createPdf({
      htmlContent,
      userId: user.id?.toString() || user.name.toLowerCase(),
      creatorId: "default",
      date: today,
      type: "weekly"
    });

    console.log(`📄 PDF erzeugt unter: ${pdfPath}`);

  } catch (err) {
    console.error(`❌ Fehler bei ${user.name}:`, err.message);
  }
}

// 🔁 Alle Nutzer:innen verarbeiten
async function runAll() {
  for (const user of users) {
    if (!user.name || !user.geburtsdatum || !user.geburtszeit || !user.lat || !user.lon) {
      console.warn(`⚠️ Nutzer ${user.name || '[unbekannt]'} hat unvollständige Daten – übersprungen.`);
      continue;
    }
    await generateForecast(user);
  }
}

runAll();

