import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';

import { generateHoroscopeText } from './generateHoroscopeText.js';
import { generatePartnerHoroscopeText } from './generateSynastryText.js';
import { calculateHouses } from './calculateHouses.js';
import { generatePdfFromText } from './generatePdf.js';

import db from './db.js'; // sqlite3-Verbindung (muss eingerichtet sein)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// JSON Body Parser
app.use(express.json());

// API-Key Middleware
const API_KEY = process.env.API_KEY || 'LUZID-API-KEY-1234567890abcdef';
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Ungültiger API-Key' });
  }
  next();
});

// Test-Route
app.get('/test', (req, res) => {
  res.json({ ok: true });
});

// Nutzer anlegen
app.post('/api/user', (req, res) => {
  try {
    const { name, birthDate, birthTime, latitude, longitude, timezone } = req.body;
    if (!name || !birthDate || !birthTime || !latitude || !longitude || !timezone) {
      return res.status(400).json({ error: 'Fehlende Parameter' });
    }

    const stmt = db.prepare(`
      INSERT INTO users (name, birthDate, birthTime, latitude, longitude, timezone)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, birthDate, birthTime, latitude, longitude, timezone);

    res.json({ userId: info.lastInsertRowid });
  } catch (error) {
    console.error('Fehler in /api/user:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Nutzer abfragen
app.get('/api/user/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const stmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
    const user = stmt.get(id);

    if (!user) return res.status(404).json({ error: 'Nutzer nicht gefunden' });
    res.json(user);
  } catch (error) {
    console.error('Fehler in /api/user/:id:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Geburtshoroskop generieren und PDF speichern
app.post('/api/horoscope', async (req, res) => {
  try {
    const { userId, name, birthDate, birthTime, latitude, longitude, timezone } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId fehlt im Request' });
    }
    // Optional: Nutzer aus DB validieren

    // Häuser & astrologische Daten berechnen
    const astroData = await calculateHouses(birthDate, birthTime, latitude, longitude, timezone);

    // GPT-generierter Horoskoptext
    const horoscopeText = await generateHoroscopeText(astroData, { name });

    // PDF speichern
    const outputDir = path.resolve(__dirname, 'horoscopes');
    const pdfFilename = path.join(outputDir, `horoscope_${Date.now()}.pdf`);
    await generatePdfFromText(horoscopeText, pdfFilename);

    // Antwort mit Text und PDF-Pfad
    res.json({
      horoscope: horoscopeText,
      pdfPath: pdfFilename
    });
  } catch (error) {
    console.error('Fehler in /api/horoscope:', error);
    res.status(500).json({ error: error.message || 'Interner Serverfehler' });
  }
});

// Partnerhoroskop mit Synastrie-Text
app.post('/api/partnerhoroscope', async (req, res) => {
  try {
    const { horoskopA, horoskopB, nameA, nameB } = req.body;

    if (!horoskopA || !horoskopB || !nameA || !nameB) {
      return res.status(400).json({ error: 'Fehlende Parameter' });
    }

    const partnerText = await generatePartnerHoroscopeText(horoskopA, horoskopB, { nameA, nameB });

    res.json({ partnerHoroscope: partnerText });
  } catch (error) {
    console.error('Fehler in /api/partnerhoroscope:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`API-Server läuft auf http://localhost:${PORT}`);
});

