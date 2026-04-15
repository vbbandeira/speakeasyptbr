# Everyday Brazilian Portuguese — MANUAL STEPS

> Things that require **YOUR** action (not Claude Code's). Print this, mark boxes as you complete each step.
>
> Companion to [`TODO.md`](./TODO.md). When you complete a manual step here, also check the matching `[ ] ⏳` in TODO.

---

## 1. Update the e-book cover and CTA link

### 1.1 Update title on cover (if not yet done)

The current cover may still have an older title. Open `speakeasy_ebook_FINAL.html`, locate the cover section, and confirm/update title to the canonical:

> **Everyday Brazilian Portuguese** — *100 phrases for everyday conversations*

### 1.2 Update the "Next Steps" CTA link (page 16)

After **Speaking & Pronunciation Kit** is uploaded to Lemon Squeezy and gets a public URL, replace the placeholder `speakeasyptbr.com` link in page 16 of the HTML with the real LS checkout URL. Then re-generate the PDF:

```bash
cd ../_tools/pdf-generator
node generate_pdfs.js
```

---

## 2. Reconcile chapter names with the website

The vault doc flags a divergence: the landing page at `speakeasyptbr-website/app/(landing)/products/everyday-portuguese/page.tsx` lists 10 different chapter names than what's in the PDF.

**Decide:**
- (a) Site copy paraphrases the PDF deliberately → no action needed, just document it
- (b) Update the site to match the PDF → edit the landing page
- (c) Update the PDF to match the site → edit `speakeasy_ebook_FINAL.html` and re-generate

Once decided, take action in the matching repo and check off the TODO item.

---

## 3. Generate Chapter II–X audio scripts (~1h)

Open Claude Code in this folder and ask:

> "Generate audio scripts for chapters II through X of the Everyday Brazilian Portuguese e-book, following the exact format of `audio_script_chapter_01.md`. Each lesson is one MP3: phrase slow → phrase natural → 'Which means [translation]!'. Output one .md file per chapter into `audio-scripts/`."

Validate at least 2 chapters by reading aloud yourself before recording.

---

## 4. Record audio (Arí — primary path)

### 4.1 Setup

- [ ] Quiet room, USB mic (or phone in good acoustic environment)
- [ ] Recording app: Audacity (free) or QuickTime
- [ ] Read the script files in `audio-scripts/` — Arí can record from any of them in any order
- [ ] Suggested cadence: 10 lessons per session, ~30 min per session

### 4.2 Recording template per lesson

```
[1.5s silence]
Phrase in PT-BR (slow, articulated)
[0.5s silence]
Phrase in PT-BR (natural speed)
[0.5s silence]
"Which means '[English translation]'!"
[1.5s silence]
```

### 4.3 Saving convention

Save MP3s in `audio/` folder, with naming:
- `00_introduction.mp3`
- `01_01.mp3`, `01_02.mp3`, ..., `01_10.mp3`  (Chapter I, lessons 1–10)
- `02_01.mp3`, ..., `02_10.mp3`
- ...
- `10_10.mp3`
- `99_closing.mp3`

### 4.4 Fallback: ElevenLabs (if Arí's recording is delayed)

If a chapter blocks for >2 weeks, fall back to ElevenLabs for that chapter:
- Voice: **Valentina** or **Fernanda** (Brazilian female)
- Slow: speed 0.7, stability 0.7
- Natural: speed 1.0, stability 0.5
- Free tier (10k chars/mo) likely covers everything

---

## 5. Post-production (manual for now, automatable later)

For each MP3 in `audio/`:

- [ ] Trim silence at start/end (Audacity: Edit → Find Zero Crossings → Truncate Silence)
- [ ] Normalize loudness to -16 LUFS (Audacity: Effect → Loudness Normalization)
- [ ] Export as MP3 128 kbps mono

Future: there will be an `npm run normalize` script that does all 3 in one ffmpeg call. Not built yet.

---

## 6. Build delivery ZIPs

```bash
# Manual for now — automation script coming later
cd ~/projects/speakeasyptbr-products/everyday-brazilian-portuguese

# E-book only
mkdir -p delivery
cp pdf/everyday_brazilian_portuguese.pdf delivery/
cd delivery && zip everyday-ebook-only.zip everyday_brazilian_portuguese.pdf && cd ..

# Bundle
mkdir -p delivery/bundle-temp
cp pdf/everyday_brazilian_portuguese.pdf delivery/bundle-temp/
cp -r audio delivery/bundle-temp/
cd delivery && zip -r everyday-bundle.zip bundle-temp/* && rm -rf bundle-temp && cd ..
```

Add a `README.txt` to each ZIP with: title, included files, how to use, support email (`hello@speakeasyptbr.com` or whatever you set up).

---

## 7. Lemon Squeezy upload

- [ ] Login at https://app.lemonsqueezy.com/
- [ ] Create new product: "Everyday Brazilian Portuguese"
- [ ] Add variant "E-book" — €9.90 — upload `delivery/everyday-ebook-only.zip`
- [ ] Add variant "Bundle" — €19.90 — upload `delivery/everyday-bundle.zip`
- [ ] Configure: digital delivery, automatic license email, allow refund 14 days
- [ ] Copy variant IDs from URLs (format: `lemonsqueezy.com/products/.../variants/<ID>`)
- [ ] Add to `~/projects/speakeasyptbr-website/.env.local`:
      ```
      NEXT_PUBLIC_LS_VARIANT_ID_EVERYDAY_EBOOK=<id-from-LS>
      NEXT_PUBLIC_LS_VARIANT_ID_EVERYDAY_BUNDLE=<id-from-LS>
      ```
- [ ] Restart `npm run dev` in the website repo to pick up new vars

---

## 8. End-to-end smoke test

- [ ] Open the website locally, click "Buy" on this product
- [ ] Test mode card: 4242 4242 4242 4242, any future date, any CVC
- [ ] Confirm: redirected to LS checkout → payment success → email arrives → download link works → ZIP unzips correctly → all files inside open

---

## 9. Re-generate PDF after CTA update (final pass)

After Speaking Kit is live and you have its URL, update page 16 CTA in the HTML, re-run:

```bash
cd ../_tools/pdf-generator && node generate_pdfs.js
```

Re-upload the new PDF to LS (replaces previous file).

---

## Quick index of human bottlenecks

The 3 things that ONLY you can do (no automation possible):
1. **Recording with Arí's voice** (or accepting ElevenLabs fallback)
2. **LS account setup + product upload** (manual UI, no API for full setup)
3. **Cover/CTA design decisions** (judgment call)

Everything else can eventually be scripted.
