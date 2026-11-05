import test from "node:test";
import assert from "node:assert/strict";
import { detectChallenge } from "../src/challenge.js";

test("detects CAPTCHA and human-verification challenges", () => {
  assert.equal(detectChallenge("Security check", "Please verify you are human to continue."), "captcha");
});

test("detects rate limits and access denials", () => {
  assert.equal(detectChallenge("429", "Too many requests. Try again later."), "rate_limit");
  assert.equal(detectChallenge("Forbidden", "Access denied"), "access_denied");
});

test("detects authentication checkpoints", () => {
  assert.equal(detectChallenge("Sign in", "Sign in to continue"), "authentication");
});

test("does not flag an ordinary page without challenge indicators", () => {
  assert.equal(detectChallenge("Example", "Welcome to the project documentation."), null);
});

// --- false negatives are the unsafe direction: a missed challenge keeps the agent running ---
test("detects human-verification phrasings with an article", () => {
  assert.equal(detectChallenge("Verify", "Verify you are a human to continue."), "captcha");
});

test("detects sign-in and login requirements", () => {
  assert.equal(detectChallenge("Members only", "Sign-in required to view this page."), "authentication");
  assert.equal(detectChallenge("Members only", "Login required."), "authentication");
  assert.equal(detectChallenge("Session", "Your session expired. Please sign in again."), "authentication");
});

test("detects permission denials written with contractions", () => {
  assert.equal(detectChallenge("Forbidden", "You don't have permission to access this page."), "access_denied");
});

test("detects JavaScript and cookie interstitials", () => {
  assert.equal(detectChallenge("Just a moment", "Please enable JavaScript and cookies to continue."), "anti_bot");
  assert.equal(detectChallenge("Unsupported browser", "Please enable JS and disable any ad blocker to continue."), "anti_bot");
});

test("detects blocked-request notices", () => {
  assert.equal(detectChallenge("Blocked", "Your request has been blocked by our security team."), "access_denied");
});
