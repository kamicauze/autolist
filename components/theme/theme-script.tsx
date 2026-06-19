import { THEME_IDS, THEME_STORAGE_KEY, type ThemeId } from "@/lib/theme/themes";

function getThemeScript(initialTheme: ThemeId) {
  return `
(() => {
  try {
    const themes = ${JSON.stringify(THEME_IDS)};
    const initialTheme = ${JSON.stringify(initialTheme)};
    const storedTheme = window.localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const currentTheme = document.documentElement.dataset.theme;
    const nextTheme = themes.includes(storedTheme)
      ? storedTheme
      : themes.includes(currentTheme)
        ? currentTheme
        : initialTheme;

    document.documentElement.dataset.theme = nextTheme;
  } catch {
    document.documentElement.dataset.theme = ${JSON.stringify(initialTheme)};
  }
})();
`;
}

type ThemeScriptProps = {
  initialTheme: ThemeId;
};

export function ThemeScript({ initialTheme }: ThemeScriptProps) {
  return (
    <script
      id="autolist-theme-script"
      dangerouslySetInnerHTML={{ __html: getThemeScript(initialTheme) }}
    />
  );
}
