// sendWeekly.js

import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import users from './users.json' assert { type: 'json' };

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📄 HTML-Vorlage einlesen
const templatePath = path.join(__dirname, 'emailTemplate.html');
const emailTemplate = fs.readFileSync(templatePath, 'utf-8');

// 📧 Mail-Konfiguration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_SENDER,
    pass: process.env.MAIL_PASSWORD,
  },
});

for (const user of users) {
  const name = user.name.toLowerCase();
  const email = user.email;

  const htmlUrl = `${process.env.BASE_URL}/view/${name}.html`;
  const pdfUrl = `${process.env.BASE_URL}/weekly/${name}_weekly.pdf`;

  // 📩 Platzhalter im HTML ersetzen
  const compiledHtml = emailTemplate
    .replace(/{{name}}/g, user.name)
    .replace(/{{htmlUrl}}/g, htmlUrl)
    .replace(/{{pdfUrl}}/g, pdfUrl);

  const mailOptions = {
    from: process.env.MAIL_SENDER,
    to: email,
    subject: `Deine neue Wochenprognose von LUZID 🌙`,
    html: compiledHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Vorschau-Link an ${email} gesendet.`);
  } catch (error) {
    console.error(`❌ Fehler beim Senden an ${email}:`, error);
  }
}

