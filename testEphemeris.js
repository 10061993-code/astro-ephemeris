process.env.SE_EPHE_PATH = './ephe';
const swe = require('swisseph');

// Julianisches Datum für 10. Juni 1993, 10:57 Uhr UTC
const julDay = 2449143.95694;

// Ausgabeformat
function logPlanet(name, result) {
  if (!result || result.return !== 0) {
    console.error(`❌ Fehler bei ${name}:`, result?.serr || 'Unbekannter Fehler');
  } else {
    console.log(`${name} (Longitude): ${result.xx[0].toFixed(2)}°`);
  }
}

// ☀️ Sonne
logPlanet("☀️ Sonne", swe.swe_calc_ut(julDay, swe.SE_SUN, swe.SEFLG_SWIEPH));

// ☊ Mondknoten
logPlanet("☊ Mondknoten (mean)", swe.swe_calc_ut(julDay, swe.SE_MEAN_NODE, swe.SEFLG_SWIEPH));

// ⚫ Lilith
logPlanet("⚫ Lilith", swe.swe_calc_ut(julDay, swe.SE_MEAN_APOG, swe.SEFLG_SWIEPH));

