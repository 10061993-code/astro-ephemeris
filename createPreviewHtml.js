// createPreviewHtml.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import users from './users.json' assert { type: 'json' };

// ⬇️ Setup
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬇️ Eingabeparameter (z. B. "lena" "birth")
const [,, name, type] = process.argv;

if (!name || !type) {
  console.error('❌ Bitte Namen und Typ übergeben: node createPreviewHtml.js <name> <birth|weekly|partner>');
  process.exit(1);
}

// ⬇️ Nutzer finden
const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());
if (!user) {
  console.error(`❌ Nutzer "${name}" nicht gefunden.`);
  process.exit(1);
}

// ⬇️ Stil bestimmen
const styleName = user.style || 'default';
const cssPath = `../styles/${styleName}.css`;

// ⬇️ HTML- und PDF-Link ermitteln
const htmlUrl = `${process.env.BASE_URL}/${type}/${name}_${type}.html`;
const pdfUrl = `${process.env.BASE_URL}/${type}/${name}_${type}.pdf`;

// ⬇️ Vorschau-Vorlage einlesen
const templatePath = path.join(__dirname, 'templates', 'previewTemplate.html');
let previewHtml = fs.readFileSync(templatePath, 'utf-8');

// ⬇️ Platzhalter ersetzen
const customizedHtml = previewHtml
  .replace(/{{name}}/g, name)
  .replace(/{{htmlUrl}}/g, htmlUrl)
  .replace(/{{pdfUrl}}/g, pdfUrl)
  .replace(/{{cssPath}}/g, cssPath);

// ⬇️ Pfad für Vorschauseite
const outputPath = path.join(__dirname, 'public', 'view', `${name.toLowerCase()}.html`);
fs.writeFileSync(outputPath, customizedHtml, 'utf-8');

console.log(`✅ Vorschauseite gespeichert unter: public/view/${name.toLowerCase()}.html`);

