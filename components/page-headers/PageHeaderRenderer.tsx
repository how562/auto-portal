import { CinematicPageHeader } from "@/components/page-headers/CinematicPageHeader";
import { EditorialPageHeader } from "@/components/page-headers/EditorialPageHeader";
import { MagazinePageHeader } from "@/components/page-headers/MagazinePageHeader";
import { SplitFeaturePageHeader } from "@/components/page-headers/SplitFeaturePageHeader";
import { UtilityPageHeader } from "@/components/page-headers/UtilityPageHeader";
import type { PageHeaderConfig } from "@/lib/pageHeaderTypes";

import "@/app/page-headers.css";

export interface PageHeaderRendererProps {
  header: PageHeaderConfig | null;
  slots?: {
    form?: React.ReactNode;
    tool?: React.ReactNode;
  };
}

export function PageHeaderRenderer({ header, slots }: PageHeaderRendererProps) {
  if (!header || header.type === "none") return null;

  switch (header.type) {
    case "cinematic":
      return <CinematicPageHeader data={header.cinematic} />;
    case "editorial":
      return <EditorialPageHeader data={header.editorial} />;
    case "split":
      return <SplitFeaturePageHeader data={header.split} />;
    case "utility":
      return <UtilityPageHeader data={header.utility} slots={slots} />;
    case "magazine":
      return <MagazinePageHeader data={header.magazine} />;
    default:
      return null;
  }
}
