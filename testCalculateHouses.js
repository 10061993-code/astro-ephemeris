import { calculateHouses } from './calculateHouses.js';

(async () => {
  try {
    const result = await calculateHouses('1993-06-10', '10:57:00', 53.5511, 9.9937, 'Europe/Berlin');
    console.log('Result:', result);
  } catch (err) {
    console.error('Error:', err);
  }
})();

