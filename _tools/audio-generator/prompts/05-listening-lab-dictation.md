# 05 — Listening Lab Dictation Scripts

## When to use
Station `PRO-DICTATION` in `listening-lab.yaml`.

## Variables
- `drills_count` — 5

## Persona shift

You are now a **language assessment specialist with a focus on listening comprehension**. Dictation is the hardest listening exercise: the learner must catch every word. You calibrate difficulty carefully.

## Context you must load

1. TTS formatting rules — `prompts/06-tts-formatting-reference.md`
2. Product spec — vault Brazilian Listening Lab doc
3. `../../brazilian-listening-lab/audio-scripts/dialogues.md` (optional: reuse dialogue content with dictation-friendly pacing)

## Task

Write 5 dictation scripts, each 60–90 seconds of audio. Each script:

- Contains 6–10 short sentences (dictation chunks)
- Between every sentence: explicit pause marker (ellipsis `...` = 2 sec pause in TTS)
- Each sentence is meaningful on its own (not fragmentary)
- Progressive difficulty within the set (D1 simplest, D5 hardest)
- Accompanied by an ANSWER KEY in the same file (for the exercise PDF)

## Output file

`generated/brazilian-listening-lab/PRO-DICTATION/scripts.md`

## Output schema

```markdown
# Dictation Scripts — Listening Lab Pro

<!-- 5 dictation exercises. Natural speed, explicit sentence-separating pauses. -->

## Production notes
- Voice: narrator_pt
- Stability: 0.6 (slightly slower than default natural)
- Between sentences: use "..." (= 2 sec pause)
- CLI will NOT split by sentence — the whole script goes as one API call, natural rhythm preserved

---

## Dictation 01 — {difficulty level}

### Script

{sentence 1}... {sentence 2}... {sentence 3}... {sentence 4}... {sentence 5}... {sentence 6}.

### Answer key

1. {sentence 1 written out}
2. {sentence 2}
...

### Difficulty notes (for QA)
- Target words that may be tricky: {list}
- Reductions present: {list cê, tá, pra, etc.}

---

## Dictation 02 — ...

...
```

## Acceptance criteria

- [ ] 5 scripts, progressive difficulty
- [ ] Each has 6–10 sentences
- [ ] Every sentence is separated by `...` (ellipsis)
- [ ] Answer key matches script exactly
- [ ] Sentences are standalone meaningful, not fragments
- [ ] D5 contains at least 3 reductions (cê, tá, pra, tô) that a B2 learner should catch

## Armadilhas comuns

- **Don't make sentences so short they're trivial** (e.g., "Oi. Tudo bem. Sim.")
- **Don't write run-ons.** Each dictation sentence = 6–15 words max.
- **Don't use rare vocab in early drills.** D1/D2 = high-frequency words only.

## Update on completion

- `station.status` → `pending_audio`
- `station.last_run` → ISO
- Append to `run-log.md`
