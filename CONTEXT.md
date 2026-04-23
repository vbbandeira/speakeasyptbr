# CONTEXT.md — operational handoff

> **Read this first** when starting a session here. It's the "what's happening right now" snapshot.
>
> **Last updated:** 2026-04-23 (Everyday CTAs pivoted + BLL Flashcards PDF shipped + deliveries repackaged)
>
> **Stale after ~1 week of work without update.** If the date above is >1 week old, ask the human for a status update before acting.

---

## 🎯 Current focus (in 1 sentence)

**Prep pra launch de 2 produtos:** Everyday €9.90 + Brazilian Listening Lab (3 tiers) estão ship-ready; próximo passo é **setup Lemon Squeezy** + handoff pro agente do site (ver `DELIVERABLES.md`). Speaking & Pronunciation Kit fica em Phase 2, bloqueado pela gravação da Layla.

---

## 📊 State of the 3 products (master tracking)

| Produto | PDFs | Áudio | Extras | Delivery pkg | LS upload | Site live |
|---|---|---|---|---|---|---|
| **Everyday Brazilian Portuguese** | ✅ todos (emojis Apple, CTA pivotado pra BLL) | 🟡 CH I + intro + closing done; CH II–X pending Layla | ✅ Culture Guide + One Day transcript | 🟢 €9.90 pronto · 🟡 €19.90 parcial | ❌ | ❌ |
| **Brazilian Listening Lab** | ✅ Start Here + Transcripts 3 tiers + Workbook Plus/Pro + Flashcards Pro | ✅ 50 dialogues (natural+slow) + 5 deep-dives | ✅ Vocabulary Flashcards PDF (341 cards, Pro) | 🟢 **3 tiers prontos** | ❌ | ❌ |
| **Speaking & Pronunciation Kit** | ✅ Kit + Start Here (emojis Apple) | ❌ Layla pending (46 drills + 13 bonus) | ⚪ Plus/Pro extras não iniciados | ❌ | ❌ | ❌ |

Legenda: 🟢 100% pronto · ✅ artefato existe · 🟡 parcial · ⚪ não iniciado · ❌ etapa seguinte bloqueada

---

## 🚦 Critical path (revisado 2026-04-23)

**Phase 1 — Launch imediato (não depende da Layla):**
1. **Empacotar Lemon Squeezy**: Everyday €9.90 + BLL Basic/Plus/Pro (4 variants no total)
2. **Handoff ao agente do site**: compartilhar `DELIVERABLES.md` + LS variant IDs pra preencher `.env.local` no `speakeasyptbr-website`
3. **End-to-end buy test** dos 4 variants
4. **GO LIVE** com 2 produtos

**Phase 2 — Desbloqueio Layla (TBD, depende do ritmo dela):**
5. Everyday CH II–X audio → destrava €19.90 bundle
6. Pronunciation Kit drills (46 lessons + 13 bonus) → destrava €29.90 Basic
7. Pronunciation Kit Plus extras (Minimal Pair Flashcards, Top 50 Mistakes PDF, Quick-Reference Sheet) → destrava €69.90
8. Pronunciation Kit Pro extras (Speaking Scripts Pack 200, 21-Day Plan, Regional Accent Guide) → destrava €129.90
9. Re-adicionar Kit como passo do meio nas CTAs do Everyday (`speakeasy_ebook_FINAL.html` página final + `speakeasy_culture_guide.html` última página + `speakeasy_start_here.html` page 04)

---

## 🧰 The audio-generator tool (setup pendente)

Novo tool em `_tools/audio-generator/`. Arquitetura:

- Dirigido por **uma sessão Claude Code Opus separada** (production session). Não é você (esta sessão).
- Lê manifests YAML por produto
- Gera roteiros via 18 sub-prompts especializados
- Invoca CLIs ElevenLabs (`generate-audio`), ffmpeg (`post-process`), zip (`package`)

**Pra aprofundar:** leia `_tools/audio-generator/README.md` + `_tools/audio-generator/AGENT.md`.

### Setup concluído ✅ (2026-04-17)

