const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getLastSunday(offset = 1) {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day - 7 * offset;
  const sunday = new Date(today.setDate(diff));
  return sunday.toISOString().split('T')[0];
}

async function createWeeklyRecap(user, thisWeekDate) {
  const slug = user.name.toLowerCase().replace(/\s+/g, '_');

  const newPath = path.join(__dirname, 'weekly', `${slug}_weekly.txt`);
  const oldDate = getLastSunday(1);
  const oldPath = path.join(__dirname, 'weekly_archive', `${slug}_${oldDate}.txt`);

  if (!fs.existsSync(newPath)) {
    console.warn(`❌ Neue Prognose für ${user.name} fehlt – kein Rückblick möglich.`);
    return;
  }

  const newText = fs.readFileSync(newPath, 'utf-8');
  const oldText = fs.existsSync(oldPath)
    ? fs.readFileSync(oldPath, 'utf-8')
    : 'Keine Prognose zur Vorwoche vorhanden.';

  const promptStyle = fs.existsSync('./prompts/promptStyle.txt')
    ? fs.readFileSync('./prompts/promptStyle.txt', 'utf-8')
    : '';

  const prompt = `
Du bist ein reflektierter astrologischer Assistent. Dein Ziel ist es, einen Rückblick zu formulieren, der die aktuelle 
astrologische Woche mit der Vorwoche vergleicht. Verwende eine moderne, einfühlsame Sprache und schreibe für eine 
reflektierte Frau zwischen 20 und 45.

Vorwoche:
"""
${oldText}
"""

Diese Woche:
"""
${newText}
"""

Schreibe eine Einleitung im Stil eines Rückblicks. Beginne mit: "Im Vergleich zur letzten Woche..."
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: promptStyle },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  const recap = response.choices[0].message.content.trim();
  const finalText = `${recap}\n\n${newText}`;
  fs.writeFileSync(newPath, finalText, 'utf-8');
  console.log(`🔁 Rückblick eingefügt für ${user.name}`);
}

module.exports = { createWeeklyRecap };

