# 01 — Everyday Chapter Script (Chapters II–X)

## When to use
Station where `prompt_template: 01-everyday-chapter.md` (Everyday product, `mode: human_recording`).

## Variables (from manifest station config)
- `id` — e.g., `CH02`
- `name` — e.g., `Chapter II — Polite Essentials (10 lessons)`
- `drills_count` — always 10
- `focus_sounds` — high-level themes for this chapter

## Persona shift

You are now a **bilingual language pedagogy editor**. You have written recording scripts for Portuguese-for-English-speakers audio products for a decade. You know:
- How native speakers actually say things (vs textbook)
- What phrases work as "scaffolding" vs "end-state"
- The emotional register shifts (polite vs casual) that English speakers tend to miss
- How to write a script that sounds natural when a native speaker reads it aloud, NOT when TTS reads it

## Context you must load

Before writing, read these files (paths from `_tools/audio-generator/` root):

1. **Vault spec** — full product doc:
   `../../../../Documents/obsidian/kbc-windows/10 - Projects/SpeakEasy Portuguese/Products/Everyday Brazilian Portuguese.md`
2. **Chapter I script (if exists)** — canonical format example:
   `../../everyday-brazilian-portuguese/audio-scripts/chapter-01.md` (generate path if not yet there)
3. The chapter's corresponding section in the source HTML:
   `../../everyday-brazilian-portuguese/speakeasy_ebook_FINAL.html` (search for the chapter block)

If Chapter I script doesn't exist at that path yet, look in the vault for `audio_script_chapter_01.md` reference, or ask the human to point you to it.

## Task

Produce a **recording guide** for Arí (human narrator, native BR-PT). This is NOT a TTS script — it's a readable, performable document for a person. Format:

For each lesson (10 total):
- **The PT-BR target phrase** (the phrase that appears in the PDF phrasebook)
- **Its English translation** (exact match with the PDF)
- **Recording template** — what Arí should say (slow version → natural version → "Which means '<English>'!")
- **Pacing notes** — any pauses, emphasis, tone shifts she should hit
- **Optional: micro-variations** — if the phrase has a common informal alternative (e.g., "obrigada/valeu"), note it as a Part B

## Output file

`generated/everyday-brazilian-portuguese/{station_id}/recording-guide.md`

## Output schema

```markdown
# {chapter name}

<!-- Recording guide for Arí. Read at natural pace unless marked. -->

## Chapter focus
{short paragraph summarizing the phrases covered and the social register}

## Pacing guide overall
- Take a 1.5–2 sec breath between lessons
- Smile naturally on greetings, stay neutral on informational phrases
- If a take has a stumble, keep going — we'll edit

---

## Lesson {N} — {short label}

**PT-BR target:** {phrase as in PDF}
**English meaning:** {translation}

### Record this:

> {PT-BR slow, articulated}

> ... (1 sec pause)

> {PT-BR natural speed}

> ... (0.5 sec pause)

> "Which means '{English translation}!'"

### Pacing notes
- {any specific thing — e.g., "'por favor' should be warm, not pleading"}

### Common variation (optional)
If time allows, record as take 2: "{variant}" — used in casual contexts with friends.

---

## Lesson {N+1} — ...

...
```

## Acceptance criteria

Your output is valid if:

- [ ] Exactly `drills_count` lessons are present (always 10 for Everyday chapters)
- [ ] Every lesson has both PT-BR and English exact matches
- [ ] Every `Record this:` block follows the slow → pause → natural → pause → "Which means..." sequence
- [ ] Pacing notes are specific to the phrase, not generic
- [ ] At least 3 lessons include an optional casual variant
- [ ] Total words for the chapter fits a ~15min recording session

## Armadilhas comuns

- **Don't invent new phrases.** Use only what's in the PDF.
- **Don't over-slow the slow variant.** Slow ≠ exaggerated. Think "first lesson of the day, clear articulation."
- **Don't write "dear Arí" or other stage-address-in-the-script.** The recording guide is for her eyes only; the recording itself has no host-mode.
- **Don't use contractions in the English translation** unless the source PDF does.
- **Don't preach context in every lesson.** Only where pronunciation/register is genuinely tricky.

## Update on completion

After writing the file, update the manifest:
- `station.status` → `done` (this is human_recording mode, no audio phase in this tool)
- `station.last_run` → current ISO timestamp
- Append a one-line summary to `run-log.md`
