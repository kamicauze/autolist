"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";

export function BackToTopButton() {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-5 right-5 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-gray-50 sm:bottom-6 sm:right-6"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
