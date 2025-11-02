/**
 * Design Tokens for NightFair Hygiene
 * Generated deterministically based on project seed
 * Seed: sha256("NightFair Hygiene + Sepolia + 202411 + NightFairHygiene.sol")
 */

// Color palette - Night Market theme (deep blue + cyan + amber)
export const colors = {
  light: {
    primary: "#1e40af", // Deep blue
    primaryHover: "#1e3a8a",
    secondary: "#06b6d4", // Cyan
    secondaryHover: "#0891b2",
    accent: "#f59e0b", // Amber
    accentHover: "#d97706",
    background: "#f8fafc",
    backgroundSecondary: "#f1f5f9",
    foreground: "#0f172a",
    foregroundMuted: "#64748b",
    border: "#e2e8f0",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    card: "#ffffff",
  },
  dark: {
    primary: "#3b82f6", // Lighter blue for dark mode
    primaryHover: "#60a5fa",
    secondary: "#22d3ee", // Lighter cyan
    secondaryHover: "#06b6d4",
    accent: "#fbbf24", // Lighter amber
    accentHover: "#f59e0b",
    background: "#0f172a",
    backgroundSecondary: "#1e293b",
    foreground: "#f8fafc",
    foregroundMuted: "#94a3b8",
    border: "#334155",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",
    card: "#1e293b",
  },
} as const;

// Typography
export const typography = {
  fontFamily: {
    sans: "Inter, system-ui, sans-serif",
    mono: "Fira Code, monospace",
  },
  fontSize: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

// Spacing - Two density modes
export const spacing = {
  compact: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "0.75rem", // 12px
    lg: "1rem", // 16px
    xl: "1.5rem", // 24px
    "2xl": "2rem", // 32px
    "3xl": "3rem", // 48px
  },
  comfortable: {
    xs: "0.5rem", // 8px
    sm: "0.75rem", // 12px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },
} as const;

// Border radius
export const borderRadius = {
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px
  lg: "0.75rem", // 12px
  xl: "1rem", // 16px
  full: "9999px",
} as const;

// Shadows
export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
} as const;

// Transitions
export const transitions = {
  fast: "150ms ease-in-out",
  normal: "300ms ease-in-out",
  slow: "500ms ease-in-out",
} as const;

// Breakpoints (responsive)
export const breakpoints = {
  mobile: "0px",
  tablet: "768px",
  desktop: "1024px",
  wide: "1280px",
} as const;

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  toast: 1300,
  tooltip: 1400,
} as const;

// Animation keyframes
export const animations = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { transform: "translateY(10px)", opacity: 0 },
    to: { transform: "translateY(0)", opacity: 1 },
  },
  pulse: {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0.5 },
  },
} as const;

// WCAG AA contrast ratios
export const accessibility = {
  minContrastRatio: 4.5, // For normal text
  minContrastRatioLarge: 3, // For large text (18pt+ or 14pt+ bold)
  focusOutlineWidth: "2px",
  focusOutlineOffset: "2px",
} as const;

// Export utility function to get current theme
export type ThemeMode = "light" | "dark";
export type DensityMode = "compact" | "comfortable";

export function getThemeColors(mode: ThemeMode) {
  return colors[mode];
}

export function getSpacing(density: DensityMode) {
  return spacing[density];
}

// Generate CSS variables for theme
export function generateCSSVariables(mode: ThemeMode, density: DensityMode = "comfortable") {
  const themeColors = getThemeColors(mode);
  const themeSpacing = getSpacing(density);

  return {
    "--color-primary": themeColors.primary,
    "--color-primary-hover": themeColors.primaryHover,
    "--color-secondary": themeColors.secondary,
    "--color-secondary-hover": themeColors.secondaryHover,
    "--color-accent": themeColors.accent,
    "--color-accent-hover": themeColors.accentHover,
    "--color-background": themeColors.background,
    "--color-background-secondary": themeColors.backgroundSecondary,
    "--color-foreground": themeColors.foreground,
    "--color-foreground-muted": themeColors.foregroundMuted,
    "--color-border": themeColors.border,
    "--color-success": themeColors.success,
    "--color-warning": themeColors.warning,
    "--color-error": themeColors.error,
    "--color-card": themeColors.card,
    "--spacing-xs": themeSpacing.xs,
    "--spacing-sm": themeSpacing.sm,
    "--spacing-md": themeSpacing.md,
    "--spacing-lg": themeSpacing.lg,
    "--spacing-xl": themeSpacing.xl,
    "--spacing-2xl": themeSpacing["2xl"],
    "--spacing-3xl": themeSpacing["3xl"],
    "--radius": borderRadius.md,
    "--transition-fast": transitions.fast,
    "--transition-normal": transitions.normal,
    "--transition-slow": transitions.slow,
  };
}

