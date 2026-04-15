# SpeakEasy Portuguese — Products

> Studio de produção dos 3 produtos digitais vendidos no website. Cada produto vive em sua própria pasta com PDFs, scripts de áudio, extras, e checklist de status. Este README é o **master tracking** — abra aqui pra ver o estado geral.

## Quick links

- 🌐 **Website (consumidor):** `~/projects/speakeasyptbr-website/`
- 🏠 **Workspace concierge:** `~/projects/speakeasy/`
- 📚 **Specs canônicas (Obsidian vault):** `[vault]/10 - Projects/SpeakEasy Portuguese/Products/`

## Master tracking — onde está cada produto

> Atualize esta tabela quando alguma fase mudar de status.

| Produto | Tier(s) | PDFs | Scripts áudio | Áudio gerado | Extras | LS upload | Site live |
|---|---|---|---|---|---|---|---|
| **[Everyday Brazilian Portuguese](./everyday-brazilian-portuguese/)** | E-book €9.90 / Bundle €19.90 | ✅ pronto | 🟡 ch I + intro + closing | ❌ pendente (Arí) | n/a | ❌ | ❌ |
| **[Speaking & Pronunciation Kit](./speaking-pronunciation-kit/)** | €29.90 / €69.90 / €129.90 | ✅ kit + start-here | ❌ pendente | ❌ pendente | ❌ pendente | ❌ | ❌ |
| **[Brazilian Listening Lab](./brazilian-listening-lab/)** | €19.90 / €39.90 / €59.90 | ❌ pendente | ✅ 50 dialogues | ❌ pendente | ❌ pendente | ❌ | ❌ |

Legenda: ✅ pronto · 🟡 parcial · ❌ não iniciado · n/a não se aplica

## Critical path para lançamento do site

```
1. Everyday Brazilian Portuguese (mais perto de pronto)
   └→ áudios Arí + CTA link + cover update
   └→ ZIP + LS upload + variant ID
   └→ Site pode anunciar este produto

2. Speaking & Pronunciation Kit (PDF pronto, falta tudo de áudio + extras)
   └→ Generate scripts via Claude
   └→ Record (ElevenLabs + Arí em M01/M08)
   └→ Plus & Pro extras
   └→ 3 ZIPs + LS upload + 3 variant IDs

3. Brazilian Listening Lab (scripts prontos, falta áudio + PDFs)
   └→ Record dialogues (ElevenLabs)
   └→ Generate PDFs (Claude)
   └→ 3 ZIPs + LS upload + 3 variant IDs

GO LIVE: site activates Buy buttons quando todos os variant IDs estão
no .env.local de speakeasyptbr-website
```

Para uma estimativa realista de tempo: ver vault spec de cada produto.

## Estrutura do repo

```
speakeasyptbr-products/
├── README.md                          ← este arquivo (master tracking)
│
├── everyday-brazilian-portuguese/     ← produto 1
│   ├── README.md                      ← overview do produto
│   ├── TODO.md                        ← checklist detalhado
│   ├── MANUAL-STEPS.md                ← ações que exigem você
│   ├── speakeasy_ebook_FINAL.html     ← source HTML do PDF
│   ├── assets/                        ← SVGs (Arara, Cristo, Logos, Palacio)
│   ├── pdf/                           ← PDFs gerados (commit pra ter snapshot)
│   ├── audio-scripts/                 ← scripts pra Arí gravar (criar conforme TODO)
│   └── audio/                         ← MP3s finais (não commit, gitignored)
│
├── speaking-pronunciation-kit/        ← produto 2
│   ├── README.md, TODO.md, MANUAL-STEPS.md
│   ├── speakeasy_pronunciation_kit.html
│   ├── speakeasy_start_here.html
│   ├── pdf/
│   ├── audio-scripts/                 ← 8 módulos × ~10 drills cada
│   ├── audio/                         ← 80 tracks (gitignored)
│   ├── extras/
│   │   ├── plus/                      ← Mini-Pack, flashcards, Top 50 Mistakes
│   │   └── pro/                       ← Speaking Scripts Pack, 21-Day Plan, Booster
│   └── delivery/                      ← ZIPs finais (gitignored)
│
├── brazilian-listening-lab/           ← produto 3
│   ├── README.md, TODO.md, MANUAL-STEPS.md
│   ├── audio-scripts/
│   │   └── dialogues.md               ← ⭐ 50 scripts (já prontos)
│   ├── pdfs-source/                   ← HTMLs por tier (gerar via Claude)
│   ├── pdf/                           ← PDFs gerados
│   ├── audio/                         ← MP3s (gitignored)
│   ├── extras/                        ← CSV flashcards, exercises, guides
│   └── delivery/                      ← ZIPs finais (gitignored)
│
└── _tools/
    └── pdf-generator/                 ← Puppeteer wrapper para HTML→PDF
        ├── README.md
        ├── generate_pdfs.js
        ├── package.json
        └── node_modules/              ← gitignored
```

**Convenção:** PDFs gerados são commitados (snapshots versionados); MP3s finais e ZIPs de delivery NÃO são commitados (muito grandes, regeneráveis).

## Workflows comuns

### Gerar / regenerar todos os PDFs

```bash
cd _tools/pdf-generator
npm install   # primeira vez
node generate_pdfs.js
```

Outputs:
- `everyday-brazilian-portuguese/pdf/everyday_brazilian_portuguese.pdf`
- `speaking-pronunciation-kit/pdf/speakeasy_pronunciation_kit.pdf`
- `speaking-pronunciation-kit/pdf/speakeasy_start_here.pdf`

### Adicionar um novo PDF source

1. Crie o HTML em `<produto>/<arquivo>.html` (use os existentes como referência de classes `.page`)
2. Adicione no array `EBOOKS` em `_tools/pdf-generator/generate_pdfs.js`
3. Re-rode

### Verificar progresso geral

Releia este `README.md` (a tabela acima) ou navegue ao TODO.md de cada produto.

## Stack técnica

- **PDF gen:** Node + Puppeteer + pdf-lib
- **Audio gen:** ElevenLabs (UI manual hoje, futura API automation) + recording humano (Arí)
- **Content gen:** Claude Code (scripts, transcripts, exercícios, CSVs)
- **Delivery:** ZIPs uploaded pra Lemon Squeezy

## Próxima fase (depois desta organização)

Quando os 3 TODOs estiverem mais avançados (dezenas de itens em curso), vamos construir um pequeno sisteminha pra:
- Gerar áudios em batch via ElevenLabs API
- Build automático de ZIPs por tier (manifest YAML por tier)
- Normalização batch via ffmpeg
- Status dashboard local

Por agora, a fase é **destravar produção via Claude + execução manual estruturada**.

## Brand

- Instagram: [@speakeasy.ptbr](https://instagram.com/speakeasy.ptbr)
- Website: [speakeasyptbr.com](https://speakeasyptbr.com)

## Linked

- Workspace meta-repo: `~/projects/speakeasy/README.md`
- Website (consumer): `~/projects/speakeasyptbr-website/`
- Content generator (organic social): `~/projects/speakeasy-content-generator/`
- Vault canonical: `[vault]/10 - Projects/SpeakEasy Portuguese/`
