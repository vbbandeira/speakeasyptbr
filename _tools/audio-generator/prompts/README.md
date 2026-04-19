# Sub-prompts

Each file here is a **sub-prompt** loaded dynamically by the Opus agent (see `../AGENT.md`) when it processes a station. Think of them as **mini-personas + task contracts** the agent adopts for specific output types.

## How they are used

The agent reads:
1. `AGENT.md` (main persona and loop)
2. The product manifest
3. For each station, the `prompt_template` file listed

So the agent's effective prompt = base persona + station context + sub-prompt. Different sub-prompts mean the agent briefly specializes (phonetician for Speaking Kit, dialogue writer for Listening Lab, pedagogue for daily lessons).

## Files

| # | File | Used for |
|---|---|---|
| 01 | `01-everyday-chapter.md` | Everyday product — chapters II–X recording guides for Layla |
| 02 | `02-speaking-kit-module.md` | Speaking Kit — TTS drills M02–M07 + Bonus |
| 03 | `03-listening-lab-dialogue.md` | Listening Lab dialogues + Speaking Kit Mini-Pack + Booster |
| 04 | `04-listening-lab-podcast.md` | Listening Lab Pro — 5 mini-podcasts (cultural monologues) |
| 05 | `05-listening-lab-dictation.md` | Listening Lab Pro — 5 dictation tracks |
| 06 | `06-tts-formatting-reference.md` | **Not a station prompt** — a reference loaded alongside any TTS generation |
| 07 | `07-cloning-sample-layla.md` | Script for Layla's ElevenLabs voice cloning sample |
| 08 | `08-cloning-sample-male-optional.md` | Script for Bandeira's ElevenLabs voice cloning sample |
| 09 | `09-speaking-kit-top-50-mistakes.md` | Plus extra — "Top 50 Mistakes for English Speakers" PDF content |
| 10 | `10-speaking-kit-21-day-plan.md` | Pro extra — 21-day fluency plan |
| 11 | `11-speaking-scripts-pack.md` | Pro extra — 200 mini speaking scripts |
| 12 | `12-flashcards-csv.md` | Plus extra (shared) — Anki/Quizlet CSV generator |
| 13 | `13-human-recording-m01.md` | Speaking Kit M01 — recording guide for Layla (Rhythm & Stress) |
| 14 | `14-human-recording-m08.md` | Speaking Kit M08 — recording guide for Layla (Connected Speech) |
| 15 | `15-listening-lab-cultural-notes.md` | Plus/Pro extra — cultural context notes per dialogue |
| 16 | `16-listening-lab-slang-reductions.md` | Pro extra — Brazilian Slang & Reductions Guide |
| 17 | `17-listening-lab-regional-accents.md` | Pro extra — Regional Accents Overview |
| 18 | `18-listening-lab-traps.md` | Plus extra — Top 30 Listening Traps for English Speakers |

## Convention

Every sub-prompt follows the structure:

```markdown
# Sub-prompt NN — <title>

## When to use
<manifest condition>

## Variables (from manifest)
- var1: description
- var2: description

## Persona shift
<how the agent's persona specializes>

## Context you must load
<other files to read before writing>

## Task
<what to produce>

## TTS formatting rules (if applicable)
<inline or reference to 06-tts-formatting-reference.md>

## Output file
<path where to write the output>

## Output schema
<exact Markdown structure expected>

## Acceptance criteria
<checklist the agent runs against its own output>

## Armadilhas comuns
<common pitfalls to avoid>
```

## Principle

Sub-prompts are **designed once, executed many times**. Never modify during a run. If you find the agent producing bad output, fix the sub-prompt, don't patch individual outputs.
