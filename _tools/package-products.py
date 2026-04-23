#!/usr/bin/env python3
"""
package-products.py — build customer-facing delivery folders and ZIPs for each product.

Usage:
  python _tools/package-products.py --product=everyday
  python _tools/package-products.py --product=pronunciation-kit
  python _tools/package-products.py --product=listening-lab
  python _tools/package-products.py --all

Output: delivery/ folders at each product root with organized content + ZIPs.
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

CHAPTER_NAMES = {
    1:  "Chapter 01 - Greetings and First Impressions",
    2:  "Chapter 02 - Polite Essentials",
    3:  "Chapter 03 - Introductions and Small Talk",
    4:  "Chapter 04 - Understanding and Clarification",
    5:  "Chapter 05 - Everyday Needs and Feelings",
    6:  "Chapter 06 - Time and Plans",
    7:  "Chapter 07 - Directions and Places",
    8:  "Chapter 08 - Shopping and Money",
    9:  "Chapter 09 - Food and Drink",
    10: "Chapter 10 - Transport and Closing",
}


def sanitize_phrase(phrase: str) -> str:
    """Clean up Layla's filename phrases — strip junk chars from OS munging."""
    # Replace double/trailing underscores (leftover from ?, :, etc.)
    p = re.sub(r"_+", " ", phrase)
    # Collapse spaces, strip
    p = re.sub(r"\s+", " ", p).strip()
    # Strip trailing periods
    p = p.rstrip(".")
    return p


def convert_m4a_to_mp3(src: Path, dst: Path) -> None:
    """Convert m4a to mp3 at 192kbps using ffmpeg."""
    dst.parent.mkdir(parents=True, exist_ok=True)
    result = subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(src),
            "-codec:a", "libmp3lame", "-b:a", "192k",
            str(dst),
        ],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg failed for {src.name}: {result.stderr[-400:]}")


def _long_path(p: Path) -> str:
    """Windows extended path prefix to bypass MAX_PATH=260 limit."""
    abs_str = str(p.resolve())
    if os.name == "nt" and not abs_str.startswith("\\\\?\\"):
        return "\\\\?\\" + abs_str
    return abs_str


def zip_folder(folder: Path, out_zip: Path) -> None:
    """Zip folder contents preserving folder name at root of zip. Long-path safe on Windows."""
    out_zip.parent.mkdir(parents=True, exist_ok=True)
    if out_zip.exists():
        out_zip.unlink()
    parent = folder.parent
    with zipfile.ZipFile(_long_path(out_zip), "w", zipfile.ZIP_DEFLATED) as zf:
        # Walk tree manually so we can use long-path prefix on Windows
        for root, dirs, files in os.walk(_long_path(folder)):
            for f in files:
                full = Path(root) / f
                # Strip long-path prefix for arcname computation
                rel = str(full).replace("\\\\?\\", "")
                rel_path = Path(rel).relative_to(parent.resolve())
                zf.write(str(full), str(rel_path))


