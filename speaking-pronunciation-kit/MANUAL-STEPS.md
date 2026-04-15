# Speaking & Pronunciation Kit — MANUAL STEPS

> Things that require **YOUR** action. Print this, mark boxes as you complete each step.
>
> Companion to [`TODO.md`](./TODO.md).

---

## 1. Set up ElevenLabs (shared across all 3 products + content generator)

> Uma única assinatura **ElevenLabs Creator ($22/mês, 100k chars/mês + voice cloning)** serve os 3 produtos e o pipeline de reels. Se você já fez esse setup em outro produto, pule esta seção.

- [ ] Login em https://elevenlabs.io
- [ ] Subir pra **Creator plan ($22/mês)** — volume de 100k chars cobre burst inicial dos produtos + reels mensais. Starter ($5) não suporta voice cloning.
- [ ] Em **Profile → API Keys**, gerar uma key → salvar como `ELEVENLABS_API_KEY` no `.env` de cada repo

### 1.1 Voice cloning da Arí (preferido — identidade da marca)

- [ ] Ler o guia de sample recording na seção 4.1 (este mesmo doc)
- [ ] Arí grava ~1min de áudio limpo em português natural (ver critérios abaixo)
- [ ] Em ElevenLabs → **Voice Lab → Add Voice → Instant Voice Clone**
- [ ] Upload do sample, nomear voice: `Arí BR-PT`
- [ ] Salvar o `voice_id` gerado como `ELEVENLABS_VOICE_ARI_PT` no `.env`
- [ ] Gerar um teste com um drill (ex: "tchia vs chia — minimal pair") e validar qualidade
- [ ] Se tiver algum desvio de pronúncia em R/RR/NH/LH → regravar o sample focando nesses sons

### 1.2 Fallback (se o clone ficar estranho)

- [ ] Browse Voice Library, filter: Female, Portuguese, Brazilian
- [ ] Testar "Valentina" e "Fernanda" com o mesmo drill-teste
- [ ] Pegar a que tiver R/RR/NH/LH mais limpos — **isso é crítico, esse produto ensina esses sons**
- [ ] Salvar voice_id da escolhida como `ELEVENLABS_VOICE_ARI_PT_FALLBACK` no `.env`

### 1.3 Parâmetros técnicos do ElevenLabs para o Speaking Kit

Sempre usar:
- Modelo: `eleven_multilingual_v2`
- `similarity_boost: 0.75`
- `style: 0` (neutro, não expressivo demais pra drills didáticos)
- `use_speaker_boost: true`

E variar `stability`:
- **Drills slow:** `stability 0.7` — articulação máxima, cada som distinto
- **Natural speed:** `stability 0.5` — ritmo natural de fala

> Future automation: there will be a `generate-drills.js` script that batches all 80 drills via API reading a manifest YAML. For now, you'll generate them via the web UI or use the `_tools/audio-generator/` CLI when it's built.

---

## 2. Cover redesign (PDF main)

The vault spec calls for **typography-only cover, no photos**, dark green background, geometric. This is a design pass.

- [ ] Open `speakeasy_pronunciation_kit.html` and locate the cover section
- [ ] Replace photo elements with typography (large title, subtitle, brand mark)
- [ ] Use brand colors (Hunter Green `#3a5a40` background, Dust Grey `#dad7cd` text)
- [ ] Re-generate PDF: `cd ../_tools/pdf-generator && node generate_pdfs.js`

---

## 3. Reconcile "80 tracks" vs "10 modules"

Vault spec flags this. Decide:
- (a) Ship 80 individual tracks (preferred — better UX, matches site copy)
- (b) Ship 10 long tracks (matches original PDF design but contradicts site)

If (a): make sure the Audio Index pages 15–16 of the PDF list the 80 individual files, not 10 modules.

---

## 4. Generate audio drill scripts via Claude (~1h)

Open Claude Code in this folder and ask:

> "Generate audio scripts for all 80 drills of the Speaking & Pronunciation Kit, organized by module (M01 to M08 + Bonus). Each drill follows: 1–2 PT-BR target words/phrases, slow + natural, contrast in minimal pairs when applicable, brief 2–5s English briefing before each drill. Output one .md file per module into `audio-scripts/`."

Validate at least 1 drill per module by reading aloud yourself before recording.

---

## 5. Record audio drills

### 5.1 Setup ElevenLabs settings

- **Slow drills:** `speed 0.7`, `stability 0.7` (max articulation)
- **Natural drills:** `speed 1.0`, `stability 0.5` (real conversation rhythm)

### 5.2 For Module 01 (Rhythm & Stress) and Module 08 (Connected Speech)

These benefit from human intonation. **Recommended: Arí records these 2 modules**.

- [ ] Arí records M01 (~8 drills × 2 speeds = 16 tracks) — same workflow as Everyday product MANUAL-STEPS § 4
- [ ] Arí records M08 (~10 drills × 2 speeds = 20 tracks)

