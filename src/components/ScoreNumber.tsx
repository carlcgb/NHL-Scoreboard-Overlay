"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  value: number;
  /** Bump the digit when a goal was just scored */
  pulse?: boolean;
  className?: string;
};

/** A score that slides in when it changes, instead of snapping. */
function ScoreNumberInner({ value, pulse = false, className = "" }: Props) {
  return (
    <motion.span
      animate={
        pulse
          ? {
              scale: [1, 1.18, 1],
              filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"],
            }
          : { scale: 1, filter: "brightness(1)" }
      }
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative inline-flex overflow-hidden px-0.5 font-mono font-black tabular-nums leading-none text-white ${className}`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "70%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-70%", opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}

export const ScoreNumber = memo(ScoreNumberInner);
