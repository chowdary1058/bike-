# KTM DUKE 390 — MIDNIGHT RACING EXPERIENCE (APEXOR)

A premium, photorealistic, cinematic 3D scrollytelling website for the **KTM DUKE 390** motorcycle.

Built strictly according to master specifications using **vanilla HTML5 Canvas, CSS3, and JavaScript** with zero external animation frameworks, zero npm dependencies, and full VS Code Live Server compatibility.

---

## 1. Project Overview & Visual Identity

- **Brand Identity:** KTM DUKE 390
- **Visual Identity:** MIDNIGHT NAVY (`#0B1B35`) × RACING ORANGE (`#FF6600`)
- **Atmosphere:** Blacked-out futuristic city at night, wet reflective asphalt, cutting LED headlights, and precision mechanical engineering.
- **Strict Visual Rules Adhered To:**
  - Solid flat colours and thin hairline borders.
  - No gradients of any kind (no linear, radial, or conic gradients).
  - No glassmorphism, no backdrop-filter, no frosted panels.
  - No emojis or bubbly rounded cards.
  - Minimal editorial typography (Archivo, Inter, JetBrains Mono).

---

## 2. Technical Stack

- **HTML5 Canvas:** High-performance hardware-accelerated 2D canvas with DPR capped at 2, cover-fit on desktop landscape, contain-fit on mobile portrait.
- **CSS3:** Strict color token system, variable font styling, responsive layout, global easing curve `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Vanilla JavaScript:** 60fps `requestAnimationFrame` render loop, lerp frame interpolation, progressive multi-stage asset preloader, touch & keyboard accessible interactive accordion.
- **Asset Pipeline:** Python Pillow & OpenCV automated WebP pipeline producing 1600px desktop (quality 78) and 960px mobile (quality 72) frame sequences.

---

## 3. Directory Structure

```text
c:\Users\alapa\Desktop\bike\
├── index.html                  # Master semantic HTML document
├── styles.css                  # Master CSS token and layout system
├── main.js                     # Core application engine and canvas scrollyteller
├── config.js                   # Centralized configuration object
│
├── assets/
│   ├── frames/
│   │   ├── hero/               # 120 desktop WebP frames (1600x900, q78)
│   │   ├── hero-mobile/        # 120 mobile WebP frames (960x540, q72)
│   │   ├── dismantle/          # 80 desktop WebP frames (1600x900, q78)
│   │   └── dismantle-mobile/   # 80 mobile WebP frames (960x540, q72)
│   │
│   ├── bikes/
│   │   ├── duke-390.webp       # 01 — Duke 390 Hero Side Profile (1600x900)
│   │   ├── duke-250.webp       # 02 — Duke 250 Streetfighter (1600x900)
│   │   ├── duke-200.webp       # 03 — Duke 200 Street Aggression (1600x900)
│   │   ├── rc-390.webp         # 04 — RC 390 Supersport Racing (1600x900)
│   │   └── adventure-390.webp  # 05 — Adventure 390 Touring (1600x900)
│   │
│   └── textures/
│       └── noise.png           # Shifting film grain texture buffer
│
├── generate_assets.py          # Python asset pipeline script
└── README.md                   # Complete architectural documentation
```

---

## 4. Asset Audit Report

Generated using Pillow and OpenCV WebP encoders:

| Directory | Files | Resolution | Format & Quality | Total Size |
|---|---:|:---:|:---:|---:|
| `assets/frames/hero/` | 120 | 1600 × 900 | WebP Q78 | 4.84 MB |
| `assets/frames/hero-mobile/` | 120 | 960 × 540 | WebP Q72 | 1.95 MB |
| `assets/frames/dismantle/` | 80 | 1600 × 900 | WebP Q78 | 7.86 MB |
| `assets/frames/dismantle-mobile/` | 80 | 960 × 540 | WebP Q72 | 3.36 MB |
| `assets/bikes/` | 5 | 1600 × 900 | WebP Q85 | 0.37 MB |
| `assets/textures/` | 1 | 256 × 256 | PNG | 0.06 MB |
| **Total Media Assets** | **406** | — | — | **18.44 MB** |

---

## 5. Key Architecture Features

### A. Preloader
- Midnight Navy backdrop (`#0B1B35`) with precision mono percentage counter (`000%` → `100%`).
- Loads first 40 frames of the Hero sequence, flashes a bright xenon pulse, and seamlessly reveals the website while loading remaining frames asynchronously.

### B. Section 01: Hero Scrollytelling (600vh)
- Continuous automotive sequence:
  - **Scene 1 (0–18%):** Stationary motorcycle in dark misty city, headlights beaming through fog.
  - **Scene 2 (22–42%):** Accelerating away down the wet avenue.
  - **Scene 3 & 4 (48–70%):** Sweeping camera move alongside rear three-quarter angle in skyscraper canyon.
  - **Scene 5 (78–95%):** Perfect side-profile hero shot.
  - **Outro (95–100%):** Seamless fade to solid midnight navy.
- Real-time HUD Telemetry:
  - Sequence chapter counter (`01/04` → `04/04`)
  - Velocity counter (`000` → `118 KM/H`)
  - Distance counter (`0.0` → `4.2 KM`)
  - Transmission gear indicator (`N`, `1`, `2`, `3`, `4`, `5`)
- Bottom 1px Xenon progress line filling in sync with scroll progress.

### C. Section 02: Engineering Statement (100vh)
- Editorial typographic showcase: *"Every part was designed to disappear into one line of light."*
- Scroll-driven progressive opacity reveal from 15% to 100%, highlighting signature KTM orange terms.

### D. Section 03: Exploded Motorcycle Engineering (350vh)
- 3D exploded engineering visualization of the exact KTM Duke 390 separating into 26 mechanical components along straight orthogonal axes upon scrolling down, and reassembling upon scrolling up.
- Sequential callouts after 70% scroll progress:
  - **FRAME:** Lightweight orange steel trellis frame.
  - **ENGINE:** Liquid-cooled single-cylinder engine.
  - **SUSPENSION:** Precision-tuned WP suspension system.
  - **LIGHT:** Aggressive LED headlight signature.

### E. Section 04: Interactive Motorcycle Lineup (100vh)
- Interactive 5-slide vertical accordion (Duke 390, Duke 250, Duke 200, RC 390, Adventure 390).
- Duke 390 open by default. Closed slides compressed to 12vw with 90° rotated titles, 25% brightness grayscale.
- Open slide expands to 52vw with full color rendering, common 72% floor line, 3-column mono specs, colour swatches, and configure CTA.
- Desktop 80ms hover debounce, mobile tap accordion with 72px collapsed height, full keyboard accessibility (`ArrowLeft`, `ArrowRight`, `Enter`).

### F. Section 05: Reservation Portal (100vh)
- High-contrast minimal acquisition portal with KTM orange button hover and red indicator tick.
- Functional modal allocation form with model selector and instant submission feedback.

### G. Custom Headlight Cursor
- Desktop-only fine-pointer custom cursor: 6px xenon dot with 28px ring, morphing into a 44×2px LED bar with mono contextual tags (`VIEW`, `RESERVE`, `OPEN`, `CONFIGURE`).

### H. Accessibility & Motion Sensitivity
- Fully respects `prefers-reduced-motion` by unlocking sticky wrappers into static editorial keyframes and disabling cursor transforms.

---

## 6. How to Run

1. Open this directory in VS Code:
   ```bash
   code .
   ```
2. Start **Live Server** (click "Go Live" on status bar or right-click `index.html` → "Open with Live Server").
3. Experience the website at `http://127.0.0.1:5500/index.html`.

