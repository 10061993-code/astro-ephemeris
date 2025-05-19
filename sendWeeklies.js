require("dotenv").config();
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));
const sentPath = path.join(__dirname, "data", "sent.json");
const sentLog = fs.existsSync(sentPath) ? JSON.parse(fs.readFileSync(sentPath, "utf8")) : {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

users.forEach((user) => {
  const name = user.name.toLowerCase();
  const email = user.email;
  const txtPath = path.join(__dirname, "weekly", `${name}_weekly.txt`);

  // 🚫 Wenn Datei nicht existiert, überspringen
  if (!fs.existsSync(txtPath)) {
    console.log(`⏭️ Keine Wochenprognose für ${user.name} gefunden – übersprungen.`);
    return;
  }

  // 📅 Prüfe, ob Datei neuer ist als letzter Versand
  const fileStats = fs.statSync(txtPath);
  const fileDate = new Date(fileStats.mtime);
  const lastSent = sentLog[email]?.weekly ? new Date(sentLog[email].weekly) : null;

  if (lastSent && fileDate <= lastSent) {
    console.log(`⏭️ Keine neue Wochenprognose für ${user.name} – letzte wurde am ${lastSent.toLocaleString("de-DE")} 
versendet.`);
    return;
  }

  // 📄 Inhalt laden und formatieren
  const text = fs.readFileSync(txtPath, "utf8");
  const htmlFormatted = text
    .split("\n\n")
    .map(p => `<p>${p.replace(/\n/g, " ")}</p>`)
    .join("\n");

  // ✉️ Mail vorbereiten
  const mailOptions = {
    from: `"Dein Astro-Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✨ Deine astrologische Wochenprognose",
    text: text,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:2rem; background:#fff; 
border-radius:12px; border:1px solid #eee;">
        <h2 style="color:#222;">🌙 Liebe ${user.name},</h2>
        <h3 style="margin-top:0; color:#555;">Das bringt dir die neue Woche</h3>
        ${htmlFormatted}
        <p style="margin-top:2rem; font-size:0.9em; color:#777;">Diese E-Mail wurde automatisch auf Grundlage deines 
Geburtshoroskops erstellt.</p>
      </div>
    `
  };

  // 📤 Versand
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`❌ Fehler bei ${email}:`, error);
    } else {
      console.log(`✅ Wochenprognose an ${email} gesendet: ${info.response}`);
      if (!sentLog[email]) sentLog[email] = {};
      sentLog[email].weekly = new Date().toISOString();
      fs.writeFileSync(sentPath, JSON.stringify(sentLog, null, 2), "utf8");
    }
  });
});

