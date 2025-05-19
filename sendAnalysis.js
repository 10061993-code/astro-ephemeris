require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

// Nutzer*innen-Daten aus JSON-Datei laden
const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

// E-Mail-Versand einrichten
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Für jede Nutzerin die passende Analyse verschicken
users.forEach((user) => {
  const name = user['Dein Name'].trim();
  const email = user['Deine Mail'].trim();
  const filename = `${name.toLowerCase().replace(/\s+/g, '_')}_analyse.txt`;
  const filePath = path.join(__dirname, 'horoscopes', filename); // <-- horoscopes statt analyses

  // Falls Datei nicht existiert
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Keine Analyse-Datei gefunden für ${name}`);
    return;
  }

  // Analyseinhalt laden
  const textContent = fs.readFileSync(filePath, 'utf-8');

  // Mail vorbereiten
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: `🌠 Deine astrologische Analyse, ${name}`,
    text: `Hallo ${name},\n\nhier ist deine astrologische Analyse basierend auf deinem 
Geburtshoroskop:\n\n${textContent}\n\nLiebe Grüße\nDein Astro-Newsletter-Team`
  };

  // Mail senden
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`❌ Fehler beim Senden an ${email}:`, error);
    } else {
      console.log(`✅ Analyse gesendet an ${email}:`, info.response);
    }
  });
});

