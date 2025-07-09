require('dotenv').config();
const fs = require('fs');
const nodemailer = require('nodemailer');
const path = require('path');
const users = require('./users.json');

const horoscopeFolder = './horoscope';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

async function sendHoroscope() {
  for (const user of users) {
    const safeName = user.name.toLowerCase().replace(/ /g, '_');
    const filePath = path.join(horoscopeFolder, `${safeName}_horoscope.json`);
    const pdfPath = path.join(horoscopeFolder, `${safeName}_horoscope.pdf`);
    const pdfUrl = `${process.env.PUBLIC_URL}/horoscope/${safeName}_horoscope.pdf`;

    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Kein Horoskop für ${user.name} gefunden.`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const gptText = data.gptText;

    const trackingPixel = `<img src="${process.env.PUBLIC_URL}/track?user=${encodeURIComponent(user.email)}" 
width="1" height="1" style="display:none;" alt="" />`;

    const pdfNotice = fs.existsSync(pdfPath)
      ? `<p><a href="${pdfUrl}">🔗 Hier kannst du dein Geburtshoroskop als PDF herunterladen</a></p>`
      : '';

    const htmlBody = `
      <html>
        <body style="font-family: sans-serif; line-height: 1.6;">
          <p>Liebe ${user.name},</p>
          <p>${gptText}</p>
          ${pdfNotice}
          ${trackingPixel}
          <p style="font-size: 0.8em; color: #777;">
            Diese E-Mail enthält ein anonymes Öffnungs-Tracking zur Verbesserung unseres Angebots.
          </p>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: user.email,
      subject: 'Willkommen – dein persönliches Geburtshoroskop',
      html: htmlBody
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Mail an ${user.email} gesendet: ${info.response}`);
    } catch (error) {
      console.error(`❌ Fehler beim Senden an ${user.email}:`, error.message);
    }
  }
}

sendHoroscope();

