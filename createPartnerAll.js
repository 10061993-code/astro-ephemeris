import { execSync } from 'child_process';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('❌ Bitte gib einen Namen an, z. B. lena_max');
  process.exit(1);
}

const name = args[0];

try {
  console.log(`💞 Erstelle Partner-HTML für ${name} ...`);
  execSync(`node createPartnerHtml.js ${name}`, { stdio: 'inherit' });

  console.log(`📎 Erstelle Partner-PDF für ${name} ...`);
  execSync(`node createPartnerPdf.js ${name}`, { stdio: 'inherit' });

  console.log(`✅ Partner HTML & PDF für ${name} erfolgreich erstellt`);
} catch (err) {
  console.error(`❌ Fehler bei der Partner-Erstellung für ${name}`);
  process.exit(1);
}

