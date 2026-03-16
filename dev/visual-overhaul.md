# Visual Overhaul Plan: The "Automation Matrix" Blue Ball Aesthetic

This document turns the loose visual ideas into a concrete implementation roadmap for more readable, whimsical, and mechanically satisfying machines.

---

## 1. Core Design Principles

These rules should apply to every processing machine (3×3 devices like Tumbler, Refractor, Weaver, Tesla Coil, Particle Accelerator, Gravity Well):

1. **Mechanical Transparency**
   - If a machine is holding N items, the player should be able to infer that from its visuals.
   - Processing phases should be visually distinct from idle/ready phases.
   - Inputs and outputs should be visibly separated (ports, pathways) rather than implied.

2. **Kinetic Energy**
   - Machines should never be completely dead: even idle machines have a low-amplitude "pilot light" motion (slow blink, pulsing light, subtle oscillation).
   - During active processing, machines should feel "busier": more motion, brighter accents, but still readable at a glance.

3. **Consistent Visual Vocabulary**
   - **Input ports**: dark or recessed slots that visually "pull" items in (e.g. beveled recess + slight glow inward).
   - **Output ports**: brighter, more energetic geometry (arrow/piston/glow) that clearly indicates ejection direction.
   - **Internal pathways**: visible channels, rails, tubes, or fields that items seem to move through inside the machine.
   - **Output indicator**: the existing perimeter arrow should remain the canonical indicator of the output cell, and its style should be reused everywhere.

4. **Performance Awareness**
   - Favor a few strongly communicated motions over many tiny effects.
   - Keep per-machine state small and deterministic (no huge per-machine particle arrays where a shared pool or simple illusions will do).

---

## 2. Shared Technical Foundations

Before deep-diving each machine, we should unify how machines are drawn and animated.

### 2.1 Machine Parts Library (Renderer-Level)

Add a small "parts" module to `entity-renderer.js` (or a sibling file) with reusable drawing helpers:

- `drawPiston(ctx, x, y, length, progress)`
  - Draws a simple rectangular piston whose extension is driven by `progress` (0–1).
- `drawGear(ctx, x, y, radius, rotation)`
  - Draws a gear-like shape; `rotation` in radians.
- `drawGlassTube(ctx, x, y, w, h, glowIntensity)`
  - Draws a glassy rectangle with optional glow; used for internal channels.
- `drawArcLightning(ctx, x1, y1, x2, y2, seed)`
  - Draws a jagged lightning bolt between two points, with `seed` controlling randomness.
- `drawDrum(ctx, x, y, radius, rotation)`
  - Draws a hex or circular drum outline used by the Tumbler.

These should be purely visual utilities, with all timing/percentages passed in via `e.state`.

### 2.2 Normalized Animation State

For each machine, introduce a normalized animation scalar in its state:

- `e.state.anim` in `[0, 1]` representing progress through the current cycle.
- Optional booleans like `e.state.idle` / `e.state.active` or an enum `e.state.phase` (`'idle' | 'processing' | 'ejecting'`).

Implementation notes:

- Logic modules (in `js/engine/entities/*.js`) advance `anim` and flip phases; renderer only reads.
- Use simple easing functions inline if needed (e.g., `t*t*(3-2*t)` for smooth in/out) but keep it lightweight.
- For machines driven by discrete timers (`processTimer`), map to anim with `anim = 1 - processTimer / maxProcessTime`.

### 2.3 Particle Strategy

We currently have per-machine grids (e.g. blender sand-sim). To keep things maintainable:

- **Short-term**: Keep existing per-machine "grid-of-pixels" approach where it already works (Blender, Sand Processor/Tumbler) but:
  - Cap particle density.
  - Avoid adding more independent grids if we can fake motion with simple shapes.
- **Future** (optional): Add a global particle pool module:
  - `spawnParticle({ x, y, vx, vy, life, color })`
  - `updateParticles(engine)` and `drawParticles(ctx, engine)`
  - Machines request "bursts" (e.g., sparks, grit, steam) without holding their own arrays.

The document below assumes we can start with the simpler, per-machine approach and upgrade later.

---

## 3. Machine Redesigns (Per Device)

Each machine section includes: concept, visual behavior, and implementation checklist.

### 3.1 Tumbler (Sand Processor) – Rotating Drum

**Concept:** A rotating hex/cylindrical drum full of grit that polishes items.

**Visual States:**
- **Idle / Ready**
  - Drum is visible but almost stationary (slow periodic wobble or tiny rotation).
  - A "ready" indicator light subtly pulses.
