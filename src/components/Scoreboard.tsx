"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import type { GameViewModel } from "@/lib/nhl-api";
import { formatPeriod } from "@/lib/formatters";
import { TeamBlock } from "./TeamBlock";
import { Clock } from "./Clock";
import { PowerPlayBanner } from "./PowerPlayBanner";
import { GoalAnimation } from "./GoalAnimation";

export type ScoreboardOptions = {
  showShots?: boolean;
  showSeries?: boolean;
  showSponsor?: boolean;
  theme?: "default" | "dark";
};

type Props = {
  view: GameViewModel;
  goalSide: "away" | "home" | null;
  options?: ScoreboardOptions;
};

function ScoreboardInner({ view, goalSide, options }: Props) {
  const periodLabel = useMemo(
    () =>
      formatPeriod(
        view.periodDescriptor,
        view.gameState,
        view.shootoutInUse,
      ),
    [view.periodDescriptor, view.gameState, view.shootoutInUse],
  );

  const goalFlash = goalSide !== null;
  const showShots = options?.showShots ?? false;
  const showSeries = options?.showSeries ?? false;
  const showSponsor = options?.showSponsor ?? true;
  const isDark = options?.theme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0.85 }}
      animate={{ opacity: view.isFinal ? 0.95 : 1 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full max-w-[920px] px-4 ${isDark ? "text-slate-100" : ""}`}
    >
      <PowerPlayBanner view={view} />

      <div
        className={`relative overflow-hidden rounded-xl border shadow-2xl backdrop-blur-md ${
          isDark
            ? "border-white/10 bg-slate-950/95"
            : "border-white/15 bg-slate-900/90"
        }`}
        style={{
          boxShadow:
            "0 4px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <GoalAnimation active={goalFlash} side={goalSide} />

        {view.emptyNetSide ? (
          <div className="absolute right-3 top-2 rounded bg-black/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-200">
            Empty net · {view.emptyNetSide === "home" ? view.home.abbrev : view.away.abbrev}
          </div>
        ) : null}

        <div
          className={`pointer-events-none absolute inset-0 opacity-[0.07] ${
            goalFlash ? "animate-pulse bg-amber-300/30" : ""
          }`}
        />

        <div className="relative flex items-stretch gap-3 px-4 py-4 sm:gap-6 sm:px-6 sm:py-5">
          <TeamBlock
            team={view.away}
            side="away"
            goalPulse={goalSide === "away"}
            showShots={showShots}
          />

          <div className="flex w-[120px] shrink-0 flex-col items-center justify-center border-x border-white/10 px-2 sm:w-[140px]">
            <Clock view={view} periodLabel={periodLabel} />
            {showSeries && view.seriesText ? (
              <p className="mt-2 max-w-[11rem] text-center text-[9px] font-medium uppercase leading-tight tracking-wide text-slate-400">
                {view.seriesText}
              </p>
            ) : null}
          </div>

          <TeamBlock
            team={view.home}
            side="home"
            goalPulse={goalSide === "home"}
            showShots={showShots}
          />
        </div>

        {showSponsor ? (
          <div className="border-t border-white/5 py-1 text-center text-[8px] uppercase tracking-[0.4em] text-slate-600">
            Stanley Cup Playoffs
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export const Scoreboard = memo(ScoreboardInner);