def package_everyday() -> None:
    print("=" * 60)
    print("EVERYDAY BRAZILIAN PORTUGUESE")
    print("=" * 60)

    product_dir = REPO_ROOT / "everyday-brazilian-portuguese"
    pdf_dir = product_dir / "pdf"
    layla_dir = product_dir / "audio" / "Audios ebook"
    delivery_dir = product_dir / "delivery"

    # Clean prior delivery (with long-path prefix on Windows)
    if delivery_dir.exists():
        shutil.rmtree(_long_path(delivery_dir))
    delivery_dir.mkdir(parents=True)

    # === TIER 1: EBOOK ONLY (€9.90) ===
    ebook_name = "Everyday Brazilian Portuguese - Ebook Only"
    ebook_root = delivery_dir / ebook_name / "Everyday Brazilian Portuguese"
    ebook_root.mkdir(parents=True)

    print(f"\n📦 Building tier €9.90: {ebook_name}")
    # Root: Start Here only
    shutil.copy2(pdf_dir / "Everyday Brazilian Portuguese - Start Here.pdf", ebook_root / "Start Here.pdf")
    # Books subfolder
    books_dir = ebook_root / "Books"
    books_dir.mkdir()
    shutil.copy2(pdf_dir / "Everyday Brazilian Portuguese.pdf", books_dir)
    shutil.copy2(pdf_dir / "Brazilian Culture & Etiquette Guide.pdf", books_dir)
    print(f"   ✅ Start Here (root) + 2 PDFs in Books/")

    # === TIER 2: EBOOK + AUDIO (€19.90) ===
    full_name = "Everyday Brazilian Portuguese - Ebook and Audio"
    full_root = delivery_dir / full_name / "Everyday Brazilian Portuguese"
    full_root.mkdir(parents=True)

    print(f"\n📦 Building tier €19.90: {full_name}")
    # Root: Start Here only
    shutil.copy2(pdf_dir / "Everyday Brazilian Portuguese - Start Here.pdf", full_root / "Start Here.pdf")
    # Books subfolder
    books_dir = full_root / "Books"
    books_dir.mkdir()
    shutil.copy2(pdf_dir / "Everyday Brazilian Portuguese.pdf", books_dir)
    shutil.copy2(pdf_dir / "Brazilian Culture & Etiquette Guide.pdf", books_dir)
    # One Day in Brazil subfolder (audio + transcript together)
    one_day_dir = full_root / "One Day in Brazil"
    one_day_dir.mkdir()
    shutil.copy2(pdf_dir / "One Day in Brazil - Transcript.pdf", one_day_dir)
    shutil.copy2(product_dir / "audio" / "One Day in Brazil.mp3", one_day_dir)

    # Audio Book subfolder (chapter audios by Layla)
    chapter_audio_root = full_root / "Audio Book"
    chapter_audio_root.mkdir()

    pattern = re.compile(r"Chapter (\d+), Lesson (\d+) - (.+)\.m4a$", re.IGNORECASE)
    files = sorted(layla_dir.glob("*.m4a"))
    print(f"   Processing {len(files)} chapter audio files (m4a → mp3 @ 192kbps)...")

    converted = 0
    for src in files:
        m = pattern.match(src.name)
        if not m:
            print(f"   ⚠️  Skipped (no match): {src.name}")
            continue
        chapter_num = int(m.group(1))
        lesson_num = int(m.group(2))
        phrase = sanitize_phrase(m.group(3))

        chapter_folder = chapter_audio_root / CHAPTER_NAMES[chapter_num]
        chapter_folder.mkdir(exist_ok=True)

        new_name = f"Lesson {lesson_num:03d} - {phrase}.mp3"
        dst = chapter_folder / new_name

        convert_m4a_to_mp3(src, dst)
        converted += 1
        if converted % 10 == 0:
            print(f"   ✅ {converted}/{len(files)} converted")

    print(f"   ✅ {converted}/{len(files)} audio files converted to MP3")
    print(f"   ✅ Structure: Start Here (root) + Books/ (2) + One Day in Brazil/ (audio+transcript) + Audio Book/ ({converted} files in 10 chapters)")

    # === Build ZIPs ===
    print("\n📦 Creating ZIPs...")

    zip1 = delivery_dir / f"{ebook_name}.zip"
    zip_folder(delivery_dir / ebook_name / "Everyday Brazilian Portuguese", zip1)
    size1 = zip1.stat().st_size / (1024 * 1024)
    print(f"   ✅ {zip1.name} ({size1:.1f} MB)")

    zip2 = delivery_dir / f"{full_name}.zip"
    zip_folder(delivery_dir / full_name / "Everyday Brazilian Portuguese", zip2)
    size2 = zip2.stat().st_size / (1024 * 1024)
    print(f"   ✅ {zip2.name} ({size2:.1f} MB)")

    print(f"\n✅ Everyday packaging done. Delivery in {delivery_dir.relative_to(REPO_ROOT)}/")


