# Brazilian Listening Lab — MANUAL STEPS

> Things that require **YOUR** action. Mark boxes as you complete each step.
>
> Companion to [`TODO.md`](./TODO.md).

---

## 1. Set up voices in ElevenLabs (2 voices — Speaker A + Speaker B)

> Este produto precisa de 2 vozes (pro usuário se acostumar com múltiplos falantes). **Assinatura compartilhada:** ElevenLabs Creator $22/mês, mesma dos outros produtos e do content generator.

### 1.1 Se ainda não tem a conta Creator

- [ ] Login em https://elevenlabs.io, subir pra **Creator plan ($22/mês, 100k chars + voice cloning)**
- [ ] Gerar API key em **Profile → API Keys** → salvar como `ELEVENLABS_API_KEY` no `.env`

### 1.2 Voice cloning (preferido — identidade da marca)

- [ ] **Speaker A (feminino) — clone da Arí:** se ainda não foi feito no Speaking Kit, seguir o guia em `../speaking-pronunciation-kit/MANUAL-STEPS.md` § 1.1. Salvar como `ELEVENLABS_VOICE_ARI_PT`.
- [ ] **Speaker B (masculino) — clone do Bandeira (você):**
      - Gravar ~1min de áudio limpo falando português natural (critérios de sample iguais aos da Arí)
      - ElevenLabs → Voice Lab → Instant Voice Clone
      - Upload, nomear: `Bandeira BR-PT`
      - Salvar o `voice_id` como `ELEVENLABS_VOICE_BANDEIRA_PT` no `.env`

### 1.3 Fallback (marketplace — se um dos clones ficar estranho)

- [ ] Speaker A feminino: "Valentina" ou "Fernanda"
- [ ] Speaker B masculino: procurar "Antonio" ou outra voz masculina BR no marketplace
- [ ] Salvar voice_ids como `ELEVENLABS_VOICE_SPEAKER_A_FALLBACK` / `ELEVENLABS_VOICE_SPEAKER_B_FALLBACK`

### 1.4 Consistência entre dialogues

> Uma vez escolhidas as 2 vozes, **não mude entre dialogues**. Use sempre mesma Speaker A pra falas femininas e mesma Speaker B pra falas masculinas em todos os 50 dialogues. O usuário aprende por exposição repetida à mesma voz.

### 1.5 Parâmetros técnicos (via API)

- Modelo: `eleven_multilingual_v2`
- Slow speed: `stability 0.7`
- Natural speed: `stability 0.5`
- `similarity_boost: 0.75` · `style: 0.2–0.4` (pouco mais expressivo que drills, conversação natural) · `use_speaker_boost: true`

### 1.6 Volume estimado

50 dialogues × 2 speeds × média ~250 chars = **~25k chars** total + 5 mini-podcasts (~15k chars cada) + 5 dictations. Total aproximado **~65k chars**. Cabe no Creator $22/mo (100k/mês) se distribuído em 1–2 meses, ou você paga proporcional o excedente se quiser fazer tudo num mês. Outros produtos usando a mesma conta contam no mesmo budget — coordenar lançamentos.

---

## 2. Recording the 50 dialogues

### Per-dialogue workflow

1. Open `audio-scripts/dialogues.md`, find the next ungenerated dialogue
2. Identify the 2 speakers (Speaker A, Speaker B)
3. Assign: Speaker A → feminine voice, Speaker B → masculine voice (or vice versa, just be consistent across dialogues)
4. In ElevenLabs UI, paste each line of the dialogue, alternating voices
5. Generate at **slow speed** (`speed 0.75`, `stability 0.7`)
6. Listen, regenerate any line where reductions/slang sound wrong
7. Download as `dialogue-XX-slow.mp3`
8. Repeat at **natural speed** (`speed 1.0`, `stability 0.5`)
9. Save as `dialogue-XX-natural.mp3`

### Saving convention

Save in `audio/` with naming:
```
audio/
├── dialogue-01-slow.mp3
├── dialogue-01-natural.mp3
├── dialogue-02-slow.mp3
├── dialogue-02-natural.mp3
...
├── dialogue-50-natural.mp3
├── mini-podcasts/
│   ├── podcast-01-festas-juninas.mp3
│   ├── podcast-02-...
│   └── ... (5 total, Pro tier)
└── dictation/
    ├── dictation-01.mp3
    └── ... (5 total, Pro tier)
```

### Order of recording

Don't try to do all 50 at once. Suggested batches:

- Batch 1 (Basic launch): dialogues #1–#15 + Start Here PDF → ship Basic
- Batch 2 (Plus launch): dialogues #16–#30 + Plus extras → ship Plus
- Batch 3 (Pro launch): dialogues #31–#50 + mini-podcasts + dictations → ship Pro

You can ship Basic while still working on Plus/Pro.

---

