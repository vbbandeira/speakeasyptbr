# Brazilian Listening Lab

> "Eu entendo quando leio, mas quando brasileiro fala comigo eu travo." This product solves that. Real-world dialogues (Uber, padaria, churrasco, farmácia, praia, etc.) with slow + natural speeds, transcripts, comprehension exercises, and listening traps guides.

**Status:** 🟡 Scripts ready (50 dialogues) · audio + PDFs all pending
**Site badge:** NEW ARRIVAL
**Pricing:** €19.90 (Basic) / €39.90 (Plus, MOST POPULAR) / €59.90 (Pro)

## Tracking

- 📋 **What's left to do:** see [`TODO.md`](./TODO.md)
- 👤 **What needs YOUR action:** see [`MANUAL-STEPS.md`](./MANUAL-STEPS.md)

## Where things live

| Item | Path |
|---|---|
| Dialogue scripts (50, the source!) | [`audio-scripts/dialogues.md`](./audio-scripts/dialogues.md) |
| PDF sources (HTML) | `pdfs-source/` (to be created) |
| Generated PDFs | `pdf/` (to be created) |
| Final audio MP3s | `audio/` (~110 tracks across all tiers) |
| Mini-podcasts (Pro tier) | `audio/mini-podcasts/` |
| Extras (CSV, exercises, guides) | `extras/` |
| Final delivery ZIPs | `delivery/` (3 ZIPs) |
| Spec docs (vault) | `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Brazilian Listening Lab.md` |
| Site copy | `~/projects/speakeasyptbr-website/docs/products/brazilian-listening-lab/product-spec.md` |

## Tier structure (3 variants on Lemon Squeezy)

| Tier | Price | Includes |
|---|---|---|
| **Basic** | €19.90 | 15 dialogues (A1–A2) × 2 speeds + transcripts + Start Here PDF |
| **Plus** | €39.90 | 30 dialogues (A1–B1) × 2 speeds + fill-the-gap exercises + cultural notes + flashcards CSV + Top 30 Listening Traps PDF |
| **Pro** | €59.90 | 50 dialogues (A1–B2) × 2 speeds + 5 mini-podcasts + dictation exercises + Slang & Reductions Guide + Regional Accents Overview |

## Production stack

- **Scripts:** ✅ Done (Claude/ChatGPT — see `audio-scripts/dialogues.md`)
- **Audio:** ❌ ElevenLabs (2 voices: Valentina/Fernanda + masculine equivalent — Antonio or similar)
- **PDFs:** Claude Code generates Markdown → HTML → Puppeteer (`_tools/pdf-generator/`)

## Site dependency

3 variant IDs needed in `~/projects/speakeasyptbr-website/.env.local`:
```
NEXT_PUBLIC_LS_VARIANT_ID_LISTENING_BASIC=
NEXT_PUBLIC_LS_VARIANT_ID_LISTENING_PLUS=
NEXT_PUBLIC_LS_VARIANT_ID_LISTENING_PRO=
```

## Linked

- Vault canonical spec: `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Brazilian Listening Lab.md`
- Workspace concierge: `~/projects/speakeasy/README.md`
- Sibling products:
  - [Everyday Brazilian Portuguese](../everyday-brazilian-portuguese/README.md)
  - [Speaking & Pronunciation Kit](../speaking-pronunciation-kit/README.md)
