// lib/sendWelcomeEmail.js

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export default async function sendWelcomeEmail(userData) {
  const { id, name, email } = userData;
  const filename = `birth_${id}`;
  const htmlLink = `https://astro-ephemeris-vmht.vercel.app/view/${filename}.html`;
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
    subject: '✨ Dein persönliches Geburtshoroskop von LUZID',
    html: `
      <p>Hallo ${name},</p>
      <p>dein Geburtshoroskop ist fertig! 🎉</p>
      <p>👉 <a href="${htmlLink}">Hier klicken für die Vorschau</a></p>
      <p>📄 <a href="${pdfLink}">Hier direkt das PDF herunterladen</a></p>
      <p>Mit Sternengrüßen,<br>LUZID</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

