/**
 * KTM DUKE 390 — MIDNIGHT RACING EXPERIENCE (APEXOR)
 * SCROLLTIDE-INSPIRED CORE ENGINE
 * Vanilla JavaScript implementation fulfilling all technical & cinematic specifications.
 */

(function () {
  'use strict';

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
    lineupTourActive: false,
    lineupTourTimer: null,
    lineupProgress: 0,

    // Tap Auto-Run Engine
    heroAutoRun: false,
    dismantleAutoRun: false,
    dismantleAutoTarget: 1.0,

    // Cursor
    cursorX: -100,
    cursorY: -100,
    targetCursorX: -100,
    targetCursorY: -100
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
    heroQuickAutoRunBtn: document.getElementById('hero-quick-autorun-btn'),
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

    // Horizontal Lineup Section
    lineupWrapper: document.getElementById('lineup'),
    horizontalTrackContainer: document.getElementById('horizontal-track-container'),
    horizontalTrack: document.getElementById('horizontal-track'),
    lineupHorizontalProgress: document.getElementById('lineup-horizontal-progress'),
    lineupPrevBtn: document.getElementById('lineup-prev-btn'),
    lineupNextBtn: document.getElementById('lineup-next-btn'),
    lineupDotsContainer: document.getElementById('lineup-dots'),
    lineupAutoTourBtn: document.getElementById('lineup-autotour-btn'),
    lineupTourLabel: document.getElementById('lineup-tour-label'),

    // Reservation & Tabs
    reservationPreviewImg: document.getElementById('reservation-preview-img'),
    reservationTabs: document.querySelectorAll('.res-tab'),
    reserveCta: document.getElementById('reserve-cta'),
    modal: document.getElementById('reservation-modal'),
    modalClose: document.getElementById('modal-close'),
    reservationForm: document.getElementById('reservation-form'),

    // Footer
    footerClock: document.getElementById('footer-clock')
  };

  /* ==========================================================================
     UTILITIES
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

    state.heroFrames = new Array(heroCfg.frameCount);

    function checkInitialReady() {
      initialLoaded++;
      const pct = Math.min(100, Math.round((initialLoaded / initialBatchCount) * 100));
      updatePreloaderDisplay(pct, 'OPTIMIZING OPTICS [' + initialLoaded + '/' + initialBatchCount + ']');

      if (initialLoaded >= initialBatchCount) {
        if (dom.preloaderBar) dom.preloaderBar.classList.add('flare');
        if (dom.preloaderStatus) dom.preloaderStatus.textContent = 'SYSTEMS LIVE // APEX READY';

        setTimeout(() => {
          if (dom.preloader) dom.preloader.classList.add('loaded');
          renderHeroCanvas(0);
          renderDismantleCanvas(0);
          loadRemainingHeroFrames();
        }, 350);
      }
    }

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
        checkInitialReady();
      };
    }
  }

  function loadRemainingHeroFrames() {
    const heroCfg = state.isMobile ? cfg.hero.mobile : cfg.hero.desktop;
    for (let i = 41; i <= heroCfg.frameCount; i++) {
      const img = new Image();
      const path = getFramePath(heroCfg.path, i, heroCfg.padLength);
      img.src = path;
      img.onload = () => {
        state.heroFrames[i - 1] = img;
        state.heroLoadedCount++;
        if (state.heroLoadedCount >= heroCfg.frameCount) {
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

  function getNearestLoadedFrame(frames, targetIdx) {
    if (frames[targetIdx]) return frames[targetIdx];
    for (let offset = 1; offset < frames.length; offset++) {
      if (targetIdx - offset >= 0 && frames[targetIdx - offset]) return frames[targetIdx - offset];
      if (targetIdx + offset < frames.length && frames[targetIdx + offset]) return frames[targetIdx + offset];
    }
    return null;
  }

  /* ==========================================================================
     2. CANVAS DRAWING ROUTINES
     ========================================================================== */
  function drawImageFit(ctx, img, canvasW, canvasH) {
    if (!img) return;
    const isPortrait = canvasH > canvasW;
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasW / canvasH;
    let renderW, renderH, offsetX, offsetY;

    if (isPortrait) {
      if (canvasRatio > imgRatio) {
        renderH = canvasH;
        renderW = canvasH * imgRatio;
      } else {
        renderW = canvasW;
        renderH = canvasW / imgRatio;
      }
    } else {
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
     3. FILM GRAIN
     ========================================================================== */
  function initFilmGrain() {
    if (!dom.grainCanvas) return;
    const canvas = dom.grainCanvas;
    const ctx = canvas.getContext('2d');
    const grainW = 256;
    const grainH = 256;

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

    setInterval(() => {
      generateNoise();
      const pattern = ctx.createPattern(offscreen, 'repeat');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 1000 / cfg.rendering.grainFps);
  }

  /* ==========================================================================
     4. CUSTOM CURSOR
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

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[data-cursor], a, button, [role="tab"], .lineup-card');
      if (target) {
        document.body.classList.add('cursor-hover');
        const label = target.getAttribute('data-cursor') ||
                     (target.tagName === 'A' ? 'VIEW' :
                      target.tagName === 'BUTTON' ? 'OPEN' : 'EXPLORE');
        if (dom.cursorLabel) dom.cursorLabel.textContent = label;
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-cursor], a, button, [role="tab"], .lineup-card');
      if (target) {
        document.body.classList.remove('cursor-hover');
        if (dom.cursorLabel) dom.cursorLabel.textContent = '';
      }
    });

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
     5. HERO SECTION & TELEMETRY
     ========================================================================== */
  function updateHeroSection() {
    if (!dom.heroWrapper) return;
    const rect = dom.heroWrapper.getBoundingClientRect();
    const scrollDistance = dom.heroWrapper.offsetHeight - state.viewportHeight;
    const progress = clamp(-rect.top / scrollDistance, 0, 1);

    if (dom.heroProgress) {
      dom.heroProgress.style.width = (progress * 100).toFixed(2) + '%';
    }

    const heroCfg = state.isMobile ? cfg.hero.mobile : cfg.hero.desktop;
    state.heroTargetFrame = Math.round(progress * (heroCfg.frameCount - 1));

    const currentSpeed = Math.round(progress * cfg.hero.hud.speedMax);
    const currentDist = (progress * cfg.hero.hud.distanceMax).toFixed(1);

    if (dom.hudSpeed) dom.hudSpeed.textContent = padNumber(currentSpeed, 3);
    if (dom.hudDistance) dom.hudDistance.textContent = currentDist;

    let activeGear = 'N';
    for (const g of cfg.hero.hud.gearMap) {
      if (progress >= g.progress) activeGear = g.gear;
    }
    if (dom.hudGear) dom.hudGear.textContent = activeGear;

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
     6. EDITORIAL STATEMENT REVEAL
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
     7. DISMANTLE SECTION & CALLOUTS
     ========================================================================== */
  function updateDismantleSection() {
    if (!dom.dismantleWrapper) return;
    const rect = dom.dismantleWrapper.getBoundingClientRect();
    const scrollDistance = dom.dismantleWrapper.offsetHeight - state.viewportHeight;
    const progress = clamp(-rect.top / scrollDistance, 0, 1);

    if (dom.dismantleProgress) {
      dom.dismantleProgress.style.width = (progress * 100).toFixed(2) + '%';
    }

    const disCfg = state.isMobile ? cfg.dismantle.mobile : cfg.dismantle.desktop;
    state.dismantleTargetFrame = Math.round(progress * (disCfg.frameCount - 1));

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
     8. SCROLLTIDE HORIZONTAL SCROLLING SHOWCASE & GALLERY
     ========================================================================== */
  function initHorizontalLineup() {
    if (!dom.horizontalTrack || !dom.lineupDotsContainer) return;
    dom.horizontalTrack.innerHTML = '';
    dom.lineupDotsContainer.innerHTML = '';

    cfg.lineup.models.forEach((bike, index) => {
      // 1. Create Dot Indicator
      const dot = document.createElement('span');
      dot.className = 'lineup-dot' + (index === 0 ? ' active' : '');
      dot.setAttribute('data-index', index);
      dot.addEventListener('click', () => {
        scrollToLineupIndex(index);
      });
      dom.lineupDotsContainer.appendChild(dot);

      // 2. Create Card
      const card = document.createElement('article');
      card.className = 'lineup-card';
      card.setAttribute('data-index', index);
      card.setAttribute('data-cursor', 'EXPLORE');

      const specsHtml = bike.specs.map((sp) => `
        <div class="card-spec-item">
          <span class="card-sp-label">${sp.label}</span>
          <span class="card-sp-val">${sp.value}</span>
        </div>
      `).join('');

      const swatchesHtml = bike.colors.map((col) => `
        <span class="card-swatch" style="background-color: ${col};"></span>
      `).join('');

      card.innerHTML = `
        <div class="card-image-box">
          <span class="card-num-badge">${bike.number} // FLEET</span>
          <img class="card-img" src="${bike.image}" alt="KTM ${bike.name}" loading="lazy">
        </div>
        <div class="card-content">
          <div class="card-header-row">
            <div>
              <span class="card-series-tag">${bike.series}</span>
              <h3 class="card-title">${bike.name}</h3>
            </div>
            <div class="card-swatches">
              ${swatchesHtml}
            </div>
          </div>
          <p class="card-tagline">${bike.description}</p>
          <div class="card-specs-row">
            ${specsHtml}
          </div>
          <div class="card-footer-row">
            <span class="card-status-pill">AVAILABLE FOR ALLOCATION</span>
            <button class="card-cta-btn" data-model="${bike.id}" data-cursor="RESERVE">
              <span>Configure Model</span>
              <span>&rarr;</span>
            </button>
          </div>
        </div>
      `;

      card.querySelector('.card-cta-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openReservationModal(bike.id);
      });

      card.addEventListener('click', () => {
        updateReservationPreview(bike.id);
        openReservationModal(bike.id);
      });

      dom.horizontalTrack.appendChild(card);
    });

    // Arrow buttons
    if (dom.lineupPrevBtn) {
      dom.lineupPrevBtn.addEventListener('click', () => {
        const nextIdx = Math.max(0, state.activeLineupIndex - 1);
        scrollToLineupIndex(nextIdx);
      });
    }

    if (dom.lineupNextBtn) {
      dom.lineupNextBtn.addEventListener('click', () => {
        const nextIdx = Math.min(cfg.lineup.models.length - 1, state.activeLineupIndex + 1);
        scrollToLineupIndex(nextIdx);
      });
    }

    // Auto-Tour Button
    if (dom.lineupAutoTourBtn) {
      dom.lineupAutoTourBtn.addEventListener('click', toggleLineupTour);
    }
  }

  function scrollToLineupIndex(index) {
    if (!dom.lineupWrapper) return;
    const total = cfg.lineup.models.length;
    const targetProgress = index / (total - 1);
    const scrollDist = dom.lineupWrapper.offsetHeight - state.viewportHeight;
    const targetY = dom.lineupWrapper.offsetTop + targetProgress * scrollDist;
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  }

  function toggleLineupTour(e) {
    if (e) e.stopPropagation();
    state.lineupTourActive = !state.lineupTourActive;

    if (state.lineupTourActive) {
      if (dom.lineupAutoTourBtn) dom.lineupAutoTourBtn.classList.add('active');
      if (dom.lineupTourLabel) dom.lineupTourLabel.textContent = 'TOURING FLEET [STOP]';
      clearInterval(state.lineupTourTimer);
      state.lineupTourTimer = setInterval(() => {
        const total = cfg.lineup.models.length;
        const next = (state.activeLineupIndex + 1) % total;
        scrollToLineupIndex(next);
      }, cfg.rendering.lineupTourIntervalMs || 3400);
    } else {
      if (dom.lineupAutoTourBtn) dom.lineupAutoTourBtn.classList.remove('active');
      if (dom.lineupTourLabel) dom.lineupTourLabel.textContent = 'AUTO-TOUR ALL MODELS';
      clearInterval(state.lineupTourTimer);
    }
  }

  function updateHorizontalLineup() {
    if (!dom.lineupWrapper || !dom.horizontalTrack || state.isMobile) return;
    const rect = dom.lineupWrapper.getBoundingClientRect();
    const scrollDist = dom.lineupWrapper.offsetHeight - state.viewportHeight;
    const progress = clamp(-rect.top / scrollDist, 0, 1);
    state.lineupProgress = progress;

    if (dom.lineupHorizontalProgress) {
      dom.lineupHorizontalProgress.style.width = (progress * 100).toFixed(2) + '%';
    }

    const containerW = dom.horizontalTrackContainer.clientWidth;
    const trackW = dom.horizontalTrack.scrollWidth;
    const maxTranslate = Math.max(0, trackW - containerW + 128);
    const currentTranslate = progress * maxTranslate;

    dom.horizontalTrack.style.transform = `translate3d(${-currentTranslate}px, 0, 0)`;

    // Update active index & dots
    const total = cfg.lineup.models.length;
    const activeIdx = Math.min(total - 1, Math.round(progress * (total - 1)));
    if (activeIdx !== state.activeLineupIndex) {
      state.activeLineupIndex = activeIdx;
      const dots = dom.lineupDotsContainer.querySelectorAll('.lineup-dot');
      dots.forEach((dot, i) => {
        if (i === activeIdx) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    }
  }

  /* ==========================================================================
     9. TAP AUTO-RUN ENGINE
     ========================================================================== */
  function initTapAutoRun() {
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

    if (dom.heroAutoRunBtn) dom.heroAutoRunBtn.addEventListener('click', toggleHeroAutoRun);
    if (dom.heroQuickAutoRunBtn) dom.heroQuickAutoRunBtn.addEventListener('click', toggleHeroAutoRun);
    if (dom.heroCanvas) dom.heroCanvas.addEventListener('click', toggleHeroAutoRun);

    function toggleDismantleAutoRun(e) {
      if (e) e.stopPropagation();
      const scrollDistance = dom.dismantleWrapper.offsetHeight - state.viewportHeight;
      const disTop = dom.dismantleWrapper.offsetTop;
      const curScroll = window.scrollY || window.pageYOffset;
      const currentP = clamp((curScroll - disTop) / scrollDistance, 0, 1);

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

    if (dom.dismantleAutoRunBtn) dom.dismantleAutoRunBtn.addEventListener('click', toggleDismantleAutoRun);
    if (dom.dismantleCanvas) dom.dismantleCanvas.addEventListener('click', toggleDismantleAutoRun);

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
     10. NAVIGATION & FOOTER CLOCK
     ========================================================================== */
  function updateNavbar() {
    if (!dom.navbar) return;
    const currentY = window.scrollY || window.pageYOffset;

    if (currentY > 60) dom.navbar.classList.add('nav-scrolled');
    else dom.navbar.classList.remove('nav-scrolled');

    if (currentY > state.lastScrollY && currentY > 150) dom.navbar.classList.add('nav-hidden');
    else dom.navbar.classList.remove('nav-hidden');

    state.lastScrollY = currentY;

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

  function initFooterClock() {
    if (!dom.footerClock) return;
    function updateClock() {
      const now = new Date();
      // Format time in Vienna / Austria timezone (KTM headquarters)
      const options = { timeZone: 'Europe/Vienna', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      dom.footerClock.textContent = 'VIENNA TIME: ' + now.toLocaleTimeString('en-GB', options);
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* ==========================================================================
     11. RESERVATION SECTION & MODAL
     ========================================================================== */
  function initReservation() {
    // Model selector tabs
    if (dom.reservationTabs) {
      dom.reservationTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
          dom.reservationTabs.forEach((t) => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');
          const modelId = tab.getAttribute('data-model');
          updateReservationPreview(modelId);
        });
      });
    }

    if (dom.reserveCta) {
      dom.reserveCta.addEventListener('click', () => {
        const activeTab = document.querySelector('.res-tab.active');
        const modelId = activeTab ? activeTab.getAttribute('data-model') : 'duke-390';
        openReservationModal(modelId);
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

  function updateReservationPreview(modelId) {
    if (!dom.reservationPreviewImg) return;
    const modelData = cfg.lineup.models.find((m) => m.id === modelId) || cfg.lineup.models[0];
    dom.reservationPreviewImg.style.opacity = '0.4';
    setTimeout(() => {
      dom.reservationPreviewImg.src = modelData.image;
      dom.reservationPreviewImg.style.opacity = '1';
    }, 150);
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
     12. MASTER TICK LOOP (60fps requestAnimationFrame)
     ========================================================================== */
  function tick() {
    // Auto-Run Hero
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

    // Auto-Run Dismantle
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

    // Lerp Canvas Frames
    state.heroCurrentFrame = lerp(state.heroCurrentFrame, state.heroTargetFrame, cfg.rendering.lerpFactor);
    state.dismantleCurrentFrame = lerp(state.dismantleCurrentFrame, state.dismantleTargetFrame, cfg.rendering.lerpFactor);

    const roundedHero = Math.round(state.heroCurrentFrame);
    const roundedDismantle = Math.round(state.dismantleCurrentFrame);

    if (roundedHero !== state.heroLastRendered) {
      renderHeroCanvas(roundedHero);
    }

    if (roundedDismantle !== state.dismantleLastRendered) {
      renderDismantleCanvas(roundedDismantle);
    }

    requestAnimationFrame(tick);
  }

  /* ==========================================================================
     13. SCROLL & RESIZE LISTENERS
     ========================================================================== */
  function onScroll() {
    updateHeroSection();
    updateEngineeringStatement();
    updateDismantleSection();
    updateHorizontalLineup();
    updateNavbar();
  }

  function onResize() {
    state.viewportWidth = window.innerWidth;
    state.viewportHeight = window.innerHeight;
    state.isMobile = window.innerWidth < cfg.rendering.breakpointMobile;

    resizeCanvas(dom.heroCanvas);
    resizeCanvas(dom.dismantleCanvas);

    renderHeroCanvas(Math.round(state.heroCurrentFrame));
    renderDismantleCanvas(Math.round(state.dismantleCurrentFrame));

    onScroll();
  }

  /* ==========================================================================
     INITIALIZATION BOOTSTRAP
     ========================================================================== */
  function init() {
    resizeCanvas(dom.heroCanvas);
    resizeCanvas(dom.dismantleCanvas);

    initFilmGrain();
    initCustomCursor();
    initEngineeringStatement();
    initHorizontalLineup();
    initReservation();
    initTapAutoRun();
    initFooterClock();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    initPreloader();
    onScroll();
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
