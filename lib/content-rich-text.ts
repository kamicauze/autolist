const ALLOWED_TAGS = new Set([
  "a",
  "blockquote",
  "br",
  "em",
  "h2",
  "h3",
  "li",
  "ol",
  "p",
  "s",
  "strong",
  "u",
  "ul",
]);

const BLOCK_TAGS = new Set(["blockquote", "h2", "h3", "li", "ol", "p", "ul"]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function containsHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function normalizeTagName(tagName: string) {
  if (tagName === "b") return "strong";
  if (tagName === "i") return "em";
  return tagName.toLowerCase();
}

function sanitizeHref(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return escapeHtml(trimmed);

  try {
    const parsed = new URL(trimmed);
    if (["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
      return escapeHtml(trimmed);
    }
  } catch {
    return "";
  }

  return "";
}

function plainTextToHtml(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/g)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function sanitizeContentHtml(value: string) {
  if (!value.trim()) return "";

  return value
    .replace(/\r\n/g, "\n")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z][a-z0-9]*)([^>]*)>/gi, (match, rawTagName, rawAttributes) => {
      const tagName = normalizeTagName(rawTagName);
      const isClosing = /^<\//.test(match);

      if (!ALLOWED_TAGS.has(tagName)) {
        return "";
      }

      if (tagName === "br") {
        return "<br>";
      }

      if (isClosing) {
        return `</${tagName}>`;
      }

      if (tagName === "a") {
        const hrefMatch = String(rawAttributes).match(/\shref=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        const href = sanitizeHref(hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? "");
        return href ? `<a href="${href}" target="_blank" rel="noopener noreferrer">` : "<a>";
      }

      return `<${tagName}>`;
    })
    .replace(/<(p|h2|h3|blockquote)>\s*<\/\1>/gi, "")
    .trim();
}

export function normalizeRichTextContent(value: string) {
  const normalized = value.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";
  return containsHtml(normalized) ? sanitizeContentHtml(normalized) : plainTextToHtml(normalized);
}

export function getContentPlainText(value: string) {
  const html = normalizeRichTextContent(value);
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h2|h3|li|blockquote)>/gi, "\n")
    .replace(/<\/?(ol|ul)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function hasRichTextContent(value: string) {
  return getContentPlainText(value).length > 0;
}

export function getContentSummary(value: string, maxLength = 180) {
  const text = getContentPlainText(value).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

export function getRichTextBlockTags() {
  return BLOCK_TAGS;
}