- **Processing**
  - When an item is inside:
    - Drum spins at a consistent rate.
    - Grit particles slosh toward the outer edges.
    - The item’s silhouette/ghost is visible inside.
- **Ejection**
  - Brief slowdown / visual hit as the item exits.
  - Optional small grit spill toward the output port.

**Implementation Checklist (Sand Processor)**
- Logic (existing `processSandProcessor`):
  - Keep core intake/output semantics but:
    - Ensure capacity clearly matches visuals (one item at a time, as now).
  - Track `e.state.phase` (`'idle' | 'processing' | 'eject-ready'`) and `e.state.anim` (0–1) based on `processTimer`.
- Rendering (`entity-renderer.js`):
  - Replace current grid visualization with:
    - Drum outline using `drawDrum`.
    - Use existing `grid` to decide where to draw grit but bias drawing near drum perimeter.
  - Use `e.state.anim` to drive drum rotation and grit movement radius.

### 3.2 Refractor (Hue Rotator) – Color Optics

**Concept:** Lenses and a beam that rotate the color of an item.

**Visual States:**
- **Idle**
  - Prism and lenses visible; faint pulsing light through the center line.
- **Processing**
  - Item is held at the center.
  - A white beam enters from one side, splits into a spectrum, then recombines.
  - Hue rotation is hinted by changing beam color as `anim` progresses.
- **Ejection**
  - Beam contracts, lenses spin once more, and the item exits via output port.

**Implementation Checklist (Hue Rotator)**
- Logic (`processHueRotator`):
  - Add `e.state.phase` and `e.state.anim`.
  - Map `processTimer` to `anim`.
- Rendering:
  - Use a fixed, non-rotating chassis (3×3).
  - Draw:
    - Central prism (already partially implemented).
    - Two or three circular "lens" rings that rotate using `drawGear`-like helper.
    - A line/beam across the machine using `ctx.globalCompositeOperation = 'lighter'` for glow.
  - Color of beam derived from `anim` and target hue.

### 3.3 Weaver (Stitcher) – Pressing Arms

**Concept:** Two mechanical arms push items together on a central press.

**Visual States:**
- **Idle**
  - Two platforms visible left/right (or top/bottom, but visually consistent).
  - Arms slightly oscillate or tick.
- **Filling**
  - Each incoming item appears on its own platform (left then right).
- **Processing**
  - Arms slide inward (driven by `anim`).
  - At peak compression:
    - Brief flash/spark in the center (one frame of white + small particle burst).
- **Ejection**
  - New combined item appears at center and moves toward the output port.

**Implementation Checklist (Stitcher)**
- Logic (`processStitcher`):
  - Already buffering two items and using `processTimer`.
  - Add `e.state.phase` (`'idle' | 'filling' | 'pressing' | 'eject-ready'`) and `anim`.
- Rendering:
  - Base: rectangular body using existing style.
  - Platforms: two rectangles indicating input "beds."
  - Arms: use `drawPiston` from each side toward center; piston extension = `ease(e.state.anim)`.
  - Spark: when `phase` transitions from `'pressing'` to `'eject-ready'`, briefly draw a central flash using simple white circle and maybe a couple of rays.

### 3.4 Tesla Coil (Crystallizer) – Charged Field

**Concept:** Magnetic suspension and lightning that refine high-tier items.

**Visual States:**
- **Idle**
  - Core ring structures rotate slowly (already partially present).
- **Charging / Processing**
  - Item is levitated slightly above the floor (scale up + shadow beneath).
  - Periodic lightning arcs from the corners of the 3×3 footprint to the item.
  - Lightning density increases as `anim` approaches 1.
- **Ejection**
  - Bright flash followed by cleaner, more crystalline output item.

**Implementation Checklist (Crystallizer)**
- Logic (`processCrystallizer`):
  - Already uses `processTimer`; add `anim` and a `phase`.
- Rendering:
  - Reuse existing rotating rings.
  - Add central levitating item "halo" when `processingItem` is set.
  - Use `drawArcLightning` from each corner to a central point based on a seeded random so it doesn’t flicker too much.
  - Only recompute lightning positions every few ticks (e.g., every 3–4 frames).

### 3.5 Particle Accelerator (Blender) – Spiral Vortex

**Concept:** A vortex that shreds 4 inputs into dust and reforms them into the "worst" shape.

**Current Behavior (Important Constraints):**
- Holds up to 4 units (2 of each of two types).
- Only starts processing when:
  - It has the correct input set, AND
  - There is a valid output cell.