## 3. Generate PDFs and extras (mostly Claude work)

For each tier, open Claude Code in this folder and ask for the deliverables. Examples:

### 3.1 Basic

> "From `audio-scripts/dialogues.md`, take dialogues #1–#15 and produce:
> 1. Start Here PDF (HTML source) — listening guide tips, 2 pages
> 2. Basic Transcripts PDF (HTML source) — 15 dialogues with line-by-line EN translation, vocab notes (3–5 key words per dialogue), comprehension questions (3–5 per dialogue)
>
> Save HTML sources to `pdfs-source/basic/`. Then run `_tools/pdf-generator` to build PDFs."

### 3.2 Plus extras

> "From `audio-scripts/dialogues.md`, take dialogues #16–#30 and add to the existing transcripts.
> Generate:
> 1. Expanded transcripts PDF (30 dialogues + cultural context notes per dialogue)
> 2. Fill-the-gap exercises PDF (1 exercise per dialogue, 30 total)
> 3. Flashcards CSV (Anki/Quizlet, 150–200 cards from all dialogues so far)
> 4. Top 30 Listening Traps PDF (contractions cê/tá/tô/pra/etc., reductions, false slang)
>
> Save to `pdfs-source/plus/` and `extras/plus/`."

### 3.3 Pro extras

> "From `audio-scripts/dialogues.md`, take dialogues #31–#50 and complete the set.
> Also generate:
> 1. Full transcripts PDF (all 50)
> 2. 5 mini-podcast scripts (~3–5 min each, monólogos sobre cultura BR — exemplos: festas juninas, sotaques, futebol, comida, gírias)
> 3. Dictation exercises PDF (5 exercises)
> 4. Brazilian Slang & Reductions Guide PDF
> 5. Regional Accents Overview PDF
>
> Save to `pdfs-source/pro/` and `extras/pro/`."

---

## 4. Convert HTML sources to PDFs

After Claude generates HTML files in `pdfs-source/`, you'll need to add them to the `_tools/pdf-generator/generate_pdfs.js` config (the `EBOOKS` array) and re-run.

This is currently a small manual step — eventually a future automation will scan `pdfs-source/` and auto-add. For now:

- [ ] Edit `_tools/pdf-generator/generate_pdfs.js` to include each new HTML
- [ ] Run `node generate_pdfs.js`
- [ ] Confirm PDFs land in `brazilian-listening-lab/pdf/`

---

## 5. Post-production (manual for now)

For each track in `audio/`:

- [ ] Trim silence start/end
- [ ] Normalize -16 LUFS
- [ ] MP3 128 kbps

Future automation: shared `npm run normalize` will handle batch processing.

---

## 6. Build delivery ZIPs

```bash
cd ~/projects/speakeasyptbr-products/brazilian-listening-lab
mkdir -p delivery

# Basic
mkdir -p delivery/basic-temp/audio
cp pdf/*-basic-*.pdf delivery/basic-temp/   # adjust to your PDF names
cp audio/dialogue-{01..15}-{slow,natural}.mp3 delivery/basic-temp/audio/
cd delivery && zip -r listening-lab-basic.zip basic-temp/* && rm -rf basic-temp && cd ..

# Plus (Basic + Plus extras)
mkdir -p delivery/plus-temp/audio
cp pdf/*-plus-*.pdf delivery/plus-temp/
cp -r extras/plus/* delivery/plus-temp/
cp audio/dialogue-{01..30}-{slow,natural}.mp3 delivery/plus-temp/audio/
cd delivery && zip -r listening-lab-plus.zip plus-temp/* && rm -rf plus-temp && cd ..

# Pro
mkdir -p delivery/pro-temp/audio
cp pdf/*.pdf delivery/pro-temp/
cp -r extras/pro/* delivery/pro-temp/
cp audio/dialogue-{01..50}-{slow,natural}.mp3 delivery/pro-temp/audio/
cp -r audio/mini-podcasts delivery/pro-temp/audio/
cp -r audio/dictation delivery/pro-temp/audio/
cd delivery && zip -r listening-lab-pro.zip pro-temp/* && rm -rf pro-temp && cd ..
```

Add a `README.txt` to each ZIP.

---

## 7. Lemon Squeezy upload

Same pattern as the other products:

- [ ] Create product "Brazilian Listening Lab" with 3 variants
- [ ] Upload each ZIP to its variant
- [ ] Copy IDs to `speakeasyptbr-website/.env.local`
- [ ] Smoke test each tier

---

## Quick index of human bottlenecks

1. **Picking the 2 ElevenLabs voices** (one-time judgment)
2. **Reviewing each generated dialogue audio** (regenerating bad ones)
3. **Decisions on PDF visual style** (use existing brand template, but minor judgment per PDF)
4. **LS upload** (no API)

The dialogue scripts are already done — that was the biggest creative input. Everything else is execution.
