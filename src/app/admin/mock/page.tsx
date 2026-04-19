"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { Scoreboard } from "@/components/Scoreboard";
import { useGameFeed, type MockOverride } from "@/hooks/useGameFeed";

const defaultMock: MockOverride = {
  awayScore: 2,
  homeScore: 3,
  clockTime: "8:42",
  powerPlayAbbrev: undefined,
  inIntermission: false,
  isFinal: false,
};

function MockInner() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const envKey = process.env.NEXT_PUBLIC_MOCK_KEY;
  const allowed =
    process.env.NODE_ENV !== "production" ||
    (Boolean(envKey) && key === envKey);

  const [mock, setMock] = useState<MockOverride>(defaultMock);
  const gameId = 2025030151;

  const mergedMock = useMemo(() => mock, [mock]);

  const { view, goalSide } = useGameFeed({
    gameId,
    mock: mergedMock,
    mockOnly: true,
  });

  if (!allowed) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-slate-200">
        <p>Mock admin is restricted in production. Set NEXT_PUBLIC_MOCK_KEY and pass ?key=…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-900 p-6 text-slate-100">
      <h1 className="mb-6 text-lg font-bold">Mock controls</h1>
      <div className="mb-8 flex max-w-xl flex-wrap gap-3">
        <button
          type="button"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          onClick={() =>
            setMock((m) => ({
              ...m,
              awayScore: (m.awayScore ?? 0) + 1,
            }))
          }
        >
          Away goal +1
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          onClick={() =>
            setMock((m) => ({
              ...m,
              homeScore: (m.homeScore ?? 0) + 1,
            }))
          }
        >
          Home goal +1
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          onClick={() =>
            setMock((m) =>
              m.powerPlayAbbrev
                ? { ...m, powerPlayAbbrev: null }
                : { ...m, powerPlayAbbrev: "HOM" },
            )
          }
        >
          Toggle power play
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          onClick={() =>
            setMock((m) => ({
              ...m,
              clockTime:
                m.clockTime === "8:42" ? "14:59" : "8:42",
            }))
          }
        >
          Swap clock
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          onClick={() =>
            setMock((m) => ({
              ...m,
              inIntermission: !m.inIntermission,
            }))
          }
        >
          Toggle intermission
        </button>
        <button
          type="button"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
          onClick={() =>
            setMock((m) => ({
              ...m,
              isFinal: !m.isFinal,
            }))
          }
        >
          Toggle final
        </button>
        <button
          type="button"
          className="rounded-lg bg-amber-600/80 px-4 py-2 text-sm font-medium hover:bg-amber-600"
          onClick={() => setMock({ ...defaultMock })}
        >
          Reset
        </button>
      </div>

      <div className="pointer-events-auto rounded-xl border border-white/10 bg-black/40 p-8">
        {view ? (
          <Scoreboard view={view} goalSide={goalSide} options={{ showShots: true }} />
        ) : null}
      </div>
    </main>
  );
}

export default function MockAdminPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading…</div>}>
      <MockInner />
    </Suspense>
  );
}
