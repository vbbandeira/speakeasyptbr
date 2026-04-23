#!/usr/bin/env node
/**
 * generate-listening-lab — build 50 dialogue audios from dialogues.md.
 *
 * - Speaker A (male)   → ELEVENLABS_VOICE_MALE_PT (Paulo clone)
 * - Speaker B (female) → ELEVENLABS_VOICE_CARLA_PT (marketplace narrator)
 * - Each turn: one ElevenLabs call. Concatenated with 0.4s silence between turns.
 * - Output: brazilian-listening-lab/audio/Dialogue_XX.mp3
 *
 * Usage:
 *   npm run generate-listening-lab -- --dry-run
 *   npm run generate-listening-lab -- --execute
 *   npm run generate-listening-lab -- --execute --only=1-5    # range filter
 *   npm run generate-listening-lab -- --execute --force       # overwrite
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseArgs } from "./_args.js";

const exec = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const DIALOGUES_MD = path.join(REPO_ROOT, "brazilian-listening-lab", "audio-scripts", "dialogues.md");
const OUT_DIR = path.join(REPO_ROOT, "brazilian-listening-lab", "audio");
const TMP_ROOT = path.join(REPO_ROOT, "_tools", "audio-generator", "generated", "_listening_lab_tmp");
const SILENCE_DIR = path.join(REPO_ROOT, "_tools", "audio-generator", "generated", "_silence");

const ELEVENLABS_API = "https://api.elevenlabs.io/v1/text-to-speech";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

const STABILITY = 0.5;
const SIMILARITY_BOOST = 0.75;
const PAUSE_BETWEEN_TURNS_SEC = 0.4;

interface Turn {
  speaker: "A" | "B";
  role: string;     // e.g., "Passageiro", "Motorista"
  text: string;
}

interface Dialogue {
  id: number;        // 1-50
  titlePt: string;
  titleEn: string;
  level: string;
  setting: string;
  theme: string;
  turns: Turn[];
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

async function fetchTTS(text: string, voiceId: string, apiKey: string): Promise<Buffer> {
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
          stability: STABILITY,
          similarity_boost: SIMILARITY_BOOST,
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

function parseDialogues(content: string): Dialogue[] {
  const dialogues: Dialogue[] = [];
  // Split by dialogue headers
  const sections = content.split(/^### Dialogue /m).slice(1);

  for (const section of sections) {
    const headerMatch = section.match(/^(\d+)\s*—\s*(.+?)\s*\((.+?)\)\s*$/m);
    if (!headerMatch) continue;
    const id = parseInt(headerMatch[1], 10);
    const titlePt = headerMatch[2].trim();
    const titleEn = headerMatch[3].trim();

    const levelMatch = section.match(/\*\*Level:\*\*\s*([^\|]+)\|\s*\*\*Setting:\*\*\s*([^\|]+)\|\s*\*\*Theme:\*\*\s*(.+?)$/m);
    const level = levelMatch ? levelMatch[1].trim() : "";
    const setting = levelMatch ? levelMatch[2].trim() : "";
    const theme = levelMatch ? levelMatch[3].trim() : "";

    // Extract turns — lines like "**A (Role):** dialogue text"
    const turns: Turn[] = [];
    const turnPattern = /^\*\*([AB])(?:\s*\(([^)]+)\))?:\*\*\s*(.+?)$/gm;
    let match;
    while ((match = turnPattern.exec(section)) !== null) {
      const speaker = match[1] as "A" | "B";
      const role = (match[2] || "").trim();
      const text = match[3].trim();
      if (text) turns.push({ speaker, role, text });
    }

    if (turns.length > 0) {
      dialogues.push({ id, titlePt, titleEn, level, setting, theme, turns });
    }
  }
  return dialogues.sort((a, b) => a.id - b.id);
}

function parseRange(onlyArg: string | undefined): Set<number> | null {
  if (!onlyArg) return null;
  const set = new Set<number>();
  for (const part of onlyArg.split(",")) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let i = start; i <= end; i++) set.add(i);
    } else {
      const n = parseInt(part, 10);
      if (!isNaN(n)) set.add(n);
    }
  }
  return set;
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = args["dry-run"] === true || args["dry-run"] === "true";
  const execute = args["execute"] === true || args["execute"] === "true";
  const force = args["force"] === true || args["force"] === "true";
  const only = typeof args["only"] === "string" ? args["only"] as string : undefined;

  if (!dryRun && !execute) {
    console.error("Usage: --dry-run OR --execute  (optional: --force, --only=1-15)");
    process.exit(1);
  }

  const voiceMale = process.env.ELEVENLABS_VOICE_MALE_PT;
  const voiceFemale = process.env.ELEVENLABS_VOICE_CARLA_PT;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceMale || !voiceFemale || !apiKey) {
    console.error("Missing ELEVENLABS_VOICE_MALE_PT, ELEVENLABS_VOICE_CARLA_PT, or ELEVENLABS_API_KEY");
    process.exit(1);
  }

  const md = await fs.readFile(DIALOGUES_MD, "utf8");
  const all = parseDialogues(md);
  console.log(`\n📚 Parsed ${all.length} dialogues from dialogues.md`);

  const filter = parseRange(only);
  const dialogues = filter ? all.filter((d) => filter.has(d.id)) : all;
  if (filter) console.log(`   Filter: ${only} → ${dialogues.length} selected`);

  const totalChars = dialogues.reduce((s, d) => s + d.turns.reduce((x, t) => x + t.text.length, 0), 0);
  console.log(`📝 Total chars: ${totalChars.toLocaleString()} (~${(totalChars / 100_000 * 100).toFixed(1)}% of monthly quota)\n`);

  for (const d of dialogues) {
    const chars = d.turns.reduce((s, t) => s + t.text.length, 0);
    const outPath = path.join(OUT_DIR, `Dialogue_${String(d.id).padStart(2, "0")}.mp3`);
    const exists = await fileExists(outPath);
    const marker = exists ? (force ? "🔁" : "✓") : "·";
    console.log(`  ${marker} Dialogue_${String(d.id).padStart(2, "0")} — ${d.titlePt} · ${d.turns.length} turns · ${chars} chars`);
  }

  if (dryRun) {
    console.log(`\n✅ Dry run complete. Re-run with --execute to generate.\n`);
    return;
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(TMP_ROOT, { recursive: true });

  console.log(`\n🚀 Generating (Voice A=male/Paulo, Voice B=female/Carla)\n`);
  let generated = 0, skipped = 0, failed = 0;

  for (const d of dialogues) {
    const idStr = String(d.id).padStart(2, "0");
    const outPath = path.join(OUT_DIR, `Dialogue_${idStr}.mp3`);

    if (!force && await fileExists(outPath)) {
      console.log(`  ⏭️  Dialogue_${idStr} exists — skipped`);
      skipped++;
      continue;
    }

    const tmpDir = path.join(TMP_ROOT, `Dialogue_${idStr}`);
    await fs.mkdir(tmpDir, { recursive: true });

    process.stdout.write(`  🎙️  Dialogue_${idStr} (${d.turns.length} turns)... `);
    try {
      const partsToConcat: string[] = [];
      for (let i = 0; i < d.turns.length; i++) {
        const t = d.turns[i];
        const voice = t.speaker === "A" ? voiceMale : voiceFemale;
        const turnPath = path.join(tmpDir, `turn_${String(i + 1).padStart(2, "0")}_${t.speaker}.mp3`);
        const audio = await fetchTTS(t.text, voice, apiKey);
        await fs.writeFile(turnPath, audio);
        partsToConcat.push(turnPath);
        if (i < d.turns.length - 1) {
          partsToConcat.push(await ensureSilenceFile(PAUSE_BETWEEN_TURNS_SEC));
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      const listPath = path.join(tmpDir, "filelist.txt");
      await concatMp3s(partsToConcat, outPath, listPath);
      const stat = await fs.stat(outPath);
      console.log(`✅ ${Math.round(stat.size / 1024)}KB`);
      generated++;
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
