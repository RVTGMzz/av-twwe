You are Codex on Aevoria (repo = current directory, branch feature/modular-trainer). Claude Code is tech lead and will review and commit. NO git commands. Use "C:\Program Files\Python38\python.exe" (Pillow installed). Scratch: build/codex-gaps/.

Owner report (attached screenshot, male SE): white dots are STILL visible. Claude Code found the cause: light grey pixels left from the concept-board background, trapped in dark gaps of the leg/boot area. Example: assets/concepts/trainer-gate02/trainer_m_se_64x96.png has a 4 px light grey vertical line at x=33, y=82..85 between the boots. Other examples in the male N sprite: x=32, y=76..81.

1. Run "C:\Program Files\Python38\python.exe" tools/asset-pipeline/check_gaps.py. It lists candidates and writes sheets build/asset-pipeline/qa/gaps/<gender>_<dir>.png (column 0 = approved sprite, columns 1-6 = walk f0..f5; bottom row = candidates in magenta).
2. LOOK at every sheet. Fix real gap specks (light grey/cream pixels inside dark gaps between legs, boots, shorts or socks that are not a designed highlight). Keep legitimate ones (e.g. a deliberate highlight on a boot or knee) and list them with reasons.
3. Recolour each real speck to the dark colour of the surrounding gap/outline, using only colours already in that image. Never change positions or alpha (label maps stay valid).
   - Approved direction sprites (assets/concepts/trainer-gate02/trainer_{m,f}_{dir}_64x96.png): after editing one, call the existing helper so the phase-2 covered-area sources stay in sync:
     import sys; sys.path.insert(0, 'tools/asset-pipeline'); import clean_halo; clean_halo.sync_layers(path, image, [((x, y), None) for (x, y) in fixed])
   - Walk frames (assets/characters/trainer/anim_src/walk/{gender}/{dir}_f0..f5.png): every f0 must stay byte-identical to its approved sprite, so apply the same fix to f0 as to the sprite; fix the same speck consistently in f1..f5 when it is there too.
4. Then run, in order (all must pass):
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/check_gaps.py   (remaining = only the ones you kept)
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/check_master.py assets/concepts/trainer-gate02/trainer_*.png assets/characters/trainer/anim_src/walk/*/*_f*.png   (all TECH-PASS, halo 0)
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/separate_layers.py split   (16/16 pixel-exact)
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/separate_layers.py verify-full   (problems 0)
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/animate.py idle
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/animate.py walk-split   (96/96 pixel-exact)
Final message: pixels fixed per file group, the candidates you kept and why, and every command result.
