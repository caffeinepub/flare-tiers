# Flare Tiers

## Current State
- Players have a single `gameMode: Text` and `tier: Tier` and `points: Nat`
- Admin can add/edit players with one game mode and one tier
- `getSecretFromHash` in urlParams.ts incorrectly parses the admin token — causing "failed to save player data" errors

## Requested Changes (Diff)

### Add
- `GameModeEntry` type: `{ gameMode: Text; tier: Tier }`
- Each player has multiple game mode entries (array of GameModeEntry)
- Frontend form: dynamic list to add/remove game mode+tier pairs per player
- Podium and leaderboard ranking based on best (highest) tier across all entries

### Modify
- Fix `getSecretFromHash` in `urlParams.ts` — find `?` in hash and parse from there
- Backend `Player` type: remove `gameMode: Text`, `tier: Tier`, `points: Nat`; add `entries: [GameModeEntry]`
- All backend functions updated for new Player shape
- Frontend: show per-player game mode+tier chips/badges in the roster table and on the homepage
- Frontend form: replace single gameMode/tier/points fields with dynamic entry list

### Remove
- `gameMode: Text`, `tier: Tier`, `points: Nat` from Player type
- Single-mode tier display

## Implementation Plan
1. Fix `getSecretFromHash` in `urlParams.ts`
2. Regenerate backend with new Player/GameModeEntry types
3. Update frontend form, roster table, and homepage tier display
