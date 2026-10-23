"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatClockSeconds,
  parseClockSeconds,
} from "@/lib/formatters";
import type { GameViewModel } from "@/lib/nhl-api";

/** Repaint rate while a clock is running; text only changes once a second. */
const TICK_MS = 200;
/**
 * The NHL feed is cached for several seconds, so its clock arrives in steps.
 * Count down locally and only jump when we have drifted past this.
 */
const RESYNC_AFTER_S = 1.5;
/** A frozen feed (stoppage the flag hasn't caught up with) must not run on forever. */
const MAX_EXTRAPOLATE_S = 10;

type Anchor = { seconds: number; at: number; running: boolean; key: string };

/**
 * Smoothly counts a feed clock ("8:42") down between polls.
 * `key` identifies the clock's context (period, intermission…): a new key
 * always snaps to the feed value. Returns "" for a null clock.
 */
export function useSmoothClock(
  clockTime: string | null | undefined,
  running: boolean,
  key: string,
): string {
  const [text, setText] = useState(clockTime ?? "");
  const anchor = useRef<Anchor | null>(null);

  useEffect(() => {
    const server = parseClockSeconds(clockTime);
    if (server === null) {
      anchor.current = null;
      return;
    }

    const now = performance.now();
    const prev = anchor.current;
    let seconds = server;
    if (prev && prev.running && running && prev.key === key) {
      const predicted = Math.max(
        0,
        prev.seconds - Math.min((now - prev.at) / 1000, MAX_EXTRAPOLATE_S),
      );
      if (Math.abs(server - predicted) <= RESYNC_AFTER_S) seconds = predicted;
    }
    anchor.current = { seconds, at: now, running, key };

    const paint = () => {
      const a = anchor.current;
      if (!a) return;
      const elapsed = Math.min(
        (performance.now() - a.at) / 1000,
        MAX_EXTRAPOLATE_S,
      );
      const left = a.running ? Math.max(0, a.seconds - elapsed) : a.seconds;
      // ceil: a clock showing 0:09.4 reads 0:10 until it passes 0:09.0
      setText(formatClockSeconds(Math.ceil(left)));
    };
    paint();
    if (!running) return;
    const id = window.setInterval(paint, TICK_MS);
    return () => window.clearInterval(id);
  }, [clockTime, running, key]);

  // Not an M:SS clock (e.g. "—"): show the feed text untouched
  if (parseClockSeconds(clockTime) === null) return clockTime ?? "";
  return text;
}

/** The game clock as text, counting down smoothly between feed updates. */
export function useGameClock(view: GameViewModel): string {
  const key = `${view.gameState}|${view.periodDescriptor?.number ?? 0}|${view.inIntermission}`;
  return useSmoothClock(view.clockTime, view.clockRunning, key);
}

/** Estimated penalty-kill clock, smoothed the same way; "" when unknown. */
export function usePowerPlayClock(view: GameViewModel): string {
  const key = `${view.periodDescriptor?.number ?? 0}|${view.specialTeams?.penaltyKillAbbrev ?? ""}`;
  return useSmoothClock(
    view.powerPlayClockTime,
    view.clockRunning && !view.inIntermission,
    key,
  );
}
