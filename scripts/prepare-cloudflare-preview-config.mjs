import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

const productionBranch = process.env.CLOUDFLARE_PRODUCTION_BRANCH || "master";

export function isWorkersPreviewBuild(env = process.env, branch = productionBranch) {
  return Boolean(env.WORKERS_CI && env.WORKERS_CI_BRANCH && env.WORKERS_CI_BRANCH !== branch);
}

export function createPreviewConfig(config) {
  const { route: _route, routes: _routes, ...previewConfig } = config;

  return {
    ...previewConfig,
    workers_dev: true
  };
}

function rebaseAssetsDirectoryForGeneratedConfig(previewConfig) {
  if (!previewConfig.assets?.directory) return previewConfig;

  return {
    ...previewConfig,
    assets: {
      ...previewConfig.assets,
      directory: previewConfig.assets.directory === "./dist" ? "../../dist" : previewConfig.assets.directory
    }
  };
}

export async function writeGeneratedConfig(rootDir, previewConfig) {
  const generatedConfigPath = join(rootDir, ".wrangler/generated/preview-wrangler.json");
  const redirectPath = join(rootDir, ".wrangler/deploy/config.json");
  const generatedConfig = rebaseAssetsDirectoryForGeneratedConfig(previewConfig);

  await mkdir(dirname(generatedConfigPath), { recursive: true });
  await mkdir(dirname(redirectPath), { recursive: true });
  await writeFile(generatedConfigPath, `${JSON.stringify(generatedConfig, null, 2)}\n`);
  await writeFile(redirectPath, `${JSON.stringify({ configPath: "../generated/preview-wrangler.json" }, null, 2)}\n`);
}

function stripJsonComments(source) {
  let output = "";
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;
  let escaped = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        output += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }

    if (inString) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      output += char;
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    output += char;
  }

  return output;
}

async function main() {
  if (!isWorkersPreviewBuild()) return;

  const rootDir = process.cwd();
  const source = await readFile(join(rootDir, "wrangler.jsonc"), "utf8");
  const config = JSON.parse(stripJsonComments(source));

  await writeGeneratedConfig(rootDir, createPreviewConfig(config));
  console.log(`Prepared Cloudflare preview Wrangler config for ${process.env.WORKERS_CI_BRANCH}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await main();
}
