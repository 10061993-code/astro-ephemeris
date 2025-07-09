const fs = require('fs');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 📎 Pfad zur CSV-Datei
const exportPath = './opened_export.csv';

// ✅ Prüfen, ob Datei existiert
if (!fs.existsSync(exportPath)) {
  console.error('❌ Kein CSV-Export gefunden. Bitte zuerst exportOpensToCSV.js ausführen.');
  process.exit();
}

// ✉️ SMTP-Transporter einrichten
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 📧 Mail-Konfiguration
const mailOptions = {
  from: `"Hey Universe Bot" <${process.env.SMTP_USER}>`,
  to: process.env.ADMIN_EMAIL,
  subject: '📈 Öffnungsstatistik – CSV-Export',
  text: 'Im Anhang findest du die aktuelle Öffnungsstatistik als CSV-Datei.',
  attachments: [
    {
      filename: 'opened_export.csv',
      path: exportPath
    }
  ]
};

// 🚀 Senden
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('❌ Fehler beim Senden:', error.message);
  } else {
    console.log('✅ Export per E-Mail gesendet:', info.response);
  }
});
