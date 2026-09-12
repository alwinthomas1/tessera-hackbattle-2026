const { jsPDF } = require("jspdf");

function generateCyberCrimeDossier(sessionData) {
  const doc = new jsPDF();
  let y = 15;

  const addLine = (text, size = 11, bold = false) => {
    doc.setFontSize(size);
    doc.setFont(undefined, bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 15, y);
    y += lines.length * 7;
    if (y > 280) { doc.addPage(); y = 15; }
  };

  // --- Header ---
  addLine("CYBER CRIME COMPLAINT DOSSIER", 16, true);
  addLine(`Incident ID: ${sessionData.incidentId || "N/A"}`);
  addLine(`Timestamp: ${sessionData.timestamp || new Date().toISOString()}`);
  addLine(`Target Platform: ${sessionData.platform || "N/A"}`);
  y += 5;

  // --- Attacker Evidence ---
  addLine("ATTACKER EVIDENCE", 13, true);
  addLine(`UPI IDs: ${(sessionData.upiIds || []).join(", ") || "None found"}`);
  addLine(`Phone Numbers: ${(sessionData.phoneNumbers || []).join(", ") || "None found"}`);
  addLine(`Malicious URLs: ${(sessionData.maliciousUrls || []).join(", ") || "None found"}`);
  y += 5;

  // --- Chat Transcript ---
  addLine("FORENSIC CHAT LOG", 13, true);
  (sessionData.chatLog || []).forEach(entry => {
    addLine(`[${entry.timestamp || ""}] ${entry.sender}: ${entry.message}`);
  });
  y += 5;

  // --- Legal Categorization ---
  addLine("LEGAL CATEGORIZATION", 13, true);
  addLine("Section 66D, IT Act 2000 - Cheating by impersonation using computer resource");
  addLine("Section 419, IPC - Punishment for cheating by personation");
  addLine("Section 420, IPC - Cheating and dishonestly inducing delivery of property");

  return Buffer.from(doc.output("arraybuffer"));
}

module.exports = { generateCyberCrimeDossier };