import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-slate-950 px-6 py-16 text-center text-slate-200">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Playoffs scoreboard overlay
        </h1>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Browser source for OBS / TikTok Live Studio. Transparent background on the overlay route.
        </p>
      </div>
      <nav className="flex flex-col gap-4 text-sky-400 sm:flex-row sm:gap-8">
        <Link href="/today" className="underline underline-offset-4 hover:text-sky-300">
          Today — pick live playoff game
        </Link>
        <Link
          href="/overlay?game=2025030151"
          className="underline underline-offset-4 hover:text-sky-300"
        >
          Overlay — example game ID
        </Link>
        <Link href="/admin/mock" className="underline underline-offset-4 hover:text-sky-300">
          Admin mock
        </Link>
      </nav>
    </main>
  );
}
