import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

import { calculateHouses } from './calculateHouses.js';
import { calculateSynastry } from './calculateSynastry.js';
import { generateHoroscopeText } from './generateHoroscopeText.js';
import { generateSynastryText } from './generateSynastryText.js';
import db from './db.js';

// API-Keys aus JSON-Datei laden
const apiKeysData = JSON.parse(fs.readFileSync('./apiKeys.json'));
const validApiKeys = apiKeysData.keys;

const app = express();
app.use(cors());
app.use(express.json());

// Eigene Route-Registrierungsliste
const registeredRoutes = [];

// Hilfsfunktion zum Registrieren von Routen und Tracken
function registerRoute(method, path, handler) {
  registeredRoutes.push({ method, path });
  app[method](path, handler);
}

// Middleware für API-Key-Check & Logging
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const time = new Date().toISOString();
  console.log(`[${time}] API-Aufruf: ${req.method} ${req.url} mit Key: ${apiKey}`);
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized: Ungültiger API-Key' });
  }
  next();
});

// Geburtshoroskop generieren
registerRoute('post', '/api/horoscope', async (req, res) => {
  try {
    const { birthDate, birthTime, latitude, longitude, timezone, name } = req.body;
    const astroData = await calculateHouses(birthDate, birthTime, latitude, longitude, timezone);
    const text = await generateHoroscopeText(astroData, { name });
    res.json({ horoscope: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler bei der Horoskop-Generierung' });
  }
});

// Partnerhoroskop generieren
registerRoute('post', '/api/partnerhoroscope', async (req, res) => {
  try {
    const { horoskopA, horoskopB, nameA, nameB } = req.body;
    const aspects = calculateSynastry(horoskopA, horoskopB);
    const text = await generateSynastryText(aspects, { name: nameA }, { name: nameB });
    res.json({ partnerHoroscope: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler bei der Partnerhoroskop-Generierung' });
  }
});

// Nutzer speichern
registerRoute('post', '/api/user', (req, res) => {
  const { name, birthDate, birthTime, latitude, longitude, timezone } = req.body;
  const stmt = db.prepare(`
    INSERT INTO users (name, birthDate, birthTime, latitude, longitude, timezone)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(name, birthDate, birthTime, latitude, longitude, timezone);
  res.json({ userId: info.lastInsertRowid });
});

// Nutzer abrufen
registerRoute('get', '/api/user/:id', (req, res) => {
  const id = req.params.id;
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'Nutzer nicht gefunden' });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API-Server läuft auf http://localhost:${PORT}`);

  console.log('Registrierte Routen:');
  registeredRoutes.forEach(r => {
    console.log(r.method.toUpperCase(), r.path);
  });
});
