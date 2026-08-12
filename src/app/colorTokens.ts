/** STSX jewel palette — pastel blue ground, viridian primary, indigo accent (login / taskbar). */
export type ColorTokens = {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSub: string;
  textMuted: string;
  primary: string;
  primaryFg: string;
  accent: string;
  warning: string;
  warningBg: string;
  danger: string;
  dangerBg: string;
  positiveBg: string;
  taskbarBg: string;
  taskbarFg: string;
};

/** Metallic jewel stops — for KPI fills (anodised metal diagonals). */
export type JewelMetal = {
  base: string;
  light: string;
  dark: string;
  text: string;
};

export const JEWEL = {
  viridian: { base: "#0D8C7E", light: "#12B09E", dark: "#096A5F", text: "#FFFFFF" },
  amber:    { base: "#C97D08", light: "#F09A1A", dark: "#9C5F06", text: "#FFFFFF" },
  indigo:   { base: "#3F52CC", light: "#5A6EE0", dark: "#2E3AA0", text: "#FFFFFF" },
  cherry:   { base: "#8B1A2E", light: "#B52038", dark: "#620F1E", text: "#FFFFFF" },
} as const satisfies Record<string, JewelMetal>;

export function metalFill(c: JewelMetal): string {
  return `linear-gradient(120deg, ${c.dark} 0%, ${c.base} 38%, ${c.light} 52%, ${c.base} 60%, ${c.dark} 100%)`;
}

export function metalShadow(c: JewelMetal): string {
  return `0 4px 24px ${c.base}44, 0 1px 0 ${c.light}55 inset`;
}

export function metalSpecular(c: JewelMetal): string {
  return `linear-gradient(90deg, transparent, ${c.light}aa, transparent)`;
}

/** Accent edge that fades down — used on non-stat panels. */
export function gradientBorderFill(surface: string, accent: string): string {
  return `linear-gradient(${surface}, ${surface}) padding-box, linear-gradient(to bottom, ${accent} 0%, ${accent}55 30%, transparent 68%) border-box`;
}

/** Pastel blue (slight lilac cast) — still reads blue, not purple. */
export const LIGHT: ColorTokens = {
  bg: "#D8E4F6",
  surface: "#FFFFFF",
  surfaceAlt: "#E6EEF8",
  border: "#B4C6DE",
  text: "#0F1520",
  textSub: "#3A4A68",
  textMuted: "#5C6D88",
  primary: "#0D8C7E",
  primaryFg: "#F5FFFE",
  accent: "#3F52CC",
  warning: "#C97D08",
  warningBg: "#FFF3D6",
  danger: "#9E1F38",
  dangerBg: "#FDE8EC",
  positiveBg: "#D4F5EE",
  taskbarBg: "#3F52CC",
  taskbarFg: "#F3F5FF",
};

/** Deep blue night — matches the pastel blue ground family. */
export const DARK: ColorTokens = {
  bg: "#0A1424",
  surface: "#121C2E",
  surfaceAlt: "#1A2740",
  border: "#2A3A55",
  text: "#E4ECF8",
  textSub: "#A8B8D0",
  textMuted: "#7A8AA8",
  primary: "#3DCFC0",
  primaryFg: "#0A1424",
  accent: "#7088F0",
  warning: "#E8BA60",
  warningBg: "#2A2010",
  danger: "#E05570",
  dangerBg: "#1E0810",
  positiveBg: "#0F2A24",
  taskbarBg: "#3F52CC",
  taskbarFg: "#F3F5FF",
};

/** Mutable active palette — swapped on theme toggle. */
export const C: ColorTokens = { ...LIGHT };

export function applyColorTokens(dark: boolean) {
  Object.assign(C, dark ? DARK : LIGHT);
}
