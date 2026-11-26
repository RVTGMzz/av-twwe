# AV-TWWE — Shared agent instructions

Read this file, then docs/HANDOFF.md, docs/DECISIONS.md and the active task before making changes. GitHub is the shared project memory across machines and agents; chat is not authoritative. Owner decisions take priority. Do not treat proposals as approvals.

## Start / resume
- Confirm remote points to RVTGMzz/av-twwe; inspect current branch, git status, latest log and remote refs.
- Fetch origin; if clean and on the correct branch, fast-forward only (git pull --ff-only). If dirty, divergent or conflicting, preserve changes and report; never reset, overwrite or force push to resolve automatically.
- Read HANDOFF, DECISIONS, CHANGELOG, ASSET_REGISTRY and task-specific design docs. Compare actual branch history with handoff; report any mismatch.
- Use active task branch feature/modular-trainer for current batch. For concurrent tasks, use separate branches, explicit file ownership and review; never edit the same branch on two machines simultaneously.
- Do not redo completed work. Do not invent prior QA, assets or owner approval.

## Work and handoff
- Claude Code: technical lead, split tasks, integrate; Codex: implementation/assets/QA; ChatGPT: game direction and design review. Owner is final authority.
- Task specs live in docs/tasks/ with stable ID, scope, references, output paths, acceptance criteria, blockers and status. Make small reviewable commits.
- At checkpoint or before switching machines, update HANDOFF with active branch, last implementation commit (not the self-referential handoff commit), task status, paths changed, actual tests/results, pending approvals, blockers and explicit next action. Update DECISIONS only for real approvals, registry for assets, CHANGELOG for meaningful changes.
- Commit and push to working branch, verify remote head equals intended local head, report commit and remaining uncommitted files. A new machine reads HANDOFF on that branch, not stale main. Never merge into main without owner approval; no force push.
- No API keys, private saves, personal data or unlicensed content. Public repo; original assets only. Prefer GitHub Free/local tools; no paid services without approval. Keep cache/build/temp outputs out of Git.

## Product constraints
Original offline mobile-first game, PC support desired; one active Kin, manual combat, no second player skill bar or auto farming initially. KO before Bond; Aevin is not currency. Every Kin Matters: rarity may affect initial strength and investment, not permanent endgame superiority. Aspect rules in docs/aspects.md and data/aspects.json are authoritative; proposed numbers subject to test. No borrowed commercial art or code.

## Asset constraints
See docs/art-pipeline.md and active task. WebP Q88 concept archive; lossless WebP/PNG for pixel sprites, alpha, nearest-neighbor. Stable IDs, frame metadata, pivots/anchors, independent layers and direction order. Do not mistake concept boards for usable sprites. Never claim a generated image, uploaded file or passing test without evidence. Every sprite/frame must pass `tools/asset-pipeline/check_master.py` (includes the white-speck/halo rule) and a dark-background review before commit; procedure in docs/art-pipeline.md. Record provenance; if image generation is unavailable, say so and prepare task/pipeline rather than fake assets.

Read README.md for the complete design index.
