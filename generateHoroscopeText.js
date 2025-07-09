import dotenv from 'dotenv';
dotenv.config();

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generiert einen astrologischen Horoskoptext basierend auf Häuser-, Aszendent- und MC-Daten.
 * @param {Object} astroData - Die astrologischen Daten (houses, ascendant, mc).
 * @param {Object} user - Nutzerinformationen (Name, Geburtsdatum etc.).
 * @returns {Promise<string>} - Generierter Horoskoptext.
 */
export async function generateHoroscopeText(astroData, user) {
  const prompt = `
Du bist ein einfühlsamer und moderner Astrologe. Bitte schreibe einen persönlichen Horoskoptext für ${user.name}.

Die astrologischen Eckdaten sind:
- Aszendent: ${astroData.ascendant.toFixed(2)}°
- Medium Coeli (MC): ${astroData.mc.toFixed(2)}°
- Häuserpositionen (Grad): ${astroData.houses.map(h => h.toFixed(2)).join(", ")}

Schreibe den Text motivierend, klar strukturiert und persönlich.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 700,
    temperature: 0.8,
  });

  return response.choices[0].message.content.trim();
}

