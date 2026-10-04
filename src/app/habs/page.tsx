"use client";

import { Suspense } from "react";
import { OverlayView } from "@/components/OverlayView";
import { useHabsGame } from "@/hooks/useHabsGame";

/**
 * Static URL for every Canadiens game: finds today's MTL game itself and
 * renders nothing (fully transparent) when there isn't one.
 */
function HabsOverlay() {
  const gameId = useHabsGame();
  return <OverlayView gameId={gameId} defaultCompact quiet />;
}

export default function HabsPage() {
  return (
    <Suspense fallback={null}>
      <HabsOverlay />
    </Suspense>
  );
}
