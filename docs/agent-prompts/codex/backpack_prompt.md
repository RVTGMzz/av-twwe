You are Codex on Aevoria (repo = current directory, branch feature/modular-trainer). Claude Code is tech lead and will review and commit. NO git commands. Use "C:\Program Files\Python38\python.exe" for Python (Pillow installed; do not install packages). Scratch files: build/codex-backpack/.

Owner report: in the MALE side views (W and E) the backpack is not visible behind his back, while it is large in NW, N, NE (attached: owner screenshot and the approved 8-direction preview, male = top row, columns S, SW, W, NW, N, NE, E, SE).

Fix ONLY these files:
- assets/concepts/trainer-gate02/trainer_m_w_64x96.png and trainer_m_e_64x96.png
- assets/characters/trainer/labels/trainer_m_w_labels.png and trainer_m_e_labels.png

What to do:
1. Draw the same bedroll backpack (brown leather pack + cream bedroll on top + buckles, exactly the design seen in NW/N/NE and the 3/4 views) protruding from his BACK in profile: in W (he faces screen-left) it sticks out on the screen-RIGHT side of his back; in E (faces screen-right) on the screen-LEFT side. Size and height consistent with NW/NE (top near shoulder height, bottom near the belt), depth about 6-9 px behind the back. Use the existing colours of the male sprite (copy ramps from the pack in trainer_m_nw/ne), same selective outline style, hard alpha, at most 48 colours.
2. Add pack pixels ONLY where the sprite is currently transparent (the pack is behind the body in side views). Do not change any existing opaque pixel. Keep W and E consistent with each other (they are not mirror copies; check asymmetric details stay correct).
3. In the two label maps set every new pixel to index 11 (backpack). Leave all other label pixels unchanged.
4. Run, in order:
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/check_master.py assets/concepts/trainer-gate02/trainer_*.png   (16/16 TECH-PASS)
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/separate_layers.py split          (16/16 pixel-exact)
   "C:\Program Files\Python38\python.exe" tools/asset-pipeline/separate_layers.py verify-full    (problems 0)
5. Save a 6x lineup of male W, NW, N, NE, E to build/codex-backpack/male_back_6x.png, look at it, and confirm the pack reads clearly and matches NW/NE. Final message: pixels added per file, the three command results, honest visual notes.
