# ART-003-G02 final direction-master provenance

Date: 2026-11-25  
Approved base: `draft-extract/trainer_{m,f}_{s,sw,w,nw,n,ne,e,se}_64x96.png` (owner-approved look, D018)  
Design reference: `../trainer-master-v3.webp`

## Tools and method

- OpenAI built-in image edit produced one hair-placement reference sheet from `draft-extract/preview_4x.png` plus `trainer-master-v3.webp`.
- Python 3 + Pillow performed every crop, exact 4x nearest-neighbour reduction, mask/paste, palette remap, hard-alpha cleanup, detail edit, lineup composition and validation preparation.
- The generated sheet was **not** accepted as a full-sprite replacement because it changed non-hair pixels and added a background. Only segmented female hair/bow patch pixels were used in the four named directions. They were remapped to each approved draft sprite's existing palette; all other pixels started from the approved draft.
- Final PNGs have hard alpha only, use no interpolation after the exact nearest-neighbour reduction, and add no colours beyond the corresponding approved draft palette.

### Review repair pass

After technical-lead lineup review, `trainer_f_sw_64x96.png`, `trainer_f_n_64x96.png`, and `trainer_f_ne_64x96.png` received a deterministic Pillow-only repair pass. This pass supersedes the earlier description of the NE patch:

- SW retained its corrected generated screen-left ponytail, while the approved draft top cap, goggles, and upper hair clusters were restored with an irregular pixel boundary to remove the dark paste seam.
- N was rebuilt from the approved N draft. The old left/centred blue bow was converted back into existing silver-hair colours, and only the corrected screen-right bow and external ponytail pixels were copied from the prior hair patch. This restored the round draft silhouette and removed the horizontal seam.
- NE was rebuilt from the approved NE draft, including its complete head, torso, belt, and legs. The old left bow was recoloured into existing silver-hair colours; only the wrong-side external lower tail was trimmed. The replacement right bow/tail came from the approved unmirrored NW draft and was palette-mapped into NE. No generated pixels or pixels from the broken prior NE patch remain in the repaired NE file.

Image-edit prompt used for the shared reference sheet:

> Edit only the female character hair and blue bow in the S, SW, N, and NE cells of the 4x lineup. The female side ponytail and bow must be on HER RIGHT in every direction: S screen-left; SW screen-left/back of head; N off-centre screen-right; NE screen-right. Use the approved master board only for identity/style reference. Preserve every male sprite exactly; preserve female body, face, goggles, straps, clothing, canvas placement, scale, feet, palette family, and all W/NW/E/SE sprites exactly. Do not redesign. Keep crisp pixel clusters, hard edges, transparent background, no blur, no antialiasing, no full black outline. Make the smallest possible hair-region changes. Avoid mirroring whole sprites, moving bodies, changing proportions, adding objects, changing non-hair pixels, backgrounds, text, or watermarks.

## Per-file edits

| File | Hair source | Pixel edits |
|---|---|---|
| `trainer_m_s_64x96.png` | Approved draft; no regeneration | Sharpened red scarf, goggle lenses/frames, belt buckle, pouch flaps and boot cuffs; removed detached 1–3 px islands if present. |
| `trainer_m_sw_64x96.png` | Approved draft; no regeneration | Same named male-detail cleanup. |
| `trainer_m_w_64x96.png` | Approved draft; no regeneration | Same named male-detail cleanup. |
| `trainer_m_nw_64x96.png` | Approved draft; no regeneration | Same named male-detail cleanup. |
| `trainer_m_n_64x96.png` | Approved draft; no regeneration | Same named male-detail cleanup. |
| `trainer_m_ne_64x96.png` | Approved draft; no regeneration | Same named male-detail cleanup. |
| `trainer_m_e_64x96.png` | Approved draft; no regeneration | Same named male-detail cleanup. |
| `trainer_m_se_64x96.png` | Approved draft; no regeneration | Same named male-detail cleanup. |
| `trainer_f_s_64x96.png` | **Regenerated hair/bow region only** from image-edit S patch | Pasted screen-left/right-side ponytail and bow; retained approved body/face/equipment; sharpened blue scarf/bow, goggles, buckle, pouch flaps and boot cuffs. |
| `trainer_f_sw_64x96.png` | **Regenerated hair/bow region only** from image-edit SW patch, with approved-draft cap restored in review repair | Retained the screen-left/back right-side ponytail; restored the approved draft top cap, goggles, and upper hair clusters to remove the dark seam; retained approved body/face/equipment and prior named detail cleanup. |
| `trainer_f_w_64x96.png` | Approved draft; no regeneration | Hair side retained; only named female-detail cleanup. |
| `trainer_f_nw_64x96.png` | Approved draft; no regeneration | Hair side retained; only named female-detail cleanup. |
| `trainer_f_n_64x96.png` | Approved N draft plus **regenerated right bow/external-tail pixels only** from the prior N hair patch | Rebuilt the head from the approved draft, converted the old left/centred bow back to silver hair, and copied only the corrected screen-right bow/tail. The round silhouette and draft body/equipment were restored; the horizontal paste seam was removed. |
| `trainer_f_ne_64x96.png` | Approved NE draft plus pixel-edited bow/tail material from the approved unmirrored NW draft; **no regenerated pixels remain** | Rebuilt from the complete NE draft; converted the old left bow to silver hair, trimmed only the wrong-side external lower tail, and placed the NW-derived bow/tail on screen-right. The full back-head mass and all torso/belt/leg pixels were restored. |
| `trainer_f_e_64x96.png` | Approved draft; no regeneration | Hair side retained; only named female-detail cleanup. |
| `trainer_f_se_64x96.png` | Approved draft; no regeneration | Hair side retained; only named female-detail cleanup. |

No whole final sprite was regenerated. Three files contain regenerated **hair-region pixels only** (`f_s`, `f_sw`, and `f_n`); `f_ne` is now approved-draft-only pixel editing, including a small transplant from the approved NW draft. The other twelve files are approved-draft pixel edits only.
