/**
 * Color Utilities for Theme Customization
 * 
 * This module provides utilities for working with colors, including:
 * - Converting between color formats (HEX, RGB, HSL)
 * - Generating color palettes from a base color
 * - Creating color harmonies (complementary, analogous, etc.)
 * - Calculating contrast ratios
 */

/**
 * Converts a HEX color to RGB
 * @param hex HEX color code (e.g., "#EC4899")
 * @returns RGB color object or null if invalid
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB to HEX
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns HEX color code
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

/**
 * Converts RGB to HSL
 * @param r Red (0-255)
 * @param g Green (0-255)
 * @param b Blue (0-255)
 * @returns HSL color object
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return { h, s, l };
}

/**
 * Converts HSL to RGB
 * @param h Hue (0-1)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 * @returns RGB color object
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Converts HEX to HSL
 * @param hex HEX color code
 * @returns HSL color object or null if invalid
 */
export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb.r, rgb.g, rgb.b);
}

/**
 * Converts HSL to HEX
 * @param h Hue (0-1)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 * @returns HEX color code
 */
export function hslToHex(h: number, s: number, l: number): string {
  const rgb = hslToRgb(h, s, l);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Generates a color palette from a base color
 * @param baseColor Base color in HEX format
 * @returns Object with different shades of the color
 */
export function generateColorPalette(baseColor: string): {
  [key: string]: string;
} {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return {};

  const { h, s, l } = hsl;
  
  return {
    50: hslToHex(h, Math.max(0, s - 0.4), Math.min(0.97, l + 0.25)),
    100: hslToHex(h, Math.max(0, s - 0.3), Math.min(0.92, l + 0.2)),
    200: hslToHex(h, Math.max(0, s - 0.2), Math.min(0.85, l + 0.15)),
    300: hslToHex(h, Math.max(0, s - 0.1), Math.min(0.75, l + 0.1)),
    400: hslToHex(h, s, Math.min(0.65, l + 0.05)),
    500: baseColor, // Original color
    600: hslToHex(h, Math.min(1, s + 0.05), Math.max(0.25, l - 0.05)),
    700: hslToHex(h, Math.min(1, s + 0.1), Math.max(0.2, l - 0.1)),
    800: hslToHex(h, Math.min(1, s + 0.15), Math.max(0.15, l - 0.15)),
    900: hslToHex(h, Math.min(1, s + 0.2), Math.max(0.1, l - 0.2)),
  };
}

/**
 * Generates a complementary color
 * @param baseColor Base color in HEX format
 * @returns Complementary color in HEX format
 */
export function getComplementaryColor(baseColor: string): string {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return baseColor;

  const { h, s, l } = hsl;
  const newHue = (h + 0.5) % 1; // Opposite hue (180 degrees)
  
  return hslToHex(newHue, s, l);
}

/**
 * Generates analogous colors
 * @param baseColor Base color in HEX format
 * @param count Number of colors to generate (default: 2)
 * @param angle Angle between colors in degrees (default: 30)
 * @returns Array of analogous colors in HEX format
 */
export function getAnalogousColors(
  baseColor: string,
  count: number = 2,
  angle: number = 30
): string[] {
  const hsl = hexToHsl(baseColor);
  if (!hsl) return [baseColor];

  const { h, s, l } = hsl;
  const colors = [baseColor];
  
  const angleInHue = angle / 360;
  
  for (let i = 1; i <= count; i++) {
    const newHue = (h + angleInHue * i) % 1;
    colors.push(hslToHex(newHue, s, l));
    
    if (i <= count / 2) {
      const newHue2 = (h - angleInHue * i + 1) % 1;
      colors.push(hslToHex(newHue2, s, l));
    }
  }
  
  return colors;
}

/**
 * Calculates the contrast ratio between two colors
 * @param color1 First color in HEX format
 * @param color2 Second color in HEX format
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculates the relative luminance of a color
 * @param color Color in HEX format
 * @returns Relative luminance (0-1)
 */
export function getLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const { r, g, b } = rgb;
  
  const rsrgb = r / 255;
  const gsrgb = g / 255;
  const bsrgb = b / 255;
  
  const rc = rsrgb <= 0.03928 ? rsrgb / 12.92 : Math.pow((rsrgb + 0.055) / 1.055, 2.4);
  const gc = gsrgb <= 0.03928 ? gsrgb / 12.92 : Math.pow((gsrgb + 0.055) / 1.055, 2.4);
  const bc = bsrgb <= 0.03928 ? bsrgb / 12.92 : Math.pow((bsrgb + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rc + 0.7152 * gc + 0.0722 * bc;
}

/**
 * Determines if a color is light or dark
 * @param color Color in HEX format
 * @returns True if the color is light, false if it's dark
 */
export function isLightColor(color: string): boolean {
  return getLuminance(color) > 0.5;
}

/**
 * Gets a contrasting color (black or white) based on the background
 * @param backgroundColor Background color in HEX format
 * @returns Black or white in HEX format
 */
export function getContrastColor(backgroundColor: string): string {
  return isLightColor(backgroundColor) ? "#000000" : "#FFFFFF";
}

/**
 * Generates a theme color palette from a primary color
 * @param primaryColor Primary color in HEX format
 * @returns Object with theme colors
 */
export function generateThemeColors(primaryColor: string): {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
} {
  const primaryHsl = hexToHsl(primaryColor);
  if (!primaryHsl) {
    return {
      primary: "#EC4899", // Default pink-500
      secondary: "#F472B6", // Default pink-400
      accent: "#FBBF24", // Default amber-400
      background: "#FDF2F8", // Default pink-50
      text: "#1F2937", // Default gray-800
      muted: "#6B7280", // Default gray-500
    };
  }
  
  const { h, s, l } = primaryHsl;
  
  // Generate secondary color (slightly lighter)
  const secondary = hslToHex(h, Math.max(0, s - 0.1), Math.min(0.65, l + 0.05));
  
  // Generate accent color (complementary with adjusted saturation/lightness)
  const accentHue = (h + 0.5) % 1; // Complementary
  const accent = hslToHex(accentHue, Math.min(0.9, s + 0.1), Math.min(0.65, l + 0.1));
  
  // Generate background color (very light version of primary)
  const background = hslToHex(h, Math.max(0, s - 0.4), 0.97);
  
  // Text and muted colors
  const text = "#1F2937"; // Gray-800
  const muted = "#6B7280"; // Gray-500
  
  return {
    primary: primaryColor,
    secondary,
    accent,
    background,
    text,
    muted,
  };
}