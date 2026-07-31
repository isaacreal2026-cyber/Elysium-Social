import { useContext } from "react";

import colors from "@/constants/colors";
import { ThemeCtx } from "@/context/ThemeProvider";

type ColorPalette = typeof colors.light;

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Now supports a full light and dark palette. The user's preference
 * (stored in ThemeProvider) overrides the system appearance setting.
 */
export function useColors(): ColorPalette & { radius: number } {
  const themeCtx = useContext(ThemeCtx);
  // User preference takes precedence; fall back to system; default dark
  const mode =
    themeCtx?.mode === "system"
      ? themeCtx?.systemScheme === "dark"
        ? "dark"
        : "light"
      : themeCtx?.mode ?? "light"; // "light" = dark visual theme (our original dark UI)
  const palette: ColorPalette =
    mode === "dark"
      ? (colors as unknown as Record<string, ColorPalette>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
