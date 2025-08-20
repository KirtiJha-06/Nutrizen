import { useState } from 'react';
import { CameraIcon, PhotoIcon, CheckCircleIcon, XCircleIcon, BeakerIcon } from '@heroicons/react/24/solid';

const App = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
      setScanResult(null); // Reset previous scan result
      setError(null);
    }
  };

  const handleScan = async () => {
    if (!selectedImage) {
      setError("Please select an image to scan.");
      return;
    }

    setIsLoading(true);
    setScanResult(null);
    setError(null);

    const file = await fetch(selectedImage).then(res => res.blob());
    const base64Data = await fileToBase64(file);
    
    // AI prompt for analysis
    const prompt = "What is this food and what is its nutritional value? Please provide estimated values for calories, carbs, protein, and fat. Also, state whether it is a healthy food or junk food, and give some additional health tips.";

    // AI API call setup
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
        contents: [
            {
                role: "user",
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
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    foodName: { "type": "STRING" },
                    calories: { "type": "STRING" },
                    carbs: { "type": "STRING" },
                    protein: { "type": "STRING" },
                    fats: { "type": "STRING" },
                    healthRating: { "type": "STRING", "enum": ["Healthy", "Junk Food"] },
                    tips: { "type": "ARRAY", "items": { "type": "STRING" } }
                }
            }
        }
    };

    const apiKey = "AIzaSyBEDJs1kKzRwHV34mviEWXf6KI_sn7CViE"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    let retries = 0;
    const maxRetries = 5;
    const initialDelay = 1000;

    const analyzeImage = async () => {
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.status === 429 && retries < maxRetries) {
                const delay = initialDelay * Math.pow(2, retries);
                retries++;
                await new Promise(resolve => setTimeout(resolve, delay));
                return analyzeImage();
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || `API error: ${response.status}`);
            }

            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const jsonText = result.candidates[0].content.parts[0].text;
                const parsedJson = JSON.parse(jsonText);
                setScanResult(parsedJson);
            } else {
                throw new Error("No response from API.");
            }

        } catch (err) {
            console.error("Analysis Error:", err);
            setError("An error occurred while analyzing the image.");
        } finally {
            setIsLoading(false);
        }
    };
    
    analyzeImage();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-gray-800 font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl p-8 bg-white rounded-3xl shadow-lg border border-gray-100 transition-all duration-300 transform scale-100 hover:scale-[1.01] hover:shadow-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-purple-700 mb-8 animate-fade-in">AI Food Scanner</h1>

        {/* Image Upload Area */}
        <div className="w-full mb-8">
          <label htmlFor="file-upload" className="block cursor-pointer">
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-purple-300 rounded-2xl transition-all duration-200 hover:border-purple-500 hover:bg-purple-50">
              <PhotoIcon className="h-16 w-16 text-purple-500 mb-4 animate-bounce-slow" />
              <p className="text-lg font-medium text-gray-600 text-center">
                Drag & drop an image here or click to browse
              </p>
            </div>
          </label>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </div>

        {/* Selected Image Preview & Scan Button */}
        {selectedImage && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-8 animate-fade-in-up">
            <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center">
              <img src={selectedImage} alt="Selected food" className="w-full max-h-72 object-cover rounded-2xl shadow-lg border-4 border-white transition-all duration-300 transform hover:scale-105" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-center">
              <button
                onClick={handleScan}
                disabled={isLoading}
                className="w-full px-6 py-3 rounded-full text-white font-semibold text-lg shadow-lg transition-all duration-200
                bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600
                disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {isLoading ? 'Analysing...' : 'Scan'}
              </button>
              {error && (
                <p className="text-red-500 mt-4 text-center font-medium">{error}</p>
              )}
            </div>
          </div>
        )}

        {/* Loading and Results Display Area */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 animate-pulse-fast">
            <BeakerIcon className="h-16 w-16 text-purple-400 animate-spin mb-4" />
            <p className="text-lg font-semibold text-gray-500">Please wait, analysing data...</p>
          </div>
        )}

        {scanResult && (
          <div className="w-full p-6 bg-purple-50 rounded-2xl shadow-inner mt-8 animate-scale-in">
            <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">Scan Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Food Name & Rating */}
              <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-md border border-gray-200 transition-all duration-300 transform hover:scale-105">
                <h3 className="text-xl font-bold text-gray-700 mb-2">Food Identified:</h3>
                <p className="text-2xl font-semibold text-purple-800">{scanResult.foodName}</p>
                <div className={`mt-4 px-4 py-1 rounded-full font-bold text-white shadow-md text-sm
                  ${scanResult.healthRating === 'Healthy' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {scanResult.healthRating === 'Healthy' ? (
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                      <span>Healthy Food</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircleIcon className="h-5 w-5 mr-1" />
                      <span>Junk Food</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Nutritional Breakdown */}
              <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-200 transition-all duration-300 transform hover:scale-105">
                <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Nutritional Breakdown</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-medium text-gray-600">Calories</p>
                    <p className="text-2xl font-bold text-purple-700">{scanResult.calories}</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-600">Carbs</p>
                    <p className="text-2xl font-bold text-purple-700">{scanResult.carbs}</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-600">Protein</p>
                    <p className="text-2xl font-bold text-purple-700">{scanResult.protein}</p>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-600">Fats</p>
                    <p className="text-2xl font-bold text-purple-700">{scanResult.fats}</p>
                  </div>
                </div>
              </div>

              {/* Health Tips */}
              <div className="md:col-span-2 p-6 bg-white rounded-2xl shadow-md border border-gray-200 transition-all duration-300 transform hover:scale-105">
                <h3 className="text-xl font-bold text-gray-700 mb-2 text-center">Health Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  {scanResult.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
