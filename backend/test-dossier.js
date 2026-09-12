const fs = require("fs");
const { generateCyberCrimeDossier } = require("./dossier");

const sample = {
  incidentId: "TEST-001",
  timestamp: new Date().toISOString(),
  platform: "WhatsApp",
  upiIds: ["scammer@fakebank"],
  phoneNumbers: ["+911234567890"],
  maliciousUrls: ["http://bad-site.xyz/login"],
  chatLog: [
    { timestamp: "10:01", sender: "Scammer", message: "Send OTP now" },
    { timestamp: "10:02", sender: "ScamBox Agent", message: "Sure, here it is..." }
  ]
};

const pdfBuffer = generateCyberCrimeDossier(sample);
fs.writeFileSync("test-output.pdf", pdfBuffer);
console.log("PDF written to test-output.pdf");