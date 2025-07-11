import { execSync } from 'child_process';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('❌ Bitte gib einen Namen an, z. B. lena');
  process.exit(1);
}

const name = args[0];

try {
  console.log(`🌞 Erstelle Geburt-HTML für ${name} ...`);
  execSync(`node createBirthHtml.js ${name}`, { stdio: 'inherit' });

  console.log(`📄 Erstelle Geburt-PDF für ${name} ...`);
  execSync(`node createBirthPdf.js ${name}`, { stdio: 'inherit' });

  console.log(`✅ Geburt HTML & PDF für ${name} erfolgreich erstellt`);
} catch (err) {
  console.error(`❌ Fehler bei der Erstellung für ${name}`);
  process.exit(1);
}

