"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
function LogoBlock({
  team,
  size = "default",
}: {
  team: TeamSide;
  size?: "default" | "vertical";
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
      : "h-14 w-14 rounded-lg p-1.5 ring-1 ring-black/20 sm:h-16 sm:w-16";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] ${box}`}
    >
      {exhausted || !src ? (
        <span
          className={`text-center font-black leading-tight text-slate-800 ${size === "vertical" ? "text-xs" : "text-[10px]"}`}
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
        className={`font-bold uppercase tracking-[0.15em] ${v ? "text-base font-black tracking-[0.2em] sm:text-lg" : "text-[11px] sm:text-xs"}`}
        style={{ color: abbrevColor }}
      >
        {team.abbrev}
      </div>
      <div
        className={`truncate font-semibold uppercase tracking-wide text-slate-200 ${v ? "text-xs sm:text-sm" : "text-[10px] font-medium text-slate-300"}`}
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
    <motion.div
      animate={
        goalPulse
          ? {
              scale: [1, 1.12, 1],
              filter: ["brightness(1)", "brightness(1.45)", "brightness(1)"],
            }
          : {}
      }
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`shrink-0 font-mono font-black tabular-nums text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] ${
        v ? "text-5xl sm:text-6xl md:text-7xl" : "text-4xl sm:text-5xl"
      }`}
    >
      {team.score}
    </motion.div>
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

  const gap = v ? "gap-4 sm:gap-5" : "gap-3";

  if (side === "away") {
    return (
      <div
        className={`grid min-w-0 flex-1 grid-cols-[auto_1fr_auto] items-center ${gap}`}
      >
        {logoEl}
        {textEl}
        {scoreEl}
      </div>
    );
  }

  return (
    <div
      className={`grid min-w-0 flex-1 grid-cols-[auto_1fr_auto] items-center ${gap}`}
    >
      {scoreEl}
      <div className="text-right [&_.truncate]:ml-auto [&_div]:ml-auto">{textEl}</div>
      {logoEl}
    </div>
  );
}

export const TeamBlock = memo(TeamBlockInner);
