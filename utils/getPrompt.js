function getPromptFromCreatorStyle(creator, useCase = "birthChart") {
  const { tone, astroSchool, depthLevel, archetypeFocus } = creator.style;
  const moduleLabel = {
    birthChart: "ein Geburtshoroskop",
    currentTransits: "eine astrologische Deutung aktueller Transite",
    partnerAnalysis: "eine astrologische Beziehungsanalyse",
    careerInsight: "eine astrologische Berufsdeutung"
  };

  return `
Bitte verfasse ${moduleLabel[useCase]} im Stil von ${tone}.
Orientiere dich an den Prinzipien der ${astroSchool} Astrologie.
Die Analyse soll ${depthLevel} sein${archetypeFocus ? " und auf psychologische Archetypen eingehen" : ""}.
Sprich die Leser:in direkt und einfühlsam an.
Verzichte auf Schlagworte wie "Sternzeichen", "Vorhersage" oder "Zukunft". Stattdessen: Entwicklung, 
Potenzial, Selbstverantwortung.
  `.trim();
}

module.exports = { getPromptFromCreatorStyle };

