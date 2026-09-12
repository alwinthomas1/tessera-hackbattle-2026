require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-3.6-flash";

async function classifyScam(incomingText) {
  const prompt = `
Analyze this message for scam or social-engineering intent.

Return ONLY valid JSON in this format:

{
  "isScam": true,
  "confidence": 0.95,
  "scamType": "Bank impersonation"
}

Rules:
- confidence must be between 0 and 1.
- Identify urgency, impersonation, payment requests,
  OTP/password requests, suspicious links, threats,
  fake jobs/investments, or requests for sensitive information.

Message:
${incomingText}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}
async function generateBaitResponse(conversationHistory) {
  const prompt = `
You are a controlled deception agent inside a cybersecurity sandbox.

Your role is to simulate a cautious but somewhat naive victim responding to a suspected scammer.

Goals:
- Keep the conversation natural and short.
- Encourage the scammer to reveal useful threat intelligence such as:
  UPI IDs, phone numbers, suspicious URLs, bank details, payment instructions, or other scam indicators.
- Never provide real passwords, OTPs, credit-card details, bank credentials, or actual payments.
- Never perform real-world actions.
- Do not reveal that you are an AI or that this is a security sandbox.
- Ask simple follow-up questions when useful.
- Respond with ONLY the victim's next message.

Conversation:
${conversationHistory}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  return response.text.trim();
}
async function extractThreatIntel(conversationHistory) {
  const prompt = `
You are a cybersecurity threat-intelligence extraction agent.

Analyze the following scam conversation and return ONLY valid JSON in exactly this format:

{
  "upiIds": [],
  "phoneNumbers": [],
  "bankAccounts": [],
  "phishingUrls": [],
  "threatLevel": "LOW",
  "attackVector": ""
}

Rules:
- Extract only indicators actually present in the conversation.
- Do not invent missing values.
- threatLevel must be one of: LOW, MEDIUM, HIGH, CRITICAL.
- attackVector should briefly describe the scam technique.
- Return arrays even when empty.

Conversation:
${conversationHistory}
`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text);
}
module.exports = {
  classifyScam,
  generateBaitResponse,
  extractThreatIntel,
};