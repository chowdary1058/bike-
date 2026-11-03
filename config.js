/**
 * KTM DUKE 390 — MIDNIGHT RACING EXPERIENCE
 * SCROLLTIDE-INSPIRED EDITORIAL CONFIGURATION
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

  // Hero Scrollytelling Sequence (Scrolltide Asymmetrical Split to Fullscreen Cinema)
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
        badge: 'KTM MOTORCYCLE EXPERIENCE',
        headline: 'UNLEASH THE DARK',
        subline: 'Forged for midnight asphalt. 399 cc of raw Austrian engineering piercing through the sleeping metropolis.',
        cta: 'EXPLORE DUKE 390',
        hint: 'TAP BIKE OR SCROLL TO COMMENCE RIDE',
        chapterLabel: '01/04'
      },
      {
        id: 'scene-2',
        range: [0.22, 0.42],
        badge: '02 // ILLUMINATION',
        headline: "It doesn't need the city's light.",
        subline: 'Twin split-LED projectors cutting clean tunnels through midnight fog.',
        chapterLabel: '02/04'
      },
      {
        id: 'scene-3',
        range: [0.48, 0.70],
        badge: '03 // PREDATOR AGILITY',
        headline: 'It brings its own.',
        subline: 'Sculpted trellis architecture tuned for predatory cornering on wet streets.',
        chapterLabel: '03/04'
      },
      {
        id: 'scene-4',
        range: [0.78, 0.95],
        badge: '04 // APEX MACHINE',
        headline: 'DUKE 390',
        specs: '399 CC · 44.2 HP · SINGLE CYLINDER · LIQUID COOLED',
        linkText: 'Explore Engineering Architecture',
        linkTarget: '#engineering-statement',
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
    fadeToNavyStart: 0.95
  },

  // Editorial Engineering Statement
  statement: {
    label: '02 — PHILOSOPHY',
    subheading: 'MINIMAL ARCHITECTURE / MAXIMUM INTENSITY',
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
    ],
    stats: [
      { value: '399', unit: 'CC', label: 'CYLINDER DISPLACEMENT' },
      { value: '44.2', unit: 'HP', label: 'MAXIMUM POWER' },
      { value: '39', unit: 'NM', label: 'PEAK TORQUE' },
      { value: '165', unit: 'KG', label: 'WET READY TO RACE' }
    ]
  },

  // Dismantle Scrollytelling Sequence
  dismantle: {
    wrapperHeightVh: 350,
    title: 'Look closer.',
    subtitle: 'EXPLODED MECHANICAL ARCHITECTURE',
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
    calloutsStartProgress: 0.70,
    callouts: [
      {
        id: 'callout-frame',
        title: 'FRAME',
        description: 'Lightweight orange steel trellis frame with bolt-on subframe.',
        x: 48,
        y: 40,
        trigger: 0.72,
        align: 'left'
      },
      {
        id: 'callout-engine',
        title: 'ENGINE',
        description: 'Liquid-cooled 399 cc single-cylinder with forged piston & ride-by-wire.',
        x: 52,
        y: 62,
        trigger: 0.78,
        align: 'right'
      },
      {
        id: 'callout-suspension',
        title: 'SUSPENSION',
        description: '43mm WP APEX upside-down fork with 5-click adjustable damping.',
        x: 68,
        y: 35,
        trigger: 0.84,
        align: 'left'
      },
      {
        id: 'callout-light',
        title: 'LIGHT',
        description: 'Aggressive twin-projector LED headlight signature.',
        x: 82,
        y: 28,
        trigger: 0.90,
        align: 'right'
      }
    ],
    deepDiveCards: [
      {
        category: 'POWERTRAIN',
        title: 'Next-Gen LC4c Engine',
        detail: 'Redesigned cylinder head, larger airbox, and optimised catalytic converter deliver razor-sharp throttle response.'
      },
      {
        category: 'CHASSIS',
        title: 'Curved Cast Swingarm',
        detail: 'Directly linked to the off-center rear shock absorber, clearing room for a larger underbelly muffler.'
      },
      {
        category: 'ERGONOMICS',
        title: 'Reduced Seat Height',
        detail: 'Standard 820 mm seat height with an optional 800 mm low setting gives the rider uncompromising control.'
      },
      {
        category: 'AVIONICS',
        title: '5-Inch Bonded Glass TFT',
        detail: 'Optical bonding eliminates glare while providing turn-by-turn navigation, lap timer, and Supermoto ABS toggle.'
      }
    ]
  },

  // Horizontal Scrolling Motorcycle Showcase
  lineup: {
    label: '03 — THE LINEUP',
    heading: 'Five ways to own the road.',
    subheading: 'SCROLL HORIZONTALLY TO EXPLORE THE FLEET',
    defaultActiveIndex: 0,
    models: [
      {
        id: 'duke-390',
        number: '01',
        name: 'DUKE 390',
        series: 'THE CORNER ROCKET',
        tagline: 'The street is yours.',
        description: 'The definitive naked benchmark. Ultra-light trellis chassis paired with explosive 399 cc torque.',
        image: 'assets/bikes/duke-390.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '399 CC' },
          { label: 'POWER', value: '44.2 HP' },
          { label: 'TORQUE', value: '39 NM' },
          { label: 'WET WEIGHT', value: '165 KG' }
        ],
        colors: ['#FF6600', '#070B16', '#CFE3FF', '#AEB8C5'],
        configureLink: '#reservation'
      },
      {
        id: 'duke-250',
        number: '02',
        name: 'DUKE 250',
        series: 'THE THRILL CHASER',
        tagline: 'Pure street aggression.',
        description: 'Compact streetfighter agility engineered for surgical precision through dense urban grids.',
        image: 'assets/bikes/duke-250.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '249 CC' },
          { label: 'POWER', value: '31 HP' },
          { label: 'TORQUE', value: '25 NM' },
          { label: 'WET WEIGHT', value: '162 KG' }
        ],
        colors: ['#FF6600', '#142B4D', '#070B16', '#8996A8'],
        configureLink: '#reservation'
      },
      {
        id: 'duke-200',
        number: '03',
        name: 'DUKE 200',
        series: 'THE LIGHTWEIGHT BRUTE',
        tagline: 'Born to dominate.',
        description: 'Raw, punchy single-cylinder character wrapped in razor-sharp satin black and orange frame styling.',
        image: 'assets/bikes/duke-200.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '199 CC' },
          { label: 'POWER', value: '25 HP' },
          { label: 'TORQUE', value: '19.5 NM' },
          { label: 'WET WEIGHT', value: '159 KG' }
        ],
        colors: ['#070B16', '#FF6600', '#1C3B63', '#AEB8C5'],
        configureLink: '#reservation'
      },
      {
        id: 'rc-390',
        number: '04',
        name: 'RC 390',
        series: 'MOTO3 RACING DNA',
        tagline: 'Precision meets performance.',
        description: 'Track-bred supersport aerodynamics with clip-on handlebars and race-derived wind-tunnel fairings.',
        image: 'assets/bikes/rc-390.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '373 CC' },
          { label: 'POWER', value: '43.5 HP' },
          { label: 'TORQUE', value: '37 NM' },
          { label: 'WET WEIGHT', value: '172 KG' }
        ],
        colors: ['#FF6600', '#F1F3F7', '#070B16', '#CFE3FF'],
        configureLink: '#reservation'
      },
      {
        id: 'adventure-390',
        number: '05',
        name: 'ADVENTURE 390',
        series: 'EXPLORER TOURING',
        tagline: 'Beyond the ordinary.',
        description: 'High-clearance long-travel WP suspension and touring ergonomics built to conquer untamed territories.',
        image: 'assets/bikes/adventure-390.webp',
        specs: [
          { label: 'DISPLACEMENT', value: '373 CC' },
          { label: 'POWER', value: '43.5 HP' },
          { label: 'TORQUE', value: '37 NM' },
          { label: 'WET WEIGHT', value: '177 KG' }
        ],
        colors: ['#FF6600', '#0B1B35', '#AEB8C5', '#070B16'],
        configureLink: '#reservation'
      }
    ]
  },

  // Reservation Portal
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
    lineupTourIntervalMs: 3400
  }
};

window.CONFIG = CONFIG;
