const { execSync } = require('child_process');

function getCycles(birthDate, birthTime, lat, lon, nowDate) {
  try {
    const command = `python3 calculate_cycles.py ${birthDate} ${birthTime} ${lat} ${lon} ${nowDate}`;
    const output = execSync(command, { encoding: 'utf-8' });
    return JSON.parse(output);
  } catch (error) {
    console.error("Fehler beim Abrufen der Langzeitzyklen:", error.message);
    return {};
  }
}

module.exports = getCycles;

