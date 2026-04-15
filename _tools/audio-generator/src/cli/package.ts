#!/usr/bin/env node
/**
 * package — build delivery ZIPs per tier, ready for Lemon Squeezy upload.
 *
 *   npm run package -- --product speaking-pronunciation-kit --tier basic
 *   npm run package -- --product speaking-pronunciation-kit --all-tiers
 *
 * Reads manifest bundles, collects station audio-final/ dirs and includes_extras paths,
 * packs into speakeasyptbr-products/<product>/delivery/<tier>.zip.
 *
 * IMPLEMENTATION NOTE: Uses Node's built-in archive via execFile to `zip` command
 * (more portable than bundling a zip lib for our small needs). Falls back to a
 * clear error message if `zip` is not on PATH.
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseArgs, requireStr, boolFlag, optionalStr } from "./_args.js";
import { createLogger } from "@/pipeline/_utils/log.js";
import { ensureDir, exists } from "@/pipeline/_utils/fs.js";
import { loadManifest } from "@/pipeline/_utils/manifest.js";
import { stationPaths, PRODUCTS_ROOT } from "@/pipeline/_utils/paths.js";
import type { Manifest, Bundle } from "@/types/index.js";

const execFileAsync = promisify(execFile);
const log = createLogger("package");

const args = parseArgs(process.argv.slice(2));
const productSlug = requireStr(args, "product");
const tierId = optionalStr(args, "tier");
const allTiers = boolFlag(args, "all-tiers");

if (!tierId && !allTiers) {
  console.error("Provide --tier <id> or --all-tiers");
  process.exit(1);
}

(async () => {
  const manifest = await loadManifest(productSlug);
  const targets = tierId ? [findBundle(manifest, tierId)] : manifest.bundles;

  for (const bundle of targets) {
    await packageBundle(manifest, bundle);
  }
})().catch((err) => {
  console.error("package failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

function findBundle(manifest: Manifest, id: string): Bundle {
  const b = manifest.bundles.find((x) => x.id === id);
  if (!b) {
    console.error(`Tier ${id} not found in ${manifest.product}`);
    process.exit(1);
  }
  return b;
}

async function packageBundle(manifest: Manifest, bundle: Bundle): Promise<void> {
  log.info("Packaging bundle", { product: manifest.product, tier: bundle.id });

  const stagingDir = path.join(PRODUCTS_ROOT, manifest.product, "delivery", `${bundle.id}-staging`);
  const zipPath = path.join(PRODUCTS_ROOT, manifest.product, "delivery", `${bundle.id}.zip`);
  await ensureDir(stagingDir);

  const stationIds = collectStationIds(manifest, bundle);
  const extraPaths = collectExtraPaths(manifest, bundle);

  // Copy audio-final of each station into staging/audio/<station-id>/
  for (const stationId of stationIds) {
    const srcDir = stationPaths.audioMp3Dir(manifest.product, stationId);
    if (!(await exists(srcDir))) {
      log.warn(`Missing audio-final for station ${stationId} — skipping`);
      continue;
    }
    const dstDir = path.join(stagingDir, "audio", stationId);
    await copyDir(srcDir, dstDir);
  }

  // Copy extras (resolve relative paths from manifest location)
  for (const rel of extraPaths) {
    const absPath = path.resolve(
      path.join(PRODUCTS_ROOT, "_tools", "audio-generator", "manifests"),
      rel,
    );
    if (!(await exists(absPath))) {
      log.warn(`Extra not found: ${absPath} — skipping`);
      continue;
    }
    const dst = path.join(stagingDir, path.basename(absPath));
    await copyFile(absPath, dst);
  }

  // Add README.txt inside the ZIP
  const readmeText = buildReadmeTxt(manifest, bundle);
  await fs.writeFile(path.join(stagingDir, "README.txt"), readmeText, "utf-8");

  // Zip it up
  try {
    await execFileAsync("zip", ["-r", zipPath, "."], { cwd: stagingDir });
  } catch (err) {
    console.error(
      `ERROR: 'zip' command failed or not found on PATH. Install it or use an alternative.\n` +
        `Staging dir preserved: ${stagingDir}`,
    );
    throw err;
  }

  // Clean up staging
  await fs.rm(stagingDir, { recursive: true, force: true });

  log.info("Bundle packaged", { zipPath });
  console.log(`\n✅ ${zipPath}\nReady for Lemon Squeezy upload.\n`);
}

function collectStationIds(manifest: Manifest, bundle: Bundle): string[] {
  const ids = new Set<string>();
  let current: Bundle | undefined = bundle;
  while (current) {
    for (const sid of current.includes_stations) ids.add(sid);
    current = current.inherits ? manifest.bundles.find((b) => b.id === current!.inherits) : undefined;
  }
  return Array.from(ids);
}

function collectExtraPaths(manifest: Manifest, bundle: Bundle): string[] {
  const paths: string[] = [];
  let current: Bundle | undefined = bundle;
  while (current) {
    for (const p of current.includes_extras) paths.push(p);
    current = current.inherits ? manifest.bundles.find((b) => b.id === current!.inherits) : undefined;
  }
  return paths;
}

async function copyDir(src: string, dst: string): Promise<void> {
  await ensureDir(dst);
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await copyFile(s, d);
  }
}

async function copyFile(src: string, dst: string): Promise<void> {
  await ensureDir(path.dirname(dst));
  await fs.copyFile(src, dst);
}

function buildReadmeTxt(manifest: Manifest, bundle: Bundle): string {
  return [
    `${manifest.product_name} — ${bundle.id.toUpperCase()} tier`,
    ``,
    `Thank you for purchasing!`,
    ``,
    `Inside this ZIP:`,
    `  /audio/     — all audio files organized by station`,
    `  (PDFs at root — open with any PDF reader)`,
    ``,
    `Need help? Reply to the email you received from Lemon Squeezy,`,
    `or contact us at hello@speakeasyptbr.com.`,
    ``,
    `— SpeakEasy Portuguese`,
  ].join("\n");
}
