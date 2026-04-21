#!/usr/bin/env node
/**
 * generate-kit-audio — batch generator for the Speaking & Pronunciation Kit.
 *
 * Reads all .md files in speaking-pronunciation-kit/audio-scripts/,
 * extracts each Lesson's Script block, and calls ElevenLabs (Layla) to
 * produce MP3s organized by chapter folder.
 *
 * Usage:
 *   npm run generate-kit-audio -- --dry-run      # count chars, show plan
 *   npm run generate-kit-audio -- --execute      # actually call the API
 *
 * Idempotent: skips files that already exist on disk.
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "./_args.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "../../../..");
const SCRIPTS_DIR = path.join(REPO_ROOT, "speaking-pronunciation-kit", "audio-scripts");
const AUDIO_OUT_DIR = path.join(REPO_ROOT, "speaking-pronunciation-kit", "audio");

const ELEVENLABS_API = "https://api.elevenlabs.io/v1/text-to-speech";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

interface Lesson {
  filename: string;          // "Lesson_01" or "Phrase_01"
  chapterFolder: string;     // "Chapter_01_Rhythm_Stress" or "Bonus_50_Survival_Phrases"
  title: string;             // header after the filename
  stability: number;         // 0.0-1.0
  scriptText: string;        // the body to feed to ElevenLabs
}

function mdFileToChapterFolder(mdFilename: string): string {
  // "Chapter_01_Rhythm_Stress.md" -> "Chapter_01_Rhythm_Stress"
  return mdFilename.replace(/\.md$/, "");
}

function cleanScriptText(raw: string): string {
  return raw
    // Strip bold **word**
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    // Strip italic *word* or _word_
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    // Strip inline code `word`
    .replace(/`([^`]+)`/g, "$1")
    // Strip any lingering markdown link syntax [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Collapse 3+ newlines to double
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseLessons(mdContent: string, chapterFolder: string): Lesson[] {
  const lessons: Lesson[] = [];
  // Split on `## ` lesson headers; keep only sections that start with Lesson_ or Phrase_
  const sections = mdContent.split(/^## /m);

  for (const section of sections) {
    const headerMatch = section.match(/^(Lesson_\d+|Phrase_\d+)\s*(?:—|-)\s*(.+?)$/m);
    if (!headerMatch) continue;

    const filename = headerMatch[1];
    const title = headerMatch[2].trim();

    // Extract stability from metadata line
    const stabilityMatch = section.match(/\*\*Stability:\*\*\s*([\d.]+)/);
    const stability = stabilityMatch ? parseFloat(stabilityMatch[1]) : 0.5;

    // Extract everything between "### Script" and the next "---" or end
    const scriptMatch = section.match(/###\s*Script\s*\n([\s\S]+?)(?:\n---|\n##\s|$)/);
    if (!scriptMatch) {
      console.warn(`⚠️  No Script section found for ${chapterFolder}/${filename}`);
      continue;
    }

    const scriptText = cleanScriptText(scriptMatch[1]);
    if (scriptText.length < 20) {
      console.warn(`⚠️  Script suspiciously short for ${chapterFolder}/${filename}: ${scriptText.length} chars`);
    }

    lessons.push({ filename, chapterFolder, title, stability, scriptText });
  }

  return lessons;
}

async function discoverAllLessons(): Promise<Lesson[]> {
  const entries = await fs.readdir(SCRIPTS_DIR);
  const mdFiles = entries.filter((f) => f.endsWith(".md")).sort();

  const all: Lesson[] = [];
  for (const md of mdFiles) {
    const chapterFolder = mdFileToChapterFolder(md);
    const content = await fs.readFile(path.join(SCRIPTS_DIR, md), "utf8");
    const lessons = parseLessons(content, chapterFolder);
    all.push(...lessons);
  }
  return all;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function callElevenLabs(voiceId: string, apiKey: string, lesson: Lesson): Promise<Buffer> {
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
        text: lesson.scriptText,
        model_id: MODEL_ID,
        voice_settings: {
          stability: lesson.stability,
          similarity_boost: 0.75,
          style: 0,
          use_speaker_boost: true,
        },
      }),
    });

    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }

    const errText = await response.text().catch(() => "");

    // Retry on 429 (rate limit) or 5xx
    if ((response.status === 429 || response.status >= 500) && attempt < maxAttempts) {
      const backoffMs = 2000 * attempt;
      console.warn(`  ⏳ ${response.status} on attempt ${attempt}, retrying in ${backoffMs}ms...`);
      await sleep(backoffMs);
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

  if (!dryRun && !execute) {
    console.error("Usage: --dry-run OR --execute");
    process.exit(1);
  }

  const voiceId = process.env.ELEVENLABS_VOICE_LAYLA_PT;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!voiceId) {
    console.error("ELEVENLABS_VOICE_LAYLA_PT not set");
    process.exit(1);
  }
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY not set");
    process.exit(1);
  }

  const lessons = await discoverAllLessons();
  const totalChars = lessons.reduce((sum, l) => sum + l.scriptText.length, 0);

  console.log(`\n📚 Discovered ${lessons.length} lessons from ${path.relative(REPO_ROOT, SCRIPTS_DIR)}`);
  console.log(`📝 Total characters: ${totalChars.toLocaleString()}`);
  console.log(`💰 ElevenLabs Creator plan quota: 100,000 chars/month`);
  console.log(`📊 This run uses: ${((totalChars / 100000) * 100).toFixed(1)}% of monthly quota\n`);

  // Group by chapter for display
  const byChapter = new Map<string, Lesson[]>();
  for (const l of lessons) {
    const list = byChapter.get(l.chapterFolder) ?? [];
    list.push(l);
    byChapter.set(l.chapterFolder, list);
  }

  for (const [folder, list] of byChapter) {
    const chapterChars = list.reduce((s, l) => s + l.scriptText.length, 0);
    console.log(`  📁 ${folder}/ — ${list.length} lessons · ${chapterChars.toLocaleString()} chars`);
    for (const l of list) {
      const outPath = path.join(AUDIO_OUT_DIR, folder, `${l.filename}.mp3`);
      const exists = await fileExists(outPath);
      const marker = exists ? "✓" : "·";
      console.log(`     ${marker} ${l.filename}.mp3 (${l.scriptText.length} chars, stability ${l.stability})`);
    }
  }

  if (dryRun) {
    console.log(`\n✅ Dry run complete. Re-run with --execute to generate MP3s.\n`);
    return;
  }

  // Execute mode
  console.log(`\n🚀 Generating audio with Layla (voice_id: ${voiceId.slice(0, 10)}...)\n`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const lesson of lessons) {
    const outDir = path.join(AUDIO_OUT_DIR, lesson.chapterFolder);
    const outPath = path.join(outDir, `${lesson.filename}.mp3`);

    if (await fileExists(outPath)) {
      console.log(`  ⏭️  ${lesson.chapterFolder}/${lesson.filename}.mp3 exists — skipped`);
      skipped++;
      continue;
    }

    await fs.mkdir(outDir, { recursive: true });

    process.stdout.write(`  🎙️  ${lesson.chapterFolder}/${lesson.filename}.mp3 (${lesson.scriptText.length} chars)... `);

    try {
      const audio = await callElevenLabs(voiceId, apiKey, lesson);
      await fs.writeFile(outPath, audio);
      const kb = Math.round(audio.length / 1024);
      console.log(`✅ ${kb}KB`);
      generated++;

      // Light rate-limit friendliness
      await sleep(400);
    } catch (err) {
      console.log(`❌ ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Generated: ${generated}`);
  console.log(`   Skipped (already existed): ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Output: ${path.relative(REPO_ROOT, AUDIO_OUT_DIR)}/\n`);

  if (failed > 0) {
    process.exit(1);
  }
})().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
