#!/usr/bin/env node
/**
 * generate-kit-audio-v2 — concat-based audio generator for the Speaking Kit.
 *
 * Uses the approved take_8 format:
 *  - Each segment is its own ElevenLabs call (clean voice, no break artifacts)
 *  - Slow segments get atempo=0.85 via ffmpeg (preserves pitch)
 *  - Silences inserted between segments via ffmpeg concat
 *
 * Input: YAML lesson definitions in speaking-pronunciation-kit/audio-scripts/
 *        One .yaml file per chapter. See schema comment below.
 *
 * Output: speaking-pronunciation-kit/audio/<Chapter>/<Lesson>.mp3
 *
 * Usage:
 *   npm run generate-kit-audio-v2 -- --dry-run                    # show plan, chars
 *   npm run generate-kit-audio-v2 -- --execute                    # generate all
 *   npm run generate-kit-audio-v2 -- --execute --only=Bonus*      # filter
 *   npm run generate-kit-audio-v2 -- --execute --force            # overwrite existing
 *
 * YAML schema (one file per chapter):
 *   chapter_folder: Chapter_01_Rhythm_Stress
 *   lessons:
 *     Lesson_01:
 *       title: "Default stress rule"
 *       intro_en: "Words ending in -a, -e, or -o have stress on 2nd-to-last."
 *       examples:
 *         - { pt: banana, en: banana }
 *         - { pt: casa, pt_tts: caza, en: house }
 *         - { pt: escola, pt_tts: iscola, en: school }
 *       outro_en: null
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import yaml from "js-yaml";
import { parseArgs } from "./_args.js";

const exec = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const SCRIPTS_DIR = path.join(REPO_ROOT, "speaking-pronunciation-kit", "audio-scripts");
const AUDIO_OUT_DIR = path.join(REPO_ROOT, "speaking-pronunciation-kit", "audio");
const TMP_ROOT = path.join(REPO_ROOT, "_tools", "audio-generator", "generated", "_kit_tmp");
const SILENCE_DIR = path.join(REPO_ROOT, "_tools", "audio-generator", "generated", "_silence");

const ELEVENLABS_API = "https://api.elevenlabs.io/v1/text-to-speech";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

// Tuning — matches approved take_8
const STABILITY = 0.5;
const SIMILARITY_BOOST = 0.75;
const ATEMPO_SLOW = 0.85;            // 15% slower for "slow" repetition
const PAUSE_AFTER_INTRO_SEC = 1.5;
const PAUSE_BETWEEN_NATURAL_AND_SLOW_SEC = 0.6;
const PAUSE_BETWEEN_SLOW_AND_MEANING_SEC = 0.9;
const PAUSE_BETWEEN_EXAMPLES_SEC = 1.8;
const PAUSE_BEFORE_OUTRO_SEC = 1.5;

interface Example {
  pt: string;
  pt_tts?: string;  // optional TTS-friendly respelling
  en: string;
}

interface Lesson {
  title: string;
  intro_en?: string | null;
  examples: Example[];
  outro_en?: string | null;
}

interface ChapterFile {
  chapter_folder: string;
  lessons: Record<string, Lesson>;
}

interface Segment {
  text: string;
  slow: boolean;
  pauseAfterSec: number;
  kind: "intro" | "natural" | "slow" | "meaning" | "outro";
  exampleIndex?: number;
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

async function applyAtempo(inputPath: string, outputPath: string): Promise<void> {
  await exec("ffmpeg", [
    "-y", "-i", inputPath,
    "-filter:a", `atempo=${ATEMPO_SLOW}`,
    "-b:a", "128k",
    outputPath,
  ]);
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

function buildSegments(lesson: Lesson): Segment[] {
  const segs: Segment[] = [];

  if (lesson.intro_en && lesson.intro_en.trim()) {
    segs.push({
      kind: "intro",
      text: lesson.intro_en.trim(),
      slow: false,
      pauseAfterSec: PAUSE_AFTER_INTRO_SEC,
    });
  }

  for (let i = 0; i < lesson.examples.length; i++) {
    const ex = lesson.examples[i];
    const ptText = (ex.pt_tts ?? ex.pt).trim();
    const enMeaning = ex.en.trim();
    const isLast = i === lesson.examples.length - 1;
    const hasOutro = !!(lesson.outro_en && lesson.outro_en.trim());

    segs.push({
      kind: "natural",
      text: ptText,
      slow: false,
      pauseAfterSec: PAUSE_BETWEEN_NATURAL_AND_SLOW_SEC,
      exampleIndex: i,
    });
    segs.push({
      kind: "slow",
      text: ptText,
      slow: true,
      pauseAfterSec: PAUSE_BETWEEN_SLOW_AND_MEANING_SEC,
      exampleIndex: i,
    });
    segs.push({
      kind: "meaning",
      text: `Which means: ${enMeaning}.`,
      slow: false,
      pauseAfterSec: isLast
        ? (hasOutro ? PAUSE_BEFORE_OUTRO_SEC : 0)
        : PAUSE_BETWEEN_EXAMPLES_SEC,
      exampleIndex: i,
    });
  }

  if (lesson.outro_en && lesson.outro_en.trim()) {
    segs.push({
      kind: "outro",
      text: lesson.outro_en.trim(),
      slow: false,
      pauseAfterSec: 0,
    });
  }

  return segs;
}

async function generateLesson(
  chapterFolder: string,
  lessonName: string,
  lesson: Lesson,
  voiceId: string,
  apiKey: string,
  force: boolean,
): Promise<{ status: "generated" | "skipped" | "failed"; chars: number }> {
  const outDir = path.join(AUDIO_OUT_DIR, chapterFolder);
  const outPath = path.join(outDir, `${lessonName}.mp3`);

  if (!force && (await fileExists(outPath))) {
    return { status: "skipped", chars: 0 };
  }

  const segments = buildSegments(lesson);
  const tmpDir = path.join(TMP_ROOT, chapterFolder, lessonName);
  await fs.mkdir(tmpDir, { recursive: true });
  await fs.mkdir(outDir, { recursive: true });

  const partsToConcat: string[] = [];
  let totalChars = 0;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    totalChars += seg.text.length;

    const idx = String(i + 1).padStart(2, "0");
    const basename = `seg_${idx}_${seg.kind}${seg.slow ? "_slow" : ""}`;
    const naturalPath = path.join(tmpDir, `${basename}.mp3`);
    const slowedPath = path.join(tmpDir, `${basename}_atempo.mp3`);

    const audio = await fetchTTS(seg.text, voiceId, apiKey);
    await fs.writeFile(naturalPath, audio);

    let finalPart = naturalPath;
    if (seg.slow) {
      await applyAtempo(naturalPath, slowedPath);
      finalPart = slowedPath;
    }
    partsToConcat.push(finalPart);

    if (seg.pauseAfterSec > 0) {
      partsToConcat.push(await ensureSilenceFile(seg.pauseAfterSec));
    }

    await new Promise((r) => setTimeout(r, 250));
  }

  const listPath = path.join(tmpDir, "filelist.txt");
  await concatMp3s(partsToConcat, outPath, listPath);

  return { status: "generated", chars: totalChars };
}

async function loadChapterFiles(filter?: string): Promise<ChapterFile[]> {
  const entries = await fs.readdir(SCRIPTS_DIR);
  const yamlFiles = entries.filter((f) => f.endsWith(".yaml")).sort();

  const chapters: ChapterFile[] = [];
  for (const yf of yamlFiles) {
    const raw = await fs.readFile(path.join(SCRIPTS_DIR, yf), "utf8");
    const parsed = yaml.load(raw) as ChapterFile;
    if (!parsed.chapter_folder || !parsed.lessons) {
      console.warn(`⚠️  ${yf}: missing chapter_folder or lessons — skipping`);
      continue;
    }
    if (filter) {
      const pattern = filter.replace(/\*/g, ".*");
      const re = new RegExp(`^${pattern}$`);
      if (!re.test(parsed.chapter_folder)) continue;
    }
    chapters.push(parsed);
  }
  return chapters;
}

