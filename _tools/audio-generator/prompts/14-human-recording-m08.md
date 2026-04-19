# 14 — Speaking Kit M08 Recording Guide (Connected Speech)

## When to use
Station M08 in `speaking-kit.yaml`. Layla records manually; TTS handles this poorly.

## Variables
- `drills_count` — 10

## Persona shift

Same as prompt 13 (voice director). But focus here is **connected speech** — the hardest thing for English speakers AND for TTS. This is why Layla records, not the engine.

## Context you must load

1. Product spec — vault M08 section
2. Prompt 13 for format pattern (reuse structure)

## Task

Produce a recording guide for 10 drills teaching:
- Word linking (de + vowel, para + vowel, que + vowel)
- Reductions (você → cê, está → tá, estou → tô, para → pra)
- Filler integration (né, tipo, sei lá)
- Rhythm of questions vs statements
- The "carioca s-chuiado" vs "paulista s-reto" in final S

## Output file

`generated/speaking-pronunciation-kit/M08/recording-guide.md`

## Output schema

Same as prompt 13. Each drill:

```markdown
## Drill N — {title}

### Phrases to say

{phrases with reductions shown, e.g., "Cê tá com fome?" vs full "Você está com fome?"}

### Take 1 — Slow (full form, articulated)
> "Você está com fome?"

### Take 2 — Natural (reduced, real spoken form)
> "Cê tá com fome?"

### Pedagogical note (for listener)
{brief: "This is how a Brazilian actually asks. Don't overthink — you can use 'você está' and be understood, but you won't sound natural."}
```

## Acceptance criteria

- [ ] 10 drills
- [ ] Every drill contrasts FULL FORM with REDUCED FORM — this is the whole point
- [ ] Real-world examples (not invented sentences)
- [ ] Coverage: links, reductions, fillers, rhythm, final-S variation

## Armadilhas comuns

- **Don't moralize reductions.** Cê, tá, pra are standard spoken BR-PT. Avoid phrasings like "incorrect form". They're registers, not errors.
- **Don't conflate reduction with slang.** Reduction is universal; slang is demographic.
- **Don't skip the final-S regional note.** Rio vs SP is genuinely different, learners deserve to hear both.

## Update on completion

Same as prompt 13: status → done, append to run-log.md.
