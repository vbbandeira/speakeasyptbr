# CLAUDE.md — boot contract

You are operating inside `speakeasyptbr-products` — the production studio for SpeakEasy Portuguese digital products.

## What this repo is

A **production studio**, not a consumer app. 3 products live here (each with its own README/TODO/MANUAL-STEPS trio):

- `everyday-brazilian-portuguese/` — phrasebook e-book (€9.90 / €19.90 bundle)
- `speaking-pronunciation-kit/` — 3-tier pronunciation kit (€29.90 / €69.90 / €129.90)
- `brazilian-listening-lab/` — 3-tier listening kit (€19.90 / €39.90 / €59.90)

Tooling:
- `_tools/pdf-generator/` — HTML → PDF (Puppeteer)
- `_tools/audio-generator/` — **production line driven by an Opus agent**. Read its `AGENT.md` before touching anything audio-related.

## What to read first

1. **`CONTEXT.md`** — current operational state (what's done, what's blocked, what's next). Read this FIRST every session.
2. **`README.md`** — master tracking table of the 3 products.
3. Per-product `README.md` / `TODO.md` / `MANUAL-STEPS.md` — only when working on that specific product.

## What you should NEVER do here

- Don't invent new products, tiers, or prices — they're locked in vault + manifests.
- Don't commit changes to this repo unless the human explicitly asks ("commit this", "push").
- Don't modify files in `_tools/audio-generator/manifests/` without understanding the schema (`src/types/index.ts`).
- Don't regenerate PDFs without reading `_tools/pdf-generator/README.md` first.
- Don't auto-install npm packages — ask.

## What the human values (from Obsidian vault persona)

- Honesty over validation. If an idea is bad, say why.
- Specificity over theory. Prefer giving the prompt, the code, the template — not the plan.
- Leverage over brute force. 1h now that saves 100h later > 10h now.
- Quality over speed. Publishing imperfect is better than polishing indefinitely, but "imperfect" has a floor.

## Canonical knowledge (beyond this repo)

When in doubt about strategy, branding, target audience, pricing rationale:

```
C:\Users\Vinicius\Documents\obsidian\kbc-windows\10 - Projects\SpeakEasy Portuguese\
```

Specifically:
- `00 - INDEX.md` — project master entry
- `Products/` — canonical spec per product
- `Content Generator/Architecture/Stack Decisions.md` — why each tool chosen

Vault and repo can diverge. When they do: **vault wins for strategy, repo wins for implementation.**

## Sibling repos (work lives in multiple places)

- `~/projects/speakeasyptbr-website/` — Next.js marketing site + Lemon Squeezy integration
- `~/projects/speakeasy-content-generator/` — organic social content (reels, carousels)
- `~/projects/speakeasy/` — concierge meta-repo (README links the 3 together)

If a task clearly belongs to another repo, say so — don't shoehorn it here.
