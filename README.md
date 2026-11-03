# KTM DUKE 390 — MIDNIGHT RACING EXPERIENCE (APEXOR)
### SCROLLTIDE-INSPIRED EDITORIAL MOTORCYCLE EXPERIENCE

A premium, photorealistic, cinematic 3D scrollytelling website for the **KTM DUKE 390** motorcycle, designed with inspiration from [Scrolltide](https://www.scrolltide.co/) editorial layouts and motion architecture.

Built using **vanilla HTML5 Canvas, CSS3, and JavaScript** with zero external animation frameworks, zero npm dependencies, and full VS Code Live Server compatibility.

---

## 1. Architectural Highlights & Scrolltide Influences

- **Asymmetrical Split Hero Experience:**
  - Left panel: `KTM MOTORCYCLE EXPERIENCE` mono tag, colossal display typography `UNLEASH THE DARK`, orange CTA `EXPLORE DUKE 390`, telemetry strip (`0–100 IN 4.8S · 44.2 HP · TRELLIS`), and ride prompt.
  - Right panel: High-resolution hardware-accelerated canvas showcasing the photorealistic KTM Duke 390 in deep midnight navy atmosphere with wet asphalt reflections.
  - Transitions into full-screen cinematic tracking film with real-time HUD telemetry.
- **Horizontal Scrolling Fleet Gallery (`350vh` Pinned Track):**
  - Horizontal translation driven by vertical scroll progress.
  - Interactive cards for all 5 models (Duke 390, Duke 250, Duke 200, RC 390, Adventure 390) with hover zooms, 4-metric spec grids, swatches, and direct configuration links.
  - Navigation controls: `[← PREV]`, `[NEXT →]`, active dot indicators, and `AUTO-TOUR ALL MODELS` mode.
- **Exploded Mechanical Engineering (`350vh` Pinned Track):**
  - 80-frame technical deconstruction of all 26 components.
  - 4 callouts (`FRAME`, `ENGINE`, `SUSPENSION`, `LIGHT`) revealed past 70% progress.
  - Tap-to-dismantle / reassemble auto-run engine.
  - Expandable 4-card technical deep-dive grid beneath.
- **Full-Width Parallax Feature Band:**
  - Editorial canyon shot with parallax scaling, bold typography (`ENGINEERED TO CUT THE NIGHT`), and chassis telemetry pills.
- **Interactive Acquisition Portal:**
  - Live model preview frame with tab-swapping (`[DUKE 390]`, `[DUKE 250]`, etc.) and allocation drawer.
- **Strict Visual Rules Upheld:**
  - Zero gradients of any kind (solid flat colors only).
  - Zero glassmorphism or `backdrop-filter`.
  - Minimal editorial typography (Archivo, Inter, JetBrains Mono).

---

## 2. Colour System

- **Midnight Navy:** `#0B1B35`
- **Deep Background / Asphalt:** `#070B16`
- **KTM Orange:** `#FF6600`
- **Light Orange:** `#FF8533`
- **Bone White:** `#F1F3F7`
- **Fog Grey:** `#8996A8`
- **Xenon Blue:** `#CFE3FF`
- **Taillight Red:** `#E1251B`
- **Hairline:** `rgba(207, 227, 255, 0.16)`

---

## 3. How to Run Locally

1. Open this directory in VS Code:
   ```bash
   code .
   ```
2. Start Live Server or run Python HTTP server:
   ```bash
   python -m http.server 5500
   ```
3. Visit [http://localhost:5500/index.html](http://localhost:5500/index.html).
