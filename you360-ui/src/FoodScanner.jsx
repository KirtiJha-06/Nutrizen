
 
import { useState } from 'react';
import {
  CameraIcon,
  PhotoIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon
} from '@heroicons/react/24/solid';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert image file to Base64 safely
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result;

        if (typeof result !== 'string' || !result.includes(',')) {
          reject(new Error('Could not read the selected image.'));
          return;
        }

        resolve(result.split(',')[1]);
      };

      reader.onerror = () => {
        reject(new Error('Failed to read the image file.'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Release the previous preview URL
    if (selectedImage) {
      URL.revokeObjectURL(selectedImage);
    }

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);
    setScanResult(null);
    setError(null);
  };

  const handleScan = async () => {
    if (!selectedImage) {
      setError('Please select an image to scan.');
      return;
    }

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      setError(
        'Gemini API key is missing. Please configure VITE_GEMINI_API_KEY in your environment variables.'
      );
      return;
    }

    setIsLoading(true);
    setScanResult(null);
    setError(null);

    try {
      // Read selected image
      const imageResponse = await fetch(selectedImage);

      if (!imageResponse.ok) {
        throw new Error('Unable to load the selected image.');
      }

      const file = await imageResponse.blob();

      if (!file.type.startsWith('image/')) {
        throw new Error('The selected file is not a valid image.');
      }

      const base64Data = await fileToBase64(file);

      const prompt = `
        Identify the food in this image and estimate its nutritional value.

        Return:
        - Food name
        - Calories
        - Carbohydrates
        - Protein
        - Fat
        - Whether it is Healthy or Junk Food
        - Helpful health tips

        Give realistic estimated nutritional values.
        If the image does not clearly show food, say so.
        Return only valid JSON matching the requested schema.
      `;

      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              foodName: { type: 'STRING' },
              calories: { type: 'STRING' },
              carbs: { type: 'STRING' },
              protein: { type: 'STRING' },
              fats: { type: 'STRING' },
              healthRating: {
                type: 'STRING',
                enum: ['Healthy', 'Junk Food']
              },
              tips: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              }
            },
            required: [
              'foodName',
              'calories',
              'carbs',
              'protein',
              'fats',
              'healthRating',
              'tips'
            ]
          }
        }
      };

      // Use the stable Gemini model, not the old preview model
      const apiUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

      let response;
      let result;

      // Retry temporary rate-limit errors
      for (let attempt = 0; attempt < 4; attempt++) {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (response.status !== 429 || attempt === 3) {
          break;
        }

        await new Promise(resolve =>
          setTimeout(resolve, 1000 * Math.pow(2, attempt))
        );
      }

      result = await response.json();

      if (!response.ok) {
        const apiMessage =
          result?.error?.message ||
          `Gemini API request failed (${response.status}).`;

        throw new Error(apiMessage);
      }

      const responseText =
        result?.candidates?.[0]?.content?.parts
          ?.map(part => part.text || '')
          .join('')
          .trim();

      if (!responseText) {
        throw new Error(
          'Gemini did not return an analysis. Please try another food image.'
        );
      }

      let parsedResult;

      try {
        parsedResult = JSON.parse(responseText);
      } catch {
        throw new Error('The AI returned an invalid result. Please scan again.');
      }

      if (
        !parsedResult.foodName ||
        !Array.isArray(parsedResult.tips)
      ) {
        throw new Error('The AI response is incomplete. Please try again.');
      }

      setScanResult({
        foodName: parsedResult.foodName,
        calories: parsedResult.calories || 'Not available',
        carbs: parsedResult.carbs || 'Not available',
        protein: parsedResult.protein || 'Not available',
        fats: parsedResult.fats || 'Not available',
        healthRating:
          parsedResult.healthRating === 'Healthy'
            ? 'Healthy'
            : 'Junk Food',
        tips: parsedResult.tips
      });

    } catch (err) {
      console.error('Food Scanner AI Error:', err);

      setError(
        err.message || 'An error occurred while analyzing the image.'
      );

    } finally {
      setIsLoading(false);
    }
  };

  // KEEP YOUR EXISTING return (...) JSX HERE WITHOUT CHANGES

export default App;
