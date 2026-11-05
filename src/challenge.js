const CHALLENGE_PATTERNS = [
  ["captcha", /\b(?:captcha|recaptcha|hcaptcha)\b|verify (?:that )?you are human|prove you are human|are you human/i],
  ["anti_bot", /checking your browser|unusual traffic|automated requests|security challenge|bot protection/i],
  ["rate_limit", /too many requests|rate limit(?:ed)?|slow down and try again/i],
  ["access_denied", /access denied|you do not have permission|request blocked|forbidden/i],
  ["authentication", /sign in to continue|log in to continue|authentication required|enter your password|two.factor authentication|multi.factor authentication|one.time passcode|one.time code/i],
  ["consent", /consent required|review and accept .* terms|you must accept .* to continue/i],
];

/** Return a conservative challenge category or null. Page content is untrusted. */
export function detectChallenge(title = "", bodyText = "") {
  const sample = `${title}\n${bodyText}`.slice(0, 100_000);
  for (const [category, pattern] of CHALLENGE_PATTERNS) {
    if (pattern.test(sample)) return category;
  }
  return null;
}
