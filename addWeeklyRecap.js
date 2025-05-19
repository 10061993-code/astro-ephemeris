const fs = require("fs");
const path = require("path");
require("dotenv").config();
const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));

function getUpcomingSunday(date) {
  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7));
  return sunday.toISOString().split("T")[0];
}

function getLastSunday(date) {
  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() - sunday.getDay());
  return sunday.toISOString().split("T")[0];
}

async function createRecap(user) {
  const name = user.name.toLowerCase();
  const thisWeek = getUpcomingSunday(new Date());
  const lastWeek = getLastSunday(new Date());

  const currentPath = path.join(__dirname, "weekly", `${name}_weekly.txt`);
  const previousPath = path.join(__dirname, "weekly_archive", `${name}_${lastWeek}.txt`);

  if (!fs.existsSync(currentPath) || !fs.existsSync(previousPath)) {
    console.log(`⚠️ Rückblick übersprungen für ${user.name} (fehlende Dateien)`);
    return;
  }

  const previous = fs.readFileSync(previousPath, "utf8");
  const current = fs.readFileSync(currentPath, "utf8");

  const prompt = `
Du bist eine moderne Astrologin. Erstelle einen einleitenden Rückblick zur aktuellen Woche, basierend auf der Prognose der letzten Woche.

- Schreibe maximal 5 Sätze
- Keine Wiederholung des alten Textes
- Tonalität: empathisch, reflektierend, nicht esoterisch
- Beginne mit einer Formulierung wie „Im Vergleich zur letzten Woche…“

Letzte Woche:
${previous}

Diese Woche:
${current}

Rückblick:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const recap = response.choices[0].message.content.trim();
    const combined = `${recap}\n\n${current}`;
    fs.writeFileSync(currentPath, combined);
    console.log(`🔁 Rückblick ergänzt für ${user.name}`);
  } catch (err) {
    console.error(`❌ Fehler bei ${user.name}: ${err.message}`);
  }
}

async function run() {
  for (const user of users) {
    await createRecap(user);
  }
}

run();
