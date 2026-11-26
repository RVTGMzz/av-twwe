# Agent prompt archive

These are the exact prompts Claude Code (tech lead) sent to Codex during ART-003 GATE 02–04, 2026-11-25/26. They are kept so any machine or agent can reuse the patterns. Note that D021 stopped using Codex for drawing sprites; the prompts for QA, labels and splits are still good templates.

## How they were run
- Codex CLI (`codex.exe`, part of the Codex desktop app; on Windows it lives under `%LOCALAPPDATA%\OpenAI\Codex\bin\<hash>\codex.exe`):
  `codex exec -m gpt-6.2-sol -C <repo> -s workspace-write -o <scratch>/last_message.md -i <image> - < prompt.md`
- To continue a run: `codex exec resume --last -c 'sandbox_mode="workspace-write"' - < followup.md`. Without the `-c` override, a resumed run is read-only.
- Model notes: `gpt-6.2-sol` handled label correction and pixel edits well; `gpt-6.1-terra` was cheaper but barely progressed on label maps.
- The Python path in the prompts (`C:\Program Files\Python38\python.exe`, which had Pillow) is specific to the retired machine; use any Python 3.8+ with Pillow.
- Codex sometimes reported "no defects" when there were some. Always verify visually and with the repo checks (`tools/asset-pipeline/README.md`).
- `build/motion-ref/owner_motion_reference.png`, mentioned in the walk prompts, was the owner's commercial reference sheet. It is copyrighted and was deliberately never committed. Ask the owner for it if needed, and never trace it.

## Files (codex/)
| File | Purpose |
|---|---|
| g02_prompt / g02_round2 / round4 / round5 | GATE 02 direction-sprite clean-up rounds (ponytail side, whole-sprite regeneration, NE restyle) |
| g03_prompt / g03_retry | GATE 03 label-map correction |
| g03p2_prompt | GATE 03 phase 2: covered-area painting |
| backpack_prompt | male side-view backpack fix |
| walk_prompt / walk2 / walk3 / walk_all_common + walk_male / walk_female | walk pilot, motion rework, backwards-walk fix, 16-direction production |
| walklab_common + walklab_male / walklab_female | walk label-map correction |
| flicker_prompt / gaps_prompt | blinking specks and leg-gap speck clean-up |
