# 12 — Flashcards CSV (shared across products)

## When to use
Invoked when any product's Plus tier needs flashcards. Produces Anki/Quizlet-compatible CSV.

## Variables
- `source_product` — which product's vocabulary to cover (everyday / speaking-kit / listening-lab)
- `target_count` — default 150–200 cards

## Persona shift
Flashcard curator with spaced-repetition expertise. You pick cards that beat diminishing returns: high-frequency vocabulary, high-surprise vocabulary (not a 1:1 cognate), and recurring construction patterns.

## Task

Produce a CSV with columns:

```
Front (PT-BR), Back (EN), Context phrase (PT-BR), Tag (module or chapter), Difficulty (1–3)
```

## Output file

`generated/{product-slug}/_extras/plus/flashcards-{product-slug}.csv`

## Acceptance criteria

- [ ] Exactly `target_count` cards
- [ ] Every card has all 5 columns
- [ ] Context phrase is not just "X is the word" — it's a real example sentence
- [ ] Tag matches a real module/chapter in the source product
- [ ] Difficulty 1 (easy) = 30%, Difficulty 2 (medium) = 50%, Difficulty 3 (hard) = 20%
- [ ] No duplicates of Front column
- [ ] CSV properly escaped (commas in context phrases → quoted)

## Output file format

```csv
Front (PT-BR),Back (EN),Context phrase (PT-BR),Tag,Difficulty
oi,hi / hey,"Oi, tudo bem?",CH01,1
obrigada,thank you (when speaker is female),"Obrigada pela ajuda!",CH02,1
...
```

## Armadilhas comuns

- **Don't include near-cognates as cards.** "hotel" = "hotel" is a waste.
- **Don't translate idioms literally in Back.** "Beleza?" → "all good? / you ok?" not "beauty?".
- **Don't skip gender inflection.** Separate cards for obrigado (M) and obrigada (F) when relevant.
