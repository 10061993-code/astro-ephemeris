import fetch from 'node-fetch';
import NodeGeocoder from 'node-geocoder';
import tzlookup from 'tz-lookup';

// Erstelle einen Geocoder (OpenStreetMap)
const geocoder = NodeGeocoder({
  provider: 'openstreetmap',
});

// Funktion, die Koordinaten und Zeitzone basierend auf einem Ort liefert
export async function getCoordinatesAndTimezone(place) {
  // Koordinaten ermitteln
  const res = await geocoder.geocode(place);
  if (!res || res.length === 0) {
    throw new Error(`Ort nicht gefunden: ${place}`);
  }
  const { latitude: lat, longitude: lon } = res[0];

  // Zeitzone ermitteln
  const timezone = tzlookup(lat, lon);

  return { lat, lon, timezone };
}

