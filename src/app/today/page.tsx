import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

type Game = {
  id: number;
  gameType: number;
  gameState: string;
  awayTeam: { abbrev: string; logo?: string };
  homeTeam: { abbrev: string; logo?: string };
};

async function fetchScoreNow(): Promise<{ games?: Game[] }> {
  const res = await fetch("https://api-web.nhle.com/v1/score/now", {
    next: { revalidate: 15 },
  });
  if (!res.ok) throw new Error("Score feed unavailable");
  return res.json();
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
          <Link href="/overlay?game=2025030151" className="text-sky-400 underline">
            /overlay?game=…
          </Link>{" "}
          with a game ID.
        </p>
      </main>
    );
  }

  const games = data.games ?? [];
  const playoff = games.filter((g) => g.gameType === 3);
  const live = playoff.filter(
    (g) => g.gameState === "LIVE" || g.gameState === "CRIT",
  );

  if (live.length === 1) {
    redirect(`/overlay?game=${live[0]!.id}`);
  }

  if (live.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-200">
        <h1 className="text-center text-xl font-bold text-white">
          No live playoff games
        </h1>
        <p className="mt-4 text-center text-slate-400">
          Check back during the Stanley Cup Playoffs, or use a direct game link.
        </p>
        <p className="mt-8 text-center text-sm">
          <Link href="/overlay?game=2025030151" className="text-sky-400 underline">
            Example overlay
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-200">
      <h1 className="mb-8 text-center text-2xl font-bold text-white">
        Live playoff games
      </h1>
      <ul className="mx-auto grid max-w-lg gap-4">
        {live.map((g) => (
          <li key={g.id}>
            <Link
              href={`/overlay?game=${g.id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-4 transition hover:border-sky-500/40"
            >
              <div className="flex items-center gap-3">
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
              </div>
              <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs font-semibold uppercase text-emerald-300">
                Live
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
