#!/usr/bin/env python3
"""
Build 2 things from dialogues.md:
  1. Vocabulary Flashcards CSV (Anki/Quizlet format) per tier
  2. Comprehension Workbook HTML per tier

CSV columns: Front (PT term), Back (EN explanation), Dialogue_Source

Usage:
  python _tools/build-workbook-and-flashcards.py
"""

import re
import csv
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DIALOGUES_MD = REPO_ROOT / "brazilian-listening-lab" / "audio-scripts" / "dialogues.md"
OUTPUT_DIR = REPO_ROOT / "brazilian-listening-lab"


# ── Reuse parser from transcripts script (inline for standalone) ──

def parse_dialogues(md: str):
    sections = re.split(r"^### Dialogue ", md, flags=re.MULTILINE)[1:]
    dialogues = []
    for section in sections:
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

        vocab = []
        vm = re.search(r"\*\*Vocabulary notes:\*\*\s*\n((?:- .+\n?)+)", section)
        if vm:
            for line in vm.group(1).strip().split("\n"):
                line = line.strip()
                if line.startswith("- "):
                    item = line[2:]
                    m = re.match(r'^"([^"]+)"\s*[—–-]\s*(.+)$', item)
                    if m:
                        vocab.append({"term": m.group(1), "note": m.group(2)})

        questions = []
        qm = re.search(r"\*\*Comprehension questions:\*\*\s*\n((?:\d+\.\s*.+\n?)+)", section)
        if qm:
            for line in qm.group(1).strip().split("\n"):
                q = re.match(r"^\d+\.\s*(.+)$", line.strip())
                if q:
                    questions.append(q.group(1).strip())

        gaps = []
        gm = re.search(r"\*\*Fill-the-gap exercise:\*\*\s*\n((?:\d+\.\s*.+\n?)+)", section)
        if gm:
            for line in gm.group(1).strip().split("\n"):
                g = re.match(r"^\d+\.\s*(.+)$", line.strip())
                if g:
                    gaps.append(g.group(1).strip())

        dialogues.append({
            "num": num, "title_pt": title_pt, "title_en": title_en,
            "level": level, "vocab": vocab, "questions": questions, "gaps": gaps,
        })
    return dialogues


# ── Build Flashcards CSV ──

