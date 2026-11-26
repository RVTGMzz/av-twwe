# Game Design handoff — CP005
Branch: feature/game-design. Active scope only docs/systems/, data/kin/, tests/balance/. Trainer branch feature/modular-trainer remains independent; no edits to shared HANDOFF/DECISIONS/CHANGELOG on this branch to avoid parallel merge conflicts. Shared AGENTS default trainer task applies to trainer branch; this branch uses this dedicated handoff. Main not merged.
Done: Kin Core candidate spec, JSON and deterministic balance test. Design-side JS checks passed (145701 assertions); Node/CI and combat runtime not run. All numeric choices provisional. User approved direction Every Kin Matters, not these coefficients.
Next: owner reviews core; combat & skill model (damage, cooldowns, range, statuses, role benchmarks); then prototype roster. Read kin-core.md, data/kin/core-rules.json and docs/balance.md/aspects.md. On handoff update this file; commit/push and verify branch. Do not touch trainer assets.

## CP006 — 2026-11-26
Combat rules, 8 starter skills, design and test source committed. 6183 design-side JS checks passed, mature benchmark gap 0.4%. Node/CI and engine untested. Next: review numbers, Kin Atlas with stable IDs and name clearance, expanded scenario QA. Trainer and main untouched.

## CP007 — 2026-11-26
24 candidate families, 28 forms, all 12 Aspects, 5 roles, 6 origins; stable species/form IDs and legacy aliases. 268 design-side JS schema/reference checks passed; Node/CI not run. Names provisional; see name-screening.md. No new images/sprites/engine work. Next: owner reviews roster, then small visual batch and signature/trait/encounter data, or world map habitat design in parallel. Trainer/main untouched.

## CP007.1 — 2026-11-26
Owner approved both Kin visual boards. Archived exact WebP files under assets/concepts/ (Kin Atlas 01 and Starter Duo 02). See [kin-concept-approval.md](kin-concept-approval.md) for hashes, annotation discrepancies, and production gates. Visual approval only; gameplay data unchanged. Trainer/main untouched.
