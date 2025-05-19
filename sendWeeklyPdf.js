const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function getUpcomingSunday(date = new Date()) {
  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() + ((7 - sunday.getDay()) % 7));
  return sunday.toISOString().split("T")[0];
}

async function sendPdf(name, email, filePath) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🗓️ Dein persönliches Wochenhoroskop als PDF",
    text: `Liebe ${name},\n\nim Anhang findest du dein aktuelles Wochenhoroskop als PDF.\n\nHerzliche Grüße,\nDeine Astrologin`,
    attachments: [
      {
        filename: path.basename(filePath),
        path: filePath,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ PDF an ${email} gesendet: ${info.response}`);
  } catch (err) {
    console.error(`❌ Fehler beim PDF-Versand an ${email}:`, err.message);
  }
}

async function main() {
  const exportDate = getUpcomingSunday();
  for (const user of users) {
    const safeName = user.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
    const pdfPath = path.join(__dirname, "exports_pdf", `${safeName}_${exportDate}.pdf`);
    if (fs.existsSync(pdfPath)) {
      await sendPdf(user.name, user.email, pdfPath);
    } else {
      console.log(`⚠️ Keine PDF gefunden für ${user.name}`);
    }
  }
}

main();

