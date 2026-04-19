# 06 — TTS Formatting Reference

> **Not a station prompt.** This is a reference the agent loads **every time** it writes text destined for ElevenLabs. It encodes everything known about how to coax `eleven_multilingual_v2` into correct Brazilian Portuguese pronunciation.

## Why this document exists

ElevenLabs TTS is excellent for natural speech but has three systematic failures for PT-BR pedagogical audio:

1. **Doesn't articulate in slow motion naturally** — slowing text alone produces distortion, not instruction.
2. **Collapses minimal pairs** — the model "corrects" toward common words; "tia" and "chia" can sound identical.
3. **Reduces hard consonants in fast syllables** — "olha" may become "olia", exactly the error we want to avoid teaching.

The techniques below compensate.

---

## Technique 1 — Repetition with syllable breakdown

Instead of generating the word once, write it **multiple times in the same script** with intentional breakdowns.

**Bad:**
```
lhama
```

**Good:**
```
Lhama. Lh-ama. Lha-ma. Lhama.
```

The model is forced to articulate each syllable because the punctuation demands a pause.

---

## Technique 2 — Pause enforcement via punctuation

ElevenLabs respects commas, ellipses, and hyphens. Use them to prevent consonant collapse.

| Ruim | Médio | Bom | Melhor |
|---|---|---|---|
| `banho` | `banho.` | `Ba... nho.` | `Ba-nho. Ba... nho. Banho.` |

Rule of thumb: for every target sound being taught, at least one rendition with explicit syllable breakdown.

---

## Technique 3 — Contrastive drills via minimal pairs

When teaching a sound, always include a **contrast with the sound it's being confused with**.

**For R (initial) vs H (confusion from English):**
```
"Rato"... começa com R em português: RR-ato.
Agora com H inglês: "hato". Ouça a diferença.
Rato. Hato. Rato. Rato.
```

This forces the model to distinguish because the text demands it.

---

## Technique 4 — Slow vs Natural variants

Every drill ships in TWO variants:

- **Slow** — articulated, with syllable breaks and pauses (Technique 1+2). Stability 0.7 in ElevenLabs.
- **Natural** — flowing, conversational, no breaks. Stability 0.5.

Both variants use the SAME `voice_id`. Only text and stability change.

---

## Technique 5 — Explicit instruction in the voice

The narrator (Layla voice) often gives instructions inline. This helps the listener AND helps the model context-switch.

```
Ouça o som "nh". Em português, ele soa como um N suave e úmido, como em:
banho. Ba-nho. Banho.
Agora compare com o som N comum: "bano" (não existe em português, mas serve de contraste).
Ba-no. Ba-nho. Ba-nho.
```

---

## Specific sound-by-sound playbook

### R / RR / H (Module 04 priority)

| Position | Example | Correct sound | Strategy |
|---|---|---|---|
| Initial R | rato, rua | Glottal H-like / velar fricative | Write "R-rato" and "rra-to" variations |
| Intervocalic R | caro, barato | Tap | Write "ca-ro" natural only (syllable break suffices) |
| RR | carro, ferro | Glottal / gargled | Write "ca-rrr-o" with triple R hint in slow variant |
| Final R | mar, flor | Soft tap or null | Contrast "mar (com R)" vs "mah (sem R)" |

### NH (Module 06)

Always prefix slow variant with:
```
Ouça o som NH. É como N + I, fundidos. Ba-nho. Manhã. Ninho.
```

Never write "banho" alone in a drill — always contrast.

### LH (Module 06)

```
Lh soa como L + I, fundidos. Fi-lho. Mu-lher. Te-lha.
```

### Nasal vowels (Module 03)

The model may "unnasalize" in fast contexts. Counter by:
```
Pão (com nasal, ã final). Paw (som inglês). Pão. Pa-ão. Pão.
```

### T/D before I (Module 05)

The model may already palatalize correctly, but it can also drop it. Force with:
```
Dia, em português do Brasil, soa como "djia". Dj-ia. Di-a. Djia.
```

### Vowels — open vs closed (Module 02)

Explicit labels:
```
Avó (com Ó aberto, acento na vogal). 
Avô (com Ô fechado, nasalizado). 
Avó. Avô. Avó.
```

---

## DO NOT do these

- **Don't use IPA in the text.** ElevenLabs will try to pronounce `/ɾ/` literally.
- **Don't use SSML tags.** `eleven_multilingual_v2` doesn't support them. Use punctuation instead.
- **Don't write huge slow variants.** ~4× the natural length is the ceiling. Beyond that, the model's quality degrades.
- **Don't mix languages mid-sentence** unless teaching contrast explicitly. ElevenLabs handles code-switching OK but quality drops.
- **Don't include stage directions inline.** `(com pausa longa)` will be READ ALOUD by the voice. Use HTML comments `<!-- pausa longa -->` in the Markdown, which the TTS CLI strips before sending to API.

---

## How the CLI consumes your scripts

The `generate-audio` CLI parses `scripts.md` and:

1. Finds `## Drill N — <name>` sections
2. Finds `### Variant: slow` / `### Variant: natural` blocks inside
3. Strips HTML comments
4. Sends each block as a separate API call to ElevenLabs
5. Stability parameter set by variant name: `slow` → 0.7, `natural` → 0.5
6. Saves MP3 as `audio/drill-NN-<variant>.mp3` (naming per manifest)

So your job as the writer is: produce clean, TTS-ready blocks that the CLI will pick up without further processing.

---

## Required script structure

```markdown
# <Station name> — Scripts

<!-- Generated by Opus agent. Do not edit manually except for QA fixes. -->

## Drill 01 — <drill name>

### Variant: slow
<text — Technique 1+2+3 applied>

### Variant: natural
<text — clean, flowing>

## Drill 02 — <drill name>

### Variant: slow
...

### Variant: natural
...
```

That's it. No front matter needed at the drill level — station-level metadata lives in the manifest.
