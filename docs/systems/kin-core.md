# Kin Core 1.0 — candidate baseline
Checkpoint 005 | 2026-11-25 | WORKING, owner review and combat playtest pending.
Every Kin Matters: rarity affects acquisition and investment, not a permanent power bonus. Preserve original Aspect contract. No change to trainer branch.

## Identity and combat stats
Species ID, form ID and individual UUID are separate. Origin, Aspect(s), rarity and role independent. Six allocated core stats: Vitality HP, Might ATK, Arcana MAG, Guard DEF, Ward RES, Agility AGI. Precision (crit chance) and Focus (cooldown effectiveness) are derived combat attributes, not extra growth budget. Starting crit 5%, multiplier 1.5, crit cap 35%, cooldown reduction cap 20%, move bonus cap 20%; all candidates, actual combat equations next task. Agility does not grant random dodge or attack speed/CDR by itself. No rarity-only stat or damage modifier.
Role profiles sum to 100; allocation = budget * weight / 100. HP = round(50+8*allocation); other core stats = round(5+2*allocation). Different roles have different units and useful stat distributions; equal budget is not proof of equal DPS or actual viability.

## Level and experience
Level 1–60 candidate cap. XP to next level = 50+10L+2L² for current L < 60. Cumulative XP to level 60 = 161070. No XP requirement beyond cap; process multi-level gains without losing overflow up to cap. Gain XP from eligible combat, quests and exploration, with encounter reward normalization and configurable reserve XP/catch-up later. No repeatable trivial-target exploit, no mandatory real-world timers. Capture preserves legitimate level/identity, not wild-boss-only buffs. No reset on form change.

## Mastery / potential
At level L and accumulated eligible training credits T:
level factor F=0.25+0.75*(L-1)/59.
x=0 below level 20, otherwise clamp(T/cost,0,1); p=1-(1-x)^2.
Budget=(start+(100-start)*p)*F.
Common start60/cost400; Uncommon70/340; Rare80/280; Legendary90/200. Legendary is the display label for prior Ancient rarity profile, not the Primordial origin. No permanent IV lottery, no duplicate sacrifice or paid shortcut. Mastery unlocks at Lv20; credit accrual from eligible actions after unlock, shared with normal progression (no second resource fee). Credits normalize by encounter difficulty/participation, no unlimited trivial grind; tune award amounts with real gameplay. Excess credits capped at requirement, no negative or overflow exploits. At Lv60 all fully trained profiles cap at 100. At equal investment Legendary may lead; at equal mature development both have identical budget cap. Capture cost and acquisition difficulty separate. Rare is still valuable for uniqueness, early readiness and ecology. Prismatic cosmetic.
Example at level 60, credits 0/100/200/300/400:
common: 60 / 77.5 / 90 / 97.5 / 100
uncommon: 70 / 85.05 / 94.91 / 99.58 / 100
rare: 80 / 91.73 / 98.37 / 100 / 100
legendary: 90 / 97.5 / 100 / 100 / 100

## Personality and traits
Personality shifts 2 weight points from one core stat to another (minimum 3); total remains 100. Six examples Brave RES→ATK, Clever ATK→MAG, Calm AGI→RES, Lively DEF→AGI, Sturdy MAG→DEF, Balanced no shift. Personality also affects idle/emote/dialogue flavor, never disobedience or hidden penalty. Candidate reversible mentoring at Kinwell, no reroll lottery necessary. Trait is a species-specific passive, one active slot; 2–3 discoverable options per species, alternatives unlocked via play, not exclusive RNG power. Effects have caps and cooldowns; no unconditional rarity damage boost. Signature skill distinct from trait. Example Moffi Windstep (short movement buff after manual cast, cooldown), Peepi Fighting Spirit (limited bonus after sustained melee, no infinite stacking); provisional. Kinship is separate affinity, primarily dialogue/emotes/cosmetic and optional horizontal unlocks, no hidden compulsory stat multiplier.

## Form progression
At candidate levels 20 and 40 with species milestones, eligible forms can Ascend (change form, role profile/skills) or keep form and develop via Awakening. Mastery is same system on either path, not a second additive budget. No evolution-only power multiplier, no resetting XP, mastery, affinity or UUID; each form has a viable role and tradeoffs. Single-form Kin use same mastery cap. Prefer reversible preview/confirmation; reversal item/mechanics pending. Existing name Awakening also refers to lore origin; UI wording needs review. Starter examples Moffi→Mofflu→Moffaire ranged magic, Peepi→Brooster→Galladius melee physical; form weights and signature skills pending, not locked.
## Save contract
Store schema_version, kin_uuid, species_id, form_id, level, xp_into_level, mastery_credits, personality_id, active_trait_id, unlocked_trait_ids, kinship, cosmetic_variant, learned_skill_ids. Recompute derived stats from versioned data; clamp and migrate old saves with backup. No boss flags in recruited stats.
## QA
Data: ../../data/kin/core-rules.json. Test: node tests/balance/kin-core.test.mjs. JS calculation checks executed during design: 145701 assertions, growth monotonicity, capped endgame, role/personality budget, example parity. Node test file not executed in CI; no gameplay engine test. Next design task combat/skills and role benchmark (single-target, AoE, sustain, control, mobility, boss survival); target mature comparable role performance within 10–15%, manual playtest before approval.
