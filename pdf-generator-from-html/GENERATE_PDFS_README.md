# Generating the PDF — SpeakEasy Portuguese

> This guide explains how to convert the single e-book HTML file into a final PDF using Puppeteer, maintaining full design fidelity.

---

## Requirements

- [Node.js](https://nodejs.org) (v18+)
- [Homebrew](https://brew.sh) (for Mac)

---

## Folder Structure

```
speakeasy-ebook/
├── speakeasy_ebook_FINAL.html   ← single source file with all pages embedded
├── pdf/                         ← generated PDF will appear here
├── generate_pdfs.js
└── README.md
```

> All pages, images, and assets are embedded directly in the HTML file. No external dependencies needed at conversion time.

---

## Setup

**1. Install Node.js** (if not already installed):
```bash
brew install node
```

**2. Navigate to the project folder:**
```bash
cd speakeasy-ebook
```

**3. Install Puppeteer:**
```bash
npm init -y
npm install puppeteer
```

---

## Generate the PDF

Run the script:
```bash
node generate_pdfs.js
```

The script will generate a single `speakeasy_final.pdf` inside the `/pdf` folder.
Each `.page` block in the HTML becomes its own PDF page automatically via `page-break-after: always`.

---

## How it works

- `printBackground: true` — preserves all background colors and images
- `width: 420px` + `height: auto` — each page is exactly the size of its content, no borders
- `@page { size: 420px auto; margin: 0mm }` — defined in the HTML itself, Puppeteer respects it
- `networkidle0` + `document.fonts.ready` — waits for Google Fonts to fully load before export
- No merge step needed — all pages are already in sequence in the single HTML file

---

## Editing before export

The HTML file is structured with clear comments for easy navigation:

```
<!-- PAGE 01 — Cover (base) -->
<!-- PAGE 02 — Cover V3 (use this one) -->
<!-- PAGE 03 — Table of Contents -->
<!-- PAGE 04 — How to Use -->
<!-- PAGE 05 — Chapter I -->
...
<!-- PAGE 16 — Next Steps -->
```

Common edits before generating the final PDF:
- **CTA link** on page 16: replace `speakeasyptbr.com` in the button with the real product URL
- **Cover**: swap between Cover 01 (base) and Cover V3 (with embedded assets) by removing the one you don't want
- **Page labels** (grey text above each page on screen): these are hidden automatically during print via `display: none`

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Fonts not loading | Check internet connection — Google Fonts requires it |
| Background colors missing | Make sure `printBackground: true` is set in the script |
| Pages have white borders | Confirm `@page { margin: 0mm }` is in the HTML CSS |
| Page content cut off | Check that `page-break-inside: avoid` is set on the affected block |
| `puppeteer` not found | Run `npm install puppeteer` again inside the project folder |
