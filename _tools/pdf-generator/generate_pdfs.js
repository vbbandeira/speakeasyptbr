const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { PDFDocument } = require('pdf-lib');

// ── All e-books to generate ──
// Paths are relative to the products repo root (../../ from this script).
const REPO_ROOT = path.join(__dirname, '..', '..');

const EBOOKS = [
  {
    label: 'Everyday Brazilian Portuguese',
    html: path.join(REPO_ROOT, 'everyday-brazilian-portuguese', 'speakeasy_ebook_FINAL.html'),
    output: path.join(REPO_ROOT, 'everyday-brazilian-portuguese', 'pdf', 'Everyday Brazilian Portuguese.pdf'),
  },
  {
    label: 'Everyday Brazilian Portuguese — Start Here',
    html: path.join(REPO_ROOT, 'everyday-brazilian-portuguese', 'speakeasy_start_here.html'),
    output: path.join(REPO_ROOT, 'everyday-brazilian-portuguese', 'pdf', 'Everyday Brazilian Portuguese - Start Here.pdf'),
  },
  {
    label: 'Everyday — Brazilian Culture & Etiquette Guide (bonus)',
    html: path.join(REPO_ROOT, 'everyday-brazilian-portuguese', 'speakeasy_culture_guide.html'),
    output: path.join(REPO_ROOT, 'everyday-brazilian-portuguese', 'pdf', 'Brazilian Culture & Etiquette Guide.pdf'),
  },
  {
    label: 'Everyday — One Day in Brazil (transcript, audio tier bonus)',
    html: path.join(REPO_ROOT, 'everyday-brazilian-portuguese', 'speakeasy_one_day_transcript.html'),
    output: path.join(REPO_ROOT, 'everyday-brazilian-portuguese', 'pdf', 'One Day in Brazil - Transcript.pdf'),
  },
  {
    label: 'Speaking & Pronunciation Kit',
    html: path.join(REPO_ROOT, 'speaking-pronunciation-kit', 'speakeasy_pronunciation_kit.html'),
    output: path.join(REPO_ROOT, 'speaking-pronunciation-kit', 'pdf', 'Speaking & Pronunciation Kit.pdf'),
  },
  {
    label: 'Speaking & Pronunciation Kit — Start Here',
    html: path.join(REPO_ROOT, 'speaking-pronunciation-kit', 'speakeasy_start_here.html'),
    output: path.join(REPO_ROOT, 'speaking-pronunciation-kit', 'pdf', 'Speaking & Pronunciation Kit - Start Here.pdf'),
  },
  {
    label: 'Brazilian Listening Lab — Start Here',
    html: path.join(REPO_ROOT, 'brazilian-listening-lab', 'speakeasy_start_here.html'),
    output: path.join(REPO_ROOT, 'brazilian-listening-lab', 'pdf', 'Brazilian Listening Lab - Start Here.pdf'),
  },
];

// Per-ebook output dirs are now next to the source HTML, not in this tool folder.
// Temp files still live here.
const TEMP_DIR = path.join(__dirname, 'temp');

async function generateSinglePDF(browser, { label, html, output }) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📘 ${label}`);
  console.log(`${'═'.repeat(60)}`);

  if (!fs.existsSync(html)) {
    console.error(`❌ HTML not found: ${html}`);
    return;
  }

  const outputPath = output;
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
  const tempDir = TEMP_DIR;

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
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log('✅ All e-books generated!');
  console.log(`${'═'.repeat(60)}`);
  for (const ebook of EBOOKS) {
    console.log(`📄 ${ebook.label}: ${ebook.output}`);
  }
}

generateAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
