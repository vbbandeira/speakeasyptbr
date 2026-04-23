#!/usr/bin/env node
/**
 * generate-deep-dives — build 5 mini-podcast audios from deep-dives.yaml.
 *
 * Each deep_dive is one continuous narration by Carla (marketplace narrator).
 * Output: brazilian-listening-lab/audio/deep-dives/<id>.mp3
 *
 * Usage:
 *   npm run generate-deep-dives -- --dry-run
 *   npm run generate-deep-dives -- --execute
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { parseArgs } from "./_args.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const YAML_PATH = path.join(REPO_ROOT, "brazilian-listening-lab", "audio-scripts", "deep-dives.yaml");
const OUT_DIR = path.join(REPO_ROOT, "brazilian-listening-lab", "audio", "deep-dives");

const ELEVENLABS_API = "https://api.elevenlabs.io/v1/text-to-speech";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

interface DeepDive {
  id: string;
  title: string;
  duration_estimate: string;
  script: string;
}

interface Config {
  product: string;
  title: string;
  voice_env: string;
  stability?: number;
  similarity_boost?: number;
  deep_dives: DeepDive[];
}

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

async function fetchTTS(text: string, voiceId: string, apiKey: string, stability: number, simBoost: number): Promise<Buffer> {
  const url = `${ELEVENLABS_API}/${voiceId}?output_format=mp3_44100_128`;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability,
          similarity_boost: simBoost,
          style: 0,
          use_speaker_boost: true,
        },
      }),
    });
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    const errText = await response.text().catch(() => "");
    if ((response.status === 429 || response.status >= 500) && attempt < maxAttempts) {
      const backoff = 2000 * attempt;
      console.warn(`      ⏳ ${response.status} — retrying in ${backoff}ms...`);
      await new Promise((r) => setTimeout(r, backoff));
      continue;
    }
    throw new Error(`ElevenLabs ${response.status}: ${errText.slice(0, 300)}`);
  }
  throw new Error("unreachable");
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = args["dry-run"] === true || args["dry-run"] === "true";
  const execute = args["execute"] === true || args["execute"] === "true";
  const force = args["force"] === true || args["force"] === "true";

  if (!dryRun && !execute) {
    console.error("Usage: --dry-run OR --execute");
    process.exit(1);
  }

  const raw = await fs.readFile(YAML_PATH, "utf8");
  const config = yaml.load(raw) as Config;

  const voiceId = process.env[config.voice_env];
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceId) throw new Error(`${config.voice_env} not set`);
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY not set");

  const stability = config.stability ?? 0.55;
  const simBoost = config.similarity_boost ?? 0.75;

  console.log(`\n🎧 ${config.title} — ${config.deep_dives.length} episodes`);
  console.log(`   Voice: ${config.voice_env} (${voiceId.slice(0, 10)}...)`);
  const totalChars = config.deep_dives.reduce((s, d) => s + d.script.length, 0);
  console.log(`   Total chars: ${totalChars.toLocaleString()} (~${(totalChars / 100_000 * 100).toFixed(1)}% of monthly quota)\n`);

  for (const d of config.deep_dives) {
    const outPath = path.join(OUT_DIR, `${d.id}.mp3`);
    const exists = await fileExists(outPath);
    const marker = exists ? (force ? "🔁" : "✓") : "·";
    console.log(`  ${marker} ${d.id} — ${d.title} (${d.script.length} chars, ${d.duration_estimate})`);
  }

  if (dryRun) {
    console.log("\n✅ Dry run complete. Re-run with --execute.\n");
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log("\n🚀 Generating...\n");
  let generated = 0, skipped = 0, failed = 0;

  for (const d of config.deep_dives) {
    const outPath = path.join(OUT_DIR, `${d.id}.mp3`);
    if (!force && await fileExists(outPath)) {
      console.log(`  ⏭️  ${d.id} exists — skipped`);
      skipped++;
      continue;
    }
    process.stdout.write(`  🎙️  ${d.id} (${d.script.length} chars)... `);
    try {
      const audio = await fetchTTS(d.script.trim(), voiceId, apiKey, stability, simBoost);
      await fs.writeFile(outPath, audio);
      console.log(`✅ ${Math.round(audio.length / 1024)}KB`);
      generated++;
      await new Promise((r) => setTimeout(r, 400));
    } catch (err) {
      console.log(`❌ ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary: ${generated} generated · ${skipped} skipped · ${failed} failed\n`);
  if (failed > 0) process.exit(1);
})().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
