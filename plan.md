# 🌲 Enchanted Forest — Game Project Plan
*A browser-based interactive music experience*

---

## Overview

A short, atmospheric browser game set in a John Bauer-style illustrated world. The player controls a small character through a magical forest scene, discovering hidden objects. Each object interaction unlocks a new stem in a layered musical score — collecting all objects completes the composition. The game is designed to run directly in Chrome as a portfolio piece.

**Duration:** ~5 minutes of gameplay
**Team:** 1 Developer (you), 1 Sound Designer, 1 Graphic Designer
**Target platform:** Web browser (Chrome), embedded on portfolio site
**Tech stack:** HTML5 Canvas / Phaser 3, Web Audio API, JavaScript

---

## Concept & Artistic Direction

### Visual Style — John Bauer
John Bauer (1882–1918) was a Swedish illustrator known for his work in the fairy-tale anthology *Bland tomtar och troll*. His style is defined by:

- Deep, muted forest tones — mossy greens, ochres, dark browns, soft greys
- Soft, painterly outlines with ink-like linework
- Characters that feel small against a vast, ancient landscape
- Trolls, gnomes, and forest spirits inhabiting shadowy spaces under roots and stones
- A sense of stillness and quiet magic — not whimsical, but *solemn and mysterious*

All assets must honour this aesthetic. No sharp vector edges, no bright palette, no cartoon bounce. Think watercolour-over-ink.

### Character Options (choose one)
| Character | Personality | Notes |
|-----------|-------------|-------|
| **Tomte (forest gnome)** | Cautious, curious | Most authentic to Bauer; small red cap, grey coat |
| **Young princess** | Wandering, lost | Classic Bauer motif — lone child in vast forest |
| **Hedgehog** | Low to ground, questing | Charming; avoids human anatomy complexity |

**Recommendation: Tomte.** Most tonally correct for the Bauer universe and the most visually iconic.

---

## Gameplay Design

### Core Loop
```
Player sees full scene at once → clicks / hovers an object →
VFX burst plays on the object → sound effect triggers →
new music stem fades in → collect all 5 → full composition plays → gentle end screen
```

### Scene Structure
One **static, single-screen composition** — no scrolling, no movement. All 5 objects are visible at once, arranged naturally across the illustrated scene. The player interacts directly by clicking objects.

There is **no player character** traversing the world. The viewpoint is the player's — like looking at an illustrated painting that comes alive.

| Object | Position in scene | Music Stem Added |
|--------|------------------|-----------------|
| Ancient mossy stone with runes | Lower left | Bass drone / low strings |
| Sleeping troll curled under a root | Mid left | Cello melody |
| Water lily with a resting frog | Centre, pond area | Woodwind motif (flute/oboe) |
| Glowing lantern hanging from a branch | Upper right | Harp / plucked strings |
| Owl perched on a skull-shaped rock | Lower right | Full choir / final resolution |

*5 objects = 5 stems. Final stem completes the piece.*

### Controls
- **Mouse click** on any visible object to interact
- Optional: subtle idle glow / hover highlight to invite interaction
- No movement, no fail state, no timer — purely point-and-click

### Interaction Feedback
When a player clicks an object:
1. **VFX burst on the object** — particle splash, light bloom, shimmer ring, or glow pulse (style per object)
2. **Object animation** — wakes, glows, opens eyes, flickers on
3. **Sound effect** — short tuned tone (1–3 sec) bridging click to stem fade-in
4. **Music stem crossfades in** — always additive, stems never drop out
5. **Object settles into an "activated" idle state** — remains glowing/alive
6. **UI indicator** — small illustrated frame at bottom fills in (1 of 5 slots)

---

## Audio Design

### Adaptive Music System — Stem Layering
This is the core mechanic. All stems must be:
- **Composed together** as one piece, then exported as individual layers
- **Perfectly loopable** — seamless loops at the same BPM and key
- **Mixed to blend naturally** at any combination of active stems

| Stem | Instrument | Character |
|------|-----------|-----------|
| 1 | Low strings / drone | Mysterious foundation |
| 2 | Cello melody | Melancholic warmth |
| 3 | Flute / oboe | Lightness, nature |
| 4 | Harp / pizzicato | Magic, sparkle |
| 5 | Choir / full arrangement | Resolution, wonder |

**Key:** D minor or F major (natural, folk-leaning)
**Tempo:** ~60–72 BPM (slow, contemplative)
**Length of loop:** 60–90 seconds
**Format:** `.ogg` + `.mp3` fallback for each stem

