require('dotenv').config();
const fs = require('fs');
const path = require('path');
const swisseph = require('swisseph');

// Swiss Ephemeris Pfad setzen
swisseph.swe_set_ephe_path(path.join(__dirname, 'ephe'));

// Beispiel-Geburtsdaten
const birth = {
  name: "Caroline",
  email: "caroline@example.com",
  date: "1993-06-10",
  time: "10:57",
  place: "Hamburg, Deutschland",
  latitude: 53.550341,
  longitude: 10.000654,
  timezone: "Europe/Berlin" // nur informativ
};

// Zeit in UTC umrechnen
const date = new Date(`${birth.date}T${birth.time}:00`);
const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60;
const jd = swisseph.swe_julday(
  date.getUTCFullYear(),
  date.getUTCMonth() + 1,
  date.getUTCDate(),
  utcHours,
  swisseph.SE_GREG_CAL
);

// Häuser berechnen
const houseData = swisseph.swe_houses(jd, birth.latitude, birth.longitude, 'P');

if (!houseData || !houseData.house) {
  console.error("❌ Fehler bei Häuserberechnung: Hausdaten fehlen");
  process.exit(1);
}

// Tierkreiszeichen-Zuordnung
const signs = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function getSign(lon) {
  return signs[Math.floor(lon / 30)];
}

function getHouse(lon, cusps) {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12] < start ? cusps[(i + 1) % 12] + 360 : cusps[(i + 1) % 12];
    const adjLon = lon < start ? lon + 360 : lon;
    if (adjLon >= start && adjLon < end) return i + 1;
  }
  return null;
}

// Planeten berechnen
const planetList = [
  { id: swisseph.SE_SUN, name: "Sun" },
  { id: swisseph.SE_MOON, name: "Moon" },
  { id: swisseph.SE_MERCURY, name: "Mercury" },
  { id: swisseph.SE_VENUS, name: "Venus" },
  { id: swisseph.SE_MARS, name: "Mars" },
  { id: swisseph.SE_JUPITER, name: "Jupiter" },
  { id: swisseph.SE_SATURN, name: "Saturn" },
  { id: swisseph.SE_URANUS, name: "Uranus" },
  { id: swisseph.SE_NEPTUNE, name: "Neptune" },
  { id: swisseph.SE_PLUTO, name: "Pluto" }
];

const results = [];

planetList.forEach(planet => {
  const pos = swisseph.swe_calc_ut(jd, planet.id, swisseph.SEFLG_SWIEPH);
  if (pos.error) {
    console.error(`❌ Fehler bei Berechnung von ${planet.name}:`, pos.error);
    return;
  }
  results.push({
    name: planet.name,
    position: pos.longitude,
    sign: getSign(pos.longitude),
    house: getHouse(pos.longitude, houseData.house)
  });
});

// Aszendent und MC hinzufügen
results.push({
  name: "Ascendant",
  position: houseData.ascendant,
  sign: getSign(houseData.ascendant),
  house: 1
});

results.push({
  name: "Midheaven (MC)",
  position: houseData.mc,
  sign: getSign(houseData.mc),
  house: 10
});

// Ergebnis speichern
const outputDir = path.join(__dirname, 'output', 'birthcharts');
fs.mkdirSync(outputDir, { recursive: true });
const fileName = `horoscope-${Date.now()}.json`;
fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify({
  birth,
  jd,
  planets: results,
  houses: houseData.house,
  ascendant: houseData.ascendant,
  mc: houseData.mc
}, null, 2));

console.log(`✅ Geburtshoroskop erfolgreich erstellt: output/birthcharts/${fileName}`);

