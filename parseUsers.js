const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const results = [];
const usersFile = path.join(__dirname, 'users.csv');
const outputFile = path.join(__dirname, 'users.json');

fs.createReadStream(usersFile)
  .pipe(csv())
  .on('headers', (headers) => {
    console.log('🧩 Header erkannt:', headers.join(', '));
  })
  .on('data', (data) => {
    const name = data['Dein Name']?.trim();
    const date = data['Dein Geburtsdatum']?.trim();
    const time = data['Deine Geburtszeit']?.trim();
    const place = data['Deine Geburtsstadt']?.trim();
    const email = data['Deine Mail']?.trim();

    if (name && date && time && place && email) {
      results.push({
        name,
        birthdate: date,
        birthtime: time,
        birthplace: place,
        email
      });
      console.log('📄 Gelesene Zeile:', { name, birthdate: date, birthtime: time, birthplace: place, email });
    } else {
      console.warn(`⚠️  Unvollständige Daten bei ${name || 'unbekannt'} – übersprungen.`);
    }
  })
  .on('end', () => {
    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf-8');
    console.log(`✅ ${outputFile} wurde erfolgreich erstellt mit ${results.length} Einträgen.`);
  });
