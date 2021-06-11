const axios = require("axios");
const utils = require("./utils");
const fs = require("fs");
var path = require("path");

async function run() {
  const browser = await utils.getPuppeteerBrowser();
  const page = await browser.newPage();
  const shirtUrls = {
    men: {
      white:
        "https://www.zazzle.com/pd/spp/pt-zazzle_shirt?color=white&groups=%7Bwomens%7D&size=a_s&style=hanes_womens_crew_tshirt_5680&subgroups=%7Btshirts%7D&design.shade=light&feature=%7Bbasic%7D&tags=%7Bshowswhite%7D",
      black:
        "https://www.zazzle.com/pd/spp/pt-zazzle_shirt?color=black&groups=%7Bwomens%7D&size=a_s&style=hanes_womens_crew_tshirt_5680&subgroups=%7Btshirts%7D&design.shade=dark&feature=%7Bbasic%7D&tags=%7Bshowswhite%7D",
    },
    women: {
      white:
        "https://www.zazzle.com/pd/spp/pt-zazzle_shirt?color=white&groups=%7Bwomens%7D&size=a_s&style=hanes_womens_crew_tshirt_5680&subgroups=%7Btshirts%7D&design.shade=light&feature=%7Bbasic%7D&tags=%7Bshowswhite%7D",
      black:
        "https://www.zazzle.com/pd/spp/pt-zazzle_shirt?color=black&groups=%7Bwomens%7D&size=a_s&style=hanes_womens_crew_tshirt_5680&subgroups=%7Btshirts%7D&design.shade=dark&feature=%7Bbasic%7D&tags=%7Bshowswhite%7D",
    },
  };
  async function waitThenGetElement(selector, unique, timeout) {
    timeout = timeout || 60000;
    await page.waitForSelector(selector, { timeout });
    await utils.sleep(2000);
    if (unique) {
      return await page.$(selector);
    }
    return await page.$$(selector);
  }
  async function waitThenGetElementXPath(xpath, unique, timeout) {
    timeout = timeout || 60000;
    await page.waitForXPath(xpath, { timeout });
    await utils.sleep(2000);
    if (unique) {
      return (await page.$x(xpath))[0];
    }
    return await page.$x(xpath);
  }

  async function typeToInput(selector, text) {
    await waitThenGetElement(selector);
    await page.type(selector, text, { delay: 50 });
  }
  async function evalScript(selector, evalCb) {
    await waitThenGetElement(selector);
    return await page.$eval(selector, evalCb);
  }

  async function zazzle_execute(
    img,
    title,
    description,
    occasion,
    recipient,
    category,
    tags,
    royalty,
    gender,
    color
  ) {
    const absImg = path.resolve("Images\\" + img);
    if (!fs.existsSync(absImg)) return "IMAGE NOT EXIST";
    try {
      await page.goto("https://www.zazzle.com/lgn/signin");
      await waitThenGetElement(
        ".Header2021RightContent_accountButton",
        true,
        600000
      );
      await page.goto(shirtUrls[gender][color]);
      await (
        await waitThenGetElement(".DesignPod-customizeControls>button", true)
      ).click();
      await (await waitThenGetElement("#uploadID-1", true)).uploadFile(absImg);
      await waitThenGetElement(
        ".Z4DSDesignView-canvasWrapper > div > img",
        true,
        300000
      );
      await (
        await waitThenGetElement(
          ".Z4DSMenuBar_rightGroup > .Z4ColorButton--blue",
          true
        )
      ).click();
      await (
        await waitThenGetElement(
          ".DesignPod-customizeControls > .Tooltip button",
          true
        )
      ).click();
      await typeToInput(".PostForSalePage_titleInput input", title);
      await typeToInput(
        ".PostForSalePage_descriptionInput textarea",
        description
      );
      await (
        await waitThenGetElement(
          ".SuggestedDepartmentSelector .RadioButton-inputWrapper",
          true
        )
      ).click();
      const categoryElems = await waitThenGetElement(
        ".PostForSalePage_marginTop button"
      );
      const occasionElem = categoryElems[0];
      await occasionElem.click();
      for (let o of occasion.split(">")) {
        try {
          await (
            await waitThenGetElementXPath(
              `//button[contains(text(), '${o.trim()}')]`,
              true,
              10000
            )
          ).click();
        } catch (error) {
          console.log(error);
          break;
        }
      }
      await (
        await waitThenGetElement(".Dialog-footer .Button_root__Submit", true)
      ).click();

      const recipientElem = categoryElems[1];
      await recipientElem.click();
      for (let r of recipient.split(">")) {
        try {
          await (
            await waitThenGetElementXPath(
              `//button[contains(text(), '${r.trim()}')]`,
              true,
              10000
            )
          ).click();
        } catch (error) {
          console.log(error);
          break;
        }
      }
      await (
        await waitThenGetElement(".Dialog-footer .Button_root__Submit", true)
      ).click();
      try {
        const categoryElem = categoryElems[2];
        await categoryElem.click();
        for (let c of category.split(">")) {
          try {
            await (
              await waitThenGetElementXPath(
                `//button[contains(text(), '${c.trim()}')]`,
                true,
                10000
              )
            ).click();
          } catch (error) {
            console.log(error);
            break;
          }
        }
        await (
          await waitThenGetElement(".Dialog-footer .Button_root__Submit", true)
        ).click();
      } catch (error) {
        console.log(error);
      }

      await typeToInput(".TagInputList input", tags);
      console.log("tag typing ", tags);
      await (
        await waitThenGetElement(
          ".TagInputList .TagInputList-inputRow button",
          true
        )
      ).click();

      await (
        await waitThenGetElement(
          ".PostForSalePage_maturityList [value='1']",
          true
        )
      ).click();
      await (
        await waitThenGetElement("#RoyaltyGrid_Percent_0", true)
      ).click({ clickCount: 3 });
      await typeToInput("#RoyaltyGrid_Percent_0", royalty.toString());
      await (
        await waitThenGetElement(
          ".PostForSalePage_marginBottom  .Checkbox-prettyBox",
          true
        )
      ).click();
      await (
        await waitThenGetElement(
          ".PostForSalePage_submitButtonRow .Button_root__Submit",
          true
        )
      ).click();
      return "SUCCESS";
    } catch (e) {
      fs.appendFileSync("error.txt", e.toString());
      return "NETWORK PROBLEM";
    }
  }
  const data_rows = utils.deepClone(await utils.readCsv("data.csv"));

  for (let r of data_rows) {
    let status = await zazzle_execute(
      r.image,
      r.title,
      r.description,
      r.occasion,
      r.recipient,
      r.category,
      r.tag,
      r.royalty,
      r.gender,
      r.color
    );

    if (status === "NETWORK PROBLEM") {
      status = await zazzle_execute(
        r.image,
        r.title,
        r.description,
        r.occasion,
        r.recipient,
        r.category,
        r.tag,
        r.royalty,
        r.gender,
        r.color
      );
    }
    r.done = status;
    await utils.writeCsv("output.csv", data_rows);
  }
}

run();
