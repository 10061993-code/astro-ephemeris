// generateAllPreviews.js

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
dotenv.config();

const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));

const runScript = (command) => {
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (err) {
    console.error(`❌ Fehler bei Befehl: ${command}\n`, err.message);
  }
};

for (const user of users) {
  const { name, partnerName, style } = user;
  console.log(`\n🧾 Generiere Vorschau für ${name} ...`);

  // Geburtshoroskop
  runScript(`node createBirthHtml.js ${name}`);
  runScript(`node createPreviewHtml.js ${name} birth`);

  // Wochenhoroskop
  runScript(`node createWeeklyHtml.js ${name}`);
  runScript(`node createPreviewHtml.js ${name} weekly`);

  // Partnerhoroskop (nur wenn partnerName vorhanden)
  if (partnerName) {
    runScript(`node createPartnerHtml.js ${name}_${partnerName}`);
    runScript(`node createPreviewHtml.js ${name}_${partnerName} partner`);
  }

  console.log(`✅ Fertig für ${name}`);
}

