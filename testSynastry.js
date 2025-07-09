import { calculateSynastry } from './calculateSynastry.js';

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

const aspekts = calculateSynastry(horoskopA, horoskopB);

console.log('Gefundene Aspekte:', aspekts);

