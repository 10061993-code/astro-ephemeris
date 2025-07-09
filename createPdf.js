// createPdf.js
import fs from 'fs/promises';
import puppeteer from 'puppeteer';

export async function createPdf({ user, text, date }, outputDir = 'weekly') {
  const html = `
  <html>
    <head>
      <meta charset="utf-8">
      <title>Geburtshoroskop</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
        h1 { color: #222; font-size: 24px; }
        p { margin-bottom: 1em; }
      </style>
    </head>
    <body>
      <h1>🌟 Geburtshoroskop für ${user.name}</h1>
      <p><strong>Geburtsdatum:</strong> ${user.birthDate}</p>
      <p><strong>Geburtszeit:</strong> ${user.birthTime}</p>
      <p><strong>Geburtsort:</strong> ${user.birthPlace}</p>
      <p><strong>Erstellt am:</strong> ${date}</p>
      <hr />
      ${text.split('\n').map(line => `<p>${line}</p>`).join('')}
    </body>
  </html>
  `;

  const safeName = user.name.toLowerCase().replace(/[^a-z0-9]/gi, '_');
  const filePath = `${outputDir}/${safeName}_birth.pdf`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: filePath, format: 'A4' });
  await browser.close();

  console.log(`✅ PDF gespeichert unter: ${filePath}`);
}