def build_flashcards_csv(dialogues, tier: str, max_num: int):
    """Anki/Quizlet-compatible CSV. Columns: front, back, source, tags."""
    selected = [d for d in dialogues if d["num"] <= max_num]
    out = OUTPUT_DIR / "extras" / f"Vocabulary Flashcards - {tier.capitalize()}.csv"
    out.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    for d in selected:
        dialogue_label = f"Dialogue {d['num']:02d} — {d['title_pt']}"
        for v in d["vocab"]:
            rows.append({
                "front": v["term"],
                "back": v["note"],
                "source": dialogue_label,
                "tags": f"level-{d['level'].lower().replace(' ', '')} dialogue-{d['num']:02d}",
            })

    with open(out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["front", "back", "source", "tags"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"   ✅ {out.name}: {len(rows)} cards")
    return len(rows)


# ── Build Comprehension Workbook HTML ──

HTML_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SpeakEasy — Brazilian Listening Lab · Comprehension Workbook</title>
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
.exercise {
  background:#fff; border-radius:11px; border:1px solid #EDE9E0;
  padding:14px 16px;
}
.exercise-title {
  font-family:'Poppins',sans-serif; font-size:13px; font-weight:700;
  color:#1E4D3B; margin-bottom:4px;
}
.exercise-sub {
  font-family:'Inter',sans-serif; font-size:10.5px; color:#8FA897;
  font-style:italic; margin-bottom:10px;
}
.question {
  font-family:'Inter',sans-serif; font-size:11.5px; color:#3D5247;
  line-height:1.5; padding:6px 0 6px 22px; position:relative;
  border-top:1px solid rgba(212,203,187,0.3);
}
.question:first-of-type { border-top:none; padding-top:0; }
.question::before {
  content:attr(data-num); position:absolute; left:0; top:7px;
  font-family:'Poppins',sans-serif; font-size:11px; font-weight:700;
  color:#2D6B52;
}
.answer-space {
  display:block; border-bottom:1px solid rgba(212,203,187,0.7);
  min-height:16px; margin-top:6px;
}
.gap {
  font-family:'Poppins',sans-serif; font-size:11.5px; color:#1E4D3B;
  font-weight:500; padding:6px 0 6px 22px; position:relative;
  border-top:1px solid rgba(212,203,187,0.3);
}
.gap:first-of-type { border-top:none; padding-top:0; }
.gap::before {
  content:attr(data-num); position:absolute; left:0; top:7px;
  font-family:'Poppins',sans-serif; font-size:11px; font-weight:700;
  color:#2D6B52;
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
  }
  @page { size: 420px auto; margin: 0mm; }
  html, body {
    width: 420px !important; margin: 0 !important; padding: 0 !important;
    background: #F5F0E8 !important; display: block !important;
  }
  .page-label { display: none !important; }
  .page {
    width: 420px !important; border-radius: 0 !important;
    border: none !important; overflow: hidden !important;
    page-break-after: always; page-break-inside: avoid;
    margin: 0 !important;
  }
  .page:last-of-type { page-break-after: auto; }
  .exercise, .tip-box { page-break-inside: avoid; }
}
</style>
</head>
<body>
"""


def render_workbook_cover(tier: str, count: int) -> str:
    return f"""
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
  <div style="position:absolute; left:0; right:0; top:275px; padding:0 24px; text-align:center; z-index:3;">
    <div style="font-family:'Poppins',sans-serif; font-size:38px; font-weight:800; color:#1E4D3B; line-height:0.95; letter-spacing:-1px; text-transform:uppercase; margin-bottom:10px;">Comprehension<br>Workbook</div>
    <div style="font-family:'Inter',sans-serif; font-size:12px; font-weight:500; letter-spacing:0.22em; text-transform:uppercase; color:#2D6B52; margin-bottom:14px;">Brazilian Listening Lab</div>
    <div style="width:44px; height:3px; background:#A8E6C3; border-radius:2px; margin:0 auto 13px;"></div>
    <div style="font-family:'Poppins',sans-serif; font-size:11px; font-weight:600; color:#1E4D3B; margin-bottom:5px;">{tier.upper()} TIER · {count} dialogues</div>
    <div style="font-family:'Inter',sans-serif; font-size:11px; color:#4A6B58;">exercises · fill-the-gap · comprehension questions</div>
  </div>
  <div style="position:absolute; left:270px; top:425px; width:232px; height:299px; overflow:hidden; z-index:1; pointer-events:none;">
    <img src="../_shared/assets/Arara.svg" alt="Arara" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
  </div>
  <div style="position:absolute; left:-20px; top:560px; width:238.5px; height:157.2px; overflow:hidden; opacity:0.6; z-index:1; pointer-events:none;">
    <img src="../_shared/assets/Palacio.svg" alt="Palácio" style="position:absolute; left:-1px; top:-1px; width:calc(100% + 2px); height:calc(100% + 2px); display:block; object-fit:cover; object-position:center;" />
  </div>
</div>
"""


def render_workbook_intro(page_num: int) -> str:
    return f"""
