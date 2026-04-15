#!/usr/bin/env node
/**
 * generate-audio — consume a station's scripts.md and produce .wav (master) + .mp3 (delivery)
 * via ElevenLabs API.
 *
 *   npm run generate-audio -- --product speaking-pronunciation-kit --station M02
 *   # or batch:
 *   npm run generate-audio -- --product speaking-pronunciation-kit --all-pending
 *
 * IMPLEMENTATION NOTE: This is a functional skeleton. It parses scripts.md correctly,
 * calls the ElevenLabs API, handles retries. It does NOT yet do streaming writes
 * (loads entire MP3 into memory — fine for drills under a few minutes, but
 * consider streaming for mini-podcasts if they go >5min).
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs, requireStr, boolFlag, optionalStr } from "./_args.js";
import { createLogger } from "@/pipeline/_utils/log.js";
import { ensureDir, exists, readText, writeText, appendText, fileSize } from "@/pipeline/_utils/fs.js";
import { withRetry } from "@/pipeline/_utils/retry.js";
import { loadManifest, saveManifest, resolveEnvRef, updateStation } from "@/pipeline/_utils/manifest.js";
import { stationPaths, GENERATED_DIR } from "@/pipeline/_utils/paths.js";
import type { Manifest, Station } from "@/types/index.js";

const log = createLogger("generate-audio");

interface DrillBlock {
  drillNumber: string; // "01", "02"...
  drillName: string;
  variant: "slow" | "natural";
  text: string;
  speakerVoiceKey?: string; // for dialogue mode, "narrator_pt" or "secondary_pt"
}

const args = parseArgs(process.argv.slice(2));
const productSlug = requireStr(args, "product");
const stationId = optionalStr(args, "station");
const allPending = boolFlag(args, "all-pending");

if (!stationId && !allPending) {
  console.error("Provide either --station <id> or --all-pending");
  process.exit(1);
}

(async () => {
  const manifest = await loadManifest(productSlug);
  const targets = stationId
    ? [findStation(manifest, stationId)]
    : manifest.stations.filter((s) => s.status === "pending_audio" && s.mode === "tts");

  if (targets.length === 0) {
    log.info("No stations to process.");
    return;
  }

  log.info("Stations to process", { count: targets.length, ids: targets.map((s) => s.id) });

  for (const station of targets) {
    if (station.mode !== "tts") {
      log.warn(`Skipping non-TTS station ${station.id} (mode=${station.mode})`);
      continue;
    }
    await processStation(manifest, station);
  }

  log.info("Done.");
})().catch((err) => {
  console.error("generate-audio failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});

// ─── functions ─────────────────────────────────────────────────────

function findStation(manifest: Manifest, id: string): Station {
  const s = manifest.stations.find((st) => st.id === id);
  if (!s) {
    console.error(`Station ${id} not found in ${manifest.product} manifest`);
    process.exit(1);
  }
  return s;
}

async function processStation(manifest: Manifest, station: Station): Promise<void> {
  const scriptsPath = stationPaths.scripts(manifest.product, station.id);
  if (!(await exists(scriptsPath))) {
    throw new Error(
      `scripts.md missing for ${station.id}: ${scriptsPath}. Run Phase 1 (Opus agent) first.`,
    );
  }

  const wavDir = stationPaths.audioWavDir(manifest.product, station.id);
  await ensureDir(wavDir);

  const scriptText = await readText(scriptsPath);
  const drills = parseDrills(scriptText);
  log.info(`Parsed drills`, { station: station.id, count: drills.length });

  if (drills.length === 0) {
    throw new Error(`No drills parsed from ${scriptsPath}. Check format.`);
  }

  const voiceMapping = resolveVoice(manifest, station);
  let generated = 0;

  for (const d of drills) {
    const voiceId = d.speakerVoiceKey
      ? resolveEnvRef(manifest.voices[d.speakerVoiceKey as keyof typeof manifest.voices]!.primary)
      : voiceMapping.primary;

    const outPath = path.join(wavDir, `drill-${d.drillNumber}-${d.variant}.mp3`);
    if (await exists(outPath) && (await fileSize(outPath)) > 0) {
      log.debug("Skip (exists)", { outPath });
      continue;
    }

    const stability = d.variant === "slow" ? 0.7 : 0.5;
    try {
      await withRetry(() => generateOne(voiceId, d.text, outPath, stability), {
        attempts: 3,
        baseDelayMs: 1000,
        scope: `elevenlabs-${station.id}-d${d.drillNumber}`,
      });
      generated++;
    } catch (err) {
      log.error("Drill generation failed", {
        drill: `${d.drillNumber}-${d.variant}`,
        error: err instanceof Error ? err.message : String(err),
      });
      // Continue with next drill; don't abort the whole station
    }
  }

  // Update manifest
  const updated = updateStation(manifest, station.id, {
    status: "pending_postprocess",
    last_run: new Date().toISOString(),
  });
  await saveManifest(productSlug, updated);

  await appendText(
    stationPaths.runLog(manifest.product, station.id),
    `\n## ${new Date().toISOString()} — audio phase\nGenerated ${generated}/${drills.length} drills.\n`,
  );

  log.info("Station done", { id: station.id, generated, total: drills.length });
}

function resolveVoice(manifest: Manifest, station: Station): { primary: string } {
  const voiceKey = station.voice ?? "narrator_pt";
  const mapping = manifest.voices[voiceKey as keyof typeof manifest.voices];
  if (!mapping) {
    throw new Error(`Voice '${voiceKey}' not in manifest.voices for ${manifest.product}`);
  }
  return { primary: resolveEnvRef(mapping.primary) };
}

/** Parse scripts.md. Supports:
 *   ## Drill 01 — Name
 *   ### Variant: slow
 *   <text>
 *   ### Variant: natural
 *   <text>
 *
 * And dialogue format:
 *   ## Dialogue D01 — Name
 *   ### Variant: slow
 *   **[Speaker A / narrator_pt]** line
 *   **[Speaker B / secondary_pt]** line
 */
