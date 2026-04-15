#!/usr/bin/env node
/**
 * test-voice — smoke test. Generate 1 MP3 from 1 voice + 1 phrase.
 *
 *   npm run test-voice -- --voice ari_pt --text "banho. ba-nho. banho."
 */

import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs, requireStr, optionalStr } from "./_args.js";
import { createLogger } from "@/pipeline/_utils/log.js";
import { ensureDir } from "@/pipeline/_utils/fs.js";
import { GENERATED_DIR } from "@/pipeline/_utils/paths.js";

const log = createLogger("test-voice");

const VOICE_MAP: Record<string, string | undefined> = {
  ari_pt: process.env.ELEVENLABS_VOICE_ARI_PT,
  bandeira_pt: process.env.ELEVENLABS_VOICE_BANDEIRA_PT,
  valentina_pt: process.env.ELEVENLABS_VOICE_VALENTINA_PT,
  fernanda_pt: process.env.ELEVENLABS_VOICE_FERNANDA_PT,
  antonio_pt: process.env.ELEVENLABS_VOICE_ANTONIO_PT,
};

const args = parseArgs(process.argv.slice(2));
const voiceKey = requireStr(args, "voice", "(e.g., ari_pt)");
const text = requireStr(args, "text", '(e.g., "banho. ba-nho. banho.")');
const stability = Number(optionalStr(args, "stability") ?? "0.5");
const outDir = path.join(GENERATED_DIR, "_smoke");
const outPath = path.join(outDir, `${voiceKey}-${Date.now()}.mp3`);

(async () => {
  const voiceId = VOICE_MAP[voiceKey];
  if (!voiceId) {
    console.error(
      `Unknown voice key: ${voiceKey}. Known: ${Object.keys(VOICE_MAP).join(", ")}.\n` +
        `Is the corresponding env var set in .env?`,
    );
    process.exit(1);
  }
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("ELEVENLABS_API_KEY not set in .env");
    process.exit(1);
  }

  await ensureDir(outDir);
  log.info("Calling ElevenLabs", { voiceKey, voiceId: voiceId.slice(0, 10) + "…", chars: text.length });

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
    console.error(`ElevenLabs API error ${response.status}: ${errText.slice(0, 500)}`);
    process.exit(1);
  }

  const buf = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outPath, buf);

  const sizeKb = Math.round(buf.length / 1024);
  log.info("OK", { outPath, sizeKb, stability, modelId });
  console.log(`\n✅ Audio saved to: ${outPath}\nOpen it to listen.\n`);
})().catch((err) => {
  console.error("smoke test failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
