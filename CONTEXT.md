# CONTEXT.md — operational handoff

> **Read this first** when starting a session here. It's the "what's happening right now" snapshot.
>
> **Last updated:** 2026-04-15 (by Bandeira via a strategic Claude session)
>
> **Stale after ~1 week of work without update.** If the date above is >1 week old, ask the human for a status update before acting.

---

## 🎯 Current focus (in 1 sentence)

Finalizar setup do **audio-generator** tool (ElevenLabs API key + voice cloning Arí + smoke test) pra destravar a produção dos áudios do **Speaking & Pronunciation Kit** — o produto mais crítico no critical path do lançamento.

---

## 📊 State of the 3 products (master tracking)

| Produto | PDFs | Scripts áudio | Áudio gerado | Extras | LS upload | Site live |
|---|---|---|---|---|---|---|
| **Everyday Brazilian Portuguese** | ✅ pronto | 🟡 CH I + intro + closing done; CH II–X pending | ❌ Arí em gravação (manual) | n/a | ❌ | ❌ |
| **Speaking & Pronunciation Kit** | ✅ kit + start-here | ❌ pending (próximo step) | ❌ | ❌ | ❌ | ❌ |
| **Brazilian Listening Lab** | ❌ pending | ✅ 50 dialogues prontos | ❌ | ❌ | ❌ | ❌ |

Legenda: ✅ pronto · 🟡 parcial · ❌ não iniciado · n/a não se aplica

---

## 🚦 Critical path (ordem de execução acordada)

1. **Speaking Kit áudios** via `audio-generator` Opus production session (próximo)
2. **Everyday chapters II–X** recording guides pra Arí (via audio-generator Opus também, `mode: human_recording`)
3. **Listening Lab áudios** via audio-generator (último — dialogues já escritos, só precisa TTS)
4. Conforme cada produto finaliza → empacotar ZIPs via `npm run package` → upload manual LS → preencher variant IDs no `.env.local` do website
5. **GO LIVE** quando todos variant IDs no `.env.local`

---

## 🧰 The audio-generator tool (setup pendente)

Novo tool em `_tools/audio-generator/`. Arquitetura:

- Dirigido por **uma sessão Claude Code Opus separada** (production session). Não é você (esta sessão).
- Lê manifests YAML por produto
- Gera roteiros via 18 sub-prompts especializados
- Invoca CLIs ElevenLabs (`generate-audio`), ffmpeg (`post-process`), zip (`package`)

**Pra aprofundar:** leia `_tools/audio-generator/README.md` + `_tools/audio-generator/AGENT.md`.

### Setup humano pendente (bloqueia primeira production session)

- [ ] **API key ElevenLabs** — pegar em https://elevenlabs.io → Profile → API Keys → colocar em `_tools/audio-generator/.env`
- [ ] **Sample cloning Arí** — Opus agent gera o script (prompt `07-cloning-sample-ari.md`), Arí grava ~1 min, upload no ElevenLabs Voice Lab, salvar voice_id
- [ ] **Sample cloning Bandeira** — mesmo processo, prompt `08-cloning-sample-bandeira.md`
- [ ] **Smoke test** — `cd _tools/audio-generator && npm install && npm run test-voice -- --voice ari_pt --text "banho. ba-nho. banho."`

Se o smoke test retornar MP3 audível com pronúncia correta de NH/LH/RR → pipeline validado, pronto pra primeira production session.

---

## 🔒 Decisões recentes (últimas 2 semanas)

- **2026-04-15:** Construído `audio-generator` tool. Linha de produção dirigida por Opus agent + manifests YAML + 18 sub-prompts + 4 CLIs.
- **2026-04-14:** TTS provider = **ElevenLabs Creator ($22/mo)**. Fish Audio descartado (TTS suporta apenas EN/ZH/JA).
- **2026-04-13:** Persona mascote do content generator = **Mango** (papagaio), não Tico. Layla fala PT e EN como mesma persona.
- **2026-04-13:** Reorganizado este repo em 3 subpastas por produto + `_tools/`. Scripts dos 50 dialogues do Listening Lab movidos do website pra cá.

---

## 🚧 Bloqueios externos (não depende de você)

- **Arí gravar sample de cloning** (~1 min de áudio limpo). Depende de ela ter 15 min num momento de calma.
- **Arí terminar gravação Everyday chapters I + 90 lessons**. Produção em curso, sem ETA travada.
- **Lemon Squeezy account** — ainda não criado. Criar quando primeiro produto estiver empacotado.

---

## 🔗 Decisões pendentes que Bandeira está ruminando

- **Reconciliação chapter names Everyday** (PDF diz uma coisa, landing page do website diz outra). 3 opções: (a) site paraphraseia (zero ação), (b) editar site, (c) editar PDF + regenerar. **Decidir esta semana.**
- **Ordem das gravações Speaking Kit** — M01 (Arí) primeiro pra validar o workflow humano, ou direto nos TTS (M02–M07)? **Decidir antes da primeira production session.**
- **SuperGrok subscription review** — $35/mo, sobrepõe com Claude Max. Operating Principle: se não for usado em ≥1 task/semana que Claude não resolve em 30 dias, cancelar.

---

## 🧱 Architecture-as-docs (onde tudo mora)

### Neste repo
- `README.md` — master tracking
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
