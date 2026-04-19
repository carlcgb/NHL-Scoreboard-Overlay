"use client";

import { useEffect } from "react";

export function OverlayChrome({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("data-transparent", "true");
    document.documentElement.style.background = "transparent";
    document.body.setAttribute("data-transparent", "true");
    return () => {
      document.documentElement.removeAttribute("data-transparent");
      document.documentElement.style.background = "";
      document.body.setAttribute("data-transparent", "false");
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 flex items-start justify-center overflow-hidden pt-6">
      {children}
    </div>
  );
}
