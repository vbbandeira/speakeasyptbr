#!/usr/bin/env python3
"""
build-transcripts.py — parse dialogues.md and render 3 tier-specific HTML files
(Basic/Plus/Pro) with transcripts, vocab notes, and comprehension questions.

Usage:
  python _tools/build-transcripts.py

Outputs:
  brazilian-listening-lab/speakeasy_transcripts_basic.html  (dialogues 1-15)
  brazilian-listening-lab/speakeasy_transcripts_plus.html   (dialogues 1-30)
  brazilian-listening-lab/speakeasy_transcripts_pro.html    (dialogues 1-50)
"""

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DIALOGUES_MD = REPO_ROOT / "brazilian-listening-lab" / "audio-scripts" / "dialogues.md"
OUTPUT_DIR = REPO_ROOT / "brazilian-listening-lab"


# ── Dialogue parser ────────────────────────────────────────────────

def parse_dialogues(md: str):
    """Returns a list of dialogue dicts."""
    # Split by dialogue header
    sections = re.split(r"^### Dialogue ", md, flags=re.MULTILINE)[1:]
    dialogues = []
    for section in sections:
        # Skip if it's a mini-podcast section (shouldn't match but defensive)
        if section.strip().startswith("Mini-Podcast"):
            continue
        header = re.match(r"^(\d+)\s*—\s*(.+?)\s*\((.+?)\)\s*$", section, re.MULTILINE)
        if not header:
            continue
        num = int(header.group(1))
        title_pt = header.group(2).strip()
        title_en = header.group(3).strip()

        meta = re.search(r"\*\*Level:\*\*\s*([^\|]+?)\s*\|\s*\*\*Setting:\*\*\s*([^\|]+?)\s*\|\s*\*\*Theme:\*\*\s*(.+?)$", section, re.MULTILINE)
        level = meta.group(1).strip() if meta else ""
        setting = meta.group(2).strip() if meta else ""
        theme = meta.group(3).strip() if meta else ""

        # Extract turns: **A (Role):** text  OR  **A:** text
        turns = []
        for m in re.finditer(r"^\*\*([ABC])(?:\s*\(([^)]+)\))?:\*\*\s*(.+?)$", section, re.MULTILINE):
            turns.append({
                "speaker": m.group(1),
                "role": (m.group(2) or "").strip(),
                "text": m.group(3).strip(),
            })

        # Vocab notes — list between "**Vocabulary notes:**" and next "**" section
        vocab = []
        vocab_match = re.search(r"\*\*Vocabulary notes:\*\*\s*\n((?:- .+\n?)+)", section)
        if vocab_match:
            for line in vocab_match.group(1).strip().split("\n"):
                line = line.strip()
                if line.startswith("- "):
                    item = line[2:]
                    # Parse "word" — explanation
                    m = re.match(r'^"([^"]+)"\s*[—–-]\s*(.+)$', item)
                    if m:
                        vocab.append({"term": m.group(1), "note": m.group(2)})
                    else:
                        vocab.append({"term": "", "note": item})

        # Comprehension questions
        questions = []
        q_match = re.search(r"\*\*Comprehension questions:\*\*\s*\n((?:\d+\.\s*.+\n?)+)", section)
        if q_match:
            for line in q_match.group(1).strip().split("\n"):
                q = re.match(r"^\d+\.\s*(.+)$", line.strip())
                if q:
                    questions.append(q.group(1).strip())

        # Fill-the-gap exercises (present from dialogue 16 onward)
        gaps = []
        gap_match = re.search(r"\*\*Fill-the-gap exercise:\*\*\s*\n((?:\d+\.\s*.+\n?)+)", section)
        if gap_match:
            for line in gap_match.group(1).strip().split("\n"):
                g = re.match(r"^\d+\.\s*(.+)$", line.strip())
                if g:
                    gaps.append(g.group(1).strip())

        dialogues.append({
            "num": num,
            "title_pt": title_pt,
            "title_en": title_en,
            "level": level,
            "setting": setting,
            "theme": theme,
            "turns": turns,
            "vocab": vocab,
            "questions": questions,
            "gaps": gaps,
        })
    return dialogues


# ── HTML rendering ─────────────────────────────────────────────────

