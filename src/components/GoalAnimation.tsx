"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  active: boolean;
  side: "away" | "home" | null;
};

function GoalAnimationInner({ active, side }: Props) {
  return (
    <AnimatePresence>
      {active && side ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"
        >
          <div className="rounded-lg border border-white/30 bg-red-600/95 px-8 py-3 shadow-2xl shadow-red-900/50">
            <span className="text-2xl font-black uppercase italic tracking-[0.3em] text-white">
              Goal
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export const GoalAnimation = memo(GoalAnimationInner);
