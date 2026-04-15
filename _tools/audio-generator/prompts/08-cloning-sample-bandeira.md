# 08 — Cloning Sample Script for Bandeira

## When to use
One-time task, mirrors `07-cloning-sample-ari.md`. Generate the script Bandeira will read aloud for cloning the male/secondary_pt voice.

## Variables
None.

## Persona shift

Same as `07-cloning-sample-ari.md`. Voice-cloning specialist focused on phonetic coverage for a male narrator.

## Task

Same structure as the Arí version, adapted for:
- Bandeira's speaking style (direct, calm, slight accent variation from Arí is fine — variety is a feature, not a bug)
- The role this voice plays: **Speaker B in Listening Lab dialogues**, occasional use in Speaking Kit drills where masculine voice illustrates a point, and (with pitch-shift in post) the Mango mascot voice

Same sound coverage checklist. Same ~150–200 word target.

## Output file

`generated/_voice-cloning/cloning-sample-bandeira.md`

## Output schema

Same structure as prompt 07, but:
- "Arí" → "Bandeira"
- Voice name in ElevenLabs → `Bandeira BR-PT`
- Env var → `ELEVENLABS_VOICE_BANDEIRA_PT`
- Test command: `npm run test-voice -- --voice bandeira_pt --text "Oi, eu sou o Bandeira."`

## Content suggestion

Since Bandeira is the person running the project, the sample can be about:
- His daily routine in Dublin
- A Brazilian dish he misses
- Why he built SpeakEasy
- A memory from Brazil

Keep it natural, 60–90 seconds, hitting every sound.

## Acceptance criteria

Same as prompt 07.

## Armadilhas comuns

Same as prompt 07. Additional:
- **Don't make the script identical to Arí's.** The phonetic content should overlap (both need to cover all sounds), but the topics/wording should differ — this improves diversity when both voices appear in a dialogue.
