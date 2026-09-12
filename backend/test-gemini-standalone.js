// test-gemini-standalone.js
// Run with: node test-gemini-standalone.js
// Tests several model names directly against Gemini, bypassing the whole app,
// to find out which one actually responds right now with this API key.

require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

async function main() {
  console.log("--- Gemini Standalone Model Test ---");
  console.log(
    "API key present:",
    process.env.GEMINI_API_KEY
      ? "YES (length " + process.env.GEMINI_API_KEY.length + ")"
      : "NO — MISSING"
  );

  if (!process.env.GEMINI_API_KEY) {
    console.log("STOP: No API key found in .env. Fix that first.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Testing the model currently in agent.js plus known-stable fallbacks
  const modelsToTry = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  for (const model of modelsToTry) {
    console.log(`\nTrying model: ${model} ...`);
    try {
      const response = await ai.models.generateContent({
        model,
        contents: 'Say "hello" in exactly one word.',
      });
      console.log(`✅ SUCCESS with ${model}:`, response.text);
    } catch (err) {
      console.log(`❌ FAILED with ${model}:`, err.message || err);
    }
  }

  console.log("\n--- Test complete ---");
}

main();