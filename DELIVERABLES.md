# SpeakEasy Portuguese — Product Deliverables Reference

> **Purpose of this doc:** single source of truth for what each product includes today. Use it for:
> - Marketing copy / website description updates
> - Pricing & packaging decisions
> - Handoff to other agents (designers, copywriters, reviewers)
>
> **Last updated:** 2026-04-21
> **Status:** 2 of 3 products close to ship-ready. Listening Lab not started.

---

## Executive summary

SpeakEasy Portuguese is a digital-product studio publishing Brazilian Portuguese learning materials for English speakers. Three products in the lineup, all priced in EUR, all delivered as downloadable ZIPs via Lemon Squeezy.

| Product | Tiers | Status |
|---|---|---|
| **Everyday Brazilian Portuguese** | €9.90 · €19.90 | 🟡 E-book ready · bonuses ready · Layla audio for Ch.II–X pending |
| **Speaking & Pronunciation Kit** | €29.90 · €69.90 · €129.90 | 🟡 E-book ready · audio scripts ready · **audio pivoted to Layla-recorded** (AI failed pronunciation QA) · Plus/Pro tier extras pending |
| **Brazilian Listening Lab** | TBD (3 tiers planned) | ⚪ Not started · 50 dialogues scripted in the repo |

**Strategic positioning:**
- Everyday = gateway product (low-priced tourist/beginner phrasebook with cultural bonuses)
- Pronunciation Kit = premium depth product (serious learner wanting to sound native)
- Listening Lab = ear-training product (sits between the two, all audio)

**Upsell flow:** Everyday buyer → Pronunciation Kit (both cover different needs, no content overlap) → Listening Lab (passive listening for continued exposure).

---

## Product 1 — Everyday Brazilian Portuguese

### Target customer
Tourists, business travellers, expats, and absolute-beginner learners who want a practical phrasebook and cultural context for visiting Brazil. Not aimed at serious language students.

### Core promise
*"The 100 phrases and unwritten cultural rules you need to survive Brazil, without learning grammar."*

### Tier structure

#### €9.90 — E-book only
Everything text/PDF. Good for someone who's going to Brazil and wants to read-and-go.

**Delivered files:**
| File | Format | Size | What it is |
|---|---|---|---|
| `Everyday Brazilian Portuguese.pdf` | PDF | 8.1 MB, 14 pages | Main phrasebook: 100 everyday phrases organised into 10 chapters (greetings, introductions, food, directions, etc.) + "Quick Practice Plan" + "Next Step" closing |
| `Brazilian Culture & Etiquette Guide.pdf` | PDF | 8.5 MB, 13 pages | **Bonus guide** covering beijo rules, Pix/tipping, food culture (rodízio, feijoada), hora brasileira, regional character (carioca/paulista/mineiro/nordestino/sulista + Nortistas note), holidays (Carnaval regional variety, Iemanjá framing), Do's & Don'ts reference |

#### €19.90 — E-book + audio bundle
Everything in €9.90 plus audio files for immersive practice.

**Additional files delivered:**
| File | Format | Size | What it is |
|---|---|---|---|
| Chapter audio (I–X) | MP3 × ~10 files | TBD | **Narrated by Layla (human)** — Portuguese audio for each phrase, chapter by chapter. **Status:** Chapter I + intro + closing done; Chapters II–X pending. Layla records manually. |
| `One Day in Brazil.mp3` | MP3 | 9.6 MB, ~8 min | **Bonus immersion audio** — first-person narrative of a typical day in Rio (Mariana, 28, carioca). AI-generated with ElevenLabs "Carla" voice (Brazilian professional, warm narrator). Natural speed, no drills. |
| `One Day in Brazil - Transcript.pdf` | PDF | 7.3 MB, 10 pages | Full transcript of the bonus audio: Portuguese + English side-by-side, 8 scenes + intro + "how to use" guide |

