import { generatePartnerHoroscope } from './generatePartner.js';

async function test() {
  const birthDataA = {
    datetime: "1993-06-10T10:57:00",
    place: "Hamburg"
  };

  const birthDataB = {
    datetime: "1995-02-13T21:15:00",
    place: "Hamburg"
  };

  try {
    const result = await generatePartnerHoroscope(birthDataA, birthDataB);
    console.log("Partnerhoroskop Ergebnis:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Fehler beim Test:", error);
  }
}

test();

