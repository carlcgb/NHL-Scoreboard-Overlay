import type { PeriodDescriptor } from "./nhl-api";

export function formatPeriod(
  pd: PeriodDescriptor | undefined,
  gameState: string,
  shootoutInUse?: boolean,
): string {
  if (gameState === "OFF" || gameState === "FINAL") {
    return "FINAL";
  }
  if (!pd) return "—";
  const n = pd.number;
  const t = pd.periodType;

  if (t === "SO" || shootoutInUse) {
    return "SO";
  }
  if (t === "OT") {
    if (n <= 1) return "OT";
    return `${n - 1}OT`;
  }
  if (n === 1) return "1st";
  if (n === 2) return "2nd";
  if (n === 3) return "3rd";
  if (n > 3 && t === "REG") {
    return `${n}TH`;
  }
  return `P${n}`;
}

export function formatClock(timeRemaining: string | undefined): string {
  if (!timeRemaining || timeRemaining === "") return "0:00";
  const trimmed = timeRemaining.trim();
  if (/^\d{1,2}:\d{2}$/.test(trimmed)) return trimmed;
  return trimmed;
}

export function formatSeriesLead(
  topAbbrev: string,
  topWins: number,
  bottomAbbrev: string,
  bottomWins: number,
): string {
  const leader =
    topWins > bottomWins
      ? topAbbrev
      : bottomWins > topWins
        ? bottomAbbrev
        : null;
  if (!leader) return `${topAbbrev} ${topWins}–${bottomWins} ${bottomAbbrev}`;
  return `${leader} leads ${Math.max(topWins, bottomWins)}–${Math.min(topWins, bottomWins)}`;
}

/** Toronto calendar date YYYY-MM-DD, the day key for NHL /v1/score/{date} */
export function torontoDateString(d = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}
