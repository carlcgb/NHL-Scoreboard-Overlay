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
  /** Tall narrow frame (e.g. TikTok 9:16): larger type, stacked teams */
  layout?: "horizontal" | "vertical";
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
  const vertical = options?.layout === "vertical";

  const panelClass =
    isDark
      ? "border-white/15 bg-slate-950/96"
      : "border-white/20 bg-slate-900/95";

  const commonGoal = (
    <GoalAnimation active={goalFlash} side={goalSide} vertical={vertical} />
  );

  const emptyNetBadge = view.emptyNetSide ? (
    <div
      className={`rounded-md bg-black/75 font-bold uppercase tracking-wider text-amber-200 ring-1 ring-amber-500/35 ${
        vertical
          ? "px-2 py-1 text-[10px] sm:text-xs"
          : "px-2 py-0.5 text-[9px] sm:text-[10px]"
      }`}
    >
      Empty net ·{" "}
      {view.emptyNetSide === "home" ? view.home.abbrev : view.away.abbrev}
    </div>
  ) : null;

  if (vertical) {
    return (
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: view.isFinal ? 0.96 : 1 }}
        transition={{ duration: 0.5 }}
        className={`relative w-full max-w-[min(100vw,28rem)] px-2 sm:max-w-[min(100vw,32rem)] sm:px-3 ${isDark ? "text-slate-100" : ""}`}
      >
        <div
          className={`relative overflow-hidden rounded-2xl border-2 shadow-2xl backdrop-blur-md ${panelClass}`}
          style={{
            boxShadow:
              "0 8px 48px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <PowerPlayBanner view={view} layout="vertical" />
          {commonGoal}
          {view.emptyNetSide ? (
            <div className="absolute right-2 top-2 z-[25]">{emptyNetBadge}</div>
          ) : null}

          <div
            className={`pointer-events-none absolute inset-0 ${
              goalFlash ? "animate-pulse bg-amber-300/20" : "opacity-[0.06]"
            } ${goalFlash ? "" : "bg-white"}`}
          />

          <div className="relative space-y-3 px-3 pb-4 pt-2 sm:space-y-4 sm:px-4 sm:pb-5 sm:pt-3">
            <div className="rounded-xl border border-white/15 bg-black/40 px-3 py-3 sm:px-4 sm:py-4">
              <Clock
                view={view}
                periodLabel={periodLabel}
                size="large"
              />
              {showSeries && view.seriesText ? (
                <p className="mt-2 text-center text-xs font-semibold uppercase leading-snug tracking-wide text-slate-300 sm:text-sm">
                  {view.seriesText}
                </p>
              ) : null}
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-3 sm:px-3 sm:py-4">
              <TeamBlock
                team={view.away}
                side="away"
                goalPulse={goalSide === "away"}
                showShots={showShots}
                density="vertical"
              />
            </div>

            <div className="flex items-center gap-2 px-1">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
                @
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>

            <div className="rounded-xl border border-white/10 bg-black/25 px-2 py-3 sm:px-3 sm:py-4">
              <TeamBlock
                team={view.home}
                side="home"
                goalPulse={goalSide === "home"}
                showShots={showShots}
                density="vertical"
              />
            </div>
          </div>

          {showSponsor ? (
            <div className="border-t border-white/10 py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 sm:py-3 sm:text-xs sm:tracking-[0.35em]">
              Stanley Cup Playoffs
            </div>
          ) : null}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0.85 }}
      animate={{ opacity: view.isFinal ? 0.95 : 1 }}
      transition={{ duration: 0.5 }}
      className={`relative w-full max-w-[920px] px-3 sm:px-4 ${isDark ? "text-slate-100" : ""}`}
    >
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
        {/* PP lives inside the card so OBS / overflow-hidden does not clip it */}
        <PowerPlayBanner view={view} layout="horizontal" />
        <GoalAnimation active={goalFlash} side={goalSide} />

        <div
          className={`pointer-events-none absolute inset-0 opacity-[0.07] ${
            goalFlash ? "animate-pulse bg-amber-300/30" : ""
          }`}
        />

        <div className="relative flex items-stretch gap-2 px-3 py-3 sm:gap-6 sm:px-5 sm:py-5">
          {view.emptyNetSide ? (
            <div className="pointer-events-none absolute right-2 top-1 z-10">
              {emptyNetBadge}
            </div>
          ) : null}
          <TeamBlock
            team={view.away}
            side="away"
            goalPulse={goalSide === "away"}
            showShots={showShots}
          />

          <div className="flex w-[108px] shrink-0 flex-col items-center justify-center border-x border-white/10 px-1.5 sm:w-[130px] sm:px-2">
            <Clock view={view} periodLabel={periodLabel} />
            {showSeries && view.seriesText ? (
              <p className="mt-2 max-w-[11rem] text-center text-[10px] font-medium uppercase leading-tight tracking-wide text-slate-400 sm:text-[11px]">
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
          <div className="border-t border-white/10 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 sm:text-[11px]">
            Stanley Cup Playoffs
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export const Scoreboard = memo(ScoreboardInner);
