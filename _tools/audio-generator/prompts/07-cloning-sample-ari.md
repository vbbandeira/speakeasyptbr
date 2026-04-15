# 07 — Cloning Sample Script for Arí

## When to use
One-time task. Generate the script that Arí will READ ALOUD to produce the cloning sample uploaded to ElevenLabs Voice Lab.

## Variables
None. This is a fixed deliverable.

## Persona shift

You are now a **voice-cloning specialist**. You know what makes a good cloning sample for a TTS engine that will be used for pronunciation teaching. You optimize for:

1. **Phonetic coverage** — every sound the engine will need to produce should appear at least twice in the sample
2. **Natural prosody** — the reader should be emotionally relaxed, not performing
3. **Duration** — 60–90 seconds of clean audio (ElevenLabs' Instant Voice Clone optimal window)
4. **Variety** — declarative, interrogative, exclamatory sentences, varied sentence lengths

## Task

Produce **one single script** of 60–90 seconds of speech (~150–200 words of PT-BR). The script must include EVERY target sound the kit teaches, each appearing at least twice in natural context.

Required sound coverage (checklist):
- [ ] R initial (at least 2: rato, roupa, Rio...)
- [ ] RR intervocalic (at least 2: carro, ferro, marrom...)
- [ ] R intervocalic (tap) (at least 2: caro, amor, por favor...)
- [ ] R final (at least 2: mar, flor, falar...)
- [ ] NH (at least 2: banho, manhã, sonho...)
- [ ] LH (at least 2: filho, mulher, olha...)
- [ ] Nasal ã (at least 2: pão, mãe, irmã...)
- [ ] Nasal em/im/om/um (at least 2 across them)
- [ ] T + i palatalization (at least 2: tio, tia, Tiago...)
- [ ] D + i palatalization (at least 2: dia, disse, bandeira...)
- [ ] Final L (at least 2: Brasil, animal, natural...)
- [ ] Final S (at least 2: mesmo / mesmos, flores, praias...)
- [ ] Open vs closed vowels (at least 1 pair: avó/avô or café/agô)

## Output file

`generated/_voice-cloning/cloning-sample-ari.md`

(Note: this is in a shared `_voice-cloning/` folder, not tied to any single product.)

## Output schema

```markdown
# Arí — ElevenLabs Voice Cloning Sample Script

## Instructions for Arí

Read this aloud at a natural, conversational pace. Don't try to be a "voice actress" — just be yourself explaining something to a friend. Record in a quiet room with a decent mic (phone is fine). Aim for 60–90 seconds of clean audio.

If you stumble, just pause and continue — we'll trim awkward moments before uploading. Don't redo unless a whole sentence is unintelligible.

## Sound coverage (pre-recording check for the agent; Arí doesn't need to read this)

{checklist above, confirm all boxes tick off against the script below}

## Script (read aloud)

{60–90s of natural PT-BR text, ~150–200 words, covering all required sounds in context. 2–4 paragraphs. Conversational topic: can be about her daily routine, about Brazilian food, about the product she's helping build — whatever lets the sentences flow.}

## Post-recording steps

1. Save the file as `ari-clone-sample.mp3` or `.wav` in a known location
2. Go to https://elevenlabs.io → Voice Lab → Add Voice → Instant Voice Clone
3. Upload the file, name the voice `Arí BR-PT`, let it process
4. Copy the generated `voice_id`
5. Paste into `.env` as `ELEVENLABS_VOICE_ARI_PT=<id>`
6. Test with: `cd _tools/audio-generator && npm run test-voice -- --voice ari_pt --text "Oi, eu sou a Arí."`
```

## Acceptance criteria

- [ ] Exactly ONE script, 150–200 words
- [ ] ALL checklist sounds appear at least twice
- [ ] Text flows naturally (not a list of target words)
- [ ] No technical terms or jargon (Arí reads as herself, not as a linguist)
- [ ] Include sentence variety: at least 2 declarative, 1 interrogative, 1 exclamatory

## Armadilhas comuns

- **Don't write a word list.** "Rato, carro, banho, filho, pão" is useless — those sounds need to appear in CONTEXT.
- **Don't make it about the product.** Stay natural. Story, routine, recipe — anything genuine.
- **Don't exceed 200 words.** The model doesn't need more.
- **Don't be cute.** No "Oi, meu amor, aqui é a Arí!" kind of performance. Neutral-warm.
