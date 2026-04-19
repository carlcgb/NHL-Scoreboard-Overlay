import { formatSeriesLead } from "./formatters";

/** Base path for same-origin proxy (avoids CORS). */
export function apiPath(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `/api/nhl${p}`;
}

export interface PeriodDescriptor {
  number: number;
  periodType: string;
  maxRegulationPeriods?: number;
}

export interface TeamSide {
  id?: number;
  abbrev: string;
  score: number;
  sog: number;
  logo: string;
  /** Use on light backgrounds (e.g. logo tile); from NHL API when present */
  darkLogo?: string;
  name: string;
}

export interface GameViewModel {
  gameId: number;
  gameState: string;
  gameType: number;
  away: TeamSide;
  home: TeamSide;
  periodDescriptor?: PeriodDescriptor;
  clockTime: string;
  clockRunning: boolean;
  inIntermission: boolean;
  isFinal: boolean;
  isPreview: boolean;
  shootoutInUse: boolean;
  /** Derived special teams for banner */
  specialTeams: {
    mode: "pp" | "pk";
    /** Team with man advantage (PP) */
    powerPlayAbbrev: string;
    /** Team killing penalty */
    penaltyKillAbbrev: string;
  } | null;
  emptyNetSide: "home" | "away" | null;
  seriesText: string | null;
  /** Raw situation code when available */
  situationCode: string | null;
}

interface BoxTeam {
  id?: number;
  abbrev: string;
  score: number;
  sog: number;
  logo: string;
  darkLogo?: string;
  commonName?: { default: string };
  placeName?: { default: string };
  name?: { default: string };
}

export interface BoxscoreResponse {
  id: number;
  gameType: number;
  gameState: string;
  periodDescriptor?: PeriodDescriptor;
  awayTeam: BoxTeam;
  homeTeam: BoxTeam;
  clock?: {
    timeRemaining?: string;
    secondsRemaining?: number;
    running?: boolean;
    inIntermission?: boolean;
  };
  gameOutcome?: { lastPeriodType?: string };
  shootoutInUse?: boolean;
  /** Present on some live responses */
  situation?: {
    situationCode?: string;
    homeTeam?: { abbrev?: string; situationCode?: string };
    awayTeam?: { situationCode?: string };
  };
}

interface LandingTeam {
  id?: number;
  abbrev: string;
  score: number;
  sog: number;
  logo: string;
  commonName?: { default: string };
}

export interface LandingResponse {
  id: number;
  gameType: number;
  gameState: string;
  periodDescriptor?: PeriodDescriptor;
  awayTeam: LandingTeam;
  homeTeam: LandingTeam;
  shootoutInUse?: boolean;
  seriesStatus?: {
    topSeedTeamAbbrev?: string;
    topSeedWins?: number;
    bottomSeedTeamAbbrev?: string;
    bottomSeedWins?: number;
  };
}

export interface ScoreNowResponse {
  games?: Array<{
    id: number;
    gameType: number;
    gameState: string;
    gameDate: string;
    startTimeUTC: string;
    awayTeam: { abbrev: string; logo?: string; score?: number };
    homeTeam: { abbrev: string; logo?: string; score?: number };
    seriesStatus?: LandingResponse["seriesStatus"];
  }>;
}

interface PlayByPlayResponse {
  gameState?: string;
  plays?: Array<{ situationCode?: string; sortOrder?: number }>;
}

function teamName(t: BoxTeam | LandingTeam): string {
  if (t.commonName?.default) return t.commonName.default;
  if ("placeName" in t && t.placeName?.default) return t.placeName.default;
  return t.abbrev;
}

/**
 * NHL situationCode: digit[1]=away skaters, digit[2]=home skaters on ice.
 * Verified against 1551 (5v5), 1451 (4v5), 0641 (6v4 EN).
 */
export function parseSituationCode(
  code: string,
  homeAbbrev: string,
  awayAbbrev: string,
): {
  awaySkaters: number;
  homeSkaters: number;
  emptyNetSide: "home" | "away" | null;
  powerPlayAbbrev: string | null;
  penaltyKillAbbrev: string | null;
} {
  if (code.length !== 4) {
    return {
      awaySkaters: 5,
      homeSkaters: 5,
      emptyNetSide: null,
      powerPlayAbbrev: null,
      penaltyKillAbbrev: null,
    };
  }
  const awaySkaters = parseInt(code[1]!, 10);
  const homeSkaters = parseInt(code[2]!, 10);
  const head = code[0]!;
  const tail = code[3]!;

  let emptyNetSide: "home" | "away" | null = null;
  if (head === "0" && awaySkaters >= 6) {
    emptyNetSide = "away";
  }
  if (tail === "0") {
    emptyNetSide = "home";
  }

  let powerPlayAbbrev: string | null = null;
  let penaltyKillAbbrev: string | null = null;

  if (homeSkaters > awaySkaters) {
    powerPlayAbbrev = homeAbbrev;
    penaltyKillAbbrev = awayAbbrev;
  } else if (awaySkaters > homeSkaters) {
    powerPlayAbbrev = awayAbbrev;
    penaltyKillAbbrev = homeAbbrev;
  }

  return {
    awaySkaters,
    homeSkaters,
    emptyNetSide,
    powerPlayAbbrev,
    penaltyKillAbbrev,
  };
}

