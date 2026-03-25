# Asset List — Graphic Designer
*Enchanted Forest — browser game*

---

## Overview

A single-screen atmospheric platformer set in a John Bauer-style illustrated forest. A small cloaked creature (the player) jumps between platforms to wake 5 sleeping objects. The game canvas is **960×540px**. Everything must be visible at once — no scrolling.

**Style:** John Bauer (1882–1918) — deep muted forest tones, soft painterly outlines, ink-like linework. Watercolour-over-ink. Solemn and mysterious, not whimsical.
- No sharp vector edges
- No bright palette
- No cartoon bounce
- Palette: mossy greens, ochres, dark browns, soft greys, deep shadows
- Reference: *The Boy and the Trolls* (1915), *Bianca Maria* (1909)

---

## 1. Background Scene

**One full illustrated composition — 960×540px**

The entire game takes place in this single image. It must:
- Read as a complete Bauer-style illustration even before any interaction
- Contain **5 natural platforms** the character can stand on: roots, rocks, branches, ledges — visible and readable as surfaces
- Feel deep and atmospheric — foreground, mid-ground, and background layers suggested
- Have subtle tonal variation from left (ground) to right (elevated clearing)

**Platform layout to match (coordinate positions with developer):**

| # | Type | Approx position | Object placed here |
|---|------|-----------------|--------------------|
| Ground | Mossy forest floor | Full width, bottom | Frog |
| P1 | Large root or low rock | Left, low | TBD |
| P2 | Mossy boulder or raised root | Centre-left, mid height | Mushroom |
| P3 | Tree branch or stone ledge | Centre-right, mid height | TBD |
| P4 | High branch or rocky outcrop | Right, high | TBD |

The exact pixel positions will be given by the developer — please do not lock them in until agreed.

**Delivery:**
- Source file at 300dpi, exported PNG at 960×540px
- Optional: separate layers (sky, mid-ground trees, foreground roots/ground) for subtle parallax depth — discuss with developer before splitting

---

## 2. Character — The Cloaked Listener

A small fictional forest creature. Not based on any existing folklore character.

**Description:**
- Long ears — like a hare or rabbit, but ambiguous
- Eyes always closed — navigates by sound (ties directly to the game mechanic)
- Wearing a flowing cape / cloak — muted tone (dark moss green, charcoal, or deep ochre)
- Small, low silhouette — feels humble against the vast forest backdrop
- Solemn and ancient — not cute, not cartoonish

**Animations required (spritesheet):**

| Animation | Frames | Notes |
|-----------|--------|-------|
| Idle | 4–6 | Subtle cape sway, occasional ear twitch |
| Walk (left/right) | 6–8 | Cape flows behind, ears bob slightly |
| Jump | 4 | Ears lift on rise, cape billows, soft land |
| React / interact | 3–4 | Ears perk up, slight head tilt — reacting to sound |

- All animations: weightless, quiet timing — no bouncy easing
- Flip horizontally for left/right — only one direction needed
- Sprite size: approx 32×52px at game resolution (design at 2× or 4× then scale down)
- Export as spritesheet PNG with consistent frame grid

---

## 3. Interactable Objects (×5)

Each object has two states: **dormant** (sleeping, dim) and **awakened** (alive, expressive).

| # | Object | Dormant state | Awakened state | Platform |
|---|--------|--------------|----------------|----------|
| 1 | **Frog** | Still, eyes closed, hunched on mossy stone | Eyes open, throat inflates, croak pose | Ground level |
| 2 | **TBD** | TBD | TBD | Low platform |
| 3 | **Mushroom** | Dim cap, no glow | Cap glows softly, gentle pulse | Mid platform |
| 4 | **TBD** | TBD | TBD | High platform |
| 5 | **TBD** | TBD | TBD | Far-right platform |

**Per object, deliver:**
- Dormant idle: 2–4 frames (subtle, barely moving)
- Wake animation: 4–8 frames (the moment of awakening)
- Awakened idle: 3–5 frames (calm, alive loop)

Object sizes: approx 38–64px wide at game resolution. Design at 2× and scale down.

---

## 4. UI Elements

**Collection tray (bottom of screen)**
- 5 illustrated slots in a row — Bauer-style decorative border
- Slot empty state: dark, unlit
- Slot filled state: item icon glows softly
- 5 small item icons (one per object) — simple silhouettes

**Start screen**
- Full illustrated title card — game title, forest atmosphere
- A prompt to begin (e.g. click anywhere)

**End screen**
- Full illustrated scene: the forest alive, all 5 creatures awake, Cloaked Listener standing quietly among them
- Simple text overlay for title/message

---

## Style Notes

- Work in high resolution (at least 300dpi for backgrounds), export to web pixel sizes
- Use real watercolour or digital watercolour brush textures — avoid flat fills
- Ink outlines should feel hand-drawn, slightly irregular — not vector-clean
- Avoid pure black — use very dark brown or dark green for linework
- Shadows should feel like deep forest shadow, not drop-shadows
- All glow effects (mushroom, activated objects) should be warm and organic — not neon

---

## Delivery Format

| Asset | Format | Notes |
|-------|--------|-------|
| Background | PNG, 960×540px | Transparent layers optional |
| Character spritesheet | PNG, power-of-2 dimensions | Consistent frame grid |
| Object spritesheets | PNG per object | Consistent frame grid |
| UI elements | PNG | Transparent background |

Name files clearly:
```
background.png
character-spritesheet.png
obj-frog.png
obj-mushroom.png
obj-tbd-2.png
obj-tbd-4.png
obj-tbd-5.png
ui-collection-tray.png
ui-slot-icon-frog.png
ui-slot-icon-mushroom.png
screen-start.png
screen-end.png
```

---

## Coordination with Developer

Before finalising platform positions in the background illustration, please share a rough sketch with the developer so collision shapes can be mapped to the art. Platform top surfaces need to be flat and readable — exact pixel y-positions will be confirmed together.
