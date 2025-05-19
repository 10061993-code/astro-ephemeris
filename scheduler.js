const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, "log", "scheduler.log");
const now = new Date();

function log(message) {
  const timestamp = `[${now.toLocaleString("de-DE")}]`;
  const entry = `${timestamp} ${message}\n`;
  fs.appendFileSync(logPath, entry);
  console.log(entry.trim());
}

log("Scheduler gestartet und aktiv");

let alreadyRan = {
  prepare: false,
  send: false,
};

setInterval(() => {
  const now = new Date();

  // Vorbereitung: Donnerstag 08:00 Uhr
  if (now.getDay() === 4 && now.getHours() === 8 && !alreadyRan.prepare) {
    log("📅 Starte Vorbereitung der Wochenprognosen...");
    try {
      execSync("node prepareWeekly.js", { stdio: "inherit" });
      log("✅ Prognosen vorbereitet.");
    } catch (err) {
      log("❌ Fehler bei Vorbereitung: " + err.message);
    }
    alreadyRan.prepare = true;
  }

  // Versand: Sonntag 08:00 Uhr
  if (now.getDay() === 0 && now.getHours() === 8 && !alreadyRan.send) {
    log("📤 Starte Versand der Wochenprognosen...");
    try {
      execSync("node sendWeekly.js", { stdio: "inherit" });
      execSync("node sendWeeklyPdf.js", { stdio: "inherit" });
      execSync("node sendLogMail.js", { stdio: "inherit" }); // 💌 Logauszug an Admin
      log("✅ Versand abgeschlossen.");
    } catch (err) {
      log("❌ Fehler beim Versand: " + err.message);
    }
    alreadyRan.send = true;
  }

  // Tägliches Zurücksetzen der Flags um 01:00 Uhr
  if (now.getHours() === 1 && now.getMinutes() === 0) {
    alreadyRan.prepare = false;
    alreadyRan.send = false;
    log("🔁 Tages-Flags zurückgesetzt.");
  }
}, 60 * 1000); // Alle 60 Sekunden prüfen

