import test from "node:test";
import assert from "node:assert/strict";
import { expandInlineValues, parse } from "../src/cli.js";

test("requires a URL", () => {
  assert.throws(() => parse(["--allow-domain", "example.com"]), /--url is required/);
});

test("parses a URL and an allow-list", () => {
  const options = parse(["--url", "https://example.com/docs", "--allow-domain", "example.com"]);
  assert.equal(options.url, "https://example.com/docs");
  assert.deepEqual(options.domains, ["example.com"]);
  assert.equal(options.timeout, 20000);
  assert.equal(options.maxChars, 4000);
  assert.equal(options.allowPrivateNetwork, false);
});

test("splits a comma-separated allow-list", () => {
  const options = parse(["--url", "https://a.example.com/docs", "--allow-domain", "a.example.com,b.example.com"]);
  assert.deepEqual(options.domains, ["a.example.com", "b.example.com"]);
});

test("rejects an unknown option", () => {
  assert.throws(() => parse(["--nope"]), /Unknown or incomplete option/);
});

test("rejects an out-of-range timeout", () => {
  assert.throws(() => parse(["--url", "https://example.com", "--timeout-ms", "10"]), /--timeout-ms must be 1000\.\.60000/);
});

test("rejects an out-of-range character limit", () => {
  assert.throws(() => parse(["--url", "https://example.com", "--max-chars", "10"]), /--max-chars must be 100\.\.20000/);
});

test("rejects a target outside the allow-list", () => {
  assert.throws(() => parse(["--url", "https://elsewhere.test", "--allow-domain", "example.com"]), /not in the allow-list/);
});

test("rejects a non-HTTP target", () => {
  assert.throws(() => parse(["--url", "file:///etc/passwd", "--allow-domain", "example.com"]), /Only http:\/\/ and https:\/\//);
});

test("the private-network switch is opt-in", () => {
  const options = parse(["--url", "https://example.com", "--allow-domain", "example.com", "--allow-private-network"]);
  assert.equal(options.allowPrivateNetwork, true);
});

// --- the --flag=value form must reach the same parser ---
test("accepts the --flag=value form", () => {
  const options = parse(["--url=https://example.com", "--allow-domain=example.com"]);
  assert.equal(options.url, "https://example.com");
  assert.deepEqual(options.domains, ["example.com"]);
});

test("accepts the --flag=value form for the numeric options", () => {
  const options = parse(["--url=https://example.com", "--allow-domain=example.com", "--timeout-ms=5000", "--max-chars=800"]);
  assert.equal(options.timeout, 5000);
  assert.equal(options.maxChars, 800);
});

test("rejects an inline value on an option that takes none", () => {
  assert.throws(() => parse(["--url=https://example.com", "--allow-private-network=true"]), /does not take a value/);
});

test("rejects an empty inline value", () => {
  assert.throws(() => parse(["--url="]), /requires a value/);
});

test("rejects an inline value that looks like another option", () => {
  assert.throws(() => parse(["--url=--other"]), /may not start with --/);
});

test("the inline form is validated like the spaced form", () => {
  assert.throws(() => parse(["--url=https://example.com", "--timeout-ms=10"]), /--timeout-ms must be 1000\.\.60000/);
  assert.throws(() => parse(["--url=https://elsewhere.test", "--allow-domain=example.com"]), /not in the allow-list/);
});

test("expanding inline values leaves plain arguments untouched", () => {
  assert.deepEqual(expandInlineValues(["--url", "https://example.com"]), ["--url", "https://example.com"]);
});
