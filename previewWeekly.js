const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.get('/preview/:name', (req, res) => {
  const name = req.params.name.toLowerCase();
  const filePath = path.join(__dirname, 'weekly', `${name}_weekly.json`);
  const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));
  const user = users.find(u => u.name.toLowerCase() === name);

  if (!user || !fs.existsSync(filePath)) {
    return res.status(404).send('Prognose oder Nutzer:in nicht gefunden.');
  }

  const { gptText } = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  const html = `
  <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 1.5rem; line-height: 1.5;">
    <h2 style="font-size: 1.4rem; color: #222;">🌟 Liebe ${user.name},</h2>
    <p style="font-size: 1rem; color: #444;">
      hier kommt deine persönliche astrologische Wochenprognose:
    </p>
    <div style="margin-top: 1rem; padding: 1rem; background: #f9f9f9; border-left: 4px solid #ccc; white-space: 
pre-wrap;">
      ${gptText}
    </div>
    <p style="margin-top: 2rem; font-size: 0.9rem; color: #888;">
      Mit Sternengrüßen,<br/>
      Dein Hey Universe Team ✨
    </p>
  </div>
  `;

  res.send(html);
});

app.listen(PORT, () => {
  console.log(`🌐 Vorschau läuft auf http://localhost:${PORT}/preview/<name>`);
});