### Additional audio
- Ambient background: gentle wind, distant birdsong (looping, always on)
- Interaction SFX: 5 unique short tones, each tuned to match the stem they unlock
- End-state SFX / musical sting: a gentle swell when all stems are collected

### Sound Designer Constraints & Brief

These are hard requirements to share with the sound designer at kickoff, not preferences.

**Technical delivery requirements**

| Parameter | Required value |
|-----------|---------------|
| Sample rate | 44,100 Hz (not 48k) |
| Bit depth | 24-bit WAV for delivery |
| Loop length | Identical sample count across all 5 stems — confirm in Audacity |
| Tempo | Fixed throughout — no ritardando, no tempo automation |
| Key / mode | Fixed — no modulation |
| Time signature | Must not change |
| Headroom per stem | Leave at least 6–8 dB — all 5 stems will stack simultaneously at full gain |
| Format | Developer converts WAV → `.ogg` + `.mp3`; do not deliver compressed files |

**Loop export rules**
- Export with DAW "tail" disabled — no added silence at end
- Any reverb or delay must be pre-baked and trimmed to fit inside the loop boundary — no tails bleeding past the last sample
- The last sample and first sample must connect without a click, gap, or pitch jump
- Reverb/room sound must be rendered into the file; there is no reverb bus in the browser

**Compositional requirement — any combination must sound coherent**
The player can find objects in any order. There are 32 possible combinations of active stems (2⁵ minus the silent state). Every combination must be musically tolerable, not just the intended 1→2→3→4→5 order.

This means:
- Each stem must make musical sense when heard alone first
- Avoid call-and-response relationships between stems (if the flute answers the cello, it breaks when found in the wrong order)
- Use harmonically open material — drones, sustained pads, pedal tones — that tolerate missing context
- Each stem adds textural density rather than harmonic dependency on another stem
- Do not mix stems assuming earlier stems are present; balance each as if it might be the only sound playing

**Interaction SFX**
Each of the 5 SFX plays at the moment of object interaction, bridging the action to the stem fading in. They should be short (1–3 seconds) and tuned to the same key/tonality as the stem they precede, so the transition feels intentional rather than jarring.

**The honest creative challenge**
Writing music that works in 32 combinations is closer to composing an adaptive game score than writing a linear piece. The Bauer/forest aesthetic helps — slow, modal, drone-forward writing is naturally forgiving of missing layers. Lean into that rather than fighting it with tight rhythmic or harmonic dependencies.

### Implementation: Web Audio API

All stems are decoded before any playback starts, then launched from a single shared timestamp. This prevents sync drift — but only if implemented correctly (see Known Audio Limitations below).

```javascript
const audioContext = new AudioContext();
const gainNodes = [];
const sources = [];

async function initAudio(stemUrls) {
  // Decode all stems before starting any of them
  const buffers = await Promise.all(
    stemUrls.map(url =>
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(buf => audioContext.decodeAudioData(buf))
    )
  );

  // Schedule all sources from the same timestamp — critical for sync
  const startTime = audioContext.currentTime + 0.1;

  buffers.forEach((buffer, i) => {
    const source = audioContext.createBufferSource();
    const gain = audioContext.createGain();

    source.buffer = buffer;
    source.loop = true;
    source.connect(gain).connect(audioContext.destination);

    gain.gain.setValueAtTime(0, startTime); // all silent at start
    source.start(startTime); // all start at identical timestamp

    sources.push(source);
    gainNodes.push(gain);
  });
}

// Called once per stem, on first interaction only
function unlockStem(index, fadeDuration = 2.0) {
  const gain = gainNodes[index];
  const now = audioContext.currentTime;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(1, now + fadeDuration);
  // Nothing scheduled after this — gain stays at 1 permanently
  // Loop runs at constant gain; fade only ever happens once
}
```

**Fade-in behaviour:** each stem fades in only on first unlock. After the ramp completes the gain sits at 1 and the loop runs at constant volume indefinitely — no fade on subsequent loops. Since `unlockStem` is called exactly once per stem this is guaranteed by design, not by any state check.

**Gain automation uses only Web Audio API scheduling** (`setValueAtTime`, `linearRampToValueAtTime`) — never JS `setTimeout` or `setInterval`. This matters because Chrome throttles background tabs and JS timers will drift; the Web Audio scheduler is protected and remains sample-accurate.

### Known Audio Limitations

These are real constraints that must be handled explicitly — sync reliability depends on all of them being respected.

