// uploadToSupabase.js

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Supabase-Client erstellen mit .env-Werten
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 🔁 Hauptfunktion zum Hochladen
export async function uploadToSupabase(localFilePath, destinationPath) {
  try {
    const fileBuffer = fs.readFileSync(localFilePath);

    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(destinationPath, fileBuffer, {
        upsert: true,
        contentType: getMimeType(localFilePath),
      });

    if (error) {
      console.error('❌ Upload-Fehler:', error.message);
      return null;
    }

    // ✅ Public URL erzeugen
    const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${destinationPath}`;
    console.log('✅ Hochgeladen nach:', publicUrl);
    return publicUrl;

  } catch (err) {
    console.error('❌ Fehler beim Lesen oder Hochladen:', err.message);
    return null;
  }
}

// 🔧 Hilfsfunktion für MIME-Type
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') return 'application/pdf';
  if (ext === '.html') return 'text/html';
  return 'application/octet-stream';
}

// 🧪 Beispiel-Aufruf (lokaler Test mit zwei CLI-Parametern)
if (process.argv.length === 4) {
  const localPath = process.argv[2];
  const destPath = process.argv[3];
  uploadToSupabase(localPath, destPath);
}

