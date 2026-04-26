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

/** Eastern (Toronto) puck drop, e.g. 7:00 p.m. ET */
function formatPuckDropEt(iso: string | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const t = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${t} ET`;
}

async function fetchScoreNow(): Promise<{ games?: Game[] }> {
  const res = await fetch("https://api-web.nhle.com/v1/score/now", {
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

export default async function TodayPage() {
  let data: { games?: Game[] };
  try {
    data = await fetchScoreNow();
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

  const games = data.games ?? [];
  const playoff = games
    .filter((g) => g.gameType === 3)
    .sort((a, b) => {
      const ta = a.startTimeUTC ?? "";
      const tb = b.startTimeUTC ?? "";
      return ta.localeCompare(tb);
    });

  const livePlayoff = playoff.filter(
    (g) => g.gameState === "LIVE" || g.gameState === "CRIT",
  );

  /** Never auto-open the overlay straight to a Montréal game (pick yourself). */
  if (livePlayoff.length === 1 && !involvesMtl(livePlayoff[0]!)) {
    redirect(`/overlay?game=${livePlayoff[0]!.id}`);
  }

  if (livePlayoff.length >= 2) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-200">
        <h1 className="mb-8 text-center text-2xl font-bold text-white">
          Live playoff games
        </h1>
        <ul className="mx-auto grid max-w-lg gap-4">
          {livePlayoff.map((g) => (
            <GameListItem
              key={g.id}
              g={g}
              statusLabel="Live"
              statusClass="bg-emerald-500/20 text-emerald-300"
            />
          ))}
        </ul>
      </main>
    );
  }

  if (playoff.length > 0) {
    const soleLiveIsHabs =
      livePlayoff.length === 1 && involvesMtl(livePlayoff[0]!);
    const subtitle = soleLiveIsHabs
      ? "Only Montréal is live — pick a game below (Eastern puck times). We don&apos;t auto-open the Habs overlay."
      : "Nothing live right now — open any game for the overlay. Times are Eastern (e.g. 7:00 / 7:30 p.m. ET).";

    return (
      <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-200">
        <h1 className="mb-2 text-center text-2xl font-bold text-white">
          Today&apos;s playoff games
        </h1>
        <p className="mb-8 text-center text-sm text-slate-400">{subtitle}</p>
        <ul className="mx-auto grid max-w-lg gap-4">
          {playoff.map((g) => {
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

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-200">
      <h1 className="text-center text-xl font-bold text-white">
        No playoff games on the board
      </h1>
      <p className="mt-4 text-center text-slate-400">
        Check back during the Stanley Cup Playoffs, or use a direct game link.
      </p>
      <p className="mt-8 text-center text-sm">
        <Link href="/overlay?game=2025030154" className="text-sky-400 underline">
          Example overlay
        </Link>
      </p>
    </main>
  );
}
