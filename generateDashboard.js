const fs = require("fs");
const path = require("path");

const usersPath = path.join(__dirname, "data", "users.json");
const sentPath = path.join(__dirname, "data", "sent.json");
const logPath = path.join(__dirname, "log", "scheduler.log");
const summaryPath = path.join(__dirname, "log", "summary.txt");
const outPath = path.join(__dirname, "dashboard.html");

const users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
const sent = fs.existsSync(sentPath) ? JSON.parse(fs.readFileSync(sentPath, "utf8")) : {};
const log = fs.existsSync(logPath) ? fs.readFileSync(logPath, "utf8") : "Noch keine Logeinträge.";

function fileExists(folder, filename) {
  return fs.existsSync(path.join(__dirname, folder, filename));
}

const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>Astro-Dashboard</title>
  <style>
    body { font-family: sans-serif; padding: 2rem; background: #f9f9f9; }
    h1, h2 { color: #333; }
    pre { background: #fff; padding: 1rem; border: 1px solid #ddd; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin-top: 1rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
    th { background: #eee; }
    .yes { color: green; font-weight: bold; }
    .no { color: red; }
    .date { font-size: 0.85em; color: #555; }
  </style>
</head>
<body>
  <h1>✨ Astro-Newsletter Dashboard</h1>

  <h2>👥 Nutzerstatus</h2>
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>E-Mail</th>
        <th>📄 Geburtshoroskop</th>
        <th>📆 Wochenprognose</th>
        <th>🗂 Archivierte Wochen</th>
        <th>📤 Letzter Versand</th>
      </tr>
    </thead>
    <tbody>
      ${users.map(u => {
        const name = u.name.toLowerCase();
        const email = u.email;
        const hasBirth = fileExists("horoscope", `${name}_horoscope.json`);
        const hasWeekly = fileExists("weekly", `${name}_weekly.txt`);
        const birthSent = sent[email]?.birth ? new Date(sent[email].birth).toLocaleString("de-DE") : "—";
        const weeklySent = sent[email]?.weekly ? new Date(sent[email].weekly).toLocaleString("de-DE") : "—";
        const weeksArchived = fs.existsSync("weekly_archive")
          ? fs.readdirSync("weekly_archive").filter(f => f.startsWith(`${name}_`)).length
          : 0;

        return `<tr>
          <td>${u.name}</td>
          <td>${email}</td>
          <td class="${hasBirth ? 'yes' : 'no'}">${hasBirth ? "✅" : "—"}</td>
          <td class="${hasWeekly ? 'yes' : 'no'}">${hasWeekly ? "✅" : "—"}</td>
          <td>${weeksArchived}</td>
          <td>
            <div class="date">🎂 ${birthSent}</div>
            <div class="date">📆 ${weeklySent}</div>
          </td>
        </tr>`;
      }).join("\n")}
    </tbody>
  </table>

  <h2>🧠 GPT-Zusammenfassung</h2>
  ${
    fs.existsSync(summaryPath)
      ? `<a href="log/summary.txt" target="_blank">📝 summary.txt anzeigen</a>`
      : "Noch keine Zusammenfassung vorhanden."
  }

  <h2>📋 Letzte Logeinträge</h2>
  <pre>${log}</pre>
</body>
</html>
`;

fs.writeFileSync(outPath, html, "utf8");
console.log(`✅ Dashboard aktualisiert: ${outPath}`);

