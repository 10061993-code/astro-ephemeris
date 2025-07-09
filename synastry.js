export function calculateAspects(planetsA, planetsB) {
  const aspects = [];
  const aspectAngles = {
    Konjunktion: 0,
    Opposition: 180,
    Trigon: 120,
    Quadrat: 90,
    Sextil: 60
  };
  const orb = 6;

  for (const [planetA, posA] of Object.entries(planetsA)) {
    for (const [planetB, posB] of Object.entries(planetsB)) {
      const angle = Math.abs(posA.deg - posB.deg);
      const diff = angle > 180 ? 360 - angle : angle;

      for (const [name, target] of Object.entries(aspectAngles)) {
        if (Math.abs(diff - target) <= orb) {
          aspects.push({
            planetA,
            planetB,
            angle: diff.toFixed(2),
            type: name
          });
        }
      }
    }
  }

  return aspects;
}

