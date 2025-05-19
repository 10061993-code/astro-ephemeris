require("dotenv").config();
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));

async function generateTransitsForUser(user, name) {
  const horoscopePath = path.join(__dirname, "horoscope", `${name}_horoscope.json`);
  if (!fs.existsSync(horoscopePath)) {
    console.log(`⚠️ Kein Geburtshoroskop gefunden für ${user.name} – übersprungen.`);
    return;
  }

  const horoscope = JSON.parse(fs.readFileSync(horoscopePath, "utf8"));

  const prompt = `
Die folgende Nutzerin hat dieses Geburtshoroskop:

${JSON.stringify(horoscope, null, 2)}

Bitte berechne astrologische Transite für die kommende Woche.
Gehe dabei insbesondere auf sensible Punkte wie Sonne, Mond, Mars, Venus und Aszendent ein.

Gib eine klare, astrologisch fundierte Zusammenfassung der Konstellationen in JSON-Struktur zurück.
Verwende Stichworte wie „Kraft“, „Klarheit“, „Innere Bewegung“, „Impulse“, „Beziehungen“, „Wachstum“ usw., aber ohne 
esoterische Floskeln.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const analysis = completion.choices[0].message.content;

    const outputPath = path.join(__dirname, "transits", `${name}_week.json`);
    fs.writeFileSync(outputPath, analysis, "utf8");
    console.log(`✅ Transite für ${user.name} gespeichert unter: ${outputPath}`);
  } catch (err) {
    console.error(`❌ Fehler bei ${user.name}:`, err.message);
  }
}

(async () => {
  for (const user of users) {
    const name = user.name.toLowerCase();
    await generateTransitsForUser(user, name);
  }
})();

