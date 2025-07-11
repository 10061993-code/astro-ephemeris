// sendPreview.js

import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

// 📄 E-Mail-HTML-Template laden
const templatePath = path.join('./emailTemplate.html');
let template = fs.readFileSync(templatePath, 'utf-8');

// 📤 E-Mail-Versand vorbereiten (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_SENDER,
    pass: process.env.MAIL_PASSWORD,
  },
});

for (const user of users) {
  const { name, email } = user;

  // Links generieren
  const htmlUrl = `${process.env.BASE_URL}/view/${name}.html`;
  const pdfUrl = `${process.env.BASE_URL}/birth/${name}_birth.pdf`;

  // ✏️ Platzhalter im Template ersetzen
  const htmlContent = template
    .replace(/{{name}}/g, name)
    .replace(/{{htmlUrl}}/g, htmlUrl)
    .replace(/{{pdfUrl}}/g, pdfUrl);

  const mailOptions = {
    from: `"LUZID" <${process.env.MAIL_SENDER}>`,
    to: email,
    subject: '✨ Deine Horoskop-Vorschau ist da!',
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Vorschau-Link an ${email} gesendet.`);
  } catch (err) {
    console.error(`❌ Fehler beim Senden an ${email}:`, err);
  }
}

