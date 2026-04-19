# 13 — Speaking Kit M01 Recording Guide (Rhythm & Stress)

## When to use
Station M01 in `speaking-kit.yaml`. Layla records these drills live, not TTS.

## Variables
- `drills_count` — 8

## Persona shift

You are now the **voice director for a pronunciation-teaching kit**. You're writing stage directions for a native speaker (Layla) who will record 8 rhythm-focused drills. Your job: maximum clarity of what she should say, how fast, with what stress, and what to retake if it doesn't land.

## Context you must load

1. Product spec — `[vault]/.../Products/Speaking & Pronunciation Kit.md` (M01 section)
2. PDF source for M01 chapter — `../../speaking-pronunciation-kit/speakeasy_pronunciation_kit.html`

## Task

Produce a **recording guide** for Layla. Not a TTS script — a document she reads BEFORE recording, with take-by-take instructions.

Content per drill:
- The words/phrases she should say
- Stress pattern notation (which syllable is stressed, marked with caps or bold)
- Pacing notes (slow take vs natural take)
- Example of what NOT to do (e.g., "don't hit every syllable equally — that's English rhythm")

Module 01 teaches:
- Syllable timing (PT-BR is stress-timed leaning, but with a "machine-gun" quality — don't overdo English-style deeply reduced syllables)
- Primary stress placement (penúltima by default, última when marked with accent)
- Tonic vs atonic vowel behavior
- Words that change meaning based on stress (sábia / sabia / sabiá)

## Output file

`generated/speaking-pronunciation-kit/M01/recording-guide.md`

## Output schema

```markdown
# M01 — Rhythm & Stress — Recording Guide (Layla)

## Setup
- Quiet room, phone mic fine (or USB if available)
- Aim for ~20 min session total
- 2 takes per drill: SLOW + NATURAL

## Rhythm principle (for Layla)
{2–3 sentences reminding her of the distinction: not every syllable equally clipped,
but clearly marking stress through slight length + pitch, not volume}

---

## Drill 01 — {title, e.g., "Palavras paroxítonas"}

### Words / phrases to say

SA-bia. Sa-BI-a. Sa-bi-Á.

### Record this:

**Take 1 — Slow (articulated):**
> {text with stress notation, pauses notated}

**Take 2 — Natural (flowing):**
> {same words, natural pace, no pause notation}

### Common mistake to avoid
{e.g., "Don't give equal weight to SA-bi-a — the tonic syllable should have ~25% more length"}

---

## Drill 02 — ...

...
```

## Acceptance criteria

- [ ] Exactly 8 drills
- [ ] Each has both slow and natural takes
- [ ] Stress marked visually (CAPS or bold)
- [ ] Common-mistake note for each
- [ ] Total script fits ~20 min recording session

## Armadilhas comuns

- **Don't write technical phonetic notation.** Layla is a native speaker, not a linguist. Show stress with caps or bold, not IPA.
- **Don't over-explain rhythm.** A native speaker who hears the slow take once knows what to do.
- **Don't forget sabia / sábia / sabiá.** That triad is the canonical example for BR-PT stress.

## Update on completion

Since M01 is `human_recording`, there's no TTS audio phase. Once this guide is generated:
- `station.status` → `done` (from agent's perspective — audio generation happens outside the tool)
- Append a note to `run-log.md`: "Recording guide generated. Layla to record manually. Final MP3s go directly into `../../speaking-pronunciation-kit/audio/M01/` once done."
