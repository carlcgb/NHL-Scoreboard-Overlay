import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

type Game = {
  id: number;
  gameType: number;
  gameState: string;
  startTimeUTC?: string;
  awayTeam: { abbrev: string; logo?: string };
  homeTeam: { abbrev: string; logo?: string };
};

function involvesMtl(g: Game): boolean {
  return g.awayTeam.abbrev === "MTL" || g.homeTeam.abbrev === "MTL";
}

/** Toronto calendar date YYYY-MM-DD for NHL /v1/score/{date} */
function easternDateString(d = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

/** Eastern (Toronto) puck drop, e.g. 7:00 p.m. ET */
function formatPuckDropEt(iso: string | undefined): string | null {
  if (!iso) return null;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return null;
  const t = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dt);
  return `${t} ET`;
}

function gameTypeShort(type: number): string | null {
  if (type === 3) return "PO";
  if (type === 2) return "RS";
  if (type === 1) return "PS";
  return null;
}

async function fetchScoreForEasternToday(): Promise<{ games?: Game[] }> {
  const date = easternDateString();
  const res = await fetch(`https://api-web.nhle.com/v1/score/${date}`, {
    next: { revalidate: 15 },
  });
  if (!res.ok) throw new Error("Score feed unavailable");
  return res.json();
}

function statusForGame(state: string): { label: string; className: string } {
  if (state === "LIVE" || state === "CRIT") {
    return { label: "Live", className: "bg-emerald-500/20 text-emerald-300" };
  }
  if (state === "PRE") {
    return { label: "Pregame", className: "bg-sky-500/20 text-sky-300" };
  }
  if (state === "FUT") {
    return { label: "Upcoming", className: "bg-amber-500/20 text-amber-200" };
  }
  if (state === "OFF" || state === "FINAL") {
    return { label: "Final", className: "bg-slate-500/20 text-slate-400" };
  }
  return { label: state, className: "bg-slate-600/30 text-slate-300" };
}

function GameListItem({
  g,
  statusLabel,
  statusClass,
}: {
  g: Game;
  statusLabel: string;
  statusClass: string;
}) {
  const timeEt = formatPuckDropEt(g.startTimeUTC);
  const typeTag = gameTypeShort(g.gameType);
  return (
    <li>
      <Link
        href={`/overlay?game=${g.id}`}
        className="flex flex-col gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-4 transition hover:border-sky-500/40 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-wrap items-center gap-3">
          {g.awayTeam.logo ? (
            <Image
              src={g.awayTeam.logo}
              alt=""
              width={40}
              height={40}
              unoptimized={g.awayTeam.logo.endsWith(".svg")}
            />
          ) : null}
          <span className="font-bold">{g.awayTeam.abbrev}</span>
          <span className="text-slate-500">@</span>
          <span className="font-bold">{g.homeTeam.abbrev}</span>
          {g.homeTeam.logo ? (
            <Image
              src={g.homeTeam.logo}
              alt=""
              width={40}
              height={40}
              unoptimized={g.homeTeam.logo.endsWith(".svg")}
            />
          ) : null}
          {timeEt ? (
            <span className="text-xs font-medium text-slate-500">{timeEt}</span>
          ) : null}
          {typeTag ? (
            <span
              className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500"
              title={
                g.gameType === 3
                  ? "Playoffs"
                  : g.gameType === 2
                    ? "Regular season"
                    : "Preseason"
              }
            >
              {typeTag}
            </span>
          ) : null}
        </div>
        <span
          className={`self-start rounded px-2 py-1 text-xs font-semibold uppercase sm:self-auto ${statusClass}`}
        >
          {statusLabel}
        </span>
      </Link>
    </li>
  );
}

function FullSchedule({
  games,
  title,
  subtitle,
}: {
  games: Game[];
  title: string;
  subtitle: string;
}) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-200">
      <h1 className="mb-2 text-center text-2xl font-bold text-white">{title}</h1>
      <p className="mb-8 text-center text-sm text-slate-400">{subtitle}</p>
      <ul className="mx-auto grid max-w-2xl gap-3">
        {games.map((g) => {
          const s = statusForGame(g.gameState);
          return (
            <GameListItem
              key={g.id}
              g={g}
              statusLabel={s.label}
              statusClass={s.className}
            />
          );
        })}
      </ul>
    </main>
  );
}

export default async function TodayPage() {
  let data: { games?: Game[] };
  try {
    data = await fetchScoreForEasternToday();
  } catch {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-200">
        <p className="text-center">Could not load today&apos;s schedule.</p>
        <p className="mt-4 text-center text-sm text-slate-500">
          Open{" "}
          <Link href="/overlay?game=2025030154" className="text-sky-400 underline">
            /overlay?game=…
          </Link>{" "}
          with a game ID.
        </p>
      </main>
    );
  }

  const raw = data.games ?? [];
  const todayGames = [...raw].sort((a, b) => {
    const ta = a.startTimeUTC ?? "";
    const tb = b.startTimeUTC ?? "";
    return ta.localeCompare(tb);
  });

  const liveToday = todayGames.filter(
    (g) => g.gameState === "LIVE" || g.gameState === "CRIT",
  );

  /** Never auto-open the overlay straight to a Montréal game (pick yourself). */
  if (liveToday.length === 1 && !involvesMtl(liveToday[0]!)) {
    redirect(`/overlay?game=${liveToday[0]!.id}`);
  }

  const dateLabel = easternDateString();
  const baseTitle = `NHL — ${dateLabel}`;
  const timeNote =
    "All games on the Toronto calendar day, Eastern puck times. PO = playoffs, RS = regular season.";

  if (todayGames.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-200">
        <h1 className="text-center text-xl font-bold text-white">{baseTitle}</h1>
        <p className="mt-4 text-center text-slate-400">No games scheduled.</p>
        <p className="mt-8 text-center text-sm">
          <Link href="/overlay?game=2025030154" className="text-sky-400 underline">
            Example overlay
          </Link>
        </p>
      </main>
    );
  }

  const soleLiveIsHabs =
    liveToday.length === 1 && involvesMtl(liveToday[0]!);
  const multiLive = liveToday.length >= 2;

  let subtitle: string;
  if (multiLive) {
    subtitle = `${liveToday.length} games live — full slate below. ${timeNote}`;
  } else if (soleLiveIsHabs) {
    subtitle = `Only Montréal is live — pick any game below. We don&apos;t auto-open the Habs overlay. ${timeNote}`;
  } else {
    subtitle = `Open any matchup for the overlay. ${timeNote}`;
  }

  return (
    <FullSchedule
      games={todayGames}
      title={baseTitle}
      subtitle={subtitle}
    />
  );
}
