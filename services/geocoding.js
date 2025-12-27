import axios from 'axios';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY; // store key in .env

/**
 * Check if a city exists using Google Maps Geocoding API.
 * @param {string} cityName
 * @returns {Promise<boolean>}
 */
export async function checkCityExists(cityName) {
  if (!cityName) return false;

  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: cityName,
        key: GOOGLE_MAPS_API_KEY,
      },
    });

    const results = res.data.results;
    if (!results || results.length === 0) return false;

    return results.some((r) => r.types.includes('locality'));
  } catch (err) {
    console.error('Geocoding error:', err);
    return false;
  }
}
