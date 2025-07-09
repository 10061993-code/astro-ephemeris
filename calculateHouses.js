import { execFile } from 'child_process';
import path from 'path';

export function calculateHouses(date, time, lat, lon, timezone) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve('./calculate_houses.py');

    execFile('python3', [scriptPath, date, time, lat.toString(), lon.toString(), timezone], (error, stdout, stderr) => {
      if (error) return reject(error);
      if (stderr) console.warn('Python stderr:', stderr);

      try {
        const data = JSON.parse(stdout);
        resolve(data);
      } catch (err) {
        reject(new Error('JSON Parsing error: ' + err.message));
      }
    });
  });
}

