/**
 * ScamBox - Active AI Detonation & Deception Sandbox
 * Member 1: Backend Core & Real-Time Event Bus
 *
 * server.js
 * ------------------------------------------------------------------
 * Responsibilities:
 *   1. Express HTTP server + CORS
 *   2. Socket.io real-time event bus
 *   3. In-memory quarantine queue + extracted intel store
 *   4. REST endpoints that orchestrate Member 2 (AI agent) and
 *      Member 4 (inspector/dossier) modules
 *   5. Graceful fallback mocks if agent.js / inspector.js / dossier.js
 *      don't exist, or export only SOME functions, so the team can
 *      integrate incrementally without crashing the server.
 * ------------------------------------------------------------------
 */

require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const crypto = require('crypto');

// ---------------------------------------------------------------------------
// 1. Mock fallback functions (defined up front, used per-function as needed)
// ---------------------------------------------------------------------------
const mockClassifyScam = async (text) => {
  const lower = (text || '').toLowerCase();
  const suspiciousKeywords = ['upi', 'urgent', 'arrest', 'otp', 'bank', 'kyc', 'lottery', 'prize'];
  const hits = suspiciousKeywords.filter((k) => lower.includes(k));
  return {
    isScam: hits.length > 0,
    confidence: Math.min(0.4 + hits.length * 0.15, 0.95),
    matchedKeywords: hits,
  };
};

const mockGenerateBaitResponse = async (history) => {
  const lastMsg = Array.isArray(history) && history.length > 0
    ? history[history.length - 1].message
    : '';
  return `[MOCK BAIT REPLY] Oh no, that sounds serious! I don't understand — can you tell me exactly how to pay? (echoing: "${lastMsg}")`;
};

const mockExtractThreatIntel = async (history) => {
  const fullText = Array.isArray(history)
    ? history.map((h) => h.message).join(' ')
    : String(history || '');

  const upiMatch = fullText.match(/[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}/g);
  const urlMatch = fullText.match(/https?:\/\/[^\s]+/g);
  const phoneMatch = fullText.match(/\+?\d{10,13}/g);

  const intel = {};
  if (upiMatch) intel.upiIds = [...new Set(upiMatch)];
  if (urlMatch) intel.urls = [...new Set(urlMatch)];
  if (phoneMatch) intel.phoneNumbers = [...new Set(phoneMatch)];

  if (Object.keys(intel).length === 0) return null;

  return {
    ...intel,
    riskLevel: intel.upiIds || intel.urls ? 'HIGH' : 'MEDIUM',
    extractedAt: new Date().toISOString(),
  };
};

// ---------------------------------------------------------------------------
// 2. Load agent.js if present, then resolve EACH function individually.
//    If agent.js exports some but not all three functions, the missing
//    ones fall back to mocks instead of crashing the whole module.
// ---------------------------------------------------------------------------
let realAgent = {};
try {
  realAgent = require('./agent.js');
  console.log('[agent.js] File found — checking which functions are implemented...');
} catch (err) {
  console.warn('[agent.js] Not found or failed to load — using MOCK AI agent functions for everything.');
  console.warn(`[agent.js] Reason: ${err.message}`);
}

const classifyScam = typeof realAgent.classifyScam === 'function' ? realAgent.classifyScam : mockClassifyScam;
console.log(`[agent.js] classifyScam: ${typeof realAgent.classifyScam === 'function' ? 'REAL (Member 2)' : 'MOCK'}`);

const generateBaitResponse = typeof realAgent.generateBaitResponse === 'function' ? realAgent.generateBaitResponse : mockGenerateBaitResponse;
console.log(`[agent.js] generateBaitResponse: ${typeof realAgent.generateBaitResponse === 'function' ? 'REAL (Member 2)' : 'MOCK'}`);

const extractThreatIntel = typeof realAgent.extractThreatIntel === 'function' ? realAgent.extractThreatIntel : mockExtractThreatIntel;
console.log(`[agent.js] extractThreatIntel: ${typeof realAgent.extractThreatIntel === 'function' ? 'REAL (Member 2)' : 'MOCK'}`);

// ---------------------------------------------------------------------------
// 3. Attempt to import Member 4's Inspector & Dossier modules.
//    Expected exports:
//      inspector.js -> inspectUrl(url)
//      dossier.js   -> generateCyberCrimeDossier(data)
// ---------------------------------------------------------------------------
let inspectUrl;
try {
  ({ inspectUrl } = require('./inspector.js'));
  console.log('[inspector.js] Loaded Member 4\'s real inspector module.');
} catch (err) {
  console.warn('[inspector.js] Not found or failed to load — using MOCK inspector.');
  inspectUrl = async (url) => ({
    url,
    safe: false,
    verdict: 'UNKNOWN (mock inspector — real safe-browsing check pending)',
    checkedAt: new Date().toISOString(),
  });
}

let generateCyberCrimeDossier;
try {
  ({ generateCyberCrimeDossier } = require('./dossier.js'));
  console.log('[dossier.js] Loaded Member 4\'s real dossier module.');
} catch (err) {
  console.warn('[dossier.js] Not found or failed to load — using MOCK dossier generator.');
  generateCyberCrimeDossier = async (data) => ({
    mock: true,
    generatedAt: new Date().toISOString(),
    summary: 'MOCK DOSSIER — real PDF/HTML complaint generator pending from Member 4.',
    inputEcho: data,
  });
}

// ---------------------------------------------------------------------------
// 4. Express + HTTP + Socket.io setup
// ---------------------------------------------------------------------------
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: '*' }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------------
// 5. In-memory state
// ---------------------------------------------------------------------------
const quarantineQueue = []; // full history of every message processed
const extractedIntel = [];  // every piece of intel pulled from scammer chats