HTML_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SpeakEasy — Brazilian Listening Lab · Transcripts</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
img.emoji {
  height: 1em; width: 1em;
  margin: 0 0.05em 0 0.1em;
  vertical-align: -0.1em; display: inline;
}
body {
  font-family:'Inter',sans-serif; background:#D8D4CC;
  display:flex; flex-direction:column; align-items:center;
  gap:48px; padding:48px 20px;
}
.page-label {
  width:420px; font-family:'Inter',sans-serif; font-size:10px;
  font-weight:600; letter-spacing:0.15em; text-transform:uppercase;
  color:#999; margin-bottom:-36px; padding-left:4px;
}
.page {
  width:420px; background:#F5F0E8; border-radius:16px;
  overflow:hidden; border:1px solid #D4CBBB;
}
.header {
  background:#1E4D3B; padding:26px 32px 22px;
  position:relative; overflow:hidden;
  display:flex; align-items:flex-start; justify-content:space-between;
}
.header::before {
  content:''; position:absolute; top:-50px; right:-50px;
  width:160px; height:160px; border-radius:50%;
  background:rgba(255,255,255,0.05);
}
.section-tag {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:0.15em; text-transform:uppercase; color:#7EC8A4; margin-bottom:5px;
}
.header-title {
  font-family:'Poppins',sans-serif; font-size:19px; font-weight:700;
  color:#fff; line-height:1.15;
}
.header-sub {
  margin-top:5px; font-family:'Inter',sans-serif;
  font-size:10.5px; color:rgba(255,255,255,0.55);
}
.page-num {
  font-family:'Inter',sans-serif; font-size:11px; color:rgba(255,255,255,0.3);
  letter-spacing:0.1em; flex-shrink:0; margin-top:2px;
}
.body { padding:22px 30px 30px; display:flex; flex-direction:column; gap:14px; }
.intro {
  font-size:12px; color:#6B7B6E; line-height:1.6;
  border-left:3px solid #A8E6C3; padding-left:12px; font-style:italic;
}

