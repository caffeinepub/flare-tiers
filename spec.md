# Flare Tiers

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Public tier list page showing all players grouped by tier (S, A, B, C, D)
- Top 3 podium section showing the top three ranked players
- Admin login page (username/password)
- Admin dashboard to add, edit, and remove players with their tier, points, and gamemode
- Admin ability to designate the top 3 players
- Minecraft-themed dark gaming aesthetic, pixel font headings, neon tier accents

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Select `authorization` component for admin login/role-based access
2. Generate Motoko backend with:
   - Player data type: id, name, tier (S/A/B/C/D), points, gamemode, avatarUrl
   - CRUD operations for players (admin only)
   - Top 3 management: set/get top 3 player ids (admin only)
   - Public queries: get all players, get top 3
3. Build frontend:
   - Public landing page: hero, top 3 podium, full tier list table grouped by tier
   - Admin login page
   - Admin dashboard: player list with add/edit/delete, top 3 picker
   - Minecraft pixel font (Press Start 2P), dark theme, tier badge colors
