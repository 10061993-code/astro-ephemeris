const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'users.csv');
const outputPath = path.join(__dirname, 'users_clean.csv');

try {
  const content = fs.readFileSync(inputPath, 'utf-8');

  // Ersetze alle Semikolons mit Kommas und entferne Leerzeichen um die Trennzeichen
  const cleaned = content
    .split('\n')
    .map(line => line.trim().replace(/ *; */g, ','))
    .join('\n');

  fs.writeFileSync(outputPath, cleaned);
  console.log(`✅ users_clean.csv wurde erstellt.`);
} catch (err) {
  console.error('❌ Fehler beim Verarbeiten der CSV:', err.message);
}

