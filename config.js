/**
 * KTM DUKE 390 — MIDNIGHT RACING EXPERIENCE
 * Global Configuration Object
 * All critical parameters, paths, thresholds, and content are centralized here.
 */

const CONFIG = {
  // Brand & Colour Tokens
  theme: {
    asphalt: '#070B16',
    navy: '#0B1B35',
    navyLight: '#142B4D',
    navyHighlight: '#1C3B63',
    ktmOrange: '#FF6600',
    orangeLight: '#FF8533',
    bone: '#F1F3F7',
    fog: '#8996A8',
    xenon: '#CFE3FF',
    taillight: '#E1251B',
    silver: '#AEB8C5',
    hairline: 'rgba(207, 227, 255, 0.16)'
  },

  // Hero Scrollytelling Sequence
  hero: {
    wrapperHeightVh: 600,
    desktop: {
      frameCount: 120,
      path: 'assets/frames/hero/frame_{index}.webp',
      startNumber: 1,
      padLength: 4,
      width: 1600,
      height: 900
    },
    mobile: {
      frameCount: 120,
      path: 'assets/frames/hero-mobile/frame_{index}.webp',
      startNumber: 1,
      padLength: 4,
      width: 960,
      height: 540
    },
    // Chapters mapped to normalized scroll progress [0.0 - 1.0]
    chapters: [
      {
        id: 'scene-1',
        range: [0.0, 0.18],
        headline: 'APEXOR',
        subline: 'The city is asleep.',
        hint: 'TAP BIKE OR SCROLL TO WAKE IT',
        chapterLabel: '01/04'
      },
      {
        id: 'scene-2',
        range: [0.22, 0.42],
        headline: "It doesn't need the city's light.",
        subline: 'Twin LED projectors cutting through midnight fog.',
        chapterLabel: '02/04'
      },
      {
        id: 'scene-3',
        range: [0.48, 0.70],
        headline: 'It brings its own.',
        subline: 'Sculpted for predatory agility on wet asphalt.',
        chapterLabel: '03/04'
      },
      {
        id: 'scene-4',
        range: [0.78, 0.95],
        headline: 'DUKE 390',
        specs: '399 CC · SINGLE CYLINDER · LIQUID COOLED',
        linkText: 'Discover the Duke',
        linkTarget: '#engineering',
        chapterLabel: '04/04'
      }
    ],
    hud: {
      speedMax: 118,
      speedUnit: 'KM/H',
      distanceMax: 4.2,
      distanceUnit: 'KM',
      gearMap: [
        { progress: 0.15, gear: 'N' },
        { progress: 0.35, gear: '1' },
        { progress: 0.55, gear: '2' },
        { progress: 0.75, gear: '3' },
        { progress: 0.90, gear: '4' },
        { progress: 1.00, gear: '5' }
      ]
    },
    fadeToNavyStart: 0.95 // Last 5% fades to solid midnight navy
  },

  // Engineering Statement
  statement: {
    label: '02 — ENGINEERING',
    words: [
      { text: 'Every', highlight: false },
      { text: 'part', highlight: false },
      { text: 'was', highlight: false },
      { text: 'designed', highlight: false },
      { text: 'to', highlight: false },
      { text: 'disappear', highlight: true },
      { text: 'into', highlight: false },
      { text: 'one', highlight: false },
      { text: 'line', highlight: false },
      { text: 'of', highlight: false },
      { text: 'light.', highlight: true }
    ]
  },

  // Dismantle Scrollytelling Sequence
  dismantle: {
    wrapperHeightVh: 350,
    title: 'Look closer.',
    desktop: {
      frameCount: 80,
      path: 'assets/frames/dismantle/frame_{index}.webp',
      startNumber: 1,
      padLength: 4,
      width: 1600,
      height: 900
    },
    mobile: {
      frameCount: 80,
      path: 'assets/frames/dismantle-mobile/frame_{index}.webp',
      startNumber: 1,
      padLength: 4,
      width: 960,
      height: 540
    },
    // Technical Callouts revealed sequentially after 70% progress
    calloutsStartProgress: 0.70,
    callouts: [
      {
        id: 'callout-frame',
        title: 'FRAME',
        description: 'Lightweight orange steel trellis frame.',
        // Coordinates in percentages relative to stage
        x: 48,
        y: 40,
        trigger: 0.72,
        align: 'left'
      },
      {
        id: 'callout-engine',
        title: 'ENGINE',
        description: 'Liquid-cooled single-cylinder engine.',
        x: 52,
        y: 62,
        trigger: 0.78,
        align: 'right'
      },
      {
        id: 'callout-suspension',
        title: 'SUSPENSION',
        description: 'Precision-tuned WP suspension system.',
        x: 68,
        y: 35,
        trigger: 0.84,
        align: 'left'
      },
      {
        id: 'callout-light',
        title: 'LIGHT',
        description: 'Aggressive LED headlight signature.',
        x: 82,
        y: 28,
        trigger: 0.90,
        align: 'right'
      }
    ]
  },

  // Motorcycle Lineup Accordion
  lineup: {
    label: '03 — THE LINEUP',
    heading: 'Five ways to own the road.',
    defaultActiveIndex: 0,
    models: [
      {
        id: 'duke-390',
        number: '01',
        name: 'DUKE 390',
        tagline: 'The street is yours.',
        image: 'assets/bikes/duke-390.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '399 CC' },
          { label: 'ARCHITECTURE', value: 'SINGLE CYLINDER' },
          { label: 'SIGNATURE', value: 'KTM ORANGE' }
        ],
        colors: ['#FF6600', '#070B16', '#CFE3FF', '#AEB8C5'],
        configureLink: '#reserve'
      },
      {
        id: 'duke-250',
        number: '02',
        name: 'DUKE 250',
        tagline: 'Pure street aggression.',
        image: 'assets/bikes/duke-250.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '249 CC' },
          { label: 'ARCHITECTURE', value: 'STREETFIGHTER' },
          { label: 'SIGNATURE', value: 'KTM ORANGE' }
        ],
        colors: ['#FF6600', '#142B4D', '#070B16', '#8996A8'],
        configureLink: '#reserve'
      },
      {
        id: 'duke-200',
        number: '03',
        name: 'DUKE 200',
        tagline: 'Born to dominate.',
        image: 'assets/bikes/duke-200.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '199 CC' },
          { label: 'ARCHITECTURE', value: 'STREETFIGHTER' },
          { label: 'SIGNATURE', value: 'KTM ORANGE' }
        ],
        colors: ['#070B16', '#FF6600', '#1C3B63', '#AEB8C5'],
        configureLink: '#reserve'
      },
      {
        id: 'rc-390',
        number: '04',
        name: 'RC 390',
        tagline: 'Precision meets performance.',
        image: 'assets/bikes/rc-390.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '373 CC' },
          { label: 'ARCHITECTURE', value: 'SUPERSPORT' },
          { label: 'SIGNATURE', value: 'KTM ORANGE' }
        ],
        colors: ['#FF6600', '#F1F3F7', '#070B16', '#CFE3FF'],
        configureLink: '#reserve'
      },
      {
        id: 'adventure-390',
        number: '05',
        name: 'ADVENTURE 390',
        tagline: 'Beyond the ordinary.',
        image: 'assets/bikes/adventure-390.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '373 CC' },
          { label: 'ARCHITECTURE', value: 'TOURING' },
          { label: 'SIGNATURE', value: 'KTM ORANGE' }
        ],
        colors: ['#FF6600', '#0B1B35', '#AEB8C5', '#070B16'],
        configureLink: '#reserve'
      }
    ]
  },

  // Reservation Section
  reservation: {
    heading: 'Own the night.',
    subheading: 'Precision engineering. Unmistakable presence. Pure KTM attitude.',
    ctaText: 'RESERVE YOUR DUKE',
    destination: 'https://www.ktm.com/'
  },

  // Animation & Rendering Controls
  rendering: {
    lerpFactor: 0.15,
    maxDpr: 2,
    breakpointMobile: 768,
    cursorLerp: 0.18,
    grainFps: 8,
    autoRunSpeedHero: 0.0022,
    autoRunSpeedDismantle: 0.0038,
    lineupTourIntervalMs: 3200
  }
};

// Export to global scope
window.CONFIG = CONFIG;

