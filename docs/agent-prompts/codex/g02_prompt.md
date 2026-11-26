You are Codex working on Aevoria (repo in the current directory, branch feature/modular-trainer). Claude Code is the technical lead and will review and commit your work. DO NOT run git commit, git push, git checkout or any branch operation. DO NOT modify anything outside the paths listed below.

Read first: AGENTS.md, docs/tasks/ART-003-G02.md (especially "Clean-up checklist"), docs/tasks/ART-003-spec.md.

## Task ART-003-G02 clean-up (owner approved the draft look, decision D018)
Base files (owner-approved look): assets/concepts/trainer-gate02/draft-extract/trainer_{m,f}_{s,sw,w,nw,n,ne,e,se}_64x96.png (16 transparent 64x96 sprites, feet 2 px above the bottom, centred). Approved design reference: assets/concepts/trainer-master-v3.webp (attached). The attached preview_4x.png shows the draft at 4x (row 1 male, row 2 female; columns S, SW, W, NW, N, NE, E, SE).

Do NOT redesign the characters. Keep the canvas, scale, silhouette, proportions, feet position and palette family. Edit only what the checklist asks:
1. Female side ponytail + blue bow must be on HER RIGHT side in every direction (character right = screen-left when facing S, screen-right when facing N). Fix S (tail/bow visible at screen-left), SW (move to screen-left/back of head), N (move off-centre to screen-right), NE (move to screen-right). SE, NW, W, E are already correct; keep them consistent.
2. Sharpen details softened by downscaling: male red scarf, goggle lenses/frames, belt buckles, pouch flaps, boot cuffs; female blue scarf and bow.
3. Remove any 1 px light halo left from the board background. Selective outlines, no full black outline.

You may use your image generation/editing tool to repaint the female hair in the four wrong directions, but the result must be brought back to clean pixel art on the exact 64x96 grid: nearest-neighbour only, hard alpha (0 or 255), at most 48 colours per sprite, no blur or anti-aliasing, transparent background, no pixels touching the canvas edge. Paste only the corrected hair/bow region into the draft sprite where possible, so the rest of the approved pixels stay identical. Use Python + Pillow only for processing (crop, paste, palette, alpha, checks).

## Output (only these paths)
- assets/concepts/trainer-gate02/trainer_{m,f}_{s,sw,w,nw,n,ne,e,se}_64x96.png (16 final files)
- assets/concepts/trainer-gate02/PROVENANCE.md (tool, prompts and manual edits per file; say clearly which files were regenerated and which were only pixel-edited)
- scratch files only under build/codex-g02/

## Verify before finishing
Run: python tools/asset-pipeline/check_master.py assets/concepts/trainer-gate02/trainer_*.png
All 16 must be TECH-PASS. Then compose a 1x and 4x lineup (row male, row female, 8 directions) to build/codex-g02/final_1x.png and build/codex-g02/final_4x.png and look at it yourself: check that the ponytail is on her right side in all 8 directions and that nothing else changed in design.

Final message: list each of the 16 files with what you changed, the check_master result, and any defect you could not fix. Do not claim something is fixed if you did not verify it in the lineup image.
