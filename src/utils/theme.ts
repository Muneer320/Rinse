export const Colors = {
  background: '#0D0D0D',
  surface: '#1A1A1A',
  surfaceLight: '#2A2A2A',
  surfaceElevated: '#333333',
  primary: '#6C63FF',
  primaryGlow: 'rgba(108, 99, 255, 0.2)',
  primaryDim: 'rgba(108, 99, 255, 0.1)',
  delete: '#FF3B30',
  deleteGlow: 'rgba(255, 59, 48, 0.2)',
  deleteDim: 'rgba(255, 59, 48, 0.1)',
  keep: '#34C759',
  keepGlow: 'rgba(52, 199, 89, 0.2)',
  keepDim: 'rgba(52, 199, 89, 0.1)',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#5A5A5E',
  border: '#333333',
  borderLight: '#1A1A1A',
  glass: 'rgba(255, 255, 255, 0.05)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8, md: 16, lg: 24, xl: 32, full: 9999,
} as const;

export const Typography = {
  title: { fontSize: 32, fontWeight: '700' as const },
  heading: { fontSize: 24, fontWeight: '600' as const },
  subheading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  stat: { fontSize: 36, fontWeight: '700' as const },
  statLarge: { fontSize: 48, fontWeight: '800' as const },
  badge: { fontSize: 12, fontWeight: '600' as const },
} as const;

export const Layout = {
  cardWidth: '100%',
  cardHeight: '70%',
  cardBorderRadius: 24,
  swipeThreshold: 0.33,
  cardPeekScale: 0.95,
  cardPeekOffset: 20,
} as const;
