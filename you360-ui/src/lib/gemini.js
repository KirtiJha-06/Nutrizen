// src/lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Gemini Client
const genAI = new GoogleGenerativeAI(apiKey);

export async function askGemini(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ Error: Unable to fetch response.";
  }
}
