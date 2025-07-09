const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
let opened = [];

const openedPath = path.join(__dirname, 'opened.json');
if (fs.existsSync(openedPath)) {
  opened = JSON.parse(fs.readFileSync(openedPath, 'utf8'));
}

// Öffnungen nach E-Mail zusammenfassen
const openStats = {};
opened.forEach(entry => {
  const { email, timestamp } = entry;
  if (!openStats[email]) {
    openStats[email] = { count: 0, lastOpened: null };
  }
  openStats[email].count += 1;
  const ts = new Date(timestamp);
  if (!openStats[email].lastOpened || ts > new Date(openStats[email].lastOpened)) {
    openStats[email].lastOpened = ts.toISOString();
  }
});

// 🔢 Zusammenfassung berechnen
const total = users.length;
const openedCount = users.filter(u => openStats[u.email]).length;
const unopenedCount = total - openedCount;
const openRate = total > 0 ? Math.round((openedCount / total) * 100) : 0;

// 💾 summary.json speichern
const summary = {
  totalUsers: total,
  opened: openedCount,
  unopened: unopenedCount,
  openRate: openRate,
  timestamp: new Date().toISOString()
};

fs.writeFileSync('./summary.json', JSON.stringify(summary, null, 2));

app.get('/dashboard', (req, res) => {
  const summaryHtml = `
    <div style="margin-bottom: 1rem; font-size: 1rem;">
      <strong>📊 Wochenübersicht:</strong><br/>
      👥 Nutzer:innen: ${summary.totalUsers}<br/>
      ✅ Geöffnet: ${summary.opened}<br/>
      ❌ Nicht geöffnet: ${summary.unopened}<br/>
      📈 Öffnungsrate: ${summary.openRate} %
    </div>
  `;

  const rows = users.map(user => {
    const stats = openStats[user.email] || {};
    const opened = stats.count ? '✅' : '❌';
    const count = stats.count || 0;
    const last = stats.lastOpened ? new Date(stats.lastOpened).toLocaleString() : '–';

    return `
      <tr>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td style="text-align:center">${opened}</td>
        <td style="text-align:center">${count}</td>
        <td>${last}</td>
      </tr>
    `;
  }).join('\n');

  const html = `
    <html>
      <head>
        <title>📊 Öffnungs-Tracking</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 0.5rem; }
          th { background: #f4f4f4; }
        </style>
      </head>
      <body>
        <h1>📊 Öffnungsstatistik</h1>
        ${summaryHtml}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Geöffnet</th>
              <th>Anzahl</th>
              <th>Zuletzt geöffnet</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`📊 Dashboard läuft auf http://localhost:${PORT}/dashboard`);
});

