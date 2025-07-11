// createHtml.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const username = process.argv[2];
if (!username) {
  console.error('❌ Bitte gib einen Nutzernamen an. Beispiel: node createHtml.js lena');
  process.exit(1);
}

const inputPath = path.join(__dirname, 'weekly', `${username}_weekly.json`);
const outputPath = path.join(__dirname, 'public', 'weekly', `${username}_weekly.html`);

async function createHtml() {
  try {
    const jsonData = await fs.readFile(inputPath, 'utf-8');
    const { name, text } = JSON.parse(jsonData);

    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Wochenprognose für ${name}</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      max-width: 700px;
      margin: 40px auto;
      padding: 20px;
      line-height: 1.6;
      white-space: pre-line;
    }
    h1 {
      text-align: center;
      margin-bottom: 40px;
    }
  </style>
</head>
<body>
  <h1>Wochenprognose für ${name}</h1>
  ${text}
</body>
</html>
    `.trim();

    await fs.writeFile(outputPath, html, 'utf-8');
    console.log(`✅ HTML gespeichert unter ${outputPath}`);
  } catch (err) {
    console.error('❌ Fehler bei der HTML-Erstellung:', err);
  }
}

createHtml();

