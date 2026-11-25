# AV-TWWE — Current handoff
Checkpoint 004 | 2026-11-25 | Pre-production
Active task: ART-003-B01 — Modular Trainer proof of concept (docs/tasks/ART-003-B01.md).
Active implementation branch: feature/modular-trainer (created from shared baseline after this handoff). Read this file on that branch on resume. Last prior art documentation commit: 4ce172db7b3d131d2c6a9dd4d722ea7d59336acd. To determine current actual head use git log -1 and compare remote; do not rely on a self-referential SHA here.

## Done
- World, combat, capture, balance, roadmap, 12 Aspect system and SVG glyph master documented. Starter Duo visual concept approved; brand visual board pending approval.
- Shared instructions AGENTS.md, CLAUDE.md, decision log, asset registry, changelog, task spec and handoff established.
- Prior aspect JSON verification: 1,014 single/dual cases including Neutral; no confirmed execution of Node test file or engine.
- Three concept boards converted to WebP (1,192,498 bytes total) and archived in owner Library; binary files not committed to GitHub.

## Next concrete action
1. Check out feature/modular-trainer safely after fetch. Read ART-003-B01 and decisions. Inspect repository and tools; confirm whether image generation available.
2. Import exact concept WebP from owner ZIP into assets/concepts/ if available; verify manifest hashes; update registry only after actual upload. Do not substitute other artwork silently.
3. Build minimal modular pose/layer proof and offline Asset Viewer; show previews and verify layer alignment in eight directions before expanding. No merge to main.
4. Report QA and update this handoff on task branch before push/device switch.

## Open / blocked
- No production trainer sprites, mounts, animations, viewer, engine or playable build yet.
- Concept binaries pending import; owner has ZIP aevoria-concepts-webp.zip from earlier chat. See art-pipeline.md and registry.
- Brand final artwork, currency, first region, engine, numerical balance and detailed lore pending approval/testing.
- No CI run in this checkpoint; documentation only. Do not claim PASS for unexecuted tests.

## Resume / reproduce
Use the same remote on both machines. Inspect git status; preserve local changes. Fetch origin. Switch to active branch if clean; fast-forward only. Read AGENTS.md, DECISIONS and active task. Run actual QA commands as delivered by Codex; existing aspect test can be run using node tests/aspects.test.mjs from repo root if Node available. After implementation checkpoint, commit/push updates and verify remote SHA. Report conflicts or missing dependencies, never force push. Main stores baseline; branch stores latest task handoff.
