const fs = require("fs");
const path = require("path");

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));

function getUpcomingSunday(date) {
  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7));
  return sunday.toISOString().split("T")[0];
}

function exportHtml(user) {
  const name = user.name.toLowerCase();
  const sourcePath = path.join(__dirname, "weekly", `${name}_weekly.txt`);
  if (!fs.existsSync(sourcePath)) return;

  const content = fs.readFileSync(sourcePath, "utf8").replace(/\n/g, "<br>");
  const date = getUpcomingSunday(new Date());
  const destPath = path.join(__dirname, "exports_html", `${name}_${date}.html`);

  const html = `
  <!DOCTYPE html>
  <html lang="de">
  <head>
    <meta charset="UTF-8">
    <title>Wochenprognose für ${user.name}</title>
    <style>
      body {
        font-family: sans-serif;
        padding: 2rem;
        line-height: 1.6;
        max-width: 700px;
        margin: auto;
        background-color: #fdfcf9;
        color: #333;
      }
      h1 {
        font-size: 1.8rem;
        color: #444;
      }
    </style>
  </head>
  <body>
    <h1>🌟 Wochenprognose für ${user.name} – ${date}</h1>
    <p>${content}</p>
  </body>
  </html>
  `;

  fs.writeFileSync(destPath, html);
  console.log(`✅ HTML exportiert für ${user.name}: ${destPath}`);
}

// Für alle Nutzer:innen
for (const user of users) {
  exportHtml(user);
}

