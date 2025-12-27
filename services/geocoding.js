import axios from 'axios';

/**
 * Check if a city exists using OpenStreetMap Nominatim API.
 * @param {string} cityName
 * @returns {Promise<boolean>}
 */
export async function checkCityExists(cityName) {
  if (!cityName) return false;

  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: cityName,
        format: 'json',
        addressdetails: 1,
        limit: 1,
      },
    });

    if (res.data.length === 0) return false;

    const type = res.data[0].type; // "city", "town", "village", etc.
    return type === 'city' || type === 'town' || type === 'village';
  } catch (err) {
    console.error('Geocoding error:', err);
    return false; // assume invalid on error
  }
}