<div class="page-label">📄 PAGE {page_num:02d} — How to use</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">How to use</div>
      <h1 class="header-title">Listen. Think. Answer.</h1>
      <p class='header-sub'>Training active comprehension</p>
    </div>
    <div class="page-num">{page_num:02d}</div>
  </div>
  <div class="body">
    <p class="intro">These exercises turn passive listening into active comprehension. Do them after listening to each dialogue.</p>

    <div class="tip-box">
      <div class="tip-icon">🎧</div>
      <div>
        <div class="tip-label">The workflow</div>
        <div class="tip-text">
          <strong>1.</strong> Listen to the dialogue with the transcript closed.<br><br>
          <strong>2.</strong> Open this workbook to that dialogue's page.<br><br>
          <strong>3.</strong> Answer the comprehension questions in your own words. Write the answers on a notebook or mentally.<br><br>
          <strong>4.</strong> (Plus/Pro only) Do the fill-the-gap exercises — these train vocabulary recall.<br><br>
          <strong>5.</strong> Check your answers by reading the transcripts PDF or listening again.
        </div>
      </div>
    </div>

    <div class="exercise">
      <div class="exercise-title">💡 Pro tip</div>
      <div class="exercise-sub">Why fill-the-gap works</div>
      <div class="question" data-num="→" style="padding-top:4px;">Word-level recall is harder than passive recognition. If you can produce the missing word from memory, you've truly internalized it.</div>
    </div>
  </div>
</div>
"""


def render_workbook_dialogue(d: dict, page_num: int) -> str:
    q_html = "\n".join([
        f'<div class="question" data-num="{i+1}.">{q}<span class="answer-space"></span></div>'
        for i, q in enumerate(d["questions"])
    ])
    comp_section = f'''
    <div class="exercise">
      <div class="exercise-title">🎯 Comprehension questions</div>
      <div class="exercise-sub">Answer in your own words</div>
      {q_html}
    </div>
    ''' if d["questions"] else ""

    gap_section = ""
    if d["gaps"]:
        gap_html = "\n".join([
            f'<div class="gap" data-num="{i+1}.">{g}</div>'
            for i, g in enumerate(d["gaps"])
        ])
        gap_section = f'''
    <div class="exercise">
      <div class="exercise-title">✍️ Fill-the-gap</div>
      <div class="exercise-sub">Complete with the missing word</div>
      {gap_html}
    </div>
    '''

    return f"""
<div class="page-label">📄 PAGE {page_num:02d} — Dialogue {d['num']:02d}</div>
<div class="page">
  <div class="header">
    <div>
      <div class="section-tag">Dialogue {d['num']:02d} · Exercises</div>
      <h1 class="header-title">{d['title_pt']}</h1>
      <p class='header-sub'>{d['title_en']} · Level {d['level']}</p>
    </div>
    <div class="page-num">{page_num:02d}</div>
  </div>
  <div class="body">
    {comp_section}
    {gap_section}
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


def build_workbook(dialogues, tier: str, max_num: int):
    selected = [d for d in dialogues if d["num"] <= max_num]
    # Filter: only include dialogues that have questions (and gaps for Plus+)
    selected = [d for d in selected if d["questions"] or d["gaps"]]

    parts = [HTML_HEAD]
    parts.append(render_workbook_cover(tier, len(selected)))
    parts.append(render_workbook_intro(2))
    page_num = 3
    for d in selected:
        parts.append(render_workbook_dialogue(d, page_num))
        page_num += 1
    parts.append(HTML_TAIL)

    out = OUTPUT_DIR / f"speakeasy_workbook_{tier}.html"
    out.write_text("".join(parts), encoding="utf-8")
    print(f"   ✅ {out.name}: {len(selected)} exercises, {page_num} pages")


def main():
    md = DIALOGUES_MD.read_text(encoding="utf-8")
    dialogues = parse_dialogues(md)
    print(f"📚 Parsed {len(dialogues)} dialogues\n")

    # NOTE: Flashcards are now generated as PDF-ready HTML via
    # build-flashcards-pdf.py (replaces the old Anki-style CSV).

    print("📝 Comprehension Workbooks:")
    # Plus tier gets Plus workbook (has fill-the-gap from dialogue 16+)
    build_workbook(dialogues, "plus", 30)
    build_workbook(dialogues, "pro", 50)
    print("\n✅ All workbooks generated.")


if __name__ == "__main__":
    main()
