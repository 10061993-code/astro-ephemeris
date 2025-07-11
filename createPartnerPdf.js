import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();

const name = process.argv[2];
if (!name) {
  console.error('❌ Bitte gib einen Namen an, z. B. lena_max');
  process.exit(1);
}

const inputPath = path.resolve(`public/partner/${name}_partner.html`);
const outputPath = path.resolve(`partner/${name}_partner.pdf`);
const publicPath = path.resolve(`public/partner/${name}_partner.pdf`);

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

    fs.renameSync(outputPath, publicPath);

    console.log(`✅ PDF verschoben nach public/: ${name}_partner.pdf`);
    console.log(`🌐 Öffentlicher Link: https://astro-ephemeris-vmht.vercel.app/partner/${name}_partner.pdf`);
  } catch (err) {
    console.error(`❌ Fehler beim Erstellen der Partner-PDF:`, err);
    process.exit(1);
  }
}

generatePdf();

