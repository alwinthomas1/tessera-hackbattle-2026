const { extractThreatIntel } = require("./agent");

async function test() {
  const conversation = [
    {
      role: "scammer",
      message:
        "Your account has suspicious activity. Call nine eight seven six five four three two one zero immediately and verify your account at bit.ly/secureverify"
    },
  ];

  const result = await extractThreatIntel(
    JSON.stringify(conversation)
  );

  console.log("Tricky Threat Intelligence:");
  console.log(JSON.stringify(result, null, 2));
}

test();
