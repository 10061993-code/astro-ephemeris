// createBirthHtml.js
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';
import users from './users.json' assert { type: 'json' };

config();

const BASE_URL = process.env.BASE_URL || '';

const createBirthHtml = async (user) => {
  const { name, style = 'default' } = user;
  const filename = `${name.toLowerCase()}_birth`;
  const jsonPath = `./birth/${filename}.json`;
  const htmlPath = `./public/birth/${filename}.html`;
  const pdfUrl = `${BASE_URL}/birth/${filename}.pdf`;

  try {
    const data = await fs.readFile(jsonPath, 'utf-8');
    const horoscope = JSON.parse(data);

    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Geburtshoroskop für ${name}</title>
  <link rel="stylesheet" href="/styles/${style}.css" />
</head>
<body>
  <div class="container">
    <h1>🌞 Dein Geburtshoroskop, ${name}</h1>
    <div class="horoscope-text">
      ${horoscope.text.replace(/\n/g, '<br>')}
    </div>
    <a href="${pdfUrl}" class="download-btn" download>👉 PDF herunterladen</a>
  </div>
</body>
</html>
`;

    await fs.writeFile(htmlPath, html);
    console.log(`✅ HTML gespeichert unter ${htmlPath}`);
  } catch (err) {
    console.error(`❌ Fehler beim Erstellen der Geburt-HTML für ${name}:`, err);
  }
};

const run = async () => {
  for (const user of users) {
    console.log(`🌞 Erstelle Geburt-HTML für ${user.name} ...`);
    await createBirthHtml(user);
  }
};

run();

