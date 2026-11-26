# Game Design handoff — CP005
Branch: feature/game-design. Active scope only docs/systems/, data/kin/, tests/balance/. Trainer branch feature/modular-trainer remains independent; no edits to shared HANDOFF/DECISIONS/CHANGELOG on this branch to avoid parallel merge conflicts. Shared AGENTS default trainer task applies to trainer branch; this branch uses this dedicated handoff. Main not merged.
Done: Kin Core candidate spec, JSON and deterministic balance test. Design-side JS checks passed (145701 assertions); Node/CI and combat runtime not run. All numeric choices provisional. User approved direction Every Kin Matters, not these coefficients.
Next: owner reviews core; combat & skill model (damage, cooldowns, range, statuses, role benchmarks); then prototype roster. Read kin-core.md, data/kin/core-rules.json and docs/balance.md/aspects.md. On handoff update this file; commit/push and verify branch. Do not touch trainer assets.

## CP006 — 2026-11-26
Combat rules, 8 starter skills, design and test source committed. 6183 design-side JS checks passed, mature benchmark gap 0.4%. Node/CI and engine untested. Next: review numbers, Kin Atlas with stable IDs and name clearance, expanded scenario QA. Trainer and main untouched.
