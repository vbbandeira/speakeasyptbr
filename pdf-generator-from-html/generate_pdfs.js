const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { PDFDocument } = require('pdf-lib');

// ── All e-books to generate ──
const EBOOKS = [
  {
    label: '100 Everyday PT-BR Phrases',
    html: path.join(__dirname, '..', '100 every day pt-br phrases e-book', 'speakeasy_ebook_FINAL.html'),
    output: 'everyday_brazilian_portuguese.pdf',
  },
  {
    label: 'Speaking & Pronunciation Kit',
    html: path.join(__dirname, '..', 'Speaking & Pronunciation Kit', 'speakeasy_pronunciation_kit.html'),
    output: 'speakeasy_pronunciation_kit.pdf',
  },
  {
    label: 'Speaking & Pronunciation Kit — Start Here',
    html: path.join(__dirname, '..', 'Speaking & Pronunciation Kit', 'speakeasy_start_here.html'),
    output: 'speakeasy_start_here.pdf',
  },
];

const OUTPUT_DIR = path.join(__dirname, 'pdf');

async function generateSinglePDF(browser, { label, html, output }) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📘 ${label}`);
  console.log(`${'═'.repeat(60)}`);

  if (!fs.existsSync(html)) {
    console.error(`❌ HTML not found: ${html}`);
    return;
  }

  const outputPath = path.join(OUTPUT_DIR, output);
  const tempDir = path.join(OUTPUT_DIR, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  console.log('📄 HTML input:', html);

  const tab = await browser.newPage();

  tab.on('requestfailed', (req) => {
    const failure = req.failure();
    console.log('❌ requestfailed:', req.url(), failure ? failure.errorText : '');
  });

  await tab.setViewport({ width: 420, height: 900, deviceScaleFactor: 1 });

  console.log('⏳ Loading HTML file...');
  const inputUrl = pathToFileURL(html).href;

  await tab.goto(inputUrl, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  // Força CSS de print
  await tab.emulateMediaType('print');

  // Aguarda fontes
  console.log('🔤 Waiting for fonts...');
  await tab.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Aguarda imagens
  console.log('🖼️ Checking images...');
  const brokenImages = await tab.evaluate(async () => {
    const imgs = Array.from(document.images);

    await Promise.all(
      imgs.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => {
          img.addEventListener('load', res, { once: true });
          img.addEventListener('error', res, { once: true });
        });
      })
    );

    return imgs
      .filter(img => {
        const src = (img.currentSrc || img.src || '').toLowerCase();
        const isSvg = src.endsWith('.svg');
        if (isSvg) return false;
        return img.naturalWidth === 0;
      })
      .map(img => ({
        src: img.getAttribute('src'),
        currentSrc: img.currentSrc
      }));
  });

  if (brokenImages.length) {
    console.log('⚠️ Broken images detected:');
    brokenImages.forEach(i => console.log(` - src="${i.src}" resolved="${i.currentSrc}"`));
  } else {
    console.log('✅ Images OK');
  }

  // Debug: lista de páginas detectadas
  const pagesDebug = await tab.evaluate(() => {
    const pages = Array.from(document.querySelectorAll('.page'));
    return pages.map((p, idx) => {
      const raw =
        p.querySelector('.chapter-title')?.textContent ||
        p.querySelector('.header-title')?.textContent ||
        p.querySelector('h1')?.textContent ||
        (idx === 0 ? 'COVER' : `PAGE ${idx + 1}`);
      const title = raw.replace(/\s+/g, ' ').trim();
      return { idx: idx + 1, title };
    });
  });

  console.log(`📐 Found ${pagesDebug.length} .page blocks`);
  console.log('📚 Pages in DOM:');
  pagesDebug.forEach(p => console.log(` - ${String(p.idx).padStart(2, '0')}: ${p.title}`));

  if (pagesDebug.length === 0) {
    await tab.close();
    console.error('❌ Nenhuma .page encontrada. Pulando este e-book.');
    return;
  }

  const pageCount = pagesDebug.length;
  const tempFiles = [];

  for (let i = 0; i < pageCount; i++) {
    const tempPath = path.join(tempDir, `page_${String(i + 1).padStart(2, '0')}.pdf`);

    const info = await tab.evaluate((index) => {
      const pages = Array.from(document.querySelectorAll('.page'));

      pages.forEach((p) => {
        if (p.dataset.origDisplay === undefined) {
          const computed = getComputedStyle(p).display;
          p.dataset.origDisplay = computed && computed !== 'none' ? computed : 'block';
        }
      });

      pages.forEach((p, idx) => {
        if (idx === index) {
          p.style.display = p.dataset.origDisplay;
          p.style.pageBreakAfter = 'auto';
          p.style.breakAfter = 'auto';
        } else {
          p.style.display = 'none';
        }
      });

      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';

      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.gap = '0';
      document.body.style.display = 'block';

      const current = pages[index];
      if (!current) {
        return { width: 0, height: 0, title: `Missing page index ${index}` };
      }

      const bg = getComputedStyle(current).backgroundColor || '#FFFFFF';
      document.documentElement.style.setProperty('background', bg, 'important');
      document.body.style.setProperty('background', bg, 'important');

      window.scrollTo(0, 0);

      const rect = current.getBoundingClientRect();

      const width  = Math.max(1, Math.floor(rect.width  * 1000) / 1000);
      const height = Math.max(1, Math.floor(rect.height * 1000) / 1000);

      const rawTitle =
        current.querySelector('.chapter-title')?.textContent ||
        current.querySelector('.header-title')?.textContent ||
        current.querySelector('h1')?.textContent ||
        (index === 0 ? 'COVER' : `PAGE ${index + 1}`);

      const title = rawTitle.replace(/\s+/g, ' ').trim();

      return { width, height, title };
    }, i);

    console.log(`🧾 Export ${i + 1}/${pageCount}: ${info.title} → ${info.width}px × ${info.height}px`);

    if (info.width <= 0 || info.height <= 0) {
      await tab.close();
      throw new Error(
        `❌ Medição inválida na página ${i + 1} ("${info.title}"): ${info.width}px × ${info.height}px.\n` +
        `Isso indica que a página ficou invisível (display:none) ou com layout quebrado.`
      );
    }

    await tab.pdf({
      path: tempPath,
      width: `${info.width}px`,
      height: `${info.height}px`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      scale: 1,
      pageRanges: '1',
    });

    tempFiles.push(tempPath);
  }

  await tab.close();

  // Merge pages using pdf-lib
  console.log('🔗 Merging pages...');
  const merged = await PDFDocument.create();
  for (const tempFile of tempFiles) {
    const bytes = fs.readFileSync(tempFile);
    const doc = await PDFDocument.load(bytes);
    const [page] = await merged.copyPages(doc, [0]);
    merged.addPage(page);
  }
  const mergedBytes = await merged.save();
  fs.writeFileSync(outputPath, mergedBytes);

  // Clean up temp files for this book
  tempFiles.forEach(f => fs.unlinkSync(f));

  console.log(`🎉 Done! → ${outputPath}`);
}

async function generateAll() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--allow-file-access-from-files'],
  });

  for (const ebook of EBOOKS) {
    await generateSinglePDF(browser, ebook);
  }

  await browser.close();

  // Clean up temp dir
  const tempDir = path.join(OUTPUT_DIR, 'temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('✅ All e-books generated!');
  console.log(`📁 Output folder: ${OUTPUT_DIR}`);
  console.log(`${'═'.repeat(60)}`);
}

generateAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
