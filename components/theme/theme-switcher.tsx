"use client";

import * as React from "react";
import { Check, Palette } from "lucide-react";
import { THEMES, THEME_STORAGE_KEY, type ThemeId } from "@/lib/theme/themes";
import { cn } from "@/lib/utils";

const THEME_LABELS: Record<ThemeId, string> = {
  autolist: "Blue",
  "navy-red": "Navy",
  "navy-red-dark": "Dark",
};

type ThemeSwitcherProps = {
  layout?: "compact" | "mobile";
};

function getDocumentTheme(): ThemeId {
  const value = document.documentElement.dataset.theme;
  return THEMES.some((theme) => theme.id === value) ? (value as ThemeId) : "autolist";
}

export function ThemeSwitcher({ layout = "compact" }: ThemeSwitcherProps) {
  const [activeTheme, setActiveTheme] = React.useState<ThemeId>("autolist");

  React.useEffect(() => {
    setActiveTheme(getDocumentTheme());
  }, []);

  const setTheme = (themeId: ThemeId) => {
    document.documentElement.setAttribute("data-theme", themeId);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
    setActiveTheme(themeId);
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card/80 p-1",
        layout === "mobile" ? "space-y-2" : "hidden items-center gap-1 xl:flex"
      )}
      aria-label="Theme switcher"
    >
      {layout === "mobile" ? (
        <div className="flex items-center gap-2 px-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <Palette className="h-3.5 w-3.5" />
          Theme
        </div>
      ) : null}
      <div className={cn("grid gap-1", layout === "mobile" ? "grid-cols-3" : "grid-cols-3")}>
        {THEMES.map((theme) => {
          const isActive = activeTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className={cn(
                "group flex min-h-9 items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition",
                isActive
                  ? "border-primary bg-brand-tint text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                layout === "mobile" ? "min-h-11 px-2.5" : "w-9 px-0"
              )}
              aria-pressed={isActive}
              aria-label={`Use ${theme.name} theme`}
              title={theme.name}
            >
              <span
                className={cn(
                  "relative flex overflow-hidden rounded-full border border-border",
                  layout === "mobile" ? "h-4 w-4" : "h-5 w-5"
                )}
              >
                <span className="h-full flex-1" style={{ backgroundColor: theme.colors.primary }} />
                <span className="h-full flex-1" style={{ backgroundColor: theme.colors.secondary }} />
                {isActive && layout !== "mobile" ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                    <Check className="h-3 w-3" />
                  </span>
                ) : null}
              </span>
              {layout === "mobile" ? <span>{THEME_LABELS[theme.id]}</span> : null}
              {isActive && layout === "mobile" ? <Check className="h-3.5 w-3.5" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
