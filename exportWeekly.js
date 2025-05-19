const fs = require("fs");
const path = require("path");

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));

function getUpcomingSunday(date) {
  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7));
  return sunday.toISOString().split("T")[0];
}

function exportMarkdown(user) {
  const name = user.name.toLowerCase();
  const sourcePath = path.join(__dirname, "weekly", `${name}_weekly.txt`);
  if (!fs.existsSync(sourcePath)) return;

  const content = fs.readFileSync(sourcePath, "utf8");
  const date = getUpcomingSunday(new Date());
  const destPath = path.join(__dirname, "exports_markdown", `${name}_${date}.md`);

  const markdown = `# Wochenprognose für ${user.name} – ${date}\n\n${content}`;

  fs.writeFileSync(destPath, markdown);
  console.log(`✅ Markdown exportiert für ${user.name}: ${destPath}`);
}

// Für alle Nutzer:innen durchgehen
for (const user of users) {
  exportMarkdown(user);
}

