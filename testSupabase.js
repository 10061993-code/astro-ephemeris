// testSupabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function test() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('❌ Fehler:', error.message);
  } else {
    console.log('✅ Verbindung erfolgreich. Verfügbare Buckets:', data);
  }
}

test();

