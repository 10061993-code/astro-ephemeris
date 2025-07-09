// testPdf.mjs
import createPdf from './createPdf.js';
import fs from 'fs/promises';

const html = `
  <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 2rem; }
        h1 { color: #6a1b9a; }
      </style>
    </head>
    <body>
      <h1>Test-PDF</h1>
      <p>Dies ist ein einfacher Test der PDF-Erzeugung mit Puppeteer.</p>
    </body>
  </html>
`;

const outputPath = './weekly/test-output.pdf';

await createPdf(html, outputPath);
console.log('✅ Test-PDF wurde erstellt unter:', outputPath);

