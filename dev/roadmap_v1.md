# Roadmap V1: The Supernal Interregnum

## Overview
Transform the current factory logistics from "Red/Cyan Ore" into a mystical refinement process centered on the remnants of dead gods: **Bloodrock**, **Tearshard**, and **Snotstone**. The progression system moves from dull, simple shapes to vibrant, complex geometries through HSL-based color manipulation and "Shape Splicing."

## 1. Core Resource Refactor
Items on belts will no longer be simple strings (e.g., `'ore'`). They will be objects carrying:
- `h`: Hue (0-360)
- `s`: Saturation (0-100)
- `l`: Lightness (0-100)
- `sides`: Number of sides (3 = Triangle, 4 = Square, 6 = Hexagon, etc.)
- `isStar`: Boolean for the final tier.
- `label`: Display name (e.g., "Dull Bloodrock").

### Initial Resources
| Resource | Hue | Sat | Light | Sides | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bloodrock** | 5° | 50% | 30% | 3 | Triangle |
| **Tearshard** | 220° | 50% | 20% | 3 | Triangle |
| **Snotstone** | 45° | 50% | 20% | 3 | Triangle |

## 2. Rendering System (HSL & Geometry)
- **Procedural Shapes**: `drawItem` will use a `drawPolygon(sides)` function.
- **Vibrancy**: Saturation and Lightness will directly affect the `fillStyle`.
- **Special Tiers**: 
  - **Octagon (8 sides)**: Add a metallic/iridescent gradient.
  - **Circle**: Add an outer glow (shadowBlur).
  - **Star**: Multi-point star with a prismatic shimmer.

## 3. Color Blending Logic
Update the Blender (to be renamed "Crystallizer") to use "Shortest Path" hue averaging:
```javascript
function blendHue(h1, h2) {
    let diff = Math.abs(h1 - h2);
    if (diff <= 180) {
        return (h1 + h2) / 2;
    } else {
        return (Math.max(h1, h2) + (360 - diff) / 2) % 360;
    }
}