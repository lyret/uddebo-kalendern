import Puppeteer from "puppeteer";
import Path from "node:path";

let lock = null;

export async function generateCalendarIMG(month, width, height, htmlURL) {
  console.log("Rendering image for", month);

  // Keep track of concurrent renderings
  let localLoc = Math.random();
  lock = localLoc;

  const filePath = Path.resolve(`./renders/${month}.jpg`);

  // Use Puppeteer to render the imageL
  const browser = await Puppeteer.launch({
    args: ["--no-sandbox"],
    headless: "new",
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36')
  await page.setViewport({ width, height });
  await page.goto(htmlURL, {
    waitUntil: "networkidle0",
  });
  await page.waitForSelector("#done");

  // Save the rendering as a screenshot
  if (lock == localLoc) {
    await page.screenshot({
      path: filePath,
    });
    console.log("Saved screenshot for", month);
  } else {
    console.log(
      "More recent rendering is being generated, no screenshot taken"
    );
  }

  await browser.close();
  return filePath;
}
