"use client";

import { memo } from "react";
import { formatClock } from "@/lib/formatters";
import type { GameViewModel } from "@/lib/nhl-api";

type Props = {
  view: GameViewModel;
  periodLabel: string;
};

function ClockInner({ view, periodLabel }: Props) {
  const live = !view.isFinal && !view.isPreview && view.clockRunning;

  if (view.isFinal) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-300">
          Final
        </span>
      </div>
    );
  }

  if (view.inIntermission) {
    return (
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-200/90">
          Intermission
        </span>
        <span className="font-mono text-lg font-bold tabular-nums text-white">
          {formatClock(view.clockTime)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-200">
        {periodLabel}
      </span>
      <span
        className={`font-mono text-xl font-bold tabular-nums tracking-tight text-white ${live ? "clock-live" : ""}`}
      >
        {formatClock(view.clockTime)}
      </span>
    </div>
  );
}

export const Clock = memo(ClockInner);
