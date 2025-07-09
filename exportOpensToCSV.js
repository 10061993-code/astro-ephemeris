const fs = require('fs');
const path = require('path');

const openedPath = path.join(__dirname, 'opened.json');
const exportPath = path.join(__dirname, 'opened_export.csv');

// ✅ Tracking-Datei laden
const opened = fs.existsSync(openedPath)
  ? JSON.parse(fs.readFileSync(openedPath, 'utf8'))
  : [];

if (opened.length === 0) {
  console.log('❌ Keine geöffneten Einträge vorhanden.');
  process.exit();
}

// 📊 Daten vorbereiten
const summary = {};
opened.forEach(entry => {
  const email = entry.email;
  if (!summary[email]) summary[email] = { count: 0, last: null };
  summary[email].count += 1;
  summary[email].last = entry.timestamp;
});

// 📄 CSV erzeugen
let csv = 'Email,Öffnungen,Zuletzt geöffnet\n';
Object.entries(summary).forEach(([email, data]) => {
  csv += `${email},${data.count},${data.last}\n`;
});

// 💾 Datei schreiben
fs.writeFileSync(exportPath, csv);
console.log(`✅ Export abgeschlossen: ${exportPath}`);

