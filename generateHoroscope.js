// generateHoroscope.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const swisseph = require("swisseph");

swisseph.swe_set_ephe_path(path.join(__dirname, "ephe")); // Stelle sicher, dass die ephe-Dateien vorhanden sind

const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data", "users.json"), "utf8"));
const outputDir = path.join(__dirname, "horoscope");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

function parseDateTime(dateStr, timeStr, timezone) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const localTime = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  const utcTime = new Date(localTime.toISOString());

  return {
    year: utcTime.getUTCFullYear(),
    month: utcTime.getUTCMonth() + 1,
    day: utcTime.getUTCDate(),
    hour: utcTime.getUTCHours() + utcTime.getUTCMinutes() / 60
  };
}

function getPlanetPositions(julianDay) {
  const planets = [
    swisseph.SE_SUN,
    swisseph.SE_MOON,
    swisseph.SE_MERCURY,
    swisseph.SE_VENUS,
    swisseph.SE_MARS,
    swisseph.SE_JUPITER,
    swisseph.SE_SATURN,
    swisseph.SE_URANUS,
    swisseph.SE_NEPTUNE,
    swisseph.SE_PLUTO
  ];

  const planetNames = [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto"
  ];

  const positions = {};

  planets.forEach((planet, i) => {
    const pos = swisseph.swe_calc_ut(julianDay, planet, swisseph.SEFLG_SWIEPH);
    positions[planetNames[i]] = pos.longitude;
  });

  return positions;
}

async function generate() {
  for (const user of users) {
    const { name, birth } = user;
    const { year, month, day, hour } = parseDateTime(birth.date, birth.time, birth.timezone);

    // Berechne Julian Day
    const julianDay = swisseph.swe_julday(year, month, day, hour, swisseph.SE_GREG_CAL);

    // Planetenpositionen berechnen
    const planetPositions = getPlanetPositions(julianDay);

    // Python-Skript für AC, MC, Häuser aufrufen
    const args = [
      birth.date,
      birth.time,
      birth.latitude,
      birth.longitude,
      birth.timezone
    ];

    const houseDataRaw = execSync(`python3 calculate_houses.py ${args.join(" ")}`, {
      encoding: "utf8"
    });

    let houseData = {};
    try {
      houseData = JSON.parse(houseDataRaw);
    } catch (err) {
      console.error(`❌ Fehler beim Parsen von houseData für ${name}:`, err.message);
      continue;
    }

    const result = {
      name,
      email: user.email,
      birth,
      planets: planetPositions,
      ascendant: houseData.ascendant,
      midheaven: houseData.midheaven,
      houses: houseData.houses
    };

    const filename = name.toLowerCase().replace(/\s+/g, "_") + "_horoscope.json";
    const outputPath = path.join(outputDir, filename);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf8");
    console.log(`✅ Horoskop gespeichert für ${name}: ${outputPath}`);
  }
}

generate();
