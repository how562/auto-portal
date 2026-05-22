export function scrollTargetId(href: string): string {
  const hashIndex = href.indexOf("#");
  const fragment = hashIndex >= 0 ? href.slice(hashIndex + 1) : href;
  return fragment.replace(/^\//, "");
}

export function homeHashHref(href: string): string {
  return `/#${scrollTargetId(href)}`;
}