- [x] **API key ElevenLabs** — configurada em `_tools/audio-generator/.env`
- [x] **Voz Layla** (feminina, clonada) — `ELEVENLABS_VOICE_LAYLA_PT` — voz principal de todo o conteúdo
- [x] **Voz Paulo** (masculina) — `ELEVENLABS_VOICE_MALE_PT` — apenas para diálogos com 2 speakers
- [x] **npm install** — deps instaladas
- [x] **Smoke tests** — Layla (464KB) + Paulo (56KB) OK
- [x] **Manifests atualizados** — Arí→Layla, Bandeira→Male, fallbacks removidos

### Rodou em produção ✅ (2026-04-22/23)

- [x] **Listening Lab (todos os 50 diálogos)** — Layla + Paulo, gerados via pipeline completo
- [x] **Slow versions (50)** — ffmpeg atempo=0.75 pós-processamento
- [x] **Deep-dive podcasts (5)** — single-voice Layla, narração longa
- [x] **One Day in Brazil** (Everyday bonus) — Carla voice, ~8 min immersion audio

### Uso futuro do pipeline

O audio-generator **não será usado** pro Speaking & Pronunciation Kit (pivot definitivo pra Layla humana — AI errava ~5–10% das palavras em contexto de drill isolado). Pipeline permanece disponível caso futuros produtos/conteúdo precisem de áudio AI-friendly (stories, dialogues, narrations).

---

## 🔒 Decisões recentes (últimas 2 semanas)

- **2026-04-23:** CTAs do Everyday pivotadas do Pronunciation Kit → Brazilian Listening Lab em 3 páginas (`speakeasy_ebook_FINAL.html` Next Steps, `speakeasy_culture_guide.html` última página, `speakeasy_start_here.html` page 04). Motivo: Kit bloqueado na Layla, LL pronto pra launch. `DELIVERABLES.md` reescrito pra refletir Phase 1 (Everyday + LL) e Phase 2 (Kit quando desbloquear).
- **2026-04-23:** `Vocabulary Flashcards` do BLL entregue como PDF printable (341 cards, 4 por página, 104 páginas) ao invés de CSV Anki. Substituto único pra todos os buyers do Pro (sem variantes Plus/Pro separadas). Emoji mapper semântico por termo com 100+ regras priorizadas + word-boundary matcher (`_has_keyword` em `build-flashcards-pdf.py`).
- **2026-04-23:** Migração de emojis **Noto Color Emoji → Twemoji + iamcal/emoji-data (img-apple-160)** em todos os HTMLs e Python generators. Consistente com o pattern já usado no sibling `speakeasy-content-generator`. Todos os PDFs regerados. Causa: inconsistência visual entre produtos (Android-style Noto) e os reels/carrosséis (Apple-style).
- **2026-04-23:** Fixes de qualidade no tooling: `subprocess.run` em `package-products.py` agora usa `encoding="utf-8", errors="replace"` (evita `UnicodeDecodeError` em stderr do ffmpeg); 4 scripts Python recebem `sys.stdout.reconfigure(encoding="utf-8")` no boot (rodam nativo no PowerShell/cmd sem wrapper `PYTHONIOENCODING=utf-8`).
- **2026-04-23:** `generate_pdfs.js` ganhou filtro CLI: `node generate_pdfs.js <keyword>` regenera subset casando pelo label (`flashcards`, `everyday`, `pronunciation kit`). Evita re-gerar 14 PDFs quando só 1 mudou.
- **2026-04-22/23:** BLL subiu de "not started" → "ship-ready". Todos os 50 diálogos gerados via ElevenLabs (Layla clone + Paulo), 50 slow versions via ffmpeg atempo=0.75, 5 deep-dive podcasts, Transcripts (3 tiers), Comprehension Workbook (Plus/Pro). Pricing firme: €19.90 / €39.90 / €59.90.
- **2026-04-21:** `DELIVERABLES.md` criado (agora reescrito na versão 2026-04-23).
- **2026-04-17:** Setup audio-generator concluído. API key + 2 vozes (Layla clone + Paulo male) + smoke tests OK.
- **2026-04-15:** Construído `audio-generator` tool (manifests YAML + Opus agent + CLIs).
- **2026-04-14:** TTS provider = **ElevenLabs Creator ($22/mo)**. Fish Audio descartado.
- **2026-04-13:** Persona mascote do content generator = **Mango** (papagaio). Reorganizado este repo em 3 subpastas por produto + `_tools/`.

