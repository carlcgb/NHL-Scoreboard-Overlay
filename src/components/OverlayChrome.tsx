"use client";

import { useEffect } from "react";

type Props = {
  children: React.ReactNode;
  /** Narrow 9:16-style frame: tighter horizontal padding, top-safe layout for TikTok etc. */
  vertical?: boolean;
};

export function OverlayChrome({ children, vertical = false }: Props) {
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
