import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWeeklyText } from './createWeeklyText.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function prepareWeekly() {
  const usersPath = path.join(__dirname, 'users.json');
  const transitsDir = path.join(__dirname, 'transits');
  const archiveDir = path.join(__dirname, 'weekly_archive');
  const outputDir = path.join(__dirname, 'weekly');

  await fs.mkdir(archiveDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  const users = JSON.parse(await fs.readFile(usersPath, 'utf-8'));

  for (const user of users) {
    const slug = user.name.toLowerCase().replace(/\s+/g, '_');
    const transitFile = path.join(transitsDir, `${slug}_transits.json`);
    const archiveFile = path.join(archiveDir, `${slug}_weekly.json`);
    const outputFile = path.join(outputDir, `${slug}_weekly.json`);

    let transits, lastWeek = null;

    try {
      transits = JSON.parse(await fs.readFile(transitFile, 'utf-8'));
    } catch {
      console.warn(`⚠️ Keine Transite für ${user.name} gefunden.`);
      continue;
    }

    try {
      lastWeek = JSON.parse(await fs.readFile(outputFile, 'utf-8'));
      await fs.writeFile(archiveFile, JSON.stringify(lastWeek, null, 2));
    } catch {
      console.log(`ℹ️ Keine Vorwochen-Prognose für ${user.name} vorhanden.`);
    }

    const text = await createWeeklyText(user, transits, lastWeek);

    const output = {
      name: user.name,
      date: new Date().toISOString(),
      text,
      transits
    };

    await fs.writeFile(outputFile, JSON.stringify(output, null, 2));
    console.log(`✅ Prognose für ${user.name} gespeichert.`);
  }
}

prepareWeekly().catch(console.error);

