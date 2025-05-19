const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const logPath = path.join(__dirname, "log", "scheduler.log");
const recipient = process.env.ADMIN_EMAIL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

function getLastLogLines(lines = 20) {
  const content = fs.readFileSync(logPath, "utf-8");
  const all = content.trim().split("\n");
  return all.slice(-lines).join("\n");
}

function sendLogMail() {
  if (!recipient) {
    console.error("❌ ADMIN_EMAIL nicht definiert.");
    return;
  }

  const logExcerpt = getLastLogLines();

  const mailOptions = {
    from: `"Astro-Newsletter" <${process.env.MAIL_USER}>`,
    to: recipient,
    subject: "🪐 Astro-Newsletter – Logauszug nach Wochenversand",
    text:
      "Hallo,\n\nhier ein Auszug aus dem Versandlog:\n\n" +
      logExcerpt +
      "\n\nViele Grüße,\nDein Astro-System",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Fehler beim Logversand:", error);
    } else {
      console.log("✅ Logauszug per Mail versendet:", info.response);
    }
  });
}

sendLogMail();

