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
