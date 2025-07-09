import { getCoordinatesAndTimezone } from './geocode.js';
import { execSync } from 'child_process';
import { calculateAspects } from './synastry.js';

export async function generatePartnerHoroscope(birthDataA, birthDataB) {
  try {
    // Koordinaten und Zeitzone holen
    const coordsA = await getCoordinatesAndTimezone(birthDataA.place);
    const coordsB = await getCoordinatesAndTimezone(birthDataB.place);

    // Häuser & Aszendenten berechnen (via Python-Skript)
    const chartA = calculateChart(birthDataA.datetime, coordsA);
    const chartB = calculateChart(birthDataB.datetime, coordsB);

    // Aspekte berechnen
    const aspects = calculateAspects(chartA.planets, chartB.planets);

    // Ergebnis zurückgeben
    return {
      personA: chartA,
      personB: chartB,
      aspects,
    };
  } catch (error) {
    console.error("Fehler beim Generieren des Partnerhoroskops:", error);
    throw error;
  }
}

function calculateChart(datetimeISO, coords) {
  const [date, time] = datetimeISO.split('T');
  const { lat, lon, timezone } = coords;

  const result = execSync(
    `python3 ./calculate_houses.py "${date}" "${time}" ${lat} ${lon} ${timezone}`,
    { encoding: 'utf8' }
  );

  return JSON.parse(result);
}

