export type FooterSocialPlatform = "x" | "facebook" | "instagram" | "tiktok" | "linkedin";

export interface FooterSocialLink {
  id: FooterSocialPlatform;
  label: string;
  href: string;
}

/** Default social profiles — update hrefs when marketing provides final URLs. */
export const FOOTER_SOCIAL_LINKS: FooterSocialLink[] = [
  { id: "x", label: "X", href: "https://x.com/" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/CavenderAutoG" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/" },
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/" },
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/" },
];
