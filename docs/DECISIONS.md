# Aevoria — Decision log
Date: 2026-11-25. Status meanings: LOCKED = explicitly approved direction; WORKING = agreed working direction or implementation proposal, not final; OPEN = owner review required. Preserve history when superseding.

| ID | Status | Decision |
|---|---|---|
| D001 | LOCKED | Aevoria — A World Without End; Kin; original IP, English names/skills, not a reskin. |
| D002 | LOCKED | Offline, mobile-first, real-time creature combat, no auto combat initially; player has no separate combat skill bar. |
| D003 | LOCKED | Defeat/KO before capture; distinct non-ball capture artifact. |
| D004 | LOCKED | Every Kin Matters: common Kin weaker initially and need more investment, viable late; legends stronger at acquisition. |
| D005 | LOCKED | 12 Aspect, 1–2 per Kin, Neutral damage only, ±25% cap without stacking, no absolute immunity, independent origin/role/rarity; Resonance deferred. |
| D006 | LOCKED | Continuous world clock with manual adjustment; no mandatory sleep or crafting schedule; dating/social life; episodic expandable story; Vietnam-inspired region later. |
| D007 | LOCKED | Two selectable starter companions, three forms each; chicken physical melee, other magical ranged; approved visual sheet 01, Moffi must stay petite/cute; chicken C2 muscular/comical. |
| D008 | WORKING | Moffi/Mofflu/Moffaire (Gale/Lumen), Peepi/Brooster/Galladius (Ember/Stone); skills and stat curves not final. |
| D009 | WORKING | Aevin artifact, Kinwell healing/storage and Aevin Mart supplies; recognizable signage in each settlement. Logo/art board 02 not formally approved; currency undecided. |
| D010 | WORKING | Aevra/Awakening lore, object-born and folklore-inspired creatures, original whimsical names. Story opening pending. |
| D011 | LOCKED | Modular trainer, reusable skins, 8 directions, ground mount, swim/aquatic, fly, faint, Bond; separate rider and mount. |
| D012 | WORKING | 32px tile, pose/frame/anchor schema, animation counts; validate before lock. Trainer canvas re-opened by D017 (64x64 superseded as trial). |
| D013 | LOCKED | WebP for light asset storage; lossless for pixel sprites. |
| D014 | LOCKED | Shared GitHub handoff across Claude Code machines and Codex; no chat-history dependency; GitHub Free preference. |
| D016 | LOCKED | 2026-11-25 owner: procedural/script-drawn trainer sprites rejected (v1 too chibi, v2 too thin/long/stiff). Character masters must come from real image generation + pixel editing; scripts only process, split, align, pack and test. If image generation is unavailable, report it, no placeholders. |
| D017 | LOCKED | 2026-11-25 owner: gated art production GATE 01 character master → 02 eight directions → 03 modular separation → 04 animation, owner approval at each gate. Trainer ~3–3.5 heads, readable limbs, real torso, cute not childish (supersedes 2.5–3-head chibi target). Trial canvases 48x64, 64x80, 64x96. Male/female identity per docs/tasks/ART-003-spec.md. Keep modular architecture, pipeline and anchor system. |
| D018 | LOCKED | 2026-11-25 owner approved the look and proportions of the GATE 02 draft Direction Master (assets/concepts/trainer-gate02/draft-extract, from the final V3 board) and asked for clean-up. Clean-up = fix the female side ponytail to her right side in S/SW/N/NE and sharpen softened details, with no redesign. Final cleaned set needs a last owner check before GATE 03. |
| D019 | LOCKED | 2026-11-25 owner approved the GATE 02 Direction Master: assets/concepts/trainer-gate02/trainer_{m,f}_{s,sw,w,nw,n,ne,e,se}_64x96.png (commit d638f5e). GATE 03 modular separation may start; the design must not change. |
| D015 | OPEN | Engine, brand final artwork, first region, production sprite QA, currency, exact capture/growth numbers. |

Sources: docs/design.md, balance.md, aspects.md, starter-duo.md, brand-assets.md, art-pipeline.md and owner design conversation. Matchup table and icons are baseline for testing; do not claim gameplay balanced before playtest.
