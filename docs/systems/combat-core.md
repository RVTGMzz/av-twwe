# Combat & Skill System 1.0 — CP006
2026-11-26. Candidate values, not owner-locked. No engine implementation.

## Commands
One active Kin, six roster. Lock selects without attacking; Attack approaches selected target and repeats basic only until Recall, Move Kin, KO, invalid target or leash break. Move Kin targets ground, respects pathing and collision. Recall clears queued attacks; no teleport or immunity. No auto-target, auto-skill or farming. Trainer has no combat skill bar. Swap 8s shared cooldown and .5s transition, no invulnerability or cooldown resets, no KO target. Trainer vulnerability and faint recovery to be tested. Skill targeting single, directional, area or self; display telegraphs, cancel before commitment; cooldown starts at committed windup, no refund if interrupted afterwards. No damage through walls; impact hitbox determines hit, one hit per target unless explicit multi-hit. Simulation seconds; pause freezes timers.

## Damage
Physical ATK/DEF; magical MAG/RES. max(1,round(attack*power*60/(60+defense)*aspect*crit*(1-guard))). Buff caps +40% attack/defense before formula, guard max30%, shield absorbs before HP. Crit 5%, 1.5x, chance cap35%. Canonical Aspect data: one attacking Aspect, 75–125% bounded dual defense, no STAB or rarity multiplier. Healing capped at max HP, no crit or Aspect multiplier. Burn cannot crit. Focus cooldown reduction cap20%, movement bonus cap20%; no random AGI dodge or attack-speed scaling. Buff/heal/shield runtime not tested.

## Skill progression
Basic separate, 3 active slots initially, six at Lv30 (extra Lv10/20/30), one trait separately. Learned skills retained, loadout edit out of combat. Cooldown-only resource for prototype. Starter eight entries in skills-starter.json, provisional names and stable generic IDs. Light Flare, Gust Trap and Wing Slam area caps 4, other hits cap1. Puff Away movement validates destination, Peck Rush approaches within range, Feather Guard self buff. No passive auto-casts. Future form sidegrades preserve role budget; PvP out of scope.

## Status rules
Slow strongest refresh max35% 3s. Stun .8s, root1.5s, silence1.5s shared hard CC lock: no overlap/refresh, 3s immunity after expiry, elites half duration. Boss hard CC adds 20 stagger points at most once per second, decays10/s after 1s quiet, threshold100, 2s stagger then 10s immunity, reset meter. Burn 4s, tick1s, .12 attack coefficient, snapshot source stats/channel/Aspect and current target mitigation, strongest refresh without duplicate timers. Shield strongest refresh max25% HP 5s; guard strongest refresh max30% 3s. No status chance multiplier from Aspect. No attack on KO target. Wild boss bonus never transfers to recruits. Status rules specified, not runtime tested.

## Exploration
Explicit contextual interaction, tagged objects only, species capability separate from Aspect; no universal destruction. Candidate Gale clear mist, Ember burn vines, Tide extinguish, Spark power relic, Stone break fragile rock, Lumen illuminate, Frost freeze marked water. Mandatory routes have accessible alternatives. Separate combat cooldown. Capture/mount implementation out of scope; IP/patent review before release; names provisional, original art provenance required.

## QA
Design-side JS 6183 assertions passed. Benchmark 60s neutral target DEF/RES35, expected crit, offensive skills scheduled, assumed uptime melee80%/ranged90%, no incoming damage, movement or defensive actions. Not live combat; only one single-target benchmark.
| Role | Budget | HP | Raw DPS | Adjusted DPS |
|---|---:|---:|---:|---:|
| melee_physical | 60 | 160 | 32.63 | 26.1 |
| melee_physical | 90 | 216 | 46.59 | 37.27 |
| melee_physical | 100 | 234 | 51.82 | 41.46 |
| ranged_magic | 60 | 127 | 28.53 | 25.68 |
| ranged_magic | 90 | 165 | 42.05 | 37.85 |
| ranged_magic | 100 | 178 | 45.86 | 41.28 |
Mature gap 0.4%; candidate target <=15%, within target under assumptions. Same role/stats/skill input independent of rarity. No proof of overall parity. Next: AoE, sustain, control, mobility, boss, real playtest. Node test source included, CI not run.
