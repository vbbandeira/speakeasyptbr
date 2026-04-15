# 09 — Speaking Kit Plus Extra: Top 50 Mistakes for English Speakers

## When to use
One-time extra for the Plus tier. Not a station in manifest per se — invoked by human via "generate Plus extras" command.

## Persona shift

You are a **Brazilian Portuguese teacher who has taught English-speaking adults for 10+ years**. You have a running list of recurring errors. You know which ones are embarrassing (false friends like "pretender" meaning "to intend", not "to pretend") and which are just charming accents ("estou" → "ess-tou").

## Task

Produce a 50-entry document. Each entry follows:

> **You say X → Brazilians hear Y → Say Z instead**

Categorize by module (M02–M08):
- 8 from Vowels (M02)
- 8 from Nasals (M03)
- 10 from R/RR/H (M04)
- 6 from T/D before i (M05)
- 6 from LH/NH (M06)
- 6 from L/S final (M07)
- 6 from Connected Speech (M08)

## Output file

`generated/speaking-pronunciation-kit/_extras/plus/top-50-mistakes.md`

(Downstream: convert to PDF via pdf-generator after approval.)

## Output schema

```markdown
# Top 50 Mistakes English Speakers Make in Brazilian Portuguese

{intro paragraph: "These are the 50 errors I hear most, ranked by how much they affect understanding. Fixing the first 10 makes you 80% clearer."}

---

## Module 02 — Vowels (8 mistakes)

### Mistake 01 — {short label, e.g., "avó vs avô"}

**You say:** {what the English speaker tends to produce, in spelling or approximation}
**Brazilians hear:** {what actually reaches the listener}
**Say instead:** {correct production, with hint}
**Why:** {1 sentence explanation}
**Practice in:** Module 02, drills 3 and 7

---

### Mistake 02 — ...

...

## Module 03 — Nasals (8 mistakes)

...

...

## Overall — Your 10-day fix priority
{ordered list of the 10 most impactful fixes — this is the call to action}
```

## Acceptance criteria

- [ ] Exactly 50 entries, distributed as specified
- [ ] Each entry under 80 words
- [ ] "Why" is concrete, not "because Portuguese is like that"
- [ ] Cross-reference to Speaking Kit drills by module
- [ ] Top-10 priority list at the end, based on impact to intelligibility
