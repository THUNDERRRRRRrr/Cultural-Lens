import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { compressImage } from '../utils/imageUtils';
import { parseGeminiResponse } from '../utils/parseResponse';

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

export const useGemini = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyzeImage = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);

    const apiKey = import.meta.env.VITE_GEMINI_KEY;
    if (!apiKey) {
      setError("Missing API Key. Please add VITE_GEMINI_KEY to your .env file.");
      setLoading(false);
      return;
    }

    try {
      const base64Image = await compressImage(file);
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

      const imageParts = [
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg"
          }
        }
      ];

      const result = await model.generateContent([SYSTEM_PROMPT, ...imageParts]);
      const responseText = await result.response.text();
      const parsedData = parseGeminiResponse(responseText);

      if (!parsedData || !parsedData.name || !parsedData.narration) {
        setError("We couldn't find a cultural site in this image. Try a monument, museum, temple, or landmark.");
      } else {
        setResult(parsedData);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while analyzing the image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return { analyzeImage, loading, error, result, setResult };
};
