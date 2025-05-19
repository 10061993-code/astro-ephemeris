const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));

// Output-Ordner sicherstellen
const outputDir = path.join(__dirname, 'horoscopes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

users.forEach(user => {
  const name = user['Dein Name'];
  const birthDate = new Date(user['Dein Geburtsdatum']);
  const birthTime = user['Deine Geburtsuhrzeit'];
  const birthPlace = user['Dein Geburtsort'];

  const [hour, minute] = birthTime.split('.').map(Number);
  const dateString = `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, 
'0')}-${String(birthDate.getDate()).padStart(2, '0')}T${String(hour).padStart(2, 
'0')}:${String(minute).padStart(2, '0')}:00`;

  console.log(`🚀 Generiere Horoskop für ${name} (${birthPlace}, ${dateString})`);

  try {
    const output = execSync(`node calculate.js "${dateString}" "${birthPlace}"`, { encoding: 'utf-8' });

    console.log(`📝 Output erhalten für ${name}...`);
    
    const safeFilename = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filepath = path.join(outputDir, `${safeFilename}_horoskop.txt`);

    fs.writeFileSync(filepath, output);
    console.log(`✅ Gespeichert unter: ${filepath}`);
  } catch (err) {
    console.error(`❌ Fehler bei ${name}:`, err.message);
  }
});


