// server.js

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

// ⬇️ Initialisierung
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

// ⬇️ __dirname für ES-Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬇️ Statische Dateien bereitstellen
app.use(express.static(path.join(__dirname, 'public')));
app.use('/weekly', express.static(path.join(__dirname, 'public/weekly')));
app.use('/birth', express.static(path.join(__dirname, 'public/birth')));
app.use('/partner', express.static(path.join(__dirname, 'public/partner')));
app.use('/view', express.static(path.join(__dirname, 'public/view')));

// ⬇️ Health Check
app.get('/', (req, res) => {
  res.send('✅ Der Server läuft – statische Dateien werden bereitgestellt.');
});

// ⬇️ API: /api/generate → zentraler Dispatcher für alle Horoskoptypen
app.post('/api/generate', (req, res) => {
  const { name, type } = req.body;
  if (!name || !type) {
    return res.status(400).json({ success: false, error: 'Name und Typ erforderlich.' });
  }

  // Unterstützte Typen prüfen
  const validTypes = ['birth', 'weekly', 'partner'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, error: 'Ungültiger Typ.' });
  }

  // Entsprechendes Skript und Vorschau-Typ festlegen
  const scriptMap = {
    birth: `node createBirthHtml.js ${name}`,
    weekly: `node createWeeklyHtml.js ${name}`,
    partner: `node createPartnerHtml.js ${name}`
  };

  const previewCommand = `node createPreviewHtml.js ${name} ${type}`;

  // ⬇️ Erst das Horoskop generieren ...
  exec(scriptMap[type], (err1, stdout1, stderr1) => {
    if (err1) {
      return res.status(500).json({ success: false, error: 'Fehler bei der Erstellung', stderr: stderr1 });
    }

    // ⬇️ ... dann die Vorschau erzeugen
    exec(previewCommand, (err2, stdout2, stderr2) => {
      if (err2) {
        return res.status(500).json({ success: false, error: 'Fehler bei der Vorschau', stderr: stderr2 });
      }

      const previewUrl = `https://${process.env.BASE_URL.replace(/^https?:\/\//, '')}/view/${name}.html`;

      res.json({
        success: true,
        name,
        type,
        previewUrl,
        stdout: stdout1 + '\n' + stdout2
      });
    });
  });
});

// ⬇️ Server starten
app.listen(PORT, () => {
  console.log(`✅ Server läuft unter http://localhost:${PORT}`);
});

