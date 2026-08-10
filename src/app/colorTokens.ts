/** STSX brand palette — hex values so `${token}18` alpha suffixes keep working. */
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
};

export const LIGHT: ColorTokens = {
  bg: "#DCE8F6",
  surface: "#F1F6FC",
  surfaceAlt: "#D4E3F2",
  border: "#ADBFD8",
  text: "#1C1712",
  textSub: "#3D3028",
  textMuted: "#4A5870",
  primary: "#00795D",
  primaryFg: "#FDFAF5",
  accent: "#A8C2EA",
  warning: "#D4703A",
  warningBg: "#FBF0E6",
  danger: "#C44830",
  dangerBg: "#FAEEE9",
  positiveBg: "#E4F6EE",
};

export const DARK: ColorTokens = {
  bg: "#131C25",
  surface: "#1C2836",
  surfaceAlt: "#243344",
  border: "#3A4555",
  text: "#EAE5DE",
  textSub: "#C2BBB4",
  textMuted: "#8097B4",
  primary: "#009E76",
  primaryFg: "#FDFAF5",
  accent: "#A8C2EA",
  warning: "#EFA483",
  warningBg: "#1E1008",
  danger: "#E05A44",
  dangerBg: "#1E0806",
  positiveBg: "#071A10",
};

/** Mutable active palette — swapped on theme toggle. */
export const C: ColorTokens = { ...LIGHT };

export function applyColorTokens(dark: boolean) {
  Object.assign(C, dark ? DARK : LIGHT);
}
