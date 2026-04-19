# 08 — Cloning Sample Script for Bandeira

## When to use
One-time task, mirrors `07-cloning-sample-layla.md`. Generate the script Bandeira (you) will read aloud, if you choose to clone a male voice for cloning the male/secondary_pt voice.

## Variables
None.

## Persona shift

Same as `07-cloning-sample-layla.md`. Voice-cloning specialist focused on phonetic coverage for a male narrator.

## Task

Same structure as the Layla version, adapted for:
- the male narrator's speaking style (direct, calm, slight accent variation from Layla is fine — variety is a feature, not a bug)
- The role this voice plays: **Speaker B in Listening Lab dialogues**, occasional use in Speaking Kit drills where masculine voice illustrates a point, and (with pitch-shift in post) the Mango mascot voice

Same sound coverage checklist. Same ~150–200 word target.

## Output file

`generated/_voice-cloning/cloning-sample-male.md`

## Output schema

Same structure as prompt 07, but:
- "Layla" → "Bandeira"
- Voice name in ElevenLabs → `Paulo BR-PT (or marketplace male voice)`
- Env var → `ELEVENLABS_VOICE_MALE_PT`
- Test command: `npm run test-voice -- --voice male_pt --text "Oi, eu sou o Bandeira."`

## Content suggestion

Since Bandeira is the founder, the sample can be about:
- His daily routine in Dublin
- A Brazilian dish he misses
- Why he built SpeakEasy
- A memory from Brazil

Keep it natural, 60–90 seconds, hitting every sound.

## Acceptance criteria

Same as prompt 07.

## Armadilhas comuns

Same as prompt 07. Additional:
- **Don't make the script identical to Layla's.** The phonetic content should overlap (both need to cover all sounds), but the topics/wording should differ — this improves diversity when both voices appear in a dialogue.
