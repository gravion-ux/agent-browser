import test from "node:test";
import assert from "node:assert/strict";
import { validateTarget } from "../src/policy.js";

test("allows exact and subdomains", () => {
  assert.equal(validateTarget("https://docs.example.com/path", ["example.com"]).hostname, "docs.example.com");
});
test("rejects lookalike suffix hostnames", () => assert.throws(() => validateTarget("https://example.com.attacker.test", ["example.com"]), /not in the allow-list/));
test("rejects unsupported schemes", () => assert.throws(() => validateTarget("file:///etc/passwd", ["example.com"]), /Only http/));
test("requires an allow-list", () => assert.throws(() => validateTarget("https://example.com", []), /At least one/));
test("rejects embedded credentials", () => assert.throws(() => validateTarget("https://u:p@example.com", ["example.com"]), /embedded credentials/));

test("normalizes trailing DNS dots", () => {
  assert.equal(validateTarget("https://docs.example.com./", ["example.com."]).hostname, "docs.example.com.");
});
test("rejects allowed-domain URLs and ports", () => {
  assert.throws(() => validateTarget("https://example.com", ["https://example.com"]), /Invalid allowed domain/);
  assert.throws(() => validateTarget("https://example.com", ["example.com:443"]), /hostname.*port/);
});
