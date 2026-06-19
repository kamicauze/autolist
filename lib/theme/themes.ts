export const THEME_STORAGE_KEY = "autolist-theme";
export const DEFAULT_THEME_ID = "autolist";

export type ThemeId = "autolist" | "navy-red" | "navy-red-dark";

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    text: string;
    surface: string;
    base: string;
  };
};

export const THEMES = [
  {
    id: "autolist",
    name: "Autolist blue",
    colors: {
      primary: "#2563EB",
      secondary: "#F2994A",
      text: "#0A0A0A",
      surface: "#F5F6FA",
      base: "#FFFFFF",
    },
  },
  {
    id: "navy-red",
    name: "Navy + red",
    colors: {
      primary: "#14213D",
      secondary: "#B73843",
      text: "#1A1A1A",
      surface: "#F4F6F9",
      base: "#FFFFFF",
    },
  },
  {
    id: "navy-red-dark",
    name: "Navy + red dark",
    colors: {
      primary: "#B73843",
      secondary: "#F4F6F9",
      text: "#F4F6F9",
      surface: "#14213D",
      base: "#0B1224",
    },
  },
] as const satisfies ReadonlyArray<ThemeDefinition>;

export const THEME_IDS = THEMES.map((theme) => theme.id) as ThemeId[];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEME_IDS.includes(value as ThemeId);
}

export function resolveThemeId(value: unknown): ThemeId {
  return isThemeId(value) ? value : DEFAULT_THEME_ID;
}

export function getTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
