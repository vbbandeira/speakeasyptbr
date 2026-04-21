#!/usr/bin/env node
/**
 * test-format-concat — take 8 — build a lesson by:
 *  1. Generating each segment as its own ElevenLabs call (clean voice, no breaks)
 *  2. Applying ffmpeg atempo=0.85 to the "slow" segments (preserves pitch)
 *  3. Concatenating all segments with controlled silence between them
 *
 * This avoids the voice artifacts from <break> tags and ellipsis-broken syllables,
 * and gives us REAL slow-down via ffmpeg (works even though the ElevenLabs v2
 * `speed` param is ignored by the API).
 *
 * Usage:
 *   npm run test-format-concat
 *
 * Output: _tools/audio-generator/generated/_format-tests/take_8_concat.mp3
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, "../../generated/_format-tests");
const TMP_DIR = path.join(OUT_DIR, "_take_8_tmp");
const SILENCE_DIR = path.join(OUT_DIR, "_silence");

const ELEVENLABS_API = "https://api.elevenlabs.io/v1/text-to-speech";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

interface Segment {
  text: string;
  slow: boolean;          // if true, apply atempo=0.85
  pauseAfterSec: number;  // silence to append after this segment
}

/*
 * Each "example" = 3 segments:
 *   - natural utterance (full speed)
 *   - same utterance (will be slowed via atempo)
 *   - "Which means: X" (English meaning, full speed)
 *
 * Pauses tuned for clarity:
 *   - 0.6s after natural (before slow)
 *   - 0.9s after slow (before meaning)
 *   - 1.8s after meaning (before next example)
 */

const segments: Segment[] = [
  // Example 1: Oi
  { text: "Oi.", slow: false, pauseAfterSec: 0.6 },
  { text: "Oi.", slow: true,  pauseAfterSec: 0.9 },
  { text: "Which means: hi.", slow: false, pauseAfterSec: 1.8 },

  // Example 2: Olá
  { text: "Olá.", slow: false, pauseAfterSec: 0.6 },
  { text: "Olá.", slow: true,  pauseAfterSec: 0.9 },
  { text: "Which means: hello.", slow: false, pauseAfterSec: 1.8 },

  // Example 3: Eu vou para caza
  { text: "Eu vou para caza.", slow: false, pauseAfterSec: 0.6 },
  { text: "Eu vou para caza.", slow: true,  pauseAfterSec: 0.9 },
  { text: "Which means: I'm going home.", slow: false, pauseAfterSec: 1.8 },

  // Example 4: A iscola é perto
  { text: "A iscola é perto.", slow: false, pauseAfterSec: 0.6 },
  { text: "A iscola é perto.", slow: true,  pauseAfterSec: 0.9 },
  { text: "Which means: the school is close.", slow: false, pauseAfterSec: 0 },
];

const STABILITY = 0.5;
const ATEMPO = 0.85; // 15% slower, preserves pitch

async function fetchTTS(text: string, voiceId: string, apiKey: string): Promise<Buffer> {
  const url = `${ELEVENLABS_API}/${voiceId}?output_format=mp3_44100_128`;
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
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`ElevenLabs ${response.status}: ${await response.text().catch(() => "")}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function ensureSilenceFile(durationSec: number): Promise<string> {
  const filename = `silence_${durationSec.toString().replace(".", "_")}s.mp3`;
  const filepath = path.join(SILENCE_DIR, filename);
  try {
    await fs.access(filepath);
    return filepath;
  } catch {
    // Not found — generate it
  }
  await fs.mkdir(SILENCE_DIR, { recursive: true });
  await exec("ffmpeg", [
    "-y",
    "-f", "lavfi",
    "-i", `anullsrc=r=44100:cl=mono`,
    "-t", String(durationSec),
    "-b:a", "128k",
    filepath,
  ]);
  return filepath;
}

async function applyAtempo(inputPath: string, outputPath: string): Promise<void> {
  await exec("ffmpeg", [
    "-y",
    "-i", inputPath,
    "-filter:a", `atempo=${ATEMPO}`,
    "-b:a", "128k",
    outputPath,
  ]);
}

async function concatMp3s(filepaths: string[], outputPath: string): Promise<void> {
  // Use ffmpeg concat demuxer
  const listPath = path.join(TMP_DIR, "filelist.txt");
  const listContent = filepaths.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n");
  await fs.writeFile(listPath, listContent);
  await exec("ffmpeg", [
    "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", listPath,
    "-c", "copy",
    outputPath,
  ]);
}

(async () => {
  const voiceId = process.env.ELEVENLABS_VOICE_LAYLA_PT;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceId || !apiKey) {
    console.error("Missing ELEVENLABS_VOICE_LAYLA_PT or ELEVENLABS_API_KEY");
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.mkdir(TMP_DIR, { recursive: true });

  const totalChars = segments.reduce((s, seg) => s + seg.text.length, 0);
  console.log(`\n🧪 Take 8 — concat + atempo=${ATEMPO}`);
  console.log(`   ${segments.length} segments, total ${totalChars} chars`);
  console.log(`   Output: ${path.relative(process.cwd(), path.join(OUT_DIR, "take_8_concat.mp3"))}\n`);

  const partsToConcat: string[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const basename = `seg_${String(i + 1).padStart(2, "0")}${seg.slow ? "_slow" : ""}`;
    const naturalPath = path.join(TMP_DIR, `${basename}.mp3`);
    const slowedPath = path.join(TMP_DIR, `${basename}_atempo.mp3`);

    process.stdout.write(`   🎙️  ${basename}: "${seg.text}" (${seg.slow ? `slow ${ATEMPO}x` : "natural"})... `);

    const audio = await fetchTTS(seg.text, voiceId, apiKey);
    await fs.writeFile(naturalPath, audio);

    let finalPath = naturalPath;
    if (seg.slow) {
      await applyAtempo(naturalPath, slowedPath);
      finalPath = slowedPath;
    }

    partsToConcat.push(finalPath);
    console.log("✅");

    if (seg.pauseAfterSec > 0) {
      const silPath = await ensureSilenceFile(seg.pauseAfterSec);
      partsToConcat.push(silPath);
    }

    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n   🔗 Concatenating ${partsToConcat.length} parts...`);
  const finalOut = path.join(OUT_DIR, "take_8_concat.mp3");
  await concatMp3s(partsToConcat, finalOut);

  const stat = await fs.stat(finalOut);
  console.log(`\n✅ Done: ${path.relative(process.cwd(), finalOut)} (${Math.round(stat.size / 1024)}KB)\n`);
})().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
