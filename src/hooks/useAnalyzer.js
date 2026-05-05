import { useState } from 'react';
import { compressImage } from '../utils/imageUtils';
import { analyzeMonument } from '../utils/apiHandler';

export const useAnalyzer = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [usedAPI, setUsedAPI] = useState('');

  const analyzeImage = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setUsedAPI('');

    try {
      const base64Image = await compressImage(file);
      const { data, usedAPI: api } = await analyzeMonument(base64Image);

      if (!data || !data.name || !data.narration) {
        setError("We couldn't find a cultural site in this image. Try a monument, museum, temple, or landmark.");
      } else {
        setResult(data);
        setUsedAPI(api);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while analyzing the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { analyzeImage, loading, error, result, setResult, usedAPI };
};
