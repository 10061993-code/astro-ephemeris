const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const users = require('./users.json');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (const user of users) {
    const nameSlug = user.name.toLowerCase().replace(/\s+/g, '_');
    const htmlPath = path.join(__dirname, 'weekly', `${nameSlug}_weekly.html`);
    const pdfPath = path.join(__dirname, 'weekly', `${nameSlug}_weekly.pdf`);

    if (!fs.existsSync(htmlPath)) {
      console.warn(`⚠️ HTML-Datei nicht gefunden für ${user.name}, übersprungen.`);
      continue;
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });

    console.log(`✅ PDF erstellt für ${user.name}: ${pdfPath}`);
  }

  await browser.close();
})();

