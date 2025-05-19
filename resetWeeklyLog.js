const fs = require("fs");
const path = require("path");

const sentPath = path.join(__dirname, "data", "sent.json");

if (!fs.existsSync(sentPath)) {
  console.log("⚠️ Keine sent.json gefunden – nichts zu resetten.");
  process.exit(0);
}

const sentLog = JSON.parse(fs.readFileSync(sentPath, "utf8"));

Object.keys(sentLog).forEach(email => {
  if (sentLog[email].weekly) {
    delete sentLog[email].weekly;
  }
});

fs.writeFileSync(sentPath, JSON.stringify(sentLog, null, 2), "utf8");
console.log("♻️ Wöchentliche Versand-Logs für Wochenprognosen zurückgesetzt.");

