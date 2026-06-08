/**
 * Next Read — Design Tokens (TypeScript mirror of tokens.css)
 * Use these for JS logic and Tailwind @theme configuration.
 * Keep in sync with tokens.css — this file is NOT the source of truth.
 */

export const colors = {
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#2d8a56',
    600: '#1a6b3c',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  warm: {
    cream: '#fefcf3',
    warmGray: '#f7f5f0',
    amber400: '#fbbf24',
    amber500: '#f59e0b',
  },
  semantic: {
    success: '#2d8a56',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

export const fonts = {
  display: "'DM Serif Display', Georgia, serif",
  primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const;

export const radius = {
  sm: '6px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 8px 24px rgba(0,0,0,0.12)',
} as const;

export const layout = {
  maxContentWidth: '480px',
  breakpointTablet: '640px',
  breakpointDesktop: '1024px',
} as const;

export const motion = {
  durationMicro: '150ms',
  durationTransition: '250ms',
  durationEntrance: '300ms',
  easingOut: 'ease-out',
  easingInOut: 'ease-in-out',
} as const;

/**
 * Tailwind v4 @theme block values.
 * In frontend/src/styles.css:
 *
 *   @theme {
 *     --color-green-500: #2d8a56;
 *     --color-green-600: #1a6b3c;
 *     ... (mirror every token here)
 *   }
 */
export const tailwindTheme = {
  colors: {
    'green-50': colors.green[50],
    'green-100': colors.green[100],
    'green-200': colors.green[200],
    'green-300': colors.green[300],
    'green-400': colors.green[400],
    'green-500': colors.green[500],
    'green-600': colors.green[600],
    'green-700': colors.green[700],
    'green-800': colors.green[800],
    'green-900': colors.green[900],
    'neutral-0': colors.neutral[0],
    'neutral-50': colors.neutral[50],
    'neutral-100': colors.neutral[100],
    'neutral-200': colors.neutral[200],
    'neutral-300': colors.neutral[300],
    'neutral-400': colors.neutral[400],
    'neutral-500': colors.neutral[500],
    'neutral-600': colors.neutral[600],
    'neutral-700': colors.neutral[700],
    'neutral-800': colors.neutral[800],
    'neutral-900': colors.neutral[900],
    cream: colors.warm.cream,
    'warm-gray': colors.warm.warmGray,
    'amber-400': colors.warm.amber400,
    'amber-500': colors.warm.amber500,
    success: colors.semantic.success,
    warning: colors.semantic.warning,
    error: colors.semantic.error,
    info: colors.semantic.info,
  },
} as const;
