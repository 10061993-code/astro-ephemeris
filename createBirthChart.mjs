// createBirthChart.mjs
import fs from 'fs/promises';
import path from 'path';
import 'dotenv/config';
import { OpenAI } from 'openai';
import { getPromptStyle } from './promptStyle.js';
import { createPdf } from './createPdf.js';
import { renderBirthChartHTML } from './renderBirthChart.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Beispielnutzer (kannst du später dynamisch einlesen)
const user = {
  name: 'Caroline',
  birthDate: '1994-05-15',
  birthTime: '14:35',
  birthPlace: 'Berlin',
  sun: 'Zwillinge',
  moon: 'Krebs',
  ascendant: 'Fische',
  mars: 'Löwe',
  mercury: 'Stier',
  venus: 'Zwillinge',
};

const promptStyle = await getPromptStyle();

const prompt = `
Schreibe ein Geburtshoroskop für eine Frau mit folgenden astrologischen Daten:

- Sonnenzeichen: ${user.sun}
- Mondzeichen: ${user.moon}
- Aszendent: ${user.ascendant}
- Merkur: ${user.mercury}
- Venus: ${user.venus}
- Mars: ${user.mars}

Das Horoskop soll reflektiert, nahbar, motivierend und modern klingen. Richte dich direkt an die Nutzerin "${user.name}". Verwende folgenden Stil:

${promptStyle}
`;

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.8,
});

const horoscopeText = completion.choices[0].message.content;
const safeName = user.name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
const date = new Date().toLocaleDateString('de-DE', { dateStyle: 'long' });

const jsonPath = path.join('birthcharts', `${safeName}_birth.json`);
await fs.writeFile(jsonPath, JSON.stringify({ user, horoscopeText }, null, 2), 'utf-8');
console.log(`✅ JSON gespeichert: ${jsonPath}`);

// PDF erstellen
await createPdf({ user, text: horoscopeText, date }, 'birthcharts');

// HTML erstellen
await renderBirthChartHTML({ user, text: horoscopeText, date });

