import React, { useState, useEffect } from 'react';

const App = () => {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [lastRecipe, setLastRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GEMINI_KEY;


  // Load last recipe from localStorage on component mount
  useEffect(() => {
    try {
      const savedRecipe = localStorage.getItem('lastRecipe');
      if (savedRecipe) {
        setLastRecipe(JSON.parse(savedRecipe));
      }
    } catch (e) {
      console.error("Failed to load last recipe from localStorage", e);
    }
  }, []);

  const generateRecipe = async () => {
    if (ingredients.trim() === '') {
      setError('Please enter some ingredients.');
      return;
    }
    setLoading(true);
    setRecipe(null);
    setError(null);

    const prompt = `Based on the following ingredients, suggest a healthy and easy-to-make recipe. Provide a short note on why it's healthy. Respond with a JSON object containing the following keys: "title", "ingredientsList" (an array of strings), "instructions" (a single string with step-by-step instructions), and "healthyNote". Do not include any other text or markdown.
    Ingredients: ${ingredients}`;

    try {
      const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
      const payload = { 
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              ingredientsList: { type: "ARRAY", items: { type: "STRING" } },
              instructions: { type: "STRING" },
              healthyNote: { type: "STRING" }
            }
          }
        }
      };
      const apiKey = "process.env.VITE_GEMINI_API_KEY";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedRecipe = JSON.parse(jsonText);
        
        // Save the new recipe to localStorage
        const newLastRecipe = {
          ...parsedRecipe,
          timestamp: new Date().toLocaleString()
        };
        localStorage.setItem('lastRecipe', JSON.stringify(newLastRecipe));
        setRecipe(parsedRecipe);
        setLastRecipe(newLastRecipe);

      } else {
        setError('No recipe generated. Please try again with different ingredients.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to generate recipe. The AI may not have returned a valid JSON object. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 font-sans p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl p-8 bg-white rounded-3xl shadow-xl border border-gray-100 transition-all duration-300 transform hover:shadow-2xl">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-6">
          AI Recipe Hub
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your ingredients and let our AI create a healthy recipe for you.
        </p>

        {lastRecipe && (
          <div className="bg-gray-100 p-6 rounded-2xl mb-8 border border-gray-200 shadow-inner transition-all duration-300 transform hover:scale-[1.01]">
            <h2 className="text-2xl font-bold text-pink-600 mb-2">Your Last Recipe</h2>
            <p className="text-sm text-gray-500 mb-4">Saved on: {lastRecipe.timestamp}</p>
            <h3 className="text-xl font-semibold text-purple-600">{lastRecipe.title}</h3>
          </div>
        )}
        
        <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <input
            type="text"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="flex-grow w-full md:w-auto p-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 shadow-sm"
            placeholder="e.g., tomato, onion, cheese, spinach"
          />
          <button
            onClick={generateRecipe}
            disabled={loading}
            className="w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg transform hover:scale-105 transition-transform duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>
        </div>

        {error && <div className="text-red-500 text-center font-medium mb-4">{error}</div>}

        <div className="mt-8 bg-gray-50 p-8 rounded-3xl shadow-inner border border-gray-200 min-h-[400px] flex flex-col items-center justify-center text-gray-700 transition-all duration-500">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-purple-500 mx-auto"></div>
              <p className="mt-4 text-lg font-semibold text-purple-600">Creating a delicious recipe for you...</p>
            </div>
          ) : recipe ? (
            <div className="text-left w-full space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-pink-600">{recipe.title}</h2>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-600">Ingredients</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700 pl-4">
                  {recipe.ingredientsList.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-600">Instructions</h3>
                <ul className="list-decimal list-inside space-y-2 text-gray-700">
                  {recipe.instructions.split(/\d+\.\s/).filter(Boolean).map((step, index) => (
                    <li key={index} className="leading-relaxed">{step.trim()}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-purple-600">Healthy Note</h3>
                <p className="text-gray-700 leading-relaxed">{recipe.healthyNote}</p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM13 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM13 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
              </svg>
              <p className="text-lg text-gray-400 font-medium">Your healthy recipe will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