### Current state
- ✅ Main e-book: designed, generated, content locked
- ✅ Culture & Etiquette Guide: researched, fact-checked (beijo rules corrected, Yakult myth removed, "você engordou" reframed, regional stereotypes softened), generated
- ✅ One Day in Brazil: audio + transcript PDF generated
- 🟡 Chapter II–X audio (Layla human recording): **pending** — depends on Layla availability
- ⚪ Lemon Squeezy setup: not yet done

### What makes this product worth €19.90 vs €9.90
The €10 upgrade buys:
- ~30 min of chapter-by-chapter phrase audio (Layla's authentic Brazilian voice)
- ~8 min immersion audio + transcript (passive listening for ear training)
- Practical utility: listen during commute, dishes, walks — ingrain the sounds without study time

---

## Product 2 — Speaking & Pronunciation Kit

### Target customer
Intermediate learners (A2–B1+) who can already form sentences but don't sound Brazilian. Wants focused pronunciation training.

### Core promise
*"Master the 8 sounds that separate 'knowing the words' from 'sounding Brazilian' — guttural R, nasals, LH/NH, T/D palatalization, final L/S, connected speech."*

### Tier structure

#### €29.90 — Basic
The core pedagogical product: PDF + all drill audios.

**Delivered files:**
| File | Format | Size | What it is |
|---|---|---|---|
| `Speaking & Pronunciation Kit.pdf` | PDF | 10.6 MB, 28 pages | Main guide. 8 chapters × 2–3 pages each, with enriched pedagogical structure: theory spotlight, comparison table, drill progression (5 levels), minimal pairs lab, common traps, cultural context. Plus: intro "Sound Map", 50 Survival Phrases bonus, 14-Day Plan, Audio Index |
| `Speaking & Pronunciation Kit - Start Here.pdf` | PDF | 0.6 MB, 4 pages | Onboarding document: why pronunciation matters, daily routine, how files are organised |
| `audio/Chapter_01_Rhythm_Stress/` through `audio/Chapter_08_Connected_Speech/` | MP3 folders | TBD (Layla recording) | 46 audio drills total. Each lesson: natural utterance → slow repetition → English meaning. **Pivoted to Layla human recording** because AI TTS had meaning-changing pronunciation errors on specific drill words (casa→caça, escola→IEscola) that can't be risked in a pronunciation-teaching product |
| `audio/Bonus_50_Survival_Phrases/` | MP3 × 13 | TBD (Layla recording) | 50 survival phrases grouped into 13 audio files (3-4 phrases per file). Same Layla-recorded format |

#### €69.90 — Plus (MOST POPULAR)
Basic + 3 substantial extras. **All extras pending.**
- Listening Mini-Pack: 10 bilingual dialogues with 2 speakers × 2 speeds = 40 tracks (AI-generable)
- Flashcards CSV: ~150–200 Anki/Quizlet cards (to be generated)
- "Top 50 Mistakes for English Speakers" PDF (to be written)

#### €129.90 — Pro
Plus + 3 advanced extras. **All extras pending.**
- Full Listening Booster: 40–60 dialogues (AI-generable)
- Speaking Scripts Pack: 200 mini-scripts with 2–3 variations each (to be generated)
- 21-Day Fluency Plan PDF (to be written)

### Current state
- ✅ Main PDF: 28 pages, enriched structure, image rendering verified, flag emojis rendering correctly
- ✅ Start Here PDF: 4 pages, onboarding done
- ✅ Audio scripts: YAML files for all 46 lessons + 13 bonus phrases exist (`audio-scripts/`)
- ✅ AI-generated audio exists as reference (46 MP3s in `audio/Chapter_XX/`) — **will be replaced** by Layla recordings
- 🟡 Layla human recording: **pending** — Layla records following the YAML scripts as guide
- ⚪ Plus/Pro tier extras: not started
- ⚪ Lemon Squeezy setup: not yet done

### Why the audio pivoted from AI to human
Pronunciation is the literal product. ElevenLabs v2 multilingual TTS produced ~5-10% words with meaning-changing errors (e.g., "casa" pronounced "caça" = hunting). In a kit teaching exact pronunciation, each error corrodes trust. Layla (native Brazilian voice, user's wife) records the ~1–2 hours of audio content manually for guaranteed quality. AI is retained for non-critical content (stories, dialogues, immersion) where occasional drift is acceptable.

### What makes this product worth €29.90 vs free YouTube tutorials
- Structured 14-day plan (day-by-day, not ad hoc browsing)
- Minimal pair lab (meaning-changing pronunciation contrasts — rare in free content)
- Regional variation explained (Carioca vs Paulista vs Nordestino R, etc.)
- Traps specific to English speakers
- 46 drills in order, all with same voice — ear trains consistently

---

## Product 3 — Brazilian Listening Lab

### Status
**Not started.** Exists only as 50 scripted dialogues in `brazilian-listening-lab/` folder (plus structure in manifest). Planned as the third product after Everyday and Pronunciation Kit ship.

### Target customer (planned)
Learners with A2+ pronunciation who want to understand real Brazilian speech at natural speed — commutes, podcasts, Netflix reviews, Brazilian friends.

### Planned pricing
€19.90 / €39.90 / €59.90 (3 tiers)

### Planned contents
- 50 dialogues with 2 speakers (female + male Brazilian voices — AI-generable with Carla + another marketplace voice)
- Transcripts for all dialogues
- Vocabulary notes
- Cultural context
- Likely tier-differentiated: basic = scripts + transcripts, mid = + audio (slow + natural speed), top = + cultural notes + dictations

### Why this fits AI TTS well
Dialogues/stories tolerate minor AI pronunciation variation much better than isolated drill words. The ~5-10% error rate that killed the Pronunciation Kit AI plan is acceptable in connected speech where context helps comprehension.

---

## Audio production pipeline

### Two parallel tracks

**Track 1: Human recording (Layla)**
- Used for: Pronunciation Kit chapter drills + Everyday chapters II–X
- Why: pronunciation must be perfect in pedagogical drills
- Delivered as: one WAV/MP3 per drill, Layla records following YAML scripts as guide
- Blocked on: Layla availability (her schedule)

**Track 2: AI generation (ElevenLabs + ffmpeg)**
- Used for: One Day in Brazil (done), all planned Listening Lab dialogues
- Voice: Layla-clone for brand consistency where possible; Carla marketplace voice for narrations/stories
- Tool: `_tools/audio-generator/` — custom pipeline with:
  - `generate-kit-audio-v2.ts` — concat + ffmpeg atempo=0.85 slow-down (for drills with natural+slow+meaning format)
  - `generate-immersion-audio.ts` — continuous narration from YAML scenes
  - Full API retry logic, idempotent skip-if-exists, dry-run cost estimation
- Quota: ElevenLabs Creator plan ($22/mo) = 100k chars. Current usage ~55k/mo.

### Design language (shared across all products)
- **Typography:** Poppins (headings) + Inter (body) + Noto Color Emoji (emoji fallback)
- **Colors:** Hunter green #1E4D3B primary, mint #A8E6C3 accent, cream #F5F0E8 background
- **Assets:** shared in `_shared/assets/` (Logo, Cristo, Arara, Palácio — 5 SVGs)
- **Components:** 10+ reusable (theory-spotlight, drill-progression, minimal-pairs, traps-box, cultural-box, do-dont-grid, region-card, scene blocks)
- **PDF format:** 420px wide pages, variable height, Puppeteer-rendered from HTML

---

## File naming conventions

### Customer-facing (PDF outputs)
Title-case with natural spaces and ampersands. No underscores. Examples:
- `Everyday Brazilian Portuguese.pdf`
- `Brazilian Culture & Etiquette Guide.pdf`
- `Speaking & Pronunciation Kit.pdf`
- `Speaking & Pronunciation Kit - Start Here.pdf`
- `One Day in Brazil - Transcript.pdf`
- `One Day in Brazil.mp3`

### Customer-facing (audio folders — Pronunciation Kit)
Title_Case with underscores (folder-friendly, visually cleaner than spaces in deeply-nested paths):
- `Chapter_01_Rhythm_Stress/Lesson_01.mp3` … `Lesson_07.mp3`
- `Chapter_08_Connected_Speech/Lesson_01.mp3` … `Lesson_05.mp3`
- `Bonus_50_Survival_Phrases/Phrase_01.mp3` … `Phrase_13.mp3`

### Developer-facing (HTML source, scripts)
snake_case. Not shipped to customer, safe to ignore.

---

## Pricing strategy notes

### Everyday €9.90 vs €19.90
€10 upgrade buys audio — concrete, obvious value. Culture Guide is present in both tiers (makes €9.90 feel substantial beyond just phrases). Audio immersion bonus adds weight to €19.90.

### Pronunciation Kit €29.90 / €69.90 / €129.90
- €29.90 Basic is the product's pedagogical core. Already justifies the price vs the ~50 competing YouTube tutorials.
- €69.90 Plus adds listening content + flashcards + mistakes PDF — materially more study hours per €
- €129.90 Pro is for the serious learner / monolingual English speaker investing in their 3-month Brazil trip. 200 speaking scripts + 21-day plan + full listening booster = ~40 hours of self-study content

### Positioning
- Everyday = "phrasebook"
- Pronunciation Kit = "course"
- Listening Lab = "immersion trainer"

No content overlap between any tier of any product. Upsell is clean.

---

## Zero-overlap guarantee matrix

This is the strategic constraint: each product covers what the others don't.

| Content type | Everyday | Pronunciation Kit | Listening Lab (planned) |
|---|---|---|---|
| Phrasebook (100 phrases) | ✅ Core | — | — |
| Cultural context & etiquette | ✅ Bonus | — | — |
| Immersion narrative audio | ✅ Bonus (€19.90 tier) | — | — (longer-form in Listening Lab) |
| Pronunciation drills (single words) | — | ✅ Basic | — |
| Minimal pairs / sound contrast | — | ✅ Basic | — |
| Bilingual dialogues | — | ✅ Plus/Pro | ✅ Core |
| Flashcards | — | ✅ Plus | — |
| "Top 50 Mistakes" | — | ✅ Plus | — |
| Speaking scripts (many short) | — | ✅ Pro | — |
| 21-day plan | — | ✅ Pro | — |
| Listening booster (dialogue volume) | — | ✅ Pro (extends into Lab territory) | ✅ Core |

The Pro tier of Pronunciation Kit overlaps slightly with Listening Lab by design — it's the "big bundle" for buyers who don't plan to upgrade further.

---

## Website copy inputs (raw material for marketing)

### Everyday Brazilian Portuguese — headline options
- "The 100 Brazilian phrases — and unwritten rules — you actually need."
- "Speak like a local before you land. A phrasebook plus the cultural fluency tourists never learn."
- "100 phrases. 10 chapters. 13 pages of culture no one else teaches."

### Everyday — sub-copy
> 100 practical phrases for real situations — greetings, directions, restaurants, transport — with natural pronunciation hints. Plus a 13-page culture & etiquette guide covering the beijo rules by region, Pix, tipping, rodízio, hora brasileira, regional character, and holidays. Add the audio tier for Layla's authentic narration and a bonus 8-minute immersion audio that drops you into a real Brazilian day.

### Pronunciation Kit — headline options
- "The 8 sounds that separate knowing the words from sounding Brazilian."
- "Guttural R. Nasal vowels. LH and NH. The sounds English doesn't have — mastered in 14 days."
- "Pronunciation isn't an accent. It's a skill. And it's trainable."

### Pronunciation Kit — sub-copy
> 28-page guide + 46 focused audio drills covering rhythm, vowels, nasals, R/RR/H, T/D before I, LH/NH, final L and S, and connected speech. Theory spotlight, drill progression, minimal pairs lab, traps for English speakers, and regional variation notes in every chapter. Plus a 14-day plan and 50 survival phrases as bonus. Audio is recorded by Layla, a native Brazilian voice — because when you're teaching pronunciation, every word has to be right.

### Listening Lab — (placeholder, product not built)
> 50 real Brazilian conversations. Two speakers, natural speed, full transcripts. Because understanding Brazilians talking to each other at a noisy bar is the hardest listening challenge — and the one that proves you've actually learned the language.

---

## Open questions for marketing review

1. **Pricing sensitivity**: is €29.90 Basic for Pronunciation Kit too high for the target learner? Should we test €24.90?
2. **Tier naming**: Basic / Plus / Pro is generic. Should Pronunciation Kit use "Essentials / Advanced / Complete" instead?
3. **Bundle discount**: should buyers of Pronunciation Kit Pro get Everyday free? Or a discount on Listening Lab when it launches?
4. **Free lead magnet**: should we offer a 5-phrase sampler or 1 culture guide chapter free for email capture? (Recommend: yes, 1 page of culture guide ≈ "Brazilian beijo rules by region" is inherently shareable)
5. **Refund policy**: 30 days? 14 days? industry standard is 14 days for digital products.
6. **Translation/localization**: is this English-only? Should we consider Spanish-language versions given geographic proximity?
7. **Audio format delivery**: single ZIP? Streaming link? Individual MP3 download?

---

## Ship-ready checklist per product

### Everyday Brazilian Portuguese — €9.90 tier
- [x] Main PDF finalised
- [x] Culture Guide PDF finalised
- [ ] ZIP packaging (`delivery/everyday-brazilian-portuguese-ebook.zip`)
- [ ] Lemon Squeezy product created
- [ ] Variant ID copied to website `.env.local`
- [ ] End-to-end buy test

### Everyday Brazilian Portuguese — €19.90 tier
- [x] Main PDF finalised
- [x] Culture Guide PDF finalised
- [x] One Day in Brazil MP3 generated
- [x] One Day in Brazil transcript PDF finalised
- [ ] Chapter II–X audio (Layla recording)
- [ ] ZIP packaging (`delivery/everyday-brazilian-portuguese-bundle.zip`)
- [ ] Lemon Squeezy variant
- [ ] End-to-end buy test

### Speaking & Pronunciation Kit — €29.90 Basic
- [x] Main PDF finalised (28 pages)
- [x] Start Here PDF finalised
- [x] Audio scripts (YAML) finalised
- [ ] Audio drill recording (Layla) — 46 lessons + 13 bonus phrases
- [ ] ZIP packaging
- [ ] Lemon Squeezy variant
- [ ] End-to-end buy test

### Speaking & Pronunciation Kit — €69.90 Plus
- [ ] Listening Mini-Pack (10 dialogues × 2 speeds × 2 voices = 40 tracks — AI)
- [ ] Flashcards CSV (~150–200 cards)
- [ ] Top 50 Mistakes PDF
- [ ] ZIP + Lemon Squeezy + test

### Speaking & Pronunciation Kit — €129.90 Pro
- [ ] Full Listening Booster (40–60 dialogues — AI)
- [ ] Speaking Scripts Pack (200 scripts PDF)
- [ ] 21-Day Fluency Plan PDF
- [ ] ZIP + Lemon Squeezy + test

### Brazilian Listening Lab
- [ ] Not yet started. Scripts exist in repo.

---

## Contact / ownership

- Studio owner: Vinícius "Bandeira" Britto Bandeira
- Voice talent: Layla (wife, Brazilian)
- Website: speakeasyptbr.com
- Instagram: @speakeasy.ptbr
- Development repos:
  - `speakeasyptbr-products` (this repo — content & PDFs)
  - `speakeasyptbr-website` (Next.js storefront + Lemon Squeezy)
  - `speakeasy-content-generator` (organic social content — reels/carousels)
