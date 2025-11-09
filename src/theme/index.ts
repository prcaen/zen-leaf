export const theme = {
  colors: {
    primary: '#3D5A3C', // Dark green
    primaryLight: '#6B8E68', // Medium green
    sage: '#D9E4D8', // Sage background
    sageLight: '#E8F0E7', // Light sage
    white: '#FFFFFF',
    text: '#2C2C2C',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    error: '#DC2626',
    warning: '#F59E0B',
    border: '#E5E7EB',
    cardBackground: '#F9FAFB',
    badge: '#FEE2E2',
    badgeText: '#991B1B',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
  },
};

export type Theme = typeof theme;

