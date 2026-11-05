const CHALLENGE_PATTERNS = [
  ["captcha", /\b(?:captcha|recaptcha|hcaptcha)\b|verify (?:that )?you are (?:a )?human|prove you are (?:a )?human|are you (?:a )?human|press and hold/i],
  ["anti_bot", /checking your browser|just a moment|unusual traffic|automated requests|security challenge|bot protection|enable javascript|javascript is required|javascript and cookies|enable js\b|disable (?:any |your )?ad ?blocker|adblock/i],
  ["rate_limit", /too many requests|rate limit(?:ed)?|slow down and try again|you have exceeded|request limit/i],
  ["access_denied", /access denied|you (?:do not|don't) have permission|permission to access|request blocked|your request (?:has been|was) blocked|forbidden/i],
  ["authentication", /sign in to continue|log in to continue|sign[- ]?in required|log[- ]?in required|please (?:sign|log) ?in|authentication required|enter your password|two.factor authentication|multi.factor authentication|one.time passcode|one.time code|session expired/i],
  ["consent", /consent required|review and accept .* terms|you must accept .* to continue|accept (?:all )?cookies|cookie consent|enable cookies/i],
];

/** Return a conservative challenge category or null. Page content is untrusted. */
export function detectChallenge(title = "", bodyText = "") {
  const sample = `${title}\n${bodyText}`.slice(0, 100_000);
  for (const [category, pattern] of CHALLENGE_PATTERNS) {
    if (pattern.test(sample)) return category;
  }
  return null;
}
