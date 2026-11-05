import test from "node:test";
import assert from "node:assert/strict";
import { isPublicAddress, assertSafeNetworkTarget } from "../src/network.js";

test("blocks private, loopback and link-local IPv4 ranges", () => {
  for (const ip of ["10.0.0.1", "172.16.0.1", "192.168.1.1", "127.0.0.1", "169.254.1.2", "100.64.0.1"]) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
});
test("blocks non-public IPv6 and IPv4-mapped private addresses", () => {
  for (const ip of ["::1", "fc00::1", "fe80::1", "ff02::1", "::ffff:192.168.1.1", "::ffff:c0a8:0101", "2001:db8::1", "2001::1", "2002::1", "3fff::1"]) {
    assert.equal(isPublicAddress(ip), false, ip);
  }
});
test("allows global unicast IP addresses", () => {
  assert.equal(isPublicAddress("1.1.1.1"), true);
  assert.equal(isPublicAddress("2606:4700:4700::1111"), true);
  assert.equal(isPublicAddress("2001:4860:4860::8888"), true);
});
test("blocks direct localhost targets by default", async () => {
  await assert.rejects(assertSafeNetworkTarget("http://127.0.0.1:3000"), /private or non-public/);
  await assert.rejects(assertSafeNetworkTarget("http://localhost:3000"), /Private\/local host/);
});
test("private target is allowed only with explicit opt-in", async () => {
  await assert.doesNotReject(assertSafeNetworkTarget("http://127.0.0.1:3000", { allowPrivateNetwork: true }));
});


test("blocks DNS names that resolve to private addresses", async () => {
  const lookupHost = async () => [{ address: "10.0.0.8", family: 4 }];
  await assert.rejects(
    assertSafeNetworkTarget("https://public.example.test", { lookupHost }),
    /private or non-public/
  );
});

test("blocks a DNS name when any answer is non-public", async () => {
  const lookupHost = async () => [
    { address: "1.1.1.1", family: 4 },
    { address: "127.0.0.1", family: 4 },
  ];
  await assert.rejects(
    assertSafeNetworkTarget("https://mixed.example.test", { lookupHost }),
    /private or non-public/
  );
});

test("allows DNS names resolving only to public addresses", async () => {
  const lookupHost = async () => [
    { address: "1.1.1.1", family: 4 },
    { address: "2606:4700:4700::1111", family: 6 },
  ];
  await assert.doesNotReject(assertSafeNetworkTarget("https://public.example.test", { lookupHost }));
});
