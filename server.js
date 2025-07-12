// server.js

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import submitRouter from './routes/submit.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// __dirname erzeugen
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Statische Ordner freigeben
app.use(express.static(path.join(__dirname, 'public')));
app.use('/birth', express.static(path.join(__dirname, 'public/birth')));
app.use('/weekly', express.static(path.join(__dirname, 'public/weekly')));
app.use('/partner', express.static(path.join(__dirname, 'public/partner')));
app.use('/view', express.static(path.join(__dirname, 'public/view'))); // ✅ Vorschauen

// Formular-Route
app.use('/', submitRouter);

// Testroute
app.get('/', (req, res) => {
  res.send('✅ Der Server läuft – statische Dateien werden bereitgestellt.');
});

app.listen(PORT, () => {
  console.log(`🚀 LUZID läuft auf http://localhost:${PORT}`);
});

