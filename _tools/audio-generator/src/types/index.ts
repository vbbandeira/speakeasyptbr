/**
 * Shared TypeScript types. Source of truth for the structure of manifests,
 * scripts, and run logs. Every CLI imports from here.
 */

import { z } from "zod";

export const StationStatusSchema = z.enum([
  "pending_scripts",
  "pending_audio",
  "pending_qa",
  "pending_postprocess",
  "pending_package",
  "done",
  "failed",
  "blocked",
]);
export type StationStatus = z.infer<typeof StationStatusSchema>;

export const StationModeSchema = z.enum([
  "tts",
  "human_recording",
  "hybrid", // some drills human, most TTS
]);
export type StationMode = z.infer<typeof StationModeSchema>;

export const VoiceKeySchema = z.enum([
  "narrator_pt", // primary female PT-BR (Arí clone / fallback)
  "secondary_pt", // male PT-BR (Bandeira clone / Antonio)
  "narrator_en", // for reels use only — not product
]);
export type VoiceKey = z.infer<typeof VoiceKeySchema>;

export const QualityFlagSchema = z.object({
  drill_id: z.string(),
  reason: z.string(),
  severity: z.enum(["info", "warning", "critical"]),
});
export type QualityFlag = z.infer<typeof QualityFlagSchema>;

export const StationSchema = z.object({
  id: z.string(), // e.g., "M02", "CH01", "D01-D15"
  name: z.string(),
  mode: StationModeSchema,
  prompt_template: z.string().optional(),
  voice: VoiceKeySchema.optional(),
  drills_count: z.number().int().positive().optional(),
  focus_sounds: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: StationStatusSchema.default("pending_scripts"),
  last_run: z.string().nullable().default(null),
  quality_flags: z.array(QualityFlagSchema).default([]),
});
export type Station = z.infer<typeof StationSchema>;

export const AudioFormatSchema = z.object({
  sample_rate: z.number().int().positive().default(44100),
  bitrate_kbps: z.number().int().positive(),
  channels: z.literal(1).or(z.literal(2)).default(1),
  format: z.literal("mp3"),
  normalize_lufs: z.number().default(-16),
});
export type AudioFormat = z.infer<typeof AudioFormatSchema>;

export const VoiceMappingSchema = z.object({
  primary: z.string(), // env var reference like $ELEVENLABS_VOICE_ARI_PT
  fallback: z.string().optional(),
});
export type VoiceMapping = z.infer<typeof VoiceMappingSchema>;

export const BundleSchema = z.object({
  id: z.string(), // "basic", "plus", "pro"
  price_eur: z.number().positive().optional(),
  inherits: z.string().optional(),
  includes_stations: z.array(z.string()).default([]),
  includes_extras: z.array(z.string()).default([]), // paths to PDFs, CSVs
});
export type Bundle = z.infer<typeof BundleSchema>;

export const ManifestSchema = z.object({
  schema_version: z.literal("v1"),
  product: z.string(),
  product_name: z.string(),
  version: z.string().default("v1"),
  voices: z.record(VoiceKeySchema, VoiceMappingSchema),
  audio_format: AudioFormatSchema,
  stations: z.array(StationSchema),
  bundles: z.array(BundleSchema),
});
export type Manifest = z.infer<typeof ManifestSchema>;
