#!/usr/bin/env node
/**
 * generate-immersion-audio — builds a single immersion-style narration audio
 * from a YAML scene file. Used for "One Day in Brazil" (Everyday €19.90 bonus).
 *
 * Each scene becomes one ElevenLabs call. Scenes are concatenated with a
 * short silence between them (0.9s by default). Natural speed, no atempo.
 *
 * Usage:
 *   npm run generate-immersion-audio -- --file=everyday-brazilian-portuguese/audio-scripts/One_Day_in_Brazil.yaml
 *   npm run generate-immersion-audio -- --file=... --dry-run
 *   npm run generate-immersion-audio -- --file=... --force       # overwrite if exists
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "js-yaml";
import { parseArgs, requireStr } from "./_args.js";

const exec = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const TMP_ROOT = path.join(REPO_ROOT, "_tools", "audio-generator", "generated", "_immersion_tmp");
const SILENCE_DIR = path.join(REPO_ROOT, "_tools", "audio-generator", "generated", "_silence");

const ELEVENLABS_API = "https://api.elevenlabs.io/v1/text-to-speech";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

interface Scene {
  id: string;
  pt: string;
  en?: string;
}

interface ImmersionConfig {
  product: string;
  title: string;
  output_dir: string;
  output_filename: string;
  voice_env: string;
  stability?: number;
  similarity_boost?: number;
  pause_between_scenes_sec?: number;
  scenes: Scene[];
}

async function fileExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

async function ensureSilenceFile(durationSec: number): Promise<string> {
  const safeName = durationSec.toString().replace(".", "_");
  const filepath = path.join(SILENCE_DIR, `silence_${safeName}s.mp3`);
  if (await fileExists(filepath)) return filepath;
  await fs.mkdir(SILENCE_DIR, { recursive: true });
  await exec("ffmpeg", [
    "-y", "-f", "lavfi",
    "-i", `anullsrc=r=44100:cl=mono`,
    "-t", String(durationSec),
    "-b:a", "128k",
    filepath,
  ]);
  return filepath;
}

async function fetchTTS(
  text: string, voiceId: string, apiKey: string,
  stability: number, similarityBoost: number,
): Promise<Buffer> {
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
          similarity_boost: similarityBoost,
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

async function concatMp3s(filepaths: string[], outputPath: string, listPath: string): Promise<void> {
  const listContent = filepaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
  await fs.writeFile(listPath, listContent);
  await exec("ffmpeg", [
    "-y", "-f", "concat", "-safe", "0",
    "-i", listPath,
    "-c", "copy",
    outputPath,
  ]);
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = args["dry-run"] === true || args["dry-run"] === "true";
  const force = args["force"] === true || args["force"] === "true";
  const fileArg = requireStr(args, "file", "(path to YAML, relative to repo root)");

  const yamlPath = path.isAbsolute(fileArg) ? fileArg : path.join(REPO_ROOT, fileArg);
  const yamlContent = await fs.readFile(yamlPath, "utf8");
  const config = yaml.load(yamlContent) as ImmersionConfig;

  if (!config.product || !config.scenes?.length || !config.voice_env) {
    throw new Error("Invalid YAML: missing product, scenes, or voice_env");
  }

  const voiceId = process.env[config.voice_env];
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceId) throw new Error(`Env var ${config.voice_env} not set`);
  if (!apiKey) throw new Error(`ELEVENLABS_API_KEY not set`);

  const stability = config.stability ?? 0.55;
  const similarityBoost = config.similarity_boost ?? 0.75;
  const pauseSec = config.pause_between_scenes_sec ?? 0.9;

  const outputDir = path.join(REPO_ROOT, config.product, config.output_dir);
  const outputPath = path.join(outputDir, config.output_filename);

  const totalChars = config.scenes.reduce((s, sc) => s + sc.pt.length, 0);

  console.log(`\n🎬 Immersion audio: "${config.title}"`);
  console.log(`   Scenes: ${config.scenes.length}`);
  console.log(`   Voice: ${config.voice_env} (${voiceId.slice(0, 10)}...)`);
  console.log(`   Stability: ${stability} · Similarity: ${similarityBoost} · Pause: ${pauseSec}s`);
  console.log(`   Output: ${path.relative(REPO_ROOT, outputPath)}`);
  console.log(`   Total chars: ${totalChars.toLocaleString()} (~${((totalChars / 100_000) * 100).toFixed(1)}% of monthly quota)\n`);

  for (const sc of config.scenes) {
    console.log(`   · ${sc.id} — ${sc.pt.length} chars`);
  }

  if (dryRun) {
    console.log(`\n✅ Dry run complete. Re-run with --file=... (no --dry-run) to generate.\n`);
    return;
  }

  if (!force && (await fileExists(outputPath))) {
    console.log(`\n⏭️  Output already exists: ${outputPath}\n   Use --force to overwrite.\n`);
    return;
  }

  await fs.mkdir(outputDir, { recursive: true });
  const tmpDir = path.join(TMP_ROOT, config.product);
  await fs.mkdir(tmpDir, { recursive: true });

  console.log(`\n🚀 Generating...\n`);
  const partsToConcat: string[] = [];

  for (let i = 0; i < config.scenes.length; i++) {
    const sc = config.scenes[i];
    const isLast = i === config.scenes.length - 1;
    const scenePath = path.join(tmpDir, `${sc.id}.mp3`);
    process.stdout.write(`   🎙️  ${sc.id} (${sc.pt.length} chars)... `);
    try {
      const audio = await fetchTTS(sc.pt.trim(), voiceId, apiKey, stability, similarityBoost);
      await fs.writeFile(scenePath, audio);
      console.log(`✅ ${Math.round(audio.length / 1024)}KB`);
      partsToConcat.push(scenePath);
      if (!isLast && pauseSec > 0) {
        partsToConcat.push(await ensureSilenceFile(pauseSec));
      }
    } catch (err) {
      console.log(`❌ ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n   🔗 Concatenating ${partsToConcat.length} parts...`);
  const listPath = path.join(tmpDir, "filelist.txt");
  await concatMp3s(partsToConcat, outputPath, listPath);

  const stat = await fs.stat(outputPath);
  const durationSecEstimate = Math.round(totalChars / 15); // ~15 chars/sec PT-BR natural speed
  const mins = Math.floor(durationSecEstimate / 60);
  const secs = durationSecEstimate % 60;
  console.log(`\n✅ Done: ${path.relative(REPO_ROOT, outputPath)} (${Math.round(stat.size / 1024)}KB, ~${mins}m${secs}s estimated)\n`);
})().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
