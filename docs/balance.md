# Combat, capture and balance — baseline 0.1
Date: 2026-11-25. All numbers are experimental unless marked as invariant.

## Invariants
- Every Kin Matters. No species is designed as disposable fodder or permanently obsolete.
- Accessible Kin may start weaker and require noticeably more time and investment; legendary/ancient Kin may begin with a strong stat profile and more unlocked abilities. Both must be viable at comparable endgame development. No rarity-only permanent power multiplier. Equal viability does not mean identical stats or DPS.
- Each species has a distinctive role, signature ability, strengths and weaknesses. At least one genuine use case. Main content must remain achievable with appropriately developed favorites, including early creatures.
- Capture only after defeat, and no auto combat for first playable prototype.

## Proposed progression model
Separate wild encounter rank, species rarity, level, and potential/mastery. A legendary wild boss can be threatening without transferring boss-only modifiers to its recruited form.
Use species-specific starting budgets and progress toward role-weighted endgame budgets. Illustrative normalized starting and developed budgets (not raw HP/ATK):
| Profile | Starting | Developed | Investment target |
|---|---:|---:|---|
| Common | 60 | 100 | 1.0x reference |
| Uncommon | 70 | 100 | 0.85x |
| Rare | 80 | 100 | 0.7x |
| Ancient | 90 | 100 | 0.5x |
Budget(level, mastery) = start + (cap-start)*progress; progress is bounded [0,1] and must reflect actual investment, not only time. Use smooth curves and diminishing returns. Example only: 60 starting vs 90 starting is not an instruction to grant 50% more DPS. Model rarity advantage without making beginners feel punished. Do not charge twice by requiring both excess XP and excessive scarce materials. Reward continued use, not repetitive duplicate captures; avoid paid shortcuts or real-world timers.
Level progression, role-specific talents, mastery, affinity, traits and signature skills are candidates. Awakening (keep appearance) and Ascension (change form/playstyle) should offer comparable potential; evolution is optional, including for single-stage species. Avoid an automatic mandatory stat boost from form change. Prismatic variants cosmetic by default.

## Combat and UI
One active Kin follows the player. Six-slot roster and 6–8 skills are working targets; test touch ergonomics before locking. Mobile: tap enemy to lock, target button selects/cycles nearby enemies, hold opens nearby target list; select does not initiate attack. Attack command triggers approach and basic attacks against selected target only. Skills manually triggered; directional/area/target classes; tap may aim toward current target, optional drag to aim. Recall stops attacks and returns Kin. No auto-target, auto-cast or auto-farm. Player has no separate combat skill bar. Boss telegraphs must be readable and avoidable. Controls should support touch and PC input without tiny icons.

## Capture
Defeat -> unconscious state (capture window) -> select target -> Bond action -> choose Aevin -> resonance animation -> success or failure. No thrown ball or required minigame. No attack against defeated target; failure consumes item and may allow retry within window. Handle target invalidation, inventory, cancel, KO timer and roster/storage overflow atomically; no duplicate rewards. Captured Kin retains identity and legitimate progression. Legendary or story-only exceptions require explicit design.
Candidate Aevin grades: base 1x, Prime 1.5x, Royal 2x, Astral 3x, Eternal guaranteed for eligible targets. Specialized: Lunar (night), Solar (day), Tidal (aquatic), Swift (early KO window), Harmony (initial affinity). More candidates: Verdant, Titan, Tempest, Echo, Ancient, Patient, Mercy, Valor, Fortune, Vigor, Legacy. Only prototype base + one higher grade + one condition-specific grade initially. Probabilities are placeholders; one trial per consumed item; clear caps and conditional tooltips. Avoid time-change exploits by deciding conditions at encounter/defeat and documenting them.
 
## QA design gate
Simulate equal investment AND equal endgame development separately. Test early/mid/late growth, single-target DPS, AoE, sustain, control, mobility, cooldown, boss survival, encounter completion, and matchup variance. Assess each role in relevant scenarios, not a raw stat sum. Use deterministic random seeds and reproducible reports. Early targets (proposal): within 10–15% role benchmark at mature investment, no compulsory rare Kin for progression, no endlessly scaling passive loops. Manual playtest required for usability, hitboxes and combat feel. New regions expand horizontally; avoid releasing stronger mandatory species each update.

## Aspect update (2026-11-25)
[Aspect System 1.0](aspects.md) is authoritative for elemental damage: maximum ±25%, no multiplication or immunities, one attack Aspect per damaging hit, distinct one/two defender Aspects, no Resonance in initial scope. The 12×12 matrix is provisional until combat testing.
