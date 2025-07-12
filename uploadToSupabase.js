import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ Service-Role-Key verwenden
);

// Eingabedaten von der Kommandozeile
const filePath = process.argv[2];       // z. B. public/birth/lena_birth.pdf
const uploadPath = process.argv[3];     // z. B. birth/lena_birth.pdf

const upload = async () => {
  const fileBuffer = fs.readFileSync(filePath);

  const { error } = await supabase.storage
    .from('horoscopes') // Bucket-Name
    .upload(uploadPath, fileBuffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    console.error('❌ Upload-Fehler:', error.message);
  } else {
    console.log('✅ Upload erfolgreich!');
  }
};

upload();

