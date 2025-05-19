const swisseph = require('swisseph');
const path = require('path');

// Argumente einlesen
const [,, birthDateTimeString, birthCity] = process.argv;

if (!birthDateTimeString || !birthCity) {
  console.error('❌ Bitte gib Datum/Zeit und Ort als Argumente an.');
  console.error('Beispiel: node calculate.js "1993-06-10T10:57:00" "Hamburg"');
  process.exit(1);
}

// Datum & Uhrzeit in Julianisches Datum umrechnen
const birthDate = new Date(birthDateTimeString);
const jd = swisseph.swe_julday(
  birthDate.getFullYear(),
  birthDate.getMonth() + 1,
  birthDate.getDate(),
  birthDate.getHours() + birthDate.getMinutes() / 60,
  swisseph.SE_GREG_CAL
);

// Ephemeridenpfad setzen
swisseph.swe_set_ephe_path(path.join(__dirname, 'ephe'));

// Planetenpositionen berechnen
const planets = [
  { id: swisseph.SE_SUN, symbol: '☀️', name: 'Sonne' },
  { id: swisseph.SE_MOON, symbol: '🌙', name: 'Mond' },
  { id: swisseph.SE_MERCURY, symbol: '☿', name: 'Merkur' },
  { id: swisseph.SE_VENUS, symbol: '♀', name: 'Venus' },
  { id: swisseph.SE_MARS, symbol: '♂', name: 'Mars' },
  { id: swisseph.SE_JUPITER, symbol: '♃', name: 'Jupiter' },
  { id: swisseph.SE_SATURN, symbol: '♄', name: 'Saturn' },
  { id: swisseph.SE_URANUS, symbol: '♅', name: 'Uranus' },
  { id: swisseph.SE_NEPTUNE, symbol: '♆', name: 'Neptun' },
  { id: swisseph.SE_PLUTO, symbol: '♇', name: 'Pluto' },
];

console.log('\n🌌 PLANETENPOSITIONEN:');

const positions = {};

planets.forEach(planet => {
  const result = swisseph.swe_calc_ut(jd, planet.id, swisseph.SEFLG_SWIEPH);
  positions[planet.name] = result.longitude;
  console.log(`${planet.symbol} ${planet.name} steht bei: ${result.longitude.toFixed(2)}°`);
});

// Häuser berechnen (Placidus-System)
swisseph.swe_houses(jd, 53.55, 10.00, 'P', (houses) => {
  console.log('\n🏠 HÄUSER (house):');
  if (!houses || !houses.house) {
    console.log('⚠️  Fehler: Die Häuser-Datenstruktur ist unerwartet.');
    return;
  }

  houses.house.forEach((deg, i) => {
    console.log(`Haus ${i + 1}: ${deg.toFixed(2)}°`);
  });
});

// Aspekte zwischen Planeten berechnen
console.log('\n🔗 ASPEKTE:');
const aspectList = [
  { name: 'Konjunktion', angle: 0, orb: 10 },
  { name: 'Opposition', angle: 180, orb: 8 },
  { name: 'Trigon', angle: 120, orb: 8 },
  { name: 'Quadrat', angle: 90, orb: 8 },
  { name: 'Sextil', angle: 60, orb: 6 },
];

for (let i = 0; i < planets.length; i++) {
  for (let j = i + 1; j < planets.length; j++) {
    const angle = Math.abs(positions[planets[i].name] - positions[planets[j].name]);
    const diff = Math.min(angle, 360 - angle);

    aspectList.forEach(aspect => {
      if (Math.abs(diff - aspect.angle) <= aspect.orb) {
        console.log(`${planets[i].symbol} ${planets[i].name} ${aspect.name} ${planets[j].symbol} 
${planets[j].name} (${diff.toFixed(2)}°)`);
      }
    });
  }
}

