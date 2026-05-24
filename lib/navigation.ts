export type {
  FooterNavGroup,
  FooterNavLink,
  FooterNavigation,
  HeaderNavItem,
  HeaderNavigation,
  NavLinkKind,
  NavigationLocation,
  PortalNavigation,
} from "./navigationTypes";

export {
  buildFooterNavigation,
  buildHeaderNavigation,
  buildPortalNavigation,
  fetchPortalNavigation,
} from "./managedLinks";
