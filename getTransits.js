import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Berechnet astrologische Transite für eine Nutzer:in anhand ihres Geburtshoroskops.
 * Nutzt eine Python-Bridge (z. B. calculate_transits.py), um Swiss Ephemeris anzusprechen.
 */
export default function getTransitsForUser(user, date = new Date()) {
  const input = {
    birthDate: user.birthDate,
    birthTime: user.birthTime,
    latitude: user.latitude,
    longitude: user.longitude,
    timezone: user.timezone,
    startDate: date.toISOString().split('T')[0],
  };

  const inputPath = path.join(__dirname, 'data', 'transit_input.json');
  const outputPath = path.join(__dirname, 'data', 'transit_output.json');

  fs.writeFileSync(inputPath, JSON.stringify(input, null, 2));

  try {
    execSync(`python3 calculate_transits.py ${inputPath} ${outputPath}`);
  } catch (err) {
    console.error('Fehler beim Berechnen der Transite:', err);
    return [];
  }

  if (!fs.existsSync(outputPath)) {
    console.error('Keine Ausgabedatei gefunden.');
    return [];
  }

  const rawData = fs.readFileSync(outputPath);
  const transits = JSON.parse(rawData);

  return transits;
}

