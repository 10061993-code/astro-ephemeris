const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const users = require('./users.json');
require('dotenv').config();

const BASE_URL = process.env.PUBLIC_URL || 'https://example.com';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

users.forEach((user) => {
  const nameSlug = user.name.toLowerCase().replace(/\s+/g, '_');
  const htmlPath = path.join(__dirname, 'weekly', `${nameSlug}_weekly.html`);
  const pdfFile = `${nameSlug}_weekly.pdf`;
  const pdfUrl = `${BASE_URL}/weekly/${pdfFile}`;

  const htmlContent = fs.existsSync(htmlPath)
    ? fs.readFileSync(htmlPath, 'utf-8')
    : `<p>Deine Wochenprognose ist derzeit nicht verfügbar.</p>`;

  const mailOptions = {
    from: `"Astro Newsletter" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: '🔮 Deine persönliche Wochenprognose',
    html: `${htmlContent}
      <p>📎 <strong>Möchtest du deine Prognose speichern?</strong><br />
      <a href="${pdfUrl}">👉 Hier kannst du sie als PDF herunterladen</a></p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`❌ Fehler beim Versand an ${user.email}:`, error);
    } else {
      console.log(`✅ Wochenprognose gesendet an ${user.email}:`, info.response);
    }
  });
});

