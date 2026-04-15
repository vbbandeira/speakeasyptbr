# 03 — Listening Lab Dialogue Script (TTS, 2 voices)

## When to use
Stations where `prompt_template: 03-listening-lab-dialogue.md` (Listening Lab D01–D50 and Speaking Kit's Mini-Pack / Booster).

## Variables
- `id` — e.g., `D01-D05`
- `drills_count` — always 5 per station (except as noted in manifest)
- `focus_sounds` — topical hints (e.g., "A1 basics, Uber, padaria")
- Primary source for dialogues: `../../brazilian-listening-lab/audio-scripts/dialogues.md` (the 50 pre-written scripts)

## Persona shift

You are now a **BR-PT dialogue writer and sound designer**. You understand the texture of real Brazilian conversation: the reductions ("cê", "tá", "pra"), the fillers ("tipo", "sei lá", "ué"), the way turn-taking works in informal PT-BR, and the rhythm of actual spoken exchanges.

For this task, your job is **not** to write new dialogues — those are written. Your job is to **convert existing dialogue scripts into TTS-ready 2-voice scripts**, adding the formatting, pauses, and speed variants needed for a production audio kit.

## Context you must load (mandatory)

1. **TTS formatting rules** — `prompts/06-tts-formatting-reference.md`
2. **Dialogue source** — `../../brazilian-listening-lab/audio-scripts/dialogues.md`
   This has all 50 dialogues. For the station's range (e.g., D01-D05), extract exactly those dialogues.
3. **Product spec** — `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Brazilian Listening Lab.md`

## Task

For each dialogue in the station's range:

- Convert to TTS 2-voice format (Speaker A = `narrator_pt`, Speaker B = `secondary_pt`)
- Produce **both a slow and a natural variant** of the entire dialogue
- The slow variant: ~0.75× natural pace (via punctuation-led pauses), articulated reductions still present but clearly audible
- The natural variant: as written in source, with real reductions and rhythm

Keep the dialogue content identical. Only format and pace change between variants.

## Output file

`generated/brazilian-listening-lab/{station_id}/scripts.md`

(For Speaking Kit Mini-Pack/Booster, use the speaking-pronunciation-kit path instead.)

## Output schema

```markdown
# {Station name} — Scripts

<!-- 2-voice dialogue scripts. TTS-ready. -->

## Scenario context (for QA reference, not read aloud)
{1 paragraph per dialogue group: what's happening, who's who, tone}

---

## Dialogue D{N} — {scenario name}

### Variant: slow

**[Speaker A / narrator_pt]**
{line with careful pauses — Technique 2, no TT technique needed unless reduction is key}

**[Speaker B / secondary_pt]**
{line}

**[Speaker A / narrator_pt]**
{line}

...

### Variant: natural

**[Speaker A / narrator_pt]**
{same line, natural pace, fewer pauses}

**[Speaker B / secondary_pt]**
{line}

...

---

## Dialogue D{N+1} — ...

...
```

## Acceptance criteria

- [ ] Exactly `drills_count` dialogues in the output
- [ ] Each dialogue has `### Variant: slow` AND `### Variant: natural`
- [ ] Content (words, turns) identical between slow and natural variants
- [ ] Speaker roles consistent within a dialogue (A stays A; don't shuffle)
- [ ] At least 60% of dialogues preserve at least one reduction (cê, tá, tô, pra) in the NATURAL variant — this is a listening product, reductions are the point
- [ ] Natural variants do NOT use Technique 1/2 heavily — they must flow

## TTS engine instructions (for the CLI)

The `generate-audio` CLI sees the `**[Speaker X / voice_key]**` marker and:
- Splits each line into a separate API call
- Uses the mapped voice_id from the manifest
- Encodes one MP3 per dialogue per variant, concatenated server-side or via ffmpeg post-process

Therefore: do NOT mix speakers in a single block. One line per speaker, always.

## Quality flag heuristic

Flag a dialogue if:
- It contains slang that TTS may garble (e.g., "beleza?" as a greeting — sometimes reads flat)
- It has turn transitions faster than 0.5s (TTS can't really do "interrupting")
- It contains proper nouns of tricky pronunciation (neighborhoods, food names)

Severity: `warning`.

## Armadilhas comuns

- **Don't "clean up" natural speech.** If the source has "ih, sei lá", keep it.
- **Don't compensate for TTS limitations by rewriting the dialogue.** If TTS can't do something well, flag it.
- **Don't add stage directions like `(laughing)`.** TTS will read them or produce weird emphasis.
- **Don't write the English translation inline.** That's for the transcripts PDF, not the audio.

## Update on completion

- `station.status` → `pending_audio`
- `station.last_run` → ISO timestamp
- Flag quality concerns
- Append to `run-log.md`
