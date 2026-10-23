"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ScoreNumber } from "./ScoreNumber";
import { getTeamColors, getAbbrevTextColor } from "@/lib/team-colors";
import type { TeamSide } from "@/lib/nhl-api";

type Props = {
  team: TeamSide;
  side: "away" | "home";
  goalPulse: boolean;
  showShots?: boolean;
  /** Bigger logos and scores for vertical / TikTok frame */
  density?: "default" | "vertical";
};

/**
 * NHL SVGs via `next/image` can render empty; use `<img>` with URL fallbacks.
 * Prefer `logo`, then `darkLogo` if the first request fails.
 */
export function LogoBlock({
  team,
  size = "default",
}: {
  team: TeamSide;
  size?: "default" | "vertical" | "compact";
}) {
  const candidates = useMemo(() => {
    const l = team.logo?.trim();
    const d = team.darkLogo?.trim();
    const urls: string[] = [];
    /** Prefer primary league asset first (often more reliable); then dark-on-light variant. */
    if (l) urls.push(l);
    if (d && d !== l) urls.push(d);
    return urls;
  }, [team.darkLogo, team.logo]);

  const [index, setIndex] = useState(0);

  const exhausted = candidates.length === 0 || index >= candidates.length;
  const src = candidates[index];

  const box =
    size === "vertical"
      ? "h-[4.5rem] w-[4.5rem] rounded-xl p-2 ring-2 ring-black/25 sm:h-[5.25rem] sm:w-[5.25rem]"
      : size === "compact"
        ? "h-5 w-5 rounded p-px ring-1 ring-black/20"
        : "h-12 w-12 rounded-xl p-1 shadow-md ring-1 ring-black/10";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ${box}`}
    >
      {exhausted || !src ? (
        <span
          className={`text-center font-black leading-tight text-slate-800 ${size === "vertical" ? "text-xs" : size === "compact" ? "text-[7px]" : "text-[10px]"}`}
        >
          {team.abbrev}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- NHL SVGs load more reliably than next/image
        <img
          key={`${team.abbrev}-${index}-${src}`}
          src={src}
          alt=""
          className="h-full w-full object-contain"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setIndex((i) => i + 1)}
        />
      )}
    </div>
  );
}

function TextStack({
  team,
  abbrevColor,
  align,
  density = "default",
}: {
  team: TeamSide;
  abbrevColor: string;
  align: "left" | "right";
  density?: "default" | "vertical";
}) {
  const v = density === "vertical";
  return (
    <div
      className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <div
        className={`font-bold uppercase tracking-[0.15em] ${v ? "text-base font-black tracking-[0.2em] sm:text-lg" : "text-sm font-extrabold tracking-[0.14em]"}`}
        style={{ color: abbrevColor }}
      >
        {team.abbrev}
      </div>
      <div
        className={`truncate font-semibold uppercase tracking-wide text-slate-200 ${v ? "text-xs sm:text-sm" : "text-[10px] font-medium tracking-wider text-slate-300/80"}`}
      >
        {team.name}
      </div>
    </div>
  );
}

function TeamBlockInner({
  team,
  side,
  goalPulse,
  showShots,
  density = "default",
}: Props) {
  const colors = getTeamColors(team.abbrev);
  const abbrevColor = getAbbrevTextColor(colors);
  const v = density === "vertical";

  const shots = showShots ? (
    <div
      className={`mt-1 font-mono text-slate-400 ${v ? "text-xs sm:text-sm" : "mt-0.5 text-[9px] text-slate-500"}`}
    >
      SOG {team.sog}
    </div>
  ) : null;

  const scoreEl = (
    <ScoreNumber
      value={team.score}
      pulse={goalPulse}
      className={`shrink-0 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] ${
        v ? "text-5xl sm:text-6xl md:text-7xl" : "text-[40px]"
      }`}
    />
  );

  const logoSize = v ? "vertical" : "default";
  const logoEl = (
    <LogoBlock
      key={`${team.abbrev}-${team.logo}-${team.darkLogo ?? ""}`}
      team={team}
      size={logoSize}
    />
  );
  const textEl = (
    <div
      className={`min-w-0 ${side === "home" ? "text-right" : "text-left"}`}
    >
      <TextStack
        team={team}
        abbrevColor={abbrevColor}
        align={side === "home" ? "right" : "left"}
        density={density}
      />
      {shots}
    </div>
  );

  const gap = v ? "gap-4 sm:gap-5" : "gap-2.5";

  /** Team-color wash toward the center + a glow when the team scores */
  const accent = abbrevColor;
  const wash = v
    ? undefined
    : {
        background: `linear-gradient(${side === "away" ? 90 : 270}deg, ${accent}30, transparent 80%)`,
      };
  const rootClass = `grid min-w-0 flex-1 grid-cols-[auto_1fr_auto] items-center ${gap} ${v ? "" : "rounded-xl px-2 py-1.5"}`;
  const glow = goalPulse
    ? {
        boxShadow: [
          `0 0 0 0 ${accent}00`,
          `0 0 26px 2px ${accent}aa`,
          `0 0 0 0 ${accent}00`,
        ],
      }
    : {};

  if (side === "away") {
    return (
      <motion.div
        className={rootClass}
        style={wash}
        animate={glow}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        {logoEl}
        {textEl}
        {scoreEl}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={rootClass}
      style={wash}
      animate={glow}
      transition={{ duration: 1.4, ease: "easeOut" }}
    >
      {scoreEl}
      <div className="text-right [&_.truncate]:ml-auto [&_div]:ml-auto">{textEl}</div>
      {logoEl}
    </motion.div>
  );
}

export const TeamBlock = memo(TeamBlockInner);
