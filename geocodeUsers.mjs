import fs from 'fs';
import fetch from 'node-fetch';

// Nutzer-Daten einlesen
const users = JSON.parse(fs.readFileSync('./users.json', 'utf8'));

async function geocodeLocation(location) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'astro-newsletter-bot'
    }
  });

  const data = await response.json();
  if (data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon)
  };
}

async function enrichUsersWithCoords() {
  for (const user of users) {
    if (!user.lat || !user.lon) {
      console.log(`🌍 Ermittele Koordinaten für: ${user.name} (${user.geburtsort})`);
      const coords = await geocodeLocation(user.geburtsort);
      if (coords) {
        user.lat = coords.lat;
        user.lon = coords.lon;
        console.log(`✅ Gefunden: lat=${coords.lat}, lon=${coords.lon}`);
      } else {
        console.warn(`❌ Keine Koordinaten gefunden für ${user.geburtsort}`);
      }
    }
  }

  fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
  console.log(`💾 Datei users.json aktualisiert.`);
}

enrichUsersWithCoords();

