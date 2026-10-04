"use client";

import { useEffect } from "react";

const CORNERS = ["tl", "tr", "bl", "br"] as const;
export type Corner = (typeof CORNERS)[number];

export function isCorner(v: string | null): v is Corner {
  return CORNERS.some((c) => c === v);
}

const CORNER_CLASS: Record<Corner, string> = {
  tl: "items-start justify-start",
  tr: "items-start justify-end",
  bl: "items-end justify-start",
  br: "items-end justify-end",
};

type Props = {
  children: React.ReactNode;
  /** Narrow 9:16-style frame: tighter horizontal padding, top-safe layout for TikTok etc. */
  vertical?: boolean;
  /** Slim pill pinned to a corner instead of a centered card */
  compact?: boolean;
  /** Corner for the compact pill (default top-left) */
  position?: Corner;
};

export function OverlayChrome({
  children,
  vertical = false,
  compact = false,
  position = "tl",
}: Props) {
  useEffect(() => {
    document.documentElement.setAttribute("data-transparent", "true");
    document.documentElement.style.background = "transparent";
    document.body.setAttribute("data-transparent", "true");
    if (vertical) {
      document.body.setAttribute("data-overlay", "vertical");
    }
    return () => {
      document.documentElement.removeAttribute("data-transparent");
      document.documentElement.style.background = "";
      document.body.setAttribute("data-transparent", "false");
      document.body.removeAttribute("data-overlay");
    };
  }, [vertical]);

  if (compact) {
    return (
      <div
        className={`pointer-events-none fixed inset-0 flex overflow-hidden p-3 ${CORNER_CLASS[position]}`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 flex justify-center overflow-hidden ${
        vertical
          ? "items-start px-2 pt-3 sm:px-4 sm:pt-5"
          : "items-start pt-6"
      }`}
    >
      {children}
    </div>
  );
}
