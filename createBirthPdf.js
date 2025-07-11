import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();

const name = process.argv[2];
if (!name) {
  console.error('❌ Bitte gib einen Namen an, z. B. lena');
  process.exit(1);
}

const inputPath = path.resolve(`public/birth/${name}_birth.html`);
const outputPath = path.resolve(`birth/${name}_birth.pdf`);
const publicPath = path.resolve(`public/birth/${name}_birth.pdf`);

async function generatePdf() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const html = fs.readFileSync(inputPath, 'utf8');
    await page.setContent(html, { waitUntil: 'networkidle0' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    // PDF ins public-Verzeichnis verschieben
    fs.renameSync(outputPath, publicPath);

    console.log(`✅ PDF verschoben nach public/: ${name}_birth.pdf`);
    console.log(`🌐 Öffentlicher Link: https://astro-ephemeris-vmht.vercel.app/birth/${name}_birth.pdf`);
  } catch (err) {
    console.error(`❌ Fehler beim Erstellen der Geburt-PDF:`, err);
    process.exit(1);
  }
}

generatePdf();

