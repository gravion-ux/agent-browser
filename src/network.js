import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function ipv4Parts(value) {
  if (isIP(value) !== 4) return null;
  return value.split(".").map(Number);
}

function inV4Range(parts, base, mask) {
  const value = parts.reduce((acc, part) => (acc * 256) + part, 0);
  const network = base.split(".").map(Number).reduce((acc, part) => (acc * 256) + part, 0);
  const shift = 32 - mask;
  return Math.floor(value / (2 ** shift)) === Math.floor(network / (2 ** shift));
}

function ipv6BigInt(address) {
  let value = address.toLowerCase();
  if (value.includes(".")) {
    const lastColon = value.lastIndexOf(":");
    const ipv4 = ipv4Parts(value.slice(lastColon + 1));
    if (!ipv4) return null;
    const high = ((ipv4[0] << 8) | ipv4[1]).toString(16);
    const low = ((ipv4[2] << 8) | ipv4[3]).toString(16);
    value = `${value.slice(0, lastColon + 1)}${high}:${low}`;
  }
  const halves = value.split("::");
  if (halves.length > 2) return null;
  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;
  if ((halves.length === 1 && missing !== 0) || missing < 0) return null;
  const groups = [...left, ...Array(missing).fill("0"), ...right];
  if (groups.length !== 8 || groups.some((part) => !/^[0-9a-f]{1,4}$/.test(part))) return null;
  return groups.reduce((acc, part) => (acc << 16n) | BigInt(`0x${part}`), 0n);
}

function hasV6Prefix(value, network, prefix) {
  const mask = ((1n << 128n) - 1n) ^ ((1n << BigInt(128 - prefix)) - 1n);
  return (value & mask) === (network & mask);
}

const V6_BLOCKED_PREFIXES = [
  ["::", 128], ["::1", 128], ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
  ["2001::", 23], ["2001:db8::", 32], ["2002::", 16], ["3fff::", 20],
].map(([base, prefix]) => [ipv6BigInt(base), prefix]);

export function isPublicAddress(address) {
  const v4 = ipv4Parts(address);
  if (v4) {
    const blocked = [
      ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10],
      ["127.0.0.0", 8], ["169.254.0.0", 16], ["172.16.0.0", 12],
      ["192.0.0.0", 24], ["192.0.2.0", 24], ["192.88.99.0", 24],
      ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
      ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
    ];
    return !blocked.some(([base, mask]) => inV4Range(v4, base, mask)) && address !== "255.255.255.255";
  }

  if (isIP(address) === 6) {
    const value = ipv6BigInt(address);
    if (value === null) return false;
    const mappedPrefix = ipv6BigInt("::ffff:0:0");
    if (hasV6Prefix(value, mappedPrefix, 96)) {
      const v4value = Number(value & 0xffffffffn);
      const mapped = [24, 16, 8, 0].map((shift) => (v4value >>> shift) & 255).join(".");
      return isPublicAddress(mapped);
    }
    const globalUnicast = hasV6Prefix(value, ipv6BigInt("2000::"), 3);
    if (!globalUnicast) return false;
    return !V6_BLOCKED_PREFIXES.some(([network, prefix]) => hasV6Prefix(value, network, prefix));
  }
  return false;
}

export async function assertSafeNetworkTarget(rawUrl, { allowPrivateNetwork = false, lookupHost = lookup } = {}) {
  const parsed = new URL(rawUrl);
  if (allowPrivateNetwork) return;
  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw new Error(`Private/local host is blocked: ${hostname}. Use --allow-private-network only for systems you control.`);
  }

  let addresses;
  if (isIP(hostname)) addresses = [{ address: hostname }];
  else {
    try { addresses = await lookupHost(hostname, { all: true, verbatim: true }); }
    catch { throw new Error(`Could not resolve target host: ${hostname}`); }
  }
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error(`Target resolves to a private or non-public network address: ${hostname}`);
  }
}
