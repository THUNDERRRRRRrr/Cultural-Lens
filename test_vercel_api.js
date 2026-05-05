import nearby from './api/nearby.js';
import geocode from './api/geocode.js';
import search from './api/search.js';
import photo from './api/photo.js';

async function testEndpoint(name, handler, query) {
  return new Promise(async (resolve) => {
    const req = {
      method: 'GET',
      query
    };
    let statusCode = 200;
    const res = {
      setHeader: () => {},
      status: (code) => {
        statusCode = code;
        return res;
      },
      json: (data) => {
        resolve({ code: statusCode, data });
      },
      end: () => {
        resolve({ code: statusCode, data: 'ended' });
      }
    };

    try {
      await handler(req, res);
    } catch (err) {
      resolve({ code: 500, error: err.message });
    }
  });
}

async function run() {
  console.log("Testing api/nearby.js...");
  const nearbyRes = await testEndpoint('nearby', nearby, { lat: 48.8566, lng: 2.3522 });
  console.log("nearby:", nearbyRes.code, nearbyRes.data?.elements ? `Got ${nearbyRes.data.elements.length} elements` : nearbyRes.data);

  console.log("Testing api/geocode.js...");
  const geocodeRes = await testEndpoint('geocode', geocode, { lat: 48.8566, lng: 2.3522 });
  console.log("geocode:", geocodeRes.code, geocodeRes.data?.address ? (geocodeRes.data.address.city || geocodeRes.data.address.town || 'Found location') : geocodeRes.data);

  console.log("Testing api/search.js...");
  const searchRes = await testEndpoint('search', search, { q: 'Paris' });
  console.log("search:", searchRes.code, Array.isArray(searchRes.data) ? `Got ${searchRes.data.length} results` : searchRes.data);

  console.log("Testing api/photo.js...");
  const photoRes = await testEndpoint('photo', photo, { name: 'Louvre' });
  console.log("photo:", photoRes.code, photoRes.data?.thumbnail ? 'Got thumbnail' : photoRes.data);
}

run();