// ---------------------------------------------------------------------------
// 6. Socket.io connection lifecycle
// ---------------------------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`[socket.io] Client connected: ${socket.id}`);

  socket.on('disconnect', (reason) => {
    console.log(`[socket.io] Client disconnected: ${socket.id} (${reason})`);
  });
});

// ---------------------------------------------------------------------------
// 7. Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ScamBox backend online', time: new Date().toISOString() });
});

/**
 * POST /api/detonate-message
 * Body: { sender: string, message: string }
 *
 * Pipeline:
 *   1. Quarantine the incoming message.
 *   2. Emit `message-received`.
 *   3. Classify + generate bait response via Member 2's AI engine.
 *   4. Emit `ai-reply-generated`.
 *   5. Extract threat intel from the running conversation.
 *   6. If links are present, run them through Member 4's inspector.
 *   7. Emit `intel-extracted` (+ per-type `intel-found`, `threat-level`) if found.
 *   8. Respond with { success: true, queueId }.
 */
app.post('/api/detonate-message', async (req, res) => {
  try {
    const { sender, message } = req.body;

    if (!sender || !message) {
      return res.status(400).json({
        success: false,
        error: 'Both "sender" and "message" fields are required.',
      });
    }

    const queueId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const entry = {
      queueId,
      sender,
      message,
      direction: 'inbound',
      timestamp,
    };

    // 1. Add to quarantine queue
    quarantineQueue.push(entry);

    // 2. Emit message-received
    io.emit('message-received', entry);

    // 3. Classify (optional, useful for risk badges on the frontend)
    let classification = null;
    try {
      classification = await classifyScam(message);
    } catch (classifyErr) {
      console.error('[classifyScam] Error:', classifyErr.message);
    }

    // 4. Generate bait reply from AI agent, using full quarantine history
    let aiReply = null;
    try {
      aiReply = await generateBaitResponse(quarantineQueue);
    } catch (aiErr) {
      console.error('[generateBaitResponse] Error:', aiErr.message);
      aiReply = "I'm sorry, I'm a little confused right now, can you repeat that?";
    }

    const aiEntry = {
      queueId: crypto.randomUUID(),
      sender: 'AI_BAIT_AGENT',
      message: aiReply,
      direction: 'outbound',
      classification,
      timestamp: new Date().toISOString(),
    };

    quarantineQueue.push(aiEntry);

    // 5. Emit ai-reply-generated
    io.emit('ai-reply-generated', { reply: aiReply, classification, queueId: aiEntry.queueId });

    // 6. Extract threat intel from the conversation so far
    let intel = null;
    try {
      intel = await extractThreatIntel(quarantineQueue);
    } catch (intelErr) {
      console.error('[extractThreatIntel] Error:', intelErr.message);
    }

    // 7. If URLs were found, run them through the link inspector
    if (intel && Array.isArray(intel.urls) && intel.urls.length > 0) {
      intel.urlInspections = [];
      for (const url of intel.urls) {
        try {
          const inspection = await inspectUrl(url);
          intel.urlInspections.push(inspection);
        } catch (inspectErr) {
          console.error(`[inspectUrl] Error inspecting ${url}:`, inspectErr.message);
        }
      }
    }

    // 8. Store + emit intel events if we found anything
    if (intel && Object.keys(intel).length > 0) {
      const intelRecord = {
        intelId: crypto.randomUUID(),
        sourceQueueId: queueId,
        sender,
        ...intel,
      };
      extractedIntel.push(intelRecord);

      // Existing contract — full intel object, all fields together
      io.emit('intel-extracted', intelRecord);

      // Per-type events, for teammates who prefer keying off "type"
      if (Array.isArray(intel.upiIds)) {
        intel.upiIds.forEach((value) => io.emit('intel-found', { type: 'upi', value }));
      }
      if (Array.isArray(intel.urls)) {
        intel.urls.forEach((value) => io.emit('intel-found', { type: 'link', value }));
      }
      if (Array.isArray(intel.phoneNumbers)) {
        intel.phoneNumbers.forEach((value) => io.emit('intel-found', { type: 'phone', value }));
      }
      if (Array.isArray(intel.bankAccounts)) {
        intel.bankAccounts.forEach((value) => io.emit('intel-found', { type: 'bank', value }));
      }

      // Separate threat-level event
      if (intel.riskLevel) {
        io.emit('threat-level', { level: intel.riskLevel });
      }
    }

    // 9. Respond to the HTTP caller
    return res.json({ success: true, queueId });
  } catch (err) {
    console.error('[POST /api/detonate-message] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * GET /api/intel-vault
 * Returns all extracted indicators and the full quarantine queue.
 */
app.get('/api/intel-vault', (req, res) => {
  res.json({
    intel: extractedIntel,
    queue: quarantineQueue,
  });
});

/**
 * POST /api/generate-dossier
 * Body: arbitrary chat session / intel payload
 * Delegates to Member 4's generateCyberCrimeDossier().
 */
app.post('/api/generate-dossier', async (req, res) => {
  try {
    const sessionData = req.body;

    if (!sessionData || Object.keys(sessionData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body must contain the chat session / intel data for the dossier.',
      });
    }

    const dossier = await generateCyberCrimeDossier(sessionData);
    return res.json({ success: true, dossier });
  } catch (err) {
    console.error('[POST /api/generate-dossier] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Failed to generate dossier.' });
  }
});

// ---------------------------------------------------------------------------
// 8. Start server
// ---------------------------------------------------------------------------
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Socket.io initialized');
});