**1. Loop boundary drift**
Even with `.loop = true`, if a file's length is not aligned to an exact number of samples, the API inserts a tiny gap at each loop point. Over multiple loops this becomes audible on rhythmic material. The sound designer must export stems at mathematically exact lengths (e.g. 4 bars at 60 BPM = exactly 705,600 samples at 44,100 Hz). Confirm loop points in Audacity before final delivery.

**2. All buffers must decode before playback starts**
`decodeAudioData()` is asynchronous. If stem 1 decodes first and starts playing, then stem 3 decodes 200ms later and starts then, they are permanently offset. The `Promise.all()` pattern above solves this — no source starts until every buffer is ready.

**3. Memory footprint**
Compressed `.ogg` files expand to raw PCM in RAM on decode. 5 stems × 60 seconds × stereo × 32-bit float ≈ **~211 MB**. Keep loops to 60 seconds, consider mono if the mix allows it, and ensure the portfolio page isn't already memory-heavy before the game loads.

**4. `AudioBufferSourceNode` is single-use**
Once `.start()` is called, a source node cannot be restarted after `.stop()`. A restart button or page refresh requires creating fresh source nodes from the already-decoded buffers. Easy to handle — just worth knowing before building the restart flow.

**5. AudioContext autoplay suspension**
Chrome suspends the AudioContext until a user gesture. The start screen interaction naturally handles this for desktop. On some mobile Chrome versions `resume()` inside a `touchstart` is not always honoured on the first attempt — acceptable since the project is scoped to desktop Chrome, but note it in QA.

---

## Technical Architecture

### Recommended Stack
| Component | Technology | Reason |
|-----------|-----------|--------|
| Game engine | **Phaser 3** | Mature, browser-native, excellent sprite/input handling |
| Audio | **Web Audio API** (native) | Precise stem control; no library needed |
| Rendering | **WebGL** via Phaser | Smooth parallax, shader support for painterly glow effects |
| Asset pipeline | **TexturePacker** (sprites) | Efficient spritesheets |
| Build / bundle | **Vite** | Fast dev server, simple portfolio embedding |
| Hosting | Static files on portfolio site | No backend needed |

### Project File Structure
```
/game
  /assets
    /sprites       ← character + object spritesheets
    /backgrounds   ← layered parallax PNGs
    /audio
      stems/       ← stem-01.ogg ... stem-05.ogg
      sfx/         ← interact sounds
      ambient.ogg
  /src
    main.js        ← Phaser game config
    scenes/
      Preload.js
      GameScene.js
      EndScene.js
    systems/
      AudioManager.js   ← stem controller
      InteractionSystem.js
  index.html       ← embeddable via <iframe> or direct link
  vite.config.js
```

### Portfolio Embedding
```html
<!-- In your portfolio page -->
<iframe
  src="/game/index.html"
  width="960"
  height="540"
  style="border: none;"
  allowfullscreen>
</iframe>
```
Or link directly to `/game/index.html` as a full-page experience.

---

## Art Asset List

### For the Graphic Designer

**No player character** — removed from scope. The viewer is the player.

**Background — single illustrated scene (960×540px)**
- One full painterly composition, John Bauer style
- Should read as a complete illustration even before any objects are activated
- Can be layered (sky + mid + foreground) for subtle depth, but no scrolling

**Interactable Objects (each needs idle + activated state)**
- Runed stone (idle: dark; activated: softly glowing)
- Sleeping troll (idle: still; activated: one eye opens)
- Pond lily + frog (idle; frog croaks, ripples)
- Hanging lantern (idle: dim; activated: warm glow)
- Owl on rock (idle; activated: spreads wings briefly)

**UI**
- Collection frame (5 slots, illustrated border in Bauer style)
- Item icons: 5 small illustrations of each object
- Start screen: illustrated title card
- End screen: full scene with complete character tableau

**Style notes for designer:**
- Work in high resolution (300dpi), export to web sizes
- Use real watercolour or digital watercolour brush textures
- Ink outlines should feel hand-drawn, slightly irregular
- Avoid pure black — use very dark brown/green for linework
- Reference: Bauer's *The Boy and the Trolls* (1915), *Bianca Maria* (1909)

---

## Feasibility Assessment

### ✅ What is clearly achievable
- Stem-layering audio system — well-understood Web Audio pattern, no exotic APIs
- Static single-screen scene — simpler than scrolling, very reliable in browser
- Click interaction on visible objects — no proximity detection needed
- Particle VFX on interaction — Phaser particle emitter, straightforward
- Sprite animation system — built into Phaser
- Static hosting on portfolio — zero infrastructure needed
- 5-minute experience loop — very manageable scope
- First-time-only stem fade-ins — trivial with Web Audio API gain scheduling; loops run at constant volume after

