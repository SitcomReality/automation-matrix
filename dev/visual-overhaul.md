# Visual Overhaul Plan: The "Automation Matrix" Blue Ball Aesthetic

## Core Philosophy
The goal is to transform the factory from a static grid of blocks into a "Blue Ball Machine" style hypnotic loop. Every machine should be a distinct mechanical "act" in a larger Rube Goldberg performance.

### Visual Principles:
1. **Mechanical Transparency**: Never hide what is happening. If a machine is processing 4 items, we should see 4 items (or their constituent parts) inside it.
2. **Kinetic Energy**: Machines should never be completely still. Even when idle, they should have a "pilot light" or a slow-pulsing "ready" state.
3. **Consistent Vocabulary**:
   - **Input Ports**: Recessed slots that "pull" items in.
   - **Output Ports**: Ejection pistons or glowing apertures.
   - **Pathways**: Visible tracks or glass tubes inside machines.

---

## Machine Re-designs

### 1. The Polisher (formerly Sand Processor) -> "The Tumbler"
**Concept**: A rotating hexagonal drum filled with "grit" (small particles).
- **Animation**: When an item enters, the drum starts spinning. The item is seen bouncing around inside the drum with 20-30 "grit" particles.
- **Visual**: The drum is translucent. Centrifugal force pushes the grit to the edges as it spins faster.
- **Potato Optimization**: Use a simple rotation transform on a pre-drawn hexagonal path; particles are simple 2x2 squares drawn in a loop.

### 2. The Prism (Hue Rotator) -> "The Refractor"
**Concept**: A series of rotating glass lenses and a central light beam.
- **Animation**: The item sits in the center. A beam of white light hits it, and as the machine rotates, the light "refracts" into the output color.
- **Visual**: A "Jacob's Ladder" electrical arc or a spinning "Color Wheel" that pulses when the item changes color.
- **Potato Optimization**: Use `ctx.globalCompositeOperation = 'lighter'` for glow effects instead of heavy blur filters.

### 3. The Stitcher -> "The Weaver"
**Concept**: Two mechanical arms that physically push two items together on a "press."
- **Animation**: Item A and Item B enter and sit on side-by-side plates. The arms slide inward, a "spark" occurs (brief white flash), and the new shape remains.
- **Visual**: Scissor-like arms or a hydraulic press.
- **Potato Optimization**: Simple linear interpolation (lerp) for arm movement.

### 4. The Apotheosis (Crystallizer) -> "The Tesla Coil"
**Concept**: High-energy suspension in an electromagnetic field.
- **Animation**: The item is lifted into the air (slight scaling/shadow effect). High-frequency "lightning" arcs (Jacob's Ladder style) strike it from the corners of the 3x3 grid.
- **Visual**: Zig-zag lines drawn with `Math.random()` for the lightning.
- **Potato Optimization**: Only calculate lightning paths every 3-4 frames to save CPU.

### 5. The Blender -> "The Particle Accelerator"
**Concept**: A vortex that shreds items into dust and reforms them.
- **Current State**: Already has a sand-sim. 
- **Improvement**: Make the particles spin in a spiral towards the center during the "blending" phase, rather than just disappearing.
- **Potato Optimization**: Use polar coordinates (angle, radius) to update particle positions during the blend phase.

### 6. The Sacrifice (Slot Machine) -> "The Gravity Well"
**Concept**: A funnel where items spiral down into a dark pit.
- **Animation**: The item enters and begins a circular orbit, getting faster and smaller until it vanishes into a central "black hole." Then the reels spin.
- **Visual**: A spiraling wireframe funnel.

---

## Technical Implementation Plan

### Stage 1: The "Component" Renderer
Refactor `entity-renderer.js` to use a modular component-based approach:
<pre>
<code>
const MachineParts = {
    drawPiston: (ctx, x, y, extension) => { ... },
    drawGear: (ctx, x, y, rotation) => { ... },
    drawGlassTube: (ctx, x, y, w, h) => { ... }
};
</code>
</pre>

### Stage 2: Animation State Logic
Move animation progress from `e.state.timer` to a normalized `e.state.animPercent (0.0 to 1.0)`. This allows for smooth CSS-like easing (Ease-in/out) without complex math in the render loop.

### Stage 3: Particle Pooling
To keep the game "potato-friendly," implement a global Particle Pool. Instead of every machine having its own `grid[20][20]`, they request particles from a pool and return them when done.

### Stage 4: Visual Polish
- **Screen Shake**: Minor rumble when heavy machines (Stitcher/Sacrifice) complete a cycle.
- **Dithering**: Use a dithered transparency pattern instead of true alpha transparency to maintain the "retro/abstract" GIF feel.

---

## New Whimsical Device Ideas
- **The Archimedes Screw**: A 1x3 vertical elevator that moves items "up" (conceptually) to different layers or just for visual flair.
- **The Pendulum Sorter**: A giant swinging blade that "knocks" items from one belt to another (Alternative to the Splitter).
- **The Steam Vent**: A machine that purely adds "steam" particles to the environment when nearby machines are working hard.