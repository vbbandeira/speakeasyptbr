# Audio Generator

Production line for SpeakEasy Portuguese product audio. Built to be **driven by a Claude Code Opus session** in a separate window (the "production session"), not operated manually.

**This folder is a tool, not a product.** It generates the audio deliverables for the 3 products in this repo (everyday-brazilian-portuguese, speaking-pronunciation-kit, brazilian-listening-lab).

## How it works

A Claude Code Opus session reads [`AGENT.md`](./AGENT.md), loads a product manifest from [`manifests/`](./manifests/), and walks station-by-station generating scripts, invoking CLIs to produce audio, and packaging deliverables.

```
Production Session (Claude Code Opus)
          ↓
 Reads AGENT.md + manifest
          ↓
 For each station:
   ├─ Loads sub-prompt (prompts/NN-*.md)
   ├─ Generates script Markdown → generated/<station>/scripts.md
   ├─ Invokes generate-audio CLI → ElevenLabs → .wav masters
   ├─ Invokes post-process CLI → MP3 delivery format
   └─ Updates manifest status
          ↓
 Final: invokes package CLI → delivery/<tier>.zip
          ↓
 Hands back to human: "Upload to Lemon Squeezy"
```

## First-time setup (human)

1. **Install deps**
   ```bash
   cd _tools/audio-generator
   npm install
   ```

2. **System deps** (already needed for other tools)
   - Node 20+
   - `ffmpeg` on PATH

3. **Configure `.env`**
   ```bash
   cp .env.example .env
   # Edit .env — see MANUAL-STEPS in each product for voice_id values
   ```

4. **Smoke test after voice setup**
   ```bash
   npm run test-voice -- --voice ari_pt --text "banho. ba-nho. banho."
   ```
   If you hear clear audio with correct pronunciation, the pipeline is ready.

## Starting a production session

Open a new Claude Code window (**Opus model**, Max plan) pointing to the `speakeasyptbr-products` repo. First command:

```
Read _tools/audio-generator/AGENT.md and follow it.
Then execute production for <PRODUCT> Phase 1 (scripts).
Stop and report when done.
```

Replace `<PRODUCT>` with one of:
- `everyday-brazilian-portuguese`
- `speaking-pronunciation-kit`
- `brazilian-listening-lab`

After reviewing the script output, the next command is:

```
Proceed to Phase 2 (audio generation) for <PRODUCT>. Report with QA summary.
```

And so on through Phase 3 (QA) and Phase 4 (packaging).

## Phases overview

| Phase | What happens | Who drives |
|---|---|---|
| **1 — Scripts** | Generate Markdown scripts for every drill/lesson/dialogue | Opus agent (in-session) |
| **2 — Audio** | Batch call ElevenLabs API, save WAV masters | Opus invokes `generate-audio` CLI |
| **3 — QA** | Opus reviews output metadata, flags suspicious drills for human listen | Opus + human |
| **4 — Package** | Normalize, encode MP3, bundle into tier ZIPs | Opus invokes `post-process` + `package` CLIs |

## Folder structure

```
audio-generator/
├── README.md                ← this file (human reads first)
├── AGENT.md                 ← ⭐ Opus system prompt (agent contract)
├── package.json
├── tsconfig.json
├── .env.example
│
├── manifests/               ← source of truth per product
│   ├── everyday.yaml
│   ├── speaking-kit.yaml
│   └── listening-lab.yaml
│
├── prompts/                 ← sub-prompt library (loaded by agent dynamically)
│   ├── README.md
│   └── NN-*.md             ← 13 templates, one per task type
│
├── src/
│   ├── cli/                ← invokable by agent (and by humans for testing)
│   │   ├── test-voice.ts        # smoke test: 1 voice, 1 phrase
│   │   ├── generate-audio.ts    # ElevenLabs batch (reads a station's scripts.md)
│   │   ├── post-process.ts      # ffmpeg trim + normalize + encode
│   │   └── package.ts           # zip builder per tier
│   ├── pipeline/
│   │   └── _utils/              # paths, log, retry, fs, yaml loader
│   └── types/                   # shared TS types
│
└── generated/               ← outputs per run (gitignored)
    └── <product>/
        └── <station>/
            ├── scripts.md            # Phase 1 output
            ├── audio/*.wav           # Phase 2 output (masters)
            ├── audio-final/*.mp3     # Phase 4 output (delivery)
            └── run-log.md            # what the agent did
```

## Why this design

- **Agent does the thinking** (scripts, QA), CLIs do the grunt work (API, ffmpeg, zip)
- **Manifests are YAML, not code** — humans can edit, agent reads, nothing gets out of sync
- **Sub-prompts in Markdown** — version-controlled, reviewable, reusable
- **No orchestrator script** — the Opus session IS the orchestrator
- **Idempotent** — rerun skips done stations, retries failed ones

## See also

- [`AGENT.md`](./AGENT.md) — what the Opus session reads to know who it is
- [`prompts/README.md`](./prompts/README.md) — how sub-prompts are organized
- [`manifests/README.md`](./manifests/README.md) — manifest format explained
- Vault canonical: `[vault]/10 - Projects/SpeakEasy Portuguese/Content Generator/Architecture/Stack Decisions.md`
