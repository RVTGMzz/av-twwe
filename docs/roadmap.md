# AV-TWWE — Development roadmap
Status: pre-production, no code or build yet.

## P0 — Concept lock
- Approve Aevin name, silhouette, capture visual, logo, universal healing/shop signage.
- Art direction board: one outdoor scene, village, trainer, and 3–5 entirely original Kin with distinct roles, including an object-born creature. Test 8-direction sprite and mobile-scale readability.
- Finalize terminology and initial region/story premise. Keep proposed items marked as such.

## P1 — Offline vertical slice
- Choose engine after a small mobile performance spike (web/PWA or lightweight 2D engine are candidates, not final).
- One village, one exploration zone, a few Kin; walking, collision, camera, pathing, simple clock.
- Touch target/attack/recall, basic attack, 3–6 manual test skills, HP/KO and capture.
- Local roster, inventory, healing station, shop, storage, versioned save with backup/recovery.
- Test common-vs-rare progression with a deterministic simulator and human playtest.
- Exit gate: start from fresh save; explore, defeat Kin, bond, heal/store/retrieve it; reload offline with identical state. No account/server.

## P2 — Expand
- Additional maps, NPC schedules and time adjustment, ecology, dialogue, relationships, quests, bosses, more Kin and balancing.
- Longer-term story Chronicles and social systems; Vietnam-inspired region later. Avoid scope creep until P1 is playable.

## Repository conventions / GitHub Free
- Keep current repo slug av-twwe and default main. Use ordinary descriptive paths (docs/, src/, assets/, tests/, tools/). Branch names e.g. feature/core-loop, feature/art-prototype; commit prefixes docs:, feat:, fix:, test:, chore:.
- Public repository: no credentials, real saves, personal information, licensed third-party game assets, or private plot material. Short code names are for organization, not evading policies.
- Prefer compact original sprites, atlases, compressed audio, text data, and local testing; exclude build output, caches, and temporary exports from Git. Use CI selectively; do not enable paid services or rely on unlimited usage. Verify actual platform quotas before release automation.
- No license granted or selected by this document; decide distribution rights before publication. No production assets yet.

## Checkpoint
Design baseline 0.1, 2026-11-25. Next: P0 art/brand approval, then P1 playable combat/capture spike. No release/deployment or gameplay validation claimed.
