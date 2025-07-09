// generateSynastryText.js

export function generatePartnerHoroscopeText(aspects, nameA, nameB) {
  // Beispielhafte, einfache Deutung der Aspekte
  let text = `Liebe ${nameA} und ${nameB},\n\n`;
  text += "hier ist eure astrologische Synastrie-Analyse:\n\n";

  aspects.forEach((aspect) => {
    text += `- Zwischen ${aspect.planetA} und ${aspect.planetB} besteht ein ${aspect.aspect} mit einem Orbis von ${aspect.orbDifference} Grad.\n`;
  });

  text += `\nDiese Aspekte zeigen, wie ihr in Beziehung zueinander steht. Für detailliertere Interpretationen folgt bald mehr.`;

  return text;
}

