#!/usr/bin/env node
/**
 * post-process — trim silence, normalize loudness, re-encode to delivery MP3.
 *
 *   npm run post-process -- --product speaking-pronunciation-kit --station M02
 *   npm run post-process -- --product speaking-pronunciation-kit --all-pending
 *
 * Requires ffmpeg on PATH. Reads audio/*.mp3 (from generate-audio),
 * writes audio-final/*.mp3 at the manifest's target bitrate.
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseArgs, requireStr, boolFlag, optionalStr } from "./_args.js";
import { createLogger } from "@/pipeline/_utils/log.js";
import { ensureDir, exists, appendText } from "@/pipeline/_utils/fs.js";
import { loadManifest, saveManifest, updateStation } from "@/pipeline/_utils/manifest.js";
import { stationPaths } from "@/pipeline/_utils/paths.js";
import type { Manifest, Station } from "@/types/index.js";

const execFileAsync = promisify(execFile);
const log = createLogger("post-process");

const args = parseArgs(process.argv.slice(2));
const productSlug = requireStr(args, "product");
const stationId = optionalStr(args, "station");
const allPending = boolFlag(args, "all-pending");

if (!stationId && !allPending) {
  console.error("Provide --station <id> or --all-pending");
  process.exit(1);
}

(async () => {
  const manifest = await loadManifest(productSlug);
  const targets = stationId
    ? manifest.stations.filter((s) => s.id === stationId)
    : manifest.stations.filter((s) => s.status === "pending_postprocess" && s.mode === "tts");

  if (targets.length === 0) {
    log.info("No stations to post-process.");
    return;
  }

  for (const station of targets) {
    await processStation(manifest, station);
  }
})().catch((err) => {
  console.error("post-process failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

async function processStation(manifest: Manifest, station: Station): Promise<void> {
  const srcDir = stationPaths.audioWavDir(manifest.product, station.id);
  const outDir = stationPaths.audioMp3Dir(manifest.product, station.id);
  if (!(await exists(srcDir))) {
    throw new Error(`No audio dir found for ${station.id}: ${srcDir}. Run generate-audio first.`);
  }
  await ensureDir(outDir);

  const files = (await fs.readdir(srcDir)).filter((f) => f.endsWith(".mp3"));
  log.info(`Post-processing ${station.id}`, { files: files.length });

  const bitrate = manifest.audio_format.bitrate_kbps;
  const lufs = manifest.audio_format.normalize_lufs;
  const sampleRate = manifest.audio_format.sample_rate;

  let processed = 0;
  for (const file of files) {
    const src = path.join(srcDir, file);
    const dst = path.join(outDir, file);
    if (await exists(dst)) continue;

    // ffmpeg: trim silence start/end + loudnorm + encode
    // `-af` chain: silenceremove (start + end) + loudnorm to target LUFS
    const args = [
      "-y",
      "-i", src,
      "-af",
      `silenceremove=start_periods=1:start_silence=0.15:start_threshold=-50dB:` +
        `stop_periods=-1:stop_silence=0.3:stop_threshold=-50dB,` +
        `loudnorm=I=${lufs}:LRA=11:TP=-1.5`,
      "-ar", String(sampleRate),
      "-ac", "1",
      "-b:a", `${bitrate}k`,
      dst,
    ];

    try {
      await execFileAsync("ffmpeg", args, { maxBuffer: 1024 * 1024 * 50 });
      processed++;
    } catch (err) {
      log.error("ffmpeg failed", { file, error: err instanceof Error ? err.message : String(err) });
    }
  }

  const updated = updateStation(manifest, station.id, {
    status: "pending_package",
    last_run: new Date().toISOString(),
  });
  await saveManifest(productSlug, updated);

  await appendText(
    stationPaths.runLog(manifest.product, station.id),
    `\n## ${new Date().toISOString()} — post-process phase\nProcessed ${processed}/${files.length} files.\n`,
  );

  log.info("Post-process done", { id: station.id, processed, total: files.length });
}
