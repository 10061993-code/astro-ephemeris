// createWeeklyHtml.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import users from './users.json' assert { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const weeklyDir = path.join(__dirname, 'weekly');
const publicDir = path.join(__dirname, 'public', 'weekly');
const stylesDir = path.join(__dirname, 'public', 'styles');

async function createWeeklyHtml(name) {
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
  if (!user) {
    console.error(`❌ Kein Nutzer mit dem Namen "${name}" gefunden.`);
    return;
  }

  const style = user.style || 'default.css';
  const stylePath = `/styles/${style}`;

  const inputPath = path.join(weeklyDir, `${name.toLowerCase()}_weekly.json`);
  const outputPath = path.join(publicDir, `${name.toLowerCase()}_weekly.html`);
  const pdfFileName = `${name.toLowerCase()}_weekly.pdf`;
  const pdfLink = `https://astro-ephemeris-vmht.vercel.app/weekly/${pdfFileName}`;

  try {
    const jsonData = await fs.readFile(inputPath, 'utf8');
    const data = JSON.parse(jsonData);

    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LUZID Wochenhoroskop für ${user.name}</title>
  <link rel="stylesheet" href="${stylePath}" />
</head>
<body>
  <main class="preview">
    <section class="intro">
      <h1>Dein Wochenhoroskop ist da ✨</h1>
      <p class="preview-text">
        Liebe ${user.name}, dein persönlicher astrologischer Ausblick ist jetzt bereit. Du kannst ihn gleich hier lesen oder dir als PDF herunterladen:
      </p>
      <a class="download-button" href="${pdfLink}" download>👉 PDF herunterladen</a>
    </section>

    <section class="horoscope">
      <h2>Woche vom ${data.startDate} bis ${data.endDate}</h2>
      ${data.text.split('\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
    </section>

    <footer>
      <p class="footer-note">Erstellt mit LUZID Software · Für dich von ${user.name}</p>
    </footer>
  </main>
</body>
</html>
`;

    await fs.writeFile(outputPath, html, 'utf8');
    console.log(`✅ HTML gespeichert unter ${outputPath}`);
  } catch (error) {
    console.error('❌ Fehler bei der HTML-Erstellung:', error);
  }
}

// Optional: CLI
const nameArg = process.argv[2];
if (nameArg) {
  createWeeklyHtml(nameArg);
}

export default createWeeklyHtml;


