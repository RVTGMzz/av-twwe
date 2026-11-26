You are Codex on Aevoria (repo = current directory, branch feature/modular-trainer). Claude Code is tech lead and will review and commit. NO git commands. Use "C:\Program Files\Python38\python.exe" (Pillow installed; no installs). Scratch: build/codex-walk2/.

The owner says the male S walk pilot is "not natural enough" and supplied a MOTION reference: build/motion-ref/owner_motion_reference.png (also attached). It is a copyrighted commercial sprite sheet: study the motion only. NEVER copy, trace or reuse its pixels, proportions or design, and do not copy that file anywhere else. Read the new section "Owner feedback on the pilot" in docs/tasks/ART-003-G04.md.

Redo the walk cycle (6 frames) for the MALE trainer in two directions:
- S: overwrite assets/characters/trainer/anim_src/walk/male/s_f0..s_f5.png
- E (side view, faces screen-right; the backpack is visible behind his back): new files e_f0..e_f5.png in the same folder
Base EVERY frame on the CURRENT approved sprites assets/concepts/trainer-gate02/trainer_m_s_64x96.png and trainer_m_e_64x96.png (they were cleaned after your previous pilot; f0 must be pixel-identical to the approved sprite).
Motion targets: real stride with clear leg separation (V in profile on contact frames, heel down / toe push), 1 px body rise on passing frames, arms swinging opposite to the legs with a visible arc (hands move 2-4 px), head/hair/goggles/scarf/pack ride with the body, boots stay crisp. Keep the approved design: only redraw legs, boots, arms/gloves/sleeves and small cloth folds; move other parts as whole pieces.
Pixel rules: 64x96, hard alpha, at most 48 colours, existing palette, selective outline, contact boots on y=93, nothing touching the canvas edge.

Verify: "C:\Program Files\Python38\python.exe" tools/asset-pipeline/check_master.py assets/characters/trainer/anim_src/walk/male/*.png must be TECH-PASS with halo 0 for every frame (the halo rule is mandatory; see docs/art-pipeline.md). Build build/codex-walk2/walk_m_s.gif and walk_m_e.gif (4x, dark background #14161c, frame times 130,100,110,130,100,110 ms) and a 6x strip of each; LOOK at them next to the reference and judge honestly whether the walk now reads natural. Final message: per direction what changed, check results, honest notes.
