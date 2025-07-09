console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "gesetzt" : "NICHT gesetzt");
import dotenv from 'dotenv';
dotenv.config();
console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "Ist gesetzt" : "NICHT gesetzt");
import { calculateHouses } from './calculateHouses.js';
import { generateHoroscopeText } from './generateHoroscopeText.js';

async function generateHoroscopeForUser(user) {
  try {
    // 1. Häuser, Aszendent, MC aus Python berechnen
    const astroData = await calculateHouses(
      user.birthDate,
      user.birthTime,
      user.latitude,
      user.longitude,
      user.timezone
    );

    console.log('Astrologische Daten:', astroData);

    // 2. GPT-Text mit den astrologischen Daten generieren
    const horoscopeText = await generateHoroscopeText(astroData, user);

    console.log(`Horoskop für ${user.name}:\n`, horoscopeText);

    // Hier kannst du den Text speichern, versenden, etc.

  } catch (error) {
    console.error('Fehler bei der Horoskop-Generierung:', error);
  }
}

// 3. Testaufruf mit Beispiel-Nutzerdaten
generateHoroscopeForUser({
  name: "Christoph",
  birthDate: "1993-06-10",
  birthTime: "10:57:00",
  latitude: 53.5511,
  longitude: 9.9937,
  timezone: "Europe/Berlin"
});

