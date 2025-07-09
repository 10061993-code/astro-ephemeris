const fs = require('fs');
const path = require('path');

const openedPath = path.join(__dirname, 'opened.json');
const exportPath = path.join(__dirname, 'opened_export.html');

const opened = fs.existsSync(openedPath)
  ? JSON.parse(fs.readFileSync(openedPath, 'utf8'))
  : [];

if (opened.length === 0) {
  console.log('❌ Keine geöffneten Einträge vorhanden.');
  process.exit();
}

// 📊 Daten sammeln
const summary = {};
opened.forEach(entry => {
  const email = entry.email;
  if (!summary[email]) summary[email] = { count: 0, last: null };
  summary[email].count += 1;
  summary[email].last = entry.timestamp;
});

// 📄 HTML generieren
let html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>Öffnungsstatistik</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; }
    table { border-collapse: collapse; width: 100%; max-width: 800px; margin: auto; }
    th, td { border: 1px solid #ccc; padding: 0.5rem 1rem; text-align: left; }
    th { background-color: #f5f5f5; }
    tr:nth-child(even) { background-color: #fafafa; }
  </style>
</head>
<body>
  <h2>📊 Öffnungsstatistik</h2>
  <table>
    <tr><th>Email</th><th>Öffnungen</th><th>Zuletzt geöffnet</th></tr>`;

Object.entries(summary).forEach(([email, data]) => {
  html += `<tr><td>${email}</td><td>${data.count}</td><td>${data.last}</td></tr>`;
});

html += `
  </table>
</body>
</html>`;

// 💾 Speichern
fs.writeFileSync(exportPath, html);
console.log(`✅ HTML-Export gespeichert unter: ${exportPath}`);

