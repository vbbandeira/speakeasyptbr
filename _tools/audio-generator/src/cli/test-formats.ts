#!/usr/bin/env node
/**
 * test-formats — generate 4 variants of a short test snippet to compare
 * format, pacing, and pronunciation strategies before committing to a
 * full regeneration of the Speaking & Pronunciation Kit.
 *
 * Output: _tools/audio-generator/generated/_format-tests/
 *
 * Each variant uses the SAME core content but different settings:
 *   take_1_baseline         — stability 0.5, normal spelling (current)
 *   take_2_low_stability    — stability 0.35 (more natural, less robotic)
 *   take_3_phonetic_respell — stability 0.5 + 'casa'→'caza', 'escola'→'iscola'
 *   take_4_ssml_breaks      — stability 0.5 + explicit <break> pauses
 *
 * Usage:
 *   npm run test-formats
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT_DIR = path.resolve(__dirname, "../../generated/_format-tests");

const ELEVENLABS_API = "https://api.elevenlabs.io/v1/text-to-speech";
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

interface Variant {
  name: string;
  text: string;
  stability: number;
  speed?: number;
  description: string;
}

/*
 * Core content: small snippet that tests the new user-requested format
 * (Portuguese first → natural, then slow, then "which means..." in English)
 * AND the known pronunciation issues ("casa" → "caça", "escola" → "IEscola").
 */

const variants: Variant[] = [
  {
    name: "take_1_baseline",
    stability: 0.5,
    description: "Baseline — stability 0.5, normal Portuguese spelling",
    text: `Oi. Oi.
O... i...
Which means: hi.

Olá. Olá.
O... lá...
Which means: hello.

Eu vou para casa.
Eu vou... para ca-sa.
Which means: I'm going home.

A escola é perto.
A es-co-la é perto.
Which means: the school is close.`,
  },
  {
    name: "take_2_low_stability",
    stability: 0.35,
    description: "Lower stability 0.35 — more natural variation, less robotic",
    text: `Oi. Oi.
O... i...
Which means: hi.

Olá. Olá.
O... lá...
Which means: hello.

Eu vou para casa.
Eu vou... para ca-sa.
Which means: I'm going home.

A escola é perto.
A es-co-la é perto.
Which means: the school is close.`,
  },
  {
    name: "take_3_phonetic_respell",
    stability: 0.5,
    description: "Phonetic respelling — casa→caza, escola→iscola",
    text: `Oi. Oi.
O... i...
Which means: hi.

Olá. Olá.
O... lá...
Which means: hello.

Eu vou para caza.
Eu vou... para ca-za.
Which means: I'm going home.

A iscola é perto.
A is-co-la é perto.
Which means: the school is close.`,
  },
  {
    name: "take_4_ssml_breaks",
    stability: 0.5,
    description: "Explicit pauses via ellipses and em-dashes for slower delivery",
    text: `Oi... Oi.
O — i.
Which means... hi.

Olá... Olá.
O — lá.
Which means... hello.

Eu vou para casa.
Eu vou — para — ca-sa.
Which means... I'm going home.

A escola é perto.
A — es-co-la — é perto.
Which means... the school is close.`,
  },
  {
    name: "take_5_respell_plus_breaks",
    stability: 0.5,
    description: "WINNER BASE (respell) + explicit <break> tags between examples",
    text: `Oi. <break time="1s" /> Oi. <break time="1.2s" /> O... i. <break time="0.8s" /> Which means: hi. <break time="2s" /> Olá. <break time="1s" /> Olá. <break time="1.2s" /> O... lá. <break time="0.8s" /> Which means: hello. <break time="2s" /> Eu vou para caza. <break time="1.2s" /> Eu vou para ca... za. <break time="0.8s" /> Which means: I'm going home. <break time="2s" /> A iscola é perto. <break time="1.2s" /> A is... co... la é perto. <break time="0.8s" /> Which means: the school is close.`,
  },
  {
    name: "take_6_respell_breaks_slow",
    stability: 0.5,
    speed: 0.85,
    description: "Take 5 + speed: 0.85 (experimental — slow down to ~0.85x if v2 supports it)",
    text: `Oi. <break time="1s" /> Oi. <break time="1.2s" /> O... i. <break time="0.8s" /> Which means: hi. <break time="2s" /> Olá. <break time="1s" /> Olá. <break time="1.2s" /> O... lá. <break time="0.8s" /> Which means: hello. <break time="2s" /> Eu vou para caza. <break time="1.2s" /> Eu vou para ca... za. <break time="0.8s" /> Which means: I'm going home. <break time="2s" /> A iscola é perto. <break time="1.2s" /> A is... co... la é perto. <break time="0.8s" /> Which means: the school is close.`,
  },
  {
    name: "take_7_plain_double_utterance",
    stability: 0.5,
    description: "Plain text, no breaks, double-utterance natural, paragraph spacing for pauses",
    text: `Oi. Oi.
Which means: hi.


Olá. Olá.
Which means: hello.


Eu vou para caza. Eu vou para caza.
Which means: I'm going home.


A iscola é perto. A iscola é perto.
Which means: the school is close.`,
  },
];

async function generateVariant(variant: Variant, voiceId: string, apiKey: string): Promise<void> {
  const url = `${ELEVENLABS_API}/${voiceId}?output_format=mp3_44100_128`;
  const outPath = path.join(OUT_DIR, `${variant.name}.mp3`);

  console.log(`\n🎙️  ${variant.name}`);
  console.log(`   ${variant.description}`);
  console.log(`   chars: ${variant.text.length}, stability: ${variant.stability}`);

  const voiceSettings: Record<string, number | boolean> = {
    stability: variant.stability,
    similarity_boost: 0.75,
    style: 0,
    use_speaker_boost: true,
  };
  if (typeof variant.speed === "number") {
    voiceSettings.speed = variant.speed;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: variant.text,
      model_id: MODEL_ID,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error(`   ❌ ${response.status}: ${errText.slice(0, 300)}`);
    return;
  }

  const audio = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outPath, audio);
  const kb = Math.round(audio.length / 1024);
  console.log(`   ✅ ${kb}KB → ${path.relative(process.cwd(), outPath)}`);
}

(async () => {
  const voiceId = process.env.ELEVENLABS_VOICE_LAYLA_PT;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!voiceId || !apiKey) {
    console.error("Missing ELEVENLABS_VOICE_LAYLA_PT or ELEVENLABS_API_KEY");
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  console.log(`\n🧪 Generating ${variants.length} format variants for A/B comparison`);
  console.log(`   Voice: Layla (${voiceId.slice(0, 10)}...)`);
  console.log(`   Output: ${path.relative(process.cwd(), OUT_DIR)}/`);

  const totalChars = variants.reduce((s, v) => s + v.text.length, 0);
  console.log(`   Total chars: ${totalChars} (~${(totalChars / 100000 * 100).toFixed(2)}% of monthly quota)\n`);

  for (const variant of variants) {
    await generateVariant(variant, voiceId, apiKey);
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\n📊 Done. Listen to all 4 takes and tell me which sounds best.\n`);
  console.log(`   Files:`);
  for (const v of variants) {
    console.log(`   - ${v.name}.mp3 (${v.description})`);
  }
})().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
