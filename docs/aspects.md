# Aspect System 1.0
Date: 2026-11-25. Approved system rules; initial matchups and glyph master proposed for playtest/visual review.

## Locked rules
- Exactly twelve named Aspects at baseline. Each Kin has one or two distinct Aspects; origin, aspect, role and rarity are independent. Neutral is a damage tag, not a Kin Aspect.
- Each damaging skill hit has exactly one attacking Aspect or Neutral. A dual-Aspect Kin is not granted a second damage modifier. Skill pools may use either Aspect; no automatic same-Aspect damage bonus in this baseline.
- Attack row vs defending column. Values 125/100/75 percent. Same Aspect neutral. No type-based immunity.
- Dual defense: 100 + sum(each single-Aspect multiplier minus 100), clamped to 75..125. Two advantages => 125, two resistances => 75, opposite => 100; one neutral => other value. Neutral attack always 100. Apply once to computed damage, before final rounding; no extra stacking from Aspect. Non-damage healing, buffs and status chance are unaffected by this table. Resonance disabled until a separate design and balance pass.
- Every Kin Matters: no rarity-based modifier, no dual-Aspect bonus; validate actual matchups and role viability at equal investment and equal endgame development.

## Complete matrix
Each row has 2 advantages, 2 resistances, 8 neutral entries including self. Each column does too; matchup pairs are reciprocal in this version.
| Attack → Defense | Ember | Tide | Grove | Gale | Stone | Spark | Frost | Alloy | Lumen | Veil | Echo | Aether |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Ember | 1.00 | 0.75 | 1.25 | 0.75 | 1.00 | 1.00 | 1.25 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| Tide | 1.25 | 1.00 | 0.75 | 1.00 | 1.25 | 0.75 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 |
| Grove | 0.75 | 1.25 | 1.00 | 1.00 | 1.00 | 1.00 | 0.75 | 1.00 | 1.00 | 1.00 | 1.25 | 1.00 |
| Gale | 1.25 | 1.00 | 1.00 | 1.00 | 0.75 | 1.00 | 1.00 | 1.00 | 1.00 | 1.25 | 1.00 | 0.75 |
| Stone | 1.00 | 0.75 | 1.00 | 1.25 | 1.00 | 1.25 | 1.00 | 0.75 | 1.00 | 1.00 | 1.00 | 1.00 |
| Spark | 1.00 | 1.25 | 1.00 | 1.00 | 0.75 | 1.00 | 1.00 | 1.25 | 0.75 | 1.00 | 1.00 | 1.00 |
| Frost | 0.75 | 1.00 | 1.25 | 1.00 | 1.00 | 1.00 | 1.00 | 0.75 | 1.00 | 1.00 | 1.00 | 1.25 |
| Alloy | 1.00 | 1.00 | 1.00 | 1.00 | 1.25 | 0.75 | 1.25 | 1.00 | 1.00 | 1.00 | 0.75 | 1.00 |
| Lumen | 1.00 | 1.00 | 1.00 | 1.00 | 1.00 | 1.25 | 1.00 | 1.00 | 1.00 | 1.25 | 0.75 | 0.75 |
| Veil | 1.00 | 1.00 | 1.00 | 0.75 | 1.00 | 1.00 | 1.00 | 1.00 | 0.75 | 1.00 | 1.25 | 1.25 |
| Echo | 1.00 | 1.00 | 0.75 | 1.00 | 1.00 | 1.00 | 1.00 | 1.25 | 1.25 | 0.75 | 1.00 | 1.00 |
| Aether | 1.00 | 1.00 | 1.00 | 1.25 | 1.00 | 1.00 | 0.75 | 1.00 | 1.25 | 0.75 | 1.00 | 1.00 |

## Matchup rationale (world rules, not real-world physics)
- Ember > Grove (burn), Frost (melt).
- Tide > Ember (cool), Stone (erosion).
- Grove > Tide (absorb), Echo (vegetation dampens vibration).
- Gale > Ember (disperse heat), Veil (disperse illusion mist).
- Stone > Spark (grounding), Gale (stable mass).
- Spark > Tide (conduct), Alloy (conduct/overload).
- Frost > Grove (freeze growth), Aether (crystallize unstable spatial energy).
- Alloy > Frost (break ice), Stone (cut/drill).
- Lumen > Veil (reveal), Spark (radiant field stabilizes charge).
- Veil > Aether (conceal spatial anchors), Echo (muffle).
- Echo > Alloy (resonant vibration), Lumen (disrupt coherent light constructs).
- Aether > Lumen (bend light), Gale (spatial vacuum).
These are fictional interactions. No inference from naming or real-world physics outside this table.

## Assets and data
- [Canonical JSON](../data/aspects.json)
- [Glyph master](../assets/ui/aspects/glyphs.svg) — original editable SVG with symbol IDs, shared hex frame, 12 silhouettes. Palette is a UI master, not final pixel raster. Export icons at 24/32/48px and test small-size legibility and accessibility; simplify intricate Frost/Alloy glyphs if needed. No third-party icon library.
- [QA](../tests/aspects.test.mjs) — Node built-in assertions, no dependencies.
- Prototype roster assignments are candidates, not final species definitions. Replace previous egg concepts with Pebblit and Kettli. Aevin remains the capture item family, not currency; currency name pending.