def package_pronunciation_kit() -> None:
    print("=" * 60)
    print("SPEAKING & PRONUNCIATION KIT")
    print("=" * 60)

    product_dir = REPO_ROOT / "speaking-pronunciation-kit"
    pdf_dir = product_dir / "pdf"
    audio_dir = product_dir / "audio"
    delivery_dir = product_dir / "delivery"

    if delivery_dir.exists():
        shutil.rmtree(_long_path(delivery_dir))
    delivery_dir.mkdir(parents=True)

    # === TIER: BASIC (€29.90) ===
    basic_name = "Speaking and Pronunciation Kit - Basic"
    basic_root = delivery_dir / basic_name / "Speaking and Pronunciation Kit"
    basic_root.mkdir(parents=True)

    print(f"\n📦 Building tier €29.90: {basic_name}")
    # Root: Start Here + AUDIO-NOTICE
    shutil.copy2(pdf_dir / "Speaking & Pronunciation Kit - Start Here.pdf", basic_root / "Start Here.pdf")
    (basic_root / "AUDIO-NOTICE.txt").write_text(AUDIO_NOTICE_PK, encoding="utf-8")

    # Books subfolder
    books_dir = basic_root / "Books"
    books_dir.mkdir()
    shutil.copy2(pdf_dir / "Speaking & Pronunciation Kit.pdf", books_dir / "Speaking and Pronunciation Kit.pdf")

    # Audio Drills subfolder
    drills_dir = basic_root / "Audio Drills"
    drills_dir.mkdir()
    chapter_count = 0
    if audio_dir.exists():
        for folder in sorted(audio_dir.iterdir()):
            if folder.is_dir():
                dst = drills_dir / folder.name
                shutil.copytree(_long_path(folder), _long_path(dst))
                chapter_count += 1
    print(f"   ✅ Structure: Start Here + AUDIO-NOTICE (root) + Books/ (1 PDF) + Audio Drills/ ({chapter_count} folders)")

    # === Build ZIP ===
    print("\n📦 Creating ZIP...")
    zip1 = delivery_dir / f"{basic_name}.zip"
    zip_folder(delivery_dir / basic_name / "Speaking and Pronunciation Kit", zip1)
    size1 = zip1.stat().st_size / (1024 * 1024)
    print(f"   ✅ {zip1.name} ({size1:.1f} MB)")

    print(f"\n✅ Pronunciation Kit basic tier packaged. Plus and Pro tiers pending content creation.")
    print(f"   Delivery in {delivery_dir.relative_to(REPO_ROOT)}/")


def package_listening_lab() -> None:
    print("=" * 60)
    print("BRAZILIAN LISTENING LAB")
    print("=" * 60)

    product_dir = REPO_ROOT / "brazilian-listening-lab"
    if not product_dir.exists():
        print(f"   ⚠️  Product folder not found — Listening Lab not yet built")
        return

    audio_dir = product_dir / "audio"
    if not audio_dir.exists():
        print(f"   ⏸️  No audio folder at {audio_dir.relative_to(REPO_ROOT)}/")
        return

    dialogue_files = sorted(audio_dir.glob("Dialogue_*.mp3"))
    if not dialogue_files:
        print(f"   ⏸️  No dialogue audios generated yet")
        return

    print(f"   Found {len(dialogue_files)} dialogue audios")

    delivery_dir = product_dir / "delivery"
    if delivery_dir.exists():
        shutil.rmtree(_long_path(delivery_dir))
    delivery_dir.mkdir(parents=True)

    # === 3 tiers: Basic (15) / Plus (30) / Pro (50) ===
    tiers = [
        ("Basic",  15, "€19.90"),
        ("Plus",   30, "€39.90"),
        ("Pro",    50, "€59.90"),
    ]

    for tier_name, count, price in tiers:
        folder_name = f"Brazilian Listening Lab - {tier_name}"
        tier_root = delivery_dir / folder_name / "Brazilian Listening Lab"
        tier_root.mkdir(parents=True)

        print(f"\n📦 Building tier {price}: {folder_name} ({count} dialogues)")

        # Root: Start Here
        shutil.copy2(product_dir / "pdf" / "Brazilian Listening Lab - Start Here.pdf", tier_root / "Start Here.pdf")

        # Dialogues subfolder
        dialogues_dir = tier_root / "Dialogues"
        dialogues_dir.mkdir()
        for f in dialogue_files[:count]:
            shutil.copy2(f, dialogues_dir / f.name)

        print(f"   ✅ Structure: Start Here (root) + Dialogues/ ({count} MP3s)")

        zip_path = delivery_dir / f"{folder_name}.zip"
        zip_folder(tier_root, zip_path)
        size = zip_path.stat().st_size / (1024 * 1024)
        print(f"   ✅ {zip_path.name} ({size:.1f} MB)")

    print(f"\n✅ Listening Lab packaged (3 tiers). Delivery in {delivery_dir.relative_to(REPO_ROOT)}/")