function parseDrills(md: string): DrillBlock[] {
  const drills: DrillBlock[] = [];
  const drillSections = md.split(/^## (?:Drill|Dialogue|Podcast|Dictation) /m).slice(1);

  for (const section of drillSections) {
    const header = section.split("\n")[0]!;
    const m = /^(?:D)?(\d+)\s*[—-]\s*(.+)$/.exec(header.trim());
    if (!m) continue;
    const drillNumber = m[1]!.padStart(2, "0");
    const drillName = m[2]!.trim();

    for (const variant of ["slow", "natural"] as const) {
      const variantPattern = new RegExp(
        `### Variant:\\s*${variant}\\s*\\n([\\s\\S]*?)(?=\\n###|\\n## |$)`,
        "i",
      );
      const vm = variantPattern.exec(section);
      if (!vm) continue;
      let text = vm[1]!
        .replace(/<!--[\s\S]*?-->/g, "")
        .trim();
      if (!text) continue;

      // For dialogue format: split into per-speaker blocks. For now we concatenate
      // into one block keeping speaker labels inside (the CLI treats each drill as one API call).
      // Future improvement: split on **[Speaker X / voice_key]** and send as multiple calls
      // with different voice_ids, then concat with ffmpeg.
      drills.push({ drillNumber, drillName, variant, text });
    }
  }

  return drills;
}

async function generateOne(
  voiceId: string,
  text: string,
  outPath: string,
  stability: number,
): Promise<void> {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY not set");
  }
  const modelId = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`ElevenLabs ${response.status}: ${errText.slice(0, 300)}`);
  }

  const buf = Buffer.from(await response.arrayBuffer());
  await ensureDir(path.dirname(outPath));
  await fs.writeFile(outPath, buf);
}
