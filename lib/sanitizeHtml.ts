/**
 * Minimal HTML sanitizer for CMS custom_html blocks.
 * Allows common formatting tags only; strips scripts, handlers, and embeds.
 */

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "span",
  "div",
]);

const FORBIDDEN_BLOCK = /<(script|style|iframe|object|embed|form|input|button|link|meta|base)[\s>]/gi;
const EVENT_HANDLERS = /\s(on\w+|style)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_URL = /href\s*=\s*["']\s*javascript:/gi;

function stripDisallowedTags(html: string): string {
  return html.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag: string) => {
    const name = tag.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (match.startsWith("</")) return `</${name}>`;
    if (name === "a") {
      const hrefMatch = match.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const href = hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "";
      if (/^\s*javascript:/i.test(href)) return "";
      const safeHref = href.replace(/"/g, "&quot;");
      return `<a href="${safeHref}" rel="noopener noreferrer">`;
    }
    return `<${name}>`;
  });
}

export function sanitizeCmsHtml(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  let html = raw.trim();
  html = html.replace(FORBIDDEN_BLOCK, "");
  html = html.replace(EVENT_HANDLERS, "");
  html = html.replace(JAVASCRIPT_URL, 'href="#"');
  html = stripDisallowedTags(html);

  const textOnly = html.replace(/<[^>]+>/g, "").trim();
  return textOnly.length > 0 ? html : null;
}

export function isProbablySafeHtml(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  if (FORBIDDEN_BLOCK.test(raw)) return false;
  if (EVENT_HANDLERS.test(raw)) return false;
  return sanitizeCmsHtml(raw) !== null;
}