README_EBOOK_ONLY = """Everyday Brazilian Portuguese
E-book tier (€9.90)

Thank you for your purchase!

WHAT YOU HAVE:
  1. Everyday Brazilian Portuguese.pdf
     — 100 everyday phrases across 10 chapters. Your phrasebook.

  2. Brazilian Culture & Etiquette Guide.pdf
     — 13-page bonus guide covering the unwritten cultural rules
       (beijo, Pix, tipping, rodízio, hora brasileira, holidays, and more).

HOW TO USE:
  - Read the main e-book cover-to-cover once. It's designed to be
    readable in under an hour.
  - Keep the Culture Guide handy — re-read a chapter before any
    real Brazilian social situation.
  - When you're ready for the audio version with Layla's authentic
    narration, upgrade to the Audio tier (€19.90) on our website.

WANT MORE?
  - Speaking & Pronunciation Kit (€29.90+) for focused pronunciation
    training.
  - Visit speakeasyptbr.com for the full library.

Boa sorte e boa viagem!
— SpeakEasy Portuguese
"""

README_EBOOK_AUDIO = """Everyday Brazilian Portuguese
Ebook + Audio tier (€19.90)

Thank you for your purchase!

WHAT YOU HAVE:
  1. Everyday Brazilian Portuguese.pdf
     — 100 everyday phrases across 10 chapters. Your phrasebook.

  2. Brazilian Culture & Etiquette Guide.pdf
     — 13-page bonus guide on the unwritten cultural rules
       (beijo, Pix, tipping, rodízio, hora brasileira, and more).

  3. Chapter Audio/ (100 MP3 files)
     — All 100 phrases narrated by Layla, a native Brazilian voice.
       Organized by chapter for easy navigation.

  4. One Day in Brazil.mp3 + transcript
     — 8-minute immersion audio: a typical day in Rio, narrated at
       natural speed. The transcript PDF has Portuguese + English
       side by side.

HOW TO USE:

  Audio on the go:
  - Play the chapter audio during commutes, workouts, or chores.
  - Start with Chapter 01 and progress at your own pace.
  - Come back to the main e-book for the written context of each
    phrase.

  Immersion listening:
  - Listen to "One Day in Brazil" with the transcript closed first
    (pass 1 — just get used to the rhythm).
  - Open the transcript and listen again (pass 2 — follow along).
  - Listen a third time, transcript closed (pass 3 — notice how
    much more you catch).

WANT MORE?
  - Speaking & Pronunciation Kit (€29.90+) for focused pronunciation
    training on the 8 hardest Brazilian sounds.
  - Visit speakeasyptbr.com for the full library.

Boa sorte e boa viagem!
— SpeakEasy Portuguese
"""


