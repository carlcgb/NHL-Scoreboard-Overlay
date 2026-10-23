"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePowerPlayClock } from "@/hooks/useSmoothClock";
import type { GameViewModel } from "@/lib/nhl-api";

type Props = {
  view: GameViewModel;
  goalSide: "away" | "home" | null;
  showSeries: boolean;
  showSponsor: boolean;
};

function Chip({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, y: -8, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.9 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider tabular-nums [text-shadow:none] shadow-lg ${className}`}
    >
      {children}
    </motion.span>
  );
}

/**
 * Situational tags that hang under the score bar (goal, power play, empty
 * net) plus a dim playoff/series label. Nothing here covers the score.
 */
function StatusChipsInner({ view, goalSide, showSeries, showSponsor }: Props) {
  const ppClock = usePowerPlayClock(view);
  const st = view.specialTeams;
  const showPP =
    st && !view.isFinal && !view.inIntermission && view.gameState !== "PRE";
  const scorer = goalSide ? view[goalSide].abbrev : null;

  const label = [
    showSponsor && view.gameType === 3 ? "Stanley Cup Playoffs" : null,
    showSeries ? view.seriesText : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
      <AnimatePresence initial={false}>
        {scorer ? (
          <Chip key="goal" className="bg-red-600 italic text-white">
            Goal · {scorer}
          </Chip>
        ) : null}
        {showPP && st ? (
          <Chip key="pp" className="bg-yellow-400 text-slate-900">
            ⚡ PP {st.powerPlayAbbrev}
            {ppClock ? ` ${ppClock}` : ""}
          </Chip>
        ) : null}
        {view.emptyNetSide ? (
          <Chip key="en" className="bg-black/60 text-amber-200">
            Empty net ·{" "}
            {view.emptyNetSide === "home" ? view.home.abbrev : view.away.abbrev}
          </Chip>
        ) : null}
      </AnimatePresence>
      {label ? (
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-200/70">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export const StatusChips = memo(StatusChipsInner);
