import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';

import { generateHoroscopeText } from './generateHoroscopeText.js';
import { generatePartnerHoroscopeText } from './generateSynastryText.js';
import { calculateHouses } from './calculateHouses.js';
import { generatePdfFromText } from './generatePdf.js';

import db from './db.js'; // sqlite3 DB-Verbindung

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware: JSON-Parsing
app.use(express.json());

// API-Key Middleware (Schutz)
const API_KEY = process.env.API_KEY || 'LUZID-API-KEY-1234567890abcdef';
app.use((req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Ungültiger API-Key' });
  }
  next();
});

// Test-Endpunkt
app.get('/test', (req, res) => {
  res.json({ ok: true });
});

// POST /api/horoscope: Geburtshoroskop mit PDF-Erstellung
app.post('/api/horoscope', async (req, res) => {
  try {
    const { name, birthDate, birthTime, latitude, longitude, timezone } = req.body;

    // 1. Häuser berechnen
    const astroData = await calculateHouses(birthDate, birthTime, latitude, longitude, timezone);

    // 2. Horoskoptext generieren
    const horoscopeText = await generateHoroscopeText(astroData, { name });

    // 3. PDF erzeugen und speichern
    const outputDir = path.resolve(__dirname, 'horoscopes');
    const pdfFilename = path.join(outputDir, `horoscope_${Date.now()}.pdf`);
    await generatePdfFromText(horoscopeText, pdfFilename);

    // 4. Antwort mit Text + Pfad
    res.json({
      horoscope: horoscopeText,
      pdfPath: pdfFilename,
    });
  } catch (error) {
    console.error('Fehler in /api/horoscope:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// POST /api/partnerhoroscope: Synastrie-Text
app.post('/api/partnerhoroscope', async (req, res) => {
  try {
    const { horoskopA, horoskopB, nameA, nameB } = req.body;

    const partnerText = await generatePartnerHoroscopeText(horoskopA, horoskopB, { nameA, nameB });

    res.json({ partnerHoroscope: partnerText });
  } catch (error) {
    console.error('Fehler in /api/partnerhoroscope:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// POST /api/user: Nutzer speichern
app.post('/api/user', (req, res) => {
  try {
    const { name, birthDate, birthTime, latitude, longitude, timezone } = req.body;
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

// GET /api/user/:id - Nutzer abrufen
app.get('/api/user/:id', (req, res) => {
  try {
    const id = req.params.id;
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    if (!user) return res.status(404).json({ error: 'User nicht gefunden' });
    res.json(user);
  } catch (error) {
    console.error('Fehler in /api/user/:id:', error);
    res.status(500).json({ error: 'Interner Serverfehler' });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`API-Server läuft auf http://localhost:${PORT}`);
});

