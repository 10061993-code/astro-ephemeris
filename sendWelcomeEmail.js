// sendWelcomeEmail.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export default async function sendWelcomeEmail(userData) {
  const { id, name, email } = userData;
  const filename = `birth_${id}`;

  const previewLink = `https://astro-ephemeris-vmht.vercel.app/view/${filename}.html`;
  const pdfLink = `https://astro-ephemeris-vmht.vercel.app/birth/${filename}.pdf`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'LUZID <hey.universe.newsletter@gmail.com>',
    to: email,
    subject: '🌌 Dein persönliches Geburtshoroskop ist da!',
    html: `
      <p>Hallo ${name} ✨</p>
      <p>Schön, dass du bei LUZID gelandet bist! Hier findest du dein persönliches Geburtshoroskop:</p>
      <p><a href="${previewLink}">👉 Vorschau online ansehen</a></p>
      <p><a href="${pdfLink}">📄 PDF direkt herunterladen</a></p>
      <p>Hab eine inspirierende Reise – wir begleiten dich!</p>
      <p>– Dein LUZID Team</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('📬 Willkommensmail erfolgreich an %s gesendet.', email);
  console.log('✉️ SMTP-Info:', info);
}

