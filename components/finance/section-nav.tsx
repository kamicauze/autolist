"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface GuideSectionLink {
  id: string;
  label: string;
}

const FALLBACK_HEADER_HEIGHT = 64;

function measureSiteHeader() {
  const header = document.querySelector<HTMLElement>("header.sticky");
  return header ? Math.round(header.getBoundingClientRect().height) : FALLBACK_HEADER_HEIGHT;
}

/**
 * Sticky in-page section tabs. Sits directly under the site header, highlights the
 * section currently in view and scrolls horizontally on small screens.
 */
export function SectionNav({ sections }: { sections: GuideSectionLink[] }) {
  const [activeId, setActiveId] = React.useState(sections[0]?.id ?? "");
  const [headerHeight, setHeaderHeight] = React.useState<number | null>(null);
  const navRef = React.useRef<HTMLElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const sectionIds = React.useMemo(() => sections.map((section) => section.id), [sections]);

  React.useEffect(() => {
    const update = () => setHeaderHeight(measureSiteHeader());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  React.useEffect(() => {
    const elements = sectionIds
      .map((sectionId) => document.getElementById(sectionId))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const topOffset = (headerHeight ?? FALLBACK_HEADER_HEIGHT) + (navRef.current?.offsetHeight ?? 0);
    const visibility = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visibility.set(entry.target.id, entry.isIntersecting);
        const firstVisible = sectionIds.find((sectionId) => visibility.get(sectionId));
        if (firstVisible) setActiveId(firstVisible);
      },
      { rootMargin: `-${topOffset + 8}px 0px -55% 0px`, threshold: 0 }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sectionIds, headerHeight]);

  React.useEffect(() => {
    const list = listRef.current;
    const activeLink = list?.querySelector<HTMLElement>(`[data-section="${activeId}"]`);
    if (!list || !activeLink || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: activeLink.offsetLeft - list.clientWidth / 2 + activeLink.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [activeId]);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
    window.history.replaceState(null, "", `#${sectionId}`);
    setActiveId(sectionId);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Guide sections"
      className="sticky top-16 z-40 border-b border-border bg-background/95 backdrop-blur"
      style={headerHeight === null ? undefined : { top: headerHeight }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ul
          ref={listRef}
          className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  data-section={section.id}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => handleClick(event, section.id)}
                  className={cn(
                    "block whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
