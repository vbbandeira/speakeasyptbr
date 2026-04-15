# Speaking & Pronunciation Kit — TODO

> Living checklist of what's left to ship this product.
>
> Legend: ✅ done · ⏳ pending human action · ❌ not started · 🤖 will be automated later

---

## PDFs (already done — pre-launch)

- [x] ✅ Main PDF — design & content (15 pages + cover) — `speakeasy_pronunciation_kit.html`
- [x] ✅ Start Here PDF (4 pages) — `speakeasy_start_here.html`
- [x] ✅ PDFs generated — `pdf/speakeasy_pronunciation_kit.pdf` + `pdf/speakeasy_start_here.pdf`
- [ ] ⏳ Cover redesign (no photos — typography-only, dark green) — see vault spec
- [ ] ❌ Reconcile "80 tracks" vs "10 modules" (vault flags this as decision pending — confirm 80 individual tracks is the canonical, then verify Audio Index pages match)

---

## Tier: BASIC (€29.90) — unlock first

### Audio drills (80 tracks)

#### Scripts

- [ ] 🤖 Module 01 — Rhythm & Stress (~8 drills) — generate via Claude
- [ ] 🤖 Module 02 — Vowels (~12 drills)
- [ ] 🤖 Module 03 — Nasal Sounds (~12 drills)
- [ ] 🤖 Module 04 — R / RR / H (~10 drills)
- [ ] 🤖 Module 05 — T and D before i (~8 drills)
- [ ] 🤖 Module 06 — LH and NH (~8 drills)
- [ ] 🤖 Module 07 — L final & S final (~8 drills)
- [ ] 🤖 Module 08 — Connected Speech (~10 drills)
- [ ] 🤖 Bonus — 50 Survival Phrases (~4 drills)

#### Recording (ElevenLabs primary, Arí for M01 + M08)

- [ ] ⏳ Set up ElevenLabs Starter ($5/mo, 30k chars) — see MANUAL-STEPS § 1
- [ ] ⏳ Record M01 — Rhythm & Stress (Arí preferred)
- [ ] ❌ Record M02 — Vowels (ElevenLabs)
- [ ] ❌ Record M03 — Nasal Sounds (ElevenLabs)
- [ ] ❌ Record M04 — R / RR / H (ElevenLabs)
- [ ] ❌ Record M05 — T and D before i (ElevenLabs)
- [ ] ❌ Record M06 — LH and NH (ElevenLabs)
- [ ] ❌ Record M07 — L final & S final (ElevenLabs)
- [ ] ⏳ Record M08 — Connected Speech (Arí preferred)
- [ ] ❌ Record Bonus — 50 Survival Phrases (ElevenLabs)

#### Post-production

- [ ] ❌ Normalize all 80 tracks to -16 LUFS
- [ ] ❌ Trim silence, encode MP3 128 kbps
- [ ] ❌ Verify naming convention: `module-XX-drill-YY-{slow|natural}.mp3`

### Build BASIC delivery

- [ ] ❌ Build `delivery/speaking-kit-basic.zip` (PDF + Start Here + audio/ folder structure)

---

## Tier: PLUS (€69.90) — unlock second

### Listening Mini-Pack (10 dialogues × 2 speeds × 2 voices = 40 tracks)

- [ ] 🤖 Generate 10 dialogue scripts via Claude (scenarios: ordering food, asking directions, small talk, phone call, pharmacy, Uber, hotel check-in, shopping, bar, asking for help)
- [ ] ❌ Record each dialogue in 2 speeds (slow + natural) with 2 voices (M + F)
- [ ] 🤖 Generate transcripts PDF (line-by-line translation + vocab notes)

### Flashcards

- [ ] 🤖 Generate `flashcards-speaking-kit.csv` (Anki/Quizlet format) — ~150–200 cards covering target words + 50 survival phrases

### Top 50 Mistakes for English Speakers PDF

- [ ] 🤖 Generate Markdown content via Claude (format: "You say X → Brazilians hear Y → Say Z instead", categorized by module)
- [ ] ❌ Convert MD → PDF (could reuse pdf-generator with new HTML wrapper, or use Canva)

### Build PLUS delivery

- [ ] ❌ Build `delivery/speaking-kit-plus.zip` (everything from Basic + above)

---

## Tier: PRO (€129.90) — unlock third (parallel-able with PLUS)

### Speaking Scripts Pack (200 mini scripts, no audio)

- [ ] 🤖 Generate 200 scripts via Claude (2–3 variations each: formal/informal/regional)
- [ ] ❌ Format as PDF with category navigation + index

### 21-Day Fluency Plan PDF

- [ ] 🤖 Generate via Claude (daily routine, dia 1 → 21, focal sound + drills + shadowing script)
- [ ] ❌ Convert MD → PDF

### Full Listening Booster (40–60 dialogues × 2 speeds × 2 voices = 160–240 tracks)

> ⚠️ Largest item. Per vault spec, can be released in waves AFTER Pro initial launch — don't gate the launch on this.

- [ ] 🤖 Generate 40–60 dialogue scripts (extending Mini-Pack to A1→B1)
- [ ] ❌ Record all (ElevenLabs batch — ~25k chars, fits in Starter $5/mo)
- [ ] 🤖 Generate transcripts PDF for each

### Build PRO delivery

- [ ] ❌ Build `delivery/speaking-kit-pro.zip`

---

## Lemon Squeezy

- [ ] ⏳ Create product "Speaking & Pronunciation Kit" with 3 variants
- [ ] ⏳ Upload `delivery/speaking-kit-basic.zip` to Basic variant — €29.90
- [ ] ⏳ Upload `delivery/speaking-kit-plus.zip` to Plus variant — €69.90 (mark as default)
- [ ] ⏳ Upload `delivery/speaking-kit-pro.zip` to Pro variant — €129.90
- [ ] ⏳ Copy variant IDs to `speakeasyptbr-website/.env.local`:
      ```
      NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_BASIC=
      NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_PLUS=
      NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_PRO=
      ```
- [ ] ⏳ End-to-end smoke test (each tier)

---

## Done summary

Currently: **3 / 50+** items done (mostly the PDFs).

## Linked

- Spec: `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Speaking & Pronunciation Kit.md`
- Manual steps: [`MANUAL-STEPS.md`](./MANUAL-STEPS.md)
