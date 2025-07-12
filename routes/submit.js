// routes/submit.js

import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import createBirthHtml from '../lib/createBirthHtmlOnSubmit.js';
import generateBirthPdf from '../lib/generateBirthPdf.js';
import sendWelcomeEmail from '../lib/sendWelcomeEmail.js';

const router = express.Router();

router.post('/submit', async (req, res) => {
  try {
    console.log('🚨 POST /submit empfangen');

    const { name, email, birthdate, birthtime, birthplace } = req.body;
    if (!name || !email || !birthdate || !birthtime || !birthplace) {
      return res.status(400).send('❌ Bitte alle Felder ausfüllen.');
    }

    const id = uuidv4();
    const userData = { id, name, email, birthdate, birthtime, birthplace };

    console.log(`🔧 Starte Erstellung für Nutzer ${name} (${id})`);

    // 1. HTML erzeugen
    await createBirthHtml(userData);
    console.log(`✅ HTML-Vorschau erstellt: public/view/birth_${id}.html`);

    // 2. PDF erzeugen
    await generateBirthPdf(userData);
    console.log(`📄 PDF erstellt: public/birth/birth_${id}.pdf`);

    // 3. E-Mail versenden
    await sendWelcomeEmail(userData);
    console.log(`📩 Funktion sendWelcomeEmail() wurde aufgerufen.`);

    // 4. Erfolg melden
    res.send(`
      <h1>Danke, ${name}!</h1>
      <p>Dein Horoskop wird gerade erstellt. Schau in dein E-Mail-Postfach!</p>
    `);

  } catch (err) {
    console.error('❌ Fehler bei /submit:', err);
    res.status(500).send('🚨 Interner Fehler beim Erstellen des Horoskops.');
  }
});

export default router;

