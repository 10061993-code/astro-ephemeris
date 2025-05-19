require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

async function generateAnalysisForUser(user) {
  const name = user['Dein Name'];
  const filename = `${name.toLowerCase().replace(/ /g, '_')}_horoskop.txt`;
  const filePath = path.join(__dirname, 'horoscopes', filename);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Keine Horoskop-Datei gefunden für ${name}`);
    return;
  }

  const horoscopeText = fs.readFileSync(filePath, 'utf-8');

  const prompt = `
Du bist Astrologin und verfasst eine reflektierte, moderne Analyse. Die Zielperson ist eine offene Frau zwischen 20 und 
45. 

Bitte beziehe dich auf das folgende Geburtshoroskop und formuliere eine verständliche, bildhafte und emotional berührende 
astrologische Analyse. Vermeide Fachjargon und bleibe nahbar. Nutze bildhafte Vergleiche (z. B. Jahreszeiten, Bühne, 
Wetter, Meer). Zeige Chancen und Potenziale auf, kein Schicksal.

Hier ist das Horoskop:
---
${horoscopeText}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const analysis = completion.choices[0].message.content;
    const outputPath = path.join(__dirname, 'horoscopes', `${name.toLowerCase().replace(/ /g, '_')}_analyse.txt`);
    fs.writeFileSync(outputPath, analysis, 'utf-8');
    console.log(`✅ Analyse für ${name} erstellt: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Fehler bei ${name}:`, error.message);
  }
}

(async () => {
  for (const user of users) {
    await generateAnalysisForUser(user);
  }
})();

