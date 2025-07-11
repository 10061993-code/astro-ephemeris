const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
const sentLogPath = path.join(__dirname, 'sent.json');
const sent = fs.existsSync(sentLogPath) ? JSON.parse(fs.readFileSync(sentLogPath, 'utf8')) : {};

// 🌐 Basis-URL (für lokalen oder Live-Link)
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// 📧 SMTP-Konfiguration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

users.forEach(user => {
  const filename = `${user.name.toLowerCase()}_weekly.json`;
  const filePath = path.join(__dirname, 'weekly', filename);

  if (!fs.existsSync(filePath)) {
    console.warn(`❌ Keine Wochenprognose gefunden für ${user.name}`);
    return;
  }

  const { gptText } = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const link = `${BASE_URL}/weekly/${user.name.toLowerCase()}_weekly.pdf`;

  const html = `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 1.5rem; line-height: 1.5;">
    <h2 style="font-size: 1.4rem; color: #222;">🌟 Liebe ${user.name},</h2>
    <p style="font-size: 1rem; color: #444;">
      deine neue astrologische Wochenprognose ist da! Du kannst sie dir hier direkt anschauen:
    </p>
    <p style="margin-top: 1rem;">
      👉 <a href="${link}" style="color: #4a90e2;">Hier klicken, um dein persönliches PDF zu öffnen</a>
    </p>
    <p style="margin-top: 2rem; font-size: 0.9rem; color: #888;">
      Mit Sternengrüßen,<br/>
      Dein LUZID Team ✨
    </p>
    <img src="${BASE_URL}/track?user=${encodeURIComponent(user.email)}" width="1" height="1" style="display:none;" />
  </div>
  `;

  const mailOptions = {
    from: `"Hey Universe" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: `🌙 Deine astrologische Woche – personalisiert für ${user.name}`,
    html
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`❌ Fehler beim Senden an ${user.email}:`, error.message);
    } else {
      console.log(`✅ Mail an ${user.email} gesendet:`, info.response);

      // 📓 Versand-Log aktualisieren
      if (!sent[user.email]) {
        sent[user.email] = { sent: 1, last: new Date().toISOString() };
      } else {
        sent[user.email].sent += 1;
        sent[user.email].last = new Date().toISOString();
      }

      fs.writeFileSync(sentLogPath, JSON.stringify(sent, null, 2));
    }
  });
});

