const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const INPUT_FILE  = path.join(__dirname, 'speakeasy_ebook_FINAL.html');
const OUTPUT_DIR  = path.join(__dirname, 'pdf');
const TEMP_DIR    = path.join(OUTPUT_DIR, 'temp');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'speakeasy_final.pdf');

async function generatePDF() {
  // Create folders
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);
  if (!fs.existsSync(TEMP_DIR))   fs.mkdirSync(TEMP_DIR);

  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const tab = await browser.newPage();

  // Set viewport to ebook width
  await tab.setViewport({ width: 420, height: 900, deviceScaleFactor: 1 });

  console.log('⏳ Loading HTML file...');
  await tab.goto(`file://${INPUT_FILE}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });
  await tab.evaluateHandle('document.fonts.ready');

  // Get the exact height of each .page block
  const pageHeights = await tab.evaluate(() => {
    const pages = document.querySelectorAll('.page');
    return Array.from(pages).map(p => Math.ceil(p.getBoundingClientRect().height));
  });

  console.log(`📐 Found ${pageHeights.length} pages. Heights: ${pageHeights.join(', ')}px`);

  // Generate one PDF per page using exact height
  const tempFiles = [];
  for (let i = 0; i < pageHeights.length; i++) {
    const height = pageHeights[i];
    const tempPath = path.join(TEMP_DIR, `page_${String(i + 1).padStart(2, '0')}.pdf`);

    await tab.pdf({
      path: tempPath,
      width:  '420px',
      height: `${height}px`,
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      pageRanges: `${i + 1}`, // print only this page
    });

    tempFiles.push(tempPath);
    console.log(`✅ Page ${i + 1} → ${height}px`);
  }

  await browser.close();

  // Merge all pages into one PDF using pdftk or gs
  console.log('\n🔗 Merging pages...');
  const fileList = tempFiles.join(' ');

  try {
    // Try pdftk first (cleaner merge)
    execSync(`pdftk ${fileList} cat output "${OUTPUT_FILE}"`);
    console.log('✅ Merged with pdftk');
  } catch {
    try {
      // Fallback: ghostscript
      execSync(
        `gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile="${OUTPUT_FILE}" ${fileList}`
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

  // Clean up temp files
  tempFiles.forEach(f => fs.unlinkSync(f));
  fs.rmdirSync(TEMP_DIR);

  console.log(`\n🎉 Done! PDF saved to: pdf/speakeasy_final.pdf`);
}

generatePDF().catch(console.error);
