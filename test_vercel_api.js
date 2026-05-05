import geocode from './api/geocode.js';
import search from './api/search.js';
import photo from './api/photo.js';

async function testEndpoint(name, handler, query) {
  return new Promise(async (resolve) => {
    const req = { method: 'GET', query };
    let statusCode = 200;
    const res = {
      setHeader: () => {},
      status: (code) => { statusCode = code; return res; },
      json: (data) => { resolve({ code: statusCode, data }); },
      end: () => { resolve({ code: statusCode, data: 'ended' }); }
    };
    try {
      await handler(req, res);
    } catch (err) {
      resolve({ code: 500, error: err.message });
    }
  });
}

async function run() {
  console.log("=== Cultural Lens API Tests ===\n");

  console.log("1. Testing api/geocode.js (Paris coords)...");
  const geocodeRes = await testEndpoint('geocode', geocode, { lat: 48.8566, lng: 2.3522 });
  console.log("   →", geocodeRes.code === 200 ? '✅' : '❌', geocodeRes.code,
    geocodeRes.data?.address ? (geocodeRes.data.address.city || geocodeRes.data.address.town || 'Found location') : geocodeRes.data);

  console.log("\n2. Testing api/search.js (query: Paris)...");
  const searchRes = await testEndpoint('search', search, { q: 'Paris' });
  console.log("   →", searchRes.code === 200 ? '✅' : '❌', searchRes.code,
    Array.isArray(searchRes.data) ? `Got ${searchRes.data.length} results` : searchRes.data);

  console.log("\n3. Testing api/photo.js (Eiffel Tower)...");
  const photoRes = await testEndpoint('photo', photo, { name: 'Eiffel Tower' });
  console.log("   →", photoRes.code === 200 ? '✅' : '❌', photoRes.code,
    photoRes.data?.thumbnail ? `Got thumbnail: ${photoRes.data.thumbnail.source?.substring(0, 60)}...` : photoRes.data);

  console.log("\n=== All API tests complete ===");
}

run();
