// utils/moveToPublic.js
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function movePdfToPublic(filename) {
  const sourcePath = path.join(__dirname, '..', 'weekly', filename);
  const targetPath = path.join(__dirname, '..', 'public', filename);

  try {
    await fs.copyFile(sourcePath, targetPath);
    console.log(`✅ PDF verschoben nach public/: ${filename}`);
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const publicLink = `${baseUrl}/${filename}`;
    return publicLink;
  } catch (err) {
    console.error(`❌ Fehler beim Verschieben der PDF:`, err);
    return null;
  }
}
