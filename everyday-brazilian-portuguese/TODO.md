# Everyday Brazilian Portuguese — TODO

> Living checklist of what's left to ship this product. Source of truth for production status.
> Update by checking boxes as work completes. When marking ⏳ items done, also flip the matching item in [`MANUAL-STEPS.md`](./MANUAL-STEPS.md) if applicable.
>
> Legend: ✅ done · ⏳ pending human action · ❌ not started · 🤖 will be automated later

---

## PDF (e-book)

- [x] ✅ Design & content (16 pages + cover)
- [x] ✅ HTML source finalized — `speakeasy_ebook_FINAL.html`
- [x] ✅ PDF generated — `pdf/everyday_brazilian_portuguese.pdf`
- [ ] ⏳ Cover updated with final title (currently has older title)
- [ ] ⏳ CTA link on page 16 ("Next Steps") replaced from `speakeasyptbr.com` to actual Lemon Squeezy product URL — done **after** Speaking Kit gets its LS URL
- [ ] ❌ Reconcile chapter names with website landing copy (vault doc § "Divergência com o site" lists 10 different chapter names on the landing — decide which is canonical, then sync)

## Audio Kit (~102 tracks)

### Scripts

- [x] ✅ `00_introduction.mp3` script (in vault Products doc)
- [x] ✅ `99_closing.mp3` script (in vault Products doc)
- [x] ✅ Chapter I (10 lessons) script — `audio_script_chapter_01.md` (referenced in vault — confirm it's saved here)
- [ ] 🤖 Chapter II–X scripts (90 lessons) — generate via Claude using vault spec format

### Recording

Recording format per lesson: `phrase slow → phrase natural → "Which means '[translation]'!"`

- [ ] ⏳ Record `00_introduction.mp3` (Arí)
- [ ] ⏳ Record `99_closing.mp3` (Arí)
- [ ] ⏳ Record Ch. I — `01_01.mp3` to `01_10.mp3` (Arí, 10 lessons)
- [ ] ⏳ Record Ch. II — `02_01.mp3` to `02_10.mp3`
- [ ] ⏳ Record Ch. III — `03_01.mp3` to `03_10.mp3`
- [ ] ⏳ Record Ch. IV — `04_01.mp3` to `04_10.mp3`
- [ ] ⏳ Record Ch. V — `05_01.mp3` to `05_10.mp3`
- [ ] ⏳ Record Ch. VI — `06_01.mp3` to `06_10.mp3`
- [ ] ⏳ Record Ch. VII — `07_01.mp3` to `07_10.mp3`
- [ ] ⏳ Record Ch. VIII — `08_01.mp3` to `08_10.mp3`
- [ ] ⏳ Record Ch. IX — `09_01.mp3` to `09_10.mp3`
- [ ] ⏳ Record Ch. X — `10_01.mp3` to `10_10.mp3`

### Post-production

- [ ] ❌ Normalize loudness (LUFS -16 for streaming) across all 102 tracks
- [ ] ❌ Trim silence start/end of each track
- [ ] ❌ Encode as MP3 128 kbps (final delivery format)
- [ ] 🤖 Future: bulk normalize via ffmpeg script (post Phase 1 of automation)

## Delivery packaging

- [ ] ❌ Build `delivery/everyday-ebook-only.zip` (PDF only)
- [ ] ❌ Build `delivery/everyday-bundle.zip` (PDF + 102 MP3s organized by chapter)
- [ ] ❌ README.txt inside each ZIP (how to use, support email)

## Lemon Squeezy

- [ ] ⏳ Create product "Everyday Brazilian Portuguese" with 2 variants (E-book €9.90 / Bundle €19.90)
- [ ] ⏳ Upload `delivery/*.zip` files
- [ ] ⏳ Copy variant IDs and add to `speakeasyptbr-website/.env.local`:
      ```
      NEXT_PUBLIC_LS_VARIANT_ID_EVERYDAY_EBOOK=
      NEXT_PUBLIC_LS_VARIANT_ID_EVERYDAY_BUNDLE=
      ```
- [ ] ⏳ Test buy flow end-to-end (real card, test mode first)

## Marketing prep (after launch-ready)

- [ ] ❌ Update Instagram bio link to point to `/products/everyday-portuguese` page
- [ ] ❌ Generate launch reel via `speakeasy-content-generator` (after Phase 1 of that project)

---

## Done summary

Count of `[x]` here as you go — gives you a quick sense of progress.
Currently: **3 / 30+** items done.

## Linked

- Spec: `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Everyday Brazilian Portuguese.md`
- Manual steps: [`MANUAL-STEPS.md`](./MANUAL-STEPS.md)