### ⚠️ Risks to manage

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| **Art scope creep** — Bauer style is labour-intensive | High | Fix asset list strictly; no scope additions mid-project |
| **Audio sync drift** — stems offset if not decoded together | Medium | Use `Promise.all()` to decode all buffers before any source starts; launch all sources from identical `audioContext.currentTime` timestamp |
| **Loop boundary drift** — inexact file length causes per-loop gap | Medium | Sound designer confirms sample count in Audacity; export at mathematically exact bar lengths |
| **Memory pressure** — decoded PCM is large | Medium | 5 stems × 60s stereo ≈ 211 MB RAM; keep loops to 60s, consider mono, audit portfolio page memory before embedding |
| **Gain automation timing** — JS timers drift in background tabs | Low | Use only Web Audio API scheduling methods for all gain changes; never `setTimeout` |
| **Mobile incompatibility** — touch controls | Medium | Scope to desktop Chrome only; add tap-to-move as bonus if time allows |
| **File size** — audio + large PNGs | Medium | Use `.ogg` audio, compress PNGs with TinyPNG, lazy preload |
| **Autoplay policy in Chrome** — audio blocked on load | High | Gate AudioContext start on first user interaction (start screen click); standard workaround |
| **Designer unfamiliarity with game sprites** | Medium | Brief designer early on animation frame requirements; provide Bauer reference board |
| **32-combination audio coherence** — stems heard in any order | High | Sound designer briefed explicitly; compositional approach must be drone/texture-based, not melodically interdependent |

### ❌ What is out of scope (deliberately)
- Player character / movement
- Parallax scrolling
- Mobile / touch support
- Save state / progress persistence
- Multiple levels or scenes
- Multiplayer
- Procedural generation
- Backend / server of any kind

---

## Team Responsibilities

| Role | Responsibilities |
|------|----------------|
| **Developer (you)** | Phaser setup, game loop, audio manager, interaction system, parallax, UI, build + deploy |
| **Sound Designer** | All 5 stems (composed as one piece, exported separately), ambient loop, 5 SFX, end sting |
| **Graphic Designer** | Character sprites, 4 background layers, 5 interactive objects, UI frames, start/end screens |

---

## Milestones & Timeline

*Suggested timeline for a team working part-time (~8–10 hrs/week each)*

| Week | Milestone |
|------|----------|
| **1** | Concept lock: character chosen, scene zones agreed, Bauer reference board shared with designer |
| **1–2** | Sound designer delivers scratch/temp stems for dev testing; designer delivers rough character sketch |
| **2–3** | Developer builds core engine: scene, character movement, interaction trigger zones |
| **3** | Audio manager built + tested with temp stems; stem unlock confirmed working |
| **3–4** | Designer delivers background layers + 3/5 objects |
| **4** | Designer delivers remaining objects + UI; character sprites finalised |
| **4–5** | Final audio stems delivered; integrated and tuned |
| **5** | Full playthrough pass: timing, feel, audio balance |
| **5–6** | Polish: animations, particle effects, start/end screens |
| **6** | QA in Chrome, performance check, deploy to portfolio |

---

## Definition of Done

The game is complete when:

- [ ] Player can move the character across the full scene
- [ ] All 5 objects are interactable with clear feedback
- [ ] Each interaction permanently adds its stem to the mix
- [ ] Each stem fades in only on first unlock; subsequent loops play at constant volume
- [ ] Collecting all 5 triggers the end state
- [ ] Audio never clips, stutters, or drifts out of sync — tested across a full 5-minute session
- [ ] All stem loop boundaries are inaudible
- [ ] AudioContext initialises correctly on start screen click — no console errors
- [ ] Runs at 60fps on a mid-range laptop in Chrome
- [ ] Total page load under 15 seconds on a standard connection
- [ ] Embedded cleanly on portfolio page with no console errors
- [ ] Start screen and end screen are polished

---

## Inspirational References

- **John Bauer** — *Bland tomtar och troll* series (1907–1915)
- **Games:** *Gris* (atmospheric, no-fail exploration), *Alba: A Wildlife Adventure* (gentle interaction), *Year Walk* (Swedish folk horror, browser-adjacent)
- **Audio:** *Journey* OST (Austin Wintory) — adaptive layered score as emotional arc
- **Web game tech:** *Bruno Simon's portfolio* — proof that ambitious WebGL runs beautifully in browser

---

*Document version 1.1 — updated with audio implementation detail, sound designer brief, and corrected feasibility assessment*