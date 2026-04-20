"use client";

import { memo } from "react";
import { formatClock } from "@/lib/formatters";
import type { GameViewModel } from "@/lib/nhl-api";

type Props = {
  view: GameViewModel;
  periodLabel: string;
  /** Larger period + clock for vertical / phone-safe overlays */
  size?: "default" | "large";
};

function ClockInner({ view, periodLabel, size = "default" }: Props) {
  const live = !view.isFinal && !view.isPreview && view.clockRunning;
  const big = size === "large";

  if (view.isFinal) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span
          className={`font-semibold uppercase tracking-[0.35em] text-slate-100 ${big ? "text-sm" : "text-[10px]"}`}
        >
          Final
        </span>
      </div>
    );
  }

  if (view.inIntermission) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span
          className={`font-bold uppercase tracking-[0.2em] text-amber-200 ${big ? "text-sm" : "text-[10px]"}`}
        >
          Intermission
        </span>
        <span
          className={`font-mono font-bold tabular-nums text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${big ? "text-3xl sm:text-4xl" : "text-lg"}`}
        >
          {formatClock(view.clockTime)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`font-bold uppercase tracking-[0.2em] text-slate-100 ${big ? "text-sm sm:text-base" : "text-[10px]"}`}
      >
        {periodLabel}
      </span>
      <span
        className={`font-mono font-bold tabular-nums tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] ${big ? "text-3xl sm:text-4xl md:text-5xl" : "text-xl"} ${live ? "clock-live" : ""}`}
      >
        {formatClock(view.clockTime)}
      </span>
    </div>
  );
}

export const Clock = memo(ClockInner);
