import { getCoordinatesAndTimezone } from './geocode.js';

async function test() {
  const result = await getCoordinatesAndTimezone("Hamburg");
  console.log("Geocode Test:", result);
}

test();

