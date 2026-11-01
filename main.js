/**
 * KTM DUKE 390 — MIDNIGHT RACING EXPERIENCE
 * Core Application Engine
 * Vanilla JavaScript implementation fulfilling all technical & cinematic specifications.
 */

(function () {
  'use strict';

  // Quick sanity check for configuration
  const cfg = window.CONFIG;
  if (!cfg) {
    console.error('FATAL: config.js must be loaded before main.js');
    return;
  }

  /* ==========================================================================
     STATE MANAGEMENT
     ========================================================================== */
  const state = {
    isMobile: window.innerWidth < cfg.rendering.breakpointMobile,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollY: window.scrollY || window.pageYOffset,
    lastScrollY: window.scrollY || window.pageYOffset,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
    
    // Frame Caches
    heroFrames: [],
    heroLoadedCount: 0,
    heroTargetFrame: 0,
    heroCurrentFrame: 0,
    heroLastRendered: -1,

    dismantleFrames: [],
    dismantleLoadedCount: 0,
    dismantleTargetFrame: 0,
    dismantleCurrentFrame: 0,
    dismantleLastRendered: -1,

    // Lineup
    activeLineupIndex: cfg.lineup.defaultActiveIndex || 0,
    lineupDebounceTimer: null,
    lineupTourActive: false,
    lineupTourTimer: null,

    // Tap Auto-Run Engine
    heroAutoRun: false,
    dismantleAutoRun: false,
    dismantleAutoTarget: 1.0,

    // Cursor
    cursorX: -100,
    cursorY: -100,
    targetCursorX: -100,
    targetCursorY: -100,
    isHoveringInteractive: false,
    cursorLabelText: ''
  };

  /* ==========================================================================
     DOM ELEMENTS
     ========================================================================== */
  const dom = {
    // Preloader
    preloader: document.getElementById('preloader'),
    preloaderBar: document.getElementById('preloader-bar'),
    preloaderPct: document.getElementById('preloader-pct'),
    preloaderStatus: document.getElementById('preloader-status'),

    // Grain & Cursor
    grainCanvas: document.getElementById('film-grain'),
    cursorDot: document.getElementById('cursor-dot'),
    cursorRing: document.getElementById('cursor-ring'),
    cursorLabel: document.getElementById('cursor-label'),

    // Nav
    navbar: document.getElementById('navbar'),
    navLinks: document.querySelectorAll('.nav-link'),

    // Hero Section
    heroWrapper: document.getElementById('hero'),
    heroCanvas: document.getElementById('hero-canvas'),
    heroProgress: document.getElementById('hero-progress'),
    heroAutoRunBtn: document.getElementById('hero-autorun-btn'),
    heroAutoRunLabel: document.getElementById('hero-autorun-label'),
    heroAutoRunIcon: document.getElementById('hero-autorun-icon'),
    hudChapter: document.getElementById('hud-chapter'),
    hudSpeed: document.getElementById('hud-speed'),
    hudDistance: document.getElementById('hud-distance'),
    hudGear: document.getElementById('hud-gear'),
    heroChapters: [
      document.getElementById('chapter-1'),
      document.getElementById('chapter-2'),
      document.getElementById('chapter-3'),
      document.getElementById('chapter-4')
    ],

    // Statement Section
    statementSection: document.getElementById('engineering-statement'),
    statementWordsContainer: document.getElementById('statement-words'),

    // Dismantle Section
    dismantleWrapper: document.getElementById('dismantle'),
    dismantleCanvas: document.getElementById('dismantle-canvas'),
    dismantleProgress: document.getElementById('dismantle-progress'),
    dismantleAutoRunBtn: document.getElementById('dismantle-autorun-btn'),
    dismantleAutoRunLabel: document.getElementById('dismantle-autorun-label'),
    dismantleAutoRunIcon: document.getElementById('dismantle-autorun-icon'),
    calloutFrame: document.getElementById('callout-frame'),
    calloutEngine: document.getElementById('callout-engine'),
    calloutSuspension: document.getElementById('callout-suspension'),
    calloutLight: document.getElementById('callout-light'),

    // Lineup Section
    lineupSection: document.getElementById('lineup'),
    lineupAccordion: document.getElementById('lineup-accordion'),
    lineupAutoTourBtn: document.getElementById('lineup-autotour-btn'),
    lineupTourLabel: document.getElementById('lineup-tour-label'),

    // Reservation & Modal
    reserveCta: document.getElementById('reserve-cta'),
    modal: document.getElementById('reservation-modal'),
    modalClose: document.getElementById('modal-close'),
    reservationForm: document.getElementById('reservation-form')
  };

  /* ==========================================================================
     HELPER UTILITIES
     ========================================================================== */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  function padNumber(num, size) {
    let s = String(num);
    while (s.length < (size || 4)) s = '0' + s;
    return s;
  }

  function getFramePath(pattern, index, padLen) {
    return pattern.replace('{index}', padNumber(index, padLen));
  }

  /* ==========================================================================
     1. PRELOADER & ASSET PIPELINE
     Stage 1: Load Hero 1-40 -> Reveal page.
     Stage 2: Background load remaining Hero (41-120).
     Stage 3: Background load Dismantle (1-80).
     Stage 4: Lazy load Lineup images.
     ========================================================================== */
  function initPreloader() {
    const heroCfg = state.isMobile ? cfg.hero.mobile : cfg.hero.desktop;
    const initialBatchCount = 40;
    let initialLoaded = 0;

    function updatePreloaderDisplay(pct, text) {
      if (dom.preloaderBar) dom.preloaderBar.style.width = pct + '%';
      if (dom.preloaderPct) dom.preloaderPct.textContent = padNumber(pct, 3) + '%';
      if (dom.preloaderStatus && text) dom.preloaderStatus.textContent = text;
    }

    // Allocate frame slots
    state.heroFrames = new Array(heroCfg.frameCount);

    function checkInitialReady() {
      initialLoaded++;
      const pct = Math.min(100, Math.round((initialLoaded / initialBatchCount) * 100));
      updatePreloaderDisplay(pct, 'OPTIMIZING OPTICS [' + initialLoaded + '/' + initialBatchCount + ']');

      if (initialLoaded >= initialBatchCount) {
        // Initial hero frames ready! Flare and reveal page
        if (dom.preloaderBar) dom.preloaderBar.classList.add('flare');
        if (dom.preloaderStatus) dom.preloaderStatus.textContent = 'READY FOR TAKEOFF';

        setTimeout(() => {
          if (dom.preloader) dom.preloader.classList.add('loaded');
          // Trigger first canvas render
          renderHeroCanvas(0);
          renderDismantleCanvas(0);
          // Start background loading queue
          loadRemainingHeroFrames();
        }, 400);
      }
    }

    // Load initial 40 hero frames
    for (let i = 1; i <= initialBatchCount; i++) {
      const img = new Image();
      const path = getFramePath(heroCfg.path, i, heroCfg.padLength);
      img.src = path;
      img.onload = () => {
        state.heroFrames[i - 1] = img;
        state.heroLoadedCount++;
        checkInitialReady();
      };
      img.onerror = () => {
        console.warn('Failed loading hero frame:', path);
        checkInitialReady();
      };
    }
  }

  function loadRemainingHeroFrames() {
    const heroCfg = state.isMobile ? cfg.hero.mobile : cfg.hero.desktop;
    const start = 41;
    const end = heroCfg.frameCount;

    for (let i = start; i <= end; i++) {
      const img = new Image();
      const path = getFramePath(heroCfg.path, i, heroCfg.padLength);
      img.src = path;
      img.onload = () => {
        state.heroFrames[i - 1] = img;
        state.heroLoadedCount++;
        if (state.heroLoadedCount >= heroCfg.frameCount) {
          // Hero fully loaded, now load dismantle frames
          loadDismantleFrames();
        }
      };
    }
  }

  function loadDismantleFrames() {
    const disCfg = state.isMobile ? cfg.dismantle.mobile : cfg.dismantle.desktop;
    state.dismantleFrames = new Array(disCfg.frameCount);

    for (let i = 1; i <= disCfg.frameCount; i++) {
      const img = new Image();
      const path = getFramePath(disCfg.path, i, disCfg.padLength);
      img.src = path;
      img.onload = () => {
        state.dismantleFrames[i - 1] = img;
        state.dismantleLoadedCount++;
      };
    }
  }

  /* Find nearest available loaded frame to avoid any blank flashes */
  function getNearestLoadedFrame(frames, targetIdx) {
    if (frames[targetIdx]) return frames[targetIdx];
    for (let offset = 1; offset < frames.length; offset++) {
      if (targetIdx - offset >= 0 && frames[targetIdx - offset]) return frames[targetIdx - offset];
      if (targetIdx + offset < frames.length && frames[targetIdx + offset]) return frames[targetIdx + offset];
    }
    return null;
  }

  /* ==========================================================================
     2. CANVAS DRAWING ROUTINES (Cover on landscape, contain on portrait)
     ========================================================================== */
  function drawImageFit(ctx, img, canvasW, canvasH) {
    if (!img) return;
    const isPortrait = canvasH > canvasW;
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasW / canvasH;
    let renderW, renderH, offsetX, offsetY;

    if (isPortrait) {
      // Contain fit on mobile / portrait to prevent cropping the motorcycle
      if (canvasRatio > imgRatio) {
        renderH = canvasH;
        renderW = canvasH * imgRatio;
      } else {
        renderW = canvasW;
        renderH = canvasW / imgRatio;
      }
    } else {
      // Cover fit on desktop / landscape
      if (canvasRatio > imgRatio) {
        renderW = canvasW;
        renderH = canvasW / imgRatio;
      } else {
        renderH = canvasH;
        renderW = canvasH * imgRatio;
      }
    }

    offsetX = (canvasW - renderW) / 2;
    offsetY = (canvasH - renderH) / 2;

    ctx.clearRect(0, 0, canvasW, canvasH);
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  }

  function resizeCanvas(canvas) {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, cfg.rendering.maxDpr);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function renderHeroCanvas(frameIndex) {
    if (!dom.heroCanvas) return;
    const ctx = dom.heroCanvas.getContext('2d', { alpha: false });
    const img = getNearestLoadedFrame(state.heroFrames, frameIndex);
    if (img) {
      drawImageFit(ctx, img, dom.heroCanvas.width, dom.heroCanvas.height);
      state.heroLastRendered = frameIndex;
    }
  }

  function renderDismantleCanvas(frameIndex) {
    if (!dom.dismantleCanvas) return;
    const ctx = dom.dismantleCanvas.getContext('2d', { alpha: false });
    const img = getNearestLoadedFrame(state.dismantleFrames, frameIndex);
    if (img) {
      drawImageFit(ctx, img, dom.dismantleCanvas.width, dom.dismantleCanvas.height);
      state.dismantleLastRendered = frameIndex;
    }
  }

  /* ==========================================================================
     3. FILM GRAIN SYSTEM (Shifting noise overlay ~8 fps)
     ========================================================================== */
  function initFilmGrain() {
    if (!dom.grainCanvas) return;
    const canvas = dom.grainCanvas;
    const ctx = canvas.getContext('2d');
    const grainW = 256;
    const grainH = 256;

    // Create offscreen buffer
    const offscreen = document.createElement('canvas');
    offscreen.width = grainW;
    offscreen.height = grainH;
    const offCtx = offscreen.getContext('2d');
    const imgData = offCtx.createImageData(grainW, grainH);
    const data = imgData.data;

    function generateNoise() {
      for (let i = 0; i < data.length; i += 4) {
        const val = (Math.random() * 255) | 0;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = 40;
      }
      offCtx.putImageData(imgData, 0, 0);
    }

    function renderGrain() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateNoise();
      const pattern = ctx.createPattern(offscreen, 'repeat');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    renderGrain();
    window.addEventListener('resize', renderGrain);

    // Shift ~8 times per second
    setInterval(() => {
      generateNoise();
      const pattern = ctx.createPattern(offscreen, 'repeat');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 1000 / cfg.rendering.grainFps);
  }

  /* ==========================================================================
     4. CUSTOM CURSOR SYSTEM — THE HEADLIGHT (Desktop Only)
     ========================================================================== */
  function initCustomCursor() {
    if (state.isMobile || state.reducedMotion || !dom.cursorDot || !dom.cursorRing) {
      document.body.classList.remove('has-custom-cursor');
      return;
    }

    window.addEventListener('mousemove', (e) => {
      state.targetCursorX = e.clientX;
      state.targetCursorY = e.clientY;
    }, { passive: true });

    window.addEventListener('mousedown', () => {
      document.body.classList.add('cursor-down');
    });

    window.addEventListener('mouseup', () => {
      setTimeout(() => {
        document.body.classList.remove('cursor-down');
      }, 120);
    });

    // Delegate hover detection for data-cursor or interactive elements
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor], a, button, [role="tab"], [role="button"]');
      if (target) {
        document.body.classList.add('cursor-hover');
        const label = target.getAttribute('data-cursor') ||
                     (target.tagName === 'A' ? 'VIEW' :
                      target.tagName === 'BUTTON' ? 'OPEN' : 'SELECT');
        if (dom.cursorLabel) dom.cursorLabel.textContent = label;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-cursor], a, button, [role="tab"], [role="button"]');
      if (target) {
        document.body.classList.remove('cursor-hover');
        if (dom.cursorLabel) dom.cursorLabel.textContent = '';
      }
    });

    // Cursor animation loop
    function updateCursor() {
      state.cursorX = lerp(state.cursorX, state.targetCursorX, cfg.rendering.cursorLerp);
      state.cursorY = lerp(state.cursorY, state.targetCursorY, cfg.rendering.cursorLerp);

      dom.cursorDot.style.transform = `translate3d(${state.targetCursorX}px, ${state.targetCursorY}px, 0) translate(-50%, -50%)`;
      dom.cursorRing.style.transform = `translate3d(${state.cursorX}px, ${state.cursorY}px, 0) translate(-50%, -50%)`;

      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);
  }

  /* ==========================================================================
     5. SECTION 01: HERO SCROLL CONTROLLER & HUD TELEMETRY
     ========================================================================== */
  function updateHeroSection() {
    if (!dom.heroWrapper) return;
    const rect = dom.heroWrapper.getBoundingClientRect();
    const scrollDistance = dom.heroWrapper.offsetHeight - state.viewportHeight;
    const progress = clamp(-rect.top / scrollDistance, 0, 1);

    // Hero Progress Line (1px Xenon Bottom Line)
    if (dom.heroProgress) {
      dom.heroProgress.style.width = (progress * 100).toFixed(2) + '%';
    }

    // Target Frame
    const heroCfg = state.isMobile ? cfg.hero.mobile : cfg.hero.desktop;
    state.heroTargetFrame = Math.round(progress * (heroCfg.frameCount - 1));

    // Telemetry updates
    const currentSpeed = Math.round(progress * cfg.hero.hud.speedMax);
    const currentDist = (progress * cfg.hero.hud.distanceMax).toFixed(1);

    if (dom.hudSpeed) dom.hudSpeed.textContent = padNumber(currentSpeed, 3);
    if (dom.hudDistance) dom.hudDistance.textContent = currentDist;

    // Gear indicator
    let activeGear = 'N';
    for (const g of cfg.hero.hud.gearMap) {
      if (progress >= g.progress) activeGear = g.gear;
    }
    if (dom.hudGear) dom.hudGear.textContent = activeGear;

    // Chapter updates
    cfg.hero.chapters.forEach((chap, idx) => {
      const el = dom.heroChapters[idx];
      if (!el) return;
      const [start, end] = chap.range;
      const isActive = progress >= start && progress <= end;
      if (isActive) {
        el.classList.add('active');
        if (dom.hudChapter) dom.hudChapter.textContent = chap.chapterLabel;
      } else {
        el.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     6. SECTION 02: ENGINEERING STATEMENT WORD REVEAL
     ========================================================================== */
  function initEngineeringStatement() {
    if (!dom.statementWordsContainer) return;
    dom.statementWordsContainer.innerHTML = '';

    cfg.statement.words.forEach((w) => {
      const span = document.createElement('span');
      span.className = 'word-span' + (w.highlight ? ' highlight' : '');
      span.textContent = w.text + ' ';
      dom.statementWordsContainer.appendChild(span);
    });
  }

  function updateEngineeringStatement() {
    if (!dom.statementSection) return;
    const rect = dom.statementSection.getBoundingClientRect();
    const windowH = state.viewportHeight;

    // Calculate how far the section has progressed through the viewport
    // Active window: from top entering to bottom leaving
    const progress = clamp((windowH - rect.top) / (windowH + rect.height * 0.5), 0, 1);
    const spans = dom.statementWordsContainer.querySelectorAll('.word-span');
    const totalWords = spans.length;

    spans.forEach((span, i) => {
      const wordThreshold = (i + 0.5) / totalWords;
      if (progress >= wordThreshold) {
        span.classList.add('active');
      } else {
        span.classList.remove('active');
      }
    });
  }

  /* ==========================================================================
     7. SECTION 03: DISMANTLE SECTION & TECHNICAL CALLOUTS
     ========================================================================== */
  function updateDismantleSection() {
    if (!dom.dismantleWrapper) return;
    const rect = dom.dismantleWrapper.getBoundingClientRect();
    const scrollDistance = dom.dismantleWrapper.offsetHeight - state.viewportHeight;
    const progress = clamp(-rect.top / scrollDistance, 0, 1);

    // Dismantle Progress Line
    if (dom.dismantleProgress) {
      dom.dismantleProgress.style.width = (progress * 100).toFixed(2) + '%';
    }

    // Target Frame
    const disCfg = state.isMobile ? cfg.dismantle.mobile : cfg.dismantle.desktop;
    state.dismantleTargetFrame = Math.round(progress * (disCfg.frameCount - 1));

    // Callouts reveal sequentially after 70% progress
    const calloutMap = [
      { el: dom.calloutFrame, cfg: cfg.dismantle.callouts[0] },
      { el: dom.calloutEngine, cfg: cfg.dismantle.callouts[1] },
      { el: dom.calloutSuspension, cfg: cfg.dismantle.callouts[2] },
      { el: dom.calloutLight, cfg: cfg.dismantle.callouts[3] }
    ];

    calloutMap.forEach((item) => {
      if (!item.el || !item.cfg) return;
      if (progress >= item.cfg.trigger) {
        item.el.classList.add('visible');
      } else {
        item.el.classList.remove('visible');
      }
    });
  }

  /* ==========================================================================
     8. SECTION 04: MOTORCYCLE LINEUP ACCORDION
     ========================================================================== */
  function initLineupAccordion() {
    if (!dom.lineupAccordion) return;
    dom.lineupAccordion.innerHTML = '';

    cfg.lineup.models.forEach((bike, index) => {
      const slide = document.createElement('article');
      slide.className = 'lineup-slide' + (index === state.activeLineupIndex ? ' active' : '');
      slide.setAttribute('role', 'tab');
      slide.setAttribute('aria-selected', index === state.activeLineupIndex ? 'true' : 'false');
      slide.setAttribute('tabindex', '0');
      slide.setAttribute('data-index', index);
      slide.setAttribute('data-cursor', 'CONFIGURE');

      // Swatches HTML
      const swatchesHtml = bike.colors
        .map((col) => `<span class="color-swatch" style="background-color: ${col};"></span>`)
        .join('');

      // Specs HTML
      const specsHtml = bike.specs
        .map((sp) => `
          <div class="spec-item">
            <span class="spec-label">${sp.label}</span>
            <span class="spec-val">${sp.value}</span>
          </div>
        `).join('');

      slide.innerHTML = `
        <!-- Collapsed Bar -->
        <div class="slide-collapsed-bar">
          <span class="slide-collapsed-num">${bike.number}</span>
          <span class="slide-collapsed-title">${bike.name}</span>
          <span class="slide-collapsed-indicator"></span>
        </div>

        <!-- Bike Image Layer -->
        <div class="slide-image-stage">
          <img class="slide-img" src="${bike.image}" alt="KTM ${bike.name}" loading="lazy">
        </div>

        <!-- Expanded Panel -->
        <div class="slide-expanded-panel">
          <div class="slide-info-top">
            <div class="slide-num-badge">${bike.number} / ARCHIVE</div>
            <h3 class="slide-name">${bike.name}</h3>
            <p class="slide-tagline">${bike.tagline}</p>
          </div>

          <div class="slide-bottom-bar">
            <div class="slide-specs-grid">
              ${specsHtml}
            </div>

            <div class="slide-swatches-and-cta">
              <div class="color-swatches" aria-label="Color Options">
                ${swatchesHtml}
              </div>
              <button class="slide-configure-btn" data-model="${bike.id}" data-cursor="RESERVE">
                <span>Configure</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Event handlers
      slide.addEventListener('click', () => {
        setActiveLineupSlide(index);
      });

      // Desktop hover with debounce
      slide.addEventListener('mouseenter', () => {
        if (state.isMobile) return;
        clearTimeout(state.lineupDebounceTimer);
        state.lineupDebounceTimer = setTimeout(() => {
          setActiveLineupSlide(index);
        }, 80);
      });

      // Keyboard navigation
      slide.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActiveLineupSlide(index);
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          const next = (index + 1) % cfg.lineup.models.length;
          focusLineupSlide(next);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prev = (index - 1 + cfg.lineup.models.length) % cfg.lineup.models.length;
          focusLineupSlide(prev);
        }
      });

      dom.lineupAccordion.appendChild(slide);
    });

    // Configure buttons delegate
    dom.lineupAccordion.addEventListener('click', (e) => {
      const btn = e.target.closest('.slide-configure-btn');
      if (btn) {
        e.stopPropagation();
        const modelId = btn.getAttribute('data-model');
        openReservationModal(modelId);
      }
    });
  }

  function setActiveLineupSlide(idx) {
    state.activeLineupIndex = idx;
    const slides = dom.lineupAccordion.querySelectorAll('.lineup-slide');
    slides.forEach((sl, i) => {
      if (i === idx) {
        sl.classList.add('active');
        sl.setAttribute('aria-selected', 'true');
      } else {
        sl.classList.remove('active');
        sl.setAttribute('aria-selected', 'false');
      }
    });
  }

  function focusLineupSlide(idx) {
    setActiveLineupSlide(idx);
    const slides = dom.lineupAccordion.querySelectorAll('.lineup-slide');
    if (slides[idx]) slides[idx].focus();
  }

  /* ==========================================================================
     9. NAVIGATION SCROLL SYSTEM
     Hides on scroll down, reappears on scroll up. Updates active link.
     ========================================================================== */
  function updateNavbar() {
    if (!dom.navbar) return;
    const currentY = window.scrollY || window.pageYOffset;

    // Scrolled background style
    if (currentY > 60) {
      dom.navbar.classList.add('nav-scrolled');
    } else {
      dom.navbar.classList.remove('nav-scrolled');
    }

    // Scroll direction behavior
    if (currentY > state.lastScrollY && currentY > 150) {
      dom.navbar.classList.add('nav-hidden');
    } else {
      dom.navbar.classList.remove('nav-hidden');
    }

    state.lastScrollY = currentY;

    // Active Section Link Highlight
    const sections = [
      { id: 'hero', link: dom.navLinks[0] },
      { id: 'engineering-statement', link: dom.navLinks[1] },
      { id: 'dismantle', link: dom.navLinks[2] },
      { id: 'lineup', link: dom.navLinks[3] }
    ];

    const scrollMid = currentY + state.viewportHeight * 0.4;
    sections.forEach(({ id, link }) => {
      const sec = document.getElementById(id);
      if (!sec || !link) return;
      const top = sec.offsetTop;
      const bottom = top + sec.offsetHeight;
      if (scrollMid >= top && scrollMid < bottom) {
        dom.navLinks.forEach((l) => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }

  /* ==========================================================================
     10. RESERVATION MODAL
     ========================================================================== */
  function initReservation() {
    if (dom.reserveCta) {
      dom.reserveCta.addEventListener('click', () => {
        openReservationModal('duke-390');
      });
    }

    if (dom.modalClose) {
      dom.modalClose.addEventListener('click', closeReservationModal);
    }

    if (dom.modal) {
      dom.modal.addEventListener('click', (e) => {
        if (e.target === dom.modal) closeReservationModal();
      });
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dom.modal && dom.modal.classList.contains('open')) {
        closeReservationModal();
      }
    });

    if (dom.reservationForm) {
      dom.reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const model = document.getElementById('res-model').value;
        const name = document.getElementById('res-name').value;
        alert(`Thank you, ${name}!\n\nYour priority allocation request for the ${model.toUpperCase()} has been submitted to KTM Apexor Concierge.`);
        closeReservationModal();
        dom.reservationForm.reset();
      });
    }
  }

  function openReservationModal(modelId) {
    if (!dom.modal) return;
    const select = document.getElementById('res-model');
    if (select && modelId) select.value = modelId;
    dom.modal.classList.add('open');
  }

  function closeReservationModal() {
    if (dom.modal) dom.modal.classList.remove('open');
  }

  /* ==========================================================================
     10.5. TAP-TO-RUN & AUTOMATIC RUN ENGINE
     Allows tapping on the motorcycle canvas or pills to run animations automatically.
     ========================================================================== */
  function initTapAutoRun() {
    // 1. Hero Canvas & Button Tapping
    function toggleHeroAutoRun(e) {
      if (e) e.stopPropagation();
      state.heroAutoRun = !state.heroAutoRun;

      const scrollDistance = dom.heroWrapper.offsetHeight - state.viewportHeight;
      const heroTop = dom.heroWrapper.offsetTop;
      const curScroll = window.scrollY || window.pageYOffset;
      const currentP = clamp((curScroll - heroTop) / scrollDistance, 0, 1);
      if (state.heroAutoRun && currentP >= 0.94) {
        window.scrollTo({ top: heroTop, behavior: 'auto' });
      }

      updateHeroAutoRunUI();
    }

    function updateHeroAutoRunUI() {
      if (!dom.heroAutoRunBtn) return;
      if (state.heroAutoRun) {
        dom.heroAutoRunBtn.classList.add('active');
        if (dom.heroAutoRunLabel) dom.heroAutoRunLabel.textContent = 'RUNNING [TAP TO PAUSE]';
        if (dom.heroAutoRunIcon) dom.heroAutoRunIcon.textContent = '❚❚';
      } else {
        dom.heroAutoRunBtn.classList.remove('active');
        if (dom.heroAutoRunLabel) dom.heroAutoRunLabel.textContent = 'TAP BIKE TO AUTO-RUN';
        if (dom.heroAutoRunIcon) dom.heroAutoRunIcon.textContent = '▶';
      }
    }

    if (dom.heroAutoRunBtn) {
      dom.heroAutoRunBtn.addEventListener('click', toggleHeroAutoRun);
    }
    if (dom.heroCanvas) {
      dom.heroCanvas.addEventListener('click', toggleHeroAutoRun);
    }

    // 2. Dismantle Canvas & Button Tapping
    function toggleDismantleAutoRun(e) {
      if (e) e.stopPropagation();
      const scrollDistance = dom.dismantleWrapper.offsetHeight - state.viewportHeight;
      const disTop = dom.dismantleWrapper.offsetTop;
      const curScroll = window.scrollY || window.pageYOffset;
      const currentP = clamp((curScroll - disTop) / scrollDistance, 0, 1);

      // Scroll to dismantle stage if not currently in view
      if (curScroll < disTop - 250 || curScroll > disTop + scrollDistance + 250) {
        window.scrollTo({ top: disTop + 10, behavior: 'smooth' });
      }

      state.dismantleAutoRun = true;
      if (currentP < 0.5) {
        state.dismantleAutoTarget = 0.98;
        if (dom.dismantleAutoRunLabel) dom.dismantleAutoRunLabel.textContent = 'DISMANTLING MACHINE...';
        if (dom.dismantleAutoRunIcon) dom.dismantleAutoRunIcon.textContent = '⤢';
      } else {
        state.dismantleAutoTarget = 0.02;
        if (dom.dismantleAutoRunLabel) dom.dismantleAutoRunLabel.textContent = 'REASSEMBLING...';
        if (dom.dismantleAutoRunIcon) dom.dismantleAutoRunIcon.textContent = '⤡';
      }
      if (dom.dismantleAutoRunBtn) dom.dismantleAutoRunBtn.classList.add('active');
    }

    if (dom.dismantleAutoRunBtn) {
      dom.dismantleAutoRunBtn.addEventListener('click', toggleDismantleAutoRun);
    }
    if (dom.dismantleCanvas) {
      dom.dismantleCanvas.addEventListener('click', toggleDismantleAutoRun);
    }

    // 3. Lineup Auto-Tour Tapping
    function toggleLineupTour(e) {
      if (e) e.stopPropagation();
      state.lineupTourActive = !state.lineupTourActive;

      if (state.lineupTourActive) {
        if (dom.lineupAutoTourBtn) dom.lineupAutoTourBtn.classList.add('active');
        if (dom.lineupTourLabel) dom.lineupTourLabel.textContent = 'TOURING [TAP TO STOP]';
        clearInterval(state.lineupTourTimer);
        state.lineupTourTimer = setInterval(() => {
          const total = cfg.lineup.models.length;
          const next = (state.activeLineupIndex + 1) % total;
          setActiveLineupSlide(next);
        }, cfg.rendering.lineupTourIntervalMs || 3200);
      } else {
        if (dom.lineupAutoTourBtn) dom.lineupAutoTourBtn.classList.remove('active');
        if (dom.lineupTourLabel) dom.lineupTourLabel.textContent = 'TAP TO AUTO-TOUR MODELS';
        clearInterval(state.lineupTourTimer);
      }
    }

    if (dom.lineupAutoTourBtn) {
      dom.lineupAutoTourBtn.addEventListener('click', toggleLineupTour);
    }

    // Gracefully pause auto-run when user manually scrolls
    window.addEventListener('wheel', () => {
      if (state.heroAutoRun) {
        state.heroAutoRun = false;
        updateHeroAutoRunUI();
      }
      if (state.dismantleAutoRun) {
        state.dismantleAutoRun = false;
        if (dom.dismantleAutoRunBtn) dom.dismantleAutoRunBtn.classList.remove('active');
        if (dom.dismantleAutoRunLabel) dom.dismantleAutoRunLabel.textContent = 'TAP BIKE TO DISMANTLE';
      }
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      const diff = Math.abs(e.touches[0].clientY - touchStartY);
      if (diff > 18) {
        if (state.heroAutoRun) {
          state.heroAutoRun = false;
          updateHeroAutoRunUI();
        }
        if (state.dismantleAutoRun) {
          state.dismantleAutoRun = false;
          if (dom.dismantleAutoRunBtn) dom.dismantleAutoRunBtn.classList.remove('active');
        }
      }
    }, { passive: true });
  }

  /* ==========================================================================
     11. MASTER RENDER & ANIMATION LOOP (60fps requestAnimationFrame)
     ========================================================================== */
  function tick() {
    // Auto-Run Hero Progression
    if (state.heroAutoRun && dom.heroWrapper) {
      const scrollDistance = dom.heroWrapper.offsetHeight - state.viewportHeight;
      const heroTop = dom.heroWrapper.offsetTop;
      const curScroll = window.scrollY || window.pageYOffset;
      let p = clamp((curScroll - heroTop) / scrollDistance, 0, 1);
      p += cfg.rendering.autoRunSpeedHero || 0.0022;

      if (p >= 0.98) {
        p = 0.98;
        state.heroAutoRun = false;
        if (dom.heroAutoRunBtn) dom.heroAutoRunBtn.classList.remove('active');
        if (dom.heroAutoRunLabel) dom.heroAutoRunLabel.textContent = 'TAP BIKE TO AUTO-RUN';
        if (dom.heroAutoRunIcon) dom.heroAutoRunIcon.textContent = '▶';
      }
      const newY = heroTop + p * scrollDistance;
      window.scrollTo(0, newY);
    }

    // Auto-Run Dismantle Progression
    if (state.dismantleAutoRun && dom.dismantleWrapper) {
      const scrollDistance = dom.dismantleWrapper.offsetHeight - state.viewportHeight;
      const disTop = dom.dismantleWrapper.offsetTop;
      const curScroll = window.scrollY || window.pageYOffset;
      let p = clamp((curScroll - disTop) / scrollDistance, 0, 1);

      if (state.dismantleAutoTarget > 0.5) {
        p += cfg.rendering.autoRunSpeedDismantle || 0.0038;
        if (p >= 0.98) {
          p = 0.98;
          state.dismantleAutoRun = false;
          if (dom.dismantleAutoRunBtn) dom.dismantleAutoRunBtn.classList.remove('active');
          if (dom.dismantleAutoRunLabel) dom.dismantleAutoRunLabel.textContent = 'TAP BIKE TO ASSEMBLE';
        }
      } else {
        p -= cfg.rendering.autoRunSpeedDismantle || 0.0038;
        if (p <= 0.02) {
          p = 0.0;
          state.dismantleAutoRun = false;
          if (dom.dismantleAutoRunBtn) dom.dismantleAutoRunBtn.classList.remove('active');
          if (dom.dismantleAutoRunLabel) dom.dismantleAutoRunLabel.textContent = 'TAP BIKE TO DISMANTLE';
        }
      }
      const newY = disTop + p * scrollDistance;
      window.scrollTo(0, newY);
    }

    // Smooth frame interpolation (lerp 0.15)
    state.heroCurrentFrame = lerp(state.heroCurrentFrame, state.heroTargetFrame, cfg.rendering.lerpFactor);
    state.dismantleCurrentFrame = lerp(state.dismantleCurrentFrame, state.dismantleTargetFrame, cfg.rendering.lerpFactor);

    const roundedHero = Math.round(state.heroCurrentFrame);
    const roundedDismantle = Math.round(state.dismantleCurrentFrame);

    // Redraw only when the rounded frame changes
    if (roundedHero !== state.heroLastRendered) {
      renderHeroCanvas(roundedHero);
    }

    if (roundedDismantle !== state.dismantleLastRendered) {
      renderDismantleCanvas(roundedDismantle);
    }

    requestAnimationFrame(tick);
  }

  /* ==========================================================================
     12. SCROLL & RESIZE LISTENERS
     ========================================================================== */
  function onScroll() {
    updateHeroSection();
    updateEngineeringStatement();
    updateDismantleSection();
    updateNavbar();
  }

  function onResize() {
    state.viewportWidth = window.innerWidth;
    state.viewportHeight = window.innerHeight;
    state.isMobile = window.innerWidth < cfg.rendering.breakpointMobile;

    resizeCanvas(dom.heroCanvas);
    resizeCanvas(dom.dismantleCanvas);

    // Force re-render with new canvas dimensions
    renderHeroCanvas(Math.round(state.heroCurrentFrame));
    renderDismantleCanvas(Math.round(state.dismantleCurrentFrame));

    onScroll();
  }

  /* ==========================================================================
     INITIALIZATION BOOTSTRAP
     ========================================================================== */
  function init() {
    // 1. Setup canvases
    resizeCanvas(dom.heroCanvas);
    resizeCanvas(dom.dismantleCanvas);

    // 2. Init components
    initFilmGrain();
    initCustomCursor();
    initEngineeringStatement();
    initLineupAccordion();
    initReservation();
    initTapAutoRun();

    // 3. Bind events
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // 4. Start preloader & render loop
    initPreloader();
    onScroll();
    requestAnimationFrame(tick);
  }

  // Run on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

