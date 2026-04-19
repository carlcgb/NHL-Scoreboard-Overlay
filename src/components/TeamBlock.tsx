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
};

/**
 * NHL SVGs via `next/image` can render empty; use `<img>` with URL fallbacks.
 * Prefer `logo`, then `darkLogo` if the first request fails.
 */
function LogoBlock({ team }: { team: TeamSide }) {
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

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-black/20 sm:h-16 sm:w-16">
      {exhausted || !src ? (
        <span className="text-center text-[10px] font-black leading-tight text-slate-800">
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
}: {
  team: TeamSide;
  abbrevColor: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}
    >
      <div
        className="text-[11px] font-bold uppercase tracking-[0.2em] sm:text-xs"
        style={{ color: abbrevColor }}
      >
        {team.abbrev}
      </div>
      <div className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-300">
        {team.name}
      </div>
    </div>
  );
}

function TeamBlockInner({ team, side, goalPulse, showShots }: Props) {
  const colors = getTeamColors(team.abbrev);
  const abbrevColor = getAbbrevTextColor(colors);

  const shots = showShots ? (
    <div className="mt-0.5 font-mono text-[9px] text-slate-500">
      SOG {team.sog}
    </div>
  ) : null;

  const scoreEl = (
    <motion.div
      animate={
        goalPulse
          ? {
              scale: [1, 1.15, 1],
              filter: ["brightness(1)", "brightness(1.45)", "brightness(1)"],
            }
          : {}
      }
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="shrink-0 font-mono text-4xl font-black tabular-nums text-white sm:text-5xl"
    >
      {team.score}
    </motion.div>
  );

  const logoEl = (
    <LogoBlock
      key={`${team.abbrev}-${team.logo}-${team.darkLogo ?? ""}`}
      team={team}
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
      />
      {shots}
    </div>
  );

  if (side === "away") {
    return (
      <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr_auto] items-center gap-3">
        {logoEl}
        {textEl}
        {scoreEl}
      </div>
    );
  }

  return (
    <div className="grid min-w-0 flex-1 grid-cols-[auto_1fr_auto] items-center gap-3">
      {scoreEl}
      <div className="text-right [&_.truncate]:ml-auto [&_div]:ml-auto">{textEl}</div>
      {logoEl}
    </div>
  );
}

export const TeamBlock = memo(TeamBlockInner);
