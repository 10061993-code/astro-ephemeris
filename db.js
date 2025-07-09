// db.js
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, 'deine-datenbank-datei.sqlite');

const db = new Database(dbFile);

// Tabelle für Nutzer anlegen (wenn nicht vorhanden)
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    birthDate TEXT,
    birthTime TEXT,
    latitude REAL,
    longitude REAL,
    timezone TEXT
  )
`).run();

// Tabelle für Horoskope anlegen (wenn nicht vorhanden)
db.prepare(`
  CREATE TABLE IF NOT EXISTS horoscopes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    horoscopeText TEXT NOT NULL,
    pdfPath TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES users(id)
  )
`).run();

export default db;

