/** Tidy user-entered locations without rewriting spelling, acronyms or mixed case. */
export function normalizeLocationText(value: string): string {
  return value.trim().replace(/\s+/g, " ").replace(/\p{L}[\p{L}\p{N}'’.-]*/gu, (word) => {
    // Existing uppercase/mixed-case tokens may be abbreviations or proper names.
    if (word !== word.toLocaleLowerCase("en-KE")) return word;
    return word.replace(/(^|[-.])\p{L}/gu, (initial) => initial.toLocaleUpperCase("en-KE"));
  });
}
