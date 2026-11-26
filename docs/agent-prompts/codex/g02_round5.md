Claude Code review of round 4 (attached g02_round4_4x.png; top row female S, SW, W, NW, N, NE, E, SE). Seven female directions are good: coherent, one hair mass, ponytail on the correct side. Keep them and all male files UNCHANGED.

Only trainer_f_ne_64x96.png needs work. It looks like a different artist drew it: sharper dark outline, narrower and smaller head, more saturated blue, thinner legs, and a different silhouette from its neighbours NW and N. Regenerate NE as one whole sprite (no patching, no whole-sprite mirroring) so that it:
- matches the style, palette, head size, hair volume, body width, legs and boots of the female NW and N sprites (same pixel density, same outline treatment);
- is a 3/4 back view facing up-right: back of the head, a little cheek/ear at screen-right, goggles strap visible;
- has the ponytail and blue bow on HER RIGHT side, i.e. screen-right in NE;
- uses the same height (±1 px), feet 2 px above the bottom and the same centring as NW;
- is clean pixel art: hard alpha, at most 48 colours, no halo, no stray fragments.

Then run check_master.py on all 16, save build/codex-g02/female_final_8x.png, look at NE next to NW and N, describe honestly whether it matches, and update PROVENANCE.md. No git operations.
