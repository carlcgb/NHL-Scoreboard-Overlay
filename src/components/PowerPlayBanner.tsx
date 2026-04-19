"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatClock } from "@/lib/formatters";
import type { GameViewModel } from "@/lib/nhl-api";

type Props = {
  view: GameViewModel;
};

function PowerPlayBannerInner({ view }: Props) {
  const st = view.specialTeams;
  const show =
    st &&
    !view.isFinal &&
    !view.inIntermission &&
    view.gameState !== "PRE";

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="pp"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full px-3 pb-1"
        >
          <div className="flex items-center gap-2 rounded-md border border-amber-400/40 bg-gradient-to-r from-amber-500/95 to-yellow-500/90 px-4 py-1.5 shadow-lg shadow-amber-900/40">
            <span className="text-lg leading-none" aria-hidden>
              ⚡
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-slate-900">
              Power Play {st.powerPlayAbbrev}{" "}
              <span className="font-mono tabular-nums">{formatClock(view.clockTime)}</span>
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-800/80">
              · PK {st.penaltyKillAbbrev}
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const PowerPlayBanner = memo(PowerPlayBannerInner);
