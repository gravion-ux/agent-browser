function canonicalDomain(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Allowed domains must be non-empty hostnames.");
  }
  const input = value.trim().toLowerCase();
  if (/[\/@?#]/.test(input) || input.includes("://")) {
    throw new Error(`Invalid allowed domain: ${value}`);
  }
  let parsed;
  try { parsed = new URL(`http://${input}`); }
  catch { throw new Error(`Invalid allowed domain: ${value}`); }
  if (parsed.port || parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error(`Allowed entries must be hostnames without ports or paths: ${value}`);
  }
  return parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
}

export function normalizeAllowedDomains(values) {
  if (!Array.isArray(values)) throw new Error("Allowed domains must be provided as a list.");
  return [...new Set(values.map(canonicalDomain))];
}

export function validateTarget(rawUrl, allowedDomains) {
  let parsed;
  try { parsed = new URL(rawUrl); } catch { throw new Error("A valid absolute URL is required."); }
  if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Only http:// and https:// URLs are allowed.");
  if (parsed.username || parsed.password) throw new Error("URLs containing embedded credentials are not allowed.");
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  const allowed = normalizeAllowedDomains(allowedDomains);
  if (!allowed.length) throw new Error("At least one --allow-domain value is required.");
  const match = allowed.some((domain) => host === domain || host.endsWith(`.${domain}`));
  if (!match) throw new Error(`Domain ${host} is not in the allow-list.`);
  return parsed;
}
