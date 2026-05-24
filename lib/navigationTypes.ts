import type { LeadAction } from "./leads";

export type NavigationLocation = "header" | "footer";

export type NavLinkKind = "route" | "hash" | "external";

export interface HeaderNavItem {
  id: string;
  label: string;
  label_es?: string | null;
  href?: string;
  linkKind?: NavLinkKind;
  action?: LeadAction;
  opensInNewTab?: boolean;
  children?: HeaderNavItem[];
}

export interface HeaderNavigation {
  items: HeaderNavItem[];
}

export interface FooterNavLink {
  id: string;
  label: string;
  label_es?: string | null;
  href?: string;
  linkKind?: NavLinkKind;
  action?: LeadAction;
  opensInNewTab?: boolean;
}

export interface FooterNavGroup {
  title: string;
  title_es?: string | null;
  items: FooterNavLink[];
}

export interface FooterNavigation {
  groups: FooterNavGroup[];
}

export interface PortalNavigation {
  header: HeaderNavigation;
  footer: FooterNavigation;
}
