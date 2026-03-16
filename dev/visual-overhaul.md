# Visual Overhaul: Completed & Future Vision

This document tracks the aesthetic evolution of the factory into the "Blue Ball Machine" / "Automation Matrix" style.

---

## 1. Core Design Principles (Status: Active)

1. **Mechanical Transparency**: Machines visually show their contents and internal state (e.g., Stitcher arms, Crystallizer levitation).
2. **Kinetic Energy**: Machines feature ambient motion when idle and high-energy animations during processing.
3. **Consistent Visual Vocabulary**:
   - **Input/Output Ports**: Standardized perimeter indicators point to specific output cells.
   - **Internal Pathways**: Clear visual areas where processing occurs (central drums, beds, or beams).

---

## 2. Shared Foundations (Status: Implemented)

- **Parts Library**: Reusable drawing helpers in `entity-renderer.js`:
  - `drawPiston`, `drawGear`, `drawDrum`, `drawArcLightning`, `drawMachineIndicator`.
- **Animation Framework**: Standardized `e.state.anim` (0-1) and `e.state.phase` across all 3×3 machines.

---

## 3. Redesigned Machines (Status: Implemented)

- **Tumbler (Sand Processor)**: Rotating hex drum with sloshing grit.
- **Refractor (Hue Rotator)**: Rotating lenses with a prismatic beam and item ghosting.
- **Weaver (Stitcher)**: Quad-piston compression system with sparking effects.
- **Tesla Coil (Crystallizer)**: Multi-ring rotation, magnetic levitation, and arc lightning.
- **Particle Accelerator (Blender)**: Rotating vortex bowl with unified color blending.
- **Gravity Well (Slot Machine)**: Spiral sacrifice phase followed by a reel spin.

---

## 4. Next Steps & Whimsical Ideas

- **Global Particle Pool**: (Implemented) A unified system for sparks, steam, and grit to improve performance and visual density.
- **Screen Shake**: (Implemented) Subtle feedback when heavy machines (Stitcher, Slot Machine) complete high-tier cycles.
- **Archimedes Screw**: A 1×3 elevator device to move items vertically or across gaps.
- **Pendulum Sorter**: A rhythmic arm that swings items between belts.
- **Steam Vents**: (Implemented) Decorative overlays that pulse when nearby machines are active.