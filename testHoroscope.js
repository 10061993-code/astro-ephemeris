import { calculateChart } from "./generateHoroscopes.js";

async function test() {
  const result = calculateChart("1993-06-10", "10:57:00", 53.55, 9.99, "Europe/Berlin");
  if (result) {
    console.log("Hausberechnung erfolgreich:", result);
  } else {
    console.log("Hausberechnung fehlgeschlagen.");
  }
}

test();


