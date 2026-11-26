# Kin Atlas 1.0 — CP007
2026-11-26. Candidate roster, not owner-approved names or art. 24 species/families, 28 forms. Two starter families have three forms each, remaining 22 single-form for initial scope. No permanent disadvantage for single forms. All names are provisional. Stable kin_NNNN and form IDs, never rename IDs with display labels. Existing aspect prototype aliases are crosswalk only, not a released save migration. Capture rates, spawn weights, skills beyond starter IDs and individual stat allocations pending. Phase early = 12 wild candidates in two initial habitats; later = six expansion candidates, unique = two special encounter candidates (not a rarity), legendary = two story encounters. No promise all 28 forms ship in Alpha. Weather/clock encounter conditions candidate; no mandatory time gates or paid shortcuts. Same maturity budget across rarity. Role tradeoffs are design targets, not proof of balance. Names Aevoria/Kin/Aevin remain working terminology pending clearance.

| ID | Label | Origin | Aspect | Rarity | Role | Phase | Habitat | Condition | Signature concept |
|---|---|---|---|---|---|---|---|---|---|
| kin_0001 | Moffi | wildborn | gale/lumen | common | ranged_magic | starter | frontier_meadow | any | Breeze Bolt |
| kin_0002 | Peepi | wildborn | ember/stone | common | melee_physical | starter | frontier_meadow | any | Peck Rush |
| kin_0003 | Cairnib | wildborn | stone/grove | common | tank | early | frontier_meadow | day | Root Brace |
| kin_0004 | Kettli | objectborn | ember/tide | uncommon | ranged_magic | early | frontier_meadow | any | Steam Whistle |
| kin_0005 | Broomble | objectborn | gale | common | controller | early | frontier_meadow | day | Cross Sweep |
| kin_0006 | Crumbula | taleborn | veil | uncommon | melee_physical | early | frontier_meadow | night | Crust Bite |
| kin_0007 | Leaf fox | wildborn | grove | common | support | early | frontier_meadow | day | Fern Shelter |
| kin_0008 | Dewmello | wildborn | tide/grove | common | support | early | frontier_meadow | rain | Dew Parcel |
| kin_0009 | Mothimble | wildborn | lumen | common | ranged_magic | early | frontier_meadow | night | Lantern Flick |
| kin_0010 | Clinkrill | wildborn | alloy/spark | uncommon | melee_physical | early | riverbank | any | Claw Circuit |
| kin_0011 | Siltleap | wildborn | tide/stone | common | tank | early | riverbank | rain | Mud Rampart |
| kin_0012 | Bellobble | objectborn | echo | common | controller | early | riverbank | any | Bell Stumble |
| kin_0013 | Tinknook | relicborn | spark/alloy | uncommon | support | early | riverbank | any | Patch Spark |
| kin_0014 | Thimblune | dreamborn | veil/lumen | uncommon | controller | early | riverbank | night | Veil Stitch |
| kin_0015 | Frost shuttle | objectborn | frost/echo | uncommon | controller | later | frostwood | any | Rime Thread |
| kin_0016 | Vellumurk | taleborn | veil/grove | uncommon | support | later | frostwood | night | Margin Mend |
| kin_0017 | Glimbract | wildborn | frost/lumen | rare | ranged_magic | later | frostwood | snow | Prism Bloom |
| kin_0018 | Reed barge | wildborn | tide | uncommon | tank | later | marsh | any | Reed Bastion |
| kin_0019 | Orrivault | relicborn | alloy/aether | rare | tank | later | relic_ruins | any | Vault Fold |
| kin_0020 | Skyravel | dreamborn | gale/aether | rare | ranged_magic | later | relic_ruins | wind | Knot Current |
| kin_0021 | Vespernacre | wildborn | tide/echo | rare | support | unique | marsh | night | Pearl Refrain |
| kin_0022 | Mirror heron | taleborn | veil/frost | rare | controller | unique | frostwood | night | Still Reflection |
| kin_0023 | Walking observatory | primordial | aether/lumen | legendary | ranged_magic | legendary | relic_ruins | story | Star Aperture |
| kin_0024 | Tide archive | primordial | tide/stone | legendary | tank | legendary | marsh | story | Archive Surge |

## Production gates
Approve small visual batches, original silhouette, palette and pose references before production. No direct reuse or tracing of commercial assets; document source/provenance and review visual similarities. Starter visuals approved concept only; direction and modular work unrelated. No production sprite or gameplay created by this checkpoint. Descriptive placeholders intentionally avoid premature name lock. See name-screening.md. Use explicit capability tags for environmental interaction, not Aspect alone; alternate story paths required. No mount or capture patent clearance implied. Role test scenarios and species kits next.

## QA
Design-side JS 268 assertions passed: 24 unique stable IDs, 28 unique form IDs, all 12 aspects, 5 roles, 6 origins, starter skill references, legacy prototype aspect match, phase totals. Node test file present, not run in CI. No combat or art QA. Data ../../data/kin/atlas-v1.json; test ../../tests/balance/kin-atlas.test.mjs.
