import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateHash } from './imageUtils';

const SYSTEM_PROMPT = `You are a world-class immersive cultural narrator for a tourism app. 
Analyze the image and respond ONLY in this exact JSON format with no 
markdown, no backticks, no extra text:
{
  "name": "Monument or place name",
  "location": "City, Country",
  "narration": "Three paragraphs of cinematic, emotional, immersive narration about this place. Write like a movie narrator — evocative, dramatic, inspiring. Minimum 200 words.",
  "funFacts": ["fact 1", "fact 2", "fact 3"],
  "timeline": [
    {"year": "year", "event": "what happened"},
    {"year": "year", "event": "what happened"},
    {"year": "year", "event": "what happened"}
  ],
  "hindiNarration": "Same narration translated to Hindi",
  "bengaliNarration": "Same narration translated to Bengali"
}`;

/**
 * Parse raw LLM text into a JSON object, stripping markdown fences if present.
 * @param {string} rawText
 * @returns {object}
 */
function parseMonumentResponse(rawText) {
  // Strip markdown fences if present
  let text = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    // The JSON may be truncated — try to repair by closing open strings/objects
    // Remove any trailing incomplete key-value pair
    text = text.replace(/,\s*"[^"]*"?\s*:?\s*"?[^}]*$/, '');
    // Close any unclosed strings, arrays, objects
    const opens = (text.match(/{/g) || []).length;
    const closes = (text.match(/}/g) || []).length;
    const arrOpens = (text.match(/\[/g) || []).length;
    const arrCloses = (text.match(/]/g) || []).length;
    // Close trailing open string if needed
    if ((text.match(/"/g) || []).length % 2 !== 0) text += '"';
    for (let i = 0; i < arrOpens - arrCloses; i++) text += ']';
    for (let i = 0; i < opens - closes; i++) text += '}';
    return JSON.parse(text);
  }
}

// ─── Individual API callers ──────────────────────────────────────────────────

/**
 * Call Groq (primary — fastest, free).
 * Model: meta-llama/llama-4-scout-17b-16e-instruct (vision-capable)
 */
async function callGroq(base64Image) {
  const apiKey = import.meta.env.VITE_GROQ_KEY;
  if (!apiKey) throw new Error('VITE_GROQ_KEY not set');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: SYSTEM_PROMPT },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }],
      max_tokens: 4096,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  if (data.choices[0].finish_reason === 'length') {
    console.warn('⚠️  Groq response was truncated (hit token limit)');
  }
  return data.choices[0].message.content;
}

/**
 * Call OpenRouter (fallback — free credits).
 * Model: meta-llama/llama-3.2-11b-vision-instruct:free
 */
async function callOpenRouter(base64Image) {
  const apiKey = import.meta.env.VITE_OPENROUTER_KEY;
  if (!apiKey) throw new Error('VITE_OPENROUTER_KEY not set');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://cultural-lens.vercel.app',
      'X-Title': 'Cultural Lens'
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.2-11b-vision-instruct:free',
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: SYSTEM_PROMPT },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
        ]
      }],
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  if (data.choices[0].finish_reason === 'length') {
    console.warn('⚠️  OpenRouter response was truncated (hit token limit)');
  }
  return data.choices[0].message.content;
}

/**
 * Call Gemini (last resort — existing implementation).
 * Model: gemini-flash-latest
 */
async function callGemini(base64Image) {
  const apiKey = import.meta.env.VITE_GEMINI_KEY;
  if (!apiKey) throw new Error('VITE_GEMINI_KEY not set');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

  const imageParts = [
    {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg'
      }
    }
  ];

  const result = await model.generateContent([SYSTEM_PROMPT, ...imageParts]);
  return await result.response.text();
}

// ─── Main orchestrator ───────────────────────────────────────────────────────

/**
 * Analyse a monument image with a three-tier API fallback and localStorage cache.
 *
 * @param {string} base64Image  Base64-encoded JPEG (no data-URI prefix)
 * @returns {Promise<{data: object, usedAPI: string}>}
 */
export async function analyzeMonument(base64Image) {
  // Step 1: Check localStorage cache (v2 = SHA-256 hash, invalidates old broken entries)
  const imageHash = await generateHash(base64Image);
  const cacheKey = `cl_v2_${imageHash}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    console.log('🗂️  Returning cached result');
    const parsed = JSON.parse(cached);
    return { data: parsed.data ?? parsed, usedAPI: parsed.usedAPI ?? 'Cache' };
  }

  // Step 2: Try APIs in priority order — Groq → OpenRouter → Gemini
  const apis = [
    { name: 'Groq', fn: callGroq },
    { name: 'OpenRouter', fn: callOpenRouter },
    { name: 'Gemini', fn: callGemini }
  ];

  let rawText = null;
  let usedAPI = '';
  let lastError = null;

  for (const api of apis) {
    try {
      rawText = await api.fn(base64Image);
      usedAPI = api.name;
      break;
    } catch (err) {
      console.warn(`⚠️  ${api.name} failed:`, err.message);
      lastError = err;
    }
  }

  if (!rawText) {
    throw new Error('All APIs failed. Please try again later.', { cause: lastError });
  }

  // Step 3: Parse the JSON response
  const parsed = parseMonumentResponse(rawText);

  // Step 4: Cache the result in localStorage
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ data: parsed, usedAPI }));
  } catch (e) {
    console.warn('Cache write failed (storage full?)', e.message);
  }

  console.log(`✅ Success using ${usedAPI}`);
  return { data: parsed, usedAPI };
}
