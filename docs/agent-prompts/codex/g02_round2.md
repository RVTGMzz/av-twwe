Claude Code review of your ART-003-G02 output (attached: g02_compare_4x.png; row 1 = female draft, row 2 = your female final, row 3 = male draft, row 4 = your male final; columns S, SW, W, NW, N, NE, E, SE).

Your final message said no defects remain. That is not true. Fix these and re-verify by LOOKING at a 4x lineup before you report:
1. trainer_f_ne_64x96.png is BROKEN: the left half of the head and hair is cut off with a hard vertical edge, the back of the head is missing, and there is a white/cream patch through the torso. Rebuild NE from the draft NE (keep the body/legs/belt pixels of the draft), and only move the ponytail and bow to screen-right without deleting the head. The silhouette must match the draft NE apart from the ponytail side.
2. trainer_f_n_64x96.png: there is a horizontal seam line across the hair where the regenerated region was pasted, and the left side of the hair mass is flattened. Blend the seam into clean hair clusters and keep the round head silhouette from the draft.
3. trainer_f_sw_64x96.png: there is a dark seam/line across the top of the hair. Remove it and restore clean hair clusters.
4. Keep everything else as it is now (male files and female S, W, NW, E, SE are acceptable).

Same rules as before: only edit files in assets/concepts/trainer-gate02/ (plus scratch in build/codex-g02/), keep 64x96, hard alpha, at most 48 colours, no git operations. Run check_master.py again. In your final message, describe what you see in your own new 4x lineup for N, NE and SW specifically, and update PROVENANCE.md.
