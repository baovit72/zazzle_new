const axios = require("axios");
const utils = require("./utils");
async function run() {
  const browser = await utils.getPuppeteerBrowser();
  const page = await browser.newPage();
}

run();
