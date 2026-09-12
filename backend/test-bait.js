const { generateBaitResponse } = require("./agent");

async function test() {
  const conversation = [
    {
      role: "scammer",
      message:
        "Your bank account will be blocked today. Send your OTP to verify it."
    }
  ];

  const response = await generateBaitResponse(
    JSON.stringify(conversation)
  );

  console.log("AI Bait Response:");
  console.log(response);
}

test();
