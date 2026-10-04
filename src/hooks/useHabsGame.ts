"use client";

import { useEffect, useState } from "react";
import { apiPath, type ScoreNowResponse } from "@/lib/nhl-api";
import { torontoDateString } from "@/lib/formatters";

export const HABS_ABBREV = "MTL";

/** How often to look for today's Montréal game. */
const POLL_MS = 30_000;
/** Keep the scoreboard up this long after the final horn. */
const FINAL_GRACE_MS = 10 * 60_000;

type ScoreGame = NonNullable<ScoreNowResponse["games"]>[number];

const isLive = (s: string) => s === "LIVE" || s === "CRIT";
const isFinal = (s: string) => s === "OFF" || s === "FINAL";

async function fetchDay(date: string): Promise<ScoreGame[]> {
  const res = await fetch(apiPath(`/v1/score/${date}`), { cache: "no-store" });
  if (!res.ok) throw new Error(`score ${res.status}`);
  const data = (await res.json()) as ScoreNowResponse;
  return data.games ?? [];
}

/**
 * Resolves the Montréal game that should be on screen, or null when the
 * overlay should be hidden: live, then pregame, then a game that just ended
 * (only if this page watched it, so a reload hours later stays hidden).
 */
export function useHabsGame(): number | null {
  const [gameId, setGameId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    /** Games seen live/pregame this session, and when they were first seen final. */
    const active = new Set<number>();
    const finalSince = new Map<number, number>();

    const resolve = async () => {
      const now = Date.now();
      // Yesterday too: a late game is still live after midnight Toronto time.
      const days = await Promise.allSettled([
        fetchDay(torontoDateString(new Date(now))),
        fetchDay(torontoDateString(new Date(now - 24 * 3600_000))),
      ]);
      // Both failed: keep whatever is showing rather than flickering off.
      if (days.every((d) => d.status === "rejected")) return;

      const habs = days
        .flatMap((d) => (d.status === "fulfilled" ? d.value : []))
        .filter(
          (g) =>
            g.awayTeam.abbrev === HABS_ABBREV ||
            g.homeTeam.abbrev === HABS_ABBREV,
        );

      let pick: ScoreGame | undefined = habs.find((g) => isLive(g.gameState));
      pick ??= habs.find((g) => g.gameState === "PRE");
      if (!pick) {
        pick = habs.find((g) => {
          if (!isFinal(g.gameState) || !active.has(g.id)) return false;
          const since = finalSince.get(g.id) ?? now;
          finalSince.set(g.id, since);
          return now - since < FINAL_GRACE_MS;
        });
      }

      for (const g of habs) {
        if (isLive(g.gameState) || g.gameState === "PRE") active.add(g.id);
      }
      if (!cancelled) setGameId(pick?.id ?? null);
    };

    const tick = () => void resolve().catch(() => {});
    tick();
    const t = window.setInterval(tick, POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);

  return gameId;
}
