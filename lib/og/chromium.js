import puppeteer from "puppeteer-core";
import { getOptions } from "./options";
let _page = null;

async function getPage(isDev) {
  if (_page) {
    return _page;
  }
  const options = await getOptions(isDev);
  const browser = await puppeteer.launch(options);
  _page = await browser.newPage();
  return _page;
}

export async function getScreenshot(isDev, length, hash) {
  const path = `/facebook/${length}/${hash}`;
  const page = await getPage(isDev);

  await page.setViewport({ width: 1200, height: 630 });
  await page.goto(
    `${isDev ? "http://localhost:3000" : "https://www.woordje.be"}${path}`
  );

  const file = await page.screenshot({ type: "jpeg" });
  return file;
}
