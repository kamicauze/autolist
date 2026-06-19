import assert from "node:assert/strict";
import {
  DEFAULT_THEME_ID,
  getTheme,
  isThemeId,
  resolveThemeId,
  THEMES,
} from "./themes";

assert.equal(DEFAULT_THEME_ID, "autolist");
assert.deepEqual(
  THEMES.map((theme) => theme.id),
  ["autolist", "navy-red", "navy-red-dark"]
);

assert.equal(isThemeId("autolist"), true);
assert.equal(isThemeId("navy-red"), true);
assert.equal(isThemeId("navy-red-dark"), true);
assert.equal(isThemeId("unknown"), false);
assert.equal(resolveThemeId("navy-red"), "navy-red");
assert.equal(resolveThemeId("navy-red-dark"), "navy-red-dark");
assert.equal(resolveThemeId(""), DEFAULT_THEME_ID);
assert.equal(resolveThemeId(undefined), DEFAULT_THEME_ID);
assert.equal(resolveThemeId("unknown"), DEFAULT_THEME_ID);

const navyRedTheme = getTheme("navy-red");
assert.equal(navyRedTheme.name, "Navy + red");
assert.equal(navyRedTheme.colors.primary, "#14213D");
assert.equal(navyRedTheme.colors.secondary, "#B73843");
assert.equal(navyRedTheme.colors.surface, "#F4F6F9");

const navyRedDarkTheme = getTheme("navy-red-dark");
assert.equal(navyRedDarkTheme.name, "Navy + red dark");
assert.equal(navyRedDarkTheme.colors.primary, "#B73843");
assert.equal(navyRedDarkTheme.colors.secondary, "#F4F6F9");
assert.equal(navyRedDarkTheme.colors.surface, "#14213D");
assert.equal(navyRedDarkTheme.colors.base, "#0B1224");
