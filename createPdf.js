import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { movePdfToPublic } from './utils/moveToPublic.js';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createPdf(name) {
  const htmlPath = path.join(__dirname, 'public', 'weekly', `${name}_weekly.html`);
  const outputPath = path.join(__dirname, 'weekly', `${name}_weekly.pdf`);

  try {
    const html = await fs.readFile(htmlPath, 'utf8');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '30mm', bottom: '30mm', left: '20mm', right: '20mm' },
    });

    await browser.close();
    console.log(`✅ PDF gespeichert unter ${outputPath}`);

    // PDF automatisch ins public-Verzeichnis verschieben:
    const publicLink = await movePdfToPublic(`${name}_weekly.pdf`);
    if (publicLink) {
      console.log(`🌐 Öffentlicher Link: ${publicLink}`);
    }

  } catch (error) {
    console.error('❌ Fehler bei der PDF-Erstellung:', error);
  }
}

const name = process.argv[2];
if (!name) {
  console.error('❌ Bitte gib einen Namen an, z. B.: node createPdf.js lena');
  process.exit(1);
}

createPdf(name);

