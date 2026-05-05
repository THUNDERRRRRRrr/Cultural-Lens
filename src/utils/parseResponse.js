/**
 * Safely parses the Gemini JSON response, stripping markdown formatting if present.
 * @param {string} text
 * @returns {object|null}
 */
export const parseGeminiResponse = (text) => {
  try {
    // Remove markdown code block backticks if present
    const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.error("Raw response:", text);
    return null;
  }
};
