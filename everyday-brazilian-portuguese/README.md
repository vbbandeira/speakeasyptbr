# Everyday Brazilian Portuguese

> Phrasebook-style e-book with 100 everyday PT-BR phrases organized into 10 chapters, with English translations, contextual notes, and a built-in 11-day practice plan. Optional Audio Kit (~102 MP3 files).

**Status:** 🟡 PDF ready · audio in production (Arí)
**Site badge:** BEST SELLER
**Pricing:** €9.90 (e-book only) / €19.90 (e-book + audio bundle, BEST VALUE)

## Tracking

- 📋 **What's left to do:** see [`TODO.md`](./TODO.md)
- 👤 **What needs YOUR action:** see [`MANUAL-STEPS.md`](./MANUAL-STEPS.md)

## Where things live

| Item | Path |
|---|---|
| PDF source (HTML) | [`speakeasy_ebook_FINAL.html`](./speakeasy_ebook_FINAL.html) |
| PDF assets (SVGs) | [`assets/`](./assets/) |
| Generated PDF | [`pdf/everyday_brazilian_portuguese.pdf`](./pdf/) |
| Audio scripts | `audio-scripts/` (to be created — see TODO) |
| Final audio MP3s | `audio/` (to be created during production) |
| Final delivery ZIPs | `delivery/` (built before LS upload) |
| Spec docs (vault) | `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Everyday Brazilian Portuguese.md` |
| Site copy | `~/projects/speakeasyptbr-website/docs/products/everyday-brazilian-portuguese.md` |

## Generating the PDF

```bash
cd ~/projects/speakeasyptbr-products/_tools/pdf-generator
node generate_pdfs.js
```

Output appears in [`pdf/everyday_brazilian_portuguese.pdf`](./pdf/) (paths configured in the script).

## Audio production

- **Voice:** Arí (Bandeira's wife — native BR-PT speaker)
- **Fallback for filler tracks:** ElevenLabs (Valentina or Fernanda voice)
- See [`MANUAL-STEPS.md`](./MANUAL-STEPS.md) for the recording workflow

## Site dependency

The site (`speakeasyptbr-website`) cannot list this product as buyable until:
1. Final PDF + audio package is uploaded to Lemon Squeezy
2. Variant ID is added to `.env.local` of the website (`NEXT_PUBLIC_LS_VARIANT_ID_EVERYDAY_BUNDLE`, `NEXT_PUBLIC_LS_VARIANT_ID_EVERYDAY_EBOOK`)

## Linked

- Vault canonical spec: `[vault]/10 - Projects/SpeakEasy Portuguese/Products/Everyday Brazilian Portuguese.md`
- Workspace concierge: `~/projects/speakeasy/README.md`
- Sibling products:
  - [Speaking & Pronunciation Kit](../speaking-pronunciation-kit/README.md)
  - [Brazilian Listening Lab](../brazilian-listening-lab/README.md)
