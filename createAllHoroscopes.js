import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const name = process.argv[2];
if (!name) {
  console.error('❌ Bitte gib einen Namen an, z. B. lena oder lena_max');
  process.exit(1);
}

function exists(filepath) {
  return fs.existsSync(path.resolve(filepath));
}

try {
  // Wochenhoroskop
  const weeklyJson = `weekly/${name}_weekly.json`;
  if (exists(weeklyJson)) {
    console.log(`📅 Wochenhoroskop für ${name} ...`);
    execSync(`node createAll.js ${name}`, { stdio: 'inherit' });
  } else {
    console.log(`ℹ️ Kein Wochenhoroskop-Datensatz gefunden für ${name}`);
  }

  // Geburtshoroskop
  const birthJson = `birth/${name}_birth.json`;
  if (exists(birthJson)) {
    console.log(`🌞 Geburtshoroskop für ${name} ...`);
    execSync(`node createBirthAll.js ${name}`, { stdio: 'inherit' });
  } else {
    console.log(`ℹ️ Kein Geburtshoroskop-Datensatz gefunden für ${name}`);
  }

  // Partnerhoroskop
  const partnerJson = `partner/${name}_partner.json`;
  if (exists(partnerJson)) {
    console.log(`💞 Partnerhoroskop für ${name} ...`);
    execSync(`node createPartnerAll.js ${name}`, { stdio: 'inherit' });
  } else {
    console.log(`ℹ️ Kein Partnerhoroskop-Datensatz gefunden für ${name}`);
  }

  console.log(`✅ Alle verfügbaren Horoskope für ${name} erfolgreich verarbeitet!`);
} catch (err) {
  console.error(`❌ Fehler bei der Verarbeitung von ${name}:`, err);
  process.exit(1);
}

