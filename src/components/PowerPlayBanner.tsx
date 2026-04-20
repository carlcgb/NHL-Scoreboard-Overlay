"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatClock } from "@/lib/formatters";
import type { GameViewModel } from "@/lib/nhl-api";

type Props = {
  view: GameViewModel;
  layout?: "horizontal" | "vertical";
};

function PowerPlayBannerInner({ view, layout = "horizontal" }: Props) {
  const st = view.specialTeams;
  const show =
    st &&
    !view.isFinal &&
    !view.inIntermission &&
    view.gameState !== "PRE";

  const vertical = layout === "vertical";

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="pp"
          initial={{ opacity: 0, y: vertical ? -6 : -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: vertical ? -4 : -8 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className={
            vertical
              ? "pointer-events-none relative z-20 w-full px-2 pb-2 pt-1"
              : "pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full px-3 pb-1"
          }
        >
          <div
            className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border border-amber-400/50 bg-gradient-to-r from-amber-500/95 to-yellow-500/90 shadow-lg shadow-amber-900/40 ${
              vertical
                ? "mx-auto w-full max-w-[min(100%,28rem)] px-3 py-2.5"
                : "px-4 py-1.5"
            }`}
          >
            <span className={`leading-none ${vertical ? "text-2xl" : "text-lg"}`} aria-hidden>
              ⚡
            </span>
            <span
              className={`font-black uppercase tracking-wide text-slate-900 ${vertical ? "text-sm sm:text-base" : "text-xs tracking-widest"}`}
            >
              Power Play {st.powerPlayAbbrev}{" "}
              <span className="font-mono tabular-nums">{formatClock(view.clockTime)}</span>
            </span>
            <span
              className={`font-bold uppercase text-slate-800/90 ${vertical ? "text-xs" : "text-[10px]"}`}
            >
              · PK {st.penaltyKillAbbrev}
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const PowerPlayBanner = memo(PowerPlayBannerInner);
