# PDF Generator — HTML → PDF (Puppeteer)

Internal tool. Converts the source HTML files of each product into pixel-perfect PDFs via Puppeteer.

> Used by all 3 products in this repo. Each product owns its source HTML; this tool reads them, renders, and writes back into the product's `pdf/` folder.

## Setup (first time)

```bash
cd ~/projects/speakeasyptbr-products/_tools/pdf-generator
npm install
```

Requires Node.js 18+. Puppeteer downloads its own Chromium binary the first time.

For best PDF merging (optional), install `pdftk` or fall back to `pdf-lib` (already a dependency, used by default in `generate_pdfs.js`).

## Run

```bash
node generate_pdfs.js
```

Generates all configured e-books in one pass. Output goes to `<product>/pdf/<file>.pdf`.

## Configured e-books

See the `EBOOKS` array in `generate_pdfs.js`. Currently:

| Label | Source HTML | Output PDF |
|---|---|---|
| Everyday Brazilian Portuguese | `everyday-brazilian-portuguese/speakeasy_ebook_FINAL.html` | `everyday-brazilian-portuguese/pdf/everyday_brazilian_portuguese.pdf` |
| Speaking & Pronunciation Kit | `speaking-pronunciation-kit/speakeasy_pronunciation_kit.html` | `speaking-pronunciation-kit/pdf/speakeasy_pronunciation_kit.pdf` |
| Speaking Kit — Start Here | `speaking-pronunciation-kit/speakeasy_start_here.html` | `speaking-pronunciation-kit/pdf/speakeasy_start_here.pdf` |

To add a new e-book: append an entry to the `EBOOKS` array following the same shape.

## How it works

The script:
1. Loads the HTML in headless Chromium (file:// URL)
2. Waits for fonts (`document.fonts.ready`) and images
3. For each `.page` block, isolates it (hides others), measures its exact pixel dimensions, and renders a single-page PDF with those exact dimensions (no margins, no whitespace)
4. Merges all per-page PDFs into one final PDF via `pdf-lib`
5. Cleans up temp files

The original implementation guide is preserved in [`GENERATE_PDFS_README.md`](./GENERATE_PDFS_README.md).

## Conventions for source HTML

Every page must:
- Live inside an element with class `.page`
- Have its own background color (script reads via `getComputedStyle` and sets it on `<html>` and `<body>` to avoid white edges)
- Use `@page { size: 420px auto; margin: 0mm }` in the document CSS

The first `.page` is treated as cover (no chapter title needed).

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Fonts fail to load | Check internet (Google Fonts) |
| White borders | Confirm `@page { margin: 0mm }` in HTML CSS |
| Images broken | Check src paths are relative to the HTML file location |
| `puppeteer` not found | Run `npm install` again |
| Page content cut off | Add `page-break-inside: avoid` on the affected block |

## Future improvements (not implemented)

- Auto-discovery: scan `<product>/*.html` and `pdfs-source/**/*.html` instead of hardcoding `EBOOKS`
- Watch mode (`node generate_pdfs.js --watch` for live preview while editing HTML)
- Image optimization pass on the output
- File size budget warnings