README_PK_BASIC = """Speaking and Pronunciation Kit
Basic tier (€29.90)

Thank you for your purchase!

WHAT YOU HAVE:
  1. Start Here.pdf
     — Read this first. 4 pages on how to use the kit, daily routine,
       and what each piece delivers.

  2. Speaking and Pronunciation Kit.pdf
     — 28-page guide. 8 chapters on the sounds that make Brazilian
       Portuguese distinctive: rhythm, vowels, nasals, R/RR/H,
       T/D before I, LH/NH, final L and S, connected speech.
       Each chapter has theory spotlight, drill progression, minimal
       pairs lab, common traps, and cultural context. Plus 50 survival
       phrases bonus, 14-day plan, and audio index.

  3. 46 audio drills (Chapter_01 through Chapter_08 folders)
     — One MP3 per lesson. Each drill follows a teaching format:
       natural utterance → slow repetition → English meaning.

  4. 13 bonus survival phrases (Bonus_50_Survival_Phrases folder)
     — 50 high-frequency phrases grouped into 13 audio files.

HOW TO USE:
  - Read Start Here first.
  - Follow the 14-day plan in the main guide.
  - For each chapter: read the theory (~5 min), then do the audio
    drills (~10 min), then try the minimal pairs aloud.
  - Come back to any chapter weekly.

WANT MORE?
  - Plus tier (€69.90) adds Listening Mini-Pack (10 dialogues),
    Flashcards CSV, and Top 50 Mistakes PDF.
  - Pro tier (€129.90) adds Full Listening Booster, Speaking Scripts
    Pack (200 scripts), and 21-Day Fluency Plan.
  - Visit speakeasyptbr.com to upgrade or bundle.

— SpeakEasy Portuguese
"""


README_LL = """Brazilian Listening Lab
{TIER} tier ({PRICE})

Thank you for your purchase!

WHAT YOU HAVE:
  {COUNT} dialogue audios (Dialogue_01.mp3 through Dialogue_{COUNT}.mp3)

Each dialogue is a short natural conversation between two Brazilian
speakers (male + female), covering everyday situations: ordering
food, taking an Uber, asking for directions, dealing with a doctor,
meeting neighbours, and more.

The dialogues progress in difficulty:
  - Dialogues 1-15  : Level A1-A2 (simple everyday situations)
  - Dialogues 16-30 : Level A2-B1 (richer conversations, more idioms)
  - Dialogues 31-50 : Level B1-B2 (complex scenarios, faster speech)

HOW TO USE:
  - Listen passively during commutes, chores, workouts.
  - Don't try to understand every word — let the rhythm sink in.
  - Re-listen to individual dialogues until they feel natural.
  - When you're ready, upgrade to the next tier to expand your library.

WANT MORE?
  - Speaking & Pronunciation Kit (€29.90+) for focused pronunciation
    training on the 8 hardest Brazilian sounds.
  - Everyday Brazilian Portuguese (€9.90+) for a practical phrasebook.
  - Visit speakeasyptbr.com for the full library.

— SpeakEasy Portuguese
"""


CONTENT_NOTICE_LL = """CONTENT NOTICE

This first release of the Brazilian Listening Lab delivers the core
dialogue audios. Additional materials planned as free updates:

  - Transcripts PDF (Portuguese + English, line by line)
  - Vocabulary notes per dialogue
  - Comprehension questions
  - "Start Here" listening guide (how to practice active listening)
  - Slow-speed versions of each dialogue (for beginners)

These will be added in upcoming releases and delivered free to
existing purchasers via email.

— SpeakEasy Portuguese
"""


AUDIO_NOTICE_PK = """AUDIO NOTICE

The current audio files in this kit are the initial AI-generated
reference versions used during product development. An updated set
of audio drills, freshly recorded by Layla (our native Brazilian
voice), is being prepared and will be delivered as a free update
to all purchasers.

If you've received this kit before that update, watch your email —
you'll get the new audio at no extra cost.

— SpeakEasy Portuguese
"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--product", choices=["everyday", "pronunciation-kit", "listening-lab"])
    parser.add_argument("--all", action="store_true")
    args = parser.parse_args()

    if args.all or args.product == "everyday":
        package_everyday()

    if args.all or args.product == "pronunciation-kit":
        package_pronunciation_kit()

    if args.all or args.product == "listening-lab":
        package_listening_lab()


if __name__ == "__main__":
    main()
