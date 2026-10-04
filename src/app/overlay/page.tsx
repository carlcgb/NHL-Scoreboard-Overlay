"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OverlayView } from "@/components/OverlayView";

function OverlayFromQuery() {
  const gameStr = useSearchParams().get("game");
  const gameId = gameStr ? parseInt(gameStr, 10) : NaN;
  return <OverlayView gameId={Number.isFinite(gameId) ? gameId : null} />;
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
      <OverlayFromQuery />
    </Suspense>
  );
}