- Background is black when idle; changes color + wheel animates during processing.
- On output failure (missing/blocked belt), it discards content and returns to empty.

**Visual Refinements:**
- **Idle**
  - Dark bowl with faint rotating indicator.
  - Particles (from previous blending) remain until they settle or next cycle starts.
- **Filling**
  - Each accepted item generates a burst of falling particles in that item’s color.
- **Processing**
  - Instead of particles simply disappearing:
    - Convert grid particles to "spiral coordinates":
      - Each frame, particles rotate around center with shrinking radius.
    - Wheel spin synced with spiral speed.
    - Background tinted with blended color (already partially done).
- **Ejection**
  - Spiral collapses to a point + quick outward pulse.
  - Resulting item appears at output cell.

**Implementation Checklist (Blender)**
- Logic (`processBlender`):
  - Already respects output availability and discards if output becomes invalid.
  - Add `e.state.anim` for the 500ms blending window (map `blendTimer`).
  - Optionally track per-particle angle/radius during blend phase (even cheaply as synthetic positions, not stored per-particle).
- Rendering:
  - During `blending`:
    - Don’t draw static grid; instead, draw N pseudo-particles around center using a loop with `(angleOffset + i * step)` + radius `(1 - anim)` curve.
  - When not blending:
    - Keep current sand-fall sim but maybe bias particles toward center for more "vortex bowl" appearance.

### 3.6 Gravity Well (Slot Machine) – Sacrificial Funnel

**Concept:** Items spiral into a dark well that powers a slot machine payout.

**Visual States:**
- **Idle**
  - Funnel outline visible; reels show last result.
- **Sacrifice**
  - Incoming item transitions into a spiral motion around center:
    - Orbit radius shrinks as `anim` increases.
    - Item fades or scales down as it approaches the "hole."
- **Spin**
  - Once item fully "falls in," reels spin (already implemented logically).
  - Reels stop; payout indicator (brief flash or coin effect).

**Implementation Checklist (Slot Machine)**
- Logic (`processSlotMachine`):
  - Add a short `'sacrifice'` phase before `spinning` begins:
    - `e.state.phase` in `'idle' | 'sacrificing' | 'spinning'`.
    - Track sacrificed item position via `anim` (0–1); remove from `engine.items` immediately but render ghost locally during sacrifice.
- Rendering:
  - Draw funnel: concentric circles or spiral lines leading to center.
  - While `phase === 'sacrificing'`, draw a ghost item orbiting center using `anim`.
  - Keep reel drawing but add minor screen shake or highlight on big payouts later if desired.

---

## 4. Implementation Order (Practical Roadmap)

Recommended sequence to avoid refactoring chaos:

1. **Unify Animation State**
   - For each 3×3 machine, add `e.state.phase` and `e.state.anim` driven by existing timers.
   - Change renderers to read from these properties, but keep visuals mostly as-is.

2. **Introduce Machine Parts Helpers**
   - Implement `drawPiston`, `drawGear`, `drawGlassTube`, `drawArcLightning`, `drawDrum`.
   - Refactor one machine at a time to use these instead of bespoke shapes.

3. **Refactor Machines One by One**
   - Tumbler (Sand Processor) – easiest to map existing grid to drum.
   - Refractor (Hue Rotator) – mainly beam and lens visuals.
   - Weaver (Stitcher) – arms and sparks.
   - Tesla Coil (Crystallizer) – lightning and levitation.
   - Particle Accelerator (Blender) – spiral blending improvement.
   - Gravity Well (Slot Machine) – sacrifice spiral + spin polish.

4. **Optional System-Level Polishes**
   - Add a minimal particle pool for sparks/steam shared by multiple machines.
   - Add small screen shake when big payouts occur or heavy machines complete cycles.
   - Experiment with simple dithering patterns for glow areas to keep the retro feel.

---

## 5. Future Whimsical Devices (Concept Parking Lot)

These are not prioritized yet, but the above foundations should make them straightforward later:

- **Archimedes Screw**
  - 1×3 vertical "elevator": items ride on a turning screw and emerge at a higher level or just reappear at a different belt position.
- **Pendulum Sorter**
  - Large swinging arm that periodically pushes items from one belt to another, acting as an alternative splitter with rhythm.
- **Steam Vent**
  - Decorative machine that vents particles whenever neighboring machines finish a cycle, making the factory feel alive.

Once the shared animation/state conventions are in place, each new device can be described in the same format: concept → phases → anim state → parts used → logic hooks.