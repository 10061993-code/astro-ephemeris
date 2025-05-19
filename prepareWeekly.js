const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const puppeteer = require("puppeteer");
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

function log(msg) {
  const timestamp = new Date().toLocaleString("de-DE");
  fs.appendFileSync("log/scheduler.log", `[${timestamp}] ${msg}\n`);
}

function sanitizeFileName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

function exportMarkdown(name, content, date) {
  const filename = `${sanitizeFileName(name)}_${date}.md`;
  const filepath = path.join(__dirname, "exports_markdown", filename);
  fs.writeFileSync(filepath, content);
  console.log(`📝 Markdown exportiert für ${name}: ${filepath}`);
}

function exportHTML(name, content, date) {
  const filename = `${sanitizeFileName(name)}_${date}.html`;
  const filepath = path.join(__dirname, "exports_html", filename);
  const html = `
    <html lang="de"><head><meta charset="UTF-8" />
    <title>Wochenhoroskop für ${name}</title></head>
    <body style="font-family:sans-serif;padding:2rem;max-width:700px;margin:auto;white-space:pre-wrap;">
    ${content}
    </body></html>
  `;
  fs.writeFileSync(filepath, html);
  console.log(`🌐 HTML exportiert für ${name}: ${filepath}`);
}

async function exportPDF(name, content, date) {
  const filename = `${sanitizeFileName(name)}_${date}.pdf`;
  const filepath = path.join(__dirname, "exports_pdf", filename);
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  const html = `
    <html lang="de"><head><meta charset="UTF-8" />
    <style>body{font-family:sans-serif;padding:2rem;max-width:700px;margin:auto;white-space:pre-wrap;}</style>
    </head><body>${content}</body></html>
  `;
  await page.setContent(html);
  await page.pdf({ path: filepath, format: "A4" });
  await browser.close();

  console.log(`📄 PDF exportiert für ${name}: ${filepath}`);
}

async function createWeeklyRecap(user, date) {
  const name = user.name.toLowerCase();
  const currentPath = path.join(__dirname, "weekly", `${name}_weekly.txt`);
  const lastWeekPath = path.join(__dirname, "weekly_archive", `${name}_${getLastSunday(date)}.txt`);

  if (!fs.existsSync(currentPath) || !fs.existsSync(lastWeekPath)) {
    console.log(`⚠️ Rückblick übersprungen für ${user.name} (fehlende Archivdatei)`);
    return;
  }

  const previous = fs.readFileSync(lastWeekPath, "utf8");
  const current = fs.readFileSync(currentPath, "utf8");

  const prompt = `
Du bist eine moderne Astrologin. Erstelle einen einleitenden Rückblick zur aktuellen Woche, basierend auf der Prognose der letzten Woche.

- Maximal 5 Sätze
- Keine Wiederholung des alten Textes
- Tonalität: empathisch, reflektierend, nicht esoterisch
- Beginne mit: „Im Vergleich zur letzten Woche…“

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
    fs.writeFileSync(currentPath, `${recap}\n\n${current}`);
    console.log(`🧠 Rückblick ergänzt für ${user.name}`);
  } catch (err) {
    console.error(`❌ Rückblicksfehler bei ${user.name}: ${err.message}`);
  }
}

async function prepareWeekly() {
  const date = new Date();
  const sunday = getUpcomingSunday(date);
  log("📅 Starte Vorbereitung der Wochenprognosen...");

  for (const user of users) {
    const name = user.name.toLowerCase();

    // 1. Archivieren
    const oldPath = path.join(__dirname, "weekly", `${name}_weekly.txt`);
    if (fs.existsSync(oldPath)) {
      const archivePath = path.join(__dirname, "weekly_archive", `${name}_${getLastSunday(date)}.txt`);
      fs.copyFileSync(oldPath, archivePath);
      log(`📦 Wochenprognose archiviert für ${user.name}: ${archivePath}`);
    }

    // 2. Transite generieren
    try {
      execSync(`node generateTransits.js --user ${name}`, { stdio: "ignore" });
    } catch {
      console.log(`⚠️ Fehler beim Transit-Export für ${user.name}`);
    }

    // 3. Wochenhoroskop generieren
    try {
      execSync(`node createWeekly.js --user ${name}`, { stdio: "ignore" });
    } catch {
      console.log(`⚠️ Fehler beim Text-Export für ${user.name}`);
    }

    // 4. GPT-Rückblick
    await createWeeklyRecap(user, date);

    // 5. Exportieren
    const weeklyPath = path.join(__dirname, "weekly", `${name}_weekly.txt`);
    if (fs.existsSync(weeklyPath)) {
      const content = fs.readFileSync(weeklyPath, "utf8");
      const exportDate = getUpcomingSunday(date);

      exportMarkdown(user.name, content, exportDate);
      exportHTML(user.name, content, exportDate);
      await exportPDF(user.name, content, exportDate);
    }
  }

  log("✅ Prognosen vorbereitet.");
}

prepareWeekly();

