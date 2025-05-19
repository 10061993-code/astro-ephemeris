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
  const htmlPath = path.join(__dirname, 'horoscopes', `${nameSlug}_birth.html`);
  const pdfFile = `${nameSlug}_birth.pdf`;
  const pdfUrl = `${BASE_URL}/horoscopes/${pdfFile}`;

  const htmlContent = fs.existsSync(htmlPath)
    ? fs.readFileSync(htmlPath, 'utf-8')
    : `<p>Dein Geburtshoroskop ist leider nicht verfügbar.</p>`;

  const mailOptions = {
    from: `"Astro Newsletter" <${process.env.MAIL_USER}>`,
    to: user.email,
    subject: '✨ Dein persönliches Geburtshoroskop',
    html: `${htmlContent}
      <p>📎 <strong>Du möchtest dein Horoskop speichern?</strong><br />
      <a href="${pdfUrl}">👉 Hier kannst du es als PDF herunterladen</a></p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`❌ Fehler beim Senden an ${user.email}:`, error);
    } else {
      console.log(`✅ Horoskop gesendet an ${user.email}:`, info.response);
    }
  });
});

