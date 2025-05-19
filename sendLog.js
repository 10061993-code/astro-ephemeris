const fs = require('fs');
const nodemailer = require('nodemailer');
const users = require('./users.json');
require('dotenv').config();

const logPath = './logs/weekly.log';
const date = new Date().toISOString().split('T')[0];

// Logtext aufbauen
let logText = `🗓️ Wochenversand-Log (${date})\n\n`;

users.forEach((user) => {
  const format = user.format?.toUpperCase() === 'PDF' ? 'PDF' : 'HTML';
  const nameSlug = user.name.toLowerCase().replace(/\s+/g, '_');
  const htmlExists = fs.existsSync(`./weekly/${nameSlug}_weekly.html`);
  const pdfExists = fs.existsSync(`./weekly/${nameSlug}_weekly.pdf`);

  if ((format === 'PDF' && pdfExists) || (format === 'HTML' && htmlExists)) {
    logText += `✅ ${user.name} (${format}) versendet an ${user.email}\n`;
  } else {
    logText += `❌ ${user.name} (${format}) – Datei fehlt\n`;
  }
});

// Logdatei lokal speichern
fs.writeFileSync(logPath, logText, 'utf-8');

// Transporter konfigurieren (Gmail mit App-Passwort)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const mailOptions = {
  from: `"Astro Newsletter Log" <${process.env.MAIL_USER}>`,
  to: process.env.ADMIN_EMAIL || process.env.MAIL_USER,
  subject: `📝 Log – Wochenversand vom ${date}`,
  text: logText
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error(`❌ Fehler beim Logversand:`, error);
  } else {
    console.log(`✅ Logversand erfolgreich:`, info.response);
  }
});