.meta-row {
  display:flex; gap:8px; flex-wrap:wrap;
}
.meta-chip {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:0.05em; color:#4A6B58;
  background:#F0FAF4; border:1px solid #A8E6C3;
  padding:3px 9px; border-radius:12px;
}
.meta-chip strong { color:#1E4D3B; font-weight:600; }

/* Scene/turn block */
.scene {
  background:#fff; border-radius:11px; border:1px solid #EDE9E0;
  padding:13px 15px;
}
.turn {
  display:grid; grid-template-columns:22px 1fr; gap:8px;
  padding:6px 0; border-bottom:1px solid rgba(212,203,187,0.3);
  align-items:start;
}
.turn:last-child { border-bottom:none; }
.turn-speaker {
  font-family:'Poppins',sans-serif; font-size:11px; font-weight:700;
  color:#fff; background:#2D6B52; border-radius:4px;
  text-align:center; padding:2px 0; min-width:22px; line-height:1.1;
}
.turn-speaker.b { background:#7EC8A4; color:#1E4D3B; }
.turn-text {
  font-family:'Poppins',sans-serif; font-size:12.5px; font-weight:500;
  color:#1E4D3B; line-height:1.5;
}
.turn-text .role {
  font-family:'Inter',sans-serif; font-size:10px; font-style:italic;
  color:#8FA897; font-weight:400; display:block; margin-bottom:1px;
}

/* Vocab box */
.vocab-box {
  background:#FFF8F0; border:1px solid #F0D4A8; border-radius:10px;
  padding:11px 14px;
}
.vocab-label {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:600;
  letter-spacing:0.1em; text-transform:uppercase; color:#B07030; margin-bottom:6px;
}
.vocab-item {
  display:block; font-family:'Inter',sans-serif; font-size:10.5px;
  color:#7A5020; line-height:1.5; padding:3px 0;
  border-top:1px solid rgba(240,212,168,0.4);
}
.vocab-item:first-child { border-top:none; padding-top:0; }
.vocab-item strong {
  font-family:'Poppins',sans-serif; color:#5A3818; font-weight:600;
}

/* Comprehension box */
.comp-box {
  background:#EEF3F4; border-radius:10px; padding:11px 14px;
  border-left:3px solid #5A9BA4;
}
.comp-label {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:600;
  letter-spacing:0.1em; text-transform:uppercase; color:#4A838A; margin-bottom:6px;
}
.comp-item {
  font-family:'Inter',sans-serif; font-size:11px; color:#3D5E63; line-height:1.5;
  padding:3px 0 3px 18px; position:relative;
}
.comp-item::before {
  content:attr(data-num); position:absolute; left:0; top:3px;
  font-family:'Poppins',sans-serif; font-size:10px; font-weight:700;
  color:#5A9BA4;
}

/* Gap-fill box */
.gap-box {
  background:#F0FAF4; border:1px solid #A8E6C3; border-radius:10px;
  padding:11px 14px;
}
.gap-label {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:600;
  letter-spacing:0.1em; text-transform:uppercase; color:#2D6B52; margin-bottom:6px;
}
.gap-item {
  font-family:'Poppins',sans-serif; font-size:11px; color:#1E4D3B; line-height:1.5;
  padding:3px 0 3px 18px; position:relative; font-weight:500;
}
.gap-item::before {
  content:attr(data-num); position:absolute; left:0; top:3px;
  font-family:'Poppins',sans-serif; font-size:10px; font-weight:700;
  color:#2D6B52;
}

/* TOC */
.toc-item {
  display:flex; align-items:baseline; padding:5px 0;
  border-bottom:1px solid rgba(212,203,187,0.4);
}
.toc-item:last-child { border-bottom:none; }
.toc-num {
  font-family:'Poppins',sans-serif; font-size:10px; font-weight:700;
  color:#7EC8A4; min-width:28px;
}
.toc-title {
  font-family:'Poppins',sans-serif; font-size:11.5px; font-weight:500; color:#1E4D3B; flex:1;
}
.toc-dots {
  flex:1; border-bottom:1px dotted #C8BFB0; margin:0 6px 4px; min-width:10px;
}
.toc-page {
  font-family:'Inter',sans-serif; font-size:10.5px; font-weight:500;
  color:#8FA897; min-width:20px; text-align:right;
}
.toc-level {
  font-family:'Inter',sans-serif; font-size:9px; font-weight:500;
  color:#B07030; background:#FFF8F0; border:1px solid #F0D4A8;
  padding:1px 5px; border-radius:8px; margin-left:6px;
}

.tip-box {
  background:#1E4D3B; border-radius:11px; padding:13px 15px;
  display:flex; gap:9px; align-items:flex-start;
}
.tip-icon { font-size:14px; flex-shrink:0; margin-top:1px; }
.tip-label {
  font-family:'Inter',sans-serif; font-size:10px; font-weight:500;
  letter-spacing:0.12em; text-transform:uppercase; color:#7EC8A4; margin-bottom:3px;
}
.tip-text {
  font-family:'Inter',sans-serif; font-size:11.5px;
  color:rgba(255,255,255,0.85); line-height:1.6;
}
.tip-text em { color:#A8E6C3; font-style:normal; font-weight:500; }

@media print {
  *, *::before, *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    animation: none !important; transition: none !important;
  }
  @page { size: 420px auto; margin: 0mm; }
  html, body {
    width: 420px !important; margin: 0 !important; padding: 0 !important;
    background: #F5F0E8 !important; display: block !important;
    min-height: unset !important;
  }
  .page-label { display: none !important; }
  .page {
    width: 420px !important; border-radius: 0 !important;
    border: none !important; box-shadow: none !important;
    overflow: hidden !important; page-break-after: always;
    page-break-inside: avoid; margin: 0 !important;
  }
  .page:last-of-type { page-break-after: auto; }
  .scene, .vocab-box, .comp-box, .gap-box, .tip-box, .toc-item { page-break-inside: avoid; }
}
</style>
</head>
<body>
"""


def render_cover(tier: str, count: int) -> str:
    return f"""
<!-- PAGE 01 — Cover -->
<div class="page-label">📄 PAGE 01 — Cover</div>
<div class="page" style="height:747px; background:linear-gradient(to bottom, #E8E5DC 0, #E8E5DC 703px, #1E4D3B 703px, #1E4D3B 100%); background-color:#1E4D3B; position:relative; overflow:hidden; border:none;">
  <div style="position:absolute; left:0; top:0; width:100%; height:72px; overflow:hidden; z-index:5;">
    <div style="position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
    <div style="position:absolute; left:50%; top:45%; transform:translate(-50%, -50%); width:210px; height:85px; overflow:hidden; z-index:10; pointer-events:none;">
      <img src="../_shared/assets/Logo.svg" alt="SpeakEasy Portuguese" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
    </div>
  </div>
  <div style="position:absolute; left:0; bottom:0; width:100%; height:44px; background:#1E4D3B; display:flex; align-items:center; justify-content:center; gap:10px; z-index:6;">
    <a href="https://www.instagram.com/speakeasy.ptbr" target="_blank" style="font-family:'Inter',sans-serif; font-size:10px; letter-spacing:0.12em; text-transform:uppercase; color:rgba(255,255,255,0.45); text-decoration:none;">@speakeasy.ptbr</a>
    <div style="width:3px;height:3px;border-radius:50%;background:#7EC8A4;"></div>
    <a href="https://speakeasyptbr.com" target="_blank" style="font-family:'Inter',sans-serif; font-size:10px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; color:#7EC8A4; text-decoration:none;">speakeasyptbr.com</a>
  </div>
  <div style="position:absolute; left:90px; top:35px; width:239px; height:228px; overflow:hidden; z-index:2; pointer-events:none;">
    <img src="../_shared/assets/Cristo.svg" alt="Cristo Redentor" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
  </div>
  <div style="position:absolute; left:0; right:0; top:270px; padding:0 24px; text-align:center; z-index:3;">
    <div style="font-family:'Poppins',sans-serif; font-size:36px; font-weight:800; color:#1E4D3B; line-height:0.95; letter-spacing:-1px; text-transform:uppercase; margin-bottom:10px;">Transcripts<br>&amp; Study Notes</div>
    <div style="font-family:'Inter',sans-serif; font-size:12px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase; color:#2D6B52; margin-bottom:14px;">Brazilian<br>Listening Lab</div>
    <div style="width:44px; height:3px; background:#A8E6C3; border-radius:2px; margin:0 auto 13px;"></div>
    <div style="font-family:'Poppins',sans-serif; font-size:11px; font-weight:600; color:#1E4D3B; margin-bottom:5px;">{tier.upper()} TIER · {count} DIALOGUES</div>
    <div style="font-family:'Inter',sans-serif; font-size:11px; color:#4A6B58;">full transcripts · vocab notes · comprehension questions</div>
  </div>
  <div style="position:absolute; left:270px; top:425px; width:232px; height:299px; overflow:hidden; z-index:1; pointer-events:none;">
    <img src="../_shared/assets/Arara.svg" alt="Arara" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
  </div>
  <div style="position:absolute; left:-20px; top:560px; width:238.5px; height:157.2px; overflow:hidden; opacity:0.6; z-index:1; pointer-events:none;">
    <img src="../_shared/assets/Palacio.svg" alt="Palácio" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
  </div>
</div>
"""


def render_intro() -> str:
    return """
<!-- PAGE 02 — How to use -->
<div class="page-label">📄 PAGE 02 — How to use</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">How to use</div>
      <h1 class="header-title">Read along,<br>listen deeper</h1>
      <p class='header-sub'>The transcripts workflow</p>
    </div>
    <div class="page-num">02</div>
  </div>
  <div class="body">
    <p class="intro">These transcripts are companions to your audio files. Use them to unlock comprehension you couldn't catch on passive listening.</p>

    <div class="tip-box">
      <div class="tip-icon">🎧</div>
      <div>
        <div class="tip-label">The 3-pass workflow</div>
        <div class="tip-text">
          <strong>Pass 1</strong> — listen to the dialogue without the transcript. Get the rhythm, even if you miss words.<br><br>
          <strong>Pass 2</strong> — read along with the transcript. Check vocab notes for tricky phrases.<br><br>
          <strong>Pass 3</strong> — listen again, transcript closed. You'll catch more than before.
        </div>
      </div>
    </div>

    <div class="vocab-box">
      <div class="vocab-label">📚 What each section contains</div>
      <div class="vocab-item"><strong>Scene</strong> — the full Portuguese dialogue with speaker labels (A / B).</div>
      <div class="vocab-item"><strong>Vocab notes</strong> — tricky phrases, idioms, and Brazilianisms explained in English.</div>
      <div class="vocab-item"><strong>Comprehension questions</strong> — test your understanding after listening.</div>
      <div class="vocab-item"><strong>Fill-the-gap</strong> — from Plus tier onwards, word-completion exercises.</div>
    </div>

    <div class="comp-box">
      <div class="comp-label">💡 Don't translate word-by-word</div>
      <div class="comp-item" data-num="→">Let context teach you. You don't need to understand every word — you need to feel the rhythm of real Brazilian speech.</div>
    </div>
  </div>
</div>
"""


def render_toc(dialogues, start_page: int) -> str:
    """Table of contents — one page if fits, two if needed."""
    # Dividir em 2 páginas se necessário (25 dialogues per page)
    chunks = []
    for i in range(0, len(dialogues), 25):
        chunks.append(dialogues[i:i+25])

    html_parts = []
    for idx, chunk in enumerate(chunks):
        page_num = 3 + idx
        items = "\n".join([
            f'''<div class="toc-item">
      <div class="toc-num">{d["num"]:02d}</div>
      <div class="toc-title">{d["title_pt"]}</div>
      <div class="toc-level">{d["level"].strip()}</div>
      <div class="toc-dots"></div>
      <div class="toc-page">{start_page + dialogues.index(d)}</div>
    </div>'''
            for d in chunk
        ])
        part = idx + 1
        suffix = f" ({part}/{len(chunks)})" if len(chunks) > 1 else ""
        html_parts.append(f"""
<!-- PAGE {page_num:02d} — TOC{suffix} -->
<div class="page-label">📄 PAGE {page_num:02d} — Contents{suffix}</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">Contents</div>
      <h1 class="header-title">All dialogues</h1>
      <p class='header-sub'>{len(dialogues)} transcripts total{suffix}</p>
    </div>
    <div class="page-num">{page_num:02d}</div>
  </div>
  <div class="body">
    {items}
  </div>
</div>
""")
    return "\n".join(html_parts)


def render_dialogue(d: dict, page_num: int) -> str:
    """Render one dialogue as one page."""
    # Scene turns
    turns_html = "\n".join([
        f'''<div class="turn">
      <div class="turn-speaker {'b' if t['speaker']=='B' else ''}">{t['speaker']}</div>
      <div class="turn-text">{'<span class="role">' + t['role'] + '</span>' if t['role'] else ''}{t['text']}</div>
    </div>'''
        for t in d["turns"]
    ])

    # Vocab
    vocab_html = ""
    if d["vocab"]:
        items = "\n".join([
            f'<div class="vocab-item"><strong>{v["term"]}</strong> — {v["note"]}</div>' if v["term"]
            else f'<div class="vocab-item">{v["note"]}</div>'
            for v in d["vocab"]
        ])
        vocab_html = f'''
    <div class="vocab-box">
      <div class="vocab-label">📚 Vocab notes</div>
      {items}
    </div>'''

    # Comprehension
    comp_html = ""
    if d["questions"]:
        items = "\n".join([
            f'<div class="comp-item" data-num="{i+1}.">{q}</div>'
            for i, q in enumerate(d["questions"])
        ])
        comp_html = f'''
    <div class="comp-box">
      <div class="comp-label">🎯 Comprehension questions</div>
      {items}
    </div>'''

    # Fill-the-gap
    gap_html = ""
    if d["gaps"]:
        items = "\n".join([
            f'<div class="gap-item" data-num="{i+1}.">{g}</div>'
            for i, g in enumerate(d["gaps"])
        ])
        gap_html = f'''
    <div class="gap-box">
      <div class="gap-label">✍️ Fill-the-gap</div>
      {items}
    </div>'''

    return f"""
<!-- PAGE {page_num:02d} — Dialogue {d['num']:02d} -->
<div class="page-label">📄 PAGE {page_num:02d} — Dialogue {d['num']:02d}</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">Dialogue {d['num']:02d}</div>
      <h1 class="header-title">{d['title_pt']}</h1>
      <p class='header-sub'>{d['title_en']}</p>
    </div>
    <div class="page-num">{page_num:02d}</div>
  </div>
  <div class="body">
    <div class="meta-row">
      <div class="meta-chip"><strong>Level</strong> {d['level']}</div>
      <div class="meta-chip"><strong>Setting</strong> {d['setting']}</div>
      <div class="meta-chip"><strong>Theme</strong> {d['theme']}</div>
    </div>

    <div class="scene">
      {turns_html}
    </div>
    {vocab_html}
    {comp_html}
    {gap_html}
  </div>
</div>
"""


def render_closing(page_num: int) -> str:
    return f"""
<!-- PAGE {page_num:02d} — Closing -->
<div class="page-label">📄 PAGE {page_num:02d} — Closing</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">That's a wrap</div>
      <h1 class="header-title">Keep<br>listening</h1>
      <p class='header-sub'>The rhythm compounds</p>
    </div>
    <div class="page-num">{page_num:02d}</div>
  </div>
  <div class="body">
    <p class="intro">Comprehension doesn't happen in one session. It builds through repeated exposure. Come back to these transcripts whenever you feel stuck on a dialogue.</p>

    <div class="tip-box">
      <div class="tip-icon">🌱</div>
      <div>
        <div class="tip-label">Next steps</div>
        <div class="tip-text">
          Try listening to each dialogue three times across three different days. The second and third listens catch more than the first. <em>Consistency beats intensity.</em>
        </div>
      </div>
    </div>

    <div class="comp-box">
      <div class="comp-label">🎧 Ready for more?</div>
      <div class="comp-item" data-num="→">Your Pro tier unlocks 50 dialogues. Plus tier has 30. Upgrade when you've mastered your current level.</div>
      <div class="comp-item" data-num="→">Complementary product: <strong>Speaking &amp; Pronunciation Kit</strong> — train the active side of the language (rhythm, nasals, R).</div>
      <div class="comp-item" data-num="→">Foundation product: <strong>Everyday Brazilian Portuguese</strong> — 100 practical phrases and the cultural rules behind them.</div>
    </div>
  </div>
</div>
"""


HTML_TAIL = """
<script src="https://cdn.jsdelivr.net/npm/@twemoji/api@latest/dist/twemoji.min.js" crossorigin="anonymous"></script>
<script>
  twemoji.parse(document.body, {
    base: 'https://cdn.jsdelivr.net/gh/iamcal/emoji-data@master/',
    folder: 'img-apple-160',
    ext: '.png'
  });
</script>
</body>
</html>
"""


def build_tier(dialogues, tier: str, max_num: int):
    selected = [d for d in dialogues if d["num"] <= max_num]
    count = len(selected)

    # Page numbering:
    # page 1 = cover
    # page 2 = how to use
    # page 3+ = TOC (1 page up to 25, 2 pages if 30+)
    num_toc_pages = 1 if count <= 25 else 2
    first_dialogue_page = 2 + num_toc_pages + 1  # after cover+intro+TOC

    parts = [HTML_HEAD]
    parts.append(render_cover(tier, count))
    parts.append(render_intro())
    parts.append(render_toc(selected, first_dialogue_page))

    page_num = first_dialogue_page
    for d in selected:
        parts.append(render_dialogue(d, page_num))
        page_num += 1

    parts.append(render_closing(page_num))
    parts.append(HTML_TAIL)

    out_path = OUTPUT_DIR / f"speakeasy_transcripts_{tier}.html"
    out_path.write_text("".join(parts), encoding="utf-8")
    print(f"   ✅ {out_path.name}: {count} dialogues, {page_num} pages")


def main():
    md = DIALOGUES_MD.read_text(encoding="utf-8")
    dialogues = parse_dialogues(md)
    print(f"📚 Parsed {len(dialogues)} dialogues from dialogues.md\n")

    for tier, max_num in [("basic", 15), ("plus", 30), ("pro", 50)]:
        print(f"📦 Building {tier} (dialogues 1-{max_num})...")
        build_tier(dialogues, tier, max_num)
    print("\n✅ All 3 tier HTMLs generated.")


if __name__ == "__main__":
    main()
