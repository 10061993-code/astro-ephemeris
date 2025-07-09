import { calculateSynastry } from './calculateSynastry.js';
import { generateSynastryText } from './generateSynastryText.js';

const horoskopA = {
  sun: 120,
  moon: 45,
  mercury: 150,
  venus: 80,
  mars: 200,
};

const horoskopB = {
  sun: 125,
  moon: 225,
  mercury: 75,
  venus: 85,
  mars: 188,
};

async function test() {
  const aspects = calculateSynastry(horoskopA, horoskopB);
  console.log('Berechnete Aspekte:', aspects);

  const text = await generateSynastryText(aspects, { name: 'Anna' }, { name: 'Ben' });
  console.log('\nGPT-Synastrie-Deutung:\n', text);
}

test();

