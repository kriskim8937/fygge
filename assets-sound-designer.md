# Asset List — Sound Designer
*Enchanted Forest — browser game*

---

## Overview

A single-screen atmospheric platformer. The player wakes 5 sleeping creatures, each unlocking a new music stem. All 5 stems play together at the end. The music is the reward.

**Key:** D minor or F major (natural, folk-leaning)
**Tempo:** 60–72 BPM — slow, contemplative, no rush
**Mood:** John Bauer illustration — solemn, mysterious, ancient forest. Not whimsical. Not ambient electronica. Think Nordic folk, quiet strings, natural acoustics.

---

## Deliverables

### 1. Music Stems (×5)

Composed as one complete piece, exported as 5 separate layers. All stems loop identically.

| Stem | Instrument | Character |
|------|-----------|-----------|
| stem-01 | Low strings / drone | Mysterious foundation — heard first, alone |
| stem-02 | Cello melody | Melancholic warmth |
| stem-03 | Flute / oboe | Lightness, nature, air |
| stem-04 | Harp / pizzicato | Magic, sparkle |
| stem-05 | Choir / full arrangement | Resolution, wonder — completes the piece |

**The critical rule:** The player finds objects in any order. All 32 possible combinations of active stems must sound musically tolerable — not just the intended 1→2→3→4→5 sequence.

This means:
- Each stem must stand alone (heard first, without context)
- No call-and-response between stems — if flute answers cello, it breaks when found out of order
- Use open, harmonically stable material: drones, sustained pads, pedal tones
- Each stem adds textural density, not melodic dependency

### 2. Interaction SFX (×5)

One short sound per object, played at the moment the player wakes it. Bridges the interaction to the stem fade-in.

| SFX | Object | Character |
|-----|--------|-----------|
| sfx-01 | Frog | Wet, tuned croak — low, resonant |
| sfx-02 | TBD | TBD |
| sfx-03 | Mushroom | Soft glass hum or bell tone — gentle, glowing |
| sfx-04 | TBD | TBD |
| sfx-05 | TBD | TBD |

Each SFX should be:
- 1–3 seconds
- Tuned to the same key/tonality as its stem
- Feels like the creature waking up, not a UI click

### 3. Ambient Loop (×1)

Always playing underneath everything. Never stops.

- Gentle wind through trees
- Distant birdsong (sparse, not busy)
- Faint forest atmosphere — leaves, maybe water
- Should feel like silence with texture, not a soundscape

### 4. End Sting (×1)

Plays when the 5th stem unlocks and the composition completes.

- A gentle swell or resolution — not triumphant, not dramatic
- 3–5 seconds, then let the full looping score breathe
- Tonally consistent with the full arrangement

---

## Technical Requirements (hard)

| Parameter | Required |
|-----------|----------|
| Sample rate | **44,100 Hz** — not 48k |
| Bit depth | **24-bit WAV** for delivery |
| Loop length | **Identical sample count** across all 5 stems — verify in Audacity |
| Tempo | Fixed — no ritardando, no automation |
| Key / mode | Fixed — no modulation |
| Time signature | Must not change |
| Headroom per stem | **6–8 dB minimum** — all 5 stack simultaneously at full gain |
| Delivery format | WAV only — developer converts to .ogg + .mp3 |

### Loop export rules
- Disable DAW tail / added silence at export end
- All reverb and delay must be **pre-baked** and trimmed to fit inside the loop boundary — no tails bleeding past the last sample
- First sample and last sample must connect without a click, gap, or pitch jump
- There is no reverb bus in the browser — render room sound into the file

### File naming
```
stem-01.wav
stem-02.wav
stem-03.wav
stem-04.wav
stem-05.wav
sfx-01-frog.wav
sfx-02-tbd.wav
sfx-03-mushroom.wav
sfx-04-tbd.wav
sfx-05-tbd.wav
ambient.wav
end-sting.wav
```

---

## References

- *Journey* OST (Austin Wintory) — adaptive layered score as emotional arc
- Nordic / Swedish folk instrumentation
- Modal harmony — D minor, F major, Dorian, natural minor
