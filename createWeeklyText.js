import dotenv from 'dotenv';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Erzeugt einen Wochenprognose-Text auf Basis der Transite
 * @param {Object} user - Die Nutzerdaten (inkl. Name etc.)
 * @param {Object} transitsData - JSON mit den Transiten dieser Woche
 * @param {Object|null} lastWeekData - Optionaler Rückblick auf letzte Woche
 * @returns {Promise<string>} - GPT-generierter Wochenprognosetext
 */
export async function createWeeklyText(user, transitsData, lastWeekData = null) {
  const style = await fs.readFile(path.join(__dirname, 'promptStyle.txt'), 'utf-8');

  const systemPrompt = `Du bist eine erfahrene astrologische Texterin. Du schreibst moderne, reflektierte und bildhafte Wochenhoroskope für Frauen zwischen 20 und 
45 Jahren.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Hier ist der Stil der Texte:\n\n${style}`
    },
    {
      role: 'user',
      content: `Name der Nutzerin: ${user.name}\nGeburtsdatum: ${user.birthDate} – analysiere bitte auf dieser Basis.\n\nHier sind die astrologischen Transite für 
diese Woche:\n${JSON.stringify(transitsData, null, 2)}`
    }
  ];

  if (lastWeekData) {
    messages.push({
      role: 'user',
      content: `Zum Vergleich: So sah die letzte Woche aus:\n${JSON.stringify(lastWeekData, null, 2)}\nBitte beziehe dich bei Bedarf auf Entwicklungen.`
    });
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    temperature: 0.9
  });

  const text = completion.choices[0]?.message?.content?.trim() || '⚠️ GPT-Antwort war leer.';
  return text;
}

