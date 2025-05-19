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
  const txtPath = path.join(__dirname, "text", `${name}_horoscope.txt`);

  if (!fs.existsSync(txtPath)) {
    console.log(`⏭️ Kein Geburtshoroskop für ${user.name} gefunden – übersprungen.`);
    return;
  }

  if (sentLog[email]?.birth) {
    console.log(`⏭️ Geburtshoroskop für ${user.name} wurde bereits am ${sentLog[email].birth} versendet – 
übersprungen.`);
    return;
  }

  const text = fs.readFileSync(txtPath, "utf8");
  const htmlFormatted = text
    .split("\n\n")
    .map(p => `<p>${p.replace(/\n/g, " ")}</p>`)
    .join("\n");

  const mailOptions = {
    from: `"Dein Astro-Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🌟 Dein persönliches Geburtshoroskop",
    text: text,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:2rem; background:#fff; 
border-radius:12px; border:1px solid #eee;">
        <h2 style="color:#222;">🌞 Willkommen, ${user.name}!</h2>
        <h3 style="margin-top:0; color:#555;">Dein persönliches Geburtshoroskop</h3>
        ${htmlFormatted}
        <p style="margin-top:2rem; font-size:0.9em; color:#777;">Diese E-Mail wurde automatisch generiert und 
versendet.</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(`❌ Fehler bei ${email}:`, error);
    } else {
      console.log(`✅ Geburtshoroskop an ${email} gesendet: ${info.response}`);
      if (!sentLog[email]) sentLog[email] = {};
      sentLog[email].birth = new Date().toISOString();
      fs.writeFileSync(sentPath, JSON.stringify(sentLog, null, 2), "utf8");
    }
  });
});

