import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";
import * as model from "../src/lib/consent.mjs";

const compiled = ts.transpileModule(readFileSync(new URL("../src/scripts/consent.ts", import.meta.url), "utf8"), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
function harness({failRead = false, failWrite = false, initial = null} = {}) {
  const entries = new Map(initial ? [[model.CONSENT_KEY, initial]] : []);
  const events = [];
  const context = {
    exports: {}, require: () => model, Event,
    document: { readyState: "loading", addEventListener() {} },
    window: {dispatchEvent(event) { events.push(event.type); }},
    localStorage: {
      getItem(key) { if (failRead) throw new Error("blocked"); return entries.get(key) ?? null; },
      setItem(key, value) { if (failWrite) throw new Error("quota"); entries.set(key, value); },
      removeItem(key) { entries.delete(key); }
    },
    setTimeout() { return 1; }, clearTimeout() {}
  };
  vm.runInNewContext(compiled, context);
  return { api: context.exports, entries, events };
}

test("blocked storage starts denied and preserves an explicit choice in memory", () => {
  const {api, events} = harness({failRead:true, failWrite:true});
  assert.equal(api.allowsExternalMedia(), false);
  assert.equal(api.saveConsent(true), false);
  assert.equal(api.allowsExternalMedia(), true);
  api.saveConsent(false);
  assert.equal(api.allowsExternalMedia(), false);
  assert.equal(events.length, 2);
});

test("failed rejection write removes any previously stored grant", () => {
  const {api, entries} = harness({failWrite:true, initial:JSON.stringify(model.createConsent(true))});
  assert.equal(api.allowsExternalMedia(), true);
  assert.equal(api.saveConsent(false), false);
  assert.equal(api.allowsExternalMedia(), false);
  assert.equal(entries.has(model.CONSENT_KEY), false);
});

test("expired records are removed rather than silently renewing permission", () => {
  const {api, entries} = harness({initial:JSON.stringify(model.createConsent(true, Date.now()-model.CONSENT_TTL-1))});
  assert.equal(api.allowsExternalMedia(), false);
  assert.equal(entries.size, 0);
});

test("a persisted rejection survives a fresh page instance", () => {
  const first = harness();
  assert.equal(first.api.saveConsent(false), true);
  const second = harness({initial:first.entries.get(model.CONSENT_KEY)});
  assert.equal(second.api.getConsent().externalMedia, false);
  assert.equal(second.api.allowsExternalMedia(), false);
});
