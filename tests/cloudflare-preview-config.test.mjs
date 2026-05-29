import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  createPreviewConfig,
  isWorkersPreviewBuild,
  writeGeneratedConfig
} from "../scripts/prepare-cloudflare-preview-config.mjs";

test("detects Cloudflare non-production branch builds", () => {
  assert.equal(isWorkersPreviewBuild({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "codex/branch" }, "master"), true);
  assert.equal(isWorkersPreviewBuild({ WORKERS_CI: "1", WORKERS_CI_BRANCH: "master" }, "master"), false);
  assert.equal(isWorkersPreviewBuild({ WORKERS_CI_BRANCH: "codex/branch" }, "master"), false);
});

test("preview config strips production routes and enables workers.dev previews", () => {
  const previewConfig = createPreviewConfig({
    name: "khalilnooh-com",
    compatibility_date: "2026-05-29",
    routes: [{ pattern: "khalilnooh.com", custom_domain: true }],
    route: "khalilnooh.com/*",
    workers_dev: false,
    assets: {
      directory: "./dist",
      not_found_handling: "single-page-application"
    }
  });

  assert.equal(previewConfig.name, "khalilnooh-com");
  assert.equal(previewConfig.workers_dev, true);
  assert.equal(previewConfig.routes, undefined);
  assert.equal(previewConfig.route, undefined);
  assert.deepEqual(previewConfig.assets, {
    directory: "./dist",
    not_found_handling: "single-page-application"
  });
});

test("writes Wrangler redirect metadata for generated preview config", async () => {
  const root = await mkdtemp(join(tmpdir(), "cloudflare-preview-config-"));

  try {
    await writeGeneratedConfig(root, {
      name: "khalilnooh-com",
      assets: { directory: "./dist" },
      workers_dev: true
    });

    const redirect = JSON.parse(await readFile(join(root, ".wrangler/deploy/config.json"), "utf8"));
    const generated = JSON.parse(await readFile(join(root, ".wrangler/generated/preview-wrangler.json"), "utf8"));

    assert.deepEqual(redirect, { configPath: "../generated/preview-wrangler.json" });
    assert.equal(generated.name, "khalilnooh-com");
    assert.equal(generated.workers_dev, true);
  } finally {
    await rm(root, { force: true, recursive: true });
  }
});
