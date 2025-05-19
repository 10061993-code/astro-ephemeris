require("dotenv").config();
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));
const style = fs.readFileSync(path.join(__dirname, "prompts", "promptStyle.txt"), "utf8");

async function generateWeeklyText(user, name) {
  const transitsPath = path.join(__dirname, "transits", `${name}_week.json`);
  if (!fs.existsSync(transitsPath)) {
    console.log(`⚠️ Keine Transite gefunden für ${user.name} – übersprungen.`);
    return;
  }

  const transits = fs.readFileSync(transitsPath, "utf8");

  // 🧠 Letzte Wochenprognose laden
  const archiveDir = path.join(__dirname, "weekly_archive");
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir);
  const archiveFiles = fs.readdirSync(archiveDir)
    .filter(f => f.startsWith(`${name}_`))
    .sort()
    .reverse();

  const lastWeekFile = archiveFiles[1]; // [0] wäre aktuelle Woche
  let lastWeekText = "";

  if (lastWeekFile) {
    const lastPath = path.join(archiveDir, lastWeekFile);
    lastWeekText = fs.readFileSync(lastPath, "utf8");
  }

  const prompt = `
Stil: ${style}

Hier ist die letzte Wochenprognose für ${user.name}:
"""${lastWeekText}"""

Hier sind die astrologischen Transite für diese Woche:
"""${transits}"""

Bitte schreibe eine neue Wochenprognose für ${user.name}.
Beziehe dich auf die Themen der Vorwoche. Was setzt sich fort? Was verändert sich?
Tonalität: reflektiert, nahbar, modern. Persönlich, aber nicht esoterisch.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  const finalText = completion.choices[0].message.content;
  const outputPath = path.join(__dirname, "weekly", `${name}_weekly.txt`);
  fs.writeFileSync(outputPath, finalText, "utf8");

  // 🗂 Prognose archivieren
  const weekStart = new Date().toISOString().slice(0, 10); // z. B. 2025-05-19
  const archivePath = path.join(archiveDir, `${name}_${weekStart}.txt`);
  fs.copyFileSync(outputPath, archivePath);

  console.log(`✅ Wochenhoroskop gespeichert unter: ${outputPath}`);
}

(async () => {
  for (const user of users) {
    const name = user.name.toLowerCase();
    await generateWeeklyText(user, name);
  }
})();

