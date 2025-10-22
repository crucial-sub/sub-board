/**
 * 디자인 토큰 (Design Tokens)
 *
 * 프로젝트 전체에서 사용되는 디자인 토큰을 TypeScript로 정의합니다.
 * CSS 변수와 동기화되며, 타입 안전성을 제공합니다.
 */

// ============================================
// Colors
// ============================================

export const colors = {
  // Background
  bg: {
    app: '#eef2f9',
    surface: 'rgba(255, 255, 255, 0.72)',
  },

  // Text
  text: {
    primary: '#0f172a',
    secondary: '#4b5563',
    subtle: '#8b98ae',
  },

  // Border
  border: {
    default: 'rgba(15, 23, 42, 0.08)',
    muted: 'rgba(15, 23, 42, 0.04)',
  },

  // Brand
  brand: {
    default: '#0a84ff',
    hover: '#0066d6',
    weak: 'rgba(10, 132, 255, 0.15)',
  },

  // Accent
  accent: {
    cyan: '#5ac8fa',
    pink: '#ffd3e2',
  },

  // Section backgrounds (KOTA-inspired pastels)
  section: {
    lime: {
      start: '#d7e1d3',
      end: '#e5f0e0',
    },
    sky: {
      start: '#a8e1ec',
      end: '#c5eef6',
    },
    lavender: {
      start: '#c4b5f3',
      end: '#ddd4f9',
    },
    vanilla: {
      start: '#f8e5cb',
      end: '#fdf0de',
    },
    pink: {
      start: '#efb2d9',
      end: '#f8d4e9',
    },
  },
} as const;

// ============================================
// Typography
// ============================================

export const typography = {
  fontFamily: {
    sans: [
      'Pretendard Variable',
      'Pretendard',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'sans-serif',
    ].join(', '),
    mono: [
      'JetBrains Mono',
      'ui-monospace',
      'SFMono-Regular',
      'monospace',
    ].join(', '),
  },

  fontSize: {
    xs: '0.72rem',    // 11.52px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeight: {
    regular: 400,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ============================================
// Spacing
// ============================================

export const spacing = {
  0: '0px',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

// ============================================
// Border Radius
// ============================================

export const radius = {
  none: '0px',
  sm: '10px',
  md: '16px',
  lg: '22px',
  xl: '28px',
  '2xl': '36px',
  full: '9999px',
} as const;

// ============================================
// Shadows
// ============================================

export const shadows = {
  card: '0 25px 45px -24px rgba(15, 23, 42, 0.28)',
  popover: '0 40px 70px -32px rgba(15, 23, 42, 0.32)',
  button: '0 12px 24px -12px rgba(10, 132, 255, 0.45)',
  buttonOutline: '0 6px 16px -10px rgba(10, 132, 255, 0.35)',
  tag: '0 18px 30px -22px rgba(15, 23, 42, 0.45)',
  hover: {
    card: '0 30px 60px -20px rgba(15, 23, 42, 0.35)',
    testimonial: '0 35px 65px -25px rgba(15, 23, 42, 0.4)',
  },
} as const;

// ============================================
// Transitions
// ============================================

export const transitions = {
  default: {
    duration: '0.2s',
    easing: 'ease',
  },
  smooth: {
    duration: '0.5s',
    easing: 'ease-out',
  },
  button: {
    duration: '0.2s',
    easing: 'ease',
  },
} as const;

// ============================================
// Backdrop Filters
// ============================================

export const backdropFilters = {
  card: 'saturate(1.8) blur(32px)',
  glass: 'saturate(1.6) blur(26px)',
  tag: 'saturate(1.45) blur(20px)',
} as const;

// ============================================
// Gradients
// ============================================

export const gradients = {
  // Brand gradients
  brandPrimary: `linear-gradient(125deg, ${colors.brand.default}, ${colors.accent.cyan})`,
  brandText: `linear-gradient(120deg, ${colors.brand.default}, ${colors.accent.cyan})`,

  // Surface gradients
  surfaceCard: 'linear-gradient(145deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.72))',
  surfaceGlass: 'linear-gradient(150deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.64))',

  // Tag gradients
  tag: {
    default: 'linear-gradient(130deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.6))',
    hover: 'linear-gradient(135deg, rgba(10, 132, 255, 0.18), rgba(90, 200, 250, 0.12))',
    inner: 'linear-gradient(135deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.4))',
  },

  // Section gradients
  section: {
    lime: `linear-gradient(135deg, ${colors.section.lime.start} 0%, ${colors.section.lime.end} 100%)`,
    sky: `linear-gradient(135deg, ${colors.section.sky.start} 0%, ${colors.section.sky.end} 100%)`,
    lavender: `linear-gradient(135deg, ${colors.section.lavender.start} 0%, ${colors.section.lavender.end} 100%)`,
    vanilla: `linear-gradient(135deg, ${colors.section.vanilla.start} 0%, ${colors.section.vanilla.end} 100%)`,
    pink: `linear-gradient(135deg, ${colors.section.pink.start} 0%, ${colors.section.pink.end} 100%)`,
  },

  // Background gradient
  bodyBackground: `
    radial-gradient(120% 140% at 15% 20%, rgba(90, 200, 250, 0.25), transparent),
    radial-gradient(110% 150% at 85% 15%, rgba(255, 211, 226, 0.22), transparent),
    linear-gradient(165deg, #f7f9fd 0%, #edf1f8 50%, #f9fbff 100%)
  `.trim(),
} as const;

// ============================================
// Breakpoints
// ============================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '960px',
  xl: '1120px',
} as const;

// ============================================
// Z-Index Layers
// ============================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  skipLink: 999,
} as const;

// ============================================
// Animation Durations
// ============================================

export const animations = {
  duration: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
    verySlow: '0.8s',
  },

  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },

  float: {
    slow: 'float-slow 8s ease-in-out infinite',
    diagonal: 'float-diagonal 10s ease-in-out infinite',
    gentle: 'float-gentle 7s ease-in-out infinite',
  },
} as const;

// ============================================
// Type Exports
// ============================================

export type Color = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadow = typeof shadows;
export type Transition = typeof transitions;
export type BackdropFilter = typeof backdropFilters;
export type Gradient = typeof gradients;
export type Breakpoint = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Animation = typeof animations;
