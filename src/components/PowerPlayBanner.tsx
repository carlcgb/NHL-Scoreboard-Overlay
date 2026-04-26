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
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative z-[25] w-full overflow-hidden border-b border-yellow-600/60 bg-yellow-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
        >
          <div
            className={`flex w-full flex-col items-stretch justify-center gap-1 sm:flex-row sm:items-center sm:justify-center sm:gap-3 ${
              vertical ? "px-3 py-3 sm:px-4 sm:py-3.5" : "px-3 py-2.5 sm:px-4 sm:py-2.5"
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span
                className={`shrink-0 leading-none text-slate-900 ${vertical ? "text-2xl" : "text-xl sm:text-2xl"}`}
                aria-hidden
              >
                ⚡
              </span>
              <span
                className={`text-center font-black uppercase text-slate-900 ${vertical ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}
                style={{ textShadow: "0 1px 0 rgba(255,255,255,0.35)" }}
              >
                Power Play{" "}
                <span className="whitespace-nowrap">{st.powerPlayAbbrev}</span>
              </span>
              {view.powerPlayClockTime ? (
                <span
                  className={`font-mono font-black tabular-nums text-slate-950 ${vertical ? "text-base sm:text-lg" : "text-sm sm:text-base"}`}
                  title="Approx. PK time remaining (from penalty vs game clock)"
                >
                  {formatClock(view.powerPlayClockTime)}
                </span>
              ) : null}
            </div>
            <div
              className={`text-center font-bold uppercase text-slate-900/90 sm:border-l sm:border-slate-900/15 sm:pl-3 ${vertical ? "text-xs sm:text-sm" : "text-[11px] sm:text-xs"}`}
            >
              PK {st.penaltyKillAbbrev}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const PowerPlayBanner = memo(PowerPlayBannerInner);