### 5.3 For Modules 02–07 + Bonus (ElevenLabs)

- [ ] In ElevenLabs UI, paste each drill script
- [ ] Set speed/stability per slow/natural variant
- [ ] Generate, listen, regenerate if R/RR/NH/LH sounds wrong (it will sometimes)
- [ ] Download MP3, save to `audio/` with naming: `module-XX-drill-YY-slow.mp3` / `module-XX-drill-YY-natural.mp3`

> Future: this will be a CLI script with retry logic. For now, manual UI.

---

## 6. Post-production (manual for now)

For each track in `audio/`:

- [ ] Trim silence at start/end
- [ ] Normalize to -16 LUFS
- [ ] Confirm 128 kbps MP3 encoding

Future automation: `npm run normalize` will do all 3 in one ffmpeg pass.

---

## 7. Generate Plus & Pro extras (mostly Claude work)

Open Claude Code:

### 7.1 Plus extras

> "Generate the following deliverables for the Speaking & Pronunciation Kit Plus tier:
> 1. 10 dialogue scripts for the Listening Mini-Pack (scenarios per vault spec)
> 2. CSV file `flashcards-speaking-kit.csv` with ~150–200 Anki/Quizlet cards
> 3. Markdown content for 'Top 50 Mistakes for English Speakers' PDF (50 entries, format per vault spec)
>
> Save all to `extras/plus/` folder."

Then:
- [ ] Record the 10 dialogues in ElevenLabs (2 speeds × 2 voices = 40 tracks)
- [ ] Generate dialogue transcripts PDF (Claude or Canva)
- [ ] Convert "Top 50 Mistakes" MD → PDF (Canva or pdf-generator)

### 7.2 Pro extras

> "Generate for Speaking & Pronunciation Kit Pro tier:
> 1. 200 mini scripts for the Speaking Scripts Pack (2–3 variations each)
> 2. Markdown content for the 21-Day Fluency Plan (daily routine, 21 days)
> 3. 40–60 additional dialogue scripts for the Full Listening Booster (extending Mini-Pack to A1→B1)
>
> Save all to `extras/pro/`."

Then:
- [ ] Format Speaking Scripts Pack as PDF
- [ ] Format 21-Day Plan as PDF
- [ ] Record 40–60 booster dialogues (ElevenLabs batch — ~25k chars, fits in Starter)

---

## 8. Build delivery ZIPs

```bash
cd ~/projects/speakeasyptbr-products/speaking-pronunciation-kit
mkdir -p delivery

# Basic
mkdir -p delivery/basic-temp
cp pdf/speakeasy_pronunciation_kit.pdf delivery/basic-temp/
cp pdf/speakeasy_start_here.pdf delivery/basic-temp/
cp -r audio delivery/basic-temp/
cd delivery && zip -r speaking-kit-basic.zip basic-temp/* && rm -rf basic-temp && cd ..

# Plus (Basic + Plus extras)
mkdir -p delivery/plus-temp
cp -r delivery/basic-temp/* delivery/plus-temp/  # if you kept basic-temp; otherwise re-copy
cp -r extras/plus/* delivery/plus-temp/
cd delivery && zip -r speaking-kit-plus.zip plus-temp/* && rm -rf plus-temp && cd ..

# Pro (Plus + Pro extras)
mkdir -p delivery/pro-temp
cp -r delivery/plus-temp/* delivery/pro-temp/  # same caveat
cp -r extras/pro/* delivery/pro-temp/
cd delivery && zip -r speaking-kit-pro.zip pro-temp/* && rm -rf pro-temp && cd ..
```

Add a `README.txt` to each ZIP.

---

## 9. Lemon Squeezy upload

- [ ] Create product "Speaking & Pronunciation Kit" with 3 variants
- [ ] Upload `delivery/speaking-kit-basic.zip` → Basic variant (€29.90)
- [ ] Upload `delivery/speaking-kit-plus.zip` → Plus variant (€69.90, mark as DEFAULT)
- [ ] Upload `delivery/speaking-kit-pro.zip` → Pro variant (€129.90)
- [ ] Copy variant IDs to `speakeasyptbr-website/.env.local`:
      ```
      NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_BASIC=<id>
      NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_PLUS=<id>
      NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_PRO=<id>
      ```
- [ ] Test buy flow (each tier)

---

## Quick index of human bottlenecks

1. **Picking the ElevenLabs voice** (judgment, can't auto)
2. **Recording M01 + M08 with Arí** (or accepting full ElevenLabs)
3. **Cover redesign** (visual judgment)
4. **80 vs 10 tracks decision** (product decision)
5. **LS account upload** (no API for full UI flow)

Everything else is bulk content generation that Claude + ElevenLabs API will eventually handle.
