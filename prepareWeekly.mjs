import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import getPromptStyle from './promptStyle.js';
import createPdf from './createPdf.js';
import getTransitsForUser from './getTransits.js';
import dotenv from 'dotenv';

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 📅 Nächsten Sonntag berechnen
const currentDate = new Date();
const nextSunday = new Date(currentDate);
nextSunday.setDate(currentDate.getDate() + ((7 - currentDate.getDay()) % 7));
nextSunday.setHours(0, 0, 0, 0);

// 📁 Nutzer:innen laden
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf8'));

// ✨ Stiltext laden
const promptStyle = getPromptStyle();

// 🧠 Funktion zur GPT-Vorhersage
async function generateForecast(user) {
  try {
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

    const lastWeekPath = path.join(__dirname, 'weekly_archive', `${user.name.toLowerCase()}_last.json`);
    const lastWeek = fs.existsSync(lastWeekPath)
      ? JSON.parse(fs.readFileSync(lastWeekPath, 'utf8'))
      : { gptText: '' };

    const prompt = {
      user: astroUser,
      transits,
      lastWeek: { gptText: lastWeek.gptText },
      instruction: `Falls sich relevante Themen aus der Vorwoche fortsetzen – z. B. durch wiederkehrende Transite,
längerfristige Entwicklungen oder emotionale Prozesse – kannst du zu Beginn einen kurzen Rückblick einbauen. Wenn sich die Themen jedoch deutlich verändern oder 
kein Bezug besteht, beginne direkt mit der neuen Woche.`,
      style: promptStyle
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Du bist eine reflektierte astrologische Begleiterin mit psychologischer Tiefe.' },
        { role: 'user', content: JSON.stringify(prompt) }
      ]
    });

    const gptText = completion.choices[0].message.content.trim();

    // Prognose speichern
    const filename = `${user.name.toLowerCase()}_weekly.json`;
    const outputPath = path.join(__dirname, 'weekly', filename);
    fs.writeFileSync(outputPath, JSON.stringify({ gptText }, null, 2));

    // PDF erzeugen
    const htmlContent = `<h1>Wochenprognose für ${user.name}</h1><p>${gptText.replace(/\n/g, '<br>')}</p>`;
    await createPdf(htmlContent, user, nextSunday);

    console.log(`✅ Wochenprognose + PDF gespeichert für ${user.name}`);
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

