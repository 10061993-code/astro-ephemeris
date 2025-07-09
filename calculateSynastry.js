// Aspekte mit typischem Orbis in Grad
const ASPEKTE = [
  { name: "Konjunktion", angle: 0, orb: 8 },
  { name: "Opposition", angle: 180, orb: 8 },
  { name: "Trigon", angle: 120, orb: 8 },
  { name: "Quadrat", angle: 90, orb: 6 },
  { name: "Sextil", angle: 60, orb: 6 },
];

/**
 * Berechnet synastrische Aspekte zwischen zwei Sets von Planetengraden.
 * @param {Object} planetsA - Objekt mit Planeten und ihren Graden, z.B. { sun: 120, moon: 45, ... }
 * @param {Object} planetsB - Gleiches für Partner B
 * @returns {Array} Liste der gefundenen Aspekte mit Details, sortiert nach Orbis
 */
export function calculateSynastry(planetsA, planetsB) {
  const aspectsFound = [];

  for (const [planetA, degreeA] of Object.entries(planetsA)) {
    for (const [planetB, degreeB] of Object.entries(planetsB)) {
      const diff = Math.abs(degreeA - degreeB);
      const orbAdjusted = diff > 180 ? 360 - diff : diff;

      for (const aspekt of ASPEKTE) {
        const orbDifference = Math.abs(orbAdjusted - aspekt.angle);
        if (orbDifference <= aspekt.orb) {
          aspectsFound.push({
            planetA,
            planetB,
            aspect: aspekt.name,
            exactDegreeDifference: orbAdjusted,
            orbDifference,
          });
        }
      }
    }
  }

  // Sortiere die Aspekte nach Orbis aufsteigend (genaueste zuerst)
  aspectsFound.sort((a, b) => a.orbDifference - b.orbDifference);

  return aspectsFound;
}