function extractSituationCode(
  box: BoxscoreResponse,
  landing: LandingResponse | null,
  pbp: PlayByPlayResponse | null,
): string | null {
  const b = box as BoxscoreResponse & { situationCode?: string };
  if (b.situation?.situationCode) return b.situation.situationCode;
  if (b.situationCode) return b.situationCode;
  if (landing && (landing as { situation?: { situationCode?: string } }).situation?.situationCode) {
    return (landing as { situation?: { situationCode?: string } }).situation!.situationCode!;
  }
  if (pbp?.plays?.length) {
    let last = pbp.plays[pbp.plays.length - 1];
    for (let i = pbp.plays.length - 1; i >= 0; i--) {
      const pl = pbp.plays[i]!;
      if (pl.situationCode) {
        last = pl;
        break;
      }
    }
    if (last?.situationCode) return last.situationCode;
  }
  return null;
}

export function mergeGameState(
  box: BoxscoreResponse,
  landing: LandingResponse | null,
  pbp: PlayByPlayResponse | null,
): GameViewModel {
  const homeAbbrev = box.homeTeam.abbrev;
  const awayAbbrev = box.awayTeam.abbrev;

  const away: TeamSide = {
    id: box.awayTeam.id,
    abbrev: awayAbbrev,
    score: box.awayTeam.score,
    sog: box.awayTeam.sog,
    logo: box.awayTeam.logo,
    darkLogo: box.awayTeam.darkLogo,
    name: teamName(box.awayTeam),
  };

  const home: TeamSide = {
    id: box.homeTeam.id,
    abbrev: homeAbbrev,
    score: box.homeTeam.score,
    sog: box.homeTeam.sog,
    logo: box.homeTeam.logo,
    darkLogo: box.homeTeam.darkLogo,
    name: teamName(box.homeTeam),
  };

  const gs = box.gameState;
  const isFinal = gs === "OFF" || gs === "FINAL";
  const isPreview = gs === "PRE" || gs === "FUT";

  const situationCode = extractSituationCode(box, landing, pbp);
  let specialTeams: GameViewModel["specialTeams"] = null;
  let emptyNetSide: "home" | "away" | null = null;

  if (situationCode && situationCode !== "1551" && !isFinal) {
    const p = parseSituationCode(situationCode, homeAbbrev, awayAbbrev);
    emptyNetSide = p.emptyNetSide;
    if (p.powerPlayAbbrev && p.penaltyKillAbbrev) {
      specialTeams = {
        mode: "pp",
        powerPlayAbbrev: p.powerPlayAbbrev,
        penaltyKillAbbrev: p.penaltyKillAbbrev,
      };
    }
  }

  let seriesText: string | null = null;
  const ss = landing?.seriesStatus;
  if (
    ss?.topSeedTeamAbbrev &&
    ss.bottomSeedTeamAbbrev &&
    ss.topSeedWins !== undefined &&
    ss.bottomSeedWins !== undefined
  ) {
    seriesText = formatSeriesLead(
      ss.topSeedTeamAbbrev,
      ss.topSeedWins,
      ss.bottomSeedTeamAbbrev,
      ss.bottomSeedWins,
    );
  }

  const clockTime = box.clock?.timeRemaining ?? "0:00";
  const clockRunning = box.clock?.running === true;
  const inIntermission = box.clock?.inIntermission === true;

  return {
    gameId: box.id,
    gameState: gs,
    gameType: box.gameType,
    away,
    home,
    periodDescriptor: box.periodDescriptor,
    clockTime,
    clockRunning,
    inIntermission,
    isFinal,
    isPreview,
    shootoutInUse: box.shootoutInUse === true,
    specialTeams,
    emptyNetSide,
    seriesText,
    situationCode,
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = apiPath(path);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`NHL API ${res.status}: ${t.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchBoxscore(gameId: number): Promise<BoxscoreResponse> {
  return fetchJson<BoxscoreResponse>(`/v1/gamecenter/${gameId}/boxscore`);
}

export async function fetchLanding(gameId: number): Promise<LandingResponse> {
  return fetchJson<LandingResponse>(`/v1/gamecenter/${gameId}/landing`);
}

export async function fetchScoreNow(): Promise<ScoreNowResponse> {
  return fetchJson<ScoreNowResponse>("/v1/score/now");
}

export async function fetchPlayByPlay(
  gameId: number,
): Promise<PlayByPlayResponse> {
  return fetchJson<PlayByPlayResponse>(
    `/v1/gamecenter/${gameId}/play-by-play`,
  );
}

/** Filter playoff games that are live or critical */
export function filterPlayoffLiveGames(score: ScoreNowResponse) {
  const games = score.games ?? [];
  return games.filter(
    (g) =>
      g.gameType === 3 &&
      (g.gameState === "LIVE" ||
        g.gameState === "CRIT" ||
        g.gameState === "PRE"),
  );
}

export function pickLivePlayoffGame(
  score: ScoreNowResponse,
): number | "none" | "multiple" {
  const live = (score.games ?? []).filter(
    (g) => g.gameType === 3 && (g.gameState === "LIVE" || g.gameState === "CRIT"),
  );
  if (live.length === 1) return live[0]!.id;
  if (live.length === 0) return "none";
  return "multiple";
}
