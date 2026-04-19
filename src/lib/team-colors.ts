/** Primary accent per tri-code for overlay theming (approximate brand colors). */
export const TEAM_COLORS: Record<
  string,
  { primary: string; secondary: string }
> = {
  ANA: { primary: "#B9975B", secondary: "#111111" },
  ARI: { primary: "#8C2633", secondary: "#E2D6B5" },
  BOS: { primary: "#FFB81C", secondary: "#000000" },
  BUF: { primary: "#003087", secondary: "#FFB81C" },
  CAR: { primary: "#CC0000", secondary: "#000000" },
  CBJ: { primary: "#CE1126", secondary: "#041E42" },
  CGY: { primary: "#C8102E", secondary: "#F1BE48" },
  CHI: { primary: "#CF0A2C", secondary: "#000000" },
  COL: { primary: "#6F263D", secondary: "#236093" },
  DAL: { primary: "#00843D", secondary: "#111111" },
  DET: { primary: "#CE1126", secondary: "#FFFFFF" },
  EDM: { primary: "#FF4C00", secondary: "#041E42" },
  FLA: { primary: "#C8102E", secondary: "#041E42" },
  LAK: { primary: "#111111", secondary: "#A2AAAD" },
  MIN: { primary: "#154734", secondary: "#A6192E" },
  MTL: { primary: "#AF1E2D", secondary: "#192168" },
  NJD: { primary: "#CE1126", secondary: "#000000" },
  NSH: { primary: "#FFB81C", secondary: "#041E42" },
  NYI: { primary: "#00539B", secondary: "#F47D30" },
  NYR: { primary: "#0038A8", secondary: "#CE1126" },
  OTT: { primary: "#C52032", secondary: "#000000" },
  PHI: { primary: "#F74902", secondary: "#000000" },
  PIT: { primary: "#000000", secondary: "#FCB514" },
  SEA: { primary: "#99D9D9", secondary: "#001628" },
  SJS: { primary: "#006D75", secondary: "#EA7200" },
  STL: { primary: "#002F87", secondary: "#FCB514" },
  TBL: { primary: "#002868", secondary: "#FFFFFF" },
  TOR: { primary: "#00205B", secondary: "#FFFFFF" },
  UTA: { primary: "#6CACE4", secondary: "#111111" },
  VAN: { primary: "#00205B", secondary: "#00843D" },
  VGK: { primary: "#B4975A", secondary: "#333F48" },
  WPG: { primary: "#041E42", secondary: "#004C97" },
  WSH: { primary: "#C8102E", secondary: "#041E42" },
};

export function getTeamColors(abbrev: string) {
  return (
    TEAM_COLORS[abbrev.toUpperCase()] ?? {
      primary: "#334155",
      secondary: "#0f172a",
    }
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace("#", "");
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** WCAG relative luminance for sRGB hex. */
function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.35;
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(rgb.r);
  const g = lin(rgb.g);
  const b = lin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Abbreviation color on dark scoreboard panels: avoid near-black / navy primaries
 * that disappear on slate backgrounds.
 */
export function getAbbrevTextColor(colors: { primary: string; secondary: string }): string {
  const minRead = 0.42;
  if (relativeLuminance(colors.primary) >= minRead) return colors.primary;
  if (relativeLuminance(colors.secondary) >= minRead) return colors.secondary;
  return "#f1f5f9";
}
