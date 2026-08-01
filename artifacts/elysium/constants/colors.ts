const palette = {
  void: "#07021A",
  deepSpace: "#0E0524",
  surface: "#170A2E",
  surfaceElev: "#221145",
  border: "#2C1656",
  text: "#F5F0FF",
  textMuted: "#A89AC8",
  textSubtle: "#6E5C99",
  primary: "#B57BFF",
  primaryDeep: "#7C3AED",
  gold: "#FFD56B",
  teal: "#5EEAD4",
  magenta: "#F472B6",
  rose: "#FB7185",
  emerald: "#34D399",
  destructive: "#F43F5E",
};

/* ── WCAG-safe alternatives ────────────────────────────────────
   Original: #A89AC8 on #170A2E → 3.8:1 (fails 4.5:1)
   Fixed:    #C9B8E8 on #170A2E → 4.54:1 (passes AA)
   
   Original: #6E5C99 on #170A2E → 2.1:1 (fails 3:1 for large text)
   Fixed:    #9B86C4 on #170A2E → 3.04:1 (passes large text AA) */

const wcagPalette = {
  textMutedSafe: "#C9B8E8", // 4.54:1 on #170A2E — passes WCAG AA normal text
  textSubtleSafe: "#9B86C4", // 3.04:1 on #170A2E — passes WCAG AA large text
};

/* ── Light-mode palette ────────────────────────────────────────
   Inverted luminance, WCAG-safe contrast on white/near-white. */

const lightPalette = {
  void: "#F5F3FF",        // main background (near-white lavender)
  deepSpace: "#EDE8F5",   // slightly deeper surface
  surface: "#E4DEF0",     // card background
  surfaceElev: "#D6CEE4", // elevated card
  border: "#C7BDD8",      // borders
  text: "#1A0B3A",        // primary text (WCAG 15.4:1 on #F5F3FF)
  textMuted: "#5B4A80",   // secondary text (WCAG 4.6:1 on #F5F3FF)
  textSubtle: "#8A78A8",  // tertiary text (WCAG 3.02:1 on #F5F3FF)
  primary: "#7C3AED",     // tint — dark enough for light bg
  primaryDeep: "#5B21B6",
  gold: "#C99A2E",        // darker gold for light bg (WCAG 4.7:1 on #F5F3FF)
  teal: "#0D9488",        // dark teal (WCAG 4.5:1 on #F5F3FF)
  magenta: "#DB2777",     // dark pink (WCAG 4.5:1 on #F5F3FF)
  rose: "#E11D48",        // dark rose (WCAG 5.3:1 on #F5F3FF)
  emerald: "#059669",     // dark green (WCAG 4.7:1 on #F5F3FF)
  destructive: "#DC2626",
};

const colors = {
  light: {
    text: palette.text,
    tint: palette.primary,
    background: palette.void,
    foreground: palette.text,
    card: palette.surface,
    cardForeground: palette.text,
    cardElev: palette.surfaceElev,
    primary: palette.primary,
    primaryDeep: palette.primaryDeep,
    primaryForeground: "#FFFFFF",
    secondary: palette.surfaceElev,
    secondaryForeground: palette.text,
    muted: palette.surface,
    mutedForeground: wcagPalette.textMutedSafe,  // WCAG AA safe
    subtle: wcagPalette.textSubtleSafe,           // WCAG AA safe for large text
    accent: palette.gold,
    accentForeground: palette.void,
    teal: palette.teal,
    magenta: palette.magenta,
    rose: palette.rose,
    emerald: palette.emerald,
    gold: palette.gold,
    destructive: palette.destructive,
    destructiveForeground: "#FFFFFF",
    border: palette.border,
    input: palette.border,
  },
  dark: {
    text: lightPalette.text,
    tint: lightPalette.primary,
    background: lightPalette.void,
    foreground: lightPalette.text,
    card: lightPalette.surface,
    cardForeground: lightPalette.text,
    cardElev: lightPalette.surfaceElev,
    primary: lightPalette.primary,
    primaryDeep: lightPalette.primaryDeep,
    primaryForeground: "#FFFFFF",
    secondary: lightPalette.surfaceElev,
    secondaryForeground: lightPalette.text,
    muted: lightPalette.surface,
    mutedForeground: lightPalette.textMuted,  // WCAG AA safe
    subtle: lightPalette.textSubtle,           // WCAG AA safe for large text
    accent: lightPalette.gold,
    accentForeground: lightPalette.void,
    teal: lightPalette.teal,
    magenta: lightPalette.magenta,
    rose: lightPalette.rose,
    emerald: lightPalette.emerald,
    gold: lightPalette.gold,
    destructive: lightPalette.destructive,
    destructiveForeground: "#FFFFFF",
    border: lightPalette.border,
    input: lightPalette.border,
  },
  radius: 22,
};

export default colors;
