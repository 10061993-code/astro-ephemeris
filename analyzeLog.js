require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const logPath = path.join(__dirname, "log", "scheduler.log");
const summaryPath = path.join(__dirname, "log", "summary.txt");

async function summarizeLog() {
  const logText = fs.readFileSync(logPath, "utf8");

  const userPrompt = `
Hier ist ein Logfile eines astrologischen Newsletter-Systems.
Fasse bitte zusammen, was passiert ist – besonders: Wer hat wann Horoskope erhalten?
Welche Fehler oder Auffälligkeiten sind aufgetreten?

${logText}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.5,
    messages: [
      { role: "system", content: "Du bist ein hilfreicher Log-Analyst." },
      { role: "user", content: userPrompt }
    ]
  });

  const summary = response.choices[0].message.content.trim();
  fs.writeFileSync(summaryPath, summary, "utf8");
  console.log("✅ Zusammenfassung gespeichert unter: log/summary.txt");
}

summarizeLog().catch((err) => {
  console.error("❌ Fehler bei Log-Zusammenfassung:", err);
});

