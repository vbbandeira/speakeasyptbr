# Brazilian Listening Lab — TODO

> Living checklist of what's left to ship this product.
>
> Legend: ✅ done · ⏳ pending human action · ❌ not started · 🤖 will be automated later

---

## Source content

- [x] ✅ 50 dialogue scripts written — `audio-scripts/dialogues.md` (1826 lines)
- [ ] 🤖 Comprehension questions per dialogue (3–5 questions each) — generate via Claude
- [ ] 🤖 Vocabulary annotations per dialogue (key words + definitions) — generate via Claude
- [ ] 🤖 Cultural context notes (Plus+ tier) — generate via Claude

---

## Tier: BASIC (€19.90) — 15 dialogues

### Audio (15 × 2 speeds = 30 tracks)

- [ ] ⏳ Set up ElevenLabs Starter ($5/mo) if not already from Speaking Kit
- [ ] ⏳ Pick 2 voices: 1 feminine (Valentina/Fernanda) + 1 masculine (Antonio or equivalent)
- [ ] ❌ Record dialogues #1–#15 in 2 speeds (slow + natural):
  - Slow: ~0.75x speed, articulation clara
  - Natural: speed 1.0, real conversation rhythm with reductions

### PDFs

- [ ] 🤖 Build "Start Here — Listening Guide" PDF (active listening tips, ~2 pages)
- [ ] 🤖 Build Basic transcripts PDF (15 dialogues, line-by-line translation, vocab notes, comprehension Q's)

### Build BASIC delivery

- [ ] ❌ `delivery/listening-lab-basic.zip` (transcripts PDF + start-here PDF + 30 audio files)

---

## Tier: PLUS (€39.90) — 30 dialogues + extras

### Audio (additional 15 × 2 = 30 more tracks, total 60)

- [ ] ❌ Record dialogues #16–#30 in 2 speeds (same voices as Basic)

### Extras

- [ ] 🤖 Build expanded transcripts PDF (30 dialogues + cultural context notes)
- [ ] 🤖 Build fill-the-gap exercises PDF (1 exercise per dialogue)
- [ ] 🤖 Build flashcards CSV (Anki/Quizlet, ~150–200 cards)
- [ ] 🤖 Build "Top 30 Listening Traps for English Speakers" PDF (contractions, reductions, slang that sounds like other things)

### Build PLUS delivery

- [ ] ❌ `delivery/listening-lab-plus.zip` (Basic + above)

---

## Tier: PRO (€59.90) — 50 dialogues + mini-podcasts + extras

### Audio (additional 20 × 2 = 40 more tracks, total 100; + 5 mini-podcasts; + 5 dictation tracks)

- [ ] ❌ Record dialogues #31–#50 in 2 speeds
- [ ] 🤖 Generate 5 mini-podcast scripts (~3–5 min each, monólogos sobre cultura BR)
- [ ] ❌ Record 5 mini-podcasts (ElevenLabs single voice)
- [ ] ❌ Record 5 dictation tracks (use existing dialogues, slower pace, clear pauses)

### Extras

- [ ] 🤖 Build full transcripts PDF (50 dialogues)
- [ ] 🤖 Build dictation exercises PDF
- [ ] 🤖 Build "Brazilian Slang & Reductions Guide" PDF (cê, tá, tô, pra, etc.)
- [ ] 🤖 Build "Regional Accents Overview" PDF (SP/RJ/Nordeste/Sul characteristics)

### Build PRO delivery

- [ ] ❌ `delivery/listening-lab-pro.zip`

---

## Lemon Squeezy

- [ ] ⏳ Create product "Brazilian Listening Lab" with 3 variants
- [ ] ⏳ Upload `delivery/listening-lab-basic.zip` → Basic (€19.90)
- [ ] ⏳ Upload `delivery/listening-lab-plus.zip` → Plus (€39.90, DEFAULT)
- [ ] ⏳ Upload `delivery/listening-lab-pro.zip` → Pro (€59.90)
- [ ] ⏳ Copy variant IDs to `speakeasyptbr-website/.env.local`:
      ```
      NEXT_PUBLIC_LS_VARIANT_ID_LISTENING_BASIC=
      NEXT_PUBLIC_LS_VARIANT_ID_LISTENING_PLUS=
      NEXT_PUBLIC_LS_VARIANT_ID_LISTENING_PRO=
      ```
- [ ] ⏳ End-to-end smoke test

---

## Done summary

Currently: **1 / 30+** items done (the 50 scripts).

## Linked

- Spec: `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Brazilian Listening Lab.md`
- Manual steps: [`MANUAL-STEPS.md`](./MANUAL-STEPS.md)
