const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { pathToFileURL } = require('url');

const INPUT_FILE_CANDIDATES = [
  path.join(__dirname, 'speakeasy_ebook_FINAL.html'),
  path.join(__dirname, '..', 'speakeasy_ebook_FINAL.html'),
];

const INPUT_FILE = INPUT_FILE_CANDIDATES.find(p => fs.existsSync(p));
if (!INPUT_FILE) {
  throw new Error(
    `❌ Não encontrei speakeasy_ebook_FINAL.html. Procurei em:\n- ${INPUT_FILE_CANDIDATES.join('\n- ')}`
  );
}

const OUTPUT_DIR  = path.join(__dirname, 'pdf');
const TEMP_DIR    = path.join(OUTPUT_DIR, 'temp');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'speakeasy_final.pdf');

async function generatePDF() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  if (!fs.existsSync(TEMP_DIR))   fs.mkdirSync(TEMP_DIR, { recursive: true });

  console.log('📄 HTML input:', INPUT_FILE);

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--allow-file-access-from-files'],
  });

  const tab = await browser.newPage();

  tab.on('requestfailed', (req) => {
    const failure = req.failure();
    console.log('❌ requestfailed:', req.url(), failure ? failure.errorText : '');
  });

  await tab.setViewport({ width: 420, height: 900, deviceScaleFactor: 1 });

  console.log('⏳ Loading HTML file...');
  const inputUrl = pathToFileURL(INPUT_FILE).href;

  await tab.goto(inputUrl, {
    waitUntil: 'networkidle0',
    timeout: 60000,
  });

  // Força CSS de print
  await tab.emulateMediaType('print');

  // Aguarda fontes de verdade
  console.log('🔤 Waiting for fonts...');
  await tab.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });

  // Aguarda imagens (ignora SVG no "broken" pq às vezes naturalWidth=0 mesmo carregado)
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
    await browser.close();
    throw new Error('❌ Nenhuma .page encontrada. Verifique se o HTML carregou corretamente.');
  }

  const pageCount = pagesDebug.length;
  const tempFiles = [];

  for (let i = 0; i < pageCount; i++) {
    const tempPath = path.join(TEMP_DIR, `page_${String(i + 1).padStart(2, '0')}.pdf`);

    const info = await tab.evaluate((index) => {
      const pages = Array.from(document.querySelectorAll('.page'));

      // ✅ salva display original UMA VEZ (não usa truthy/falsy)
      pages.forEach((p) => {
        if (p.dataset.origDisplay === undefined) {
          const computed = getComputedStyle(p).display;
          p.dataset.origDisplay = computed && computed !== 'none' ? computed : 'block';
        }
      });

      // Mostra só a página atual
      pages.forEach((p, idx) => {
        if (idx === index) {
          p.style.display = p.dataset.origDisplay;
          p.style.pageBreakAfter = 'auto';
          p.style.breakAfter = 'auto';
        } else {
          p.style.display = 'none';
        }
      });

      // Garante “screen layout” não interferindo
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

      // Define background (com important) pra evitar “bordinha” diferente
      const bg = getComputedStyle(current).backgroundColor || '#FFFFFF';
      document.documentElement.style.setProperty('background', bg, 'important');
      document.body.style.setProperty('background', bg, 'important');

      window.scrollTo(0, 0);

      const rect = current.getBoundingClientRect();

      // 🔻 Faz “floor” para não arredondar pra cima e sobrar borda
      const width  = Math.max(1, Math.floor(rect.width  * 1000) / 1000);
      const height = Math.max(1, Math.floor(rect.height * 1000) / 1000);

      const rawTitle =
        current.querySelector('.chapter-title')?.textContent ||
        current.querySelector('h1')?.textContent ||
        (index === 0 ? 'COVER' : `PAGE ${index + 1}`);

      const title = rawTitle.replace(/\s+/g, ' ').trim();

      return { width, height, title };
    }, i);

    console.log(`🧾 Export ${i + 1}/${pageCount}: ${info.title} → ${info.width}px × ${info.height}px`);

    if (info.width <= 0 || info.height <= 0) {
      await browser.close();
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

  await browser.close();

  console.log('\n🔗 Merging pages...');
  const fileList = tempFiles.map(f => `"${f}"`).join(' ');

  try {
    execSync(`pdftk ${fileList} cat output "${OUTPUT_FILE}"`, { stdio: 'inherit' });
    console.log('✅ Merged with pdftk');
  } catch {
    try {
      execSync(
        `gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile="${OUTPUT_FILE}" ${fileList}`,
        { stdio: 'inherit' }
      );
      console.log('✅ Merged with Ghostscript');
    } catch {
      console.error('❌ Could not merge PDFs automatically.');
      console.log('👉 Install pdftk: brew install pdftk-java');
      console.log('👉 Or install ghostscript: brew install ghostscript');
      console.log(`\nTemp files are in: ${TEMP_DIR}`);
      process.exit(1);
    }
  }

  // Clean up
  tempFiles.forEach(f => fs.unlinkSync(f));
  fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  console.log(`\n🎉 Done! PDF saved to: ${OUTPUT_FILE}`);
}

generatePDF().catch((err) => {
  console.error(err);
  process.exit(1);
});
