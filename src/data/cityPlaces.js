const cityPlaces = {
  // India
  "new delhi": [
    { name: "Red Fort", type: "monument", typeIcon: "🏰" },
    { name: "Qutub Minar", type: "monument", typeIcon: "🏰" },
    { name: "India Gate", type: "monument", typeIcon: "🏛️" },
    { name: "Humayun's Tomb", type: "monument", typeIcon: "🏰" },
    { name: "Lotus Temple", type: "temple", typeIcon: "🛕" },
    { name: "Akshardham Temple", type: "temple", typeIcon: "🛕" },
    { name: "National Museum New Delhi", type: "museum", typeIcon: "🏛️" },
    { name: "Jama Masjid Delhi", type: "mosque", typeIcon: "🕌" },
  ],
  "delhi": [
    { name: "Red Fort", type: "monument", typeIcon: "🏰" },
    { name: "Qutub Minar", type: "monument", typeIcon: "🏰" },
    { name: "India Gate", type: "monument", typeIcon: "🏛️" },
    { name: "Humayun's Tomb", type: "monument", typeIcon: "🏰" },
    { name: "Lotus Temple", type: "temple", typeIcon: "🛕" },
    { name: "Akshardham Temple", type: "temple", typeIcon: "🛕" },
    { name: "National Museum New Delhi", type: "museum", typeIcon: "🏛️" },
    { name: "Jama Masjid Delhi", type: "mosque", typeIcon: "🕌" },
  ],
  "agra": [
    { name: "Taj Mahal", type: "monument", typeIcon: "🏰" },
    { name: "Agra Fort", type: "monument", typeIcon: "🏰" },
    { name: "Fatehpur Sikri", type: "monument", typeIcon: "🏰" },
    { name: "Itmad-ud-Daulah", type: "monument", typeIcon: "🏰" },
    { name: "Mehtab Bagh", type: "attraction", typeIcon: "🏛️" },
    { name: "Sikandra Akbar's Tomb", type: "monument", typeIcon: "🏰" },
  ],
  "mumbai": [
    { name: "Gateway of India", type: "monument", typeIcon: "🏛️" },
    { name: "Chhatrapati Shivaji Maharaj Terminus", type: "monument", typeIcon: "🏰" },
    { name: "Elephanta Caves", type: "monument", typeIcon: "🏰" },
    { name: "Haji Ali Dargah", type: "mosque", typeIcon: "🕌" },
    { name: "Siddhivinayak Temple", type: "temple", typeIcon: "🛕" },
    { name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya", type: "museum", typeIcon: "🏛️" },
    { name: "Marine Drive Mumbai", type: "attraction", typeIcon: "🏛️" },
    { name: "Juhu Beach", type: "attraction", typeIcon: "🏛️" },
  ],
  "kolkata": [
    { name: "Victoria Memorial", type: "monument", typeIcon: "🏰" },
    { name: "Howrah Bridge", type: "monument", typeIcon: "🏛️" },
    { name: "Indian Museum Kolkata", type: "museum", typeIcon: "🏛️" },
    { name: "Dakshineswar Kali Temple", type: "temple", typeIcon: "🛕" },
    { name: "Belur Math", type: "temple", typeIcon: "🛕" },
    { name: "St. Paul's Cathedral Kolkata", type: "church", typeIcon: "⛪" },
    { name: "Marble Palace Kolkata", type: "monument", typeIcon: "🏰" },
    { name: "Kalighat Temple", type: "temple", typeIcon: "🛕" },
  ],
  "jaipur": [
    { name: "Amber Fort", type: "monument", typeIcon: "🏰" },
    { name: "Hawa Mahal", type: "monument", typeIcon: "🏰" },
    { name: "City Palace Jaipur", type: "monument", typeIcon: "🏰" },
    { name: "Jantar Mantar Jaipur", type: "monument", typeIcon: "🏛️" },
    { name: "Nahargarh Fort", type: "monument", typeIcon: "🏰" },
    { name: "Birla Mandir Jaipur", type: "temple", typeIcon: "🛕" },
    { name: "Albert Hall Museum", type: "museum", typeIcon: "🏛️" },
  ],
  "varanasi": [
    { name: "Kashi Vishwanath Temple", type: "temple", typeIcon: "🛕" },
    { name: "Dashashwamedh Ghat", type: "attraction", typeIcon: "🏛️" },
    { name: "Sarnath", type: "monument", typeIcon: "🏰" },
    { name: "Ramnagar Fort", type: "monument", typeIcon: "🏰" },
    { name: "Manikarnika Ghat", type: "attraction", typeIcon: "🏛️" },
    { name: "Sankat Mochan Hanuman Temple", type: "temple", typeIcon: "🛕" },
  ],
  "chennai": [
    { name: "Kapaleeshwarar Temple", type: "temple", typeIcon: "🛕" },
    { name: "Fort St. George", type: "monument", typeIcon: "🏰" },
    { name: "Government Museum Chennai", type: "museum", typeIcon: "🏛️" },
    { name: "Parthasarathy Temple", type: "temple", typeIcon: "🛕" },
    { name: "San Thome Cathedral", type: "church", typeIcon: "⛪" },
    { name: "Marina Beach", type: "attraction", typeIcon: "🏛️" },
  ],
  "hyderabad": [
    { name: "Charminar", type: "monument", typeIcon: "🏰" },
    { name: "Golconda Fort", type: "monument", typeIcon: "🏰" },
    { name: "Mecca Masjid Hyderabad", type: "mosque", typeIcon: "🕌" },
    { name: "Salar Jung Museum", type: "museum", typeIcon: "🏛️" },
    { name: "Birla Mandir Hyderabad", type: "temple", typeIcon: "🛕" },
    { name: "Hussain Sagar", type: "attraction", typeIcon: "🏛️" },
  ],
  "mysuru": [
    { name: "Mysore Palace", type: "monument", typeIcon: "🏰" },
    { name: "Chamundeshwari Temple", type: "temple", typeIcon: "🛕" },
    { name: "Brindavan Gardens", type: "attraction", typeIcon: "🏛️" },
    { name: "St. Philomena's Church", type: "church", typeIcon: "⛪" },
    { name: "Jaganmohan Palace", type: "museum", typeIcon: "🏛️" },
  ],

  // World
  "paris": [
    { name: "Eiffel Tower", type: "monument", typeIcon: "🏰" },
    { name: "Louvre Museum", type: "museum", typeIcon: "🏛️" },
    { name: "Notre-Dame de Paris", type: "church", typeIcon: "⛪" },
    { name: "Palace of Versailles", type: "monument", typeIcon: "🏰" },
    { name: "Arc de Triomphe", type: "monument", typeIcon: "🏛️" },
    { name: "Musée d'Orsay", type: "museum", typeIcon: "🏛️" },
    { name: "Sacré-Cœur", type: "church", typeIcon: "⛪" },
    { name: "Centre Pompidou", type: "museum", typeIcon: "🎨" },
  ],
  "rome": [
    { name: "Colosseum", type: "monument", typeIcon: "🏰" },
    { name: "Vatican Museums", type: "museum", typeIcon: "🏛️" },
    { name: "Trevi Fountain", type: "monument", typeIcon: "🏛️" },
    { name: "Pantheon Rome", type: "monument", typeIcon: "🏛️" },
    { name: "Roman Forum", type: "monument", typeIcon: "🏰" },
    { name: "St. Peter's Basilica", type: "church", typeIcon: "⛪" },
    { name: "Borghese Gallery", type: "museum", typeIcon: "🎨" },
  ],
  "london": [
    { name: "British Museum", type: "museum", typeIcon: "🏛️" },
    { name: "Tower of London", type: "monument", typeIcon: "🏰" },
    { name: "Buckingham Palace", type: "monument", typeIcon: "🏰" },
    { name: "Westminster Abbey", type: "church", typeIcon: "⛪" },
    { name: "National Gallery London", type: "museum", typeIcon: "🎨" },
    { name: "St. Paul's Cathedral", type: "church", typeIcon: "⛪" },
    { name: "Tate Modern", type: "museum", typeIcon: "🎨" },
    { name: "Stonehenge", type: "monument", typeIcon: "🏰" },
  ],
  "new york": [
    { name: "Metropolitan Museum of Art", type: "museum", typeIcon: "🎨" },
    { name: "Statue of Liberty", type: "monument", typeIcon: "🏛️" },
    { name: "Empire State Building", type: "monument", typeIcon: "🏛️" },
    { name: "The Museum of Modern Art", type: "museum", typeIcon: "🎨" },
    { name: "Brooklyn Bridge", type: "monument", typeIcon: "🏛️" },
    { name: "Central Park", type: "attraction", typeIcon: "🏛️" },
    { name: "American Museum of Natural History", type: "museum", typeIcon: "🏛️" },
  ],
  "tokyo": [
    { name: "Senso-ji Temple", type: "temple", typeIcon: "🛕" },
    { name: "Tokyo National Museum", type: "museum", typeIcon: "🏛️" },
    { name: "Meiji Shrine", type: "temple", typeIcon: "🛕" },
    { name: "Tokyo Tower", type: "monument", typeIcon: "🏛️" },
    { name: "Edo Castle", type: "monument", typeIcon: "🏰" },
    { name: "Shibuya Crossing", type: "attraction", typeIcon: "🏛️" },
  ],
  "cairo": [
    { name: "Great Pyramid of Giza", type: "monument", typeIcon: "🏰" },
    { name: "Egyptian Museum Cairo", type: "museum", typeIcon: "🏛️" },
    { name: "Sphinx", type: "monument", typeIcon: "🏰" },
    { name: "Khan el-Khalili", type: "attraction", typeIcon: "🏛️" },
    { name: "Mosque of Muhammad Ali", type: "mosque", typeIcon: "🕌" },
    { name: "Luxor Temple", type: "monument", typeIcon: "🏰" },
  ],
  "istanbul": [
    { name: "Hagia Sophia", type: "monument", typeIcon: "🏰" },
    { name: "Topkapi Palace", type: "monument", typeIcon: "🏰" },
    { name: "Blue Mosque", type: "mosque", typeIcon: "🕌" },
    { name: "Grand Bazaar Istanbul", type: "attraction", typeIcon: "🏛️" },
    { name: "Dolmabahce Palace", type: "monument", typeIcon: "🏰" },
    { name: "Istanbul Archaeological Museums", type: "museum", typeIcon: "🏛️" },
  ],
  "beijing": [
    { name: "Forbidden City", type: "monument", typeIcon: "🏰" },
    { name: "Great Wall of China", type: "monument", typeIcon: "🏰" },
    { name: "Temple of Heaven Beijing", type: "temple", typeIcon: "🛕" },
    { name: "Summer Palace Beijing", type: "monument", typeIcon: "🏰" },
    { name: "Tiananmen Square", type: "monument", typeIcon: "🏛️" },
    { name: "National Museum of China", type: "museum", typeIcon: "🏛️" },
  ],
};

// Fuzzy city matcher — handles partial names and alternate spellings
// Returns null if city is not in the curated database
export function getPlacesForCity(cityName) {
  if (!cityName) return null;

  const normalized = cityName.toLowerCase().trim();

  // Direct match
  if (cityPlaces[normalized]) return cityPlaces[normalized];

  // Partial match — city name contains key or key contains city name
  const match = Object.keys(cityPlaces).find(
    key => normalized.includes(key) || key.includes(normalized)
  );

  if (match) return cityPlaces[match];

  // No match — return null so caller can fall back to live API
  return null;
}

export default cityPlaces;

