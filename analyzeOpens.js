const fs = require('fs');

const opened = fs.existsSync('./opened.json')
  ? JSON.parse(fs.readFileSync('./opened.json', 'utf8'))
  : [];

if (opened.length === 0) {
  console.log('❌ Keine Datei opened.json gefunden oder keine Einträge vorhanden.');
  process.exit();
}

// 🔢 Öffnungen pro E-Mail sammeln
const summary = {};
opened.forEach(entry => {
  const email = entry.email;
  if (!summary[email]) {
    summary[email] = { count: 0, last: null };
  }
  summary[email].count += 1;
  summary[email].last = entry.timestamp;
});

// 📊 Ausgabe
console.log('📈 Öffnungsstatistik:\n');
Object.entries(summary).forEach(([email, data]) => {
  console.log(`📧 ${email}`);
  console.log(`   🔢 Öffnungen: ${data.count}`);
  console.log(`   ⏰ Zuletzt geöffnet: ${data.last}\n`);
});

