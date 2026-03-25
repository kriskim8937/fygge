# Enchanted Forest — Claude Context

A browser-based interactive music game built with Phaser 3 + Web Audio API.
John Bauer-style illustrated world. Player discovers 5 objects, each unlocking a music stem.
Portfolio piece. Desktop Chrome only. No backend.

## Stack
- **Engine:** Phaser 3
- **Audio:** Web Audio API (native — no library)
- **Build:** Vite
- **Language:** JavaScript (ES modules)
- **Target:** Chrome desktop, static hosting

## Project Structure
```
plan.md          — full game design document
references.md    — mood board links, visual/audio inspiration
game/
  index.html
  vite.config.js
  package.json
  src/
    main.js                        — Phaser config + scene list
    scenes/
      Preload.js                   — asset loading (stubs ready for real assets)
      GameScene.js                 — movement, parallax, objects, UI
      EndScene.js                  — completion screen
    systems/
      AudioManager.js              — Web Audio stem controller
      InteractionSystem.js         — proximity + click interaction
  assets/
    sprites/                       — Tomte + object spritesheets (TexturePacker)
    backgrounds/                   — parallax PNGs (1920px wide, 4 layers)
    audio/
      stems/                       — stem-01.ogg … stem-05.ogg + .mp3 fallbacks
      sfx/                         — 5 interaction sounds
      ambient.ogg/.mp3
```

## Key Design Rules
- **Static single-screen scene** — no scrolling, no player character
- All 5 objects are **visible from the start** — interaction reveals them, not exploration
- Click an object → VFX burst + SFX → stem fades in
- 5 interactable objects → 5 audio stems, found in any order
- All 32 stem combinations must sound musically coherent
- Stems never drop out once unlocked — additive only
- All stem sources start at the same AudioContext timestamp (sync-critical)
- Gain automation uses only Web Audio API scheduling — never setTimeout
- AudioContext must be resumed on first user gesture

## Team
- **Developer (you):** Phaser setup, audio, interaction, VFX, build/deploy
- **Sound Designer:** 5 stems + ambient + 5 SFX + end sting
- **Graphic Designer:** 1 full illustrated background scene, 5 objects (idle + activated states), UI, start/end screens

## Dev Commands
```bash
cd game
npm install
npm run dev      # http://localhost:3000
npm run build    # outputs to game/dist/
```

## Asset Status
All assets are currently **placeholders** (coloured shapes).
Uncomment load calls in `src/scenes/Preload.js` and swap graphics in `GameScene.js` as real assets arrive.

## Audio Delivery Spec (for sound designer)
- 44,100 Hz / 24-bit WAV → developer converts to .ogg + .mp3
- All 5 stems identical sample count (confirm in Audacity)
- Fixed tempo, key, time signature — no automation
- 6–8 dB headroom per stem (all 5 stack simultaneously)
- Reverb pre-baked, no tails past loop boundary

## Mood Board
Miro: https://miro.com/welcomeonboard/aDFxUUZCSG5HYmJSanhZdkkrZWk5MDdrZEc3a3lpZ1dDTUh6QXpleGZqRk9JbmU1TkV3cUVpSUVDamlwam85bjlWT2Q1djBaWCt0a1lCbDNWdzY0ZzdXdE5vamJWWTcvT0prYmo2TEVNZmhOZW5IR1U0NVlOaFQ5aDBsQ2F1SFJzVXVvMm53MW9OWFg1bkJoVXZxdFhRPT0hdjE=?share_link_id=614801583265
