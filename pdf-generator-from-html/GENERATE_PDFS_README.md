# Generating PDFs from HTML — SpeakEasy Portuguese

> This guide explains how to convert the e-book HTML files into PDFs using Puppeteer, maintaining full design fidelity.

---

## Requirements

- [Node.js](https://nodejs.org) (v18+)
- [Homebrew](https://brew.sh) (for Mac)

---

## Folder Structure

Before running, organize your files like this:

```
speakeasy-ebook/
├── html/                        ← place all HTML files here
│   ├── 01_cover.html
│   ├── 02_cover_v3.html
│   ├── 03_table_of_contents_p1.html
│   ├── 04_table_of_contents_p2.html
│   ├── 05_how_to_use.html
│   ├── 06_chapter_01.html
│   ├── 07_chapters_02_to_10.html
│   ├── 08_quick_practice_plan.html
│   └── 09_next_steps.html
├── pdf/                         ← generated PDFs will appear here
├── generate_pdfs.js
└── README.md
```

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

## Generate the PDFs

Run the script:
```bash
node generate_pdfs.js
```

One PDF per page will be saved to the `/pdf` folder. The script waits for fonts and images to load before exporting, so colors, backgrounds, and typography will be fully preserved.

---

## Merge into a Single PDF

Install Ghostscript (if not already installed):
```bash
brew install ghostscript
```

Then merge all pages into one final file:
```bash
gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite \
   -sOutputFile=speakeasy_final.pdf \
   pdf/01_cover.pdf \
   pdf/02_cover_v3.pdf \
   pdf/03_toc_p1.pdf \
   pdf/04_toc_p2.pdf \
   pdf/05_how_to_use.pdf \
   pdf/06_chapter_01.pdf \
   pdf/07_chapters_02_to_10.pdf \
   pdf/08_quick_practice_plan.pdf \
   pdf/09_next_steps.pdf
```

Your final file `speakeasy_final.pdf` will be ready in the project root.

---

## Notes

- `printBackground: true` ensures all background colors and images are preserved
- `width: 420px` + `height: auto` means each page is exactly the size of its content — no white or beige borders
- `networkidle0` + `document.fonts.ready` ensures Google Fonts load before export
- If a page has multiple chapters (like `07_chapters_02_to_10.html`), Puppeteer will automatically split it into multiple PDF pages

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Fonts not loading | Check internet connection — Google Fonts requires it |
| Background colors missing | Make sure `printBackground: true` is set in the script |
| PDF page cut off | Check that `margin` is set to `0` on all sides |
| `puppeteer` not found | Run `npm install puppeteer` again inside the project folder |