---

## 🚧 Bloqueios externos (não depende de você)

- **Layla gravar os áudios restantes** — 90 phrases do Everyday (CH II–X) + 46 drills do Kit + 13 bonus survival phrases. Sem ETA travada. Único bloqueio crítico pra Phase 2.
- **Lemon Squeezy account** — ainda não criado. Criar antes do Phase 1 launch (Everyday €9.90 + BLL 3 tiers = 4 variants).

---

## 🔗 Decisões pendentes que Bandeira está ruminando

- **Bundle discount cross-produto** — buyer do BLL Pro ganha Everyday €9.90 free? Ou desconto na compra conjunta? (Discussão em `DELIVERABLES.md` > Open questions.)
- **Lead magnet pra email capture** — 1 página do Culture Guide ("beijo rules by region") OU 1 diálogo sample do BLL? (Culture Guide ganha por ser inherentemente shareável.)
- **Reconciliação chapter names Everyday** (PDF vs landing page do website). Pendente desde 2026-04-17.
- **Ordem das gravações do Kit** (Layla) — começar por Chapter 01 Rhythm pra validar workflow humano antes de escalar? Decidir antes da primeira session de gravação.

---

## 🧱 Architecture-as-docs (onde tudo mora)

### Neste repo
- `DELIVERABLES.md` — **source of truth pros produtos** (o que ship hoje, launch strategy, copy pro site, checklists por tier). Compartilhar com o agente do site.
- `README.md` — master tracking table dos 3 produtos
- Per-product `README.md` + `TODO.md` + `MANUAL-STEPS.md`
- `_tools/audio-generator/AGENT.md` — production agent contract
- `_tools/audio-generator/manifests/*.yaml` — source of truth per product (stations, vozes, audio format, bundles)
- `_tools/audio-generator/prompts/*.md` — 18 sub-prompts especializados

### No vault Obsidian (estratégia, personas, decisões)
`C:\Users\Vinicius\Documents\obsidian\kbc-windows\10 - Projects\SpeakEasy Portuguese\`

- `00 - INDEX.md` — entrada do projeto
- `Products/` — spec canônica de cada produto (que informa o marketing + o design dos audios)
- `Content Generator/` — subsistema separado (reels/carrosséis), mas ElevenLabs é compartilhada — voice cloning feito aqui pode ser reaproveitado pro Layla persona dos reels

### Sibling repos
- `~/projects/speakeasyptbr-website/` — site Next.js + Lemon Squeezy checkout
- `~/projects/speakeasy-content-generator/` — reels + carrosséis (Remotion + Opensquad)
- `~/projects/speakeasy/` — concierge meta-repo

---

## ✳️ Bootstrap pra outra sessão Claude

Pra trazer uma sessão Claude nova ao contexto SpeakEasy (seja Opus production session, seja uma Sonnet de operação leve), cole isto no primeiro prompt:

```
Abri você em ~/projects/speakeasyptbr-products/.
Leia CLAUDE.md (constituição) e CONTEXT.md (estado atual) pra se localizar.
Depois me diga qual você acha que é o próximo passo mais útil
dado onde estamos. Não execute nada ainda.
```

Se a tarefa for de produção de áudio específica:

```
Leia _tools/audio-generator/AGENT.md e execute Phase 1 (scripts)
do speaking-pronunciation-kit. Stop and report when done.
```

---

## 🗃️ Update policy

Este doc fica estale rápido. Regra:

- **Atualiza:** quando uma decisão é travada, quando um produto muda de coluna no tracking, quando um bloqueio desaparece, quando um novo bloqueio aparece.
- **Não atualiza:** pra progresso granular (isso vive nos TODO.md de cada produto) ou mudanças de código (isso vive no git log).

**Se este doc estiver >1 semana sem update E alguém abrir sessão nova, a sessão deve perguntar antes de agir.** Contexto rançoso é pior que sem contexto.
