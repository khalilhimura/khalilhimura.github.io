import assert from "node:assert/strict";
import { test } from "node:test";
import { createConsent, parseConsent, CONSENT_TTL, CONSENT_VERSION } from "../src/lib/consent.mjs";
const now = Date.UTC(2026, 8, 13);

test("no valid affirmative choice means external media stays blocked", () => {
  for (const value of [null, "", "not json", "null", "[]", "{}", JSON.stringify({ externalMedia: true })]) {
    assert.equal(parseConsent(value, now), null);
  }
  const rejection = createConsent(false, now);
  assert.equal(parseConsent(JSON.stringify(rejection), now).externalMedia, false);
});

test("both choices expire at the same boundary and are versioned", () => {
  for (const allow of [true, false]) {
    const choice = createConsent(allow, now);
    assert.equal(choice.version, CONSENT_VERSION);
    assert.equal(choice.expiresAt, now + CONSENT_TTL);
    assert.equal(parseConsent(JSON.stringify(choice), now + CONSENT_TTL - 1).externalMedia, allow);
    assert.equal(parseConsent(JSON.stringify(choice), now + CONSENT_TTL), null);
  }
});

test("stale versions, forged durations, future timestamps and non-booleans fail closed", () => {
  const choice = createConsent(true, now);
  for (const changes of [{version: 0}, {externalMedia: "true"}, {updatedAt: now + 1}, {expiresAt: now + CONSENT_TTL + 1}, {updatedAt: "today"}, {expiresAt: 0}]) {
    assert.equal(parseConsent(JSON.stringify({...choice, ...changes}), now), null);
  }
});
