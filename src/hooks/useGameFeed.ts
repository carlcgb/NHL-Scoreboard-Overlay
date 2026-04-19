"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type GameViewModel,
  mergeGameState,
  fetchBoxscore,
  fetchLanding,
  fetchPlayByPlay,
  type BoxscoreResponse,
  type LandingResponse,
} from "@/lib/nhl-api";
import {
  INTERVAL_FAST_MS,
  INTERVAL_SLOW_MS,
  nextBackoffMs,
  shouldUseFastInterval,
} from "@/lib/polling";

export interface MockOverride {
  awayScore?: number;
  homeScore?: number;
  clockTime?: string;
  periodLabel?: string;
  powerPlayAbbrev?: string | null;
  inIntermission?: boolean;
  isFinal?: boolean;
}

interface UseGameFeedOptions {
  gameId: number | null;
  mock?: MockOverride | null;
  mockOnly?: boolean;
}

function applyMock(base: GameViewModel, mock: MockOverride | null): GameViewModel {
  if (!mock) return base;
  let next = { ...base };
  if (mock.awayScore !== undefined) {
    next = {
      ...next,
      away: { ...next.away, score: mock.awayScore },
    };
  }
  if (mock.homeScore !== undefined) {
    next = {
      ...next,
      home: { ...next.home, score: mock.homeScore },
    };
  }
  if (mock.clockTime !== undefined) {
    next = { ...next, clockTime: mock.clockTime };
  }
  if (mock.inIntermission !== undefined) {
    next = { ...next, inIntermission: mock.inIntermission };
  }
  if (mock.isFinal !== undefined) {
    next = {
      ...next,
      isFinal: mock.isFinal,
      gameState: mock.isFinal ? "OFF" : next.gameState,
    };
  }
  if (mock.powerPlayAbbrev) {
    const adv = mock.powerPlayAbbrev;
    const other =
      adv === next.home.abbrev ? next.away.abbrev : next.home.abbrev;
    next = {
      ...next,
      specialTeams: {
        mode: "pp",
        powerPlayAbbrev: adv,
        penaltyKillAbbrev: other,
      },
    };
  } else if (mock.powerPlayAbbrev === null) {
    next = { ...next, specialTeams: null };
  }
  return next;
}

function syntheticMockView(gameId: number, mock: MockOverride): GameViewModel {
  return {
    gameId,
    gameState: mock.isFinal ? "OFF" : "LIVE",
    gameType: 3,
    away: {
      abbrev: "AWY",
      name: "Away",
      score: mock.awayScore ?? 0,
      sog: 24,
      logo: "https://assets.nhle.com/logos/nhl/svg/NHL_light.svg",
    },
    home: {
      abbrev: "HOM",
      name: "Home",
      score: mock.homeScore ?? 0,
      sog: 22,
      logo: "https://assets.nhle.com/logos/nhl/svg/NHL_light.svg",
    },
    periodDescriptor: { number: 2, periodType: "REG" },
    clockTime: mock.clockTime ?? "12:34",
    clockRunning: true,
    inIntermission: mock.inIntermission ?? false,
    isFinal: mock.isFinal ?? false,
    isPreview: false,
    shootoutInUse: false,
    specialTeams: mock.powerPlayAbbrev
      ? {
          mode: "pp",
          powerPlayAbbrev: mock.powerPlayAbbrev,
          penaltyKillAbbrev:
            mock.powerPlayAbbrev === "HOM" ? "AWY" : "HOM",
        }
      : null,
    emptyNetSide: null,
    seriesText: null,
    situationCode: null,
  };
}

export function useGameFeed({ gameId, mock, mockOnly }: UseGameFeedOptions) {
  const [liveView, setLiveView] = useState<GameViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [goalSide, setGoalSide] = useState<"away" | "home" | null>(null);

  const landingCache = useRef<LandingResponse | null>(null);
  const tickCount = useRef(0);
  const backoffMs = useRef(0);
  const prevScores = useRef<{ away: number; home: number } | null>(null);

  const mockView = useMemo(() => {
    if (!gameId || !mockOnly || !mock) return null;
    return applyMock(syntheticMockView(gameId, mock), mock);
  }, [gameId, mockOnly, mock]);

  const view = useMemo(() => {
    if (!gameId) return null;
    if (mockOnly) return mockView;
    return liveView;
  }, [gameId, mockOnly, mockView, liveView]);

  const fetchOnce = useCallback(async (): Promise<GameViewModel | null> => {
    if (!gameId) return null;
    const box: BoxscoreResponse = await fetchBoxscore(gameId);
    if (!landingCache.current || landingCache.current.id !== gameId) {
      try {
        landingCache.current = await fetchLanding(gameId);
      } catch {
        landingCache.current = null;
      }
    }
    let pbp = null;
    tickCount.current += 1;
    const gs = box.gameState;
    const live = gs === "LIVE" || gs === "CRIT";
    if (live && tickCount.current % 5 === 0) {
      try {
        pbp = await fetchPlayByPlay(gameId);
      } catch {
        pbp = null;
      }
    }
    return mergeGameState(box, landingCache.current, pbp);
  }, [gameId]);

  useEffect(() => {
    landingCache.current = null;
    tickCount.current = 0;
    prevScores.current = null;
    backoffMs.current = 0;
  }, [gameId]);

  useEffect(() => {
    if (!gameId || mockOnly) return;

    let cancelled = false;

    const pulseGoal = (merged: GameViewModel) => {
      if (prevScores.current) {
        if (merged.away.score > prevScores.current.away) {
          setGoalSide("away");
          window.setTimeout(() => setGoalSide(null), 2800);
        } else if (merged.home.score > prevScores.current.home) {
          setGoalSide("home");
          window.setTimeout(() => setGoalSide(null), 2800);
        }
      }
      prevScores.current = {
        away: merged.away.score,
        home: merged.home.score,
      };
    };

    const run = async () => {
      while (!cancelled) {
        try {
          const merged = await fetchOnce();
          if (cancelled || !merged) break;
          const withMock = applyMock(merged, mock ?? null);
          pulseGoal(withMock);
          setLiveView(withMock);
          setError(null);
          backoffMs.current = 0;

          const fast = shouldUseFastInterval(withMock);
          const base = fast ? INTERVAL_FAST_MS : INTERVAL_SLOW_MS;
          await new Promise((r) => setTimeout(r, base));
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Fetch failed";
          setError(msg);
          backoffMs.current = nextBackoffMs(
            backoffMs.current || INTERVAL_SLOW_MS,
          );
          await new Promise((r) => setTimeout(r, backoffMs.current));
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [gameId, fetchOnce, mock, mockOnly]);

  return { view, error, goalSide };
}
