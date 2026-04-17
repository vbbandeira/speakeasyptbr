# Manifests

Source of truth per product. The **Opus agent** (see `../AGENT.md`) reads these to know what to produce.

## Files

- `everyday.yaml` — Everyday Brazilian Portuguese (102 lessons, narration by Layla)
- `speaking-kit.yaml` — Speaking & Pronunciation Kit (80 drills + extras, TTS + 2 modules human)
- `listening-lab.yaml` — Brazilian Listening Lab (50 dialogues × 2 speeds, TTS 2-voice)

## Schema

Validated at load time against `src/types/index.ts` (ManifestSchema).

Top-level keys:
- `schema_version: v1` — bump if shape changes
- `product` — slug, matches folder name
- `product_name` — human-readable
- `voices` — map of voice keys (`narrator_pt`, `secondary_pt`, `narrator_en`) to env var references
- `audio_format` — sample rate, bitrate, channels, normalize
- `stations` — the production stations (order matters; agent processes in order)
- `bundles` — tier definitions (basic, plus, pro)

## Station fields

| Field | Type | Notes |
|---|---|---|
| `id` | string | Unique, short (e.g., `M02`, `CH01`, `D01`) |
| `name` | string | Human-readable |
| `mode` | `tts` / `human_recording` / `hybrid` | Determines what agent does |
| `prompt_template` | string | Filename in `prompts/` (for `tts`) |
| `voice` | `narrator_pt` / `secondary_pt` | Voice map key |
| `drills_count` | int | How many drills in this station |
| `focus_sounds` | string[] | Hints to the scriptwriter about what to emphasize |
| `notes` | string | Free-form |
| `status` | see StationStatusSchema | Updated by agent; do not edit manually mid-run |
| `last_run` | ISO timestamp / null | Updated by agent |
| `quality_flags` | QualityFlag[] | Drills flagged for QA listen |

## Voice refs

`voices.<key>.primary` is an env var reference like `$ELEVENLABS_VOICE_LAYLA_PT`. The CLI resolves this at runtime.

## Human workflow

- Edit manifests directly to change what's produced
- **Do NOT hand-edit `status` fields** — the agent owns those
- **Do NOT edit during a run** — could cause races
- When adding a new station, match the existing ID pattern for the product
