const fs = require('fs');
const path = require('path');

// Zeichen-Zuordnung für Elemente und Modalitäten
const elementsMap = {
  Aries: 'Feuer', Leo: 'Feuer', Sagittarius: 'Feuer',
  Taurus: 'Erde', Virgo: 'Erde', Capricorn: 'Erde',
  Gemini: 'Luft', Libra: 'Luft', Aquarius: 'Luft',
  Cancer: 'Wasser', Scorpio: 'Wasser', Pisces: 'Wasser'
};

const modalitiesMap = {
  Aries: 'Kardinal', Cancer: 'Kardinal', Libra: 'Kardinal', Capricorn: 'Kardinal',
  Taurus: 'Fix', Leo: 'Fix', Scorpio: 'Fix', Aquarius: 'Fix',
  Gemini: 'Beweglich', Virgo: 'Beweglich', Sagittarius: 'Beweglich', Pisces: 'Beweglich'
};

// Vereinfachte Zeichenherrscher
const rulership = {
  Sun: 'Leo', Moon: 'Cancer', Mercury: 'Gemini',
  Venus: 'Taurus', Mars: 'Aries', Jupiter: 'Sagittarius',
  Saturn: 'Capricorn', Uranus: 'Aquarius', Neptune: 'Pisces', Pluto: 'Scorpio'
};

function analyzeProfile(horoscope) {
  const elementCounts = { Feuer: 0, Erde: 0, Luft: 0, Wasser: 0 };
  const modalityCounts = { Kardinal: 0, Fix: 0, Beweglich: 0 };
  const houseCounts = Array(12).fill(0);
  const planetScores = {};

  for (const [planet, data] of Object.entries(horoscope.planets)) {
    const { sign, house } = data;

    // Element & Modalität zählen
    if (elementsMap[sign]) elementCounts[elementsMap[sign]]++;
    if (modalitiesMap[sign]) modalityCounts[modalitiesMap[sign]]++;
    if (house) houseCounts[house - 1]++;

    // Planetendominanz-Punkte
    let score = 0;
    const reasons = [];

    if (house === 1 || house === 10) {
      score += 3;
      reasons.push(`im Haus ${house}`);
    }
    if (rulership[planet] === sign) {
      score += 2;
      reasons.push(`im eigenen Zeichen (${sign})`);
    }
    const planetElement = elementsMap[sign];
    if (elementCounts[planetElement] === 1) {
      score += 1;
      reasons.push(`einziger Planet im Element ${planetElement}`);
    }

    if (score > 0) {
      planetScores[planet] = { score, reasons };
    }
  }

  // Dominanten Planet bestimmen
  let dominant = null;
  for (const [planet, { score, reasons }] of Object.entries(planetScores)) {
    if (!dominant || score > dominant.score) {
      dominant = { name: planet, score, reasons };
    }
  }

  return {
    name: horoscope.name,
    elements: elementCounts,
    modalities: modalityCounts,
    houseCluster: houseCounts
      .map((count, i) => ({ haus: i + 1, anzahl: count }))
      .filter(h => h.anzahl > 1),
    dominantPlanet: dominant || null
  };
}

// Batch-Verarbeitung für alle Nutzer:innen
const inputDir = './horoscope/';
const outputDir = './profiles/';
fs.mkdirSync(outputDir, { recursive: true });

fs.readdirSync(inputDir).forEach(file => {
  const filepath = path.join(inputDir, file);
  if (file.endsWith('.json')) {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const profile = analyzeProfile(data);
    const filename = `${data.name.toLowerCase().replace(/ /g, '_')}_profile.json`;
    fs.writeFileSync(path.join(outputDir, filename), JSON.stringify(profile, null, 2));
    console.log(`✅ Profil erstellt für ${data.name}`);
  }
});

