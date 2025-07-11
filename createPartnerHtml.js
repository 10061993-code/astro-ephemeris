// createPartnerHtml.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import users from './users.json' assert { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partnerDir = path.join(__dirname, 'partner');
const publicDir = path.join(__dirname, 'public', 'partner');

async function createPartnerHtml(name1, name2) {
  const filename = `${name1.toLowerCase()}_${name2.toLowerCase()}`;
  const inputPath = path.join(partnerDir, `${filename}_partner.json`);
  const outputPath = path.join(publicDir, `${filename}_partner.html`);
  const pdfFileName = `${filename}_partner.pdf`;
  const pdfLink = `https://astro-ephemeris-vmht.vercel.app/partner/${pdfFileName}`;

  const user1 = users.find(u => u.name.toLowerCase() === name1.toLowerCase());
  const user2 = users.find(u => u.name.toLowerCase() === name2.toLowerCase());

  const style1 = user1?.style || 'default.css';
  const stylePath = `/styles/${style1}`;

  try {
    const jsonData = await fs.readFile(inputPath, 'utf8');
    const data = JSON.parse(jsonData);

    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LUZID Partnerhoroskop: ${name1} & ${name2}</title>
  <link rel="stylesheet" href="${stylePath}" />
</head>
<body>
  <main class="preview">
    <section class="intro">
      <h1>💞 Euer Partnerhoroskop</h1>
      <p class="preview-text">
        Liebe ${name1}, liebe ${name2}, hier ist eure astrologische Verbindung – mit allem, was euch verbindet, herausfordert und wachsen lässt.
        <br><br>
        Ihr könnt das Partnerhoroskop direkt hier lesen oder als PDF herunterladen:
      </p>
      <a class="download-button" href="${pdfLink}" download>👉 PDF herunterladen</a>
    </section>

    <section class="horoscope">
      <h2>Astrologische Synastrie</h2>
      ${data.text.split('\n').map(p => `<p>${p.trim()}</p>`).join('\n')}
    </section>

    <footer>
      <p class="footer-note">Erstellt mit LUZID Software · Für euch von ${name1} & ${name2}</p>
    </footer>
  </main>
</body>
</html>
`;

    await fs.writeFile(outputPath, html, 'utf8');
    console.log(`✅ Partner-HTML gespeichert unter ${outputPath}`);
  } catch (error) {
    console.error('❌ Fehler bei der Partner-HTML-Erstellung:', error);
  }
}

// Optional CLI:
const [,, name1, name2] = process.argv;
if (name1 && name2) {
  createPartnerHtml(name1, name2);
}

export default createPartnerHtml;

