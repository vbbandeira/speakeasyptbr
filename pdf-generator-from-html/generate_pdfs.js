const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// ── Configuração das páginas em ordem ──
const pages = [
  { file: '01_cover.html',                 name: '01_cover' },
  { file: '02_cover_v3.html',              name: '02_cover_v3' },
  { file: '03_table_of_contents_p1.html',  name: '03_toc_p1' },
  { file: '04_table_of_contents_p2.html',  name: '04_toc_p2' },
  { file: '05_how_to_use.html',            name: '05_how_to_use' },
  { file: '06_chapter_01.html',            name: '06_chapter_01' },
  { file: '07_chapters_02_to_10.html',     name: '07_chapters_02_to_10' },
  { file: '08_quick_practice_plan.html',   name: '08_quick_practice_plan' },
  { file: '09_next_steps.html',            name: '09_next_steps' },
];

const INPUT_DIR  = path.join(__dirname, 'html');
const OUTPUT_DIR = path.join(__dirname, 'pdf');

async function generatePDFs() {
  // Cria pasta de output se não existir
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const browser = await puppeteer.launch({ headless: 'new' });

  for (const page of pages) {
    const inputPath  = `file://${path.join(INPUT_DIR, page.file)}`;
    const outputPath = path.join(OUTPUT_DIR, `${page.name}.pdf`);

    console.log(`⏳ Gerando: ${page.file}`);

    const tab = await browser.newPage();

    // Aguarda fontes e imagens carregarem
    await tab.goto(inputPath, { waitUntil: 'networkidle0', timeout: 30000 });

    // Aguarda fontes do Google Fonts renderizarem
    await tab.evaluateHandle('document.fonts.ready');

    await tab.pdf({
      path: outputPath,
      width:  '420px',       // largura exata do e-book
      height: 'auto',        // altura = conteúdo da página
      printBackground: true, // imprime cores e fundos
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await tab.close();
    console.log(`✅ Salvo: ${page.name}.pdf`);
  }

  await browser.close();
  console.log('\n🎉 Todos os PDFs gerados em /pdf');
}

generatePDFs().catch(console.error);
