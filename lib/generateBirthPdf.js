// lib/generateBirthPdf.js

import { fileURLToPath } from 'url';
import path from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function generateBirthPdf(userData) {
  const { id } = userData;
  const filename = `birth_${id}`;
  const inputPath = path.join(__dirname, '..', 'public', 'view', `${filename}.html`);
  const outputPath = path.join(__dirname, '..', 'public', 'birth', `${filename}.pdf`);

  return new Promise((resolve, reject) => {
    const command = `npx --yes puppeteer pdf ${inputPath} --path=${outputPath} --format=A4`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ PDF-Erstellung fehlgeschlagen:', stderr);
        return reject(error);
      }
      resolve(outputPath);
    });
  });
}

