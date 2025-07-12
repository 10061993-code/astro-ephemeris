// createBirthPdf.js
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function createBirthPdf(userData) {
  const { id } = userData;
  const htmlPath = path.join(__dirname, 'public', 'view', `birth_${id}.html`);
  const pdfPath = path.join(__dirname, 'public', 'birth', `birth_${id}.pdf`);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.pdf({ path: pdfPath, format: 'A4' });

  await browser.close();
  console.log(`📄 PDF erstellt: ${pdfPath}`);
}

