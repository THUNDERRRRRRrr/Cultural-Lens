import { useState } from 'react';
import { compressImage } from '../utils/imageUtils';
import { analyzeMonument, analyzePlaceName } from '../utils/apiHandler';

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

  const analyzeByName = async (placeName, lat, lng) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setUsedAPI('');

    try {
      const { data, usedAPI: api } = await analyzePlaceName(placeName, lat, lng);

      if (!data || !data.name || !data.narration) {
        setError("Couldn't generate information about this place. Please try again.");
      } else {
        setResult(data);
        setUsedAPI(api);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { analyzeImage, analyzeByName, loading, error, result, setResult, setError, usedAPI };
};
