import type { PageSection } from "./cmsTypes";

export type CommitmentValueId =
  | "savings"
  | "priority"
  | "community"
  | "appreciated";

export const COMMITMENT_VALUE_ORDER: CommitmentValueId[] = [
  "savings",
  "priority",
  "community",
  "appreciated",
];

export interface CommitmentValueItem {
  id: CommitmentValueId;
  title: string;
  description: string;
}

export interface CavenderCommitmentContent {
  headline: string;
  body: string;
  leftImageUrl: string | null;
  rightImageUrl: string | null;
  leftImageAlt: string;
  rightImageAlt: string;
  values: CommitmentValueItem[];
  primaryCtaHref: string | null;
  secondaryCtaHref: string | null;
}

export interface CavenderCommitmentCmsPayload {
  pageSection: PageSection | null;
}
