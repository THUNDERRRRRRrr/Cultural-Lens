/* eslint-disable no-undef */
import { GoogleGenerativeAI } from '@google/generative-ai';
import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd());
const apiKey = env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_KEY;

if (!apiKey) {
  console.error("Missing API Key");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hello, what model are you?");
    console.log("Success:", result.response.text());
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
