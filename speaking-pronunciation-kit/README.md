# Speaking & Pronunciation Kit

> The 8 sounds that separate "knowing the words" from "sounding Brazilian." PDF guide + audio drills + extras (Listening Mini-Pack, Flashcards, Top 50 Mistakes, 21-Day Plan).

**Status:** 🟡 PDFs ready · 80 audio drills + Plus/Pro extras pending
**Site badge:** HOT DEAL
**Pricing:** €29.90 (Basic) / €69.90 (Plus, MOST POPULAR) / €129.90 (Pro)

## Tracking

- 📋 **What's left to do:** see [`TODO.md`](./TODO.md)
- 👤 **What needs YOUR action:** see [`MANUAL-STEPS.md`](./MANUAL-STEPS.md)

## Where things live

| Item | Path |
|---|---|
| Main PDF source (HTML) | [`speakeasy_pronunciation_kit.html`](./speakeasy_pronunciation_kit.html) |
| Start Here PDF source | [`speakeasy_start_here.html`](./speakeasy_start_here.html) |
| Generated PDFs | [`pdf/`](./pdf/) |
| Audio scripts | `audio-scripts/` (to be created — see TODO) |
| Final audio drills | `audio/` (~80 tracks, MP3) |
| Extras (Plus & Pro) | `extras/` (CSV, additional PDFs, dialogues) |
| Final delivery ZIPs | `delivery/` (3 ZIPs — basic, plus, pro) |
| Spec docs (vault) | `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Speaking & Pronunciation Kit.md` |
| Site copy | `~/projects/speakeasyptbr-website/docs/products/speaking-pronunciation-kit.md` |

## Tier structure (3 variants on Lemon Squeezy)

| Tier | Price | Includes |
|---|---|---|
| **Basic** | €29.90 | PDF guide + Start Here PDF + 80 audio drills + 14-day plan |
| **Plus** | €69.90 | Basic + Listening Mini-Pack (10 dialogues) + Anki/Quizlet flashcards CSV + Top 50 Mistakes PDF |
| **Pro** | €129.90 | Plus + Full Listening Booster (40–60 dialogues) + Speaking Scripts Pack (200 scripts) + 21-Day Fluency Plan PDF |

## Production stack

- **PDFs:** HTML → Puppeteer (`_tools/pdf-generator/generate_pdfs.js`)
- **Audio drills:** ElevenLabs (Valentina/Fernanda voice) + optional Arí for modules 01 & 08
- **Extras:** Claude Code generates scripts/CSV/PDFs

## Production order (per vault spec)

1. **Etapa 1 + 2** → unlock **Basic** (€29.90) for launch
2. **Top 50 Mistakes + Flashcards CSV + Mini-Pack** → unlock **Plus** (€69.90)
3. **Speaking Scripts Pack + 21-Day Plan** → unlock **Pro partial** (€129.90)
4. **Full Listening Booster** → unlock **Pro complete**

Realistic timeline: **Basic in ~1 week**, Plus in +1 week, Pro complete in +2 weeks.

## Site dependency

3 variant IDs needed in `~/projects/speakeasyptbr-website/.env.local`:
```
NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_BASIC=
NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_PLUS=
NEXT_PUBLIC_LS_VARIANT_ID_PRONUNCIATION_PRO=
```

## Linked

- Vault canonical spec: `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Speaking & Pronunciation Kit.md`
- Workspace concierge: `~/projects/speakeasy/README.md`
- Sibling products:
  - [Everyday Brazilian Portuguese](../everyday-brazilian-portuguese/README.md)
  - [Brazilian Listening Lab](../brazilian-listening-lab/README.md)
