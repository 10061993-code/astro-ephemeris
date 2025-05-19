require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const inputPath = path.join(__dirname, "horoscope", "caroline_horoscope.json");
const stylePath = path.join(__dirname, "prompts", "promptStyle.txt");
const outputPath = path.join(__dirname, "text", "caroline_horoscope.txt");

async function createHoroscopeText() {
  const astroData = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const tonalität = fs.readFileSync(stylePath, "utf8");

  const systemPrompt = `Du bist eine moderne Astrologin, die feinfühlige, motivierende Texte schreibt.`;
  const userPrompt = `
Hier sind astrologische Geburtsdaten als JSON:

${JSON.stringify(astroData, null, 2)}

${tonalität}
Bitte formuliere auf dieser Grundlage einen stimmigen Geburtshoroskop-Text.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0.8,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  const result = response.choices[0].message.content;
  fs.writeFileSync(outputPath, result, "utf8");
  console.log(`✅ Horoskoptext gespeichert unter: ${outputPath}`);
}

createHoroscopeText().catch((err) => {
  console.error("❌ Fehler beim Generieren des Horoskoptexts:", err);
});

