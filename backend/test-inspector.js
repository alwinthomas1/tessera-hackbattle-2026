const { inspectUrl } = require("./inspector");

inspectUrl("youtube.com").then(result => {
  console.log(result);
});