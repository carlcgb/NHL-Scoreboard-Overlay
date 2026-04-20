"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Scoreboard, type ScoreboardOptions } from "@/components/Scoreboard";
import { OverlayChrome } from "@/components/OverlayChrome";
import { useGameFeed } from "@/hooks/useGameFeed";

function OverlayContent() {
  const searchParams = useSearchParams();
  const gameStr = searchParams.get("game");
  const gameId = gameStr ? parseInt(gameStr, 10) : NaN;
  const validId = Number.isFinite(gameId) ? gameId : null;

  const vertical =
    searchParams.get("vertical") === "1" ||
    searchParams.get("tiktok") === "1";

  const options: ScoreboardOptions = useMemo(
    () => ({
      showShots: searchParams.get("shots") === "1",
      showSeries: searchParams.get("series") === "1",
      showSponsor: searchParams.get("sponsor") !== "0",
      theme: searchParams.get("theme") === "dark" ? "dark" : "default",
      layout: vertical ? "vertical" : "horizontal",
    }),
    [searchParams, vertical],
  );

  useEffect(() => {
    if (options.theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    return () => document.documentElement.removeAttribute("data-theme");
  }, [options.theme]);

  const { view, error, goalSide } = useGameFeed({ gameId: validId, mockOnly: false });

  if (!validId) {
    return (
      <div className="rounded-lg border border-white/20 bg-black/80 px-6 py-4 text-sm text-white">
        Add <span className="font-mono">?game=GAME_ID</span> (NHL gamecenter ID)
      </div>
    );
  }

  if (error && !view) {
    return (
      <div className="max-w-md rounded-lg border border-red-500/40 bg-black/85 px-4 py-3 text-center text-xs text-red-200">
        {error}
      </div>
    );
  }

  if (!view) {
    return (
      <div className="rounded-lg bg-black/60 px-4 py-2 text-xs text-slate-300">
        Loading…
      </div>
    );
  }

  return <Scoreboard view={view} goalSide={goalSide} options={options} />;
}

function OverlayKeyed() {
  const searchParams = useSearchParams();
  const game = searchParams.get("game") ?? "none";
  return <OverlayContent key={game} />;
}

function OverlayWithChrome() {
  const searchParams = useSearchParams();
  const vertical =
    searchParams.get("vertical") === "1" ||
    searchParams.get("tiktok") === "1";

  return (
    <OverlayChrome vertical={vertical}>
      <OverlayKeyed />
    </OverlayChrome>
  );
}

export default function OverlayPage() {
  return (
    <Suspense
      fallback={
        <div className="pointer-events-none fixed inset-0 flex items-start justify-center pt-6 text-xs text-slate-400">
          Loading overlay…
        </div>
      }
    >
      <OverlayWithChrome />
    </Suspense>
  );
}
