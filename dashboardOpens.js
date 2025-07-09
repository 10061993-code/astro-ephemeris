const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3080;

app.get('/', (req, res) => {
  const openedPath = path.join(__dirname, 'opened.json');
  const sentPath = path.join(__dirname, 'sent.json');

  if (!fs.existsSync(openedPath)) {
    return res.send('<h2>❌ Keine opened.json gefunden.</h2>');
  }

  const openedRaw = JSON.parse(fs.readFileSync(openedPath, 'utf8'));
  const sentRaw = fs.existsSync(sentPath)
    ? JSON.parse(fs.readFileSync(sentPath, 'utf8'))
    : {};

  const openedStats = {};
  openedRaw.forEach(entry => {
    const email = entry.email;
    if (!openedStats[email]) openedStats[email] = { count: 0, last: null };
    openedStats[email].count += 1;
    openedStats[email].last = entry.timestamp;
  });

  const rows = Object.entries(sentRaw).map(([email, sendData]) => {
    const opens = openedStats[email]?.count || 0;
    const lastOpen = openedStats[email]?.last
      ? new Date(openedStats[email].last).toLocaleString()
      : '–';
    const rate = ((opens / sendData.sent) * 100).toFixed(1) + '%';

    return `
      <tr>
        <td>${email}</td>
        <td>${sendData.sent}</td>
        <td>${opens}</td>
        <td>${rate}</td>
        <td>${lastOpen}</td>
      </tr>
    `;
  }).join('');

  const html = `
  <!DOCTYPE html>
  <html lang="de">
  <head>
    <meta charset="UTF-8" />
    <title>📬 Öffnungsstatistik</title>
    <style>
      body { font-family: sans-serif; padding: 2rem; }
      table { border-collapse: collapse; width: 100%; max-width: 900px; margin: auto; }
      th, td { border: 1px solid #ccc; padding: 0.5rem 1rem; text-align: left; }
      th { background-color: #f0f0f0; cursor: pointer; }
      tr:nth-child(even) { background-color: #f9f9f9; }
      input { margin-bottom: 1rem; width: 300px; padding: 0.5rem; }
    </style>
    <script>
      function sortTable(n) {
        const table = document.getElementById("openTable");
        let switching = true, dir = "asc", switchcount = 0;
        while (switching) {
          switching = false;
          const rows = table.rows;
          for (let i = 1; i < rows.length - 1; i++) {
            let shouldSwitch = false;
            const x = rows[i].getElementsByTagName("TD")[n];
            const y = rows[i + 1].getElementsByTagName("TD")[n];
            if ((dir === "asc" && x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) ||
                (dir === "desc" && x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase())) {
              shouldSwitch = true;
              break;
            }
          }
          if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
          } else {
            if (switchcount === 0 && dir === "asc") {
              dir = "desc";
              switching = true;
            }
          }
        }
      }

      function filterTable() {
        const input = document.getElementById("searchInput").value.toLowerCase();
        const rows = document.querySelectorAll("#openTable tbody tr");
        rows.forEach(row => {
          const email = row.cells[0].textContent.toLowerCase();
          row.style.display = email.includes(input) ? "" : "none";
        });
      }
    </script>
  </head>
  <body>
    <h2>📈 Öffnungsstatistik (mit Öffnungsrate)</h2>
    <input id="searchInput" type="text" onkeyup="filterTable()" placeholder="🔍 Suche nach E-Mail..." />
    <table id="openTable">
      <thead>
        <tr>
          <th onclick="sortTable(0)">E-Mail</th>
          <th onclick="sortTable(1)">Gesendet</th>
          <th onclick="sortTable(2)">Geöffnet</th>
          <th onclick="sortTable(3)">Rate</th>
          <th onclick="sortTable(4)">Zuletzt geöffnet</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </body>
  </html>`;

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`📊 Dashboard mit Öffnungsrate läuft auf http://localhost:${PORT}`);
});

