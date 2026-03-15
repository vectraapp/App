// Vectra Theme System - Light & Dark Mode Support

// Dark Theme Colors
export const DARK_COLORS = {
  // Backgrounds
  background: {
    primary: '#0B0F14',      // Obsidian Black - main app background
    secondary: '#111827',     // Midnight Slate - cards, panels
    tertiary: '#0F172A',      // Notes panel background
    navbar: '#020617',        // Navigation background
  },

  // Brand Colors
  brand: {
    primary: '#2563EB',       // Vectra Blue - buttons, links, highlights
    secondary: '#22D3EE',     // Vectra Teal - AI features, icons
    accent: '#10B981',        // Emerald - success states
    warning: '#F59E0B',       // Amber - attention messages
    error: '#EF4444',         // Crimson - errors
  },

  // Text
  text: {
    primary: '#E5E7EB',       // Soft White - headings
    secondary: '#CBD5E1',     // Body text
    muted: '#94A3B8',         // Helper text, labels
    inactive: '#64748B',      // Inactive nav items
  },

  // UI Elements
  border: '#1E293B',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Tint backgrounds (semi-transparent brand colors for icon containers, badges, etc.)
  tint: {
    primary: 'rgba(37, 99, 235, 0.15)',     // Blue tint
    primaryLight: 'rgba(37, 99, 235, 0.1)',  // Lighter blue tint
    secondary: 'rgba(34, 211, 238, 0.15)',   // Cyan tint
    secondaryLight: 'rgba(34, 211, 238, 0.08)', // Lighter cyan tint
    accent: 'rgba(16, 185, 129, 0.15)',      // Green tint
    warning: 'rgba(245, 158, 11, 0.15)',     // Amber tint
    warningLight: 'rgba(245, 158, 11, 0.1)', // Lighter amber tint
    error: 'rgba(239, 68, 68, 0.15)',        // Red tint
  },

  // Legacy compatibility
  white: '#FFFFFF',
};

// Light Theme Colors
export const LIGHT_COLORS = {
  // Backgrounds
  background: {
    primary: '#F8FAFC',       // Soft White - main app background
    secondary: '#FFFFFF',     // Pure White - cards, panels
    tertiary: '#F1F5F9',      // Mist Gray - subtle areas
    navbar: '#FFFFFF',        // Navigation background
  },

  // Brand Colors (same as dark)
  brand: {
    primary: '#2563EB',       // Vectra Blue
    secondary: '#22D3EE',     // Vectra Teal
    accent: '#10B981',        // Emerald
    warning: '#F59E0B',       // Amber
    error: '#EF4444',         // Crimson
  },

  // Text
  text: {
    primary: '#0F172A',       // Deep Slate - headings
    secondary: '#475569',     // Slate Gray - body text
    muted: '#94A3B8',         // Light Slate - helper text
    inactive: '#CBD5E1',      // Very light - disabled
  },

  // UI Elements
  border: '#E2E8F0',
  shadow: 'rgba(0, 0, 0, 0.05)',
  overlay: 'rgba(0, 0, 0, 0.3)',

  // Tint backgrounds (semi-transparent brand colors for icon containers, badges, etc.)
  tint: {
    primary: 'rgba(37, 99, 235, 0.12)',
    primaryLight: 'rgba(37, 99, 235, 0.08)',
    secondary: 'rgba(34, 211, 238, 0.12)',
    secondaryLight: 'rgba(34, 211, 238, 0.06)',
    accent: 'rgba(16, 185, 129, 0.12)',
    warning: 'rgba(245, 158, 11, 0.12)',
    warningLight: 'rgba(245, 158, 11, 0.08)',
    error: 'rgba(239, 68, 68, 0.12)',
  },

  // Legacy compatibility
  white: '#FFFFFF',
};

// Default to dark mode (will be overridden by ThemeContext)
export let COLORS = DARK_COLORS;

// Function to update the exported COLORS object
export const setThemeColors = (isDark) => {
  Object.assign(COLORS, isDark ? DARK_COLORS : LIGHT_COLORS);
};

export const FONTS = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  padding: 16,
  margin: 16,
  radius: 12,
  radiusSm: 8,
  radiusLg: 16,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

// Navigation themes
export const darkNavTheme = {
  dark: true,
  colors: {
    primary: '#2563EB',
    background: '#0B0F14',
    card: '#111827',
    text: '#E5E7EB',
    border: '#1E293B',
    notification: '#22D3EE',
  },
};

export const lightNavTheme = {
  dark: false,
  colors: {
    primary: '#2563EB',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    notification: '#22D3EE',
  },
};

// For backwards compatibility
export const darkTheme = darkNavTheme;
