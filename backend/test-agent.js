const { classifyScam } = require("./agent");

async function test() {
  const message =
    "Your bank account will be blocked today. Send your OTP immediately to verify your account.";

  const result = await classifyScam(message);

  console.log(result);
}

test();