export function isGuidedDiscoveryHref(href: string): boolean {
  const normalized = href.trim().toLowerCase();
  return (
    normalized === "#guided-discovery" ||
    normalized === "/#guided-discovery" ||
    normalized === "/start" ||
    normalized.startsWith("action:guided")
  );
}
