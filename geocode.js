const NodeGeocoder = require('node-geocoder');
const tzlookup = require('tz-lookup');

const options = {
  provider: 'openstreetmap',
};

const geocoder = NodeGeocoder(options);

/**
 * Wandelt einen Ort in Koordinaten + Zeitzone um
 * @param {string} placeName - z. B. "Hamburg, Deutschland"
 * @returns {Promise<{ latitude: number, longitude: number, timezone: string }>}
 */
async function geocode(placeName) {
  const res = await geocoder.geocode(placeName);

  if (!res || res.length === 0) {
    throw new Error(`Ort nicht gefunden: "${placeName}"`);
  }

  const { latitude, longitude } = res[0];
  const timezone = tzlookup(latitude, longitude);

  return {
    latitude,
    longitude,
    timezone
  };
}

module.exports = geocode;

