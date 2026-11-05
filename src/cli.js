#!/usr/bin/env node
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { validateTarget } from "./policy.js";
import { detectChallenge } from "./challenge.js";
import { assertSafeNetworkTarget } from "./network.js";

function parse(argv) {
  const options = { url: null, domains: [], timeout: 20000, maxChars: 4000, allowPrivateNetwork: false };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i], value = argv[i + 1];
    if (flag === "--url" && value && !value.startsWith("--")) { options.url = value; i++; }
    else if (flag === "--allow-domain" && value && !value.startsWith("--")) { options.domains.push(...value.split(",")); i++; }
    else if (flag === "--timeout-ms" && value && !value.startsWith("--")) { options.timeout = Number(value); i++; }
    else if (flag === "--max-chars" && value && !value.startsWith("--")) { options.maxChars = Number(value); i++; }
    else if (flag === "--allow-private-network") options.allowPrivateNetwork = true;
    else if (flag === "--help" || flag === "-h") options.help = true;
    else throw new Error(`Unknown or incomplete option: ${flag}`);
  }
  if (options.help) return options;
  if (!options.url) throw new Error("--url is required.");
  if (!Number.isInteger(options.timeout) || options.timeout < 1000 || options.timeout > 60000) throw new Error("--timeout-ms must be 1000..60000.");
  if (!Number.isInteger(options.maxChars) || options.maxChars < 100 || options.maxChars > 20000) throw new Error("--max-chars must be 100..20000.");
  options.target = validateTarget(options.url, options.domains);
  return options;
}

async function waitForHuman(page, category) {
  if (!stdin.isTTY || !stdout.isTTY) return false;
  stdout.write(`\nHUMAN HANDOFF REQUIRED: detected ${category} challenge.\n`);
  stdout.write("Use the visible browser window to complete any required step yourself. Agent Browser will not solve or bypass it.\n");
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    await rl.question("After you have completed the required step manually, press Enter to re-check the page (or Ctrl+C to stop): ");
    return true;
  } finally { rl.close(); }
}

export async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parse(argv);
    if (options.help) {
      console.log("Agent Browser v0.4.3\n\nUsage: npm start -- --url https://example.com --allow-domain example.com\n\nOptions: --url URL --allow-domain DOMAIN[,DOMAIN] [--timeout-ms 20000] [--max-chars 4000] [--allow-private-network]");
      return 0;
    }
    await assertSafeNetworkTarget(options.target.href, { allowPrivateNetwork: options.allowPrivateNetwork });
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: false });
    let context;
    try {
      context = await browser.newContext({
        viewport: { width: 1365, height: 900 },
        serviceWorkers: "block",
      });
      const page = await context.newPage();
      page.setDefaultNavigationTimeout(options.timeout);
      await page.route("**/*", async (route) => {
        try {
          const requestUrl = route.request().url();
          validateTarget(requestUrl, options.domains);
          await assertSafeNetworkTarget(requestUrl, { allowPrivateNetwork: options.allowPrivateNetwork });
          await route.continue();
        } catch (error) {
          if (error?.message) console.warn(`Blocked request: ${error.message}`);
          await route.abort("blockedbyclient");
        }
      });
      await page.goto(options.target.href, { waitUntil: "domcontentloaded" });

      let pageData = await page.evaluate(() => ({
        title: document.title,
        url: location.href,
        text: document.body?.innerText || "",
      }));
      let challenge = detectChallenge(pageData.title, pageData.text);
      if (challenge) {
        const resumed = await waitForHuman(page, challenge);
        if (!resumed) {
          console.log(JSON.stringify({ status: "HUMAN_HANDOFF_REQUIRED", challenge, title: pageData.title, url: pageData.url }, null, 2));
          return 3;
        }
        pageData = await page.evaluate(() => ({ title: document.title, url: location.href, text: document.body?.innerText || "" }));
        challenge = detectChallenge(pageData.title, pageData.text);
        if (challenge) {
          console.log(JSON.stringify({ status: "CHALLENGE_STILL_PRESENT", challenge, title: pageData.title, url: pageData.url }, null, 2));
          return 3;
        }
      }

      console.log(JSON.stringify({ status: "OK", title: pageData.title, url: pageData.url, text: pageData.text.slice(0, options.maxChars) }, null, 2));
      console.log("\nAgent Browser used a visible browser and bounded navigation. Review page output before relying on it.");
      return 0;
    } finally {
      try { await context?.close(); }
      finally { await browser.close(); }
    }
  } catch (error) {
    console.error(`agent-browser: ${error.message}`);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = await main();
