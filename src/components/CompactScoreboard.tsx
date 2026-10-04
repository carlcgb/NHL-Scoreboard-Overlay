"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { formatClock } from "@/lib/formatters";
import { getTeamColors, getAbbrevTextColor } from "@/lib/team-colors";
import type { GameViewModel, TeamSide } from "@/lib/nhl-api";
import { LogoBlock } from "./TeamBlock";

type Props = {
  view: GameViewModel;
  goalSide: "away" | "home" | null;
  periodLabel: string;
  showShots: boolean;
  showSeries: boolean;
};

/** Red light + GOAL chip fire only for this team's goals. */
const RED_LIGHT_TEAM = "MTL";

const TEXT_SHADOW = "0 1px 3px rgba(0,0,0,0.95), 0 0 6px rgba(0,0,0,0.7)";

function Team({
  team,
  side,
  goal,
  showShots,
}: {
  team: TeamSide;
  side: "away" | "home";
  goal: boolean;
  showShots: boolean;
}) {
  const abbrev = (
    <span
      className="text-[11px] font-bold uppercase tracking-wide"
      style={{ color: getAbbrevTextColor(getTeamColors(team.abbrev)) }}
    >
      {team.abbrev}
    </span>
  );
  const score = (
    <motion.span
      animate={
        goal
          ? {
              scale: [1, 1.25, 1],
              filter: ["brightness(1)", "brightness(1.6)", "brightness(1)"],
            }
          : {}
      }
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="min-w-[1ch] text-center font-mono text-base font-black tabular-nums leading-none text-white"
    >
      {team.score}
    </motion.span>
  );
  const sog = showShots ? (
    <span className="font-mono text-[9px] text-slate-400">{team.sog}</span>
  ) : null;
  const logo = (
    <LogoBlock
      key={`${team.abbrev}-${team.logo}-${team.darkLogo ?? ""}`}
      team={team}
      size="compact"
    />
  );

  return (
    <div className="flex items-center gap-1">
      {side === "away" ? (
        <>
          {logo}
          {abbrev}
          {score}
          {sog}
        </>
      ) : (
        <>
          {sog}
          {score}
          {abbrev}
          {logo}
        </>
      )}
    </div>
  );
}

function CompactScoreboardInner({
  view,
  goalSide,
  periodLabel,
  showShots,
  showSeries,
}: Props) {
  const st = view.specialTeams;
  const showPP =
    st && !view.isFinal && !view.inIntermission && view.gameState !== "PRE";

  let status: string;
  if (view.isFinal) status = "Final";
  else if (view.inIntermission) status = `INT ${formatClock(view.clockTime)}`;
  else status = `${periodLabel} ${formatClock(view.clockTime)}`;

  const redLight =
    goalSide !== null &&
    (goalSide === "home" ? view.home : view.away).abbrev === RED_LIGHT_TEAM;

  const live = !view.isFinal && !view.isPreview && view.clockRunning;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: view.isFinal ? 0.75 : 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex w-fit max-w-full items-center gap-1.5 whitespace-nowrap px-1"
      style={{ textShadow: TEXT_SHADOW }}
    >
      <AnimatePresence>
        {redLight ? (
          <motion.div
            key="red-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -inset-x-3 -inset-y-2 rounded-full bg-red-600 blur-md"
          />
        ) : null}
      </AnimatePresence>

      <Team
        team={view.away}
        side="away"
        goal={goalSide === "away"}
        showShots={showShots}
      />

      <span
        className={`relative px-1 font-mono text-[11px] font-bold uppercase tabular-nums ${
          view.inIntermission ? "text-amber-200" : "text-slate-100"
        } ${live ? "clock-live" : ""}`}
      >
        {status}
      </span>

      <Team
        team={view.home}
        side="home"
        goal={goalSide === "home"}
        showShots={showShots}
      />

      {redLight ? (
        <span className="relative rounded-sm bg-red-600 px-1 [text-shadow:none] text-[10px] font-black uppercase italic tracking-wider text-white">
          Goal
        </span>
      ) : null}

      {showPP && st ? (
        <span
          className="relative rounded-sm bg-yellow-400 px-1 [text-shadow:none] text-[10px] font-black uppercase tabular-nums text-slate-900"
          title="Power play"
        >
          PP {st.powerPlayAbbrev}
          {view.powerPlayClockTime
            ? ` ${formatClock(view.powerPlayClockTime)}`
            : ""}
        </span>
      ) : null}

      {view.emptyNetSide ? (
        <span className="relative rounded-sm bg-black/60 px-1 [text-shadow:none] text-[10px] font-bold uppercase text-amber-200">
          EN{" "}
          {view.emptyNetSide === "home" ? view.home.abbrev : view.away.abbrev}
        </span>
      ) : null}

      {showSeries && view.seriesText ? (
        <span className="relative text-[10px] font-medium uppercase tracking-wide text-slate-400">
          {view.seriesText}
        </span>
      ) : null}
    </motion.div>
  );
}

export const CompactScoreboard = memo(CompactScoreboardInner);
