import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HIRE_INBOX,
  buildHireMailto,
  formatRm,
  meetingHours,
  meetingModeLabel,
  missingHireFields,
  readHireFields
} from "../src/lib/hire-form.mjs";

const valid = {
  name: "Ada Example",
  email: "ada@example.com",
  company: "Example Sdn Bhd",
  building: "A one-person company with research agents",
  setup: "Claude for writing, a support agent in trial",
  timezone: "Asia/Kuala_Lumpur — KL",
  windows: "Tue 10-12, Wed 14-16, Thu 09-11",
  length: "1",
  mode: "kl",
  preread: "https://example.com/brief"
};

test("first-meeting math stays locked to RM 1,420 / hour", () => {
  assert.equal(meetingHours("1"), 1);
  assert.equal(meetingHours("2"), 2);
  assert.equal(formatRm(1420), "RM 1,420");
  assert.equal(formatRm(2840), "RM 2,840");
  assert.equal(meetingModeLabel("kl"), "In person in Kuala Lumpur");
  assert.equal(meetingModeLabel("video"), "Video");
});

test("hire mailto names the inbox, rate, and invoice-before-meeting rule", () => {
  const href = buildHireMailto(valid);
  const url = new URL(href);
  assert.equal(HIRE_INBOX, "audy@mail.grokbot.com");
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, HIRE_INBOX);
  assert.match(url.searchParams.get("subject"), /Ada Example/);
  assert.match(url.searchParams.get("subject"), /1h/);
  const body = url.searchParams.get("body");
  assert.match(body, /RM 1,420/);
  assert.match(body, /In person in Kuala Lumpur/);
  assert.match(body, /Invoice before the meeting/);
  assert.match(body, /ada@example.com/);
});

test("two-hour video requests use the doubled rate", () => {
  const href = buildHireMailto({ ...valid, length: "2", mode: "video" });
  const body = new URL(href).searchParams.get("body");
  assert.match(body, /2 hours \(RM 2,840\)/);
  assert.match(body, /Meeting mode: Video/);
});

test("required hire fields are validated before composing mail", () => {
  assert.deepEqual(missingHireFields(valid), []);
  assert.ok(missingHireFields({ ...valid, email: "nope" }).includes("email"));
  assert.ok(missingHireFields({ ...valid, mode: "" }).includes("mode"));
  assert.throws(() => buildHireMailto({ ...valid, name: "" }), /name/);
});

test("FormData-like sources round-trip into hire fields", () => {
  const fields = readHireFields(new Map(Object.entries(valid)));
  assert.equal(fields.name, valid.name);
  assert.equal(fields.length, "1");
});
