import test from "node:test";
import assert from "node:assert/strict";
import { chromium } from "playwright";

test("Playwright launches Chromium and renders a local page", async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent("<!doctype html><title>Agent Browser smoke</title><main>runtime ok</main>");
    assert.equal(await page.title(), "Agent Browser smoke");
    assert.equal(await page.locator("main").innerText(), "runtime ok");
  } finally {
    await browser.close();
  }
});
