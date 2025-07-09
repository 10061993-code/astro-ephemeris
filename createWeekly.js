const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config();

const users = require('./users.json');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '_');
}

async function generateWeeklyText(transits, promptStyle, user) {
  const intro = `Erstelle eine einfühlsame, moderne astrologische Wochenprognose für eine Frau namens ${user.name}, 
basierend auf diesen Transiten:\n\n${JSON.stringify(transits, null, 2)}\n\nDie Tonalität ist reflektiert, psychologisch 
und nahbar.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: promptStyle },
      { role: 'user', content: intro },
    ],
    temperature: 0.75,
  });

  return response.choices[0].message.content.trim();
}

(async () => {
  const promptStyle = fs.existsSync('./prompts/promptStyle.txt')
    ? fs.readFileSync('./prompts/promptStyle.txt', 'utf-8')
    : 'Du schreibst astrologische Texte für eine reflektierte, moderne Zielgruppe.';

  for (const user of users) {
    const slug = slugify(user.name);
    const transitPath = path.join(__dirname, 'transits', `${slug}_week.json`);
    const outputPath = path.join(__dirname, 'weekly', `${slug}_weekly.txt`);

    if (!fs.existsSync(transitPath)) {
      console.warn(`⚠️ Keine Transite für ${user.name} gefunden – übersprungen.`);
      continue;
    }

    const transits = JSON.parse(fs.readFileSync(transitPath, 'utf-8'));
    const weeklyText = await generateWeeklyText(transits, promptStyle, user);

    fs.writeFileSync(outputPath, weeklyText, 'utf-8');
    console.log(`✅ Wochenprognose gespeichert für ${user.name}`);
  }
})();