(async () => {
  const args = parseArgs(process.argv.slice(2));
  const dryRun = args["dry-run"] === true || args["dry-run"] === "true";
  const execute = args["execute"] === true || args["execute"] === "true";
  const force = args["force"] === true || args["force"] === "true";
  const only = typeof args["only"] === "string" ? (args["only"] as string) : undefined;

  if (!dryRun && !execute) {
    console.error("Usage: --dry-run OR --execute  (optional: --force, --only=Chapter_0*)");
    process.exit(1);
  }

  const voiceId = process.env.ELEVENLABS_VOICE_LAYLA_PT;
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!voiceId || !apiKey) {
    console.error("Missing ELEVENLABS_VOICE_LAYLA_PT or ELEVENLABS_API_KEY");
    process.exit(1);
  }

  const chapters = await loadChapterFiles(only);
  if (chapters.length === 0) {
    console.error("No YAML chapter files found (or filter matched nothing).");
    process.exit(1);
  }

  console.log(`\n📚 Loaded ${chapters.length} chapter file(s)${only ? ` (filter: ${only})` : ""}`);

  let totalLessons = 0;
  let totalChars = 0;
  const plan: Array<{ chapter: string; lesson: string; segments: Segment[]; chars: number }> = [];

  for (const ch of chapters) {
    for (const [lessonName, lesson] of Object.entries(ch.lessons)) {
      const segs = buildSegments(lesson);
      const chars = segs.reduce((s, x) => s + x.text.length, 0);
      plan.push({ chapter: ch.chapter_folder, lesson: lessonName, segments: segs, chars });
      totalLessons++;
      totalChars += chars;
    }
  }

  console.log(`📝 ${totalLessons} lessons · ${totalChars.toLocaleString()} chars total`);
  console.log(`💰 ${((totalChars / 100_000) * 100).toFixed(1)}% of monthly ElevenLabs Creator quota\n`);

  const byChapter = new Map<string, typeof plan>();
  for (const p of plan) {
    const list = byChapter.get(p.chapter) ?? [];
    list.push(p);
    byChapter.set(p.chapter, list);
  }

  for (const [folder, list] of byChapter) {
    const chars = list.reduce((s, x) => s + x.chars, 0);
    console.log(`  📁 ${folder}/ — ${list.length} lessons · ${chars.toLocaleString()} chars`);
    for (const p of list) {
      const outPath = path.join(AUDIO_OUT_DIR, p.chapter, `${p.lesson}.mp3`);
      const exists = await fileExists(outPath);
      const marker = exists ? (force ? "🔁" : "✓") : "·";
      console.log(`     ${marker} ${p.lesson}.mp3 — ${p.segments.length} segments (${p.chars} chars)`);
    }
  }

  if (dryRun) {
    console.log(`\n✅ Dry run complete. Re-run with --execute to generate.\n`);
    return;
  }

  console.log(`\n🚀 Generating audio with Layla (concat + atempo=${ATEMPO_SLOW})\n`);

  let generated = 0, skipped = 0, failed = 0;
  for (const p of plan) {
    process.stdout.write(`  🎙️  ${p.chapter}/${p.lesson}.mp3 (${p.segments.length} segs, ${p.chars} chars)... `);
    try {
      const ch = chapters.find((c) => c.chapter_folder === p.chapter)!;
      const lesson = ch.lessons[p.lesson];
      const result = await generateLesson(p.chapter, p.lesson, lesson, voiceId, apiKey, force);
      if (result.status === "skipped") {
        console.log(`⏭️  exists`);
        skipped++;
      } else {
        console.log(`✅`);
        generated++;
      }
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
