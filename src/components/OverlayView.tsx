"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Scoreboard, type ScoreboardOptions } from "@/components/Scoreboard";
import { OverlayChrome, isCorner } from "@/components/OverlayChrome";
import { useGameFeed } from "@/hooks/useGameFeed";

type Props = {
  gameId: number | null;
  /** Use the compact strip unless the URL says `compact=0` */
  defaultCompact?: boolean;
  /** Render nothing (not a message) while there is no game, loading or an error */
  quiet?: boolean;
};

function OverlayContent({
  gameId,
  options,
  quiet,
}: {
  gameId: number | null;
  options: ScoreboardOptions;
  quiet: boolean;
}) {
  const { view, error, goalSide } = useGameFeed({ gameId, mockOnly: false });

  if (!gameId) {
    if (quiet) return null;
    return (
      <div className="rounded-lg border border-white/20 bg-black/80 px-6 py-4 text-sm text-white">
        Add <span className="font-mono">?game=GAME_ID</span> (NHL gamecenter ID)
      </div>
    );
  }

  if (error && !view) {
    if (quiet) return null;
    return (
      <div className="max-w-md rounded-lg border border-red-500/40 bg-black/85 px-4 py-3 text-center text-xs text-red-200">
        {error}
      </div>
    );
  }

  if (!view) {
    if (quiet) return null;
    return (
      <div className="rounded-lg bg-black/60 px-4 py-2 text-xs text-slate-300">
        Loading…
      </div>
    );
  }

  return <Scoreboard view={view} goalSide={goalSide} options={options} />;
}

export function OverlayView({
  gameId,
  defaultCompact = false,
  quiet = false,
}: Props) {
  const searchParams = useSearchParams();

  const compactParam = searchParams.get("compact");
  const compact =
    compactParam === null ? defaultCompact : compactParam === "1";
  const vertical =
    !compact &&
    (searchParams.get("vertical") === "1" ||
      searchParams.get("tiktok") === "1");
  const pos = searchParams.get("pos");

  const options: ScoreboardOptions = useMemo(
    () => ({
      showShots: searchParams.get("shots") === "1",
      showSeries: searchParams.get("series") === "1",
      showSponsor: searchParams.get("sponsor") !== "0",
      theme: searchParams.get("theme") === "dark" ? "dark" : "default",
      layout: compact ? "compact" : vertical ? "vertical" : "horizontal",
    }),
    [searchParams, vertical, compact],
  );

  useEffect(() => {
    if (options.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    return () => document.documentElement.removeAttribute("data-theme");
  }, [options.theme]);

  return (
    <OverlayChrome
      vertical={vertical}
      compact={compact}
      position={isCorner(pos) ? pos : "tl"}
    >
      {/* Keyed so a new game never shows the previous game's state */}
      <OverlayContent
        key={gameId ?? "none"}
        gameId={gameId}
        options={options}
        quiet={quiet}
      />
    </OverlayChrome>
  );
}
