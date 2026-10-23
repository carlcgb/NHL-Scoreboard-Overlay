"use client";

import { memo } from "react";
import { parseClockSeconds } from "@/lib/formatters";
import { useGameClock } from "@/hooks/useSmoothClock";
import type { GameViewModel } from "@/lib/nhl-api";

type Props = {
  view: GameViewModel;
  periodLabel: string;
  /** Larger period + clock for vertical / phone-safe overlays */
  size?: "default" | "large";
};

function ClockInner({ view, periodLabel, size = "default" }: Props) {
  const clock = useGameClock(view);
  const live = !view.isFinal && !view.isPreview && view.clockRunning;
  const big = size === "large";
  const seconds = parseClockSeconds(clock);
  /** Last minute of a period: warm the clock so it reads at a glance */
  const urgent = live && !view.inIntermission && seconds !== null && seconds < 60;

  const pill = (label: string, tone: string) => (
    <span
      className={`rounded-full bg-white/10 font-bold uppercase ${tone} ${
        big
          ? "px-3 py-1 text-sm tracking-[0.2em]"
          : "px-2.5 py-0.5 text-[10px] tracking-[0.22em]"
      }`}
    >
      {label}
    </span>
  );

  if (view.isFinal) {
    return (
      <div className="flex flex-col items-center gap-1">
        {pill("Final", "text-slate-100")}
      </div>
    );
  }

  const label = view.isPreview
    ? "Pregame"
    : view.inIntermission
      ? "Intermission"
      : periodLabel;

  return (
    <div className={`flex flex-col items-center ${big ? "gap-2" : "gap-1.5"}`}>
      {pill(label, view.inIntermission ? "text-amber-200" : "text-slate-100")}
      <span
        className={`font-mono font-bold tabular-nums leading-none tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] transition-colors duration-500 ${
          urgent ? "text-amber-200" : "text-white"
        } ${big ? "text-4xl sm:text-5xl md:text-6xl" : "text-[28px]"} ${live ? "clock-live" : ""}`}
      >
        {clock}
      </span>
    </div>
  );
}

export const Clock = memo(ClockInner);
